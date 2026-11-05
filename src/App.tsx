import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { PhaserGame } from './components/PhaserGame';
import AdminPage from './admin/AdminPage';
import LoginPage from './admin/LoginPage';
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhaserGame />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;