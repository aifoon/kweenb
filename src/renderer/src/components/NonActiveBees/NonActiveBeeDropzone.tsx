import React from "react";
import styled from "styled-components";
import { useDrop } from "react-dnd";
import { NonActiveBeeNumber } from "./NonActiveBee";

interface NonActiveBeeNumberDropzoneProps {
  onBeeCardDropped?: (number: number) => void;
}

const NonActiveBeeDropzoneContainer = styled.div`
  width: 100%;
  padding: 0.6rem;
  font-size: var(--smallText);
  border: 1px dashed var(--grey-400);
  color: var(--grey-400);
`;

const NonActiveBeeNumberDropzone = styled(NonActiveBeeNumber)`
  background: none;
  border: 1px dashed var(--grey-400);
`;

export const NonActiveBeeDropzone = ({
  onBeeCardDropped,
}: NonActiveBeeNumberDropzoneProps) => {
  const [{ canDrop, isOver }, drop] = useDrop(() => ({
    accept: "BeeCard",
    drop: (item: { number: number }) => {
      if (onBeeCardDropped) onBeeCardDropped(item.number);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  }));
  return (
    <NonActiveBeeDropzoneContainer
      ref={drop}
      style={{ background: canDrop && isOver ? "var(--primary-300)" : "none" }}
    >
      <NonActiveBeeNumberDropzone>00</NonActiveBeeNumberDropzone>
      drop an active bee
    </NonActiveBeeDropzoneContainer>
  );
};
