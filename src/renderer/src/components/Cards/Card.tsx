import { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "../Button";
import { ButtonGroup } from "../ButtonGroup";

interface CardProps {
  title: string;
  footerButtons?: ReactElement<ButtonProps>[];
  children?: React.ReactNode;
}

const CardWrapper = styled.div`
  background-color: var(--primary-200);
  border-radius: var(--radiusLarge);
`;

const CardInnerWrapper = styled.div`
  padding: 15px 30px;
`;

const CardHeaderWrapper = styled(CardInnerWrapper)`
  background-color: var(--primary-400);
  border-bottom: 1px solid var(--primary-100);
  border-radius: var(--radiusLarge) var(--radiusLarge) 0 0;
  font-size: var(--h5);
  padding: 15px 30px;
`;

const CardFooterWrapper = styled(CardInnerWrapper)`
  display: flex;
  background-color: var(--primary-400);
  border-radius: 0 0 var(--radiusLarge) var(--radiusLarge);
  justify-content: flex-end;
`;

export const Card = ({ title, footerButtons, children }: CardProps) => (
  <CardWrapper>
    <CardHeaderWrapper>{title}</CardHeaderWrapper>
    <CardInnerWrapper>{children}</CardInnerWrapper>
    {footerButtons && (
      <CardFooterWrapper>
        <ButtonGroup>{footerButtons.map((button) => button)}</ButtonGroup>
      </CardFooterWrapper>
    )}
  </CardWrapper>
);
