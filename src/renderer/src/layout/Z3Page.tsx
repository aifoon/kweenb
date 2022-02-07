import styled from "styled-components";
import { PageHeaderProps } from "@components/PageHeader";
import { Z3Content } from "./Z3Content";

interface Z3PageProps {
  pageHeader?: React.ReactElement<PageHeaderProps>;
  children?: React.ReactNode;
}

export const Z3PageWrapper = styled.main`
  padding: var(--contentPaddingTop) var(--contentPaddingLeft)
    var(--contentPaddingBottom)
    calc(var(--sidebarWidth) + var(--contentPaddingLeft));
  width: 100%;
`;

export const Z3Page = ({ pageHeader, children }: Z3PageProps) => (
  <Z3PageWrapper>
    {pageHeader && pageHeader}
    <Z3Content>{children}</Z3Content>
  </Z3PageWrapper>
);
