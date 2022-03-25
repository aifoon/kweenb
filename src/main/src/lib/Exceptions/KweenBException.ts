/**
 * A wrapper around error handling
 */

import { IError } from "@shared/interfaces";
import { KweenBGlobal } from "../../kweenb";

export class KweenBException extends Error {
  public error: IError;

  constructor(error: IError, throwInRenderer = false) {
    super(error.message);
    this.error = error;
    if (throwInRenderer) this.throwInRenderer();
  }

  private throwInRenderer() {
    KweenBGlobal.kweenb.throwError(this.error);
  }
}
