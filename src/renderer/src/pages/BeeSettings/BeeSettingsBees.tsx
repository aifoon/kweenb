import { Card } from "@components/Cards";
import React from "react";
import { Formik, Form } from "formik";
import { SelectField, TextField } from "@components/Forms";
import {
  InputFieldOrientation,
  InputFieldSize,
} from "@components/Forms/InputField";
import Yup from "@renderer/src/yup-ext";
import { BeeAudioSettings } from "@renderer/src/interfaces";
import {
  validBitrates,
  validBufferSizes,
  validSampleRates,
} from "@renderer/src/consts";
import { useKweenB } from "@renderer/src/hooks";
import { Utils } from "@renderer/src/lib/utils";

interface BeeSettingsBeesProps {
  beeAudioSettings: BeeAudioSettings;
}

export const BeeSettingsBees = ({ beeAudioSettings }: BeeSettingsBeesProps) => {
  const { updateSetting } = useKweenB();
  const handleOnValidatedBlurAndChange = (e: any) => {
    updateSetting({
      key: `bee${Utils.capitalize(e.target.name)}`,
      value: e.target.value,
    });
  };
  return (
    <Card title="Bee">
      <Formik
        initialValues={{
          channels: beeAudioSettings.channels,
          jackBufferSize: beeAudioSettings.jack.bufferSize,
          jackSampleRate: beeAudioSettings.jack.sampleRate,
          jacktripBitrate: beeAudioSettings.jacktrip.bitRate,
          jacktripRedundancy: beeAudioSettings.jacktrip.redundancy,
          jacktripQueueBufferLength:
            beeAudioSettings.jacktrip.queueBufferLength,
        }}
        validationSchema={Yup.object().shape({
          channels: Yup.number()
            .min(1, "The minimun amount of channels is 1")
            .max(99, "The maximum amount of channels is 99")
            .required("The amount of channels is required"),
          jackBufferSize: Yup.number()
            .required("The buffer size is required")
            .isValidBufferSize(),
          jackSampleRate: Yup.number()
            .required("The sample rate is required")
            .isValidSampleRate(),
          jacktripBitrate: Yup.number()
            .required("The bitrate is required")
            .isValidBitRate(),
          jacktripRedundancy: Yup.number()
            .min(0, "The redundancy is min 0")
            .max(99, "The redundancy is max 99")
            .required("The redundancy is required"),
          jacktripQueueBufferLength: Yup.number()
            .min(0, "The queued buffer size is min 0")
            .max(99, "The queued buffer size is max 99")
            .required("The redundancy is required"),
        })}
        onSubmit={() => {}}
      >
        {() => (
          <Form>
            <TextField
              onValidatedBlur={handleOnValidatedBlurAndChange}
              orientation={InputFieldOrientation.Horizontal}
              size={InputFieldSize.Small}
              label="Channels"
              type="number"
              labelWidth="150px"
              min={1}
              max={99}
              name="channels"
              placeholder="e.g. 2"
            />
            <h5>Jack</h5>
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
            <h5>Jacktrip</h5>
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
              name="jacktripBitrate"
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
          </Form>
        )}
      </Formik>
    </Card>
  );
};
