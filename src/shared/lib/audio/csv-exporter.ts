import { AudioAnalysisResult } from './analyzer';

export function buildTracksCsvContent(tracks: AudioAnalysisResult[]): string {
  const headers = [
    'Filename',
    'Camelot Key',
    'Musical Key',
    'BPM',
    'Duration (s)',
    'Compatible Keys',
    'Confidence',
  ];

  const rows = tracks.map((t) => [
    `"${t.name.replace(/"/g, '""')}"`,
    `"${t.camelot}"`,
    `"${t.key}"`,
    t.bpm.toFixed(1),
    Math.round(t.duration).toString(),
    `"${t.keyInfo.compatibleKeys.join(', ')}"`,
    `${t.confidence}%`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function exportTracksToCsv(tracks: AudioAnalysisResult[]): void {
  if (tracks.length === 0) return;

  const csvContent = buildTracksCsvContent(tracks);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `camelot_bpm_crate_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
