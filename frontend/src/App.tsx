import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

// Components
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CommandPalette } from './components/CommandPalette';
import { VoiceAssistantModal } from './voice/VoiceAssistantModal';
import { NotificationDrawer } from './components/NotificationDrawer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { PHCNetworkPage } from './pages/PHCNetworkPage';
import { PHCDetailPage } from './pages/PHCDetailPage';
import { InventoryPage } from './pages/InventoryPage';
import { ForecastPage } from './pages/ForecastPage';
import { AlertsPage } from './pages/AlertsPage';
import { RedistributionPage } from './pages/RedistributionPage';
import { AssistantPage } from './pages/AssistantPage';
import { SimulationPage } from './pages/SimulationPage';
import { FederatedLearningPage } from './pages/FederatedLearningPage';

import { Mic } from 'lucide-react';

export const App: React.FC = () => {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <LanguageProvider>
      <AuthProvider>
        <WebSocketProvider>
          <Router>
            <div className="min-h-screen bg-background-deep text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
              {/* Top Navigation */}
              <Navbar
                onOpenCommandPalette={() => setCmdOpen(true)}
                onOpenVoiceAssistant={() => setVoiceOpen(true)}
                onOpenNotifications={() => setNotifOpen(true)}
              />

              {/* Application Main Content View */}
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/phc-network" element={<PHCNetworkPage />} />
                  <Route path="/phc/:id" element={<PHCDetailPage />} />
                  <Route path="/inventory" element={<InventoryPage />} />
                  <Route path="/forecasts" element={<ForecastPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/redistribution" element={<RedistributionPage />} />
                  <Route path="/assistant" element={<AssistantPage />} />
                  <Route path="/simulation" element={<SimulationPage />} />
                  <Route path="/federated-learning" element={<FederatedLearningPage />} />
                </Routes>
              </main>

              {/* Floating Voice Assistant Action Button on Bottom Right */}
              <button
                onClick={() => setVoiceOpen(true)}
                className="fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold shadow-glow-cyan hover:scale-110 transition-all flex items-center justify-center group"
                title="Voice Assistant (Mic)"
              >
                <Mic className="h-6 w-6 group-hover:animate-pulse" />
                <span className="sr-only">Voice Interface</span>
              </button>

              {/* Modals and Drawers */}
              <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
              <VoiceAssistantModal isOpen={voiceOpen} onClose={() => setVoiceOpen(false)} />
              <NotificationDrawer isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

              {/* Command Center Footer */}
              <Footer />
            </div>
          </Router>
        </WebSocketProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
