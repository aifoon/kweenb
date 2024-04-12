import { Card } from "@components/Cards";
import React, { useEffect, useState } from "react";
import { Formik, Form } from "formik";
import { TextField, SwitchField } from "@renderer/src/components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { IBeeConfig } from "@shared/interfaces";

interface BeeConfigConfigProps {
  beeConfig: IBeeConfig;
  onUpdate: (config: Partial<IBeeConfig>) => void;
}

export const BeeConfigConfig = ({
  beeConfig,
  onUpdate,
}: BeeConfigConfigProps) => {
  // set internal state to manage the form
  const [currentBeeConfig, setCurrentBeeConfig] =
    useState<IBeeConfig>(beeConfig);

  // handle the change of the form fields
  const handleOnValidatedBlurAndChange = (e: any) => {
    onUpdate({ [e.target.name]: e.target.value });
  };

  // update the internal state when the beeConfig changes
  useEffect(() => {
    setCurrentBeeConfig(beeConfig);
  }, [beeConfig]);

  // render the form
  return (
    <Card title="Config">
      <Formik
        enableReinitialize={true}
        initialValues={{ ...currentBeeConfig }}
        validationSchema={Yup.object().shape({
          jacktripVersion: Yup.string().required(
            "A Jacktrip Version is required!"
          ),
          useMqtt: Yup.boolean().required(),
          mqttBroker: Yup.string().required("An MQTT broker is required"),
          mqttChannel: Yup.string().required("An MQTT channel is required"),
          device: Yup.string(),
        })}
        onSubmit={() => {}}
      >
        {() => (
          <Form>
            <SwitchField
              onValidatedChange={handleOnValidatedBlurAndChange}
              name="useMqtt"
              label="Use MQTT"
              labelWidth="150px"
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
            />
            <TextField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="MQTT broker"
              type="text"
              labelWidth="150px"
              name="mqttBroker"
              placeholder="e.g. 192.168.0.2"
            />
            <TextField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="MQTT channel"
              type="text"
              labelWidth="150px"
              name="mqttChannel"
              placeholder="e.g. bee1"
            />
            <TextField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="Device"
              type="text"
              labelWidth="150px"
              name="device"
              placeholder="e.g. hw:Device"
            />
          </Form>
        )}
      </Formik>
    </Card>
  );
};
