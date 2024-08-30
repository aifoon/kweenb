import React, { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { Utils } from "../../shared/utils";
import { useDrag } from "react-dnd";
import { ChannelType } from "../../shared/enums";
import { StatusBullet, StatusBulletType } from "../StatusBullet";
import { Label, LabelType } from "../Label";
import {
  NetworkPerformance,
  NetworkPerformancePresentationType,
} from "./NetworkPerformance";

/**
 * Types & Enums
 */

export interface BeeCardProps {
  number: number;
  name?: string;
  online?: boolean;
  collapsed?: boolean;
  jackIsRunning?: boolean;
  jackTripIsRunning?: boolean;
  channelType: ChannelType;
  channel1: number;
  channel2: number;
  apiOn?: boolean;
  ipAddress?: string;
  loading?: boolean;
  draggable?: boolean;
  networkPerformanceMs?: number;
  onBeeConfigClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onBeeDeleteClick: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  onChannelTypeChange?: (channelType: ChannelType) => void;
  onDoubleClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const BeeCardContainer = styled(Box)`
  position: relative;
  border-radius: var(--radiusLarge);
  padding: 0.85rem;
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
  collapsed = true,
  jackIsRunning = false,
  jackTripIsRunning = false,
  apiOn = false,
  loading = false,
  onChannelTypeChange,
  channelType = ChannelType.MONO,
  channel1 = 0,
  channel2 = 0,
  networkPerformanceMs = 0,
  name = "No name available",
  ipAddress = "0.0.0.0",
  onBeeConfigClick,
  onBeeDeleteClick,
  onDoubleClick,
  draggable = false,
}: BeeCardProps): ReactElement => {
  const [isOnline, setIsOnline] = useState(online);
  const [isJackIsRunning, setIsJackIsRunning] = useState(jackIsRunning);
  const [isJackTripIsRunning, setIsJackTripIsRunning] =
    useState(jackTripIsRunning);
  const [isApiOn, setIsApiOn] = useState(apiOn);
  const [currentNetworkPerformanceMs, setCurrentNetworkPerformanceMs] =
    useState(networkPerformanceMs);
  const [isLoading, setIsLoading] = useState(loading);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  /**
   * Some effects
   */

  useEffect(() => setIsOnline(online), [online]);
  useEffect(() => setIsCollapsed(collapsed), [collapsed]);
  useEffect(
    () => setCurrentNetworkPerformanceMs(currentNetworkPerformanceMs),
    [currentNetworkPerformanceMs]
  );
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
      onDoubleClick={(e) => {
        if (onDoubleClick) onDoubleClick(e);
      }}
    >
      {isLoading && (
        <BeeCardLoader>
          <CircularProgress />
        </BeeCardLoader>
      )}
      <>
        {isCollapsed && (
          <Box
            display={"grid"}
            gridTemplateColumns={"1fr 0.6fr"}
            alignItems={"center"}
          >
            <Box
              display={"grid"}
              alignItems={"center"}
              gridTemplateColumns={"1fr"}
            >
              <Box display={"flex"} alignItems={"center"} gap={1}>
                <StatusBullet
                  type={
                    isOnline
                      ? StatusBulletType.Active
                      : StatusBulletType.NotActive
                  }
                  size={8}
                />
                <Typography variant="small">{name}</Typography>
              </Box>
              <Box display={"flex"} alignItems={"center"}>
                <NetworkPerformance
                  networkPresentationType={
                    NetworkPerformancePresentationType.DETAILED
                  }
                  networkPerformanceMs={networkPerformanceMs}
                />
              </Box>
            </Box>
            <Box
              display={"grid"}
              alignItems={"center"}
              gap={1}
              gridTemplateColumns={"1fr 1fr"}
              width={"100%"}
            >
              <Label
                type={isApiOn ? LabelType.Primary : LabelType.Secondary}
                style={{ gridColumn: "1 / span 2" }}
              >
                Z3
              </Label>
              <Label
                type={isJackIsRunning ? LabelType.Primary : LabelType.Secondary}
              >
                JA
              </Label>
              <Label
                type={
                  isJackTripIsRunning ? LabelType.Primary : LabelType.Secondary
                }
              >
                JT
              </Label>
            </Box>
            <div></div>
          </Box>
        )}
        {!isCollapsed && (
          <>
            <Grid container>
              <Grid item xs={6}>
                <Box display={"flex"} alignItems={"center"} gap={1}>
                  <StatusBullet
                    type={
                      isOnline
                        ? StatusBulletType.Active
                        : StatusBulletType.NotActive
                    }
                    size={16}
                  />
                </Box>
              </Grid>
              <Grid style={{ display: "hidden" }} item xs={6}>
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
              <Box
                display={"grid"}
                gridTemplateColumns={"1fr"}
                alignItems={"center"}
              >
                <Typography display="block" variant="h6">
                  {`${Utils.addLeadingZero(number)} - ${name}`}
                </Typography>
                <Typography variant="small">{ipAddress}</Typography>
              </Box>
            </BeeCardSection>

            <BeeCardSection>
              <Grid container spacing={1}>
                <Grid item xs={4}>
                  <Label
                    type={isApiOn ? LabelType.Primary : LabelType.Secondary}
                  >
                    API
                  </Label>
                </Grid>
                <Grid item xs={8}>
                  <NetworkPerformance
                    networkPresentationType={
                      NetworkPerformancePresentationType.DETAILED
                    }
                    networkPerformanceMs={networkPerformanceMs}
                  />
                </Grid>
                <Grid item xs={5}>
                  <Label
                    type={
                      isJackIsRunning ? LabelType.Primary : LabelType.Secondary
                    }
                  >
                    Jack
                  </Label>
                </Grid>
                <Grid item xs={7}>
                  <Label
                    type={
                      isJackTripIsRunning
                        ? LabelType.Primary
                        : LabelType.Secondary
                    }
                  >
                    JackTrip
                  </Label>
                </Grid>
              </Grid>
            </BeeCardSection>
          </>
        )}
      </>
    </BeeCardContainer>
  );
};
