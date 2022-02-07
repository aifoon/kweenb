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
import * as Yup from "yup";

export const BeeConfigConfig = () => (
  <Card title="Config">
    <Formik
      initialValues={{
        ipaddress: "",
        name: "",
        jacktrip_version: "",
        use_mqtt: true,
      }}
      validationSchema={Yup.object().shape({
        ipaddress: Yup.string().required("The username is required!"),
        name: Yup.string().required("The name is required!"),
        jacktrip_version: Yup.string().required(
          "A Jacktrip Version is required!"
        ),
      })}
      onSubmit={(values, actions) => {
        console.log({ values, actions });
      }}
    >
      {() => (
        <Form>
          <TextField
            orientation={InputFieldOrientation.Horizontal}
            size={InputFieldSize.Small}
            label="IP Address"
            type="text"
            labelWidth="150px"
            name="ipaddress"
            placeholder="e.g. 192.168.0.2"
          />
          <TextField
            orientation={InputFieldOrientation.Horizontal}
            size={InputFieldSize.Small}
            label="Name"
            type="text"
            labelWidth="150px"
            name="name"
          />
          <SelectField
            orientation={InputFieldOrientation.Horizontal}
            size={InputFieldSize.Small}
            label="Jacktrip Version"
            labelWidth="150px"
            selectItems={[
              { label: "None", value: "" },
              { label: "1.4.1", value: "1.4.1" },
            ]}
            name="jacktrip_version"
          />
          <SwitchField
            name="use_mqtt"
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
