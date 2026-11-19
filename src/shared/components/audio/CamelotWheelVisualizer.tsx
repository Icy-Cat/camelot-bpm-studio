'use client';

import React, { useState } from 'react';
import { Disc, HelpCircle, Info, Sparkles } from 'lucide-react';
import { CAMELOT_MAP, KeyInfo } from '@/shared/lib/audio/camelot';

const CAMELOT_KEYS_ORDER = [
  { num: 1, minor: 'G# Minor', major: 'B Major' },
  { num: 2, minor: 'D# Minor', major: 'F# Major' },
  { num: 3, minor: 'Bb Minor', major: 'Db Major' },
  { num: 4, minor: 'F Minor', major: 'Ab Major' },
  { num: 5, minor: 'C Minor', major: 'Eb Major' },
  { num: 6, minor: 'G Minor', major: 'Bb Major' },
  { num: 7, minor: 'D Minor', major: 'F Major' },
  { num: 8, minor: 'A Minor', major: 'C Major' },
  { num: 9, minor: 'E Minor', major: 'G Major' },
  { num: 10, minor: 'B Minor', major: 'D Major' },
  { num: 11, minor: 'F# Minor', major: 'A Major' },
  { num: 12, minor: 'C# Minor', major: 'E Major' },
];

export function CamelotWheelVisualizer() {
  const [selectedKey, setSelectedKey] = useState<KeyInfo>(CAMELOT_MAP['A Minor']); // Default 8A

  const isCompatible = (keyName: string) => {
    const exact = `(${keyName})`;
    return (
      selectedKey.name === keyName ||
      selectedKey.compatibleKeys.some((k) => k.includes(exact)) ||
      selectedKey.relativeKey.includes(exact)
    );
  };

  const isEnergyBoost = (keyName: string) => {
    return selectedKey.energyBoostKey.includes(`(${keyName})`);
  };

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400 mb-1">
            <Disc className="w-4 h-4" />
            <span>Harmonic Mixing Interactive Guide</span>
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            The Interactive Camelot Wheel Matrix
          </h3>
          <p className="text-sm text-slate-400">
            Click any key on the wheel to preview compatible harmonic transitions for Rekordbox & Serato.
          </p>
        </div>

        {/* Selected Key Quick Card */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center font-bold text-slate-950 text-base shadow"
            style={{ backgroundColor: selectedKey.color }}
          >
            {selectedKey.camelot}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{selectedKey.name}</div>
            <div className="text-xs text-slate-400">Relative: {selectedKey.relativeKey}</div>
          </div>
        </div>
      </div>

      {/* Grid of Camelot Keys */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {CAMELOT_KEYS_ORDER.map(({ num, minor, major }) => {
          const minorInfo = CAMELOT_MAP[minor];
          const majorInfo = CAMELOT_MAP[major];

          const isMinorSelected = selectedKey.name === minor;
          const isMajorSelected = selectedKey.name === major;
          const isMinorComp = isCompatible(minor);
          const isMajorComp = isCompatible(major);
          const isMinorBoost = isEnergyBoost(minor);
          const isMajorBoost = isEnergyBoost(major);

          return (
            <div
              key={num}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 space-y-2 flex flex-col justify-between"
            >
              {/* Outer Wheel (B - Major) */}
              <button
                onClick={() => setSelectedKey(majorInfo)}
                className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between ${
                  isMajorSelected
                    ? 'ring-2 ring-white bg-slate-800 shadow'
                    : isMajorComp
                      ? 'bg-slate-800/80 border border-orange-500/50'
                      : isMajorBoost
                        ? 'bg-amber-500/10 border border-amber-500/40'
                        : 'hover:bg-slate-900 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: majorInfo.color }}
                    />
                    {majorInfo.camelot}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{major}</div>
                </div>
                {isMajorComp && !isMajorSelected && (
                  <span className="text-[10px] text-orange-400 font-semibold">Match</span>
                )}
                {isMajorBoost && (
                  <span className="text-[10px] text-amber-400 font-semibold">Boost</span>
                )}
              </button>

              {/* Inner Wheel (A - Minor) */}
              <button
                onClick={() => setSelectedKey(minorInfo)}
                className={`w-full text-left p-2 rounded-lg transition-all flex items-center justify-between ${
                  isMinorSelected
                    ? 'ring-2 ring-white bg-slate-800 shadow'
                    : isMinorComp
                      ? 'bg-slate-800/80 border border-orange-500/50'
                      : isMinorBoost
                        ? 'bg-amber-500/10 border border-amber-500/40'
                        : 'hover:bg-slate-900 opacity-70 hover:opacity-100'
                }`}
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block"
                      style={{ backgroundColor: minorInfo.color }}
                    />
                    {minorInfo.camelot}
                  </div>
                  <div className="text-[11px] text-slate-400 truncate">{minor}</div>
                </div>
                {isMinorComp && !isMinorSelected && (
                  <span className="text-[10px] text-orange-400 font-semibold">Match</span>
                )}
                {isMinorBoost && (
                  <span className="text-[10px] text-amber-400 font-semibold">Boost</span>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Harmonic Transition Formula Box */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 sm:p-5">
        <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-orange-400" />
          Harmonic Transition Options from {selectedKey.camelot} ({selectedKey.name}):
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-orange-400 font-bold block mb-1">1. Keep Energy</span>
            <p className="text-slate-300 font-medium">{selectedKey.camelot} ({selectedKey.name})</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Stay on exact same key for perfectly seamless blending.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-blue-400 font-bold block mb-1">2. Adjacent Step (±1)</span>
            <p className="text-slate-300 font-medium">
              {selectedKey.compatibleKeys[0]} & {selectedKey.compatibleKeys[2]}
            </p>
            <p className="text-slate-400 text-[11px] mt-0.5">Move 1 hour up or down on the wheel for gradual mood transition.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-emerald-400 font-bold block mb-1">3. Relative Major/Minor</span>
            <p className="text-slate-300 font-medium">{selectedKey.relativeKey}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Switch between happy (Major B) and emotional (Minor A) mood.</p>
          </div>
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">4. Energy Boost (+2 Semitones)</span>
            <p className="text-slate-300 font-medium">{selectedKey.energyBoostKey}</p>
            <p className="text-slate-400 text-[11px] mt-0.5">Lifts the dance floor energy instantly for drop or peak time mixing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
