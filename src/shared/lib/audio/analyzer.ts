import { getCamelotByKey, KeyInfo, PITCH_NAMES } from './camelot';

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
 * In-place iterative Radix-2 Cooley-Tukey FFT (length must be power of 2)
 */
function fftInPlace(real: Float32Array, imag: Float32Array): void {
  const n = real.length;

  // Bit-reversal permutation
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      const tr = real[i];
      real[i] = real[j];
      real[j] = tr;
      const ti = imag[i];
      imag[i] = imag[j];
      imag[j] = ti;
    }
  }

  // Butterfly stages
  for (let len = 2; len <= n; len <<= 1) {
    const half = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wLenCos = Math.cos(angle);
    const wLenSin = Math.sin(angle);

    for (let i = 0; i < n; i += len) {
      let wCos = 1;
      let wSin = 0;
      for (let j = 0; j < half; j++) {
        const uRe = real[i + j];
        const uIm = imag[i + j];
        const vRe = real[i + j + half] * wCos - imag[i + j + half] * wSin;
        const vIm = real[i + j + half] * wSin + imag[i + j + half] * wCos;

        real[i + j] = uRe + vRe;
        imag[i + j] = uIm + vIm;
        real[i + j + half] = uRe - vRe;
        imag[i + j + half] = uIm - vIm;

        const nextCos = wCos * wLenCos - wSin * wLenSin;
        wSin = wCos * wLenSin + wSin * wLenCos;
        wCos = nextCos;
      }
    }
  }
}

/**
 * Mix multi-channel AudioBuffer down to mono Float32Array
 */
function mixToMono(audioBuffer: AudioBuffer): Float32Array {
  const numChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length;
  if (numChannels === 1) {
    return audioBuffer.getChannelData(0);
  }
  const mono = new Float32Array(length);
  const scale = 1 / numChannels;
  for (let ch = 0; ch < numChannels; ch++) {
    const chData = audioBuffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      mono[i] += chData[i] * scale;
    }
  }
  return mono;
}

/**
 * 100% Client-side Audio Analyzer using Web Audio API
 */
export async function analyzeAudioFile(
  file: File,
  onProgress?: (percent: number) => void
): Promise<AudioAnalysisResult> {
  const fileId = `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

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
  const sampleRate = audioBuffer.sampleRate;
  const channelData = mixToMono(audioBuffer);

  // 3. Extract BPM via high-res onset envelope + normalized autocorrelation + parabolic refinement
  const bpm = detectBpm(channelData, sampleRate);
  onProgress?.(75);

  // 4. Extract Musical Key via Hann-windowed FFT Chromagram + Krumhansl-Schmuckler
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
 * High-precision BPM Detection via dual-band onset flux, normalized autocorrelation,
 * harmonic reinforcement, and sub-sample parabolic interpolation.
 */
function detectBpm(data: Float32Array, sampleRate: number): number {
  const duration = data.length / sampleRate;
  if (duration < 1.5) {
    return 120.0;
  }

  // Analyze up to 60 seconds from the middle of the track for speed and beat stability
  const maxAnalyzeSec = 60;
  const startSec = Math.max(0, duration / 2 - maxAnalyzeSec / 2);
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(data.length, startSample + Math.floor(maxAnalyzeSec * sampleRate));
  const sliceLen = endSample - startSample;

  // Compute onset envelope at ~200 Hz (5ms hop) with 15ms window
  const hopSamples = Math.max(1, Math.round(sampleRate * 0.005)); // 5ms hop (~200 fps)
  const winSamples = Math.max(hopSamples, Math.round(sampleRate * 0.015)); // 15ms window
  const numFrames = Math.floor((sliceLen - winSamples) / hopSamples);
  if (numFrames < 100) {
    return 120.0;
  }

  const envRate = sampleRate / hopSamples;

  // 1-pole low-pass filter (~220 Hz) to isolate kick/bass transients
  const rc = 1 / (2 * Math.PI * 220);
  const dt = 1 / sampleRate;
  const lpAlpha = dt / (rc + dt);

  const bassEnv = new Float32Array(numFrames);
  const fullEnv = new Float32Array(numFrames);
  let lpState = 0;

  for (let f = 0; f < numFrames; f++) {
    const offset = startSample + f * hopSamples;
    let bassSum = 0;
    let fullSum = 0;
    for (let j = 0; j < winSamples; j++) {
      const x = data[offset + j];
      lpState += lpAlpha * (x - lpState);
      bassSum += lpState * lpState;
      fullSum += x * x;
    }
    // Log-compressed RMS makes quiet beats count equally with loud drops
    bassEnv[f] = Math.log1p(25 * Math.sqrt(bassSum / winSamples));
    fullEnv[f] = Math.log1p(25 * Math.sqrt(fullSum / winSamples));
  }

  // Positive onset flux (weighted towards low-end kick + fullband attacks)
  const flux = new Float32Array(numFrames - 1);
  let totalFlux = 0;
  for (let i = 0; i < numFrames - 1; i++) {
    const db = Math.max(0, bassEnv[i + 1] - bassEnv[i]);
    const df = Math.max(0, fullEnv[i + 1] - fullEnv[i]);
    const v = 0.7 * db + 0.3 * df;
    flux[i] = v;
    totalFlux += v;
  }

  if (totalFlux < 1e-6) {
    return 120.0;
  }

  // Adaptive local mean subtraction (sharpens rhythmic peaks, suppresses steady sustain)
  const localHalf = Math.round(envRate * 0.15); // ±150ms local window
  const odf = new Float32Array(flux.length);
  let prefix = 0;
  const prefixSum = new Float32Array(flux.length + 1);
  for (let i = 0; i < flux.length; i++) {
    prefix += flux[i];
    prefixSum[i + 1] = prefix;
  }
  for (let i = 0; i < flux.length; i++) {
    const lo = Math.max(0, i - localHalf);
    const hi = Math.min(flux.length, i + localHalf + 1);
    const mean = (prefixSum[hi] - prefixSum[lo]) / (hi - lo);
    const diff = flux[i] - mean;
    odf[i] = diff > 0 ? diff : 0;
  }

  // Normalized autocorrelation over BPM range 65 to 195 (and up to 2x lag for harmonic verification)
  const minBpm = 65;
  const maxBpm = 195;
  const minLag = Math.max(10, Math.floor((60 / maxBpm) * envRate));
  const maxLag = Math.min(Math.floor(odf.length / 2) - 2, Math.ceil((60 / minBpm) * envRate));
  const maxHarmonicLag = Math.min(odf.length - 1, maxLag * 2 + 2);

  if (maxLag <= minLag + 2) {
    return 120.0;
  }

  const acf = new Float32Array(maxHarmonicLag + 1);
  for (let lag = minLag; lag <= maxHarmonicLag; lag++) {
    const limit = odf.length - lag;
    let sum = 0;
    for (let i = 0; i < limit; i++) {
      sum += odf[i] * odf[i + lag];
    }
    acf[lag] = sum / limit;
  }

  // Score each candidate lag using multi-harmonic reinforcement + gentle DJ tempo prior
  let bestLag = minLag;
  let bestScore = -1;

  for (let lag = minLag + 1; lag <= maxLag - 1; lag++) {
    const candidateBpm = (60 * envRate) / lag;
    // Gentle Gaussian prior centered at 128 BPM (sigma = 55 BPM) to resolve octave ambiguity
    const z = (candidateBpm - 128) / 55;
    const tempoPrior = 0.85 + 0.15 * Math.exp(-0.5 * z * z);

    let harmonicScore = acf[lag];
    if (lag * 2 <= maxHarmonicLag) {
      harmonicScore += 0.5 * acf[lag * 2];
    }
    const score = harmonicScore * tempoPrior;

    if (score > bestScore) {
      bestScore = score;
      bestLag = lag;
    }
  }

  // Octave disambiguation: if detected tempo is slow (< 95 BPM) but the double-tempo lag (L/2)
  // has nearly equal peak energy (>= 80% over a 3-frame neighborhood to avoid sub-frame loss),
  // then kicks/beats are hitting at L/2 (e.g. 140 BPM instead of half-time 70 BPM).
  const rawBpm = (60 * envRate) / bestLag;
  if (rawBpm < 95) {
    const halfLag = Math.round(bestLag / 2);
    if (halfLag >= minLag + 2 && halfLag <= maxLag - 2) {
      let localPeakLag = halfLag;
      for (let d = -1; d <= 1; d++) {
        if (acf[halfLag + d] > acf[localPeakLag]) {
          localPeakLag = halfLag + d;
        }
      }
      const halfEnergy = acf[localPeakLag - 1] + acf[localPeakLag] + acf[localPeakLag + 1];
      const fullEnergy = acf[bestLag - 1] + acf[bestLag] + acf[bestLag + 1];
      if (halfEnergy >= fullEnergy * 0.8) {
        bestLag = localPeakLag;
      }
    }
  }

  // Parabolic interpolation on raw ACF around bestLag (and 2*bestLag if valid) for sub-frame precision
  const y0 = acf[bestLag - 1];
  const y1 = acf[bestLag];
  const y2 = acf[bestLag + 1];
  const denom = y0 - 2 * y1 + y2;
  let delta = 0;
  if (Math.abs(denom) > 1e-12) {
    delta = Math.max(-0.5, Math.min(0.5, (0.5 * (y0 - y2)) / denom));
  }
  let refinedLag = bestLag + delta;

  // Secondary multi-beat refinement: if 2*bestLag or 4*bestLag has a clean peak, use it to reduce discretization error 2-4x further
  const multLag = Math.round(refinedLag * 2);
  if (multLag > 1 && multLag + 1 <= maxHarmonicLag && acf[multLag] > acf[bestLag] * 0.6) {
    const m0 = acf[multLag - 1];
    const m1 = acf[multLag];
    const m2 = acf[multLag + 1];
    const mDenom = m0 - 2 * m1 + m2;
    if (m1 >= m0 && m1 >= m2 && Math.abs(mDenom) > 1e-12) {
      const mDelta = Math.max(-0.5, Math.min(0.5, (0.5 * (m0 - m2)) / mDenom));
      const halfRefined = (multLag + mDelta) / 2;
      if (Math.abs(halfRefined - refinedLag) < 0.75) {
        refinedLag = halfRefined;
      }
    }
  }

  let calculatedBpm = (60 * envRate) / refinedLag;

  // Normalize into standard DJ range (70 - 185)
  if (calculatedBpm < 70) calculatedBpm *= 2;
  if (calculatedBpm > 185) calculatedBpm /= 2;

  return Math.round(calculatedBpm * 10) / 10;
}

/**
 * Key & Camelot Detection via Hann-windowed FFT Chromagram + Krumhansl-Schmuckler Profiles
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
  // 1. Boxcar-averaged downsampling to ~8192 Hz (anti-aliased low-pass decimation)
  const targetRate = 8192;
  const factor = Math.max(1, Math.round(sampleRate / targetRate));
  const effRate = sampleRate / factor;

  // Analyze up to 60 seconds from the middle of the track to skip silent intros/outros
  const duration = data.length / sampleRate;
  const maxAnalyzeSec = 60;
  const startSec = Math.max(0, duration / 2 - maxAnalyzeSec / 2);
  const startSample = Math.floor(startSec * sampleRate);
  const endSample = Math.min(data.length, startSample + Math.floor(maxAnalyzeSec * sampleRate));

  const dsLen = Math.floor((endSample - startSample) / factor);
  const ds = new Float32Array(dsLen);
  const invFactor = 1 / factor;

  for (let i = 0; i < dsLen; i++) {
    let acc = 0;
    const base = startSample + i * factor;
    for (let k = 0; k < factor; k++) {
      acc += data[base + k];
    }
    ds[i] = acc * invFactor;
  }

  // 2. FFT Chromagram (N = 4096 -> ~2.0 Hz frequency resolution)
  const fftSize = 4096;
  const chroma = new Float64Array(12);

  if (dsLen < fftSize) {
    const fallback = getCamelotByKey('A Minor');
    return { key: fallback.name, camelot: fallback.camelot, keyInfo: fallback, confidence: 55 };
  }

  // Precompute Hann window
  const hann = new Float32Array(fftSize);
  for (let i = 0; i < fftSize; i++) {
    hann[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (fftSize - 1)));
  }

  // Precompute bin-to-pitch-class mapping & Gaussian tuning weight for bins in [55 Hz, 2200 Hz]
  const minBin = Math.max(1, Math.ceil((55 * fftSize) / effRate));
  const maxBin = Math.min(fftSize / 2 - 1, Math.floor((2200 * fftSize) / effRate));
  const binPitch = new Int8Array(maxBin + 1);
  const binWeight = new Float32Array(maxBin + 1);

  for (let b = minBin; b <= maxBin; b++) {
    const freq = (b * effRate) / fftSize;
    const midi = 69 + 12 * Math.log2(freq / 440);
    const nearest = Math.round(midi);
    const deviation = midi - nearest;
    binPitch[b] = ((nearest % 12) + 12) % 12;
    // Narrow Gaussian around exact equal-temperament semitone centers suppresses percussion/noise
    binWeight[b] = Math.exp(-0.5 * (deviation / 0.25) * (deviation / 0.25));
  }

  // Sample up to 120 frames evenly across the analyzed window for consistent speed (<60ms)
  const maxFrames = 120;
  const defaultHop = fftSize >> 1;
  const totalPossibleFrames = Math.floor((dsLen - fftSize) / defaultHop) + 1;
  const hop =
    totalPossibleFrames > maxFrames
      ? Math.floor((dsLen - fftSize) / (maxFrames - 1))
      : defaultHop;

  const real = new Float32Array(fftSize);
  const imag = new Float32Array(fftSize);

  for (let pos = 0; pos + fftSize <= dsLen; pos += hop) {
    for (let i = 0; i < fftSize; i++) {
      real[i] = ds[pos + i] * hann[i];
      imag[i] = 0;
    }

    fftInPlace(real, imag);

    for (let b = minBin; b <= maxBin; b++) {
      const mag = Math.sqrt(real[b] * real[b] + imag[b] * imag[b]);
      chroma[binPitch[b]] += mag * binWeight[b];
    }
  }

  // Normalize chroma
  let maxChroma = 0;
  for (let i = 0; i < 12; i++) {
    if (chroma[i] > maxChroma) maxChroma = chroma[i];
  }
  const chromaArray = new Array<number>(12).fill(0);
  if (maxChroma > 0) {
    for (let i = 0; i < 12; i++) {
      chromaArray[i] = chroma[i] / maxChroma;
    }
  }

  // 3. Correlate against all 12 Major and 12 Minor Krumhansl-Schmuckler key profiles
  let bestScore = -2;
  let secondBestScore = -2;
  let bestKeyName = 'A Minor';

  const evaluateProfile = (profile: number[], modeLabel: 'Major' | 'Minor') => {
    for (let tonic = 0; tonic < 12; tonic++) {
      const rotatedProfile = new Array<number>(12);
      for (let i = 0; i < 12; i++) {
        rotatedProfile[(tonic + i) % 12] = profile[i];
      }
      const score = pearsonCorrelation(chromaArray, rotatedProfile);
      if (score > bestScore) {
        secondBestScore = bestScore;
        bestScore = score;
        bestKeyName = `${PITCH_NAMES[tonic]} ${modeLabel}`;
      } else if (score > secondBestScore) {
        secondBestScore = score;
      }
    }
  };

  evaluateProfile(KRUMHANSL_MAJOR, 'Major');
  evaluateProfile(KRUMHANSL_MINOR, 'Minor');

  // 4. Map to Camelot using alias-normalizing helper (handles Db/Eb/Ab/Bb properly)
  const keyInfo = getCamelotByKey(bestKeyName);

  // Meaningful confidence score combining correlation strength and margin over runner-up
  const margin = Math.max(0, bestScore - secondBestScore);
  const rawConf = Math.round(Math.max(0, bestScore) * 85 + Math.min(0.25, margin) * 60);
  const confidence = Math.min(99, Math.max(55, rawConf));

  return {
    key: keyInfo.name,
    camelot: keyInfo.camelot,
    keyInfo,
    confidence,
  };
}
