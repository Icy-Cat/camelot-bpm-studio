import React from 'react';

interface SchemaJsonLdProps {
  pageTitle: string;
  pageDescription: string;
  pageUrl: string;
}

export function SchemaJsonLd({
  pageTitle,
  pageDescription,
  pageUrl,
}: SchemaJsonLdProps) {
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
          '100% In-Browser Audio Analysis',
          'Zero Server Uploads & Complete Privacy',
          'BPM Detection with Decimal Precision',
          'Camelot Key Notation (8A, 8B, 11B)',
          'Instant Half and Double Tempo Toggle (x2 / /2)',
          'Batch MP3, WAV, and FLAC Folder Dropping',
          'CSV Crate Export',
          'ID3 Tag Writing for Rekordbox and Serato',
        ],
      },
      {
        '@type': 'FAQPage',
        '@id': `${pageUrl}#faq`,
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Why does my 140 BPM song show up as 70 BPM?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'In genres like Trap, Dubstep, and Hip-Hop, kick/snare half-time counting causes tempo halving. Use our one-click "x2" toggle to double the tempo to 140 BPM instantly.',
            },
          },
          {
            '@type': 'Question',
            name: 'Are my audio files uploaded to any server?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. All audio analysis runs 100% locally in your web browser via the Web Audio API. Your files never leave your computer.',
            },
          },
          {
            '@type': 'Question',
            name: 'How does Camelot harmonic mixing work?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Camelot wheel assigns codes like 8A (A Minor) and 8B (C Major). Harmonically compatible mixes include identical keys (8A to 8A), adjacent numbers (8A to 7A or 9A), relative major/minor (8A to 8B), or energy boost (+2 semitones, 8A to 10A).',
            },
          },
        ],
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
