// yup-extended.ts
import * as yup from "yup";
import { AnyObject, Maybe } from "yup/lib/types";
import { validBitrates, validBufferSizes, validSampleRates } from "./consts";

/**
 * isValidIpAddress()
 * Adding a method to validate an IP Address
 */
yup.addMethod<yup.StringSchema>(
  yup.string,
  "isValidIpAddress",
  function isValidIpAddress(message: string) {
    return this.matches(/(^(\d{1,3}\.){3}(\d{1,3})$)/, {
      message,
      excludeEmptyString: true,
    }).test("ip", message, (value) =>
      value === undefined || value.trim() === ""
        ? true
        : value.split(".").find((i) => parseInt(i, 10) > 255) === undefined
    );
  }
);

/**
 * isValidBitRate()
 * Adding a method to validate a bitRate
 */
yup.addMethod<yup.NumberSchema>(
  yup.number,
  "isValidBitRate",
  function isValidBitRate() {
    return this.test(
      "test_valid_bitrates",
      "The bitrate must be 8, 16, 24 or 32",
      (value) => {
        if (value) return validBitrates.includes(value);
        return false;
      }
    );
  }
);

/**
 * isValidBufferSize()
 * Adding a method to validate a buffersize
 */
yup.addMethod<yup.NumberSchema>(
  yup.number,
  "isValidBufferSize",
  function isValidBufferSize() {
    return this.test(
      "test_valid_buffersize",
      "The buffersize must be 16, 32, 64, 128, 256, 512, 1024, 2048 or 4096",
      (value) => {
        if (value) return validBufferSizes.includes(value);
        return false;
      }
    );
  }
);

/**
 * Adding a method to validate a sampleRate
 * isValidSampleRate()
 */
yup.addMethod<yup.NumberSchema>(
  yup.number,
  "isValidSampleRate",
  function isValidBuffersize() {
    return this.test(
      "test_valid_samplerate",
      "The buffersize must be 22050, 32000, 44100, 48000, 88200, 96000 & 192000;",
      (value) => {
        if (value) return validSampleRates.includes(value);
        return false;
      }
    );
  }
);

declare module "yup" {
  interface StringSchema<
    TType extends Maybe<string> = string | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType
  > extends yup.BaseSchema<TType, TContext, TOut> {
    isValidIpAddress(message: string): StringSchema<TType, TContext>;
  }

  interface NumberSchema<
    TType extends Maybe<number> = number | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType
  > extends yup.BaseSchema<TType, TContext, TOut> {
    isValidBitRate(): NumberSchema<TType, TContext>;
    isValidBufferSize(): NumberSchema<TType, TContext>;
    isValidSampleRate(): NumberSchema<TType, TContext>;
  }
}

export default yup;
