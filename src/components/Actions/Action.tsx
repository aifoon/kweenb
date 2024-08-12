import { Button, ButtonUse, ButtonType, ButtonSize } from "../Buttons";
import { useEffect, useState } from "react";
import { TableCell, TableRow } from "@mui/material";

type ActionProps = {
  description: string;
  output?: string;
  actionButtonLabel?: string;
  outputColor?: string;
  onRunClick?: () => void;
};

export const Action = ({
  onRunClick,
  description = "",
  actionButtonLabel = "Run",
  output = "",
  outputColor = "var(--textColor)",
}: ActionProps) => {
  const [currentOutput, setCurrentOutput] = useState(output);
  const [currentOutputColor, setCurrentOutputColor] = useState(outputColor);

  useEffect(() => {
    setCurrentOutput(output);
  }, [output]);

  useEffect(() => {
    setCurrentOutputColor(outputColor);
  }, [outputColor]);

  return (
    <TableRow>
      <TableCell>{description}</TableCell>
      <TableCell style={{ color: currentOutputColor }}>
        {currentOutput}
      </TableCell>
      <TableCell>
        <Button
          style={{ width: "100%" }}
          buttonSize={ButtonSize.Small}
          buttonType={ButtonType.Primary}
          buttonUse={ButtonUse.Dark}
          onClick={() => {
            if (onRunClick) onRunClick();
          }}
        >
          {actionButtonLabel}
        </Button>
      </TableCell>
    </TableRow>
  );
};
