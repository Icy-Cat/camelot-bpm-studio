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

export function buildTracksM3u8Content(tracks: AudioAnalysisResult[]): string {
  const lines = ['#EXTM3U', '#PLAYLIST:Camelot BPM Studio Harmonic Crate'];
  for (const t of tracks) {
    const secs = Math.round(t.duration);
    const title = t.name.replace(/\.[^/.]+$/, '');
    lines.push(`#EXTINF:${secs},${title} [${t.camelot} - ${t.key} - ${t.bpm.toFixed(1)} BPM]`);
    lines.push(t.name);
  }
  return lines.join('\n') + '\n';
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

export function exportTracksToM3u8(tracks: AudioAnalysisResult[]): void {
  if (tracks.length === 0) return;

  const m3uContent = buildTracksM3u8Content(tracks);
  const blob = new Blob([m3uContent], {
    type: 'audio/x-mpegurl;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `camelot_harmonic_set_${new Date().toISOString().slice(0, 10)}.m3u8`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
