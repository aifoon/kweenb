import React from "react";
import styled from "styled-components";

type CardSectionProps = {
  children: React.ReactNode;
  title?: string;
  introduction?: string;
};

const CardSectionWrapper = styled.div`
  h2 {
    font-size: 1.2rem;
    margin: 0 0 1.8rem 0;
    padding: 0 0 9px 0;
    border-bottom: 1px solid var(--textColor);
  }
  margin-bottom: var(--cardMarginBottom);
`;

const CardSectionIntroductionWrapper = styled.div`
  border-radius: var(--radiusMedium);
  color: var(--white);
  margin: 0 0 18px 0;
  font-size: 0.9rem;
  div:last-child {
    margin-bottom: 0;
  }
`;

const CardSectionChildrenWrapper = styled.div`
  & > *:last-child {
    margin-bottom: 0 !important;
  }
`;

export const CardSection = ({
  children,
  title,
  introduction,
}: CardSectionProps) => (
  <CardSectionWrapper>
    {title && <h2>{title}</h2>}
    {introduction && (
      <CardSectionIntroductionWrapper>
        {introduction}
      </CardSectionIntroductionWrapper>
    )}
    <CardSectionChildrenWrapper>{children}</CardSectionChildrenWrapper>
  </CardSectionWrapper>
);
