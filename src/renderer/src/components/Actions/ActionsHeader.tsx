import styled from "styled-components";

const ActionsHeaderContainer = styled.div`
  display: grid;
  grid-template-columns: 40% 1fr 150px;
  column-gap: 0;
  font-weight: bold;
  background-color: var(--primary-100);
  border-bottom: 1px solid var(--primary-100);
  border-radius: 10px 10px 0 0;
  & div {
    padding: 10px;
  }
`;

export const ActionsHeader = () => (
  <ActionsHeaderContainer>
    <div>Description</div>
    <div>Output</div>
    <div />
  </ActionsHeaderContainer>
);
