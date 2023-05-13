import { FormControl, MenuItem, Select, SelectProps } from "@mui/material";
import React from "react";
import { useField, FieldHookConfig, useFormikContext } from "formik";
import styled from "styled-components";
import {
  InputField,
  InputFieldSize,
  InputFieldProps,
  InputFieldOrientation,
} from "./InputField";
import { MuiBootstrapInput } from "./MuiBootstrapInput";
import { ErrorMessage } from "./ErrorMessage";

export interface SelectItem {
  label: string;
  value: string | number;
}

export interface SelectFieldProps {
  singleLine?: boolean;
  selectItems?: SelectItem[];
}

export interface CustomSelectProps {
  size: InputFieldSize;
}

const CustomSelect = styled(({ size, ...selectProps }) => (
  <Select {...selectProps} />
))<SelectProps | CustomSelectProps>`
  & .MuiSelect-select {
    background-color: var(--primary-400);
    border: 1px solid var(--primary-100);
    border-radius: var(--radiusMedium);
    font-size: ${({ size }) =>
      size === InputFieldSize.Small ? "var(--smallText)" : "1rem"};
    padding: ${({ size }) =>
      size === InputFieldSize.Small ? "6px 7px 6px 10px" : "12px"};
  }
`;

export const SelectField = (
  props: FieldHookConfig<string> & InputFieldProps & SelectFieldProps
) => {
  const {
    name,
    size = InputFieldSize.Medium,
    label,
    singleLine = false,
    labelWidth = "",
    selectItems = [],
    width = "100%",
    orientation = InputFieldOrientation.Vertical,
    onValidatedBlur,
  } = props;

  const [field, meta] = useField(props);
  const { setFieldValue } = useFormikContext();

  const handleChange = (evt: any) => {
    setFieldValue(name, evt.target.value);
  };

  const configSelect = {
    ...field,
    onChange: handleChange,
  };

  return (
    <InputField
      singleLine={singleLine}
      size={size}
      labelWidth={labelWidth}
      width={width}
      orientation={orientation}
    >
      {label && <label htmlFor={name}>{label}</label>}
      <FormControl fullWidth>
        <CustomSelect
          className={meta.touched && meta.error ? "invalid" : ""}
          {...configSelect}
          input={<MuiBootstrapInput />}
          size={size}
          MenuProps={{
            PaperProps: {
              sx: {
                bgcolor: "var(--primary-300)",
                padding: 0,
                color: "var(--textColor)",
                "& .MuiMenuItem-root.Mui-selected": {
                  bgcolor: "var(--primary-400)",
                },
                "& .MuiMenuItem-root:hover": {
                  bgcolor: "var(--primary-200)",
                },
              },
            },
          }}
          onBlur={(e: any) => {
            if (onValidatedBlur && !meta.error) onValidatedBlur(e);
            field.onBlur(e);
          }}
        >
          {selectItems &&
            selectItems.map(({ label: itemLabel, value: itemValue }) => (
              <MenuItem key={itemValue} value={itemValue}>
                {itemLabel}
              </MenuItem>
            ))}
        </CustomSelect>
      </FormControl>
      {meta.touched && meta.error ? (
        <ErrorMessage size={size}>{meta.error}</ErrorMessage>
      ) : null}
    </InputField>
  );
};
