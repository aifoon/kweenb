import styled from "styled-components";
import { SvgIconProps } from "@mui/material";

export interface SidebarButtonProps {
  icon?: React.ReactElement<SvgIconProps>;
  text?: string;
  active?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export const SidebarButtonWrapper = styled.button<SidebarButtonProps>`
  display: flex;
  align-items: center;
  position: relative;
  width: 100%;
  border-radius: 0;
  font-weight: normal;
  text-transform: none;
  text-align: left;
  padding-left: 15px;
  padding-right: 15px;
  &:hover {
    opacity: 1;
  }

  ${({ active }) => {
    if (active) {
      return `
        background-color: var(--primary-300);
        color: var(--white);
        cursor: default;
      `;
    }
    return `
        background-color: var(--primary-400);
        color: var(--primary-100);
      `;
  }}

  svg {
    margin-right: 15px;
  }

  p {
    margin: 0;
  }
`;

export const SidebarButton = ({
  icon,
  text,
  active = false,
  onClick,
}: SidebarButtonProps) => (
  <SidebarButtonWrapper onClick={onClick} active={active}>
    {icon && icon}
    <p>{text}</p>
  </SidebarButtonWrapper>
);
