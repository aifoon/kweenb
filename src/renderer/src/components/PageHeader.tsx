import React, { ReactElement } from "react";
import styled from "styled-components";
import { Flex } from ".";
import { ButtonProps } from "./Button";

interface PageHeaderProps {
  title: string;
  buttons?: ReactElement<ButtonProps>[];
}

const PageHeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 40px;
  & > h3 {
    margin: 0;
  }
`;

export const PageHeader = ({ title, buttons }: PageHeaderProps) => (
  <PageHeaderWrapper>
    <h3>{title}</h3>
    {buttons && <Flex>{buttons.map((button) => button)}</Flex>}
  </PageHeaderWrapper>
);
