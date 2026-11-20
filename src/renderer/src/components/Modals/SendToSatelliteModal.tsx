import { BaseModal } from "@components/Modals/BaseModal";
import { useCallback, useEffect, useState } from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import { Button, ButtonSize, ButtonType, ButtonUse } from "@components/Buttons";
import { ConfirmModalFooter } from "@components/Modals/ConfirmModal";
import { ISatellite, ISatelliteSyncResult } from "@shared/interfaces";

type SendToSatelliteModalProps = {
  open: boolean;
  onClose: () => void;
};

const named = (names: string[]) => names.map((name) => `“${name}”`).join(", ");

/**
 * What a sync did, in words
 */
const ResultInWords = ({ result }: { result: ISatelliteSyncResult }) => (
  <Box display="flex" flexDirection="column" gap={1}>
    <Typography>
      {result.satelliteName} now has what KweenB has: {result.sent.bees}{" "}
      {result.sent.bees === 1 ? "bee" : "bees"}, {result.sent.scenes}{" "}
      {result.sent.scenes === 1 ? "scene" : "scenes"} and{" "}
      {result.sent.compositions}{" "}
      {result.sent.compositions === 1 ? "composition" : "compositions"}.
    </Typography>
    {result.added.length > 0 && (
      <Typography variant="small">
        Made on the satellite and added to KweenB: {named(result.added)}.
      </Typography>
    )}
    {result.updated.length > 0 && (
      <Typography variant="small">
        Changed on the satellite and updated in KweenB: {named(result.updated)}.
      </Typography>
    )}
    {result.keptBoth.length > 0 && (
      <Typography variant="small">
        Changed on the satellite and in KweenB, so both are kept:{" "}
        {named(result.keptBoth)}. The ones of the satellite have “(satellite)”
        behind their name.
      </Typography>
    )}
    {result.deleted.length > 0 && (
      <Typography variant="small">
        Deleted on the satellite and removed from KweenB:{" "}
        {named(result.deleted)}.
      </Typography>
    )}
    {result.keptDespiteDelete.length > 0 && (
      <Typography variant="small">
        Deleted on the satellite but changed in KweenB since, so kept:{" "}
        {named(result.keptDespiteDelete)}.
      </Typography>
    )}
    {result.emptyPlaces > 0 && (
      <Typography variant="small">
        {result.emptyPlaces === 1
          ? "1 place in those compositions is empty: its scene is not on that bee any more."
          : `${result.emptyPlaces} places in those compositions are empty: their scenes are not on those bees any more.`}
      </Typography>
    )}
  </Box>
);

/**
 * Bring a satellite in line with KweenB: what was made on the satellite
 * comes to KweenB first, then everything of KweenB goes to the satellite
 */
export const SendToSatelliteModal = ({
  open,
  onClose,
}: SendToSatelliteModalProps) => {
  const [satellites, setSatellites] = useState<ISatellite[] | null>(null);
  const [sendingTo, setSendingTo] = useState<ISatellite | null>(null);
  const [result, setResult] = useState<ISatelliteSyncResult | null>(null);
  const [message, setMessage] = useState("");

  const look = useCallback(async () => {
    setSatellites(null);
    setMessage("");
    try {
      setSatellites(await window.kweenb.methods.findSatellites());
    } catch (e) {
      setSatellites([]);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setSendingTo(null);
    look();
  }, [open, look]);

  const send = async (satellite: ISatellite) => {
    setSendingTo(satellite);
    setMessage("");
    try {
      const answer = await window.kweenb.methods.sendToSatellite(satellite);
      if (answer.success && answer.result) setResult(answer.result);
      else setMessage(answer.message || "Sending failed. Try again.");
    } catch (e) {
      setMessage("Sending failed. Try again.");
    } finally {
      setSendingTo(null);
    }
  };

  const busy = sendingTo !== null;

  return (
    <BaseModal
      title="Send to satellite"
      open={open}
      onClose={busy ? () => {} : onClose}
      disableBackdropClick={busy}
      showCloseButton={!busy}
    >
      <Box display="flex" flexDirection="column" gap={2}>
        {result && <ResultInWords result={result} />}

        {!result && (
          <Typography variant="small">
            The satellite gets the bees, scenes and compositions of KweenB, in
            place of what it has now. What was done to the compositions on the
            satellite comes to KweenB first: new and changed ones are taken
            over, and ones that were deleted there are deleted here.
          </Typography>
        )}

        {!result && satellites === null && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="small">Looking for a satellite…</Typography>
            <LinearProgress />
          </Box>
        )}

        {!result && satellites !== null && satellites.length === 0 && (
          <Typography>
            No satellite was found. Check that it is switched on and connected
            to the same network as this computer.
          </Typography>
        )}

        {!result && busy && (
          <Box display="flex" flexDirection="column" gap={1}>
            <Typography variant="small">
              Sending to {sendingTo?.name}…
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {message && <Typography color="error">{message}</Typography>}
      </Box>
      <ConfirmModalFooter>
        <Button
          type="button"
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.TertiaryWhite}
          onClick={onClose}
          disabled={busy}
        >
          Close
        </Button>
        {!result && satellites !== null && satellites.length === 0 && (
          <Button
            type="button"
            buttonSize={ButtonSize.Small}
            buttonType={ButtonType.Primary}
            buttonUse={ButtonUse.Normal}
            onClick={look}
          >
            Look again
          </Button>
        )}
        {!result &&
          !busy &&
          (satellites || []).map((satellite) => (
            <Button
              key={`${satellite.host}:${satellite.port}`}
              type="button"
              buttonSize={ButtonSize.Small}
              buttonType={ButtonType.Primary}
              buttonUse={ButtonUse.Normal}
              onClick={() => send(satellite)}
            >
              {`Send to ${satellite.name}`}
            </Button>
          ))}
      </ConfirmModalFooter>
    </BaseModal>
  );
};
