import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Configuration from './pages/Configuration.jsx';
import Tickets from './pages/Tickets.jsx';
import TicketDetail from './pages/TicketDetail.jsx';
import Convocations from './pages/Convocations.jsx';
import PatchNotes from './pages/PatchNotes.jsx';
import Sanctions from './pages/Sanctions.jsx';
import Securite from './pages/Securite.jsx';

const GUEST = { id: 'local', username: 'Admin', globalName: 'Admin local', avatar: null };

export default function App() {
  const [user] = useState(GUEST);

  return (
    <Layout user={user}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/configuration" element={<Configuration />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/tickets/:id" element={<TicketDetail />} />
        <Route path="/convocations" element={<Convocations />} />
        <Route path="/patchnotes" element={<PatchNotes />} />
        <Route path="/sanctions" element={<Sanctions />} />
        <Route path="/securite" element={<Securite />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
