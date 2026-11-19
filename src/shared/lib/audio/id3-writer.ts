import { ID3Writer } from 'browser-id3-writer';
import { AudioAnalysisResult } from './analyzer';

/**
 * Pro Feature: Writes Camelot Key (TKEY) and BPM (TBPM) directly into MP3 ID3 tags
 * in-browser without any server upload.
 */
export async function writeId3TagsToAudio(
  track: AudioAnalysisResult
): Promise<{ blob: Blob; downloadUrl: string; filename: string }> {
  const arrayBuffer = await track.file.arrayBuffer();

  const writer = new ID3Writer(arrayBuffer);

  // Rekordbox & Serato read TKEY for Key/Camelot and TBPM for tempo
  const camelotKeyTag = `${track.camelot} - ${track.key}`;
  const bpmValue = Math.round(track.bpm);

  writer.setFrame('TKEY', camelotKeyTag);
  writer.setFrame('TBPM', bpmValue);
  writer.addTag();

  const taggedBlob = writer.getBlob();
  const downloadUrl = writer.getURL();

  const baseName = track.name.replace(/\.[^/.]+$/, '');
  const ext = track.name.split('.').pop() || 'mp3';
  const filename = `${baseName} [${track.camelot} - ${Math.round(track.bpm)}BPM].${ext}`;

  return {
    blob: taggedBlob,
    downloadUrl,
    filename,
  };
}

/**
 * Triggers a browser file download for a blob or url
 */
export function downloadFile(url: string, filename: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
