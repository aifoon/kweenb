// yup-extended.ts
import * as yup from "yup";
import { AnyObject, Maybe } from "yup/lib/types";

/**
 * Adding a function to validate an IP Address
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

declare module "yup" {
  interface StringSchema<
    TType extends Maybe<string> = string | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType
  > extends yup.BaseSchema<TType, TContext, TOut> {
    isValidIpAddress(message: string): StringSchema<TType, TContext>;
  }
}

export default yup;
