import { Card, CardVerticalStack } from "@components/Cards";
import React from "react";
import { Formik, Form } from "formik";
import { TextField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { useSetting } from "@renderer/src/hooks";
import { Utils } from "@shared/utils";
import { Grid } from "@mui/material";

interface BeeSettingsKweenBProps {
  channels: number;
  mqttBroker: string;
}

export const SettingsKweenB = ({
  channels,
  mqttBroker,
}: BeeSettingsKweenBProps) => {
  const { updateSetting } = useSetting();
  const handleOnValidatedBlurAndChange = (e: any) => {
    updateSetting({
      key: `kweenb${Utils.capitalize(e.target.name)}`,
      value: e.target.value,
    });
  };
  return (
    <Formik
      initialValues={{
        channels,
        mqttBroker,
      }}
      validationSchema={Yup.object().shape({
        channels: Yup.number()
          .min(1, "The minimun amount of channels is 1")
          .max(99, "The maximum amount of channels is 99")
          .required("The amount of channels is required"),
        mqttBroker: Yup.string(),
      })}
      onSubmit={() => {}}
    >
      {() => (
        <Form>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <CardVerticalStack>
                <Card title="General">
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
                </Card>
                <Card title="MQTT">
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="MQTT Broker"
                    type="text"
                    labelWidth="150px"
                    min={1}
                    max={99}
                    name="mqttBroker"
                    placeholder="e.g. mqtt://localhost:1883"
                  />
                </Card>
              </CardVerticalStack>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
