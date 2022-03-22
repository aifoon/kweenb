import React, { useEffect } from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { useShowState } from "@renderer/src/hooks/useShowState";
import styled from "styled-components";
import { AddBeeModal } from "./AddBeeModal";

const EmptyBeesContainer = styled.div`
  display: flex;
  height: var(--contentHeight);
  padding-left: var(--sidebarWidth);
  width: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h2 {
    margin-top: 0;
  }
  p {
    margin-bottom: 2rem;
  }
`;

export const NoBees = () => {
  const { open, handleOpen, handleClose } = useShowState(false);

  return (
    <EmptyBeesContainer>
      <AddBeeModal open={open} onClose={handleClose} />
      <div style={{ width: "500px", textAlign: "center" }}>
        <h2>Welcome to KweenB!</h2>
        <p>
          With this application you'll be able to manage bees. An extra device,
          The Kween, will be used to stream audio between your computer and the
          different bees.
        </p>
        <Button
          key="addNewBee"
          buttonSize={ButtonSize.Medium}
          buttonUse={ButtonUse.Normal}
          buttonType={ButtonType.Primary}
          onClick={handleOpen}
        >
          Start by adding your first bee
        </Button>
      </div>
    </EmptyBeesContainer>
  );
};
