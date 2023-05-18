import React, { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "@components/Buttons/Button";

export interface PageSidebarProps {
  buttons?: ReactElement<ButtonProps>[];
}

const PageSideBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  & > button {
    margin-bottom: 1rem;
  }
  // display: grid;
  // grid-template-columns: 1fr;
  // grid-template-rows: 300px 1fr;
  // grid-gap: 15px;
  // background-color: var(--primary-300);
  // padding: 1rem;
  // border-radius: var(--radiusLarge);
`;

export const PageSidebar = ({ buttons }: PageSidebarProps) => (
  <PageSideBarWrapper>
    {buttons && <>{buttons.map((button) => button)}</>}
  </PageSideBarWrapper>
);
