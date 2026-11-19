import { CAMELOT_MAP, KeyInfo, PITCH_NAMES } from './camelot';

export interface AudioAnalysisResult {
  id: string;
  file: File;
  name: string;
  size: number;
  duration: number; // in seconds
  bpm: number; // e.g. 128.0
  originalBpm: number;
  bpmMultiplier: 1 | 0.5 | 2;
  key: string; // e.g. "A Minor"
  camelot: string; // e.g. "8A"
  keyInfo: KeyInfo;
  confidence: number; // 0 - 100
  status: 'idle' | 'analyzing' | 'done' | 'error';
  errorMsg?: string;
}

// Krumhansl-Schmuckler Key Profiles
const KRUMHANSL_MAJOR = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const KRUMHANSL_MINOR = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

function pearsonCorrelation(x: number[], y: number[]): number {
  const n = x.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    sumX += x[i];
    sumY += y[i];
    sumXY += x[i] * y[i];
    sumX2 += x[i] * x[i];
    sumY2 += y[i] * y[i];
  }

  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * 100% Client-side Audio Analyzer using Web Audio API
 */
export async function analyzeAudioFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<AudioAnalysisResult> {
  const fileId = `${file.name}-${file.size}-${Date.now()}`;

  // 1. Read file as ArrayBuffer in browser
  const arrayBuffer = await file.arrayBuffer();
  onProgress?.(20);

  // 2. Decode audio buffer with browser AudioContext
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) {
    throw new Error('Web Audio API is not supported in this browser.');
  }

  const audioCtx = new AudioCtx();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    audioCtx.close();
  }
  onProgress?.(50);

  const duration = audioBuffer.duration;
  const channelData = audioBuffer.getChannelData(0); // Mono or left channel
  const sampleRate = audioBuffer.sampleRate;

  // 3. Extract BPM using Downsampled Peak Autocorrelation
  const bpm = detectBpm(channelData, sampleRate);
  onProgress?.(75);

  // 4. Extract Musical Key using Chromagram & Krumhansl-Schmuckler
  const { key, camelot, keyInfo, confidence } = detectKey(channelData, sampleRate);
  onProgress?.(100);

  return {
    id: fileId,
    file,
    name: file.name,
    size: file.size,
    duration,
    bpm,
    originalBpm: bpm,
    bpmMultiplier: 1,
    key,
    camelot,
    keyInfo,
    confidence,
    status: 'done',
  };
}

/**
 * BPM Detection via transient onset envelope and peak autocorrelation
 */
function detectBpm(data: Float32Array, sampleRate: number): number {
  // Downsample to ~2205 Hz for fast in-browser computation
  const downsampleFactor = Math.floor(sampleRate / 2205);
  const downsampledLength = Math.floor(data.length / downsampleFactor);
  const downsampled = new Float32Array(downsampledLength);

  for (let i = 0; i < downsampledLength; i++) {
    downsampled[i] = data[i * downsampleFactor];
  }

  const effectiveSampleRate = sampleRate / downsampleFactor;

  // Energy envelope calculation (windowed RMS)
  const windowSize = Math.floor(effectiveSampleRate * 0.05); // 50ms window
  const hopSize = Math.floor(effectiveSampleRate * 0.025); // 25ms hop
  const envelopeLength = Math.floor((downsampledLength - windowSize) / hopSize);
  const envelope = new Float32Array(envelopeLength);

  for (let i = 0; i < envelopeLength; i++) {
    let sum = 0;
    const offset = i * hopSize;
    for (let j = 0; j < windowSize; j++) {
      const val = downsampled[offset + j];
      sum += val * val;
    }
    envelope[i] = Math.sqrt(sum / windowSize);
  }

  // Energy difference (spectral flux / onsets)
  const diff = new Float32Array(envelopeLength - 1);
  for (let i = 0; i < envelopeLength - 1; i++) {
    const d = envelope[i + 1] - envelope[i];
    diff[i] = d > 0 ? d : 0;
  }

  // Autocorrelation over BPM range 70 to 180
  const minBpm = 70;
  const maxBpm = 180;
  const envSampleRate = effectiveSampleRate / hopSize;

  const minLag = Math.floor((60 / maxBpm) * envSampleRate);
  const maxLag = Math.floor((60 / minBpm) * envSampleRate);

  let bestLag = minLag;
  let maxCorr = -1;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0;
    const limit = Math.min(diff.length - lag, 1500); // sample window
    for (let i = 0; i < limit; i++) {
      corr += diff[i] * diff[i + lag];
    }
    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  }

  let calculatedBpm = (60 * envSampleRate) / bestLag;

  // Round to 1 decimal place
  calculatedBpm = Math.round(calculatedBpm * 10) / 10;

  // Normalize into standard DJ range (75 - 175)
  if (calculatedBpm < 70) calculatedBpm *= 2;
  if (calculatedBpm > 185) calculatedBpm /= 2;

  return Math.round(calculatedBpm * 10) / 10;
}

/**
 * Key & Camelot Detection via 12-Pitch Chroma energy profiles
 */
function detectKey(
  data: Float32Array,
  sampleRate: number
): {
  key: string;
  camelot: string;
  keyInfo: KeyInfo;
  confidence: number;
} {
  const chroma = new Float32Array(12);

  // We analyze the middle 60 seconds (or available length) to avoid intros/outros
  const startSec = Math.max(0, data.length / sampleRate / 2 - 30);
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(data.length, startSample + Math.floor(60 * sampleRate));

  // Compute energy across octaves for 12 semitones (A4 = 440Hz reference)
  // Frequency = 440 * 2^((midi - 69) / 12)
  for (let pitch = 0; pitch < 12; pitch++) {
    let pitchEnergy = 0;
    // Check octaves 2 through 6 (approx 65Hz to 2000Hz)
    for (let octave = 2; octave <= 6; octave++) {
      const midiNote = octave * 12 + pitch;
      const freq = 440 * Math.pow(2, (midiNote - 69) / 12);

      // Simple discrete Goertzel / Fourier component estimate
      const omega = (2 * Math.PI * freq) / sampleRate;
      const cosOmega = Math.cos(omega);
      const sinOmega = Math.sin(omega);

      let real = 0;
      let imag = 0;
      const step = Math.floor(sampleRate / 4000) || 1; // sub-sample for speed

      for (let s = startSample; s < endSample; s += step * 8) {
        const val = data[s];
        real += val * cosOmega;
        imag += val * sinOmega;
      }
      pitchEnergy += Math.sqrt(real * real + imag * imag);
    }
    chroma[pitch] = pitchEnergy;
  }

  // Normalize chroma
  let maxChroma = 0;
  for (let i = 0; i < 12; i++) {
    if (chroma[i] > maxChroma) maxChroma = chroma[i];
  }
  if (maxChroma > 0) {
    for (let i = 0; i < 12; i++) {
      chroma[i] /= maxChroma;
    }
  }

  const chromaArray = Array.from(chroma);

  // Test against all 12 Major and 12 Minor keys
  let bestScore = -2;
  let bestKeyName = 'A Minor';

  // Major Keys
  for (let tonic = 0; tonic < 12; tonic++) {
    // Rotate profile to tonic
    const rotatedProfile = new Array(12);
    for (let i = 0; i < 12; i++) {
      rotatedProfile[(tonic + i) % 12] = KRUMHANSL_MAJOR[i];
    }
    const score = pearsonCorrelation(chromaArray, rotatedProfile);
    if (score > bestScore) {
      bestScore = score;
      bestKeyName = `${PITCH_NAMES[tonic]} Major`;
    }
  }

  // Minor Keys
  for (let tonic = 0; tonic < 12; tonic++) {
    const rotatedProfile = new Array(12);
    for (let i = 0; i < 12; i++) {
      rotatedProfile[(tonic + i) % 12] = KRUMHANSL_MINOR[i];
    }
    const score = pearsonCorrelation(chromaArray, rotatedProfile);
    if (score > bestScore) {
      bestScore = score;
      bestKeyName = `${PITCH_NAMES[tonic]} Minor`;
    }
  }

  // Map to Camelot
  const keyInfo = CAMELOT_MAP[bestKeyName] || CAMELOT_MAP['A Minor'];
  const confidence = Math.min(99, Math.max(65, Math.round((bestScore + 1) * 50)));

  return {
    key: keyInfo.name,
    camelot: keyInfo.camelot,
    keyInfo,
    confidence,
  };
}
