import React from "react";
import { useField, FieldHookConfig, useFormikContext } from "formik";
import { Switch } from "@mui/material";
import styled from "styled-components";
import {
  InputField,
  InputFieldProps,
  InputFieldSize,
  InputFieldOrientation,
} from "./InputField";
import { ErrorMessage } from "./ErrorMessage";

const CustomSwitch = styled(({ ...switchProps }) => (
  <Switch {...switchProps} />
))`
  & .MuiSwitch-track {
    background-color: var(--primary-400);
  }

  & .Mui-checked + .MuiSwitch-track {
    background-color: var(
      --primary-400
    ) !important; // Hacky, but material UI has too much control
  }

  & .MuiSwitch-thumb {
    background-color: var(--red-status);
  }

  & .Mui-checked .MuiSwitch-thumb {
    background-color: var(--green-status);
  }
`;

export const SwitchField = (
  props: FieldHookConfig<string> & InputFieldProps
) => {
  const {
    size = InputFieldSize.Medium,
    label,
    name,
    labelWidth = "",
    width = "100%",
    orientation = InputFieldOrientation.Vertical,
    onValidatedChange,
  } = props;

  const [field, meta] = useField(props);
  const { setFieldValue } = useFormikContext();

  const handleChange = (evt: any) => {
    setFieldValue(name, evt.target.checked);
  };

  const configSwitch = {
    ...field,
    onChange: handleChange,
  };

  return (
    <InputField
      size={size}
      labelWidth={labelWidth}
      width={width}
      orientation={orientation}
    >
      <label htmlFor={name}>{label}</label>
      <CustomSwitch
        {...configSwitch}
        checked={field.value}
        size={size === InputFieldSize.Small ? "small" : "medium"}
        onChange={(e: any) => {
          e.target.value = e.target.checked;
          if (onValidatedChange && !meta.error) onValidatedChange(e);
          field.onChange(e);
        }}
      />
      {meta.touched && meta.error ? (
        <ErrorMessage size={size}>{meta.error}</ErrorMessage>
      ) : null}
    </InputField>
  );
};
