import React, { ReactElement, useEffect, useState } from "react";
import styled from "styled-components";
import { Box, CircularProgress, Typography } from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { useDrag } from "react-dnd";
import { ChannelType } from "../../shared/enums";
import { StatusBullet, StatusBulletType } from "../StatusBullet";
import { IBeeMonitoring } from "../../shared/interfaces";
import {
  BatteryIndicator,
  BeeActivity,
  WifiIndicator,
  beeActivityText,
  getBeeActivity,
} from "./BeeIndicators";

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
  // what the bee reports about itself: stream, battery, wifi
  monitoring?: IBeeMonitoring;
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
  monitoring,
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
  const [isLoading, setIsLoading] = useState(loading);
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  /**
   * Some effects
   */

  useEffect(() => setIsOnline(online), [online]);
  useEffect(() => setIsCollapsed(collapsed), [collapsed]);
  useEffect(() => setIsJackIsRunning(jackIsRunning), [jackIsRunning]);
  useEffect(() => setIsApiOn(apiOn), [apiOn]);
  useEffect(
    () => setIsJackTripIsRunning(jackTripIsRunning),
    [jackTripIsRunning]
  );
  useEffect(() => setIsLoading(loading), [loading]);

  /**
   * What the bee is doing, in plain words
   */

  const activity = getBeeActivity(isOnline, monitoring);
  const bulletType =
    activity === BeeActivity.Offline
      ? StatusBulletType.NotActive
      : activity === BeeActivity.Problem || activity === BeeActivity.Starting
      ? StatusBulletType.Idle
      : StatusBulletType.Active;
  const problem =
    activity === BeeActivity.Problem ? monitoring?.stream.error : null;

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
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            gap={1.5}
          >
            <Box display={"flex"} alignItems={"center"} gap={1} minWidth={0}>
              <StatusBullet
                type={bulletType}
                size={8}
                style={{ flexShrink: 0 }}
              />
              <Typography variant="small" noWrap>
                {name}
              </Typography>
              <Typography
                variant="extraSmall"
                noWrap
                title={problem || undefined}
                style={{ opacity: 0.7 }}
              >
                {beeActivityText(activity)}
              </Typography>
            </Box>
            <Box
              display={"flex"}
              alignItems={"center"}
              gap={1.5}
              flexShrink={0}
            >
              {isOnline && (
                <WifiIndicator signalDbm={monitoring?.wifiSignalDbm} />
              )}
              <BatteryIndicator battery={monitoring?.battery} />
            </Box>
          </Box>
        )}
        {!isCollapsed && (
          <Box
            display={"flex"}
            flexDirection={"column"}
            justifyContent={"space-between"}
            height={"100%"}
            gap={1.5}
          >
            <Box>
              <Box
                display={"flex"}
                alignItems={"center"}
                justifyContent={"space-between"}
                gap={1}
              >
                <Typography variant="h6" noWrap>
                  {name}
                </Typography>
                <ToolButtonGroup style={{ flexShrink: 0 }}>
                  <ToolButton onClick={onBeeDeleteClick}>
                    <DeleteForeverIcon fontSize="small" />
                  </ToolButton>
                  {isOnline && isApiOn && (
                    <ToolButton onClick={onBeeConfigClick}>
                      <SettingsIcon fontSize="small" />
                    </ToolButton>
                  )}
                </ToolButtonGroup>
              </Box>
              <Box display={"flex"} alignItems={"center"} gap={1} mt={0.5}>
                <StatusBullet
                  type={bulletType}
                  size={8}
                  style={{ flexShrink: 0 }}
                />
                <Typography variant="small">
                  {beeActivityText(activity)}
                </Typography>
              </Box>
              {problem && (
                <Typography
                  display="block"
                  variant="extraSmall"
                  style={{ marginTop: 6 }}
                >
                  {problem}
                </Typography>
              )}
            </Box>

            <Box>
              <Box display={"flex"} alignItems={"center"} gap={2}>
                {isOnline && (
                  <WifiIndicator
                    signalDbm={monitoring?.wifiSignalDbm}
                    detailed
                  />
                )}
                <BatteryIndicator battery={monitoring?.battery} detailed />
              </Box>
              <Typography
                display="block"
                variant="extraSmall"
                style={{ opacity: 0.6, marginTop: 6 }}
              >
                {ipAddress}
              </Typography>
            </Box>
          </Box>
        )}
      </>
    </BeeCardContainer>
  );
};
