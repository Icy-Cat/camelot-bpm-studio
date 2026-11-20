import type { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

const PUBLIC_ROUTES: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
}> = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' },
  { path: '/camelot-key-finder', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/batch-bpm-finder', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/offline-audio-analyzer', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/tempo-half-double-fix', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/mp3-id3-tag-writer', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/mixed-in-key-alternative', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/harmonic-playlist-sorter', priority: 0.95, changeFrequency: 'weekly' },
  { path: '/wav-flac-key-bpm-finder', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/pricing', priority: 0.8, changeFrequency: 'monthly' },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (envConfigs.app_url || 'https://camelot-bpm-studio.vercel.app').replace(
    /\/$/,
    ''
  );
  const lastModified = new Date();

  const entries: MetadataRoute.Sitemap = [];

  for (const route of PUBLIC_ROUTES) {
    const enUrl = `${baseUrl}${route.path || '/'}`;
    const zhUrl = `${baseUrl}/zh${route.path}`;

    entries.push({
      url: enUrl,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: {
          en: enUrl,
          zh: zhUrl,
        },
      },
    });

    entries.push({
      url: zhUrl,
      lastModified,
      changeFrequency: route.changeFrequency,
      priority: Number((route.priority * 0.9).toFixed(2)),
      alternates: {
        languages: {
          en: enUrl,
          zh: zhUrl,
        },
      },
    });
  }

  return entries;
}
