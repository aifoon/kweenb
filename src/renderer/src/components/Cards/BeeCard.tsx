import React, { ReactElement } from "react";
import styled from "styled-components";
import {
  Button,
  ButtonUse,
  ButtonType,
  ButtonSize,
} from "@renderer/src/components/Buttons";
import { Grid } from "@mui/material";
import { Flex } from "../Flex";
import { StatusBullet, StatusBulletType } from "../StatusBullet";
import { Label, LabelType } from "../Label";
import { Utils } from "../../lib/utils";

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

export const BeeCard = ({
  number = 0,
  online = false,
  jackIsRunning = true,
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
      <h2>{Utils.addLeadingZero(number)}</h2>
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
        buttonSize={ButtonSize.Small}
      >
        Bee Config
      </Button>
    </BeeCardSection>
  </BeeCardContainer>
);
