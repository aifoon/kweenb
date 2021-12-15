/**
 * A row to show the design system
 */

import styled from "styled-components";

export const Row = styled.div`
  display: flex;
  margin-bottom: 30px;
  & > *:not(:last-child) {
    margin-right: 30px;
  }
`;
