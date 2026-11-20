import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ArrowUpDown, Disc, ListMusic, Sparkles } from 'lucide-react';

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
      ? 'DJ 谐音混音歌单自动排序器 (Camelot + BPM 顺滑排歌 + M3U8 导出) | Camelot BPM Studio'
      : 'DJ Harmonic Playlist Sorter & Set Planner | Auto-Order by Camelot Key & BPM',
    description: isZh
      ? '在浏览器本地批量分析音频的 Camelot 调性与 BPM，利用 2-opt 谐音路径算法自动排出最顺滑的 DJ 演播顺序，支持一键导出 M3U8 歌单与 CSV，零上传保护曲库隐私。'
      : 'Analyze your tracks for Camelot key and BPM locally in your browser, automatically sort your DJ setlist into the smoothest harmonic mixing order, and export M3U8 or CSV playlists for Rekordbox & Serato.',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale === 'en' ? '' : `${locale}/`}harmonic-playlist-sorter`,
    },
  };
}

export default async function HarmonicPlaylistSorterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === 'zh';

  const pageUrl = `${envConfigs.app_url}/${locale === 'en' ? '' : `${locale}/`}harmonic-playlist-sorter`;

  const faqs = [
    {
      question:
        'How does the Harmonic Playlist Sorter calculate the smoothest DJ set order?',
      answer:
        'Our client-side optimizer models every track pair with a music-theory transition cost combining Camelot wheel compatibility (Exact Key, ±1 Adjacent Step, Relative Major/Minor, +2 Energy Boost, and +1 Semitone Lift) plus BPM proximity (including half/double-time bridging), then runs multi-start Nearest-Neighbor + 2-opt refinement to find the cleanest full-set sequence.',
    },
    {
      question: 'Can I export the sorted playlist to Rekordbox, Serato, or Engine DJ?',
      answer:
        'Yes. You can export your ordered crate directly as a standard M3U8 playlist file (#EXTM3U with Camelot key & BPM annotations) or CSV spreadsheet completely free, and Pro users can also download all tracks as ID3-tagged MP3s in one ZIP archive.',
    },
    {
      question: 'Does sorting my DJ playlist upload my music files?',
      answer:
        'No. Audio decoding, key/BPM detection, harmonic path optimization, and M3U8/CSV export all execute 100% inside your web browser with zero server uploads.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <SchemaJsonLd
          pageTitle="DJ Harmonic Playlist Sorter & Set Planner"
          pageDescription="Auto-sort DJ crates by Camelot wheel harmonic transitions and smooth BPM progression in-browser. Exports M3U8 playlists and CSV with zero server uploads."
          pageUrl={pageUrl}
          faqs={faqs}
        />

        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 text-xs font-semibold">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>AUTOMATIC HARMONIC SETLIST OPTIMIZER · M3U8 &amp; CSV</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {isZh
              ? 'DJ 谐音混音歌单自动排序与编排器'
              : 'DJ Harmonic Playlist Sorter & Set Planner'}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isZh ? (
              <>
                一次性拖入整套备选曲库，浏览器纯端侧测出每首歌的 <strong className="text-slate-900 dark:text-white">Camelot 调性与精确 BPM</strong>，一键自动排布最顺滑的谐音混音出歌顺序，标注每一首之间的过渡类型（同调 / ±1 邻调 / 关系大小调 / 能量拉升 +2），并支持直接导出{' '}
                <strong className="text-cyan-700 dark:text-cyan-400">M3U8 歌单与 CSV</strong>。
              </>
            ) : (
              <>
                Drop your DJ crate to analyze <strong className="text-slate-900 dark:text-white">Camelot keys and exact BPM locally in your browser</strong>, automatically arrange tracks into the smoothest harmonic mixing sequence with per-track transition badges, and export ready-to-import{' '}
                <strong className="text-cyan-700 dark:text-cyan-400">M3U8 playlists &amp; CSV sheets</strong> for Rekordbox and Serato.
              </>
            )}
          </p>
        </div>

        {/* Embedded DropZone */}
        <AudioDropZone maxFreeTracks={20} />

        {/* Transition Scoring Explanation */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-700 dark:text-cyan-400">
              <Sparkles className="w-4 h-4" />
              <span>Harmonic Path Optimization Rules</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isZh
                ? '智能排歌算法如何评估每一组接歌过渡？'
                : 'How Our Harmonic Set Sorter Scores Every Transition'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-bold">
                Exact Key (8A → 8A)
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Zero harmonic friction. Prioritized for extended vocal blends, mashups, and hypnotic deep-house layering.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-bold">
                ±1 Step / Relative Mood
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                8A → 7A/9A or 8A ↔ 8B shifts harmony by a fifth or switches minor/major emotion without key clashing.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold">
                Energy Boost (+2 / +7)
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                8A → 10A (+2 hours) or +1 semitone lifts peak-time crowd energy cleanly when stepping up BPM.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="inline-block px-2 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold">
                Smooth BPM + Half/Double
              </span>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Minimizes pitch-fader jumps (&lt;6 BPM) and recognizes half/double bridges like 70 ↔ 140 BPM automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Wheel */}
        <CamelotWheelVisualizer />

        <FaqAccordion />
      </div>
    </div>
  );
}
