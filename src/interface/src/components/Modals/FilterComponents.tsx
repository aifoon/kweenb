import { Box } from "@mui/material";
import styled from "styled-components";
import { modalWidth, modalHeight } from "./ModalConfig";

const textFieldHeight = 40;
const textFieldMargin = "10px";
const headerHeight = "40px";

export const FilterTextfieldContainer = styled(Box)<{
  $hasSidebutton: boolean;
}>`
  grid-template-columns: ${({ $hasSidebutton: $hasBee }) =>
    $hasBee ? "1fr 150px" : "1fr"};
  height: ${textFieldHeight}px;
  margin-bottom: ${textFieldMargin};
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    height: ${({ $hasSidebutton: $hasBee }) =>
      $hasBee ? `${textFieldHeight * 2}px` : `${textFieldHeight}px`};
  }
`;

export const FilteredContentContainer = styled(Box)`
  &::-webkit-scrollbar {
    display: none;
  }
  height: calc(
    ${modalHeight} - ${headerHeight} - ${textFieldHeight}px - ${textFieldMargin} -
      (2 * var(--modalPadding))
  );
  @media (max-width: 480px) {
    height: calc(
      ${modalHeight} - ${headerHeight} - ${2 * textFieldHeight}px -
        ${textFieldMargin} - (2 * var(--modalPadding))
    );
  }
`;
