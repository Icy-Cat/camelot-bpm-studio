import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Activity, ArrowLeftRight, CheckCircle2, HelpCircle, Layers, Sliders, Zap } from 'lucide-react';

import { envConfigs } from '@/config';
import { AudioDropZone } from '@/shared/components/audio/AudioDropZone';
import { ComparativeTable } from '@/shared/components/audio/ComparativeTable';
import { FaqAccordion } from '@/shared/components/audio/FaqAccordion';
import { SchemaJsonLd } from '@/shared/components/audio/SchemaJsonLd';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === 'zh';

  return {
    title: isZh
      ? '半速与双倍速 BPM 智能校准器 (70 vs 140 BPM 纠错) | Camelot BPM Studio'
      : 'Half / Double Tempo BPM Fixer | 70 vs 140 BPM Resolver for DJs',
    description: isZh
      ? '为什么 140 BPM 的 Trap/Dubstep 会被测成 70 BPM？Camelot BPM Studio 提供一键 ×2 与 ÷2 批量节拍校准，彻底解决 DJ 混音半速与双速冲突。'
      : 'Why does a 140 BPM song show up as 70 BPM? Fix half-time and double-time tempo confusion in Trap, Dubstep, and DnB with 1-click x2 and /2 controls.',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale}/tempo-half-double-fix`,
    },
  };
}

export default async function TempoHalfDoubleFixPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <SchemaJsonLd
        pageTitle="Half / Double Tempo BPM Fixer | 70 vs 140 BPM Resolver"
        pageDescription="Resolve 70 vs 140 BPM and 87 vs 174 BPM half-time tempo confusion. 1-click instant x2 and /2 batch multipliers for Rekordbox DJ crates."
        pageUrl={`${envConfigs.app_url}/${locale}/tempo-half-double-fix`}
      />

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5" />
          <span>TEMPO HALVING & DOUBLING FIXER</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          {isZh ? '半速与双倍速 BPM 在线校准器' : 'Half / Double Tempo BPM Fixer'}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          {isZh ? (
            <>
              为什么 140 BPM 的 Trap 或 Dubstep 会被识别成 70 BPM？为什么 174 BPM 的 Drum & Bass 会显示成 87 BPM？
              在 Camelot BPM Studio 中拖入曲目，即可享受 <strong>一键 ×2 与 ÷2 瞬时倍速校准</strong>，告别 Rekordbox 与 Serato 的对拍网格错位。
            </>
          ) : (
            <>
              Why does a 140 BPM Dubstep track get detected as 70 BPM? Why does 174 BPM Drum & Bass show up as 87 BPM?
              Drop your tracks into Camelot BPM Studio and use our <strong>instant 1-click ×2 and ÷2 tempo toggles</strong> to eliminate half-time grid misalignment in Rekordbox & Serato.
            </>
          )}
        </p>
      </div>

      {/* Embedded Drop Zone */}
      <AudioDropZone maxFreeTracks={20} />

      {/* Deep Dive Guide */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-purple-400" />
          {isZh ? '为什么计算器会测错半速？科学原理解析' : 'The Science Behind 70 vs 140 BPM Detection'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-300">
          <div className="space-y-3">
            <h3 className="font-bold text-white text-base">The "Half-Time Feel" Conundrum</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              In genres like Trap, Hip-Hop, and Dubstep, producers typically lay down drums where the snare only lands on beat 3 (instead of beats 2 and 4 in standard 4/4 House).
            </p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated Fourier onset detectors listen to peak snare transients. Because there is only one snare per measure, the algorithm mathematically counts 70 peak intervals per minute instead of 140.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="font-bold text-white text-base">Popular Genre BPM Standards</h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-slate-200">Dubstep / Riddim:</span>
                <span className="text-orange-400 font-mono">140 BPM (often misdetected as 70)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-slate-200">Drum & Bass / Jungle:</span>
                <span className="text-blue-400 font-mono">170 - 176 BPM (misdetected as 85-88)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-slate-200">Trap / Drill:</span>
                <span className="text-purple-400 font-mono">130 - 148 BPM (misdetected as 65-74)</span>
              </div>
              <div className="flex justify-between p-2 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="font-semibold text-slate-200">House / Techno:</span>
                <span className="text-emerald-400 font-mono">124 - 132 BPM (standard 4-on-the-floor)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <ComparativeTable />

      {/* FAQ */}
      <FaqAccordion />
    </div>
  );
}
