import styled from "styled-components";
import { InputFieldSize } from "./InputField";

export interface ErrorMessageProps {
  size?: InputFieldSize;
}

export const ErrorMessage = styled.div<ErrorMessageProps>`
  display: block;
  color: var(--red-status);
  grid-column-start: 2;
  ${({ size }) => {
    if (size === InputFieldSize.Small) {
      return `font-size: var(--smallText)`;
    }
    return "";
  }}
`;
