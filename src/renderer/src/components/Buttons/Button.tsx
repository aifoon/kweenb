import React from "react";
import styled from "styled-components";

/**
 * Types & Interfaces
 */

export enum ButtonUse {
  Normal,
  Accent,
  Danger,
  Dark,
  Grey,
}

export enum ButtonType {
  Primary,
  Secondary,
  SecondaryWhite,
  Tertiary,
  TertiaryWhite,
}

export enum ButtonSize {
  Small,
  Medium,
}

export interface ButtonProps {
  key?: string;
  buttonUse?: ButtonUse;
  buttonType?: ButtonType;
  buttonSize?: ButtonSize;
  textAlign?: "left" | "center" | "right";
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

/**
 * Helpers
 */

const getColorByButtonUse = (buttonUse: ButtonUse) => {
  switch (buttonUse) {
    case ButtonUse.Normal:
      return "var(--secondary-500)";
    case ButtonUse.Accent:
      return "var(--accent-500)";
    case ButtonUse.Danger:
      return "var(--red-status)";
    case ButtonUse.Dark:
      return "var(--primary-100)";
    case ButtonUse.Grey:
      return "var(--primary-200)";
    default:
      return "var(--secondary-500)";
  }
};

/**
 * Styled Component
 */

export const Button = styled.button.attrs(({ key }) => ({
  key,
}))<ButtonProps>`
  display: inline-block;
  background-color: ${({ buttonUse = ButtonUse.Normal, buttonType }) => {
    if (
      buttonType === ButtonType.Secondary ||
      buttonType === ButtonType.SecondaryWhite ||
      buttonType === ButtonType.Tertiary ||
      buttonType === ButtonType.TertiaryWhite
    ) {
      return "transparent";
    }
    return getColorByButtonUse(buttonUse);
  }};
  ${({ buttonType, buttonUse = ButtonUse.Normal }) => {
    const colorByButtonUse = getColorByButtonUse(buttonUse);
    if (buttonType === ButtonType.Primary) {
      return `border: 1px solid ${colorByButtonUse};`;
    }
    if (buttonType === ButtonType.Secondary) {
      return `border: 1px solid ${colorByButtonUse};
              color: ${colorByButtonUse};`;
    }
    if (buttonType === ButtonType.Tertiary) {
      return `color: ${colorByButtonUse};`;
    }
    if (buttonType === ButtonType.TertiaryWhite) {
      return `color: var(--white);`;
    }
    if (buttonType === ButtonType.SecondaryWhite) {
      return `border: 1px solid var(--white);
              color: var(--white);`;
    }
    return "";
  }}
  ${({ buttonSize }) => {
    switch (buttonSize) {
      case ButtonSize.Small:
        return `font-size: var(--smallText);
                padding: var(--smallButtonPadding);`;
      default:
        return "font-size: 1rem";
    }
  }}
`;
