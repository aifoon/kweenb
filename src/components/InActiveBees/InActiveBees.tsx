import styled from "styled-components";

export const InActiveBees = styled.div`
  position: sticky;
  top: calc(var(--navigationHeight) + var(--contentPaddingLeft));
  postion: relative;
  background-color: var(--primary-400);
  padding: 1rem;
  div + div {
    margin-top: var(--smallText);
  }
`;
