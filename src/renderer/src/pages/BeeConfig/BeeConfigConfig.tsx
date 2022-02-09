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
import { BeeConfig, BeeConfigItem } from "@renderer/src/interfaces";

interface BeeConfigConfigProps {
  beeConfig: BeeConfig;
  updateBeeConfig: (config: BeeConfigItem) => void;
}

export const BeeConfigConfig = ({
  beeConfig,
  updateBeeConfig,
}: BeeConfigConfigProps) => {
  const handleOnValidatedBlurAndChange = (e: any) => {
    updateBeeConfig({ key: e.target.name, value: e.target.value });
  };
  return (
    <Card title="Config">
      <Formik
        initialValues={beeConfig}
        validationSchema={Yup.object().shape({
          ipAddress: Yup.string()
            .required("An IP Address is required")
            .isValidIpAddress("The IP Address is invalid"),
          name: Yup.string().required("A name is required"),
          jacktripVersion: Yup.string().required(
            "A Jacktrip Version is required!"
          ),
          useMqtt: Yup.boolean().required(),
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
            <SelectField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="Jacktrip Version"
              labelWidth="150px"
              selectItems={[{ label: "1.4.1", value: "1.4.1" }]}
              name="jacktripVersion"
            />
            <SwitchField
              onValidatedChange={handleOnValidatedBlurAndChange}
              name="useMqtt"
              label="Use MQTT"
              labelWidth="150px"
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
            />
          </Form>
        )}
      </Formik>
    </Card>
  );
};
