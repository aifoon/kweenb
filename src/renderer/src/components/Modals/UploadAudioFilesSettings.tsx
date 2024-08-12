import { TextField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { Formik, Form } from "formik";
import React, { useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import {
  Button,
  ButtonGroup,
  ButtonSize,
  ButtonType,
  ButtonUse,
} from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { ErrorMessage } from "@components/Forms/ErrorMessage";
import { IBee } from "@shared/interfaces";

interface UploadAudioFilesSettingsProps
  extends Pick<BaseModalProps, "open" | "onClose"> {}

export const UploadAudioFilesSettings = ({
  open,
  onClose,
}: UploadAudioFilesSettingsProps) => {
  const [isOpen, setIsOpen] = useState(open);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    bee: IBee | null;
    percentage: number;
  }>({ bee: null, percentage: 0 });

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  useEffect(() => {
    const removeListener = window.kweenb.events.onUploadAudioProgress(
      (event, bee, percentage) => {
        setUploadProgress({ bee, percentage: Math.round(percentage) });
      }
    );
    return () => {
      if (!open) removeListener();
    };
  }, [open]);

  return (
    <BaseModal disableBackdropClick open={isOpen} onClose={onClose}>
      {!isUploading && (
        <Formik
          initialValues={{
            name: "",
            localDirectory: "",
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .required("Name is required")
              .notOneOf(["tests"], "Name 'tests' is not allowed"),
            localDirectory: Yup.string().required("Directory is required"),
          })}
          onSubmit={async (values) => {
            // start uploading
            setIsUploading(true);

            // start upload
            await window.kweenb.methods.uploadAudioFiles(
              values.name,
              values.localDirectory
            );

            // close the modal
            setIsUploading(false);
            setUploadProgress({ bee: null, percentage: 0 });
            onClose();
          }}
        >
          {(e) => (
            <Form>
              <TextField
                orientation={InputFieldOrientation.Vertical}
                size={InputFieldSize.Small}
                label="Name"
                type="text"
                labelWidth="250px"
                name="name"
                placeholder=""
              />
              <Box>
                <Box
                  display={"grid"}
                  alignItems={"center"}
                  gridTemplateColumns={"1fr 100px"}
                  gap={1}
                >
                  <Typography variant="small">
                    {e.values.localDirectory || "No directory selected"}
                  </Typography>
                  <Button
                    type="button"
                    buttonSize={ButtonSize.Small}
                    buttonType={ButtonType.Primary}
                    buttonUse={ButtonUse.Dark}
                    onClick={() =>
                      window.kweenb.methods
                        .openDialog("showOpenDialogSync", {
                          title: "Select audio files",
                          buttonLabel: "Select Folder",
                          properties: ["openDirectory"],
                        })
                        .then((res) => {
                          e.setFieldValue("localDirectory", res[0]);
                        })
                    }
                  >
                    Select
                  </Button>
                </Box>
                {e.errors.localDirectory && e.touched.localDirectory && (
                  <ErrorMessage size={InputFieldSize.Small}>
                    {e.errors.localDirectory}
                  </ErrorMessage>
                )}
              </Box>
              <ConfirmModalFooter>
                <Box justifyContent="flex-end">
                  <ButtonGroup>
                    <Button
                      type="button"
                      onClick={onClose}
                      buttonType={ButtonType.TertiaryWhite}
                      buttonSize={ButtonSize.Small}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => e.submitForm()}
                      buttonUse={ButtonUse.Normal}
                      buttonSize={ButtonSize.Small}
                      buttonType={ButtonType.Primary}
                    >
                      Start Upload
                    </Button>
                  </ButtonGroup>
                </Box>
              </ConfirmModalFooter>
            </Form>
          )}
        </Formik>
      )}
      {isUploading && (
        <Box display={"flex"} flexDirection={"column"} gap={1}>
          {uploadProgress.bee && (
            <Typography variant="small">
              Uploading files to {uploadProgress.bee?.name || "unknown"}...
            </Typography>
          )}
          {!uploadProgress.bee && (
            <Typography variant="small">Starting upload...</Typography>
          )}
          <LinearProgress
            variant="determinate"
            value={uploadProgress.percentage}
          />
        </Box>
      )}
    </BaseModal>
  );
};
