import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Disc, Layers, Music2, ShieldCheck, Sparkles } from 'lucide-react';

import { envConfigs } from '@/config';
import { AudioDropZone } from '@/shared/components/audio/AudioDropZone';
import { CamelotWheelVisualizer } from '@/shared/components/audio/CamelotWheelVisualizer';
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
      ? 'Camelot 调性轮盘在线检测工具 (8A/8B 谐音混音) | Camelot BPM Studio'
      : 'Free Camelot Key Finder for DJs | Harmonic Mixing Wheel (8A, 8B)',
    description: isZh
      ? '在浏览器中免费检测 MP3/WAV 歌曲的 Camelot 调性代码（8A、8B、11A 等）。100% 端侧运算，零上传，直接适配 Rekordbox、Serato DJ Pro 谐音混音曲库整理。'
      : 'Find the Camelot key (8A, 8B, 11B) of any MP3, WAV, or FLAC track instantly in your browser. 100% private client-side audio analysis for flawless harmonic DJ mixing.',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale}/camelot-key-finder`,
    },
  };
}

export default async function CamelotKeyFinderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      <SchemaJsonLd
        pageTitle="Free Camelot Key Finder for DJs | Harmonic Mixing Wheel"
        pageDescription="Detect Camelot key (8A, 8B) in browser with zero server uploads. Client-side audio engine for Rekordbox & Serato crate prep."
        pageUrl={`${envConfigs.app_url}/${locale}/camelot-key-finder`}
      />

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
          <Disc className="w-3.5 h-3.5" />
          <span>HARMONIC MIXING STUDIO</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          {isZh ? 'Camelot 调性在线检测器' : 'Free Online Camelot Key Finder'}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {isZh ? (
            <>
              快速检测任意音频曲目的 <strong className="text-slate-900 dark:text-white">Camelot 轮盘代码（如 8A、8B、11B）</strong> 与传统大/小调名称。
              采用浏览器原生 <strong className="text-slate-900 dark:text-white">Web Audio API 纯端侧计算</strong>，音频文件绝不离开您的设备，全面支持批量拖放与 ID3 标签写入。
            </>
          ) : (
            <>
              Detect the exact <strong className="text-slate-900 dark:text-white">Camelot wheel notation (e.g. 8A, 8B, 11B)</strong> and standard musical keys for any track.
              Powered 100% by browser-native <strong className="text-slate-900 dark:text-white">Web Audio API</strong> — zero server uploads, safe for unreleased demos, and optimized for Rekordbox & Serato harmonic sets.
            </>
          )}
        </p>
      </div>

      {/* Embedded Drop Zone */}
      <AudioDropZone maxFreeTracks={20} />

      {/* Visualizer */}
      <CamelotWheelVisualizer />

      {/* Harmonic Guide Section */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Layers className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          {isZh ? 'DJ 谐音混音 (Harmonic Mixing) 核心规则' : 'The 4 Golden Rules of Harmonic Mixing'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h3 className="font-bold text-orange-600 dark:text-orange-400 text-base">1. Same Key Transition (8A → 8A)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mixing two tracks in the exact same Camelot key results in 100% melodic harmony with zero dissonance. Perfect for long vocal blends and mashups.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h3 className="font-bold text-blue-600 dark:text-blue-400 text-base">2. Adjacent Step (8A → 7A or 9A)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Moving +1 or -1 on the wheel shifts the harmony by a fifth. It creates a smooth, pleasant musical journey without jarring pitch shifts.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-base">3. Relative Major / Minor (8A ↔ 8B)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Switching from A to B (or B to A) maintains the same fundamental notes while shifting mood from emotional (Minor) to uplifting (Major).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
            <h3 className="font-bold text-amber-600 dark:text-amber-400 text-base">4. Energy Boost (+2 Semitones, e.g. 8A → 10A)</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Jumping +2 semitones produces an exhilarating lift on the dancefloor. Ideal for transition into peak-hour festival drops and climax moments.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <FaqAccordion />
      </div>
    </div>
  );
}
