import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Accueil from './pages/Accueil.jsx';
import Lore from './pages/Lore.jsx';
import Reglement from './pages/Reglement.jsx';
import Boutique from './pages/Boutique.jsx';
import Faq from './pages/Faq.jsx';
import Stream from './pages/Stream.jsx';
import Panier from './pages/Panier.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/lore" element={<Lore />} />
        <Route path="/reglement" element={<Reglement />} />
        <Route path="/boutique" element={<Boutique />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/stream" element={<Stream />} />
        <Route path="/panier" element={<Panier />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
