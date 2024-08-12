import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { Flex } from "@components/.";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider } from "@mui/material/styles";
import { AppContextProvider } from "./context/AppContextProvider";
import {
  DesignSystem,
  Settings,
  ManageBees,
  BeeConfig,
  BeePoller,
} from "./components";
import { Z3Navigation, Z3Sidebar } from "./components/Layout";
import { Tools } from "./components/Tools/Tools";
import theme from "@components/theme";
import { Positioning } from "./components/Positioning/Positioning";
import { PositioningModules } from "./components/Positioning/PositioningModules/PositioningModules";
import { Audio } from "./components/Audio/Audio";

const startDesignSystem = false;

export const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <DndProvider backend={HTML5Backend}>
          {startDesignSystem && (
            <Routes>
              <Route path="/" element={<DesignSystem />} />
            </Routes>
          )}
          {!startDesignSystem && (
            <AppContextProvider>
              <BeePoller>
                <Z3Navigation />
                <Flex margin="var(--navigationHeight) 0 0 0">
                  <Z3Sidebar />
                  <Routes>
                    <Route path="/" element={<ManageBees />} />
                    <Route path="/manage-bees" element={<ManageBees />} />
                    <Route path="/swarm/:id" element={<BeeConfig />} />
                    <Route path="/audio" element={<Audio />} />
                    <Route path="/positioning" element={<Positioning />}>
                      <Route
                        path="volumes/:tab"
                        element={<PositioningModules />}
                      />
                    </Route>
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/tools" element={<Tools />} />
                  </Routes>
                </Flex>
              </BeePoller>
            </AppContextProvider>
          )}
        </DndProvider>
      </ThemeProvider>
    </Router>
  );
};
