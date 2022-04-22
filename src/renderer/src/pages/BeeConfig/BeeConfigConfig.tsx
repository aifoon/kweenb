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

interface BeeConfigConfigProps {
  beeConfig: IBeeConfig;
  onUpdate: (config: Partial<IBeeConfig>) => void;
}

export const BeeConfigConfig = ({
  beeConfig,
  onUpdate,
}: BeeConfigConfigProps) => {
  const handleOnValidatedBlurAndChange = (e: any) => {
    onUpdate({ [e.target.name]: e.target.value });
  };
  return (
    <Card title="Config">
      <Formik
        initialValues={{ ...beeConfig }}
        validationSchema={Yup.object().shape({
          jacktripVersion: Yup.string().required(
            "A Jacktrip Version is required!"
          ),
          useMqtt: Yup.boolean().required(),
        })}
        onSubmit={() => {}}
      >
        {() => (
          <Form>
            <SelectField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="Jacktrip Version"
              labelWidth="150px"
              selectItems={[
                { label: "1.4.1", value: "1.4.1" },
                { label: "1.5.3", value: "1.5.3" },
              ]}
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
