import { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { ButtonGroup } from "../Buttons";
import { ButtonProps } from "../Buttons/Button";
import { Typography } from "@mui/material";

interface CardProps {
  title?: string;
  headerSubtitle?: string;
  footerButtons?: ReactElement<ButtonProps>[];
  hideFooterButtons?: boolean;
  children?: React.ReactNode;
  className?: string;
  introduction?: string;
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
  display: flex;
  justify-content: space-between;
  background-color: var(--primary-400);
  border-bottom: 1px solid var(--primary-100);
  border-radius: var(--radiusLarge) var(--radiusLarge) 0 0;
  font-size: var(--h5);
  align-items: center;
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

const CardIntroduction = styled.div`
  color: var(--primary-25);
  margin-bottom: 2rem;
  font-size: 0.9rem;
`;

export const Card = ({
  title,
  headerSubtitle = "",
  footerButtons,
  children,
  className = "",
  hideFooterButtons = false,
  introduction = "",
}: CardProps) => {
  const [currentHideFooterButtons, setCurrentHideFooterButtons] =
    useState(hideFooterButtons);

  useEffect(() => {
    setCurrentHideFooterButtons(hideFooterButtons);
  }, [hideFooterButtons]);

  return (
    <CardWrapper className={`card ${className}`}>
      {title && (
        <CardHeaderWrapper>
          <div>{title}</div>
          {headerSubtitle && (
            <Typography variant="small">{headerSubtitle}</Typography>
          )}
        </CardHeaderWrapper>
      )}
      <CardInnerWrapper>
        {introduction && <CardIntroduction>{introduction}</CardIntroduction>}
        {children}
      </CardInnerWrapper>
      {footerButtons && !currentHideFooterButtons && (
        <CardFooterWrapper>
          <ButtonGroup>{footerButtons.map((button) => button)}</ButtonGroup>
        </CardFooterWrapper>
      )}
    </CardWrapper>
  );
};
