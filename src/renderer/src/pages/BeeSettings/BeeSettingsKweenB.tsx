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

interface BeeSettingsKweenBProps {
  channels: number;
}

export const BeeSettingsKweenB = ({ channels }: BeeSettingsKweenBProps) => {
  const { updateSetting } = useKweenB();
  const handleOnValidatedBlurAndChange = (e: any) => {
    updateSetting({
      key: `kweenb${Utils.capitalize(e.target.name)}`,
      value: e.target.value,
    });
  };
  return (
    <Card title="KweenB (source)">
      <Formik
        initialValues={{
          channels,
        }}
        validationSchema={Yup.object().shape({
          channels: Yup.number()
            .min(1, "The minimun amount of channels is 1")
            .max(99, "The maximum amount of channels is 99")
            .required("The amount of channels is required"),
        })}
        onSubmit={() => {}}
      >
        {() => (
          <Form>
            <TextField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="Channels"
              type="number"
              labelWidth="150px"
              min={1}
              max={99}
              name="channels"
              placeholder="e.g. 2"
            />
          </Form>
        )}
      </Formik>
    </Card>
  );
};
