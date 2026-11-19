export interface KeyInfo {
  name: string; // e.g. "A Minor"
  camelot: string; // e.g. "8A"
  type: 'major' | 'minor';
  pitchClass: number; // 0 = C, 1 = C#, ... 11 = B
  relativeKey: string; // e.g. "8B (C Major)"
  compatibleKeys: string[]; // e.g. ["7A", "8A", "9A", "8B"]
  energyBoostKey: string; // e.g. "10A (+2 Semitones / Energy Boost)"
  color: string; // Hex color for Camelot UI badge
}

export const CAMELOT_MAP: Record<string, KeyInfo> = {
  // Minor Keys (Inner Wheel - A)
  'A Minor': {
    name: 'A Minor',
    camelot: '8A',
    type: 'minor',
    pitchClass: 9,
    relativeKey: '8B (C Major)',
    compatibleKeys: ['7A (D Minor)', '8A (A Minor)', '9A (E Minor)', '8B (C Major)'],
    energyBoostKey: '10A (B Minor)',
    color: '#f55a28',
  },
  'E Minor': {
    name: 'E Minor',
    camelot: '9A',
    type: 'minor',
    pitchClass: 4,
    relativeKey: '9B (G Major)',
    compatibleKeys: ['8A (A Minor)', '9A (E Minor)', '10A (B Minor)', '9B (G Major)'],
    energyBoostKey: '11A (F# Minor)',
    color: '#fa961e',
  },
  'B Minor': {
    name: 'B Minor',
    camelot: '10A',
    type: 'minor',
    pitchClass: 11,
    relativeKey: '10B (D Major)',
    compatibleKeys: ['9A (E Minor)', '10A (B Minor)', '11A (F# Minor)', '10B (D Major)'],
    energyBoostKey: '12A (C# Minor)',
    color: '#f5d228',
  },
  'F# Minor': {
    name: 'F# Minor',
    camelot: '11A',
    type: 'minor',
    pitchClass: 6,
    relativeKey: '11B (A Major)',
    compatibleKeys: ['10A (B Minor)', '11A (F# Minor)', '12A (C# Minor)', '11B (A Major)'],
    energyBoostKey: '1A (G# Minor)',
    color: '#96dc32',
  },
  'C# Minor': {
    name: 'C# Minor',
    camelot: '12A',
    type: 'minor',
    pitchClass: 1,
    relativeKey: '12B (E Major)',
    compatibleKeys: ['11A (F# Minor)', '12A (C# Minor)', '1A (G# Minor)', '12B (E Major)'],
    energyBoostKey: '2A (D# Minor)',
    color: '#28d26e',
  },
  'G# Minor': {
    name: 'G# Minor',
    camelot: '1A',
    type: 'minor',
    pitchClass: 8,
    relativeKey: '1B (B Major)',
    compatibleKeys: ['12A (C# Minor)', '1A (G# Minor)', '2A (D# Minor)', '1B (B Major)'],
    energyBoostKey: '3A (Bb Minor)',
    color: '#00c8b4',
  },
  'D# Minor': {
    name: 'D# Minor',
    camelot: '2A',
    type: 'minor',
    pitchClass: 3,
    relativeKey: '2B (F# Major)',
    compatibleKeys: ['1A (G# Minor)', '2A (D# Minor)', '3A (Bb Minor)', '2B (F# Major)'],
    energyBoostKey: '4A (F Minor)',
    color: '#00b4f0',
  },
  'Bb Minor': {
    name: 'Bb Minor',
    camelot: '3A',
    type: 'minor',
    pitchClass: 10,
    relativeKey: '3B (Db Major)',
    compatibleKeys: ['2A (D# Minor)', '3A (Bb Minor)', '4A (F Minor)', '3B (Db Major)'],
    energyBoostKey: '5A (C Minor)',
    color: '#2882ff',
  },
  'F Minor': {
    name: 'F Minor',
    camelot: '4A',
    type: 'minor',
    pitchClass: 5,
    relativeKey: '4B (Ab Major)',
    compatibleKeys: ['3A (Bb Minor)', '4A (F Minor)', '5A (C Minor)', '4B (Ab Major)'],
    energyBoostKey: '6A (G Minor)',
    color: '#6e50ff',
  },
  'C Minor': {
    name: 'C Minor',
    camelot: '5A',
    type: 'minor',
    pitchClass: 0,
    relativeKey: '5B (Eb Major)',
    compatibleKeys: ['4A (F Minor)', '5A (C Minor)', '6A (G Minor)', '5B (Eb Major)'],
    energyBoostKey: '7A (D Minor)',
    color: '#aa3cf0',
  },
  'G Minor': {
    name: 'G Minor',
    camelot: '6A',
    type: 'minor',
    pitchClass: 7,
    relativeKey: '6B (Bb Major)',
    compatibleKeys: ['5A (C Minor)', '6A (G Minor)', '7A (D Minor)', '6B (Bb Major)'],
    energyBoostKey: '8A (A Minor)',
    color: '#e628b4',
  },
  'D Minor': {
    name: 'D Minor',
    camelot: '7A',
    type: 'minor',
    pitchClass: 2,
    relativeKey: '7B (F Major)',
    compatibleKeys: ['6A (G Minor)', '7A (D Minor)', '8A (A Minor)', '7B (F Major)'],
    energyBoostKey: '9A (E Minor)',
    color: '#f0325a',
  },

  // Major Keys (Outer Wheel - B)
  'C Major': {
    name: 'C Major',
    camelot: '8B',
    type: 'major',
    pitchClass: 0,
    relativeKey: '8A (A Minor)',
    compatibleKeys: ['7B (F Major)', '8B (C Major)', '9B (G Major)', '8A (A Minor)'],
    energyBoostKey: '10B (D Major)',
    color: '#f55a28',
  },
  'G Major': {
    name: 'G Major',
    camelot: '9B',
    type: 'major',
    pitchClass: 7,
    relativeKey: '9A (E Minor)',
    compatibleKeys: ['8B (C Major)', '9B (G Major)', '10B (D Major)', '9A (E Minor)'],
    energyBoostKey: '11B (A Major)',
    color: '#fa961e',
  },
  'D Major': {
    name: 'D Major',
    camelot: '10B',
    type: 'major',
    pitchClass: 2,
    relativeKey: '10A (B Minor)',
    compatibleKeys: ['9B (G Major)', '10B (D Major)', '11B (A Major)', '10A (B Minor)'],
    energyBoostKey: '12B (E Major)',
    color: '#f5d228',
  },
  'A Major': {
    name: 'A Major',
    camelot: '11B',
    type: 'major',
    pitchClass: 9,
    relativeKey: '11A (F# Minor)',
    compatibleKeys: ['10B (D Major)', '11B (A Major)', '12B (E Major)', '11A (F# Minor)'],
    energyBoostKey: '1B (B Major)',
    color: '#96dc32',
  },
  'E Major': {
    name: 'E Major',
    camelot: '12B',
    type: 'major',
    pitchClass: 4,
    relativeKey: '12A (C# Minor)',
    compatibleKeys: ['11B (A Major)', '12B (E Major)', '1B (B Major)', '12A (C# Minor)'],
    energyBoostKey: '2B (F# Major)',
    color: '#28d26e',
  },
  'B Major': {
    name: 'B Major',
    camelot: '1B',
    type: 'major',
    pitchClass: 11,
    relativeKey: '1A (G# Minor)',
    compatibleKeys: ['12B (E Major)', '1B (B Major)', '2B (F# Major)', '1A (G# Minor)'],
    energyBoostKey: '3B (Db Major)',
    color: '#00c8b4',
  },
  'F# Major': {
    name: 'F# Major',
    camelot: '2B',
    type: 'major',
    pitchClass: 6,
    relativeKey: '2A (D# Minor)',
    compatibleKeys: ['1B (B Major)', '2B (F# Major)', '3B (Db Major)', '2A (D# Minor)'],
    energyBoostKey: '4B (Ab Major)',
    color: '#00b4f0',
  },
  'Db Major': {
    name: 'Db Major',
    camelot: '3B',
    type: 'major',
    pitchClass: 1,
    relativeKey: '3A (Bb Minor)',
    compatibleKeys: ['2B (F# Major)', '3B (Db Major)', '4B (Ab Major)', '3A (Bb Minor)'],
    energyBoostKey: '5B (Eb Major)',
    color: '#2882ff',
  },
  'Ab Major': {
    name: 'Ab Major',
    camelot: '4B',
    type: 'major',
    pitchClass: 8,
    relativeKey: '4A (F Minor)',
    compatibleKeys: ['3B (Db Major)', '4B (Ab Major)', '5B (Eb Major)', '4A (F Minor)'],
    energyBoostKey: '6B (Bb Major)',
    color: '#6e50ff',
  },
  'Eb Major': {
    name: 'Eb Major',
    camelot: '5B',
    type: 'major',
    pitchClass: 3,
    relativeKey: '5A (C Minor)',
    compatibleKeys: ['4B (Ab Major)', '5B (Eb Major)', '6B (Bb Major)', '5A (C Minor)'],
    energyBoostKey: '7B (F Major)',
    color: '#aa3cf0',
  },
  'Bb Major': {
    name: 'Bb Major',
    camelot: '6B',
    type: 'major',
    pitchClass: 10,
    relativeKey: '6A (G Minor)',
    compatibleKeys: ['5B (Eb Major)', '6B (Bb Major)', '7B (F Major)', '6A (G Minor)'],
    energyBoostKey: '8B (C Major)',
    color: '#e628b4',
  },
  'F Major': {
    name: 'F Major',
    camelot: '7B',
    type: 'major',
    pitchClass: 5,
    relativeKey: '7A (D Minor)',
    compatibleKeys: ['6B (Bb Major)', '7B (F Major)', '8B (C Major)', '7A (D Minor)'],
    energyBoostKey: '9B (G Major)',
    color: '#f0325a',
  },
};

export const PITCH_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function getCamelotByKey(keyName: string): KeyInfo {
  // Normalize alias (e.g. Db -> C#, Eb -> D#, Gb -> F#, Ab -> G#, Bb -> A#)
  const normalized = keyName
    .replace('Db Minor', 'C# Minor')
    .replace('Eb Minor', 'D# Minor')
    .replace('Gb Minor', 'F# Minor')
    .replace('Ab Minor', 'G# Minor')
    .replace('A# Minor', 'Bb Minor')
    .replace('C# Major', 'Db Major')
    .replace('D# Major', 'Eb Major')
    .replace('G# Major', 'Ab Major')
    .replace('A# Major', 'Bb Major');

  return CAMELOT_MAP[normalized] || CAMELOT_MAP['A Minor'];
}
