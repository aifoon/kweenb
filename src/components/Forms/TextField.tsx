import React from "react";
import { useField, FieldHookConfig } from "formik";
import {
  InputField,
  InputFieldProps,
  InputFieldSize,
  InputFieldOrientation,
} from "./InputField";
import { ErrorMessage } from "./ErrorMessage";

export const TextField = (props: FieldHookConfig<string> & InputFieldProps) => {
  const [field, meta] = useField(props);
  const {
    placeholder,
    type,
    name,
    size = InputFieldSize.Medium,
    label,
    labelWidth = "",
    width = "100%",
    orientation = InputFieldOrientation.Vertical,
    onValidatedBlur,
    disabled = false,
  } = props;
  return (
    <InputField
      size={size}
      labelWidth={labelWidth}
      width={width}
      orientation={orientation}
    >
      <label htmlFor={name}>{label}</label>
      <input
        className={meta.touched && meta.error ? "invalid" : ""}
        {...field}
        onBlur={(e) => {
          if (onValidatedBlur && !meta.error) onValidatedBlur(e);
          field.onBlur(e);
        }}
        disabled={disabled}
        placeholder={placeholder}
        type={type}
        multiple
      />
      {meta.touched && meta.error ? (
        <ErrorMessage size={size}>{meta.error}</ErrorMessage>
      ) : null}
    </InputField>
  );
};
