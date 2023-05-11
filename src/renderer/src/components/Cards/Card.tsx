import { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { ButtonGroup } from "../Buttons";
import { ButtonProps } from "../Buttons/Button";

interface CardProps {
  title?: string;
  footerButtons?: ReactElement<ButtonProps>[];
  hideFooterButtons?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const CardWrapper = styled.div`
  background-color: var(--primary-200);
  border-radius: var(--radiusLarge);
`;

const CardInnerWrapper = styled.div`
  padding: var(--cardContentPadding);
  div:not(.MuiGrid-root):last-child {
    margin: 0;
  }
`;

const CardHeaderWrapper = styled(CardInnerWrapper)`
  background-color: var(--primary-400);
  border-bottom: 1px solid var(--primary-100);
  border-radius: var(--radiusLarge) var(--radiusLarge) 0 0;
  font-size: var(--h5);
  padding: var(--cardHeaderPaddingTop) var(--cardHeaderPaddingRight)
    var(--cardHeaderPaddingBottom) var(--cardHeaderPaddingLeft);
`;

const CardFooterWrapper = styled(CardInnerWrapper)`
  display: flex;
  background-color: var(--primary-400);
  border-radius: 0 0 var(--radiusLarge) var(--radiusLarge);
  justify-content: flex-end;
  padding: var(--cardHeaderPaddingTop) var(--cardHeaderPaddingRight)
    var(--cardHeaderPaddingBottom) var(--cardHeaderPaddingLeft);
`;

export const Card = ({
  title,
  footerButtons,
  children,
  className = "",
  hideFooterButtons = false,
}: CardProps) => {
  const [currentHideFooterButtons, setCurrentHideFooterButtons] =
    useState(hideFooterButtons);

  useEffect(() => {
    setCurrentHideFooterButtons(hideFooterButtons);
  }, [hideFooterButtons]);

  return (
    <CardWrapper className={`card ${className}`}>
      {title && <CardHeaderWrapper>{title}</CardHeaderWrapper>}
      <CardInnerWrapper>{children}</CardInnerWrapper>
      {footerButtons && !currentHideFooterButtons && (
        <CardFooterWrapper>
          <ButtonGroup>{footerButtons.map((button) => button)}</ButtonGroup>
        </CardFooterWrapper>
      )}
    </CardWrapper>
  );
};
