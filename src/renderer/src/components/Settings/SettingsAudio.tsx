import { Card, CardVerticalStack } from "@components/Cards";
import React from "react";
import { Formik, Form } from "formik";
import { TextField, SelectField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { useAppStore, useSetting } from "@renderer/src/hooks";
import { Grid } from "@mui/material";
import {
  validBitrates,
  validBufferSizes,
  validSampleRates,
} from "@renderer/src/consts";
import { ISettings } from "@shared/interfaces";

interface SettingsAudioProps {
  settings: ISettings;
}

/**
 * The name of each field and the setting it is stored in
 */
const settingKeys: Record<string, string> = {
  sampleRate: "audioSampleRate",
  bufferSize: "audioBufferSize",
  bitRate: "audioBitRate",
  networkBuffer: "beeJacktripQueueBufferLength",
  soundCardPeriods: "beeJackPeriods",
  device: "kweenbJackDevice",
  redundancy: "kweenbJacktripRedundancy",
};

const fieldProps = {
  orientation: InputFieldOrientation.Horizontal,
  size: InputFieldSize.Small,
  labelWidth: "210px",
};

export const SettingsAudio = ({ settings }: SettingsAudioProps) => {
  const { updateSetting } = useSetting();
  const currentLatency = useAppStore((state) => state.currentLatency);
  const updateCurrentLatency = useAppStore(
    (state) => state.updateCurrentLatency
  );

  const { beeAudioSettings, kweenBAudioSettings } = settings;

  const handleOnValidatedBlurAndChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    await updateSetting({
      key: settingKeys[e.target.name],
      value: e.target.value,
    });

    // the latency is calculated from these settings
    updateCurrentLatency();
  };

  return (
    <Formik
      initialValues={{
        sampleRate: beeAudioSettings.jack.sampleRate,
        bufferSize: beeAudioSettings.jack.bufferSize,
        bitRate: beeAudioSettings.jacktrip.bitRate,
        networkBuffer: beeAudioSettings.jacktrip.queueBufferLength,
        soundCardPeriods: beeAudioSettings.jack.periods,
        device: kweenBAudioSettings.jack.device,
        redundancy: kweenBAudioSettings.jacktrip.redundancy,
      }}
      validationSchema={Yup.object().shape({
        sampleRate: Yup.number()
          .required("The sample rate is required")
          .isValidSampleRate(),
        bufferSize: Yup.number()
          .required("The block size is required")
          .isValidBufferSize(),
        bitRate: Yup.number()
          .required("The bit depth is required")
          .isValidBitRate(),
        networkBuffer: Yup.number()
          .min(5, "The network buffer is min 5 ms")
          .max(500, "The network buffer is max 500 ms")
          .required("The network buffer is required"),
        soundCardPeriods: Yup.number()
          .min(2, "The sound card buffer is min 2 blocks")
          .max(8, "The sound card buffer is max 8 blocks")
          .required("The sound card buffer is required"),
        device: Yup.string(),
        redundancy: Yup.number()
          .min(1, "Every packet is sent at least once")
          .max(5, "The redundancy is max 5")
          .required("The redundancy is required"),
      })}
      onSubmit={() => {}}
    >
      {() => (
        <Form>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <CardVerticalStack>
                <Card title="Stream">
                  <SelectField
                    {...fieldProps}
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    label="Sample rate"
                    selectItems={validSampleRates.map((value) => ({
                      label: value.toString(),
                      value,
                    }))}
                    name="sampleRate"
                  />
                  <SelectField
                    {...fieldProps}
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    label="Block size"
                    selectItems={validBufferSizes.map((value) => ({
                      label: value.toString(),
                      value,
                    }))}
                    name="bufferSize"
                  />
                  <SelectField
                    {...fieldProps}
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    label="Bit depth"
                    selectItems={validBitrates.map((value) => ({
                      label: value.toString(),
                      value,
                    }))}
                    name="bitRate"
                  />
                </Card>
                <Card title="Bees" headerSubtitle={`${currentLatency}ms`}>
                  <TextField
                    {...fieldProps}
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    label="Network buffer (ms)"
                    type="number"
                    min={5}
                    max={500}
                    name="networkBuffer"
                    placeholder="e.g. 30"
                  />
                  <TextField
                    {...fieldProps}
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    label="Sound card buffer (blocks)"
                    type="number"
                    min={2}
                    max={8}
                    name="soundCardPeriods"
                    placeholder="e.g. 3"
                  />
                </Card>
              </CardVerticalStack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card title="KweenB">
                <TextField
                  {...fieldProps}
                  onValidatedBlur={handleOnValidatedBlurAndChange}
                  label="Audio device"
                  type="text"
                  name="device"
                  placeholder="empty = system default"
                />
                <TextField
                  {...fieldProps}
                  onValidatedBlur={handleOnValidatedBlurAndChange}
                  label="Send each packet (times)"
                  type="number"
                  min={1}
                  max={5}
                  name="redundancy"
                  placeholder="e.g. 1"
                />
              </Card>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
