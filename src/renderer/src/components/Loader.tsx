import { CircularProgress } from "@mui/material";
import React from "react";
import styled from "styled-components";

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

export const Loader = () => (
  <LoaderWrapper>
    <CircularProgress />
  </LoaderWrapper>
);
