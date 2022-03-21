/**
 * A wrapper around error handling
 */

import { IError } from "@shared/interfaces";
import { KweenBGlobal } from "../../kweenb";

export class KweenBException extends Error {
  private _error: IError;

  constructor(error: IError, throwInRenderer = false) {
    super(error.message);
    this._error = error;
    if (throwInRenderer) this.throwInRenderer();
  }

  private throwInRenderer() {
    KweenBGlobal.kweenb.throwError(this._error);
  }
}
