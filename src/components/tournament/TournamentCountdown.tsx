import React, { useState, useEffect, useMemo } from 'react';
import { Clock, Timer, AlertCircle, Play, CheckCircle2, Flame } from 'lucide-react';

export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isStarted: boolean;
  isStartingSoon: boolean; // less than 15 mins
  totalSecondsRemaining: number;
  targetDate: Date;
  formattedCompact: string;
  formattedDetailed: string;
}

/**
 * Parses scheduleDate and scheduleTime into a concrete Date object.
 * Supports:
 * - Direct ISO strings (startTimeISO)
 * - YYYY-MM-DD + HH:MM
 * - YYYY-MM-DD + HH:MM IST
 * - YYYY-MM-DD + 12-hour AM/PM (e.g. 08:30 PM IST)
 */
export function parseTournamentStartTime(
  scheduleDate: string,
  scheduleTime: string,
  startTimeISO?: string
): Date {
  if (startTimeISO) {
    const d = new Date(startTimeISO);
    if (!isNaN(d.getTime())) return d;
  }

  const cleanDate = (scheduleDate || '').trim();
  const cleanTime = (scheduleTime || '').trim();

  if (!cleanDate) {
    return new Date(Date.now() + 3600 * 1000); // fallback 1 hour in future
  }

  // Check for AM/PM in time
  const isPM = /pm/i.test(cleanTime);
  const isAM = /am/i.test(cleanTime);

  // Extract digits for hours and minutes
  const timeWithoutZone = cleanTime.replace(/\b(IST|UTC|GMT|[AP]M)\b/gi, '').trim();
  const timeParts = timeWithoutZone.split(':');

  let hours = 20; // default 8 PM
  let minutes = 0;

  if (timeParts.length >= 2) {
    const parsedH = parseInt(timeParts[0], 10);
    const parsedM = parseInt(timeParts[1], 10);
    if (!isNaN(parsedH)) {
      hours = parsedH;
      if (isPM && hours < 12) hours += 12;
      if (isAM && hours === 12) hours = 0;
    }
    if (!isNaN(parsedM)) {
      minutes = parsedM;
    }
  } else if (timeParts.length === 1 && timeParts[0]) {
    const parsedH = parseInt(timeParts[0], 10);
    if (!isNaN(parsedH)) {
      hours = parsedH;
      if (isPM && hours < 12) hours += 12;
    }
  }

  // Construct target Date in ISO format: YYYY-MM-DDTHH:mm:00
  const pad = (n: number) => String(n).padStart(2, '0');
  const isoLocalString = `${cleanDate}T${pad(hours)}:${pad(minutes)}:00`;

  const targetDate = new Date(isoLocalString);
  if (!isNaN(targetDate.getTime())) {
    return targetDate;
  }

  // Ultimate fallback: today + 2 hours
  return new Date(Date.now() + 2 * 3600 * 1000);
}

/**
 * Hook that computes real-time countdown every second
 */
export function useTournamentCountdown(
  scheduleDate: string,
  scheduleTime: string,
  startTimeISO?: string
): CountdownResult {
  const targetDate = useMemo(
    () => parseTournamentStartTime(scheduleDate, scheduleTime, startTimeISO),
    [scheduleDate, scheduleTime, startTimeISO]
  );

  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    // Immediate tick
    setNow(Date.now());

    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return useMemo(() => {
    const diffMs = targetDate.getTime() - now;

    if (diffMs <= 0) {
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isStarted: true,
        isStartingSoon: false,
        totalSecondsRemaining: 0,
        targetDate,
        formattedCompact: 'Live Now',
        formattedDetailed: 'Tournament match is currently live!',
      };
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, '0');
    const isStartingSoon = totalSeconds <= 900; // <= 15 minutes

    const formattedCompact = `${pad(days)}d ${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
    const formattedDetailed = `${days} Days, ${hours} Hours, ${minutes} Mins, ${seconds} Secs`;

    return {
      days,
      hours,
      minutes,
      seconds,
      isStarted: false,
      isStartingSoon,
      totalSecondsRemaining: totalSeconds,
      targetDate,
      formattedCompact,
      formattedDetailed,
    };
  }, [targetDate, now]);
}

interface TournamentCountdownProps {
  scheduleDate: string;
  scheduleTime: string;
  startTimeISO?: string;
  variant?: 'compact' | 'cards' | 'banner' | 'pill';
  className?: string;
  showIcon?: boolean;
}

export const TournamentCountdown: React.FC<TournamentCountdownProps> = ({
  scheduleDate,
  scheduleTime,
  startTimeISO,
  variant = 'compact',
  className = '',
  showIcon = true,
}) => {
  const countdown = useTournamentCountdown(scheduleDate, scheduleTime, startTimeISO);
  const pad = (n: number) => String(n).padStart(2, '0');

  // Variant 1: Compact inline pill (for tables, list rows, small badges)
  if (variant === 'compact') {
    if (countdown.isStarted) {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse ${className}`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
          <span>Match Live</span>
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-mono text-xs font-bold border transition-colors ${
          countdown.isStartingSoon
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.25)] animate-pulse'
            : 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
        } ${className}`}
        title={`Starts on ${countdown.targetDate.toLocaleString()}`}
      >
        {showIcon && (
          countdown.isStartingSoon ? (
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-bounce" />
          ) : (
            <Timer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          )
        )}
        <span className="tabular-nums tracking-wide">{countdown.formattedCompact}</span>
      </span>
    );
  }

  // Variant 2: Full Stylized Countdown Segment Cards (Days, Hours, Minutes, Seconds)
  if (variant === 'cards') {
    if (countdown.isStarted) {
      return (
        <div
          className={`p-4 rounded-2xl bg-gradient-to-r from-rose-950/60 to-red-950/60 border border-rose-500/40 text-center space-y-1 shadow-lg shadow-rose-950/40 ${className}`}
        >
          <div className="flex items-center justify-center gap-2 text-rose-400 font-black text-sm uppercase tracking-widest animate-pulse">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,1)]" />
            <span>Tournament Started • Live In Arena</span>
          </div>
          <p className="text-xs text-rose-300/80">
            Lobby is closed and room battle is currently active.
          </p>
        </div>
      );
    }

    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center justify-between text-[11px] font-bold text-zinc-400">
          <span className="flex items-center gap-1.5 text-cyan-400 uppercase tracking-wider">
            <Timer className="w-3.5 h-3.5" />
            <span>Countdown to Tournament Start</span>
          </span>
          {countdown.isStartingSoon && (
            <span className="text-amber-400 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono text-[10px] animate-pulse">
              Starting Soon (&lt;15m)
            </span>
          )}
        </div>

        {/* 4 Digital Segments Grid */}
        <div className="grid grid-cols-4 gap-2">
          {/* Days */}
          <div className="bg-[#0b101c] border border-cyan-500/30 rounded-xl p-2.5 text-center shadow-md relative overflow-hidden group">
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-cyan-300 tabular-nums">
              {pad(countdown.days)}
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Days
            </div>
          </div>

          {/* Hours */}
          <div className="bg-[#0b101c] border border-cyan-500/30 rounded-xl p-2.5 text-center shadow-md relative overflow-hidden group">
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-cyan-300 tabular-nums">
              {pad(countdown.hours)}
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Hours
            </div>
          </div>

          {/* Minutes */}
          <div className="bg-[#0b101c] border border-cyan-500/30 rounded-xl p-2.5 text-center shadow-md relative overflow-hidden group">
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-cyan-300 tabular-nums">
              {pad(countdown.minutes)}
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-zinc-400 mt-0.5">
              Minutes
            </div>
          </div>

          {/* Seconds (Pulsing highlight) */}
          <div className="bg-[#0b101c] border border-amber-500/40 rounded-xl p-2.5 text-center shadow-md relative overflow-hidden group">
            <div className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-amber-300 tabular-nums animate-pulse">
              {pad(countdown.seconds)}
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-400/80 mt-0.5">
              Seconds
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Variant 3: Card Banner (ideal for tournament cards top header or action area)
  return (
    <div
      className={`flex items-center justify-between p-2.5 rounded-xl border ${
        countdown.isStarted
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          : countdown.isStartingSoon
          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
          : 'bg-[#0b101c]/90 border-white/[0.08] text-zinc-300'
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold">
        <Timer className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="text-[11px] text-zinc-400">Match Starts:</span>
      </div>

      <div className="font-mono text-xs font-black tabular-nums tracking-wider text-cyan-300">
        {countdown.isStarted ? (
          <span className="text-rose-400 font-bold">● Live Match</span>
        ) : (
          countdown.formattedCompact
        )}
      </div>
    </div>
  );
};
