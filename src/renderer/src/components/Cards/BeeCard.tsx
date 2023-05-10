import React, { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { CircularProgress, Grid } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Utils } from "@shared/utils";
import { useDrag } from "react-dnd";
import { ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ChannelType } from "@shared/interfaces";
import { StatusBullet, StatusBulletType } from "../StatusBullet";
import { ToggleButton } from "../Buttons/ToggleButton";
import { Label, LabelType } from "../Label";

/**
 * Types & Enums
 */

export interface BeeCardProps {
  number: number;
  name?: string;
  online?: boolean;
  jackIsRunning?: boolean;
  jackTripIsRunning?: boolean;
  channelType: ChannelType;
  channel1: number;
  channel2: number;
  apiOn?: boolean;
  ipAddress?: string;
  loading?: boolean;
  draggable?: boolean;
  onBeeConfigClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onBeeDeleteClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onChannelTypeChange?: (channelType: ChannelType) => void;
}

export const BeeCardContainer = styled.div`
  position: relative;
  border-radius: var(--radiusLarge);
  padding: 1rem;
  height: 100%; /* Fixed height of the BeeCard */
  background-color: var(--beeCardBg);

  h2,
  h3,
  h4,
  h5,
  h6 {
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

const ToolButtonGroup = styled.div`
  text-align: right;
  a + a {
    margin-left: 7px;
  }
`;

const ToolButton = styled.a`
  display: inline-block;
  color: var(--grey-400);
  background: none;
  padding: 0;
  text-align: right;
  transition: color 0.3s;
  cursor: pointer;
  &:hover {
    color: var(--grey-700);
  }
`;

export const BeeCard = ({
  number = 0,
  online = true,
  jackIsRunning = false,
  jackTripIsRunning = false,
  apiOn = false,
  loading = false,
  channelType = ChannelType.MONO,
  channel1 = 0,
  channel2 = 0,
  name = "No name available",
  ipAddress = "0.0.0.0",
  onBeeConfigClick,
  onBeeDeleteClick,
  onChannelTypeChange,
  draggable = false,
}: BeeCardProps): ReactElement => {
  const [isOnline, setIsOnline] = useState(online);
  const [isJackIsRunning, setIsJackIsRunning] = useState(jackIsRunning);
  const [isJackTripIsRunning, setIsJackTripIsRunning] =
    useState(jackTripIsRunning);
  const [isApiOn, setIsApiOn] = useState(apiOn);
  const [isLoading, setIsLoading] = useState(loading);

  /**
   * Some effects
   */

  useEffect(() => setIsOnline(online), [online]);
  useEffect(() => setIsJackIsRunning(jackIsRunning), [jackIsRunning]);
  useEffect(() => setIsApiOn(apiOn), [apiOn]);
  useEffect(
    () => setIsJackTripIsRunning(jackTripIsRunning),
    [jackTripIsRunning]
  );
  useEffect(() => setIsLoading(loading), [loading]);

  /**
   * Dragging behaviour
   */

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "BeeCard",
    item: { number },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <BeeCardContainer
      style={{ opacity: isDragging ? 0.4 : 1 }}
      ref={drag}
      draggable={draggable}
    >
      {isLoading && (
        <BeeCardLoader>
          <CircularProgress />
        </BeeCardLoader>
      )}
      <>
        <Grid container>
          <Grid item xs={4}>
            <StatusBullet
              type={
                isOnline ? StatusBulletType.Active : StatusBulletType.NotActive
              }
              size={16}
            />
          </Grid>
          <Grid item xs={8}>
            <ToolButtonGroup>
              <ToolButton onClick={onBeeDeleteClick}>
                <DeleteForeverIcon fontSize="small" />
              </ToolButton>
              {isOnline && isApiOn && (
                <ToolButton onClick={onBeeConfigClick}>
                  <SettingsIcon fontSize="small" />
                </ToolButton>
              )}
            </ToolButtonGroup>
          </Grid>
        </Grid>

        <BeeCardSection>
          <h3>{Utils.addLeadingZero(number)}</h3>
          <p>{name}</p>
          <p>{ipAddress}</p>
        </BeeCardSection>

        {/* Uncomment this when working on the mono/stereo shizzle again */}

        {/* <BeeCardSection>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <ToggleButton
                state1={{
                  text: "Mono",
                  buttonUse: ButtonUse.Normal,
                  buttonType: ButtonType.SecondaryWhite,
                  onClick: () => {
                    if (onChannelTypeChange)
                      onChannelTypeChange(ChannelType.MONO);
                  },
                }}
                state2={{
                  text: "Stereo",
                  buttonUse: ButtonUse.Normal,
                  buttonType: ButtonType.SecondaryWhite,
                  onClick: () => {
                    if (onChannelTypeChange)
                      onChannelTypeChange(ChannelType.STEREO);
                  },
                }}
                buttonSize={ButtonSize.Small}
                toggleStateOnClick
                state={channelType === ChannelType.MONO ? 1 : 2}
              />
            </Grid>
          </Grid>
        </BeeCardSection> */}

        <BeeCardSection>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Label type={isApiOn ? LabelType.Primary : LabelType.Secondary}>
                Zwerm3 API
              </Label>
            </Grid>
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
      </>
    </BeeCardContainer>
  );
};
