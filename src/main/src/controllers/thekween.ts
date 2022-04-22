import { ITheKween } from "@shared/interfaces";
import { KweenBException } from "../lib/Exceptions/KweenBException";
import theKweenHelpers from "../lib/KweenB/TheKweenHelpers";

/**
 * Fetching the kween
 * @returns an object shaped like an ITheKween
 */
export const fetchTheKween = async (): Promise<ITheKween> => {
  try {
    return await theKweenHelpers.getTheKween();
  } catch (e: any) {
    throw new KweenBException(
      { where: "fetchTheKween()", message: e.message },
      true
    );
  }
};
