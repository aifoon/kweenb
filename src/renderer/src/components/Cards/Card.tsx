import { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { ButtonGroup } from "../Buttons";
import { ButtonProps } from "../Buttons/Button";
import { Box, Typography } from "@mui/material";
import { StatusBullet } from "..";
import { StatusBulletProps, StatusBulletType } from "@components/StatusBullet";

interface CardProps {
  title?: string;
  headerSubtitle?: string;
  footerButtons?: ReactElement<ButtonProps>[];
  headerButtons?: ReactElement<ButtonProps>[];
  hideFooterButtons?: boolean;
  children?: React.ReactNode;
  className?: string;
  introduction?: string;
  variant?: "normal" | "small";
  statusBullet?: ReactElement<StatusBulletProps>;
}

type CardVariantProps = {
  variant: "normal" | "small";
};

const CardWrapper = styled.div`
  background-color: var(--primary-200);
  border-radius: var(--radiusLarge);
`;

const CardInnerWrapper = styled.div<CardVariantProps>`
  padding: ${(props) => (props.variant === "normal" ? "20px" : "15px 25px")};
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
  align-items: center;
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
  headerButtons,
  children,
  className = "",
  hideFooterButtons = false,
  introduction = "",
  variant = "normal",
  statusBullet,
}: CardProps) => {
  const [currentHideFooterButtons, setCurrentHideFooterButtons] =
    useState(hideFooterButtons);

  useEffect(() => {
    setCurrentHideFooterButtons(hideFooterButtons);
  }, [hideFooterButtons]);

  return (
    <CardWrapper className={`card ${className}`}>
      {title && (
        <CardHeaderWrapper variant={variant}>
          <Box display={"flex"} alignItems={"center"} gap={1}>
            {statusBullet && statusBullet}
            <Typography variant={variant === "normal" ? "normal" : "small"}>
              {title}
            </Typography>
          </Box>
          {headerSubtitle && (
            <Typography variant="small">{headerSubtitle}</Typography>
          )}
          {headerButtons && (
            <ButtonGroup>{headerButtons.map((button) => button)}</ButtonGroup>
          )}
        </CardHeaderWrapper>
      )}
      <CardInnerWrapper variant={variant}>
        {introduction && <CardIntroduction>{introduction}</CardIntroduction>}
        {children}
      </CardInnerWrapper>
      {footerButtons && !currentHideFooterButtons && (
        <CardFooterWrapper variant={variant}>
          <ButtonGroup>{footerButtons.map((button) => button)}</ButtonGroup>
        </CardFooterWrapper>
      )}
    </CardWrapper>
  );
};
