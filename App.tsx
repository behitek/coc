import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Menu, X, Swords } from 'lucide-react';
import { getClanDetails, getClanWarLog } from './services/cocService';
import { Dashboard } from './components/Dashboard';
import { MembersRank } from './components/MembersRank';
import { CurrentWarPage } from './components/CurrentWar';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { PlayerModal } from './components/PlayerModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ClanDetails, WarLogEntry } from './types';

// Default Clan Tag from user request
const DEFAULT_CLAN_TAG = '#2G9YRCRV2';

const App: React.FC = () => {
  const [clanData, setClanData] = useState<ClanDetails | null>(null);
  const [warLog, setWarLog] = useState<WarLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlayerTag, setSelectedPlayerTag] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clan, log] = await Promise.all([
          getClanDetails(DEFAULT_CLAN_TAG),
          getClanWarLog(DEFAULT_CLAN_TAG)
        ]);
        setClanData(clan);
        setWarLog(log);
      } catch (err: any) {
        setError(err.message || "Failed to load clan data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => (
    <NavLink 
      to={to} 
      onClick={() => setMobileMenuOpen(false)}
      className={({ isActive }) => 
        `flex items-center px-4 py-3 rounded-lg transition-all ${
          isActive 
            ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-lg' 
            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
        }`
      }
    >
      {icon}
      <span className="ml-3">{label}</span>
    </NavLink>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !clanData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white p-4 text-center">
        <div>
            <h1 className="text-3xl font-bold text-red-500 mb-4">Connection Failed</h1>
            <p className="text-slate-400">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-6 px-6 py-2 bg-slate-700 rounded hover:bg-slate-600">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen flex flex-col md:flex-row bg-slate-950 text-slate-200 font-sans">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-slate-900 p-4 flex justify-between items-center border-b border-slate-800">
            <div className="font-bold text-coc-gold text-xl tracking-tighter">CLANRANK AI</div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className={`
            fixed inset-y-0 left-0 transform ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
            md:relative md:translate-x-0 transition duration-200 ease-in-out
            w-64 bg-slate-900 border-r border-slate-800 z-30 flex flex-col p-4
        `}>
          <div className="hidden md:block mb-8 mt-2 px-2">
            <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-coc-gold to-coc-orange tracking-tight">
              CLANRANK AI
            </h1>
            <p className="text-xs text-slate-500 mt-1">Leader Assistant Tool</p>
          </div>

          <div className="space-y-2 flex-1">
            <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
            <NavItem to="/war" icon={<Swords size={20} />} label="Current War" />
            <NavItem to="/members" icon={<Users size={20} />} label="Rankings" />
          </div>

          <div className="mt-auto pt-4 border-t border-slate-800">
             <div className="flex items-center px-4 py-2">
                <img src={clanData.badgeUrls.small} alt="Badge" className="w-8 h-8 mr-3" />
                <div>
                    <div className="text-sm font-bold text-white">{clanData.name}</div>
                    <div className="text-xs text-slate-500">{clanData.tag}</div>
                </div>
             </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto bg-gradient-to-br from-slate-900 to-slate-950 pb-24 md:pb-8">
          <div className="max-w-6xl mx-auto space-y-8">
            <Routes>
              <Route path="/" element={
                <>
                  <Dashboard clan={clanData} warLog={warLog} />
                  <GeminiAdvisor clan={clanData} warLog={warLog} />
                </>
              } />
              <Route path="/war" element={
                <CurrentWarPage clanTag={clanData.tag} onMemberClick={setSelectedPlayerTag} />
              } />
              <Route path="/members" element={
                <MembersRank members={clanData.memberList} onMemberClick={setSelectedPlayerTag} />
              } />
            </Routes>
          </div>
        </main>

        {/* Player Detail Modal */}
        {selectedPlayerTag && (
            <PlayerModal tag={selectedPlayerTag} onClose={() => setSelectedPlayerTag(null)} />
        )}
      </div>
    </Router>
  );
};

export default App;