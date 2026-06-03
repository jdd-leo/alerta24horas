import { Route, Routes } from 'react-router-dom';
import { MapDataProvider } from './map/MapDataContext';
import MapScreen from './pages/MapScreen';
import NewSignal from './pages/NewSignal';
import NewFlood from './pages/NewFlood';
import MySignals from './pages/MySignals';
import EmergencyContacts from './pages/EmergencyContacts';
import Overlay from './components/Overlay';

export default function App() {
  return (
    <MapDataProvider>
      {/* Mapa sempre montado: as telas abaixo apenas o sobrepõem (sem recarregar). */}
      <MapScreen />
      <Routes>
        <Route path="/" element={null} />
        <Route path="/sinalizacao/nova" element={<NewSignal />} />
        <Route path="/alagamento/novo" element={<NewFlood />} />
        <Route path="/minhas-sinalizacoes" element={<Overlay><MySignals /></Overlay>} />
        <Route path="/contatos" element={<Overlay><EmergencyContacts /></Overlay>} />
      </Routes>
    </MapDataProvider>
  );
}
