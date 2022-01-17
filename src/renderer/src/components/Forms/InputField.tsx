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
  label: string;
  orientation?: InputFieldOrientation;
  size?: InputFieldSize;
  labelWidth?: string;
  width?: string;
}

export const InputField = styled.div<Omit<InputFieldProps, "label">>`
  ${({ orientation, labelWidth }) => {
    if (orientation === InputFieldOrientation.Vertical) {
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
    opacity: 0.5;
  }
`;
