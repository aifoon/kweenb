import { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { ButtonGroup } from "../Buttons";
import { ButtonProps } from "../Buttons/Button";
import { Box, Typography } from "@mui/material";
import { StatusBulletProps } from "../StatusBullet";

interface CardProps {
  title?: string;
  headerSubtitle?: string;
  footerButtons?: ReactElement<ButtonProps>[];
  headerButtons?: ReactElement<ButtonProps>[];
  hideFooterButtons?: boolean;
  children?: React.ReactNode;
  className?: string;
  introduction?: string;
  variant?: "noPadding" | "normal" | "small" | "extraSmall";
  statusBullet?: ReactElement<StatusBulletProps>;
}

type CardVariantProps = {
  variant: "noPadding" | "normal" | "small" | "extraSmall";
};

const CardWrapper = styled.div`
  background-color: var(--primary-200);
  border-radius: var(--radiusLarge);
`;

const CardInnerWrapper = styled(Box)<CardVariantProps>`
  padding: ${(props) => {
    if (props.variant === "extraSmall") return "10px";
    else if (props.variant === "small") return "10px 15px";
    else if (props.variant === "noPadding") return "0";
    return "20px";
  }}};
  div:not(.MuiGrid-root):last-child {
    margin: 0;
  }
`;

const CardHeaderWrapper = styled(CardInnerWrapper)`
  display: grid;
  justify-content: space-between;
  grid-template-columns: 1fr auto;
   padding: ${(props) => {
     if (props.variant === "extraSmall") return "10px";
     else if (props.variant === "small") return "10px 15px";
     else if (props.variant === "noPadding") return "10px";
     return "20px";
   }}};
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
      <CardHeaderWrapper variant={variant} gap={1}>
        <Box display={"flex"} justifyContent={"space-between"}>
          {title && (
            <Box
              sx={{ width: "75%" }}
              display={"flex"}
              alignItems={"center"}
              gap={1}
            >
              {statusBullet && statusBullet}
              <Typography
                variant={variant === "normal" ? "normal" : "small"}
                sx={{
                  display: "inline-block",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  WebkitLineClamp: "2",
                  WebkitBoxOrient: "vertical",
                }}
              >
                {title}
              </Typography>
            </Box>
          )}
          {headerSubtitle && (
            <Typography variant="small">{headerSubtitle}</Typography>
          )}
        </Box>
        {headerButtons && (
          <ButtonGroup>{headerButtons.map((button) => button)}</ButtonGroup>
        )}
      </CardHeaderWrapper>
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
