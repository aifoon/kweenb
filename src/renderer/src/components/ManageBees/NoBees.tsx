import React from "react";
import {
  Button,
  ButtonSize,
  ButtonUse,
  ButtonType,
} from "@components/Buttons/Button";
import { Z3PageCentered } from "@components/Layout";

interface NoBeesProps {
  onAddBeeClicked: () => void;
}

export const NoBees = ({ onAddBeeClicked }: NoBeesProps) => (
  <Z3PageCentered>
    <div style={{ width: "500px", textAlign: "center" }}>
      <h2>Welcome to KweenB!</h2>
      <p>With this application you&apos;ll be able to manage bees. Have fun!</p>
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
  </Z3PageCentered>
);
