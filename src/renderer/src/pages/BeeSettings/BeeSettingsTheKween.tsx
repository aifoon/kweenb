import { Card } from "@components/Cards";
import React from "react";
import { Formik, Form } from "formik";
import { TextField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { useKweenB } from "@renderer/src/hooks";
import { Utils } from "@renderer/src/lib/utils";

interface BeeSettingsTheKweenBProps {
  ipAddress: string;
}

export const BeeSettingsTheKween = ({
  ipAddress,
}: BeeSettingsTheKweenBProps) => {
  const { updateSetting } = useKweenB();
  const handleOnValidatedBlurAndChange = (e: any) => {
    updateSetting({
      key: `thekween${Utils.capitalize(e.target.name)}`,
      value: e.target.value,
    });
  };
  return (
    <Card title="The Kween">
      <Formik
        initialValues={{
          ipAddress,
        }}
        validationSchema={Yup.object().shape({
          ipAddress: Yup.string()
            .required("The amount of channels is required")
            .isValidIpAddress("The IP Address is invalid"),
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
              placeholder="e.g. 192.168.1.1"
            />
          </Form>
        )}
      </Formik>
    </Card>
  );
};
