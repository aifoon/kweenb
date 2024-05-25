import { IBee } from "@shared/interfaces";
import { create } from "zustand";
import { useBeeStore } from "./useBeeStore";
import { PDAudioParam } from "@shared/enums";

type AudioMixerState = {
  masterVolume: number;
  masterMid: number;
  masterHigh: number;
  masterLow: number;
  beeAudioParams: {
    bee: IBee;
    low: number;
    high: number;
    mid: number;
    volume: number;
  }[];
};

type AudioMixerAction = {
  setMasterVolume: (value: number) => void;
  setMasterMid: (value: number) => void;
  setMasterHigh: (value: number) => void;
  setMasterLow: (value: number) => void;
  setBeeVolume: (bee: IBee, value: number) => void;
  setBeeMid: (bee: IBee, value: number) => void;
  setBeeHigh: (bee: IBee, value: number) => void;
  setBeeLow: (bee: IBee, value: number) => void;
};

export const useAudioMixerStore = create<AudioMixerState & AudioMixerAction>(
  (set) => {
    return {
      masterVolume: 50,
      masterMid: 1,
      masterHigh: 1,
      masterLow: 1,
      beeAudioParams: [],
      setBeeAudioParams: (
        value: {
          bee: IBee;
          low: number;
          high: number;
          mid: number;
          volume: number;
        }[]
      ) => set({ beeAudioParams: value }),
      setBeeVolume: (bee: IBee, value: number) =>
        set((state) => {
          window.kweenb.methods.setAudioParam(bee, PDAudioParam.VOLUME, value);
          return {
            beeAudioParams: state.beeAudioParams.map((b) => {
              if (b.bee.id === bee.id) {
                return {
                  ...b,
                  volume: value,
                };
              }
              return b;
            }),
          };
        }),
      setBeeMid: (bee: IBee, value: number) =>
        set((state) => {
          window.kweenb.methods.setAudioParam(bee, PDAudioParam.MID, value);
          return {
            beeAudioParams: state.beeAudioParams.map((b) => {
              if (b.bee.id === bee.id) {
                return {
                  ...b,
                  mid: value,
                };
              }
              return b;
            }),
          };
        }),
      setBeeLow: (bee: IBee, value: number) =>
        set((state) => {
          window.kweenb.methods.setAudioParam(bee, PDAudioParam.LOW, value);
          return {
            beeAudioParams: state.beeAudioParams.map((b) => {
              if (b.bee.id === bee.id) {
                return {
                  ...b,
                  low: value,
                };
              }
              return b;
            }),
          };
        }),
      setBeeHigh: (bee: IBee, value: number) =>
        set((state) => {
          window.kweenb.methods.setAudioParam(bee, PDAudioParam.HIGH, value);
          return {
            beeAudioParams: state.beeAudioParams.map((b) => {
              if (b.bee.id === bee.id) {
                return {
                  ...b,
                  high: value,
                };
              }
              return b;
            }),
          };
        }),
      setMasterVolume: (value) => {
        set((state) => {
          window.kweenb.methods.setAudioParamForAllBees(
            PDAudioParam.VOLUME,
            value
          );
          return {
            masterVolume: value,
            beeAudioParams: state.beeAudioParams.map((b) => ({
              ...b,
              volume: value,
            })),
          };
        });
      },
      setMasterMid: (value) => {
        window.kweenb.methods.setAudioParamForAllBees(PDAudioParam.MID, value);
        set((state) => {
          return {
            masterMid: value,
            beeAudioParams: state.beeAudioParams.map((b) => ({
              ...b,
              mid: value,
            })),
          };
        });
      },
      setMasterLow: (value) => {
        window.kweenb.methods.setAudioParamForAllBees(PDAudioParam.LOW, value);
        set((state) => {
          return {
            masterLow: value,
            beeAudioParams: state.beeAudioParams.map((b) => ({
              ...b,
              low: value,
            })),
          };
        });
      },
      setMasterHigh: (value) => {
        window.kweenb.methods.setAudioParamForAllBees(PDAudioParam.HIGH, value);
        set((state) => {
          return {
            masterHigh: value,
            beeAudioParams: state.beeAudioParams.map((b) => ({
              ...b,
              high: value,
            })),
          };
        });
      },
    };
  }
);
