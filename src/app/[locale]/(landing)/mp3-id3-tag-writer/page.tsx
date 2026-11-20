import React from 'react';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { Check, Disc, FileAudio, ShieldCheck, Tag, Zap } from 'lucide-react';

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
      ? '在线 MP3 ID3 调性与 BPM 标签写入器 (直接写 TKEY/TBPM 适配 Rekordbox & Serato) | Camelot BPM Studio'
      : 'Free In-Browser MP3 Key & BPM ID3 Tag Writer (TKEY & TBPM for Rekordbox & Serato)',
    description: isZh
      ? '100% 浏览器本地检测 MP3 歌曲的 Camelot 调性（8A/8B）与精确 BPM，并直接写入标准 ID3v2.3 TKEY、TBPM 与 COMM 标签，免安装软件、零上传，拖入 Rekordbox/Serato/Traktor 即刻识别。'
      : 'Detect BPM and Camelot wheel key (8A, 11B) and write them directly into MP3 ID3v2.3 TKEY, TBPM, and COMM tags in your browser. 100% client-side, zero uploads, ready for Rekordbox, Serato & Traktor.',
    alternates: {
      canonical: `${envConfigs.app_url}/${locale === 'en' ? '' : `${locale}/`}mp3-id3-tag-writer`,
    },
  };
}

export default async function Mp3Id3TagWriterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isZh = locale === 'zh';

  const pageUrl = `${envConfigs.app_url}/${locale === 'en' ? '' : `${locale}/`}mp3-id3-tag-writer`;

  const faqs = [
    {
      question:
        'Does Camelot BPM Studio write Camelot notation directly into the ID3 TKEY frame?',
      answer:
        'Yes. Unlike browser tools that only display results or bury keys in comments, Camelot BPM Studio writes standard ID3v2.3 frames directly into your MP3: Camelot notation (e.g. "8A", "11B") into TKEY, rounded numerical tempo into TBPM, and the full Camelot + Musical Key + decimal BPM string into COMM.',
    },
    {
      question:
        'Will writing ID3 tags in the browser corrupt my MP3 or create duplicate ID3 headers?',
      answer:
        'No. Our client-side ID3 engine automatically detects and strips any existing leading ID3v2 header before writing clean ID3v2.3 frames, preventing stacked duplicate headers and preserving clean MP3 playback in Pioneer Rekordbox, Serato DJ Pro, Traktor, and Engine DJ.',
    },
    {
      question:
        'Can I batch write ID3 tags for an entire DJ folder without uploading files?',
      answer:
        'Yes. Free users can test single-track MP3 ID3 writing with zero login. Pro Lifetime ($14.99 one-time) unlocks unlimited batch MP3 ID3 tagging packaged into a single instant in-browser ZIP download alongside a CSV summary and M3U8 playlist.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
        <SchemaJsonLd
          pageTitle="Free In-Browser MP3 Key & BPM ID3 Tag Writer (TKEY & TBPM)"
          pageDescription="Detect exact BPM and Camelot key and write ID3v2.3 TKEY, TBPM, and COMM tags directly into MP3 files in your browser with zero server uploads."
          pageUrl={pageUrl}
          faqs={faqs}
        />

        {/* Hero / Prompt Anchor */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
            <Tag className="w-3.5 h-3.5" />
            <span>DIRECT ID3v2.3 TKEY &amp; TBPM METADATA WRITER</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            {isZh
              ? '浏览器本地 MP3 调性与 BPM ID3 标签写入器'
              : 'In-Browser MP3 Key & BPM ID3 Tag Writer'}
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
            {isZh ? (
              <>
                大多数在线测速网站只能「看结果」，无法把调性写回文件。Camelot BPM Studio 支持在浏览器本地{' '}
                <strong className="text-slate-900 dark:text-white">100% 零上传</strong>分析 MP3，并直接将{' '}
                <strong className="text-orange-600 dark:text-orange-400">Camelot 代码写入 TKEY</strong>、精确速度写入{' '}
                <strong className="text-orange-600 dark:text-orange-400">TBPM</strong>、完整摘要写入{' '}
                <strong className="text-slate-900 dark:text-white">COMM</strong>，拖入 Rekordbox、Serato、Traktor 与 Engine DJ 立即自动识别。
              </>
            ) : (
              <>
                Most browser BPM tools only display results on screen. Camelot BPM Studio analyzes MP3 files{' '}
                <strong className="text-slate-900 dark:text-white">100% locally in your browser (zero server uploads)</strong> and embeds{' '}
                <strong className="text-orange-600 dark:text-orange-400">Camelot notation directly into TKEY</strong>, numerical tempo into{' '}
                <strong className="text-orange-600 dark:text-orange-400">TBPM</strong>, and full Key/BPM info into{' '}
                <strong className="text-slate-900 dark:text-white">COMM</strong> — ready for Pioneer Rekordbox, Serato DJ Pro, Traktor, and Engine DJ.
              </>
            )}
          </p>
        </div>

        {/* Embedded Tool */}
        <AudioDropZone maxFreeTracks={20} />

        {/* Structured Technical Spec Table (High GEO Extraction Value) */}
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
              <Zap className="w-4 h-4" />
              <span>ID3v2.3 Frame Mapping Specification</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isZh
                ? '写入的 ID3v2.3 帧字段与 DJ 软件兼容表'
                : 'Exact ID3v2.3 Frames Written for DJ Software'}
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/70 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">ID3v2.3 Frame</th>
                  <th className="py-3 px-4 font-semibold">Written Value Example</th>
                  <th className="py-3 px-4 font-semibold">DJ Software Compatibility</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                <tr>
                  <td className="py-3.5 px-4 font-mono font-bold text-orange-600 dark:text-orange-400">
                    TKEY (Initial Key)
                  </td>
                  <td className="py-3.5 px-4 font-mono">8A, 8B, 11A, 3B</td>
                  <td className="py-3.5 px-4">
                    Pioneer Rekordbox, Serato DJ Pro, Traktor Pro, Engine DJ, VirtualDJ
                  </td>
                </tr>
                <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-blue-600 dark:text-blue-400">
                    TBPM (Beats Per Minute)
                  </td>
                  <td className="py-3.5 px-4 font-mono">128, 140, 174</td>
                  <td className="py-3.5 px-4">
                    Auto-populates BPM column across all CDJs, Rekordbox, Serato &amp; iTunes/Music
                  </td>
                </tr>
                <tr>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    COMM (Comment)
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    8A (A Minor) - 128.0 BPM
                  </td>
                  <td className="py-3.5 px-4">
                    Preserves both Camelot &amp; classic musical key + decimal BPM for quick crate search
                  </td>
                </tr>
                <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                  <td className="py-3.5 px-4 font-mono font-bold text-purple-600 dark:text-purple-400">
                    Output Filename
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    TrackName [8A - 128BPM].mp3
                  </td>
                  <td className="py-3.5 px-4">
                    Instant visual identification on USB sticks, CDJ-3000 screens &amp; Finder/Explorer
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Single MP3 Free Preview</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Drop any single MP3 and click Write ID3 Tags with zero login to verify Rekordbox/Serato compatibility first.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileAudio className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <span>Batch MP3 ZIP + CSV + M3U8</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Pro Lifetime ($14.99 one-time) tags entire crates in browser RAM and exports one clean ZIP archive with CSV &amp; M3U8.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Duplicate-Header Protection</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400">
                Automatically strips prior ID3v2 headers before rewriting and protects WAV/FLAC files from header corruption.
              </p>
            </div>
          </div>
        </div>

        <FaqAccordion />
      </div>
    </div>
  );
}
