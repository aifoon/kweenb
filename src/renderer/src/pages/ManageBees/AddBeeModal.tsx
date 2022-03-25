import { TextField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import { Form, Formik } from "formik";
import React, { useEffect, useState } from "react";
import Yup from "@renderer/src/yup-ext";
import { Button, Flex } from "@components/.";
import { ButtonUse, ButtonType, ButtonGroup } from "@components/Buttons";
import { IBeeInput } from "@shared/interfaces";
import { BaseModal, BaseModalProps } from "../Modals/BaseModal";

interface AddBeeModalProps extends Pick<BaseModalProps, "open" | "onClose"> {
  onBeeSubmitted: (bee: IBeeInput) => void;
}

export const AddBeeModal = ({
  open,
  onClose,
  onBeeSubmitted,
}: AddBeeModalProps) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => setIsOpen(open), [open]);

  return (
    <BaseModal open={isOpen} onClose={onClose}>
      <Formik
        initialValues={{
          id: 1,
          name: "",
          ipAddress: "",
        }}
        validationSchema={Yup.object().shape({
          id: Yup.number()
            .min(1, "The minimun amount of bee number is 1")
            .max(30, "The maximum amount of channels is 30")
            .required("The number of a bee is required"),
          name: Yup.string().required("A name is required"),
          ipAddress: Yup.string()
            .required("An IP Address is required")
            .isValidIpAddress("The IP Address is invalid"),
        })}
        onSubmit={async (values) => {
          onBeeSubmitted(values);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <TextField
              orientation={InputFieldOrientation.Vertical}
              size={InputFieldSize.Medium}
              label="Number"
              type="number"
              labelWidth="150px"
              name="id"
              placeholder="e.g. 1"
            />
            <TextField
              orientation={InputFieldOrientation.Vertical}
              size={InputFieldSize.Medium}
              label="IP Address"
              type="text"
              labelWidth="150px"
              name="ipAddress"
              placeholder="e.g. 192.168.0.2"
            />
            <TextField
              orientation={InputFieldOrientation.Vertical}
              size={InputFieldSize.Medium}
              label="Name"
              type="text"
              labelWidth="150px"
              placeholder="bee#"
              name="name"
            />
            <Flex justifyContent="flex-end">
              <ButtonGroup>
                <Button
                  type="button"
                  onClick={onClose}
                  buttonType={ButtonType.TertiaryWhite}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  buttonUse={ButtonUse.Dark}
                >
                  Save
                </Button>
              </ButtonGroup>
            </Flex>
          </Form>
        )}
      </Formik>
    </BaseModal>
  );
};
