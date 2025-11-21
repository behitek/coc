import React, { useEffect, useState } from 'react';
import { ClanDetails, WarLogEntry } from '../types';
import { Trophy, Users, Shield, Sword, TrendingUp, ChevronDown, ChevronUp, ExternalLink, MessageCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface DashboardProps {
  clan: ClanDetails;
  warLog: WarLogEntry[];
}

const formatClashDate = (dateString: string) => {
  if (!dateString) return 'N/A';

  // Fix for Clash of Clans API date format: YYYYMMDDTHHmmss.000Z
  if (dateString.length === 20 && dateString.charAt(8) === 'T') {
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    const hour = dateString.substring(9, 11);
    const minute = dateString.substring(11, 13);
    const second = dateString.substring(13, 15);

    const isoDate = `${year}-${month}-${day}T${hour}:${minute}:${second}.000Z`;
    return new Date(isoDate).toLocaleDateString();
  }

  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; sub?: string }> = ({ title, value, icon, sub }) => (
  <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
      <div className="text-coc-gold">{icon}</div>
    </div>
    <div className="text-3xl font-bold text-white">{value}</div>
    {sub && <div className="text-xs text-slate-500 mt-2">{sub}</div>}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ clan, warLog }) => {
  const [winRate, setWinRate] = useState(0);
  const [expandedWarIndex, setExpandedWarIndex] = useState<number | null>(null);

  useEffect(() => {
    if (warLog && warLog.length > 0) {
      const wins = warLog.filter(w => w.result === 'win').length;
      setWinRate(Math.round((wins / warLog.length) * 100));
    }
  }, [warLog]);

  // Prepare data for donation chart (Top 5 donors)
  const donationData = (clan.memberList || [])
    .sort((a, b) => (b.donations || 0) - (a.donations || 0))
    .slice(0, 5)
    .map((m, index) => ({
      name: m.name,
      donations: m.donations || 0,
      rank: index + 1
    }));

  // Safe access for clan points to prevent crashes
  const clanPoints = typeof clan.clanPoints === 'number' ? clan.clanPoints.toLocaleString() : '0';
  const versusPoints = typeof clan.clanVersusPoints === 'number' ? clan.clanVersusPoints.toLocaleString() : undefined;

  return (
    <div className="space-y-6">
      {/* Header Section with Actions */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
        <div className="flex items-center space-x-4">
          <img src={clan.badgeUrls?.medium} alt={clan.name} className="w-20 h-20 drop-shadow-lg" />
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{clan.name}</h1>
            <p className="text-slate-400 font-mono">{clan.tag} • Level {clan.clanLevel}</p>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl">{clan.description}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <a
            href={`https://link.clashofclans.com/en?action=OpenClanProfile&tag=${clan.tag.replace('#', '')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center px-5 py-2.5 bg-coc-accent hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap group"
          >
            <ExternalLink size={18} className="mr-2 group-hover:scale-110 transition-transform" />
            View In-Game
          </a>
          <a
            href="https://zalo.me/g/wblyoe887" // Placeholder URL
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center px-5 py-2.5 bg-[#0068FF] hover:bg-[#005ce6] text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 whitespace-nowrap group"
          >
            <MessageCircle size={18} className="mr-2 group-hover:scale-110 transition-transform" />
            Join Zalo Chat
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Points"
          value={clanPoints}
          icon={<Trophy className="w-6 h-6" />}
          sub={versusPoints ? `Versus: ${versusPoints}` : undefined}
        />
        <StatCard
          title="Members"
          value={`${clan.members}/50`}
          icon={<Users className="w-6 h-6" />}
        />
        <StatCard
          title="War Streak"
          value={clan.warWinStreak}
          icon={<Sword className="w-6 h-6" />}
        />
        <StatCard
          title="Recent Win Rate"
          value={`${winRate}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          sub="Last visible wars"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Donors Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-coc-gold" /> Top Donors
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={donationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tick={{ fill: '#9ca3af' }} />
                <YAxis stroke="#9ca3af" fontSize={12} tick={{ fill: '#9ca3af' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#f3f4f6' }}
                  cursor={{ fill: 'transparent' }}
                />
                <Bar dataKey="donations" radius={[4, 4, 0, 0]}>
                  {donationData.map((entry, index) => {
                    // Distinct colors for Top 3 (Gold, Silver, Bronze)
                    let fill = '#4b5563'; // Default Slate-600
                    if (index === 0) fill = '#facc15'; // Gold
                    if (index === 1) fill = '#cbd5e1'; // Silver
                    if (index === 2) fill = '#d97706'; // Bronze (Amber-600)
                    return <Cell key={`cell-${index}`} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex justify-center mt-4 space-x-6 text-xs font-medium text-slate-400">
            <div className="flex items-center"><span className="w-3 h-3 bg-[#facc15] rounded-full mr-2"></span> 1st Place</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-[#cbd5e1] rounded-full mr-2"></span> 2nd Place</div>
            <div className="flex items-center"><span className="w-3 h-3 bg-[#d97706] rounded-full mr-2"></span> 3rd Place</div>
          </div>
        </div>

        {/* Recent War Log */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg overflow-hidden">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center">
            <Sword className="w-5 h-5 mr-2 text-red-500" /> War Log
          </h3>
          <div className="space-y-3">
            {warLog && warLog.slice(0, 10).map((war, idx) => (
              <div key={idx} className="bg-slate-900/50 rounded-lg border border-slate-700/50 overflow-hidden transition-all">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-800/50 transition-colors"
                  onClick={() => setExpandedWarIndex(expandedWarIndex === idx ? null : idx)}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-1.5 h-12 rounded-full ${war.result === 'win' ? 'bg-green-500' : war.result === 'lose' ? 'bg-red-500' : 'bg-slate-500'}`}></div>
                    <div>
                      <div className="font-semibold text-white text-sm">{war.opponent.name}</div>
                      <div className="text-xs text-slate-400">
                        {formatClashDate(war.endTime)} • {war.teamSize}v{war.teamSize}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right mr-2">
                      <div className="text-sm font-bold font-mono">
                        <span className="text-green-400">{war.clan.stars}</span>
                        <span className="text-slate-600 mx-1">-</span>
                        <span className="text-red-400">{war.opponent.stars}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 text-right">
                        {war.clan.destructionPercentage.toFixed(1)}%
                      </div>
                    </div>
                    {expandedWarIndex === idx ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedWarIndex === idx && (
                  <div className="bg-slate-950/50 p-4 border-t border-slate-800 text-sm animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase mb-1">My Clan (Lvl {war.clan.clanLevel})</div>
                        <div className="flex justify-between items-end">
                          <div className="text-green-400 font-bold text-lg">{war.clan.stars} <span className="text-xs text-slate-500 font-normal">Stars</span></div>
                          <div className="text-slate-300 text-xs">{war.clan.attacks} <span className="text-slate-600">/</span> {war.teamSize * 2} Atks</div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Destruction</span>
                            <span>{war.clan.destructionPercentage.toFixed(2)}%</span>
                          </div>
                          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: `${Math.min(war.clan.destructionPercentage, 100)}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-900/50 p-2 rounded border border-slate-800">
                        <div className="text-xs text-slate-500 uppercase mb-1">Opponent (Lvl {war.opponent.clanLevel})</div>
                        <div className="flex justify-between items-end">
                          <div className="text-red-400 font-bold text-lg">{war.opponent.stars} <span className="text-xs text-slate-500 font-normal">Stars</span></div>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Destruction</span>
                            <span>{war.opponent.destructionPercentage.toFixed(2)}%</span>
                          </div>
                          <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                            <div className="h-full bg-red-500" style={{ width: `${Math.min(war.opponent.destructionPercentage, 100)}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-800 pt-2">
                      <span>XP Earned: <span className="text-coc-gold">{war.clan.expEarned}</span></span>
                      <span>Result: <span className={`uppercase font-bold ${war.result === 'win' ? 'text-green-500' : 'text-red-500'}`}>{war.result || 'N/A'}</span></span>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {(!warLog || warLog.length === 0) && (
              <div className="text-slate-500 text-center py-8">War log is private or empty.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
