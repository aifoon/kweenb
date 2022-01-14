import styled from "styled-components";

export const ButtonGroup = styled.div`
  display: flex;
  button + button {
    margin-left: 15px;
  }
`;
