import React, { useEffect, useState } from 'react';
import { CurrentWar, WarMember } from '../types';
import { getClanCurrentWar } from '../services/cocService';
import { Timer, Swords, Skull, RefreshCw, Star } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface CurrentWarProps {
  clanTag: string;
  onMemberClick: (tag: string) => void;
}

// Helper to parse CoC API timestamps (YYYYMMDDTHHmmss.000Z)
const parseCoCTimestamp = (timestamp: string): Date => {
  if (!timestamp) return new Date();
  
  // If strictly ISO (has hyphens), parse directly
  if (timestamp.includes('-') && timestamp.includes(':')) {
    return new Date(timestamp);
  }

  // Parse YYYYMMDDTHHmmss.000Z
  const year = timestamp.slice(0, 4);
  const month = timestamp.slice(4, 6);
  const day = timestamp.slice(6, 8);
  const hour = timestamp.slice(9, 11);
  const min = timestamp.slice(11, 13);
  const sec = timestamp.slice(13, 15);
  
  // Construct valid ISO string: YYYY-MM-DDTHH:mm:ss.000Z
  return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}.000Z`);
};

interface MemberCardProps {
  member: WarMember;
  opponentMembers?: WarMember[];
  isOpponent?: boolean;
  onMemberClick: (tag: string) => void;
}

const MemberCard: React.FC<MemberCardProps> = ({ member, opponentMembers, isOpponent, onMemberClick }) => {
  const getAttackInfo = (attackIndex: number) => {
    if (!member.attacks || !member.attacks[attackIndex]) return null;
    const attack = member.attacks[attackIndex];
    
    // Find defender to get their map position (ID)
    const defender = opponentMembers?.find(m => m.tag === attack.defenderTag);
    
    return {
      targetId: defender ? defender.mapPosition : '?',
      stars: attack.stars,
      percent: attack.destructionPercentage
    };
  };

  const attack1 = getAttackInfo(0);
  const attack2 = getAttackInfo(1);

  const AttackBadge = ({ info, label }: { info: any, label: string }) => {
    if (!info) return (
       <div className="flex justify-between items-center bg-slate-900/50 px-2 py-1 rounded text-xs text-slate-500">
          <span>{label}</span>
          <span>--</span>
       </div>
    );

    const isPerfect = info.stars === 3;
    const starColor = isPerfect ? 'text-coc-gold' : 'text-slate-300';
    const percentColor = info.percent === 100 ? 'text-green-400' : 'text-slate-400';

    // Special styling for perfect attacks
    const bgClass = isPerfect
      ? 'bg-gradient-to-r from-yellow-900/40 to-amber-900/40 border-coc-gold shadow-lg shadow-yellow-900/30'
      : 'bg-slate-900 border-slate-700';

    return (
      <div className={`flex justify-between items-center px-2 py-1 rounded text-xs border-2 transition-all ${bgClass}`}>
         <div className="flex items-center space-x-2">
            <span className="text-slate-500 font-mono font-bold">#{info.targetId}</span>
            <span className={`font-bold ${starColor} flex items-center`}>
               {info.stars} <Star size={8} className="ml-0.5 fill-current" />
               {isPerfect && <span className="ml-1 text-[8px] text-coc-gold font-black">PERFECT</span>}
            </span>
         </div>
         <div className={percentColor}>{info.percent}%</div>
      </div>
    );
  };

  const thImageUrl = `https://www.clash.ninja/images/entities/1_${member.townhallLevel}.png`;

  return (
    <div className={`relative flex items-center bg-slate-800 border rounded-lg p-2 shadow-sm hover:shadow-md transition-all ${isOpponent ? 'border-red-900/30' : 'border-slate-700'}`}>
      
      {/* Rank & Info */}
      <div className="flex items-center w-1/3 min-w-[140px]">
        {/* Map Position & TH Image */}
        <div className="relative mr-3 w-10 h-10 flex-shrink-0">
            <img 
              src={thImageUrl} 
              alt={`TH${member.townhallLevel}`}
              className="w-full h-full object-contain drop-shadow-md"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
            />
            <div className="absolute -top-1 -left-1 w-4 h-4 flex items-center justify-center bg-black/80 text-white text-[10px] font-bold rounded-full border border-slate-600 font-mono shadow-sm">
                {member.mapPosition}
            </div>
            {/* Fallback visual if image fails to load or for extra clarity */}
            <div className="absolute -bottom-1 -right-1 w-fit px-1 bg-black/60 text-white text-[8px] font-bold rounded border border-slate-700 backdrop-blur-sm">
                TH{member.townhallLevel}
            </div>
        </div>

        <div className="overflow-hidden">
           <button 
             onClick={() => onMemberClick(member.tag)}
             className={`font-bold text-sm truncate hover:underline text-left block w-full ${isOpponent ? 'text-red-200 hover:text-red-100' : 'text-white hover:text-coc-gold'}`}
           >
             {member.name}
           </button>
           <div className="text-[10px] text-slate-500 truncate">
             {member.tag}
           </div>
        </div>
      </div>

      {/* Attacks Section */}
      <div className="flex-1 px-2 space-y-1">
          <AttackBadge info={attack1} label="Atk 1" />
          <AttackBadge info={attack2} label="Atk 2" />
      </div>

      {/* Defense Info */}
      <div className="w-16 text-right pl-2 border-l border-slate-700 ml-2">
         <div className="text-[10px] text-slate-500 uppercase text-center mb-0.5">Def</div>
         <div className="flex flex-col items-center justify-center">
            {member.opponentAttacks > 0 ? (
                <span className="text-xs font-bold text-white bg-slate-700 px-1.5 rounded">
                    {member.opponentAttacks} <span className="font-normal text-slate-400 text-[9px]">hit</span>
                </span>
            ) : (
                <span className="text-xs text-slate-600">-</span>
            )}
            
            {member.bestOpponentAttack && (
                <div className="flex items-center mt-1 text-xs">
                   <span className={`${member.bestOpponentAttack.stars === 3 ? 'text-red-400' : 'text-slate-300'}`}>
                     {member.bestOpponentAttack.stars}★
                   </span>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

export const CurrentWarPage: React.FC<CurrentWarProps> = ({ clanTag, onMemberClick }) => {
  const [war, setWar] = useState<CurrentWar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState<string>('');
  const [timerLabel, setTimerLabel] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setTick] = useState(0); // Force re-render for time ago updates

  useEffect(() => {
    const fetchWar = async (isBackgroundRefresh = false) => {
      try {
        if (isBackgroundRefresh) {
          setIsRefreshing(true);
        }
        const data = await getClanCurrentWar(clanTag);
        setWar(data);
        setLastUpdated(new Date());
      } catch (err) {
        setError('Failed to load war data.');
      } finally {
        setLoading(false);
        if (isBackgroundRefresh) {
          setTimeout(() => setIsRefreshing(false), 1000); // Show indicator for at least 1s
        }
      }
    };
    fetchWar();
    const interval = setInterval(() => fetchWar(true), 60000); // Auto-refresh every minute
    return () => clearInterval(interval);
  }, [clanTag]);

  // Update "time ago" display every second
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Timer Logic
  useEffect(() => {
    if (!war || war.state === 'warEnded' || war.state === 'notInWar') return;

    const updateTimer = () => {
      const now = new Date().getTime();
      // If in preparation, count down to startTime. If in war, count down to endTime.
      const targetDate = war.state === 'preparation' 
          ? parseCoCTimestamp(war.startTime) 
          : parseCoCTimestamp(war.endTime);
          
      const distance = targetDate.getTime() - now;

      if (distance < 0) {
        setTimer('00h 00m 00s');
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimer(`${hours}h ${minutes}m ${seconds}s`);
      setTimerLabel(war.state === 'preparation' ? 'Battle Starts In' : 'War Ends In');
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [war]);

  if (loading) return <LoadingSpinner />;
  
  if (error || !war || war.state === 'notInWar') {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-slate-800 rounded-xl border border-slate-700">
        <RefreshCw className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-bold text-white">No Active War</h2>
        <p className="text-slate-400">The clan is not currently in a classic clan war.</p>
        <button onClick={() => window.location.reload()} className="mt-4 flex items-center text-coc-gold hover:underline">
            <RefreshCw size={16} className="mr-2"/> Refresh
        </button>
      </div>
    );
  }

  const myClan = war.clan;
  const enemyClan = war.opponent;

  // Calculate star progress and attacks
  const myStars = myClan.stars || 0;
  const enemyStars = enemyClan.stars || 0;
  const maxStars = war.teamSize * 3;
  const myAttacksUsed = myClan.attacks || 0;
  const enemyAttacksUsed = enemyClan.attacks || 0;
  const totalAttacks = war.teamSize * 2;

  // Check for perfect war
  const isPerfectWar = myStars === maxStars;

  // Format last updated time
  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds} secs ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  return (
    <div className="space-y-6">
      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2">
        <div className="flex items-center space-x-2 text-sm text-slate-400">
          <RefreshCw
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-green-400' : 'text-slate-500'}`}
          />
          <span>
            {isRefreshing ? (
              <span className="text-green-400 font-semibold">Updating...</span>
            ) : (
              <>Auto-updates every minute</>
            )}
          </span>
        </div>
        <div className="text-xs text-slate-500">
          Last updated: <span className="text-slate-300 font-mono">{getTimeAgo()}</span>
        </div>
      </div>

      {/* Perfect War Banner */}
      {isPerfectWar && (
        <div className="bg-gradient-to-r from-yellow-900/80 via-amber-800/80 to-yellow-900/80 border-2 border-coc-gold rounded-xl p-4 shadow-2xl shadow-yellow-600/50 animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <Star className="text-coc-gold animate-spin" size={32} style={{ animationDuration: '3s' }} />
            <div className="text-center">
              <h2 className="text-2xl font-black text-coc-gold uppercase tracking-wider">Perfect War!</h2>
              <p className="text-sm text-yellow-200">All {maxStars} stars collected! Outstanding performance! 🎉</p>
            </div>
            <Star className="text-coc-gold animate-spin" size={32} style={{ animationDuration: '3s' }} />
          </div>
        </div>
      )}

      {/* Header Stats */}
      <div className={`bg-slate-800 rounded-xl p-6 shadow-lg relative overflow-hidden border-2 transition-all ${isPerfectWar ? 'border-coc-gold shadow-2xl shadow-yellow-600/30' : 'border-slate-700'}`}>
         {/* Background Gradient Effect */}
         <div className={`absolute inset-0 pointer-events-none ${isPerfectWar ? 'bg-gradient-to-r from-yellow-900/30 via-transparent to-yellow-900/30' : 'bg-gradient-to-r from-blue-900/20 to-red-900/20'}`}></div>

         <div className="flex flex-col md:flex-row justify-between items-center relative z-10">
            {/* My Clan */}
            <div className="flex items-center space-x-4">
               <img src={myClan.badgeUrls.medium} className="w-16 h-16 drop-shadow-lg" alt="Us" />
               <div>
                  <div className="text-2xl font-bold text-white">{myClan.name}</div>
                  <div className="text-green-400 font-bold text-3xl">{myClan.stars} <span className="text-sm text-slate-400">★</span></div>
                  <div className="text-sm text-slate-400">{myClan.destructionPercentage.toFixed(2)}% Destruction</div>
               </div>
            </div>

            {/* Timer & VS */}
            <div className="flex flex-col items-center mx-8 my-4 md:my-0">
                <div className="text-4xl font-black italic text-slate-700 mb-2">VS</div>
                <div className="flex items-center bg-slate-900/80 px-5 py-2 rounded-lg border border-slate-600 backdrop-blur-sm">
                    <Timer className="text-coc-gold w-5 h-5 mr-2 flex-shrink-0" />
                    <div className="text-center">
                        <div className="text-xs text-slate-400 uppercase tracking-wider whitespace-nowrap">{timerLabel}</div>
                        <div className="text-xl font-mono font-bold text-white whitespace-nowrap min-w-[160px]">{timer}</div>
                    </div>
                </div>
                <div className="mt-2 text-xs text-slate-500 font-mono">{war.teamSize} vs {war.teamSize}</div>
            </div>

            {/* Enemy Clan */}
            <div className="flex items-center space-x-4 flex-row-reverse md:flex-row">
               <div className="text-right md:text-left">
                  <div className="text-2xl font-bold text-white">{enemyClan.name}</div>
                  <div className="text-red-400 font-bold text-3xl">{enemyClan.stars} <span className="text-sm text-slate-400">★</span></div>
                  <div className="text-sm text-slate-400">{enemyClan.destructionPercentage.toFixed(2)}% Destruction</div>
               </div>
               <img src={enemyClan.badgeUrls.medium} className="w-16 h-16 drop-shadow-lg ml-0 md:ml-4 mr-4 md:mr-0" alt="Them" />
            </div>
         </div>

         {/* Stars Progress Bars */}
         <div className="mt-8 grid grid-cols-2 gap-8">
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-semibold">
                      ★ Stars: {myStars}/{maxStars}
                      <span className="text-slate-500 text-[10px] ml-2">({myAttacksUsed}/{totalAttacks} attacks)</span>
                    </span>
                    <span className={`font-bold ${myStars === maxStars ? 'text-coc-gold' : 'text-green-400'}`}>
                      {Math.round((myStars/maxStars)*100)}%
                    </span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div
                      className={`h-full transition-all duration-1000 ${myStars === maxStars ? 'bg-gradient-to-r from-yellow-400 to-coc-gold' : 'bg-green-500'}`}
                      style={{ width: `${(myStars/maxStars)*100}%` }}
                    ></div>
                </div>
            </div>
            <div>
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-white font-semibold">
                      ★ Stars: {enemyStars}/{maxStars}
                      <span className="text-slate-500 text-[10px] ml-2">({enemyAttacksUsed}/{totalAttacks} attacks)</span>
                    </span>
                    <span className={`font-bold ${enemyStars === maxStars ? 'text-coc-gold' : 'text-red-400'}`}>
                      {Math.round((enemyStars/maxStars)*100)}%
                    </span>
                </div>
                <div className="h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div
                      className={`h-full transition-all duration-1000 ${enemyStars === maxStars ? 'bg-gradient-to-r from-yellow-400 to-coc-gold' : 'bg-red-500'}`}
                      style={{ width: `${(enemyStars/maxStars)*100}%` }}
                    ></div>
                </div>
            </div>
         </div>
      </div>

      {/* Member Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Our Lineup */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                <Swords className="mr-2 text-green-400" /> Our Lineup
             </h3>
             <div className="flex flex-col space-y-2">
                 {myClan.members.sort((a,b) => a.mapPosition - b.mapPosition).map((member) => (
                     <MemberCard 
                        key={member.tag} 
                        member={member} 
                        opponentMembers={enemyClan.members} // Pass enemy members to lookup ID
                        onMemberClick={onMemberClick}
                     />
                 ))}
             </div>
          </div>

          {/* Enemy Lineup */}
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
             <h3 className="text-lg font-bold text-white mb-4 flex items-center justify-end">
                Enemy Lineup <Skull className="ml-2 text-red-400" /> 
             </h3>
             <div className="flex flex-col space-y-2">
                 {enemyClan.members.sort((a,b) => a.mapPosition - b.mapPosition).map((member) => (
                     <MemberCard 
                        key={member.tag} 
                        member={member} 
                        opponentMembers={myClan.members} // Pass my members to lookup ID if needed
                        isOpponent 
                        onMemberClick={onMemberClick}
                     />
                 ))}
             </div>
          </div>

      </div>
    </div>
  );
};