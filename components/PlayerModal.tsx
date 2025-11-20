
import React, { useEffect, useState } from 'react';
import { PlayerDetails, Equipment } from '../types';
import { getPlayerDetails } from '../services/cocService';
import { X, Shield, Sword, Star, Zap, Trophy, Hammer, FlaskConical, Target, Bookmark } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface PlayerModalProps {
  tag: string;
  onClose: () => void;
}

const BASE_IMG_URL = "https://www.clash.ninja/images/entities/";

// Mapping based on provided HTML
const ENTITY_IMAGES: Record<string, string> = {
  // Troops
  "Barbarian": "31_icon.png",
  "Archer": "32_icon.png",
  "Giant": "33_icon.png",
  "Goblin": "34_icon.png",
  "Wall Breaker": "35_icon.png",
  "Balloon": "36_icon.png",
  "Wizard": "37_icon.png",
  "Healer": "38_icon.png",
  "Dragon": "39_icon.png",
  "P.E.K.K.A": "40_icon.png",
  "Baby Dragon": "41_icon.png",
  "Miner": "42_icon.png",
  "Electro Dragon": "103_icon.png",
  "Yeti": "121_icon.png",
  "Dragon Rider": "133_icon.png",
  "Electro Titan": "138_icon.png",
  "Root Rider": "156_icon.png",
  "Thrower": "204_icon.png",
  "Minion": "53_icon.png",
  "Hog Rider": "54_icon.png",
  "Valkyrie": "55_icon.png",
  "Golem": "56_icon.png",
  "Witch": "57_icon.png",
  "Lava Hound": "58_icon.png",
  "Bowler": "59_icon.png",
  "Ice Golem": "111_icon.png",
  "Headhunter": "123_icon.png",
  "Apprentice Warden": "151_icon.png",
  "Druid": "197_icon.png",
  "Furnace": "218_icon.png",

  // Spells
  "Lightning Spell": "43.png",
  "Healing Spell": "44.png",
  "Rage Spell": "45.png",
  "Jump Spell": "46.png",
  "Freeze Spell": "47.png",
  "Clone Spell": "48.png",
  "Invisibility Spell": "124.png",
  "Recall Spell": "140.png",
  "Revive Spell": "205.png",
  "Poison Spell": "49.png",
  "Earthquake Spell": "50.png",
  "Haste Spell": "51.png",
  "Skeleton Spell": "52.png",
  "Bat Spell": "110.png",
  "Overgrowth Spell": "175.png",
  "Ice Block Spell": "236.png",

  // Heroes
  "Barbarian King": "61_icon.png",
  "Archer Queen": "62_icon.png",
  "Grand Warden": "63_icon.png",
  "Royal Champion": "122_icon.png",
  "Battle Machine": "100_icon.png",
  "Battle Copter": "148_icon.png",
  "Minion Prince": "208_icon.png",

  // Pets
  "L.A.S.S.I": "129_icon.png",
  "Electro Owl": "130_icon.png",
  "Mighty Yak": "131_icon.png",
  "Unicorn": "132_icon.png",
  "Frosty": "141_icon.png",
  "Diggy": "142_icon.png",
  "Poison Lizard": "143_icon.png",
  "Phoenix": "144_icon.png",
  "Spirit Fox": "155_icon.png",
  "Angry Jelly": "193_icon.png",
  "Sneezy": "217_icon.png",

  // Siege Machines
  "Wall Wrecker": "105_icon.png",
  "Battle Blimp": "106_icon.png",
  "Stone Slammer": "109_icon.png",
  "Siege Barracks": "120_icon.png",
  "Log Launcher": "125_icon.png",
  "Flame Flinger": "134_icon.png",
  "Battle Drill": "139_icon.png",
  "Troop Launcher": "215_icon.png",

  // Hero Equipment
  "Barbarian Puppet": "157.png",
  "Rage Vial": "158.png",
  "Earthquake Boots": "159.png",
  "Vampstache": "160.png",
  "Giant Gauntlet": "171.png",
  "Spiky Ball": "194.png",
  "Snake Bracelet": "213.png",
  "Archer Puppet": "161.png",
  "Invisibility Vial": "162.png",
  "Giant Arrow": "163.png",
  "Healer Puppet": "164.png",
  "Frozen Arrow": "172.png",
  "Magic Mirror": "198.png",
  "Action Figure": "220.png",
  "Eternal Tome": "165.png",
  "Life Gem": "166.png",
  "Rage Gem": "168.png",
  "Healing Tome": "167.png",
  "Fireball": "176.png",
  "Lavaloon Puppet": "199.png",
  "Royal Gem": "169.png",
  "Seeking Shield": "170.png",
  "Hog Rider Puppet": "173.png",
  "Haste Vial": "174.png",
  "Rocket Spear": "195.png",
  "Electro Boots": "211.png",
  "Dark Orb": "209.png",
  "Henchmen Puppet": "210.png",
  "Metal Pants": "216.png",
  "Noble Iron": "219.png",
  "Dark Crown": "222.png",
  "Heroic Torch": "237.png"
};

const SIEGE_NAMES = [
  "Wall Wrecker", "Battle Blimp", "Stone Slammer", "Siege Barracks", 
  "Log Launcher", "Flame Flinger", "Battle Drill", "Troop Launcher"
];

const PET_NAMES = [
  "L.A.S.S.I", "Electro Owl", "Mighty Yak", "Unicorn", "Frosty", 
  "Diggy", "Poison Lizard", "Phoenix", "Spirit Fox", "Angry Jelly", "Sneezy"
];

const SUPER_TROOP_NAMES = [
  "Super Barbarian", "Super Archer", "Super Giant", "Sneaky Goblin", "Super Wall Breaker",
  "Rocket Balloon", "Super Wizard", "Super Dragon", "Inferno Dragon", "Super Minion",
  "Super Valkyrie", "Super Witch", "Ice Hound", "Super Bowler", "Super Miner", "Super Hog Rider", "Super Yeti"
];

const LevelBadge: React.FC<{ level: number, maxLevel?: number, compact?: boolean }> = ({ level, maxLevel, compact }) => {
  const isMax = maxLevel && level >= maxLevel;
  return (
    <div className={`absolute bottom-0 right-0 font-bold flex items-center justify-center border-t border-l rounded-tl-md shadow-sm backdrop-blur-sm
      ${isMax ? 'bg-[#ffbf5e] text-slate-900 border-[#d97706]' : 'bg-black/80 text-white border-slate-600'}
      ${compact ? 'text-[10px] px-1 h-4 min-w-[16px]' : 'text-xs px-1.5 h-5 min-w-[20px]'}
    `}>
      {level}
    </div>
  );
};

const ItemCard: React.FC<{ name: string; level: number; maxLevel: number; type?: 'spell' | 'troop' }> = ({ name, level, maxLevel, type }) => {
  const imgFile = ENTITY_IMAGES[name];
  const imgUrl = imgFile ? `${BASE_IMG_URL}${imgFile}` : null;

  return (
    <div className="relative bg-slate-800/80 border border-slate-700 rounded-lg aspect-square flex flex-col items-center justify-center group hover:border-slate-500 transition-colors overflow-hidden shadow-sm">
      {imgUrl ? (
        <img src={imgUrl} alt={name} className="w-full h-full object-contain p-1" />
      ) : (
        <div className="text-[10px] text-center text-slate-400 px-1 leading-tight">{name}</div>
      )}
      <LevelBadge level={level} maxLevel={maxLevel} compact />
    </div>
  );
};

const HeroCard: React.FC<{ 
    name: string; 
    level: number; 
    maxLevel: number; 
    equipment?: Equipment[] 
}> = ({ name, level, maxLevel, equipment }) => {
    const imgFile = ENTITY_IMAGES[name];
    const imgUrl = imgFile ? `${BASE_IMG_URL}${imgFile}` : null;

    return (
        <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex flex-col relative overflow-hidden shadow-sm min-h-[120px]">
            <div className="flex justify-between items-start mb-2 z-10">
                <div className="w-12 h-12 rounded bg-slate-900/50 flex items-center justify-center border border-slate-700 mr-3 overflow-hidden shrink-0">
                     {imgUrl ? <img src={imgUrl} alt={name} className="w-full h-full object-contain" /> : <Sword size={20} />}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate" title={name}>{name}</div>
                    <div className="text-coc-gold font-mono font-bold text-xs">Lvl {level}</div>
                </div>
            </div>
            
            {/* Active Equipment Section */}
            {equipment && equipment.length > 0 && (
                <div className="mt-auto z-10">
                    <div className="text-[9px] text-slate-500 uppercase font-bold mb-1">Active Gear</div>
                    <div className="grid grid-cols-2 gap-1">
                        {equipment.map((eq, idx) => {
                            const eqImg = ENTITY_IMAGES[eq.name];
                            return (
                                <div key={idx} className="flex items-center bg-slate-950/60 px-1.5 py-1 rounded border border-slate-800" title={eq.name}>
                                    {eqImg && <img src={`${BASE_IMG_URL}${eqImg}`} className="w-4 h-4 mr-1 object-contain" alt="" />}
                                    <span className="text-[9px] font-mono text-cyan-400 font-bold">{eq.level}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export const PlayerModal: React.FC<PlayerModalProps> = ({ tag, onClose }) => {
  const [player, setPlayer] = useState<PlayerDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        const data = await getPlayerDetails(tag);
        setPlayer(data);
      } catch (err) {
        setError('Failed to load player details.');
      } finally {
        setLoading(false);
      }
    };
    fetchPlayer();
  }, [tag]);

  if (!tag) return null;

  // Categorize Troops (API returns all in one array usually)
  const allHomeTroops = player?.troops?.filter(t => t.village === 'home') || [];
  
  const troopsList = allHomeTroops.filter(t => 
    !SIEGE_NAMES.includes(t.name) && 
    !PET_NAMES.includes(t.name) &&
    !SUPER_TROOP_NAMES.includes(t.name)
  );
  
  const siegeList = allHomeTroops.filter(t => SIEGE_NAMES.includes(t.name));
  const petsList = allHomeTroops.filter(t => PET_NAMES.includes(t.name));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-2xl relative scrollbar-hide">
        <button 
          onClick={onClose}
          className="fixed top-4 right-4 sm:top-6 sm:right-8 text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full z-50 border border-slate-600 shadow-lg transition-colors"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="p-24"><LoadingSpinner /></div>
        ) : error ? (
          <div className="p-12 text-red-400 text-center">{error}</div>
        ) : player ? (
          <div className="p-0">
            
            {/* --- HEADER SECTION --- */}
            <div className="relative bg-slate-800 p-6 border-b border-slate-700">
              <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
                {/* Avatar (Clan Badge) */}
                <div className="relative group mx-auto md:mx-0">
                    <div className="w-24 h-24 rounded-xl bg-slate-950 border-2 border-slate-600 flex items-center justify-center shadow-lg overflow-hidden relative">
                         <div className="absolute inset-0 bg-[url('https://www.clash.ninja/images/entities/1_16.png')] bg-cover bg-center opacity-10 grayscale"></div>
                        {player.clan?.badgeUrls ? (
                             <img src={player.clan.badgeUrls.medium} alt="Clan Badge" className="w-full h-full object-contain p-2 relative z-10" />
                        ) : (
                             <Shield size={48} className="text-slate-600" />
                        )}
                    </div>
                    <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full border border-slate-500 shadow whitespace-nowrap z-20">
                        TH {player.townHallLevel}
                    </div>
                </div>

                {/* Main Info */}
                <div className="flex-1 w-full text-center md:text-left space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex flex-col md:flex-row items-center md:items-end gap-2 justify-center md:justify-start">
                                {player.name}
                                <span className="text-sm font-normal text-slate-400 font-mono bg-slate-950/50 px-2 py-0.5 rounded border border-slate-800">
                                    {player.tag}
                                </span>
                            </h2>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-slate-300">
                                {player.role && (
                                    <span className="capitalize font-bold text-white flex items-center bg-slate-700/50 px-2 py-0.5 rounded">
                                        <Shield size={14} className="mr-1.5 text-coc-gold" /> {player.role.replace('coLeader', 'Co-Leader')}
                                    </span>
                                )}
                                <span className="flex items-center text-cyan-300">
                                    <Trophy size={14} className="mr-1.5" /> {player.trophies.toLocaleString()}
                                </span>
                                <span className="flex items-center text-amber-400">
                                    <Star size={14} className="mr-1.5" /> {player.warStars.toLocaleString()} Stars
                                </span>
                            </div>
                        </div>
                        
                        {/* War Preference Status */}
                        <div className="flex items-center justify-center">
                           <div className={`px-3 py-1 rounded-full border flex items-center font-bold text-xs uppercase tracking-wide ${
                               player.warPreference === 'out' 
                               ? 'bg-red-950/40 border-red-900 text-red-400' 
                               : 'bg-green-950/40 border-green-900 text-green-400'
                           }`}>
                               <div className={`w-1.5 h-1.5 rounded-full mr-2 ${player.warPreference === 'out' ? 'bg-red-500' : 'bg-green-500'}`}></div>
                               {player.warPreference === 'in' ? "I'm In" : "I'm Out"}
                           </div>
                        </div>
                    </div>

                    {/* Labels */}
                    {player.labels && player.labels.length > 0 && (
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                            {player.labels.map(label => (
                                <div key={label.id} className="flex items-center bg-slate-700/30 text-slate-400 text-[10px] px-2 py-1 rounded border border-slate-700">
                                    {label.iconUrls?.small && <img src={label.iconUrls.small} alt="" className="w-3 h-3 mr-1" />}
                                    {label.name}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
              </div>
            </div>

            {/* --- CONTENT BODY --- */}
            <div className="p-4 sm:p-8 space-y-8 bg-slate-900">
                
                {/* 1. TROOPS SECTION */}
                <div>
                    <h3 className="text-lg font-bold text-blue-300 mb-3 border-b border-slate-800 pb-1">Troops</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                        {troopsList.map(troop => (
                            <ItemCard key={troop.name} name={troop.name} level={troop.level} maxLevel={troop.maxLevel} />
                        ))}
                    </div>
                </div>

                {/* 2. SPELLS SECTION */}
                <div>
                    <h3 className="text-lg font-bold text-purple-300 mb-3 border-b border-slate-800 pb-1">Spells</h3>
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                        {player.spells.filter(s => s.village === 'home').map(spell => (
                            <ItemCard key={spell.name} name={spell.name} level={spell.level} maxLevel={spell.maxLevel} />
                        ))}
                    </div>
                </div>

                {/* 3. HEROES & PETS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Heroes */}
                    <div>
                        <h3 className="text-lg font-bold text-coc-gold mb-3 border-b border-slate-800 pb-1">Heroes</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {player.heroes.filter(h => h.village === 'home').map(hero => (
                                <HeroCard 
                                    key={hero.name}
                                    name={hero.name}
                                    level={hero.level}
                                    maxLevel={hero.maxLevel}
                                    equipment={hero.equipment}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Pets */}
                    <div>
                         <h3 className="text-lg font-bold text-green-300 mb-3 border-b border-slate-800 pb-1">Pets</h3>
                         <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                            {petsList.map(pet => (
                                <ItemCard key={pet.name} name={pet.name} level={pet.level} maxLevel={pet.maxLevel} />
                            ))}
                            {petsList.length === 0 && <div className="col-span-full text-slate-600 text-sm italic">No pets unlocked</div>}
                         </div>
                    </div>
                </div>

                {/* 4. SIEGE MACHINES */}
                {siegeList.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-orange-300 mb-3 border-b border-slate-800 pb-1">Siege Machines</h3>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                            {siegeList.map(siege => (
                                <ItemCard key={siege.name} name={siege.name} level={siege.level} maxLevel={siege.maxLevel} />
                            ))}
                        </div>
                    </div>
                )}

                {/* 5. EQUIPMENT INVENTORY */}
                {player.heroEquipment && player.heroEquipment.length > 0 && (
                    <div>
                        <h3 className="text-lg font-bold text-cyan-300 mb-3 border-b border-slate-800 pb-1">Hero Equipment</h3>
                        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                            {player.heroEquipment.map(eq => (
                                <ItemCard key={eq.name} name={eq.name} level={eq.level} maxLevel={eq.maxLevel} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
