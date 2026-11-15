import { useCallback, useEffect, useRef, useState } from "react";
import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { Card } from "@components/Cards";
import { PageHeader } from "@components/PageHeader";
import { Z3Page } from "@components/Layout";
import { PatchBay } from "./PatchBay";
import styled from "styled-components";
import { IRouting, IRoutingChange, ISoundDeviceInfo } from "@shared/interfaces";

// how often the page looks whether bees came or went
const REFRESH_MS = 3000;

const Choice = styled.button<{ active: boolean }>`
  all: unset;
  cursor: pointer;
  padding: 3px 9px;
  white-space: nowrap;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: ${({ active }) => (active ? "var(--primary-100)" : "none")};
  opacity: ${({ active }) => (active ? 1 : 0.8)};
  &:hover {
    opacity: 1;
  }
  &:disabled {
    opacity: 0.3;
    cursor: default;
  }
`;

// the channels that are shown when KweenB does not listen to its own device
const DEFAULT_CHANNELS = 32;

/**
 * KweenB's own sound device: installed or not, and what to do with it
 */
const SoundDevice = ({
  soundDevice,
  onChanged,
}: {
  soundDevice: ISoundDeviceInfo;
  onChanged: () => void;
}) => {
  const [installing, setInstalling] = useState(false);
  const [message, setMessage] = useState("");

  const install = async () => {
    setInstalling(true);
    setMessage("");
    try {
      const result = await window.kweenb.methods.installSoundDevice();
      if (result.outcome === "cancelled")
        setMessage("Not installed: KweenB needs your password for this.");
      else if (result.outcome === "failed")
        setMessage(
          "Installing did not work. Try again; if it keeps failing, restart this Mac and try once more."
        );
    } catch (e) {
      setMessage("Installing did not work. Try again.");
    }
    setInstalling(false);
    onChanged();
  };

  if (!soundDevice.supported)
    return (
      <Card title="Sound device">
        <Typography variant="small">
          KweenB&apos;s own sound device only exists for the Mac. On this
          computer KweenB listens to the sound device that is chosen in
          Settings.
        </Typography>
      </Card>
    );

  const ready = soundDevice.installed && soundDevice.upToDate;
  return (
    <Card title="Sound device">
      <Box display="flex" alignItems="center" gap={2}>
        <Box flex={1}>
          {!soundDevice.installed && (
            <>
              <Typography>{soundDevice.name} is not installed yet</Typography>
              <Typography variant="small">
                It is the sound device your audio software plays to. Each of its{" "}
                {soundDevice.channels} channels can go to a bee. Installing asks
                for your password, and the sound of this Mac stops for a moment.
              </Typography>
            </>
          )}
          {soundDevice.installed && !soundDevice.upToDate && (
            <>
              <Typography>
                There is a newer version of {soundDevice.name}
              </Typography>
              <Typography variant="small">
                Updating asks for your password, and the sound of this Mac stops
                for a moment. Disconnect the bees first.
              </Typography>
            </>
          )}
          {ready && (
            <>
              <Typography>{soundDevice.name} is ready</Typography>
              <Typography variant="small">
                {soundDevice.inUse
                  ? `In your audio software, choose "${soundDevice.name}" as the output. What you play on a channel goes to the bees it is plugged into below.`
                  : `KweenB listens to "${soundDevice.otherDevice}" instead, because that device is chosen in Settings. Choose ${soundDevice.name} there to use it.`}
              </Typography>
            </>
          )}
          {message && (
            <Typography variant="small" style={{ color: "var(--red-status)" }}>
              {message}
            </Typography>
          )}
        </Box>
        {installing && <CircularProgress size={22} />}
        {!ready && !installing && (
          <Button
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
            buttonUse={ButtonUse.Dark}
            onClick={install}
          >
            {soundDevice.installed ? "Update" : "Install"}
          </Button>
        )}
      </Box>
    </Card>
  );
};

export const Routing = () => {
  const [routing, setRouting] = useState<IRouting | null>(null);

  const refresh = useCallback(async () => {
    try {
      setRouting(await window.kweenb.methods.getRouting());
    } catch (e) {
      // try again at the next refresh
    }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  /**
   * How loud the channels are, as long as this page is open. The numbers
   * come many times a second, so they go past React straight to the patch bay.
   */
  const levels = useRef<number[]>([]);
  const onLevels = useRef<() => void>(() => {});
  useEffect(() => {
    const stopListening = window.kweenb.events.onRoutingLevels(
      (event, newLevels) => {
        levels.current = newLevels;
        onLevels.current();
      }
    );
    window.kweenb.actions.routingLevels("start");
    return () => {
      window.kweenb.actions.routingLevels("stop");
      stopListening();
    };
  }, [routing?.soundDevice.inUse, routing?.soundDevice.otherDevice]);

  const change = async (changes: IRoutingChange[]) => {
    // show the change right away; KweenB confirms it a moment later
    setRouting((before) =>
      before
        ? {
            ...before,
            bees: before.bees.map((bee) => {
              const c = changes.find((item) => item.beeId === bee.id);
              if (!c) return bee;
              const stereo = c.stereo === undefined ? bee.stereo : c.stereo;
              const channel = c.channel === undefined ? bee.channel : c.channel;
              let channelRight =
                c.channelRight === undefined
                  ? bee.channelRight
                  : c.channelRight;
              // a bee that becomes stereo plays its channel on both sides
              // until its right cord is moved
              if (
                stereo &&
                !bee.stereo &&
                c.channelRight === undefined &&
                channelRight === null
              )
                channelRight = channel;
              return { ...bee, stereo, channel, channelRight };
            }),
          }
        : before
    );
    setRouting(await window.kweenb.methods.setBeeChannels(changes));
  };

  // the channels of the device KweenB listens to
  const availableChannels = routing
    ? routing.soundDevice.inUse
      ? routing.soundDevice.channels
      : routing.soundDevice.otherDeviceChannels || DEFAULT_CHANNELS
    : 0;
  // a channel is only handed out when the device has it
  const existing = (channel: number) =>
    channel <= availableChannels ? channel : null;

  /**
   * Give every bee the next free channel(s), starting at channel 1: a mono
   * bee takes one, a stereo bee two (left and right). Only channels the
   * device has are handed out; the bees that are left get no cord.
   */
  const plugInOrder = () => {
    if (!routing) return;
    let next = 1;
    change(
      routing.bees.map((bee) => {
        const channel = next;
        next += bee.stereo ? 2 : 1;
        return {
          beeId: bee.id,
          channel: existing(channel),
          channelRight: bee.stereo ? existing(channel + 1) : null,
        };
      })
    );
  };

  // how many channels are shown; null: as many as are needed
  const [shownChannels, setShownChannels] = useState<number | null>(null);

  if (!routing) return <Z3Page pageHeader={<PageHeader title="Routing" />} />;

  const { bees, soundDevice } = routing;
  // the channels of the device KweenB listens to
  const deviceChannels = soundDevice.inUse
    ? soundDevice.channels
    : soundDevice.otherDeviceChannels || DEFAULT_CHANNELS;
  // the cords that are on a channel the device has
  const usedChannels = [
    ...bees.map((bee) => bee.channel || 0),
    ...bees.map((bee) => (bee.stereo && bee.channelRight) || 0),
  ];
  const highestUsed = Math.max(
    0,
    ...usedChannels.filter((channel) => channel <= deviceChannels)
  );
  // a cord on a channel the device does not have is kept, but not shown
  const missingChannels = usedChannels.some(
    (channel) => channel > deviceChannels
  );
  // a long list of channels nobody uses is in the way: show 20, 32 or all
  const channelChoices = [
    ...[20, 32].filter((count) => count < deviceChannels),
    deviceChannels,
  ];
  const neededChannels =
    channelChoices.find((count) => count >= highestUsed) || deviceChannels;
  const channelCount = Math.min(
    deviceChannels,
    Math.max(shownChannels || channelChoices[0], neededChannels)
  );
  const anyStereo = bees.some((bee) => bee.stereo);

  return (
    <Z3Page
      pageHeader={
        <PageHeader
          title="Routing"
          buttons={
            channelChoices.length > 1 ? (
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="small" style={{ opacity: 0.8 }}>
                  Channels
                </Typography>
                {channelChoices.map((count) => (
                  <Choice
                    key={count}
                    active={channelCount === count}
                    disabled={count < neededChannels}
                    onClick={() => setShownChannels(count)}
                  >
                    {count}
                  </Choice>
                ))}
              </Box>
            ) : undefined
          }
        />
      }
    >
      <Box display="flex" flexDirection="column" gap={2}>
        {/* only there when something has to be done about the sound device:
            install it (unless another device was chosen on purpose) or
            update it */}
        {soundDevice.supported &&
          ((!soundDevice.installed && !soundDevice.otherDevice) ||
            (soundDevice.installed && !soundDevice.upToDate)) && (
            <SoundDevice soundDevice={soundDevice} onChanged={refresh} />
          )}
        {bees.length === 0 ? (
          <Typography variant="small">
            There are no bees in use. Choose them on the Swarm page.
          </Typography>
        ) : (
          <>
            <Box
              display="flex"
              alignItems="center"
              flexWrap="wrap"
              columnGap={3}
              rowGap={1}
            >
              <Box display="flex" alignItems="center" gap={0.5}>
                <Tooltip title="A mono bee plays its channel on both sides. A stereo bee has a left and a right. You can also click mono or stereo on a bee. A bee that is streaming is silent for a few seconds while it switches.">
                  <Typography variant="small" style={{ opacity: 0.8 }}>
                    All bees
                  </Typography>
                </Tooltip>
                <Choice
                  active={!anyStereo}
                  onClick={() =>
                    change(
                      bees.map((bee) => ({ beeId: bee.id, stereo: false }))
                    )
                  }
                >
                  mono
                </Choice>
                <Choice
                  active={bees.every((bee) => bee.stereo)}
                  onClick={() =>
                    change(bees.map((bee) => ({ beeId: bee.id, stereo: true })))
                  }
                >
                  stereo
                </Choice>
              </Box>
              <Box display="flex" alignItems="center" gap={0.5}>
                <Typography variant="small" style={{ opacity: 0.8 }}>
                  Cords
                </Typography>
                <Tooltip title="The first bee gets channel 1, the next bee the next free channel. A stereo bee takes two. When the channels run out, the bees that are left get no cord.">
                  <Choice active={false} onClick={plugInOrder}>
                    in order
                  </Choice>
                </Tooltip>
                {!anyStereo && (
                  <Tooltip title="Channel 7 goes to bee 7, and so on. A bee whose channel the device does not have gets no cord.">
                    <Choice
                      active={false}
                      onClick={() =>
                        change(
                          bees.map((bee) => ({
                            beeId: bee.id,
                            channel: existing(bee.id),
                          }))
                        )
                      }
                    >
                      by number
                    </Choice>
                  </Tooltip>
                )}
                <Tooltip title="Pull every cord out: no bee gets sound from your audio software.">
                  <Choice
                    active={false}
                    onClick={() =>
                      change(
                        bees.map((bee) => ({
                          beeId: bee.id,
                          channel: null,
                          channelRight: null,
                        }))
                      )
                    }
                  >
                    unplug all
                  </Choice>
                </Tooltip>
              </Box>
            </Box>
            <Typography variant="extraSmall" style={{ opacity: 0.7 }}>
              Drag from a channel to a bee. Click the dot on a cord to unplug
              it. The bars show the sound from your audio software; triggered
              sounds play on the bees and do not show here.
            </Typography>
            {missingChannels && (
              <Typography
                variant="small"
                style={{ color: "var(--orange-status)" }}
              >
                {`"${
                  soundDevice.inUse ? soundDevice.name : soundDevice.otherDevice
                }" has ${deviceChannels} channel${
                  deviceChannels === 1 ? "" : "s"
                }. Some bees were plugged into a higher channel and get no sound now. Their cords come back when you choose a device that has those channels.`}
              </Typography>
            )}
            <PatchBay
              deviceName={
                soundDevice.inUse
                  ? soundDevice.name
                  : soundDevice.otherDevice || "Channels"
              }
              channelCount={channelCount}
              availableChannels={deviceChannels}
              bees={bees}
              levels={levels}
              onLevels={onLevels}
              onChange={(routingChange) => change([routingChange])}
            />
          </>
        )}
      </Box>
    </Z3Page>
  );
};
