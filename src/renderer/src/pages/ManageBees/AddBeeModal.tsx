import { TextField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import { Form, Formik } from "formik";
import React, { useCallback, useEffect, useState } from "react";
import Yup from "@renderer/src/yup-ext";
import { Button, Flex } from "@components/.";
import { ButtonUse, ButtonType, ButtonGroup } from "@components/Buttons";
import { IBee } from "@shared/interfaces";
import { BaseModal, BaseModalProps } from "../Modals/BaseModal";

interface AddBeeModalProps extends Pick<BaseModalProps, "open" | "onClose"> {
  onBeeAdded: () => void;
}

export const AddBeeModal = ({
  open,
  onClose,
  onBeeAdded,
}: AddBeeModalProps) => {
  const [isOpen, setIsOpen] = useState(open);

  /**
   * Create a new bee
   */
  const createBee = useCallback((bee: Pick<IBee, "ipAddress" | "name">) => {
    window.kweenb.methods.createBee(bee);
  }, []);

  useEffect(() => setIsOpen(open), [open]);

  return (
    <BaseModal open={isOpen} onClose={onClose}>
      <Formik
        initialValues={{
          name: "",
          ipAddress: "",
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required("A name is required"),
          ipAddress: Yup.string()
            .required("An IP Address is required")
            .isValidIpAddress("The IP Address is invalid"),
        })}
        onSubmit={async (values, { setSubmitting }) => {
          setSubmitting(true);
          await createBee(values);
          setSubmitting(false);
          onBeeAdded();
        }}
      >
        {({ isSubmitting }) => (
          <Form>
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
