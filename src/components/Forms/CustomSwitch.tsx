import { Switch } from "@mui/material";
import styled from "styled-components";

export const CustomSwitch = styled(({ ...switchProps }) => (
  <Switch {...switchProps} />
))`
  & .MuiSwitch-track {
    background-color: var(--primary-400);
  }

  & .Mui-checked + .MuiSwitch-track {
    background-color: var(
      --primary-400
    ) !important; // Hacky, but material UI has too much control
  }

  & .MuiSwitch-thumb {
    background-color: var(--primary-50);
  }

  & .Mui-checked .MuiSwitch-thumb {
    background-color: var(--primary-100);
  }
`;
