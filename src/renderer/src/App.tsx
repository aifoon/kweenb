import { MemoryRouter as Router, Routes, Route } from "react-router-dom";
import { DesignSystem } from "./pages";

export const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<DesignSystem />} />
    </Routes>
  </Router>
);
