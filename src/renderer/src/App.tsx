import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { Flex } from "@components/.";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ThemeProvider } from "@mui/material/styles";
import { AppContextProvider } from "./context/AppContextProvider";
import { DesignSystem, Settings, ManageBees, BeeConfig } from "./pages";
import { Z3Navigation, Z3Sidebar } from "./layout";
import { Tools } from "./pages/Tools/Tools";
import theme from "./theme";
import { Positioning } from "./pages/Positioning/Positioning";
import { PositioningVolumes } from "./pages/Positioning/PositioningVolumes/PositioningVolumes";

const startDesignSystem = false;

export const App = () => (
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
            <Z3Navigation />
            <Flex margin="var(--navigationHeight) 0 0 0">
              <Z3Sidebar />
              <Routes>
                <Route path="/" element={<ManageBees />} />
                <Route path="/manage-bees" element={<ManageBees />} />
                <Route path="/swarm/:id" element={<BeeConfig />} />
                <Route path="/positioning" element={<Positioning />}>
                  <Route path='volumes/:tab' element={<PositioningVolumes />} />
                </Route>
                <Route path="/settings" element={<Settings />} />
                <Route path="/tools" element={<Tools />} />
              </Routes>
            </Flex>
          </AppContextProvider>
        )}
      </DndProvider>
    </ThemeProvider>
  </Router>
);
