import { Utils } from "../../shared/utils";
import React from "react";
import styled from "styled-components";
import { useDrag } from "react-dnd";

type InActiveBeeProps = {
  number: number;
  name: string;
};

const InActiveBeeContainer = styled.div`
  width: 100%;
  background-color: var(--primary-300);
  padding: 0.6rem;
  font-size: var(--smallText);
`;

export const InActiveBeeNumber = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  margin-right: var(--smallText);
  font-size: var(--smallText);
  background: var(--primary-100);
`;

export const InActiveBee = ({ number, name }: InActiveBeeProps) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "InActiveBee",
    item: { number },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));
  return (
    <InActiveBeeContainer style={{ opacity: isDragging ? 0.4 : 1 }} ref={drag}>
      <InActiveBeeNumber>{Utils.addLeadingZero(number)}</InActiveBeeNumber>
      {name}
    </InActiveBeeContainer>
  );
};
