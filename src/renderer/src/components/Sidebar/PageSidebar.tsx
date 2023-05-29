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
`;

export const PageSidebar = ({ buttons }: PageSidebarProps) => (
  <PageSideBarWrapper>
    {buttons && <>{buttons.map((button) => button)}</>}
  </PageSideBarWrapper>
);
