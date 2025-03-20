import React, { useEffect, useState } from "react";
import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import theme from "@components/theme";
import { Box, ThemeProvider } from "@mui/material";
import { Z3Page } from "@components/Layout";
import { Z3Navigation } from "./components/Layout/Z3Navigation";
import { SingleBees } from "./components/Pages/SingleBees";
import { SceneTrigger } from "./components/Pages/SceneTrigger";
import { MasterSlider } from "./components/MasterSlider";
import { HydrationHelper } from "./components/HydrationHelper";
import { SocketConnectionManager } from "./components/SocketConnectionManager";

function App() {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <Z3Navigation />
        <Box margin="var(--navigationHeight) 0 0 0">
          <HydrationHelper>
            <>
              <SocketConnectionManager />
              <Z3Page sidebar={false}>
                <Routes>
                  <Route path="/" element={<SingleBees />} />
                  <Route path="/scene-trigger" element={<SceneTrigger />} />
                </Routes>
              </Z3Page>
            </>
          </HydrationHelper>
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;
