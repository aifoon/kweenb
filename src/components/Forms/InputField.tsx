import styled from "styled-components";

export enum InputFieldOrientation {
  Vertical,
  Horizontal,
}

export enum InputFieldSize {
  Small,
  Medium,
}

export interface InputFieldProps {
  singleLine?: boolean;
  label: string;
  orientation?: InputFieldOrientation;
  size?: InputFieldSize;
  labelWidth?: string;
  width?: string;
  disabled?: boolean;
  onValidatedBlur?: (e: any) => void;
  onValidatedChange?: (e: any) => void;
}

export const InputField = styled.div<Omit<InputFieldProps, "label">>`
  ${({ orientation, labelWidth }) => {
    if (orientation === InputFieldOrientation.Vertical) {
      return `
        display: block;
        label {
          margin: 0;
          margin-bottom: 2px;
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
  ${({ singleLine }) => (!singleLine ? "margin-bottom: 20px;" : "")}};
  ${({ size }) => {
    if (size === InputFieldSize.Small) {
      return `
        input {
          font-size: var(--smallText);
        }
        label {
          font-size: var(--inputFieldLabelTextSmall);
        }
      `;
    }
    return `
      input {
        padding: 15px;
      }
      & .MuiSelect-select {
        padding: 15px;
      }
    `;
  }}
  input.invalid,
  .invalid .MuiInputBase-input {
    border: 1px solid var(--red-status);
  }
`;
