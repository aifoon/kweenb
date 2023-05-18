import { TextField } from "@components/Forms";
import { Formik, Form } from "formik";
import Yup from "@renderer/src/yup-ext";
import React from "react";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import { Button, ButtonSize } from "@components/Buttons";
import { Card } from "@components/Cards";
import { usePositioningStore } from "@renderer/src/hooks";

export const PositioningMqttBrokerConnect = () => {
  const pozyBrokerConnect = usePositioningStore(
    (state) => state.pozyxBrokerConnect
  );
  return (
    <Formik
      initialValues={{
        pozyxMqttBroker: "mqtt://127.0.0.1:1883",
      }}
      validationSchema={Yup.object().shape({
        pozyxMqttBroker: Yup.string()
          .required("A Pozyx MQTT broker is required!")
          .matches(
            /^mqtt:\/\/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+:[0-9]+/i,
            "The MQTT url is invalid (e.g. mqtt://127.0.0.1:1883)"
          ),
      })}
      onSubmit={async (values) => {
        const connected =
          await window.kweenb.methods.positioning.connectPozyxMqttBroker(
            values.pozyxMqttBroker
          );
        if (connected) pozyBrokerConnect();
      }}
    >
      {() => (
        <Form>
          <Card
            footerButtons={[
              <Button
                key="submitButtonPozyxMqttBroker"
                type="submit"
                buttonSize={ButtonSize.Small}
              >
                Connect
              </Button>,
            ]}
          >
            <TextField
              orientation={InputFieldOrientation.Vertical}
              size={InputFieldSize.Small}
              label="Pozyx MQTT broker"
              type="text"
              labelWidth="250px"
              name="pozyxMqttBroker"
              placeholder="e.g. mqtt://127.0.0.1:1883"
            />
          </Card>
        </Form>
      )}
    </Formik>
  );
};
