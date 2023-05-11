import styled from "styled-components";
import { Z3PageProps } from "./Z3Page";

const Z3CenteredContent = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h2 {
    margin-top: 0;
  }
  p {
    margin-bottom: 2rem;
    color: var(--secondary-100);
  }
`;

export const Z3CenteredPageWrapper = styled.main`
  height: var(--contentHeight);
  padding: 0 0 0 calc(var(--sidebarWidth));
  width: 100%;
`;

export const Z3PageCentered = ({
  children,
}: Omit<Z3PageProps, "pageHeader">) => (
  <Z3CenteredPageWrapper>
    <Z3CenteredContent>{children}</Z3CenteredContent>
  </Z3CenteredPageWrapper>
);
