import { ID3Writer } from 'browser-id3-writer';
import { AudioAnalysisResult } from './analyzer';
import { buildTracksCsvContent, buildTracksM3u8Content } from './csv-exporter';
import { buildZipBlob, ZipEntryInput } from './zip-builder';

/**
 * Returns true if the file is an MP3 that supports ID3v2 tagging
 */
export function isMp3File(file: File): boolean {
  return (
    file.name.toLowerCase().endsWith('.mp3') ||
    file.type === 'audio/mpeg' ||
    file.type === 'audio/mp3'
  );
}

/**
 * Strips any existing leading ID3v2 tag header so browser-id3-writer does not
 * stack duplicate ID3v2 headers at the front of an already-tagged MP3.
 */
function stripExistingId3v2(buffer: ArrayBuffer): ArrayBuffer {
  const bytes = new Uint8Array(buffer);
  if (bytes.length < 10) return buffer;

  // Check for "ID3" magic header
  if (bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33) {
    const flags = bytes[5];
    const tagSize =
      ((bytes[6] & 0x7f) << 21) |
      ((bytes[7] & 0x7f) << 14) |
      ((bytes[8] & 0x7f) << 7) |
      (bytes[9] & 0x7f);
    const hasFooter = (flags & 0x10) !== 0;
    const totalHeaderSize = 10 + tagSize + (hasFooter ? 10 : 0);

    if (totalHeaderSize < bytes.length) {
      return buffer.slice(totalHeaderSize);
    }
  }
  return buffer;
}

/**
 * Core helper: writes Camelot Key (TKEY), BPM (TBPM), and Comment (COMM) ID3v2.3 tags into MP3 bytes
 */
async function buildTaggedMp3Bytes(
  track: AudioAnalysisResult
): Promise<{ bytes: Uint8Array; blob: Blob; filename: string }> {
  if (!isMp3File(track.file)) {
    throw new Error(
      `ID3 tag writing only supports MP3 files ("${track.name}" is not MP3). Use Export CSV for WAV/FLAC files.`
    );
  }

  const rawBuffer = await track.file.arrayBuffer();
  const cleanBuffer = stripExistingId3v2(rawBuffer);

  const writer = new ID3Writer(cleanBuffer);

  // Rekordbox & Serato read TKEY for Key/Camelot and TBPM for tempo
  const camelotKeyTag = track.camelot;
  const bpmValue = Math.round(track.bpm);

  writer.setFrame('TKEY', camelotKeyTag);
  writer.setFrame('TBPM', bpmValue);
  writer.setFrame('COMM', {
    description: 'Camelot BPM Studio',
    text: `${track.camelot} (${track.key}) - ${track.bpm.toFixed(1)} BPM`,
    language: 'eng',
  });
  writer.addTag();

  const taggedBlob = writer.getBlob();
  const bytes = new Uint8Array(await taggedBlob.arrayBuffer());
  const baseName = track.name.replace(/\.[^/.]+$/, '');
  const filename = `${baseName} [${track.camelot} - ${bpmValue}BPM].mp3`;

  return { bytes, blob: taggedBlob, filename };
}

/**
 * Single-track ID3 writer: embeds Camelot Key (TKEY) and BPM (TBPM) in-browser
 */
export async function writeId3TagsToAudio(
  track: AudioAnalysisResult
): Promise<{ blob: Blob; downloadUrl: string; filename: string }> {
  const { blob, filename } = await buildTaggedMp3Bytes(track);
  const downloadUrl = URL.createObjectURL(blob);

  return {
    blob,
    downloadUrl,
    filename,
  };
}

/**
 * Pro Feature: Batch-writes ID3v2 tags to all MP3 tracks in the crate and packages them
 * (along with a complete crate_summary.csv) into a single in-browser ZIP download.
 */
export async function writeBatchId3TagsToZip(
  tracks: AudioAnalysisResult[],
  onProgress?: (percent: number, filename: string) => void
): Promise<{
  downloadUrl: string;
  filename: string;
  taggedCount: number;
  skippedCount: number;
}> {
  const entries: ZipEntryInput[] = [];
  const usedNames = new Set<string>();
  let taggedCount = 0;
  let skippedCount = 0;

  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    onProgress?.(Math.round(((i + 0.2) / tracks.length) * 100), track.name);

    if (!isMp3File(track.file)) {
      skippedCount++;
      continue;
    }

    const { bytes, filename } = await buildTaggedMp3Bytes(track);

    // Deduplicate filenames inside the ZIP archive
    let uniqueName = filename;
    let suffix = 2;
    while (usedNames.has(uniqueName)) {
      uniqueName = filename.replace(/\.mp3$/i, ` (${suffix++}).mp3`);
    }
    usedNames.add(uniqueName);

    entries.push({ name: uniqueName, data: bytes });
    taggedCount++;
    onProgress?.(Math.round(((i + 1) / tracks.length) * 100), track.name);
  }

  if (taggedCount === 0) {
    throw new Error(
      'No MP3 files found in this crate. ID3 tagging only applies to MP3 files — use Export CSV for WAV/FLAC.'
    );
  }

  // Bundle complete crate summary CSV & M3U8 playlist alongside tagged MP3s
  const dateStamp = new Date().toISOString().slice(0, 10);
  const csvBytes = new TextEncoder().encode(buildTracksCsvContent(tracks));
  entries.push({
    name: `crate_summary_${dateStamp}.csv`,
    data: csvBytes,
  });

  const m3uBytes = new TextEncoder().encode(buildTracksM3u8Content(tracks));
  entries.push({
    name: `harmonic_playlist_${dateStamp}.m3u8`,
    data: m3uBytes,
  });

  const zipBlob = buildZipBlob(entries);
  const downloadUrl = URL.createObjectURL(zipBlob);
  const filename = `camelot_bpm_pro_crate_${new Date().toISOString().slice(0, 10)}.zip`;

  return {
    downloadUrl,
    filename,
    taggedCount,
    skippedCount,
  };
}

/**
 * Triggers a browser file download for a blob url and revokes it afterwards
 */
export function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
