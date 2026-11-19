import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Cpu, Lock, ShieldCheck, Sparkles, Terminal, WifiOff } from 'lucide-react';

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
      ? '100% 浏览器纯端侧音频分析器 (零上传/隐私保护) | Camelot BPM Studio'
      : 'Offline Audio Analyzer | 100% Client-Side Song Key & BPM Finder',
    description: isZh
      ? '不上传任何文件的在线音频分析工具。通过 HTML5 Web Audio API 在浏览器本地分析 BPM 与调性，未发行 Demo、私密工程与商用音频 100% 隐私安全。'
      : 'A privacy-first song key and BPM finder that never uploads your files to any server. Analyzes audio 100% locally in browser memory via HTML5 Web Audio API.',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale}/offline-audio-analyzer`,
    },
  };
}

export default async function OfflineAudioAnalyzerPage({
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
        pageTitle="Offline Audio Analyzer | 100% Client-Side Song Key & BPM Finder"
        pageDescription="Analyze audio BPM and musical key completely offline in your browser. Powered by HTML5 Web Audio API with zero cloud uploads."
        pageUrl={`${envConfigs.app_url}/${locale}/offline-audio-analyzer`}
      />

      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          <WifiOff className="w-3.5 h-3.5" />
          <span>ZERO-UPLOAD CLIENT-SIDE PRIVACY</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          {isZh ? '100% 浏览器纯端侧音频分析器' : '100% Client-Side Offline Audio Analyzer'}
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
          {isZh ? (
            <>
              市场上绝大多数在线 BPM/Key 检测网站都会将您的 MP3 完整上传至云端服务器，给未发行的 Demo 和商业工程带来泄露风险。
              Camelot BPM Studio 运行于 <strong className="text-slate-900 dark:text-white">浏览器端侧沙盒（Web Audio API）</strong> —{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">音频文件 0 字节上传</strong>，离线可用，绝对安全。
            </>
          ) : (
            <>
              Unlike traditional online converters that upload your entire audio file to remote servers,
              Camelot BPM Studio processes audio strictly inside your browser's local sandbox memory.{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">Zero bytes are uploaded</strong> — completely safe for unreleased VIPs, stems, and confidential recordings.
            </>
          )}
        </p>
      </div>

      {/* Embedded Drop Zone */}
      <AudioDropZone maxFreeTracks={20} />

      {/* Technical Architecture Breakdown */}
      <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Cpu className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          {isZh ? '端侧技术原理：为什么我们能做到 100% 免上传？' : 'How Client-Side In-Browser Audio Analysis Works'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-700 dark:text-slate-300">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4" />
              <span>1. Local File Ingestion</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              When you drop a file, the browser accesses its binary stream via standard HTML5 File APIs. No network HTTP request is ever dispatched.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-sm">
              <Cpu className="w-4 h-4" />
              <span>2. AudioContext Decoding</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your device's hardware decodes the MP3/WAV into raw 32-bit floating point PCM audio buffers directly in system RAM at lightning speed.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-2 text-sm">
              <Terminal className="w-4 h-4" />
              <span>3. Math Extraction in Sandbox</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Mathematical algorithms compute FFT chromagram pitch vectors and normalized peak autocorrelation locally, yielding exact Key and BPM in milliseconds.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <ComparativeTable />

      {/* FAQ */}
      <FaqAccordion />
      </div>
    </div>
  );
}
