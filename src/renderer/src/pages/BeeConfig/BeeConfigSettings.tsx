import { Card } from "@components/Cards";
import React from "react";
import { Formik, Form } from "formik";
import {
  SelectField,
  TextField,
  SwitchField,
} from "@renderer/src/components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { IBeeConfig, IBee } from "@shared/interfaces";

interface BeeConfigSettingsProps {
  ipAddress: string;
  name: string;
  onUpdate: (config: Partial<Pick<IBee, "ipAddress" | "name">>) => void;
}

export const BeeConfigSettings = ({
  ipAddress,
  name,
  onUpdate,
}: BeeConfigSettingsProps) => {
  const handleOnValidatedBlurAndChange = (e: any) => {
    onUpdate({ [e.target.name]: e.target.value });
  };
  return (
    <Card title="Settings">
      <Formik
        initialValues={{ ipAddress, name }}
        validationSchema={Yup.object().shape({
          ipAddress: Yup.string()
            .required("An IP Address is required")
            .isValidIpAddress("The IP Address is invalid"),
          name: Yup.string().required("A name is required")
        })}
        onSubmit={() => {}}
      >
        {() => (
          <Form>
            <TextField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="IP Address"
              type="text"
              labelWidth="150px"
              name="ipAddress"
              placeholder="e.g. 192.168.0.2"
            />
            <TextField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="Name"
              type="text"
              labelWidth="150px"
              name="name"
            />
          </Form>
        )}
      </Formik>
    </Card>
  );
};
