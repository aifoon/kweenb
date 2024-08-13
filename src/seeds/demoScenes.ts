import { AudioScene, ChannelType } from "../shared/interfaces";

export const demoScenes: AudioScene[] = [
  {
    name: "Scene 1",
    foundOnBees: [
      {
        id: 28,
        ipAddress: "192.168.0.221",
        isOnline: true,
        isApiOn: true,
        name: "beeTim",
        status: {
          isJackRunning: true,
          isJacktripRunning: true,
        },
        channelType: ChannelType.MONO,
        networkPerformanceMs: 1,
        isActive: true,
        channel1: 1,
      },
    ],
    oscAddress: "/scene/1",
  },
  {
    name: "Scene 2",
    foundOnBees: [
      {
        id: 1,
        ipAddress: "192",
        isOnline: true,
        isApiOn: true,
        name: "Bee 1",
        status: {
          isJackRunning: true,
          isJacktripRunning: true,
        },
        channelType: ChannelType.MONO,
        networkPerformanceMs: 1,
        isActive: true,
        channel1: 1,
      },
      {
        id: 2,
        ipAddress: "192",
        isOnline: true,
        isApiOn: true,
        name: "Bee 2",
        status: {
          isJackRunning: true,
          isJacktripRunning: true,
        },
        channelType: ChannelType.MONO,
        networkPerformanceMs: 1,
        isActive: true,
        channel1: 1,
      },
    ],
    oscAddress: "/scene/1",
  },
  {
    name: "Scene 3",
    foundOnBees: [
      {
        id: 1,
        ipAddress: "192",
        isOnline: true,
        isApiOn: true,
        name: "Bee 1",
        status: {
          isJackRunning: true,
          isJacktripRunning: true,
        },
        channelType: ChannelType.MONO,
        networkPerformanceMs: 1,
        isActive: true,
        channel1: 1,
      },
      {
        id: 2,
        ipAddress: "192",
        isOnline: true,
        isApiOn: true,
        name: "Bee 2",
        status: {
          isJackRunning: true,
          isJacktripRunning: true,
        },
        channelType: ChannelType.MONO,
        networkPerformanceMs: 1,
        isActive: true,
        channel1: 1,
      },
    ],
    oscAddress: "/scene/3",
  },
];
