import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { PhaserGame } from './components/PhaserGame';
import AdminPage from './admin/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PhaserGame />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;