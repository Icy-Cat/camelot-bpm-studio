import { AudioAnalysisResult } from './analyzer';

export type TransitionQuality = 'perfect' | 'smooth' | 'boost' | 'moderate' | 'clash';

export interface HarmonicTransition {
  label: string;
  quality: TransitionQuality;
  cost: number;
  bpmDiff: number;
}

export interface HarmonicSortResult {
  sortedTracks: AudioAnalysisResult[];
  /** transitions[i] describes transition from sortedTracks[i - 1] -> sortedTracks[i]; transitions[0] is null */
  transitions: (HarmonicTransition | null)[];
  smoothCount: number;
  totalTransitions: number;
}

function parseCamelot(code: string): { hour: number; letter: 'A' | 'B' } {
  const match = code.trim().match(/^(\d{1,2})([AB])$/i);
  if (!match) {
    return { hour: 8, letter: 'A' };
  }
  return {
    hour: Math.max(1, Math.min(12, parseInt(match[1], 10))),
    letter: match[2].toUpperCase() === 'B' ? 'B' : 'A',
  };
}

/**
 * Computes harmonic + tempo transition quality and mixing cost between two tracks
 */
export function evaluateHarmonicTransition(
  from: AudioAnalysisResult,
  to: AudioAnalysisResult
): HarmonicTransition {
  const a = parseCamelot(from.camelot);
  const b = parseCamelot(to.camelot);

  // Clockwise distance on the 12-hour Camelot wheel (0..11)
  const cw = (b.hour - a.hour + 12) % 12;
  const ccw = (a.hour - b.hour + 12) % 12;
  const minStep = Math.min(cw, ccw);
  const sameLetter = a.letter === b.letter;

  let keyCost = 0;
  let label = 'Key Jump';
  let quality: TransitionQuality = 'clash';

  if (cw === 0 && sameLetter) {
    keyCost = 0;
    label = 'Exact Key';
    quality = 'perfect';
  } else if (minStep === 1 && sameLetter) {
    keyCost = 1.0;
    label = cw === 1 ? '+1 Step' : '-1 Step';
    quality = 'smooth';
  } else if (cw === 0 && !sameLetter) {
    keyCost = 1.2;
    label = 'Relative Mood';
    quality = 'smooth';
  } else if (cw === 2 && sameLetter) {
    keyCost = 2.2;
    label = 'Energy Boost +2';
    quality = 'boost';
  } else if (minStep === 1 && !sameLetter) {
    keyCost = 3.0;
    label = 'Diagonal Mix';
    quality = 'moderate';
  } else if (cw === 7 && sameLetter) {
    // +7 on Camelot wheel = +1 semitone (classic peak-time DJ energy lift)
    keyCost = 3.5;
    label = '+1 Semitone Lift';
    quality = 'boost';
  } else {
    keyCost = 5.0 + minStep * 1.5 + (sameLetter ? 0 : 1.5);
    label = 'Key Jump';
    quality = 'clash';
  }

  // Tempo transition cost (also accounts for half/double-time compatibility)
  const rawDiff = Math.abs(to.bpm - from.bpm);
  const effectiveBpmDiff = Math.min(
    rawDiff,
    Math.abs(to.bpm * 2 - from.bpm),
    Math.abs(to.bpm / 2 - from.bpm)
  );

  // Smooth pitch-fader transitions (< 6 BPM) are low cost; larger tempo swings cost progressively more
  let bpmCost = effectiveBpmDiff * 0.18;
  if (effectiveBpmDiff > 8) {
    bpmCost += (effectiveBpmDiff - 8) * 0.25;
  }
  // Gentle preference for gradual upward BPM progression in a DJ set
  if (to.bpm < from.bpm - 2) {
    bpmCost += 0.35;
  }

  return {
    label,
    quality,
    cost: keyCost + bpmCost,
    bpmDiff: Math.round(rawDiff * 10) / 10,
  };
}

/**
 * Optimizes DJ crate playback order using multi-start Nearest-Neighbor + 2-opt refinement
 * to maximize Camelot harmonic compatibility and smooth BPM progression.
 */
export function sortTracksHarmonically(tracks: AudioAnalysisResult[]): HarmonicSortResult {
  const n = tracks.length;
  if (n <= 1) {
    return {
      sortedTracks: [...tracks],
      transitions: n === 1 ? [null] : [],
      smoothCount: 0,
      totalTransitions: 0,
    };
  }

  // Precompute pairwise transition cost matrix
  const costMatrix: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        costMatrix[i][j] = evaluateHarmonicTransition(tracks[i], tracks[j]).cost;
      }
    }
  }

  const pathCost = (order: number[]): number => {
    let total = 0;
    for (let i = 0; i < order.length - 1; i++) {
      total += costMatrix[order[i]][order[i + 1]];
    }
    return total;
  };

  // Multi-start Nearest-Neighbor (cap starts for very large crates > 60 tracks)
  const startIndices: number[] =
    n <= 60
      ? Array.from({ length: n }, (_, i) => i)
      : [...Array.from({ length: n }, (_, i) => i)]
          .sort((a, b) => tracks[a].bpm - tracks[b].bpm)
          .slice(0, 30);

  let bestOrder: number[] = [];
  let bestCost = Infinity;

  for (const start of startIndices) {
    const visited = new Uint8Array(n);
    const order = [start];
    visited[start] = 1;

    while (order.length < n) {
      const curr = order[order.length - 1];
      let nextIdx = -1;
      let nextMin = Infinity;
      for (let j = 0; j < n; j++) {
        if (!visited[j] && costMatrix[curr][j] < nextMin) {
          nextMin = costMatrix[curr][j];
          nextIdx = j;
        }
      }
      order.push(nextIdx);
      visited[nextIdx] = 1;
    }

    // 2-opt open-path refinement (note: cost matrix is mildly asymmetric, so evaluate full delta)
    let improved = true;
    let guard = 0;
    while (improved && guard < 100) {
      improved = false;
      guard++;
      let currTotal = pathCost(order);
      for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
          // Reverse segment [i..j]
          const candidate = order.slice();
          let lo = i;
          let hi = j;
          while (lo < hi) {
            const tmp = candidate[lo];
            candidate[lo] = candidate[hi];
            candidate[hi] = tmp;
            lo++;
            hi--;
          }
          const candTotal = pathCost(candidate);
          if (candTotal + 1e-6 < currTotal) {
            for (let k = 0; k < n; k++) order[k] = candidate[k];
            currTotal = candTotal;
            improved = true;
          }
        }
      }
    }

    const finalCost = pathCost(order);
    // Tie-breaker: prefer starting on lower BPM for natural energy buildup
    const startTieBreaker = tracks[order[0]].bpm * 0.001;
    if (finalCost + startTieBreaker < bestCost) {
      bestCost = finalCost + startTieBreaker;
      bestOrder = order;
    }
  }

  const sortedTracks = bestOrder.map((idx) => tracks[idx]);
  const transitions: (HarmonicTransition | null)[] = [null];
  let smoothCount = 0;

  for (let i = 1; i < sortedTracks.length; i++) {
    const tr = evaluateHarmonicTransition(sortedTracks[i - 1], sortedTracks[i]);
    transitions.push(tr);
    if (tr.quality === 'perfect' || tr.quality === 'smooth' || tr.quality === 'boost') {
      smoothCount++;
    }
  }

  return {
    sortedTracks,
    transitions,
    smoothCount,
    totalTransitions: sortedTracks.length - 1,
  };
}
