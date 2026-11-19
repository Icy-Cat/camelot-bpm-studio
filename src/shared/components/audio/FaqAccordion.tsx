'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/accordion';

export function FaqAccordion() {
  const faqs = [
    {
      q: 'Why does my 140 BPM song show up as 70 BPM (or vice versa)?',
      a: 'In modern electronic genres like Dubstep, Trap, Half-time Drum & Bass, and Hip-Hop, the kick drum often hits on beat 1 and the snare hits on beat 3 (half-time feel). Automated beat-tracking algorithms detect intervals between prominent percussive transients and may count at half speed (70 BPM) or double speed (140 BPM). Camelot BPM Studio provides a 1-click "×2" and "÷2" toggle button so you can instantly correct the tempo without re-analyzing.',
    },
    {
      q: 'Are my audio files uploaded to your server when analyzed?',
      a: 'No, absolutely not. Camelot BPM Studio operates 100% locally inside your web browser using HTML5 Web Audio API and client-side WebAssembly. Your files are decoded in browser RAM and are never transmitted to any external server or cloud storage. This makes the tool safe for unreleased VIP edits, confidential stems, and copyright-protected music.',
    },
    {
      q: 'How does Camelot harmonic mixing work (e.g. 8A, 8B)?',
      a: 'The Camelot Wheel simplifies musical keys into numbers (1 to 12) and letters (A for Minor keys, B for Major keys). For example, 8A corresponds to A Minor and 8B corresponds to C Major. For harmonious, clash-free DJ transitions, you can mix tracks that have: the same Camelot key (e.g. 8A -> 8A), adjacent keys (e.g. 8A -> 7A or 9A), relative major/minor keys (e.g. 8A -> 8B), or an energy boost (+2 semitones, e.g. 8A -> 10A).',
    },
    {
      q: 'How do Rekordbox, Serato, and Traktor read the exported tags?',
      a: 'Our Pro version utilizes client-side ID3 frame writers to embed standard ID3v2.3 tags directly into your MP3 files: "TKEY" for the Camelot notation (e.g. "8A - A Minor") and "TBPM" for the calculated tempo. When you drag the tagged files into Rekordbox, Serato DJ Pro, Traktor, or Engine DJ, the software automatically parses these fields without requiring re-analysis.',
    },
    {
      q: 'Is this tool really free without needing an account or login?',
      a: 'Yes! You can drag and drop up to 20 tracks at once, see instant Key, BPM, and Camelot results, and download a CSV crate file completely free without ever creating an account or logging in. Google login is only needed if you wish to purchase the Pro license for batch ID3 tag writing and unlimited folder analysis.',
    },
    {
      q: 'What audio formats are supported for in-browser analysis?',
      a: 'Our browser engine supports all audio formats natively decodable by modern browser Web Audio API: MP3, WAV, FLAC, M4A, AAC, and OGG Vorbis.',
    },
  ];

  return (
    <div id="faq" className="w-full bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs dark:shadow-none">
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
          <HelpCircle className="w-4 h-4" />
          <span>Frequently Asked Questions</span>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          Everything You Need to Know About Camelot & BPM Analysis
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Clear answers to common questions about harmonic mixing, browser security, and DJ crate prep.
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full space-y-2">
        {faqs.map((faq, idx) => (
          <AccordionItem
            key={idx}
            value={`item-${idx}`}
            className="border border-slate-200 dark:border-slate-800/80 rounded-xl px-4 py-1 bg-slate-50 dark:bg-slate-950/50 data-[state=open]:bg-white dark:data-[state=open]:bg-slate-900/70 transition-colors"
          >
            <AccordionTrigger className="text-sm font-semibold text-slate-800 hover:text-slate-950 dark:text-slate-200 dark:hover:text-white text-left hover:no-underline">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1 pb-3">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
