import React from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import styled from "styled-components";

interface NoBeesProps {
  onAddBeeClicked: () => void;
}

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
    color: var(--secondary-100);
  }
`;

export const NoBees = ({ onAddBeeClicked }: NoBeesProps) => (
  <EmptyBeesContainer>
    <div style={{ width: "500px", textAlign: "center" }}>
      <h2>Welcome to KweenB!</h2>
      <p>
        With this application you&apos;ll be able to manage bees. An extra
        device, The Kween, will be used to stream audio between your computer
        and all the other bees. Have fun!
      </p>
      <Button
        key="addNewBee"
        buttonSize={ButtonSize.Medium}
        buttonUse={ButtonUse.Normal}
        buttonType={ButtonType.Primary}
        onClick={onAddBeeClicked}
      >
        Start by adding your first bee
      </Button>
    </div>
  </EmptyBeesContainer>
);
