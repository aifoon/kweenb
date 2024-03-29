import styled from "styled-components";

export const CardVerticalStack = styled.div`
  display: flex;
  flex-direction: column;

  & > .card {
    margin-bottom: var(--cardMarginBottom);
  }

  & > .card:last-child {
    margin-bottom: 0;
  }
`;
