import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { AudioWaveform, Check, Cpu, FileAudio, ShieldCheck } from 'lucide-react';

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
      ? 'WAV / FLAC 无损采样与 Loops 调性 BPM 检测器 (制作人专用 · 零上传) | Camelot BPM Studio'
      : 'Free WAV & FLAC Key & BPM Finder for Music Producers | Offline Sample & Loop Analyzer',
    description: isZh
      ? '专为音乐制作人、Beatmaker 与采样师打造的免费浏览器端 WAV/FLAC/AIFF/OGG 调性与高精度 BPM 检测器。100% 本地内存解码，未发行 Stems 与工程零上传，支持整文件夹批量拖拽导出 CSV。'
      : 'Free in-browser key and BPM analyzer built for music producers. Locally decode lossless WAV, FLAC, AIFF, OGG, M4A & MP3 stems, loops, and sample packs with zero server uploads, confidence scores, and CSV export.',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale === 'en' ? '' : `${locale}/`}wav-flac-key-bpm-finder`,
    },
  };
}

export default async function WavFlacKeyBpmFinderPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === 'zh';

  const pageUrl = `${envConfigs.app_url}/${locale === 'en' ? '' : `${locale}/`}wav-flac-key-bpm-finder`;

  const faqs = [
    {
      question:
        'Can I analyze lossless WAV and FLAC stems or loops without uploading them to a server?',
      answer:
        'Yes. Camelot BPM Studio decodes WAV, FLAC, OGG, M4A, AAC, and MP3 directly inside your browser AudioContext memory. Zero bytes ever leave your computer, making it completely safe for unreleased label demos, client stems, and commercial sample packs.',
    },
    {
      question:
        'How does the analyzer handle electronic loops, synths, and basslines?',
      answer:
        'Our engine mixes stereo channels to mono, runs anti-aliased downsampling + 4096-point Hann-windowed FFT chromagram extraction across 55Hz–2200Hz (capturing basslines, chords, and leads), and computes dual-band bass + transient onset autocorrelation with parabolic interpolation for decimal BPM precision.',
    },
    {
      question: 'Can I batch analyze an entire sample pack folder and export a spreadsheet?',
      answer:
        'Yes. Drag an entire sample folder directly onto the drop zone to batch analyze up to 20 files free (or unlimited with Pro) and export every filename, Camelot key, musical key, decimal BPM, and detection confidence to CSV in 1 click.',
    },
  ];

  const formats = [
    {
      format: 'WAV (Uncompressed PCM)',
      useCase: 'DAW bounces, drum loops, vocal stems, Ableton/FL Studio exports',
      analysis: 'Full local PCM decode + FFT Key & Decimal BPM',
      exportSupport: 'CSV & M3U8 Export',
    },
    {
      format: 'FLAC (Lossless)',
      useCase: 'Mastering masters, Bandcamp lossless crates, hi-res DJ libraries',
      analysis: 'Native browser Web Audio decode (0 upload)',
      exportSupport: 'CSV & M3U8 Export',
    },
    {
      format: 'MP3 (128–320 kbps)',
      useCase: 'DJ promos, demos, club sets, finished releases',
      analysis: 'Instant local decode + Camelot & BPM',
      exportSupport: 'CSV, M3U8 + Direct ID3 TKEY/TBPM Write',
    },
    {
      format: 'M4A / AAC / OGG',
      useCase: 'Apple Music exports, voice memos, game audio assets',
      analysis: 'Native browser Web Audio decode (0 upload)',
      exportSupport: 'CSV & M3U8 Export',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <SchemaJsonLd
          pageTitle="Free WAV & FLAC Key & BPM Finder for Music Producers"
          pageDescription="100% client-side WAV, FLAC, OGG, M4A & MP3 key and BPM analyzer for music producers, loops, and unreleased stems. Zero uploads, folder batching, CSV export."
          pageUrl={pageUrl}
          faqs={faqs}
        />

        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
            <AudioWaveform className="w-3.5 h-3.5" />
            <span>LOSSLESS WAV &amp; FLAC ANALYZER FOR MUSIC PRODUCERS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {isZh
              ? 'WAV / FLAC 采样与 Stems 本地调性 BPM 分析器'
              : 'Free WAV & FLAC Key & BPM Finder for Producers'}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isZh ? (
              <>
                专为音乐制作人、Beatmaker 与采样包整理打造的纯浏览器无损音频分析工具。支持直接拖入{' '}
                <strong className="text-slate-900 dark:text-white">WAV、FLAC、OGG、M4A、MP3 采样文件夹</strong>，在本地内存通过 4096 点 FFT 色度图侦测精确大/小调、Camelot 调性与小数级 BPM，
                <strong className="text-emerald-600 dark:text-emerald-400">未发行工程与 Stems 零字节上传</strong>。
              </>
            ) : (
              <>
                Built for music producers, beatmakers, and sound designers who refuse to upload unreleased stems or sample packs to third-party servers.
                Locally decode <strong className="text-slate-900 dark:text-white">lossless WAV, FLAC, OGG, M4A, and MP3 folders</strong> in browser RAM — get exact musical keys, Camelot notation, decimal BPM, confidence scores, and 1-click CSV export with{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">zero uploads</strong>.
              </>
            )}
          </p>
        </div>

        {/* Embedded DropZone */}
        <AudioDropZone maxFreeTracks={20} />

        {/* Format Compatibility Table */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              <FileAudio className="w-4 h-4" />
              <span>Supported Lossless &amp; Studio Formats</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isZh
                ? '支持的无损格式与制作人导出工作流'
                : 'Supported Studio Formats & Producer Export Workflow'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[620px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Audio Format</th>
                  <th className="py-3 px-4 font-semibold">Best Producer Use Case</th>
                  <th className="py-3 px-4 font-semibold">Local Decoding Engine</th>
                  <th className="py-3 px-4 font-semibold">Export Options</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {formats.map((f, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                      {f.format}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{f.useCase}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <Check className="w-3.5 h-3.5" />
                        {f.analysis}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-indigo-600 dark:text-indigo-400">
                      {f.exportSupport}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <ComparativeTable />
        <FaqAccordion />
      </div>
    </div>
  );
}
