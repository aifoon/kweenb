import { Card, CardVerticalStack } from "@components/Cards";
import React from "react";
import { Formik, Form } from "formik";
import { TextField, SelectField, SwitchField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { useSetting } from "@renderer/src/hooks";
import { Utils } from "@shared/utils";
import { Grid } from "@mui/material";
import {
  validBitrates,
  validBufferSizes,
  validSampleRates,
} from "@renderer/src/consts";
import { IKweenBSettings, IKweenBAudioSettings } from "@shared/interfaces";

interface BeeSettingsKweenBProps {
  kweenbSettings: IKweenBSettings;
  kweenbAudioSettings: IKweenBAudioSettings;
}

export const SettingsKweenB = ({
  kweenbSettings,
  kweenbAudioSettings,
}: BeeSettingsKweenBProps) => {
  const { updateSetting } = useSetting();
  const handleOnValidatedBlurAndChange = (e: any) => {
    updateSetting({
      key: `kweenb${Utils.capitalize(e.target.name)}`,
      value: e.target.value,
    });
  };
  return (
    <Formik
      initialValues={{
        mqttBroker: kweenbSettings.mqttBroker,
        jackDevice: kweenbAudioSettings.jack.device,
        jackInputChannels: kweenbAudioSettings.jack.inputChannels,
        jackOutputChannels: kweenbAudioSettings.jack.outputChannels,
        jackBufferSize: kweenbAudioSettings.jack.bufferSize,
        jackSampleRate: kweenbAudioSettings.jack.sampleRate,
        jackPeriods: kweenbAudioSettings.jack.periods,
        jacktripBitRate: kweenbAudioSettings.jacktrip.bitRate,
        jacktripChannels: kweenbAudioSettings.jacktrip.channels,
        jacktripRedundancy: kweenbAudioSettings.jacktrip.redundancy,
        jacktripQueueBufferLength:
          kweenbAudioSettings.jacktrip.queueBufferLength,
        jacktripRealtimePriority: kweenbAudioSettings.jacktrip.realtimePriority,
        jacktripSendChannels: kweenbAudioSettings.jacktrip.sendChannels,
        jacktripReceiveChannels: kweenbAudioSettings.jacktrip.receiveChannels,
      }}
      validationSchema={Yup.object().shape({
        mqttBroker: Yup.string(),
        jackDevice: Yup.string(),
        jackBufferSize: Yup.number()
          .required("The buffer size is required")
          .isValidBufferSize(),
        jackInputChannels: Yup.number()
          .min(
            -1,
            "The minimum amount of input channels is 1, -1 for no channels"
          )
          .max(99, "The maximum amount of channels is 99")
          .required("The amount of channels is required"),
        jackOutputChannels: Yup.number()
          .min(
            -1,
            "The minimum amount of output channels is 1, -1 for no channels"
          )
          .max(99, "The maximum amount of channels is 99")
          .required("The amount of channels is required"),
        jackSampleRate: Yup.number()
          .required("The sample rate is required")
          .isValidSampleRate(),
        jackPeriods: Yup.number().required("The periods/buffer is required"),
        jacktripBitRate: Yup.number()
          .required("The bitrate is required")
          .isValidBitRate(),
        jacktripChannels: Yup.number()
          .min(-1, "The minimum amount of channels is 1, -1 for no channels")
          .max(99, "The maximum amount of channels is 99")
          .required("The amount of channels is required"),
        jacktripRedundancy: Yup.number()
          .min(0, "The redundancy is min 0")
          .max(99, "The redundancy is max 99")
          .required("The redundancy is required"),
        jacktripQueueBufferLength: Yup.number()
          .min(0, "The queued buffer size is min 0")
          .max(99, "The queued buffer size is max 99")
          .required("The queued buffer size is required"),
        jacktripSendChannels: Yup.number()
          .min(1, "The amount of send channels is min 1")
          .max(20, "The amount of send channels is max 20")
          .required("The amount of send channels is required"),
        jacktripReceiveChannels: Yup.number()
          .min(1, "The amount of receive channels is min 1")
          .max(20, "The amount of receive channels is max 20")
          .required("The amount of receive channels is required"),
      })}
      onSubmit={() => {}}
    >
      {() => (
        <Form>
          <Grid container spacing={5}>
            <Grid item xs={12} md={6}>
              <CardVerticalStack>
                <Card title="Jack">
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Device"
                    type="text"
                    labelWidth="150px"
                    name="jackDevice"
                    placeholder="e.g. hw:Device"
                  />
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Input Channels"
                    type="number"
                    min={-1}
                    max={20}
                    labelWidth="150px"
                    name="jackInputChannels"
                    placeholder="e.g. 2"
                  />
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Output Channels"
                    type="number"
                    min={-1}
                    max={20}
                    labelWidth="150px"
                    name="jackOutputChannels"
                    placeholder="e.g. 2"
                  />
                  <SelectField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Sample rate"
                    labelWidth="150px"
                    selectItems={validSampleRates.map((value) => ({
                      label: value.toString(),
                      value,
                    }))}
                    name="jackSampleRate"
                  />
                  <SelectField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Buffersize"
                    labelWidth="150px"
                    selectItems={validBufferSizes.map((value) => ({
                      label: value.toString(),
                      value,
                    }))}
                    name="jackBufferSize"
                  />
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Periods/Buffer"
                    type="number"
                    min={0}
                    max={20}
                    labelWidth="150px"
                    name="jackPeriods"
                    placeholder="e.g. 2"
                  />
                </Card>
                <Card title="MQTT">
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="MQTT Broker"
                    type="text"
                    labelWidth="150px"
                    min={1}
                    max={99}
                    name="mqttBroker"
                    placeholder="e.g. mqtt://localhost:1883"
                  />
                </Card>
              </CardVerticalStack>
            </Grid>
            <Grid item xs={12} md={6}>
              <CardVerticalStack>
                <Card title="Jacktrip">
                  <SwitchField
                    onValidatedChange={(e) => {
                      handleOnValidatedBlurAndChange(e);
                    }}
                    name="jacktripRealtimePriority"
                    label="Realtime priority"
                    labelWidth="150px"
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                  />
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Channels"
                    type="number"
                    labelWidth="150px"
                    min={1}
                    max={99}
                    name="jacktripChannels"
                    placeholder="e.g. 2"
                  />
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Send Channels"
                    type="number"
                    min={1}
                    max={20}
                    labelWidth="150px"
                    name="jacktripSendChannels"
                    placeholder="e.g. 1"
                  />
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Receive Channels"
                    type="number"
                    min={1}
                    max={20}
                    labelWidth="150px"
                    name="jacktripReceiveChannels"
                    placeholder="e.g. 1"
                  />
                  <SelectField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Bitrate"
                    labelWidth="150px"
                    selectItems={validBitrates.map((value) => ({
                      label: value.toString(),
                      value,
                    }))}
                    name="jacktripBitRate"
                  />
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Queue Buffer Length"
                    type="number"
                    min={0}
                    max={99}
                    labelWidth="150px"
                    name="jacktripQueueBufferLength"
                    placeholder="e.g. 4"
                  />
                  <TextField
                    onValidatedBlur={handleOnValidatedBlurAndChange}
                    orientation={InputFieldOrientation.Horizontal}
                    size={InputFieldSize.Small}
                    label="Redundancy"
                    type="number"
                    min={0}
                    max={99}
                    labelWidth="150px"
                    name="jacktripRedundancy"
                    placeholder="e.g. 1"
                  />
                </Card>
              </CardVerticalStack>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
