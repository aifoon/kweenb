import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { Flex } from "@components/.";
import { Z3Navigation, Z3Content, Z3Sidebar } from "./layout";
import { AudioRoutes, BeeSettings, ManageBees } from "./pages";
import { Tools } from "./pages/Tools";

export const App = () => (
  <Router>
    <Z3Navigation />
    <Flex margin="75px 0 0 0" height="calc(100vh - 75px)">
      <Z3Sidebar />
      <Z3Content>
        <Routes>
          <Route path="/" element={<ManageBees />} />
          <Route path="/manage-bees" element={<ManageBees />} />
          <Route path="/bee-settings" element={<BeeSettings />} />
          <Route path="/audio-routes" element={<AudioRoutes />} />
          <Route path="/tools" element={<Tools />} />
        </Routes>
      </Z3Content>
    </Flex>
  </Router>
);
