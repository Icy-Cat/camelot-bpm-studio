import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Download, FileAudio, FolderSync, ShieldCheck, Sparkles, Zap } from 'lucide-react';

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
      ? '批量 BPM 节拍与调性测速器 (多歌曲文件夹拖拽) | Camelot BPM Studio'
      : 'Batch BPM & Key Finder Online | Multi-Track Audio Analyzer (Free)',
    description: isZh
      ? '支持批量拖拽多首 MP3/WAV/FLAC 或整文件夹，免登录快速测出每首歌的精确 BPM 与 Camelot 调性，一键导出 CSV 表格。100% 浏览器本地运算，保护隐私。'
      : 'Batch detect BPM tempo and musical key for multiple audio tracks simultaneously in your browser. 100% client-side, zero upload, decimal precision, CSV export.',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale}/batch-bpm-finder`,
    },
  };
}

export default async function BatchBpmFinderPage({
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
        pageTitle="Batch BPM & Key Finder Online | Multi-Track Audio Analyzer"
        pageDescription="Batch detect BPM tempo and musical key for multiple songs at once. 100% client-side Web Audio API, CSV crate export, zero uploads."
        pageUrl={`${envConfigs.app_url}/${locale}/batch-bpm-finder`}
      />

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
          <FolderSync className="w-3.5 h-3.5" />
          <span>MULTI-TRACK BATCH PROCESSING</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
          {isZh ? '批量 BPM 与调性在线测速器' : 'Batch BPM & Key Finder Online'}
        </h1>

        <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
          {isZh ? (
            <>
              一次性拖入多首曲目或整文件夹，批量快速计算 <strong>高精度 BPM（支持一位小数）</strong>、音调及 <strong>Camelot 轮盘代码</strong>。
              完全免除单首文件繁琐上传，支持 <strong>一键导出 CSV 曲库清单</strong> 与直接写入 ID3 标签。
            </>
          ) : (
            <>
              Drop multiple files or entire playlist folders at once to batch analyze <strong>decimal-accurate BPM</strong>, musical keys, and <strong>Camelot wheel notations</strong>.
              Zero upload queues, instant multi-threaded browser processing, and <strong>1-click CSV crate export</strong>.
            </>
          )}
        </p>
      </div>

      {/* Embedded Drop Zone */}
      <AudioDropZone maxFreeTracks={20} />

      {/* Workflow Steps */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          {isZh ? '三步完成整套 DJ 曲库批量梳理' : 'How Batch DJ Crate Prep Works'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 text-sm">
              1
            </div>
            <h3 className="font-bold text-white text-base">Drop Multi-Tracks</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Drag up to 20 MP3, WAV, or FLAC tracks simultaneously into the drop zone. No registration or account required.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 text-sm">
              2
            </div>
            <h3 className="font-bold text-white text-base">Instant In-Browser Analysis</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your browser's Web Audio thread processes each track in parallel, identifying transients, tempo, and Camelot pitch classes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-sm">
              3
            </div>
            <h3 className="font-bold text-white text-base">Export Crate or ID3 Tags</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Download the structured CSV spreadsheet for Excel / Notion, or write tags straight into your audio files for Pioneer Rekordbox.
            </p>
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
