import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { Card } from "@components/Cards";
import React from "react";
import styled from "styled-components";
import { BeeConfigActionsSection } from "./BeeConfigActionsSection";
import { useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";

interface BeeConfigActionsProps {
  onKillJackAndJacktrip?: () => void;
  onReconnect?: () => void;
  onReboot?: () => void;
  onShutdown?: () => void;
  onSaveSounds?: () => void;
  onRestoreSounds?: () => void;
}

const CardActions = styled(Card)`
  div.MuiGrid-root + div.MuiGrid-root {
    margin-top: 8px;
  }
`;

export const BeeConfigActions = ({
  onKillJackAndJacktrip,
  onReconnect,
  onReboot,
  onShutdown,
  onSaveSounds,
  onRestoreSounds,
}: BeeConfigActionsProps) => {
  const appMode = useAppStore((state) => state.appMode);

  return (
    <CardActions title="Actions">
      {/* Killing processes */}

      <BeeConfigActionsSection title="Stop the sound on this bee">
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Dark}
          onClick={() => {
            if (onKillJackAndJacktrip) onKillJackAndJacktrip();
          }}
          style={{ width: "100%", height: "100%" }}
        >
          Stop
        </Button>
      </BeeConfigActionsSection>

      {/*
        Hook into current hive, only when we are not in HUB mode.
        See useBee hook source for more information
      */}

      {appMode !== AppMode.Hub && (
        <BeeConfigActionsSection title="Connect this bee again">
          <Button
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
            buttonUse={ButtonUse.Dark}
            onClick={() => {
              if (onReconnect) onReconnect();
            }}
            style={{ width: "100%", height: "100%" }}
          >
            Start
          </Button>
        </BeeConfigActionsSection>
      )}

      {/* Restart or switch off the bee */}

      <BeeConfigActionsSection title="Restart this bee">
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Dark}
          onClick={() => {
            if (onReboot) onReboot();
          }}
          style={{ width: "100%", height: "100%" }}
        >
          Restart
        </Button>
      </BeeConfigActionsSection>

      <BeeConfigActionsSection title="Switch this bee off">
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Dark}
          onClick={() => {
            if (onShutdown) onShutdown();
          }}
          style={{ width: "100%", height: "100%" }}
        >
          Switch off
        </Button>
      </BeeConfigActionsSection>

      {/* Keep a copy of the sounds of the bee on this computer */}

      <BeeConfigActionsSection title="Save sounds to this computer">
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Dark}
          onClick={() => {
            if (onSaveSounds) onSaveSounds();
          }}
          style={{ width: "100%", height: "100%" }}
        >
          Save
        </Button>
      </BeeConfigActionsSection>

      {/* Put the saved copy of the sounds back on the bee */}

      <BeeConfigActionsSection title="Put saved sounds back on this bee">
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Dark}
          onClick={() => {
            if (onRestoreSounds) onRestoreSounds();
          }}
          style={{ width: "100%", height: "100%" }}
        >
          Put back
        </Button>
      </BeeConfigActionsSection>
    </CardActions>
  );
};
