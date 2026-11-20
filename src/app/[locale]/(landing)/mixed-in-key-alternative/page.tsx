import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Check, Crown, Disc, ShieldCheck, Sparkles, X } from 'lucide-react';

import { envConfigs } from '@/config';
import { AudioDropZone } from '@/shared/components/audio/AudioDropZone';
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
      ? 'Mixed In Key 免费网页平替 (2026) — 免安装 Camelot 调性、BPM 与 ID3 标签 | Camelot BPM Studio'
      : 'Best Free Browser Alternative to Mixed In Key (2026) | Camelot Key, BPM & ID3 Tags',
    description: isZh
      ? '不想花 $58 购买并安装 Mixed In Key？Camelot BPM Studio 提供免费免登录、100% 浏览器纯端侧 Camelot 调性与 BPM 批量检测，支持 $14.99 终身买断批量写回 MP3 ID3 标签与谐音排序。'
      : 'Looking for a free or affordable browser-based alternative to Mixed In Key ($58)? Analyze up to 20 tracks free with zero login & zero server upload, or unlock Pro batch ID3 TKEY/TBPM tagging and harmonic sorting for $14.99 lifetime.',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale === 'en' ? '' : `${locale}/`}mixed-in-key-alternative`,
    },
  };
}

export default async function MixedInKeyAlternativePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === 'zh';

  const pageUrl = `${envConfigs.app_url}/${locale === 'en' ? '' : `${locale}/`}mixed-in-key-alternative`;

  const faqs = [
    {
      question:
        'What is the best free browser-based alternative to Mixed In Key without installing software?',
      answer:
        'Camelot BPM Studio runs 100% inside your web browser using the Web Audio API with zero installation, zero account, and zero file uploads. It detects Camelot wheel keys (8A, 8B, 11B) and decimal BPM for up to 20 tracks at once for free, with CSV and M3U8 export included.',
    },
    {
      question: 'How does Camelot BPM Studio Pro compare to Mixed In Key on price?',
      answer:
        'Mixed In Key costs $58 as a paid desktop download and Crate Cleaner desktop costs $79. Camelot BPM Studio is free for everyday analysis (up to 20 tracks per batch) and offers a $14.99 one-time Lifetime Pro unlock for unlimited folder batches, batch MP3 ID3 TKEY/TBPM ZIP export, and automatic harmonic playlist sorting — saving $43+.',
    },
    {
      question: 'Does Camelot BPM Studio upload my DJ library to the cloud?',
      answer:
        'Never. Unlike cloud DJ managers that require uploading your music to external servers, all decoding, FFT chromagram key detection, BPM calculation, and ID3 tag writing happen locally in your browser RAM.',
    },
  ];

  const rows = [
    {
      metric: 'Price Model',
      ours: '$0 Free · $14.99 Lifetime Pro',
      mik: '$58.00 Desktop License',
      crateCleaner: '$79.00 Mac App',
      scratchStorage: 'Free (Cloud Account)',
    },
    {
      metric: 'Installation Required',
      ours: 'No — 100% Browser Web App',
      mik: 'Yes (macOS / Windows installer)',
      crateCleaner: 'Yes (macOS app for tagging)',
      scratchStorage: 'No (Browser)',
    },
    {
      metric: 'Audio Privacy (Zero Upload)',
      ours: '100% Client-Side RAM (0 upload)',
      mik: 'Local Desktop',
      crateCleaner: 'Local',
      scratchStorage: 'Uploads music to cloud storage',
    },
    {
      metric: 'Account Required to Start',
      ours: 'No Login Needed for Free Tier',
      mik: 'License key activation',
      crateCleaner: 'License key for desktop',
      scratchStorage: 'Account required',
    },
    {
      metric: 'Camelot Wheel (8A / 8B) + BPM',
      ours: 'Yes + Decimal BPM + ×2/÷2 Fix',
      mik: 'Yes (Camelot creator)',
      crateCleaner: 'Yes',
      scratchStorage: 'Yes',
    },
    {
      metric: 'Write MP3 ID3 Tags (TKEY / TBPM)',
      ours: 'Yes — In-Browser Single & Batch ZIP',
      mik: 'Yes (Desktop)',
      crateCleaner: 'Desktop app only',
      scratchStorage: 'Cloud USB export',
    },
    {
      metric: 'Harmonic Set Order Sorter + M3U8',
      ours: 'Yes (2-opt Camelot + BPM Sorter)',
      mik: 'No built-in auto-sorter',
      crateCleaner: 'No',
      scratchStorage: 'Manual playlists',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <SchemaJsonLd
          pageTitle="Best Free Browser Alternative to Mixed In Key (2026)"
          pageDescription="Compare Camelot BPM Studio vs Mixed In Key ($58), Crate Cleaner ($79), and cloud DJ tools. Free client-side Camelot key & BPM finder with $14.99 lifetime Pro ID3 tagging."
          pageUrl={pageUrl}
          faqs={faqs}
        />

        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" />
            <span>SAVE $43 VS MIXED IN KEY ($58) · ZERO INSTALL</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {isZh
              ? 'Mixed In Key 免费网页平替方案（2026 对比）'
              : 'Best Free Browser Alternative to Mixed In Key'}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isZh ? (
              <>
                想获得 Mixed In Key 同款 <strong className="text-slate-900 dark:text-white">Camelot 8A/8B 调性轮盘、高精度 BPM 与 ID3 标签回写</strong>，但不想花 $58 安装桌面软件，也不想把未发行曲库上传到云端？
                Camelot BPM Studio 免费版 <strong className="text-emerald-600 dark:text-emerald-400">免登录零上传</strong>即刻批量测 20 首，Pro 终身买断仅需 <strong className="text-orange-600 dark:text-orange-400">$14.99</strong>。
              </>
            ) : (
              <>
                Want <strong className="text-slate-900 dark:text-white">Camelot Wheel notation (8A, 11B), decimal BPM detection, harmonic set sorting, and direct MP3 ID3 TKEY/TBPM tagging</strong> without paying $58 for a desktop app or uploading your library to the cloud?
                Start <strong className="text-emerald-600 dark:text-emerald-400">100% free with zero signup</strong>, or unlock lifetime Pro crate prep for <strong className="text-orange-600 dark:text-orange-400">$14.99 one-time</strong>.
              </>
            )}
          </p>
        </div>

        {/* Embedded Tool */}
        <AudioDropZone maxFreeTracks={20} />

        {/* Head-to-Head Comparison Matrix */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <Sparkles className="w-4 h-4" />
              <span>2026 DJ Crate Prep Benchmark</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isZh
                ? 'Camelot BPM Studio vs Mixed In Key / Crate Cleaner / 云端工具'
                : 'Camelot BPM Studio vs Mixed In Key & Other Alternatives'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Feature</th>
                  <th className="py-3 px-4 font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 border-x border-orange-500/20">
                    Camelot BPM Studio
                  </th>
                  <th className="py-3 px-4 font-semibold">Mixed In Key ($58)</th>
                  <th className="py-3 px-4 font-semibold">Crate Cleaner ($79)</th>
                  <th className="py-3 px-4 font-semibold">Cloud DJ Apps</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {rows.map((r, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-200">
                      {r.metric}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-orange-700 dark:text-orange-300 bg-orange-500/5 border-x border-orange-500/20">
                      <div className="flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-orange-600 dark:text-orange-400 shrink-0" />
                        <span>{r.ours}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{r.mik}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{r.crateCleaner}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">{r.scratchStorage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <FaqAccordion />
      </div>
    </div>
  );
}
