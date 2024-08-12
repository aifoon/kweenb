import { Card } from "@components/Cards";
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

interface BeeSettingsTheKweenBProps {
  ipAddress: string;
}

export const SettingsTheKween = ({ ipAddress }: BeeSettingsTheKweenBProps) => {
  const { updateSetting } = useSetting();
  const handleOnValidatedBlurAndChange = (e: any) => {
    updateSetting({
      key: `thekween${Utils.capitalize(e.target.name)}`,
      value: e.target.value,
    });
  };
  return (
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
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Card title="Network">
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
              </Card>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
