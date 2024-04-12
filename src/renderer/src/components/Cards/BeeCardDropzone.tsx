import React from "react";
import styled from "styled-components";
import { useDrop } from "react-dnd";
import { BeeCardContainer } from "./BeeCard";
import { Typography } from "@mui/material";

type BeeCardDropzoneProps = {
  onInActiveBeeDropped?: (number: number) => void;
  collapsed?: boolean;
};

const BeeCardDropzoneContainer = styled(BeeCardContainer)<{
  collapsed: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px dashed var(--grey-400);
  color: var(--grey-400);
  text-align: center;
  min-height: ${(props) => (props.collapsed ? "74px" : "176px")};
`;

export const BeeCardDropzone = ({
  onInActiveBeeDropped,
  collapsed = true,
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
      collapsed={collapsed}
      ref={drop}
    >
      <Typography variant="extraSmall">drop inactive bee</Typography>
    </BeeCardDropzoneContainer>
  );
};
