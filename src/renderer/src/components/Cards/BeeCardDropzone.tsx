import React from "react";
import styled from "styled-components";
import { useDrop } from "react-dnd";
import { BeeCardContainer } from "./BeeCard";

type BeeCardDropzoneProps = {
  onInActiveBeeDropped?: (number: number) => void;
};

const BeeCardDropzoneContainer = styled(BeeCardContainer)`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px dashed var(--grey-400);
  color: var(--grey-400);
  text-align: center;
`;

export const BeeCardDropzone = ({
  onInActiveBeeDropped,
}: BeeCardDropzoneProps) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "InActiveBee",
    drop: (item: { number: number }) => {
      if (onInActiveBeeDropped) onInActiveBeeDropped(item.number);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  return (
    <BeeCardDropzoneContainer
      style={{ background: canDrop && isOver ? "var(--primary-300)" : "none" }}
      ref={drop}
    >
      drop a non-active bee
    </BeeCardDropzoneContainer>
  );
};
