import { Box, Button, CircularProgress, Typography } from "@mui/material";
import React from "react";
import styled from "styled-components";

interface ILoaderProps {
  text?: string;
  cancelButton?: boolean;
  onCancel?: () => void;
}

const LoaderWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  background-color: rgba(0, 0, 0, 0.5);
`;

export const Loader = ({
  text = "",
  cancelButton = false,
  onCancel = () => {},
}: ILoaderProps) => (
  <LoaderWrapper>
    <Box
      display={"flex"}
      justifyItems={"center"}
      flexDirection={"column"}
      alignItems={"center"}
      gap={4}
    >
      <CircularProgress />
      {text && <Typography>{text}</Typography>}
      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={onCancel}
        disabled={!cancelButton}
      >
        Cancel
      </Button>
    </Box>
  </LoaderWrapper>
);
