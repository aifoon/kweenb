import React from "react";
import styled from "styled-components";
import { useDrop } from "react-dnd";
import { InActiveBeeNumber } from "./InActiveBee";
import { Typography } from "@mui/material";

interface InActiveBeeNumberDropzoneProps {
  onBeeCardDropped?: (number: number) => void;
}

const InActiveBeeDropzoneContainer = styled.div`
  width: 100%;
  padding: 0.6rem;
  font-size: var(--smallText);
  border: 1px dashed var(--grey-400);
  color: var(--grey-400);
`;

const InActiveBeeNumberDropzone = styled(InActiveBeeNumber)`
  background: none;
  border: 1px dashed var(--grey-400);
`;

export const InActiveBeeDropzone = ({
  onBeeCardDropped,
}: InActiveBeeNumberDropzoneProps) => {
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
    <InActiveBeeDropzoneContainer
      ref={drop}
      style={{ background: canDrop && isOver ? "var(--primary-300)" : "none" }}
    >
      <InActiveBeeNumberDropzone>00</InActiveBeeNumberDropzone>
      <Typography variant="extraSmall">drop an active bee</Typography>
    </InActiveBeeDropzoneContainer>
  );
};
