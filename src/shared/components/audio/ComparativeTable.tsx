'use client';

import React from 'react';
import { Check, X, Shield, Zap, Sparkles } from 'lucide-react';

export function ComparativeTable() {
  const comparisonData = [
    {
      feature: 'Server Upload & Privacy',
      camelotBpm: '100% Client-Side (0 upload)',
      mixedInKey: 'Local desktop only',
      rekordbox: 'Local desktop only',
      vocalRemover: 'Uploads full audio to server',
      audiotoolz: 'Uploads audio to server',
      highlight: true,
    },
    {
      feature: 'Price & License Model',
      camelotBpm: 'Free (Pro $14.99 Lifetime)',
      mixedInKey: '$58.00 USD (Paid desktop)',
      rekordbox: 'Subscription ($15+/mo)',
      vocalRemover: 'Limited free / Ads',
      audiotoolz: 'Free (Ad-supported)',
      highlight: true,
    },
    {
      feature: 'Batch Audio Analysis',
      camelotBpm: 'Up to 20 tracks free (Unlimited Pro)',
      mixedInKey: 'Unlimited',
      rekordbox: 'Unlimited',
      vocalRemover: 'Single file only (No batch)',
      audiotoolz: 'Single file only',
      highlight: false,
    },
    {
      feature: 'Camelot Wheel Notation',
      camelotBpm: 'Yes (8A, 8B, 11B, etc.)',
      mixedInKey: 'Yes (Proprietary license)',
      rekordbox: 'Key / Alphanumeric',
      vocalRemover: 'Musical key only (No Camelot)',
      audiotoolz: 'Musical key only',
      highlight: false,
    },
    {
      feature: 'Half / Double Tempo Fix',
      camelotBpm: 'Instant 1-Click (×2 / ÷2)',
      mixedInKey: 'Manual edit',
      rekordbox: 'Grid adjust menu',
      vocalRemover: 'Not supported',
      audiotoolz: 'Not supported',
      highlight: false,
    },
    {
      feature: 'In-Browser ID3 Tag Writing',
      camelotBpm: 'Yes (Direct TKEY / TBPM)',
      mixedInKey: 'Yes (Desktop)',
      rekordbox: 'Proprietary XML/Database',
      vocalRemover: 'No tag export',
      audiotoolz: 'No tag export',
      highlight: false,
    },
    {
      feature: 'Account & Login Required',
      camelotBpm: 'No Login Required for Free',
      mixedInKey: 'License activation required',
      rekordbox: 'Pioneer DJ account login',
      vocalRemover: 'No account',
      audiotoolz: 'No account',
      highlight: true,
    },
  ];

  return (
    <div className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-400">
          <Zap className="w-4 h-4" />
          <span>Feature & Performance Comparison</span>
        </div>
        <h3 className="text-xl font-bold text-white tracking-tight">
          How Camelot BPM Studio Compares to Industry Standards
        </h3>
        <p className="text-sm text-slate-400">
          Why professional DJs and music producers switch from bulky desktop installers and server-upload converters.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/70 text-xs text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4 font-semibold">Evaluation Criteria</th>
              <th className="py-3 px-4 font-bold text-orange-400 bg-orange-500/10 border-x border-orange-500/20">
                Camelot BPM Studio
              </th>
              <th className="py-3 px-4 font-semibold">Mixed In Key</th>
              <th className="py-3 px-4 font-semibold">Rekordbox</th>
              <th className="py-3 px-4 font-semibold">VocalRemover</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs text-slate-300">
            {comparisonData.map((row, idx) => (
              <tr
                key={idx}
                className={row.highlight ? 'bg-slate-900/40 hover:bg-slate-900/60' : 'hover:bg-slate-900/30'}
              >
                <td className="py-3.5 px-4 font-medium text-slate-200">
                  {row.feature}
                </td>
                <td className="py-3.5 px-4 font-bold text-white bg-orange-500/5 border-x border-orange-500/20">
                  <div className="flex items-center gap-1.5 text-orange-300">
                    <Check className="w-4 h-4 text-orange-400 shrink-0" />
                    <span>{row.camelotBpm}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-400">{row.mixedInKey}</td>
                <td className="py-3.5 px-4 text-slate-400">{row.rekordbox}</td>
                <td className="py-3.5 px-4 text-slate-400">{row.vocalRemover}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-slate-400 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 flex items-start gap-3">
        <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-200 block mb-0.5">Zero Server Upload Guarantee</strong>
          Unlike traditional online audio converters that transmit your files to cloud servers, 
          Camelot BPM Studio analyzes your music directly within your browser's Web Audio sandbox. 
          Your unreleased IDs, stems, and demos never leave your machine.
        </div>
      </div>
    </div>
  );
}
