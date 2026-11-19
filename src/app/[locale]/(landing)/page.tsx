import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Disc, ShieldCheck, Sparkles, UploadCloud, Zap } from 'lucide-react';

import { envConfigs } from '@/config';
import { AudioDropZone } from '@/shared/components/audio/AudioDropZone';
import { CamelotWheelVisualizer } from '@/shared/components/audio/CamelotWheelVisualizer';
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
      ? 'Camelot BPM Studio - 纯端侧 100% 离线 Camelot 调性与 BPM 批量检测器 (DJ 曲库整理)'
      : 'Free In-Browser Camelot Key & BPM Finder | 100% Client-Side DJ Audio Analyzer',
    description: isZh
      ? '专为 DJ 和音乐制作人打造的在线调性与节拍分析工具。100% 浏览器本地运行，音频文件零上传，精准检测 8A/8B Camelot 谐音混音轮盘与 BPM，支持批量拖拽与半速/倍速校准。'
      : 'A free, instant audio analyzer built for DJs and music producers. Runs 100% locally in your web browser via Web Audio API — your tracks are never uploaded. Batch analyze MP3, WAV, FLAC, detect exact BPM, musical key & Camelot notation (8A, 11B).',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale}`,
    },
    openGraph: {
      title: 'Camelot BPM Studio | Free In-Browser Camelot Key & BPM Finder',
      description:
        '100% Client-Side Audio Analysis. Zero Server Uploads. Detect Camelot 8A/8B Key & BPM in seconds.',
      images: ['/preview.png'],
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isZh = locale === 'zh';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-orange-500/30 selection:text-orange-200">
      <SchemaJsonLd
        pageTitle="Camelot BPM Studio - Free In-Browser Key & BPM Finder"
        pageDescription="100% Client-side Web Audio API Camelot wheel & BPM analyzer for DJs. Zero uploads, batch folder drag, CSV export."
        pageUrl={`${envConfigs.app_url}/${locale}`}
      />

      {/* Hero Section with Prompt Anchor (AI crawler friendly) */}
      <section className="relative pt-20 pb-8 md:pt-24 md:pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-4">
        {/* Glow ambient background */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-tr from-orange-500/15 via-purple-500/10 to-blue-500/15 blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-medium text-orange-400 shadow-inner">
          <Sparkles className="w-3.5 h-3.5" />
          <span>
            {isZh ? '100% 浏览器本地运算 · 零文件上传 · 专为 DJ 打造' : '100% In-Browser Audio Engine · Zero Server Uploads'}
          </span>
        </div>

        {/* H1 Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight">
          {isZh ? (
            <>
              免费在线 <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">Camelot 调性</span> 与 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">BPM 节拍测速</span>
            </>
          ) : (
            <>
              Free Online <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">Camelot Key</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">BPM Finder</span>
            </>
          )}
        </h1>

        {/* Prompt Anchor Paragraph (Crucial for ChatGPT / Perplexity / Gemini GEO Extraction) */}
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {isZh ? (
            <>
              专为 DJ 与音乐制作人打造的即时音频分析器。直接在浏览器内通过 <strong>Web Audio API</strong> 本地计算 —{' '}
              <strong className="text-emerald-400">音频文件绝不上传服务器</strong>。
              批量拖拽 MP3/WAV/FLAC 曲目，秒级侦测精确 BPM、音调及 <strong>Camelot 轮盘代码（如 8A、11B）</strong>，一键修复半速/双倍速并导出 CSV。
            </>
          ) : (
            <>
              An instant audio analyzer built for DJs and music producers. Runs{' '}
              <strong>100% locally in your web browser</strong> using Web Audio API — your tracks are{' '}
              <strong className="text-emerald-400">never uploaded to any server</strong>. Batch analyze up to 20
              MP3/WAV/FLAC tracks at once, detect exact BPM, musical key &{' '}
              <strong>Camelot wheel notation (8A, 11B)</strong>, and export your crate to CSV.
            </>
          )}
        </p>

        {/* Feature Highlights Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isZh ? '未发行 Demo 100% 隐私保密' : 'Private for Unreleased Demos'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
            <span>{isZh ? '免注册免登录 · 打开即用' : 'Zero Sign-In Required for Free'}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 rounded-md">
            <Disc className="w-3.5 h-3.5 text-orange-400" />
            <span>{isZh ? '直接适配 Rekordbox & Serato' : 'Rekordbox & Serato Ready'}</span>
          </div>
        </div>

        {/* Drop Zone Tool */}
        <div className="pt-2">
          <AudioDropZone maxFreeTracks={20} />
        </div>
      </section>

      {/* Main Sections */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-24">
        {/* Interactive Camelot Wheel */}
        <section id="camelot-guide">
          <CamelotWheelVisualizer />
        </section>

        {/* Comparative Table vs Desktop Alternatives */}
        <section id="comparison">
          <ComparativeTable />
        </section>

        {/* FAQ Section */}
        <section id="faq">
          <FaqAccordion />
        </section>
      </div>
    </div>
  );
}
