import { ReactElement } from "react";
import styled from "styled-components";
import { ButtonProps } from "../Button";

interface CardProps {
  title: string;
  footerButtons?: ReactElement<ButtonProps>[];
}

const CardWrapper = styled.div`
  background-color: var(--primary-200);
  border-radius: 15px;
`;

const CardInnerWrapper = styled.div`
  padding: 15px 30px;
`;

const CardHeaderWrapper = styled(CardInnerWrapper)`
  background-color: var(--primary-400);
  border-bottom: 1px solid var(--primary-100);
  border-radius: 15px 15px 0 0;
  font-size: var(--h5);
  padding: 15px 30px;
`;

const CardFooterWrapper = styled(CardInnerWrapper)`
  display: flex;
  background-color: var(--primary-400);
  border-radius: 0 0 15px 15px;
  justify-content: flex-end;
  button + button {
    margin-left: 15px;
  }
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
        {footerButtons.map((button) => button)}
      </CardFooterWrapper>
    )}
  </CardWrapper>
);
