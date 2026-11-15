import { BaseModal, BaseModalProps } from "@components/Modals/BaseModal";
import { useCallback, useEffect, useState } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { IAdoptFromNetworkResult } from "@shared/interfaces";
import { beeNameInWords } from "../Modals/SaveSoundsModal";

type AdoptFromNetworkModalProps = Pick<BaseModalProps, "open" | "onClose">;

const beesInWords = (bees: { name: string }[]): string =>
  bees.map(({ name }) => beeNameInWords(name)).join(", ");

/**
 * Looks for the bees that are switched on in the network and adds the ones
 * KweenB does not know yet. Looking starts as soon as the modal opens.
 */
export const AdoptFromNetworkModal = ({
  open,
  onClose,
}: AdoptFromNetworkModalProps) => {
  // null while looking
  const [result, setResult] = useState<IAdoptFromNetworkResult | null>(null);
  const [failed, setFailed] = useState(false);

  const look = useCallback(() => {
    let left = false;
    setResult(null);
    setFailed(false);
    window.kweenb.methods
      .adoptFromNetwork()
      .then((found) => {
        if (!left) setResult(found);
      })
      .catch(() => {
        if (!left) setFailed(true);
      });
    return () => {
      left = true;
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    return look();
  }, [open, look]);

  const nothing =
    result &&
    result.added.length === 0 &&
    result.known.length === 0 &&
    result.withoutNumber === 0;

  return (
    <BaseModal
      title="Adopt bees from the network"
      disableBackdropClick
      showCloseButton={false}
      open={open}
      onClose={onClose}
    >
      <Box display={"flex"} flexDirection={"column"} gap={1}>
        {!result && !failed && (
          <>
            <Typography variant="small">
              Looking for bees that are switched on…
            </Typography>
            <LinearProgress />
          </>
        )}
        {failed && (
          <Typography style={{ color: "var(--red-status)" }}>
            Looking for bees did not work. Try again.
          </Typography>
        )}
        {result && (
          <>
            {result.added.length > 0 && (
              <Typography>
                {result.added.length === 1
                  ? `${beesInWords(result.added)} was found and added.`
                  : `${
                      result.added.length
                    } bees were found and added: ${beesInWords(result.added)}.`}
              </Typography>
            )}
            {result.added.length === 0 && result.known.length > 0 && (
              <Typography>
                No new bees. Every bee that was found is in KweenB already.
              </Typography>
            )}
            {nothing && (
              <>
                <Typography>No bees were found.</Typography>
                <Typography variant="small">
                  Check that the bees are switched on and that this computer is
                  on their network (the Wi-Fi or the cable of the swarm). A bee
                  needs about half a minute after it is switched on.
                </Typography>
              </>
            )}
            {result.known.length > 0 && result.added.length > 0 && (
              <Typography variant="small">
                {`Already in KweenB: ${beesInWords(result.known)}.`}
              </Typography>
            )}
            {result.withoutNumber > 0 && (
              <Typography variant="small">
                {result.withoutNumber === 1
                  ? "One speaker without a number was found too. Give it a number with File → New Speaker."
                  : `${result.withoutNumber} speakers without a number were found too. Give them a number with File → New Speaker.`}
              </Typography>
            )}
            {result.doubleNumbers.length > 0 && (
              <Typography
                variant="small"
                style={{ color: "var(--orange-status)" }}
              >
                {`More than one speaker says it is number ${result.doubleNumbers.join(
                  ", "
                )}. Only one of them was taken; switch the others off and give them another number.`}
              </Typography>
            )}
          </>
        )}
      </Box>
      <ConfirmModalFooter>
        {(result || failed) && (
          <Button
            type="button"
            onClick={() => look()}
            buttonType={ButtonType.TertiaryWhite}
            buttonSize={ButtonSize.Small}
          >
            Look again
          </Button>
        )}
        <Button
          type="button"
          onClick={onClose}
          buttonUse={ButtonUse.Normal}
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
        >
          Close
        </Button>
      </ConfirmModalFooter>
    </BaseModal>
  );
};
