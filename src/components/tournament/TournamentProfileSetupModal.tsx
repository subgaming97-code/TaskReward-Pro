import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GamingPreferences, TournamentGameMode } from '../../types';
import {
  Gamepad2,
  Trophy,
  ShieldCheck,
  User,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Smartphone,
  Clock,
  Swords,
  Target,
  Flame,
  X,
  Crosshair,
  Award,
} from 'lucide-react';

interface TournamentProfileSetupModalProps {
  isOpen: boolean;
  onClose?: () => void;
  isMandatory?: boolean; // When true, required before entering Arena
  onProfileActivated?: (uid: string) => void;
}

const MODES: { mode: TournamentGameMode; label: string; desc: string }[] = [
  { mode: 'Solo', label: 'Solo', desc: '1vAll Survival' },
  { mode: 'Battle Royale', label: 'Battle Royale', desc: 'Full Map 48-Player' },
  { mode: 'Squad', label: 'Squad', desc: '4-Player Team Warfare' },
  { mode: 'Lone Wolf', label: 'Lone Wolf', desc: '1v1 / 2v2 Duels' },
  { mode: 'Craftland', label: 'Craftland', desc: 'Custom Creator Arenas' },
  { mode: '1v1', label: '1v1', desc: 'Single Combat Deathmatch' },
  { mode: '2v2', label: '2v2', desc: 'Duo Tag Team' },
  { mode: '3v3', label: '3v3', desc: 'Trios Tactical Firefight' },
];

const PRESET_MAPS = [
  'Bermuda',
  'Purgatory',
  'Kalahari',
  'Alpine',
  'Iron Cage',
  'Desert Duel',
  'Bermuda Mini',
  'Custom Craftland Arena',
];

const PLAYSTYLES: {
  id: GamingPreferences['playstyle'];
  label: string;
  icon: string;
  desc: string;
}[] = [
  { id: 'Rusher', label: 'Rusher', icon: '⚡', desc: 'Aggressive frontline fragger' },
  { id: 'Sniper', label: 'Sniper', icon: '🎯', desc: 'Long-range precision marksman' },
  { id: 'Support', label: 'Support', icon: '🛡️', desc: 'Medic, cover & utility expert' },
  { id: 'In-Game Leader (IGL)', label: 'IGL (Leader)', icon: '👑', desc: 'Tactical strategist & shotcaller' },
  { id: 'Assaulter', label: 'Assaulter', icon: '🔥', desc: 'Mid-range heavy combat' },
  { id: 'All-Rounder', label: 'All-Rounder', icon: '⭐', desc: 'Versatile multi-role flex' },
];

const DEVICES: GamingPreferences['device'][] = [
  'Android Mobile',
  'iOS Mobile',
  'iPad / Tablet',
  'PC / Emulator',
];

const TIME_SLOTS: GamingPreferences['preferredTime'][] = [
  'Evening (5 PM - 9 PM)',
  'Night (9 PM - 1 AM)',
  'Afternoon (1 PM - 5 PM)',
  'Morning (9 AM - 1 PM)',
  'Flexible / Any',
];

const EXPERIENCE_LEVELS: NonNullable<GamingPreferences['competitiveExperience']>[] = [
  'Casual Player',
  'Ranked Challenger',
  'Semi-Pro',
  'Tournament Veteran',
];

export const TournamentProfileSetupModal: React.FC<TournamentProfileSetupModalProps> = ({
  isOpen,
  onClose,
  isMandatory = false,
  onProfileActivated,
}) => {
  const { currentWorker, saveTournamentProfile, notify } = useApp();

  const [inGameName, setInGameName] = useState(
    currentWorker.inGameName || currentWorker.name || ''
  );
  const [inGameUid, setInGameUid] = useState(
    currentWorker.inGameUid || ''
  );

  const existingPrefs = currentWorker.gamingPreferences;

  const [preferredMode, setPreferredMode] = useState<TournamentGameMode>(
    existingPrefs?.preferredMode || 'Solo'
  );
  const [preferredMap, setPreferredMap] = useState<string>(
    existingPrefs?.preferredMap || 'Bermuda'
  );
  const [playstyle, setPlaystyle] = useState<GamingPreferences['playstyle']>(
    existingPrefs?.playstyle || 'Rusher'
  );
  const [device, setDevice] = useState<GamingPreferences['device']>(
    existingPrefs?.device || 'Android Mobile'
  );
  const [preferredTime, setPreferredTime] = useState<GamingPreferences['preferredTime']>(
    existingPrefs?.preferredTime || 'Evening (5 PM - 9 PM)'
  );
  const [experienceLevel, setExperienceLevel] = useState<
    NonNullable<GamingPreferences['competitiveExperience']>
  >(existingPrefs?.competitiveExperience || 'Ranked Challenger');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUid, setCreatedUid] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedIgn = inGameName.trim();
    if (!trimmedIgn) {
      setError('Please provide your in-game player name (IGN).');
      return;
    }
    if (trimmedIgn.length < 3) {
      setError('In-game name must be at least 3 characters.');
      return;
    }

    const trimmedGameUid = inGameUid.trim();
    if (!trimmedGameUid) {
      setError('Please provide your In-Game Player ID / Game UID (Required).');
      return;
    }

    setIsSubmitting(true);
    try {
      const prefs: GamingPreferences = {
        preferredMode,
        preferredMap,
        playstyle,
        device,
        preferredTime,
        competitiveExperience: experienceLevel,
      };

      const result = await saveTournamentProfile(trimmedIgn, inGameUid, prefs);
      if (result.success && result.esportsTournamentUid) {
        setCreatedUid(result.esportsTournamentUid);
        if (onProfileActivated) {
          onProfileActivated(result.esportsTournamentUid);
        }
      } else {
        setError('Failed to save profile. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An unexpected error occurred while saving your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    notify(`Copied E-sports Tournament UID: ${text}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-[#0b101c] border border-cyan-500/40 w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-[0_0_50px_rgba(6,182,212,0.25)] space-y-6 text-zinc-200 relative my-auto">
        {/* Close Button only if not mandatory */}
        {!isMandatory && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Success View when UID has just been generated */}
        {createdUid ? (
          <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border-2 border-emerald-400/50 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.35)] text-emerald-400">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Official E-sports Identity Verified
              </span>
              <h2 className="text-2xl font-black text-white mt-2">
                Tournament Profile Activated!
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto mt-1">
                Your profile has been created with a unique, verified E-sports Tournament UID. You now have full clearance to join live custom tournaments in the Arena.
              </p>
            </div>

            {/* Generated UID Highlight Card */}
            <div className="bg-[#101728] border-2 border-cyan-500/40 rounded-2xl p-5 max-w-md mx-auto text-center space-y-3 shadow-xl">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Your E-sports Tournament UID
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono text-2xl font-black text-cyan-400 tracking-wider">
                  {createdUid}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(createdUid)}
                  className="p-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition-colors cursor-pointer"
                  title="Copy UID"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="pt-2 border-t border-white/[0.08] grid grid-cols-2 gap-2 text-left text-xs">
                <div>
                  <span className="text-zinc-500 block text-[10px]">In-Game Name</span>
                  <span className="font-bold text-white truncate block">{inGameName}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Playstyle Role</span>
                  <span className="font-semibold text-emerald-300 block">{playstyle}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Preferred Mode</span>
                  <span className="font-semibold text-cyan-300 block">{preferredMode}</span>
                </div>
                <div>
                  <span className="text-zinc-500 block text-[10px]">Active Platform</span>
                  <span className="font-semibold text-zinc-300 block">{device}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                }}
                className="w-full max-w-md mx-auto py-3.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-sm rounded-2xl transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Enter Task and Esports Arena Now</span>
              </button>
            </div>
          </div>
        ) : (
          /* Profile Setup Form */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Modal Header */}
            <div className="flex items-start gap-4 border-b border-white/[0.08] pb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-emerald-600 text-white flex items-center justify-center font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/40 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/25">
                    Arena Gate Pass
                  </span>
                  {isMandatory && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/25">
                      Required Setup
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-black text-white mt-1">
                  Tournament Profile Setup
                </h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Set up your player tag and gaming preferences to generate your non-duplicate E-sports Tournament UID and unlock tournament entry.
                </p>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <span>{error}</span>
              </div>
            )}

            {/* SECTION 1: Player Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
                <User className="w-4 h-4" />
                <span>1. Player Identity</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* In-Game Name */}
                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-1">
                    In-Game Name (IGN / Gamer Tag) <span className="text-rose-400 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inGameName}
                    onChange={(e) => {
                      setInGameName(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. ShadowSniper, ViperX"
                    className="w-full bg-[#12192a] border border-white/[0.12] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all shadow-inner"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Your exact Free Fire / game nickname displayed in room lobbies.
                  </span>
                </div>

                {/* In-Game UID (Required) */}
                <div>
                  <label className="block text-xs font-bold text-zinc-200 mb-1">
                    In-Game Player ID / Game UID <span className="text-rose-400 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inGameUid}
                    onChange={(e) => {
                      setInGameUid(e.target.value);
                      setError(null);
                    }}
                    placeholder="e.g. 192847102"
                    className="w-full bg-[#12192a] border border-white/[0.12] focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 text-white rounded-xl px-3.5 py-2.5 text-xs outline-none transition-all font-mono shadow-inner"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">
                    Your 9-10 digit game account UID for moderator score verification (Required).
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 2: Gaming Preferences */}
            <div className="space-y-4 pt-2 border-t border-white/[0.08]">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Crosshair className="w-4 h-4" />
                <span>2. Gaming Preferences</span>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Primary Preferred Mode
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {MODES.map((m) => {
                    const isSelected = preferredMode === m.mode;
                    return (
                      <button
                        key={m.mode}
                        type="button"
                        onClick={() => setPreferredMode(m.mode)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                            : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="font-bold text-xs">{m.label}</div>
                        <div className="text-[9px] text-zinc-400 truncate">{m.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Map Preference */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Preferred Arena Map
                </label>
                <div className="flex flex-wrap gap-1.5 p-1.5 bg-[#0a0f1d] border border-white/[0.08] rounded-2xl shadow-inner">
                  {PRESET_MAPS.map((mapName) => {
                    const isSelected = preferredMap === mapName;
                    return (
                      <button
                        key={mapName}
                        type="button"
                        onClick={() => setPreferredMap(mapName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.25)] font-bold'
                            : 'bg-white/[0.03] border-white/[0.06] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        {mapName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Playstyle / Combat Role */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">
                  Combat Playstyle Role
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {PLAYSTYLES.map((ps) => {
                    const isSelected = playstyle === ps.id;
                    return (
                      <button
                        key={ps.id}
                        type="button"
                        onClick={() => setPlaystyle(ps.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400 text-cyan-200 shadow-sm'
                            : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center gap-1.5">
                          <span>{ps.icon}</span>
                          <span>{ps.label}</span>
                        </div>
                        <div className="text-[9px] text-zinc-400 mt-0.5 line-clamp-1">{ps.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Platform & Timing in 2-cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Hardware Platform */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Gaming Device / Hardware
                  </label>
                  <select
                    value={device}
                    onChange={(e) => setDevice(e.target.value as GamingPreferences['device'])}
                    className="w-full bg-[#12192a] border border-white/[0.12] text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-400"
                  >
                    {DEVICES.map((d) => (
                      <option key={d} value={d} className="bg-[#0b101c]">
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Match Slot Preference */}
                <div>
                  <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                    Preferred Match Slot
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value as GamingPreferences['preferredTime'])}
                    className="w-full bg-[#12192a] border border-white/[0.12] text-white rounded-xl px-3 py-2 text-xs outline-none focus:border-cyan-400"
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t} className="bg-[#0b101c]">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Competitive Tier */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Competitive Experience Tier
                </label>
                <div className="flex flex-wrap gap-2">
                  {EXPERIENCE_LEVELS.map((exp) => {
                    const isSelected = experienceLevel === exp;
                    return (
                      <button
                        key={exp}
                        type="button"
                        onClick={() => setExperienceLevel(exp)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-white/[0.03] border-white/[0.08] text-zinc-400 hover:text-white'
                        }`}
                      >
                        {exp}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unique E-sports Tournament UID will be automatically assigned.</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {!isMandatory && onClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-xs rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.35)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Generating UID...'
                      : currentWorker.esportsTournamentUid
                      ? 'Update Profile & Save'
                      : 'Generate E-sports Tournament UID & Enter Arena'}
                  </span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
