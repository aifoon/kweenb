import { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "../Button";
import { ButtonGroup } from "../ButtonGroup";

interface CardProps {
  title: string;
  footerButtons?: ReactElement<ButtonProps>[];
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

export const Card = ({ title, footerButtons }: CardProps) => (
  <CardWrapper>
    <CardHeaderWrapper>{title}</CardHeaderWrapper>
    <CardInnerWrapper>
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Odit sed,
      provident quod facere temporibus soluta quasi cupiditate praesentium,
      architecto dolorem animi ipsam debitis placeat dolorum? Sed voluptates
      ipsum nesciunt dolorum?
    </CardInnerWrapper>
    {footerButtons && (
      <CardFooterWrapper>
        <ButtonGroup>{footerButtons.map((button) => button)}</ButtonGroup>
      </CardFooterWrapper>
    )}
  </CardWrapper>
);
