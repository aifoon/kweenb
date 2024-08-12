import React from "react";
import styled from "styled-components";

/**
 * Interfaces
 */

export interface Z3ContentProps {
  children?: React.ReactNode;
}

/**
 * Styled Components
 */

const Z3ContentWrapper = styled.div`
  height: 100%;
`;

export const Z3Content = ({ children }: Z3ContentProps) => (
  <Z3ContentWrapper>{children}</Z3ContentWrapper>
);
