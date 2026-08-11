// ==========================================
// App — Root Component with Router
// ==========================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ElectionProvider } from './context/ElectionContext';
import SetupPage from './pages/SetupPage';
import DashboardPage from './pages/DashboardPage';
import BallotsPage from './pages/BallotsPage';
import BallotsAllPage from './pages/BallotsAllPage';
import ResultsPage from './pages/ResultsPage';

export default function App() {
  return (
    <ElectionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/setup" replace />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/ballots" element={<BallotsPage />} />
          <Route path="/ballots/all" element={<BallotsAllPage />} />
          <Route path="/results" element={<ResultsPage />} />
        </Routes>
      </BrowserRouter>
    </ElectionProvider>
  );
}
