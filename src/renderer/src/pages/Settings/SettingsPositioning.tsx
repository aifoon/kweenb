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

interface PositioningSettingsProps {
  updateRate: number;
}

export const SettingsPositioning = ({
  updateRate,
}: PositioningSettingsProps) => {
  const { updateSetting } = useSetting();
  const handleOnValidatedBlurAndChange = (e: any) => {
    updateSetting({
      key: `positioning${Utils.capitalize(e.target.name)}`,
      value: e.target.value,
    });
  };
  return (
    <Formik
      initialValues={{
        updateRate,
      }}
      validationSchema={Yup.object().shape({
        updateRate: Yup.number()
          .required("The update rate is required")
          .min(50, "The update rate must be greater than 50")
          .max(1000, "The update rate must be less than 1000"),
      })}
      onSubmit={() => {}}
    >
      {() => (
        <Form>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <Card title="Pozyx">
                <TextField
                  onValidatedBlur={handleOnValidatedBlurAndChange}
                  orientation={InputFieldOrientation.Horizontal}
                  size={InputFieldSize.Small}
                  label="Update Rate"
                  type="number"
                  labelWidth="150px"
                  name="updateRate"
                  placeholder="e.g. 200"
                />
              </Card>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
