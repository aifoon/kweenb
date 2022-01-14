import React from "react";
import { useField, FieldHookConfig } from "formik";
import styled from "styled-components";

export enum TextFieldOrientation {
  Vertical,
  Horizontal,
}

export enum TextFieldSize {
  Small,
  Medium,
}

export interface TextFieldProps {
  label: string;
  orientation?: TextFieldOrientation;
  size?: TextFieldSize;
  labelWidth?: string;
  width?: string;
}

interface ErrorMessageProps {
  size?: TextFieldSize;
}

const ErrorMessage = styled.div<ErrorMessageProps>`
  display: block;
  color: var(--red-status);
  grid-column-start: 2;
  ${({ size }) => {
    if (size === TextFieldSize.Small) {
      return `font-size: var(--smallText)`;
    }
    return "";
  }}
`;

const TextFieldWrapper = styled.div<Omit<TextFieldProps, "label">>`
  ${({ orientation, labelWidth }) => {
    if (orientation === TextFieldOrientation.Vertical) {
      return `
        display: block;
        label {
          margin: 0;
          margin-bottom: 10px;
        }
      `;
    }
    return `
      display: grid;
      grid-template-columns: ${labelWidth || "auto"} 1fr;
      align-items: center;
      label {
        margin-right: 20px;
        width: ${labelWidth};
      }
    `;
  }}
  width:${({ width }) => width};
  margin-bottom: 20px;
  ${({ size }) => {
    if (size === TextFieldSize.Small) {
      return `
        input {
          font-size: var(--smallText);
          height: 35px;
        }
        label {
          font-size: var(--inputFieldLabelTextSmall);
        }
      `;
    }
    return "";
  }}
  input.invalid {
    border: 1px solid var(--red-status);
    opacity: 0.5;
  }
`;

export const TextField = (props: FieldHookConfig<string> & TextFieldProps) => {
  const [field, meta] = useField(props);
  const {
    placeholder,
    type,
    name,
    size = TextFieldSize.Medium,
    label,
    labelWidth = "",
    width = "100%",
    orientation = TextFieldOrientation.Vertical,
  } = props;
  return (
    <TextFieldWrapper
      size={size}
      labelWidth={labelWidth}
      width={width}
      orientation={orientation}
    >
      <label htmlFor={name}>{label}</label>
      <input
        className={meta.touched && meta.error ? "invalid" : ""}
        {...field}
        placeholder={placeholder}
        type={type}
      />
      {meta.touched && meta.error ? (
        <ErrorMessage size={size}>{meta.error}</ErrorMessage>
      ) : null}
    </TextFieldWrapper>
  );
};
