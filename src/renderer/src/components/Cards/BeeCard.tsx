import React, { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import {
  Button,
  ButtonUse,
  ButtonType,
  ButtonSize,
} from "@renderer/src/components/Buttons";
import { CircularProgress, Grid } from "@mui/material";
import { Utils } from "@shared/utils";
import { Flex } from "../Flex";
import { StatusBullet, StatusBulletType } from "../StatusBullet";
import { Label, LabelType } from "../Label";

/**
 * Types & Enums
 */

export interface BeeCardProps {
  number?: number;
  name?: string;
  online?: boolean;
  jackIsRunning?: boolean;
  jackTripIsRunning?: boolean;
  ipAddress?: string;
  loading?: boolean;
  onBeeConfigClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const BeeCardContainer = styled.div`
  position: relative;
  border-radius: var(--radiusLarge);
  padding: 1rem;
  background-color: var(--beeCardBg);

  h2 {
    margin: 0;
    font-weight: bold;
  }

  p {
    margin: 0;
  }

  Button {
    width: 100%;
  }

  div:last-child {
    margin-bottom: 0;
  }
`;

const BeeCardSection = styled.div`
  margin-bottom: var(--smallText);
`;

const BeeCardLoader = styled.div`
  position: absolute;
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: var(--radiusLarge);
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
`;

export const BeeCard = ({
  number = 0,
  online = true,
  jackIsRunning = false,
  jackTripIsRunning = false,
  loading = false,
  name = "No name available",
  ipAddress = "0.0.0.0",
  onBeeConfigClick,
}: BeeCardProps): ReactElement => {
  const [isOnline, setIsOnline] = useState(online);
  const [isJackIsRunning, setIsJackIsRunning] = useState(online);
  const [isJackTripIsRunning, setIsJackTripIsRunning] = useState(online);
  const [isLoading, setIsLoading] = useState(loading);

  useEffect(() => setIsOnline(online), [online]);
  useEffect(() => setIsJackIsRunning(jackIsRunning), [jackIsRunning]);
  useEffect(
    () => setIsJackTripIsRunning(jackTripIsRunning),
    [jackTripIsRunning]
  );
  useEffect(() => setIsLoading(loading), [loading]);

  return (
    <BeeCardContainer>
      {isLoading && (
        <BeeCardLoader>
          <CircularProgress />
        </BeeCardLoader>
      )}
      <>
        <Flex justifyContent="flex-end">
          <StatusBullet
            type={
              isOnline ? StatusBulletType.Active : StatusBulletType.NotActive
            }
            size={16}
          />
        </Flex>

        <BeeCardSection>
          <h2>{Utils.addLeadingZero(number)}</h2>
          <p>{name}</p>
          <p>{ipAddress}</p>
        </BeeCardSection>

        <BeeCardSection>
          <Grid container spacing={1}>
            <Grid item xs={5}>
              <Label
                type={isJackIsRunning ? LabelType.Primary : LabelType.Secondary}
              >
                Jack
              </Label>
            </Grid>
            <Grid item xs={7}>
              <Label
                type={
                  isJackTripIsRunning ? LabelType.Primary : LabelType.Secondary
                }
              >
                JackTrip
              </Label>
            </Grid>
          </Grid>
        </BeeCardSection>

        <BeeCardSection>
          <Button
            onClick={onBeeConfigClick}
            buttonUse={ButtonUse.Normal}
            buttonType={ButtonType.Primary}
            buttonSize={ButtonSize.Small}
            disabled={!isOnline}
          >
            Bee Config
          </Button>
        </BeeCardSection>
      </>
    </BeeCardContainer>
  );
};
