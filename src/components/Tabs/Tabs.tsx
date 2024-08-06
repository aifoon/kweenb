import styled from "styled-components";
import { Tabs as MaterialUiTabs } from "@mui/material";

export const Tabs = styled(MaterialUiTabs)`
  & .MuiTab-root {
    border-bottom: 2px solid var(--primary-200);
    color: var(--white);
  }

  & .MuiButtonBase-root.Mui-selected {
    color: white;
  }

  & .MuiTabs-indicator {
    background-color: white;
  }
`;
