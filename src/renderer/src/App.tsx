import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { Flex } from "@components/.";
import {
  // DesignSystem,
  AudioRoutes,
  BeeSettings,
  ManageBees,
  BeeConfig,
} from "./pages";
import { Z3Navigation, Z3Sidebar } from "./layout";
import { Tools } from "./pages/Tools";

export const App = () => (
  <Router>
    {/* <Routes>
      <Route path="/" element={<DesignSystem />} />
    </Routes> */}
    <Z3Navigation />
    <Flex margin="var(--navigationHeight) 0 0 0">
      <Z3Sidebar />
      <Routes>
        <Route path="/" element={<ManageBees />} />
        <Route path="/manage-bees" element={<ManageBees />} />
        <Route path="/manage-bees/:id" element={<BeeConfig />} />
        <Route path="/bee-settings" element={<BeeSettings />} />
        <Route path="/audio-routes" element={<AudioRoutes />} />
        <Route path="/tools" element={<Tools />} />
      </Routes>
    </Flex>
  </Router>
);
