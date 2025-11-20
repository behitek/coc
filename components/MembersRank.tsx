import React, { useState, useMemo } from 'react';
import { ClanMember, PlayerDetails } from '../types';
import { getPlayerDetails } from '../services/cocService';
import { ArrowUpDown, Zap, Users, Search, Loader2, Shield, Sword, Skull, Heart, Star } from 'lucide-react';

interface MembersRankProps {
  members: ClanMember[];
  onMemberClick: (tag: string) => void;
}

type SortField = 'rank' | 'name' | 'role' | 'townHall' | 'trophies' | 'donations' | 'activityScore' | 'attackWins' | 'warStars';

export const MembersRank: React.FC<MembersRankProps> = ({ members, onMemberClick }) => {
  const [sortField, setSortField] = useState<SortField>('activityScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Deep Scan State
  const [extendedData, setExtendedData] = useState<Record<string, PlayerDetails>>({});
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [hasScanned, setHasScanned] = useState(false);

  const runDeepScan = async () => {
    setIsScanning(true);
    setScanProgress(0);
    const total = members.length;
    let completed = 0;
    const newExtendedData: Record<string, PlayerDetails> = { ...extendedData };

    // Process in chunks of 5 to be gentle on the API
    const chunkSize = 5;
    for (let i = 0; i < total; i += chunkSize) {
        const chunk = members.slice(i, i + chunkSize);
        const promises = chunk.map(async (member) => {
            try {
                const details = await getPlayerDetails(member.tag);
                return { tag: member.tag, details };
            } catch (e) {
                console.warn(`Failed to fetch ${member.name}`, e);
                return null;
            }
        });

        const results = await Promise.all(promises);
        results.forEach(r => {
            if (r) newExtendedData[r.tag] = r.details;
        });

        completed += chunk.length;
        setScanProgress(Math.min(100, Math.round((completed / total) * 100)));
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    setExtendedData(newExtendedData);
    setIsScanning(false);
    setHasScanned(true);
  };

  // Calculate Activity Score
  const calculateScore = (m: ClanMember) => {
    const details = extendedData[m.tag];
    const don = m.donations || 0;
    const rec = m.donationsReceived || 0;
    const trophies = m.trophies || 0;

    if (details) {
        // Advanced Formula:
        // Attack Wins are huge indicators of activity (worth 25 points each)
        // War Stars show long term value (worth 5 points each)
        // Donations (1 point each)
        const attacks = details.attackWins || 0;
        const stars = details.warStars || 0;
        return (attacks * 25) + don + (stars * 5);
    }

    // Basic Formula (fallback):
    return don + (rec * 0.5) + (trophies * 0.2);
  };

  const getSmartLabels = (m: ClanMember) => {
      const details = extendedData[m.tag];
      if (!details) return null;

      const tags = [];
      
      // Activity Tags
      if (details.attackWins > 100) tags.push({ label: 'Grinder', color: 'bg-red-900 text-red-200 border-red-700', icon: <Sword size={10} className="mr-1"/> });
      else if (details.attackWins > 40) tags.push({ label: 'Active', color: 'bg-green-900 text-green-200 border-green-700', icon: <Zap size={10} className="mr-1"/> });
      
      // Donation Tags
      const ratio = m.donations / (m.donationsReceived || 1);
      if (m.donations > 2000) tags.push({ label: 'Gifter', color: 'bg-coc-gold text-black border-yellow-600', icon: <Heart size={10} className="mr-1"/> });
      if (ratio < 0.2 && m.donationsReceived > 500) tags.push({ label: 'Leech', color: 'bg-slate-700 text-slate-300 border-slate-500', icon: <Skull size={10} className="mr-1"/> });

      // War Tags
      if (details.warStars > 1500) tags.push({ label: 'Legend', color: 'bg-purple-900 text-purple-200 border-purple-700', icon: <Star size={10} className="mr-1"/> });
      else if (details.warStars > 800) tags.push({ label: 'Vet', color: 'bg-blue-900 text-blue-200 border-blue-700', icon: <Shield size={10} className="mr-1"/> });

      return tags;
  };

  const sortedMembers = useMemo(() => {
    const list = Array.isArray(members) ? members : [];
    return [...list].sort((a, b) => {
      let valA: number | string = '';
      let valB: number | string = '';

      const detailsA = extendedData[a.tag];
      const detailsB = extendedData[b.tag];

      switch (sortField) {
        case 'rank':
          valA = a.clanRank;
          valB = b.clanRank;
          return sortDirection === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'role':
          const roleOrder = { leader: 4, coLeader: 3, admin: 2, member: 1 };
          valA = roleOrder[a.role as keyof typeof roleOrder] || 0;
          valB = roleOrder[b.role as keyof typeof roleOrder] || 0;
          break;
        case 'townHall':
          valA = detailsA?.townHallLevel || 0;
          valB = detailsB?.townHallLevel || 0;
          break;
        case 'trophies':
          valA = detailsA?.trophies || a.trophies || 0;
          valB = detailsB?.trophies || b.trophies || 0;
          break;
        case 'donations':
          valA = a.donations || 0;
          valB = b.donations || 0;
          break;
        case 'attackWins':
          valA = detailsA?.attackWins || 0;
          valB = detailsB?.attackWins || 0;
          break;
        case 'warStars':
          valA = detailsA?.warStars || 0;
          valB = detailsB?.warStars || 0;
          break;
        case 'activityScore':
          valA = calculateScore(a);
          valB = calculateScore(b);
          break;
      }

      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      return sortDirection === 'asc' ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });
  }, [members, sortField, sortDirection, extendedData]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => (
    <span className={`inline-block ml-1 ${sortField === field ? 'text-coc-gold' : 'text-slate-600'}`}>
      <ArrowUpDown size={14} />
    </span>
  );

  const getRoleBadge = (role: string) => {
    switch(role) {
        case 'leader': return <span className="px-2 py-1 text-xs font-bold bg-red-900 text-red-200 rounded border border-red-700">Leader</span>;
        case 'coLeader': return <span className="px-2 py-1 text-xs font-bold bg-coc-dark text-slate-300 rounded border border-slate-600">Co-Lead</span>;
        case 'admin': return <span className="px-2 py-1 text-xs font-bold bg-slate-700 text-slate-300 rounded border border-slate-600">Elder</span>;
        default: return <span className="px-2 py-1 text-xs text-slate-500">Member</span>;
    }
  };

  return (
    <div className="space-y-4">
        {/* Header / Deep Scan Control */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
            <div className="mb-4 sm:mb-0">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <Users className="mr-2 text-coc-gold" /> Member Ranking
                </h2>
                <div className="text-xs text-slate-400 italic mt-1">
                    {hasScanned 
                        ? "Enhanced Score: (Wins × 25) + Don + (Stars × 5)" 
                        : "Basic Score: Don + (Rec ÷ 2) + (Trophies ÷ 5)"}
                </div>
            </div>
            
            <div className="flex items-center space-x-4 w-full sm:w-auto">
                {isScanning ? (
                    <div className="flex-1 sm:flex-none flex items-center bg-slate-900 px-4 py-2 rounded-lg border border-slate-600">
                        <Loader2 className="animate-spin text-coc-gold mr-3" size={18} />
                        <div className="w-32">
                            <div className="flex justify-between text-xs text-slate-300 mb-1">
                                <span>Scanning...</span>
                                <span>{scanProgress}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-coc-gold transition-all duration-300" style={{ width: `${scanProgress}%` }}></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button 
                        onClick={runDeepScan}
                        disabled={hasScanned}
                        className={`flex items-center px-4 py-2 rounded-lg font-bold text-sm transition-all shadow-md ${
                            hasScanned 
                            ? 'bg-slate-700 text-slate-400 cursor-default' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        }`}
                    >
                        {hasScanned ? 'Scan Complete' : 'Run Deep Scan'}
                        {!hasScanned && <Search size={16} className="ml-2" />}
                    </button>
                )}
            </div>
        </div>

        {/* Table */}
        <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-sm uppercase tracking-wider">
                <th className="p-4 cursor-pointer hover:bg-slate-800 whitespace-nowrap" onClick={() => handleSort('rank')}># <SortIcon field="rank" /></th>
                <th className="p-4 cursor-pointer hover:bg-slate-800" onClick={() => handleSort('name')}>Name <SortIcon field="name" /></th>
                <th className="p-4 cursor-pointer hover:bg-slate-800" onClick={() => handleSort('role')}>Role <SortIcon field="role" /></th>
                <th className="p-4 cursor-pointer hover:bg-slate-800 text-right whitespace-nowrap" onClick={() => handleSort('trophies')}>Trophies <SortIcon field="trophies" /></th>

                {hasScanned && (
                    <>
                        <th className="p-4 cursor-pointer hover:bg-slate-800 text-center whitespace-nowrap" onClick={() => handleSort('townHall')}>Town Hall <SortIcon field="townHall" /></th>
                        <th className="p-4 cursor-pointer hover:bg-slate-800 text-right whitespace-nowrap" onClick={() => handleSort('attackWins')}>Wins <SortIcon field="attackWins" /></th>
                        <th className="p-4 cursor-pointer hover:bg-slate-800 text-right whitespace-nowrap" onClick={() => handleSort('warStars')}>War ★ <SortIcon field="warStars" /></th>
                    </>
                )}

                <th className="p-4 cursor-pointer hover:bg-slate-800 text-right" onClick={() => handleSort('donations')}>Donated <SortIcon field="donations" /></th>
                <th className="p-4 cursor-pointer hover:bg-slate-800 text-right whitespace-nowrap" onClick={() => handleSort('activityScore')}>
                    <div className="flex items-center justify-end">
                        Act. Score <Zap size={14} className="ml-1 text-coc-gold" />
                    </div>
                </th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
                {sortedMembers.map((member, index) => {
                    const details = extendedData[member.tag];
                    const tags = getSmartLabels(member);
                    
                    return (
                    <tr 
                        key={member.tag} 
                        className="hover:bg-slate-700/50 transition-colors cursor-pointer"
                        onClick={() => onMemberClick(member.tag)}
                    >
                        <td className="p-4 font-mono text-slate-500">#{member.clanRank}</td>
                        <td className="p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 mr-3 flex-shrink-0 flex items-center justify-center relative">
                                {details?.townHallLevel ? (
                                    <>
                                     <img 
                                        src={`https://www.clash.ninja/images/entities/1_${details.townHallLevel}.png`} 
                                        alt={`TH${details.townHallLevel}`}
                                        className="w-full h-full object-contain drop-shadow-md"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-black/80 text-white text-[8px] font-bold px-1 rounded border border-slate-600">
                                        {details.townHallLevel}
                                    </div>
                                    </>
                                ) : (
                                    member.league?.iconUrls ? (
                                        <img src={member.league.iconUrls.tiny} alt={member.league.name} className="w-8 h-8" />
                                    ) : (
                                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center text-xs text-slate-500 font-bold">?</div>
                                    )
                                )}
                            </div>
                            
                            <div>
                                <div className="font-bold text-white hover:text-coc-gold text-base">{member.name}</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    <span className="text-[10px] text-slate-500 bg-slate-900 px-1 rounded mr-1">{member.tag}</span>
                                    {tags && tags.map((t, i) => (
                                        <span key={i} className={`text-[9px] px-1.5 py-0.5 rounded border flex items-center ${t.color}`}>
                                            {t.icon} {t.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                        </td>
                        <td className="p-4">{getRoleBadge(member.role)}</td>
                        <td className="p-4 text-right font-mono text-white">
                            <span className="text-purple-400">{member.trophies.toLocaleString()}</span>
                        </td>

                        {hasScanned && (
                            <>
                                <td className="p-4 text-center font-mono text-white">
                                    {details ? <span className="text-coc-orange font-bold">TH{details.townHallLevel}</span> : <span className="text-slate-600">--</span>}
                                </td>
                                <td className="p-4 text-right font-mono text-white">
                                    {details ? <span className="text-green-400">{details.attackWins}</span> : <span className="text-slate-600">--</span>}
                                </td>
                                <td className="p-4 text-right font-mono text-white">
                                    {details ? <span className="text-coc-gold">{details.warStars}</span> : <span className="text-slate-600">--</span>}
                                </td>
                            </>
                        )}

                        <td className="p-4 text-right">
                            <div className="text-green-400 font-mono font-bold">{member.donations}</div>
                            <div className="text-xs text-slate-500">Rec: {member.donationsReceived}</div>
                        </td>
                        <td className="p-4 text-right">
                            <div className={`inline-block px-3 py-1 rounded-full font-mono font-bold border ${
                                hasScanned ? 'bg-indigo-900/50 border-indigo-500/50 text-indigo-300' : 'bg-slate-900 border-slate-700 text-coc-orange'
                            }`}>
                                {Math.floor(calculateScore(member)).toLocaleString()}
                            </div>
                        </td>
                    </tr>
                )})}
            </tbody>
            </table>
        </div>
        </div>
    </div>
  );
};