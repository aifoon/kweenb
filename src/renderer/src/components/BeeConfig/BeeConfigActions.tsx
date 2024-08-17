import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { Card } from "@components/Cards";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { BeeConfigActionsRunJack } from "./BeeConfigActionsRunJack";
import { BeeConfigActionsRunJacktrip } from "./BeeConfigActionsRunJacktrip";
import { BeeConfigActionsSection } from "./BeeConfigActionsSection";
import { useAppStore } from "@renderer/src/hooks";
import { AppMode } from "@shared/enums";

interface BeeConfigActionsProps {
  isJackRunning?: boolean;
  isJacktripRunning?: boolean;
  onStartJack?: () => void;
  onStartJacktrip?: () => void;
  onStopJack?: () => void;
  onStopJacktrip?: () => void;
  onKillJackAndJacktrip?: () => void;
  onReconnect?: () => void;
}

const CardActions = styled(Card)`
  div.MuiGrid-root + div.MuiGrid-root {
    margin-top: 8px;
  }
`;

export const BeeConfigActions = ({
  isJackRunning = false,
  isJacktripRunning = false,
  onStartJack,
  onStartJacktrip,
  onStopJack,
  onStopJacktrip,
  onKillJackAndJacktrip,
  onReconnect,
}: BeeConfigActionsProps) => {
  const [currentIsJackRunning, setCurrentIsJackRunning] =
    useState(isJackRunning);
  const [currentIsJacktripRunning, setCurrentIsJacktripRunning] =
    useState(isJacktripRunning);
  const appMode = useAppStore((state) => state.appMode);

  useEffect(() => setCurrentIsJackRunning(isJackRunning), [isJackRunning]);
  useEffect(
    () => setCurrentIsJacktripRunning(isJacktripRunning),
    [isJacktripRunning]
  );

  return (
    <CardActions title="Actions">
      {/* Jack */}

      <BeeConfigActionsSection title="Jack">
        <BeeConfigActionsRunJack
          onStart={() => {
            if (onStartJack) onStartJack();
          }}
          onStop={() => {
            if (onStopJack) onStopJack();
          }}
          isRunning={currentIsJackRunning}
        />
      </BeeConfigActionsSection>

      {/* Jacktrip */}

      {/* Only the running jacktrip whenever a Jacktrip instance
          is started. We don't know the configuration of all the bees/kweenb.
          Only when we started the whole connection flow, we know what params
          we can add to Jacktrip.
      */}
      {isJacktripRunning && (
        <BeeConfigActionsSection title="Jacktrip">
          <BeeConfigActionsRunJacktrip
            onStart={() => {
              if (onStartJacktrip) onStartJacktrip();
            }}
            onStop={() => {
              if (onStopJacktrip) onStopJacktrip();
            }}
            isRunning={currentIsJacktripRunning}
          />
        </BeeConfigActionsSection>
      )}

      {/* Killing processes */}

      <BeeConfigActionsSection title="Kill all Jack and Jacktrip processes">
        <Button
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Dark}
          onClick={() => {
            if (onKillJackAndJacktrip) onKillJackAndJacktrip();
          }}
          style={{ width: "100%", height: "100%" }}
        >
          Run
        </Button>
      </BeeConfigActionsSection>

      {/*
        Hook into current hive, only when we are not in HUB mode.
        See useBee hook source for more information
      */}

      {appMode !== AppMode.Hub && (
        <BeeConfigActionsSection title="Reconnect">
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
    </CardActions>
  );
};
