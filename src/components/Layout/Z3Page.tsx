import styled from "styled-components";
import { PageHeaderProps } from "../PageHeader";
import { Z3Content } from "./Z3Content";

export interface Z3PageProps {
  sidebar?: boolean;
  pageHeader?: React.ReactElement<PageHeaderProps>;
  children?: React.ReactNode;
}

export const Z3PageWrapper = styled.main<{ sidebar?: boolean }>`
  ${(props) =>
    props.sidebar
      ? `padding: var(--contentPaddingTop) var(--contentPaddingLeft)
    var(--contentPaddingBottom)
    calc(var(--sidebarWidth) + var(--contentPaddingLeft));`
      : `padding: var(--contentPaddingTop) var(--contentPaddingLeft)`};
  width: 100%;

  @media screen and (max-width: 480px) {
    ${(props) =>
      props.sidebar
        ? `padding: var(--contentPaddingMobileTop) var(--contentPaddingMobileLeft)
    var(--contentPaddingMobileBottom)
    calc(var(--sidebarWidth) + var(--contentPaddingMobileLeft));`
        : `padding: var(--contentPaddingMobileTop) var(--contentPaddingMobileLeft)`};
  }
`;

export const Z3Page = ({
  sidebar = true,
  pageHeader,
  children,
}: Z3PageProps) => (
  <Z3PageWrapper sidebar={sidebar}>
    {pageHeader && pageHeader}
    <Z3Content>{children}</Z3Content>
  </Z3PageWrapper>
);
