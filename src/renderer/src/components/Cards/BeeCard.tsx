import React, { ReactElement } from "react";
import styled from "styled-components";
import { Button, ButtonUse, ButtonType, ButtonSize } from "@components/Button";
import { Grid } from "@mui/material";
import { Flex } from "../Flex";
import { StatusBullet, StatusBulletType } from "../StatusBullet";
import { Label, LabelType } from "../Label";

/**
 * Types & Enums
 */

interface BeeCardProps {
  number?: number;
  name?: string;
  online?: boolean;
  jackIsRunning?: boolean;
  jackTripIsRunning?: boolean;
  ipAddress?: string;
  onBeeConfigClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const BeeCardContainer = styled.div`
  border-radius: 15px;
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

const addLeadingZero = (number: number): string =>
  number < 10 ? `0${number}` : `${number}`;

export const BeeCard = ({
  number = 0,
  online = false,
  jackIsRunning = false,
  jackTripIsRunning = false,
  name = "No name",
  ipAddress = "0.0.0.0",
  onBeeConfigClick,
}: BeeCardProps): ReactElement => (
  <BeeCardContainer>
    <Flex justifyContent="flex-end">
      <StatusBullet
        type={online ? StatusBulletType.Active : StatusBulletType.NotActive}
        size={16}
      />
    </Flex>

    <BeeCardSection>
      <h2>{addLeadingZero(number)}</h2>
      <p>{name}</p>
      <p>{ipAddress}</p>
    </BeeCardSection>

    <BeeCardSection>
      <Grid container spacing={1}>
        <Grid item xs={5}>
          <Label type={jackIsRunning ? LabelType.Primary : LabelType.Secondary}>
            Jack
          </Label>
        </Grid>
        <Grid item xs={7}>
          <Label
            type={jackTripIsRunning ? LabelType.Primary : LabelType.Secondary}
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
        buttonSize={ButtonSize.Medium}
      >
        Bee Config
      </Button>
    </BeeCardSection>
  </BeeCardContainer>
);
