import React from 'react';

export interface SchemaFaqItem {
  question: string;
  answer: string;
}

interface SchemaJsonLdProps {
  pageTitle: string;
  pageDescription: string;
  pageUrl: string;
  faqs?: SchemaFaqItem[];
}

const DEFAULT_FAQS: SchemaFaqItem[] = [
  {
    question: 'Why does my 140 BPM song show up as 70 BPM?',
    answer:
      'In genres like Trap, Dubstep, and Hip-Hop, kick/snare half-time counting causes tempo halving. Use our one-click "x2" toggle to double the tempo to 140 BPM instantly.',
  },
  {
    question: 'Are my audio files uploaded to any server?',
    answer:
      'No. All audio analysis runs 100% locally in your web browser via the Web Audio API. Your files never leave your computer.',
  },
  {
    question: 'How does Camelot harmonic mixing work?',
    answer:
      'Camelot wheel assigns codes like 8A (A Minor) and 8B (C Major). Harmonically compatible mixes include identical keys (8A to 8A), adjacent numbers (8A to 7A or 9A), relative major/minor (8A to 8B), or energy boost (+2 semitones, 8A to 10A).',
  },
];

export function SchemaJsonLd({
  pageTitle,
  pageDescription,
  pageUrl,
  faqs,
}: SchemaJsonLdProps) {
  const faqItems = faqs && faqs.length > 0 ? faqs : DEFAULT_FAQS;

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebApplication',
        '@id': `${pageUrl}#webapp`,
        name: pageTitle,
        description: pageDescription,
        url: pageUrl,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'All (Web Browser)',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          '100% In-Browser Audio Analysis (Web Audio API)',
          'Zero Server Uploads & Complete Privacy',
          'BPM Detection with Decimal Precision',
          'Camelot Key Notation (8A, 8B, 11B)',
          'Instant Half and Double Tempo Toggle (x2 / /2)',
          'Batch MP3, WAV, and FLAC Folder Dropping',
          'Direct In-Browser MP3 ID3 TKEY & TBPM Tag Writing',
          'Harmonic Mix Sequence Auto-Sorter',
          'CSV & M3U8 DJ Playlist Export',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
