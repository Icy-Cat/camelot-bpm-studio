'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  ArrowUpDown,
  Crown,
  Disc,
  Download,
  FileAudio,
  ListMusic,
  Loader2,
  Lock,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import { useAppContext } from '@/shared/contexts/app';
import { trackPvuvEvent } from '@/shared/lib/analytics/pvuv';
import {
  analyzeAudioFile,
  AudioAnalysisResult,
} from '@/shared/lib/audio/analyzer';
import {
  exportTracksToCsv,
  exportTracksToM3u8,
} from '@/shared/lib/audio/csv-exporter';
import {
  HarmonicTransition,
  sortTracksHarmonically,
} from '@/shared/lib/audio/harmonic-sorter';
import {
  downloadFile,
  isMp3File,
  writeBatchId3TagsToZip,
  writeId3TagsToAudio,
} from '@/shared/lib/audio/id3-writer';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { ProUpgradeModal } from './ProUpgradeModal';

interface AudioDropZoneProps {
  maxFreeTracks?: number;
  highlightFeature?: string;
  className?: string;
}

const TRANSITION_STYLES: Record<HarmonicTransition['quality'], string> = {
  perfect:
    'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  smooth:
    'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-500/30',
  boost:
    'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30',
  moderate:
    'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
  clash:
    'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-300 dark:border-slate-700',
};

export function AudioDropZone({
  maxFreeTracks = 20,
  highlightFeature,
  className = '',
}: AudioDropZoneProps) {
  const { user } = useAppContext();
  const isPro = Boolean(user?.isPro || user?.isAdmin);

  const [tracks, setTracks] = useState<AudioAnalysisResult[]>([]);
  const [transitions, setTransitions] = useState<Record<string, HarmonicTransition>>({});
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTagging, setIsTagging] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalTrigger, setProModalTrigger] = useState('Unlimited Batch Drop');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process incoming files
  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter(
        (f) =>
          f.type.startsWith('audio/') ||
          /\.(mp3|wav|flac|m4a|aac|ogg|aiff)$/i.test(f.name)
      );

      if (files.length === 0) {
        toast.error('Please drop audio files (MP3, WAV, FLAC, M4A, OGG).');
        return;
      }

      let filesToProcess = files;

      // Enforce free limit only for non-Pro users
      if (!isPro) {
        const remainingSlots = Math.max(0, maxFreeTracks - tracks.length);
        if (tracks.length + files.length > maxFreeTracks) {
          const trigger = `Batching more than ${maxFreeTracks} tracks`;
          setProModalTrigger(trigger);
          setProModalOpen(true);
          trackPvuvEvent('pro_modal_opened', { trigger: 'batch_limit' });
          if (remainingSlots === 0) {
            return;
          }
        }
        filesToProcess = files.slice(0, remainingSlots);
      }

      setIsProcessing(true);
      setTransitions({});

      let successCount = 0;

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        setCurrentFileName(file.name);
        setCurrentProgress(Math.round(((i + 0.1) / filesToProcess.length) * 100));

        try {
          const result = await analyzeAudioFile(file, (percent) => {
            const overall = Math.round(
              ((i + percent / 100) / filesToProcess.length) * 100
            );
            setCurrentProgress(overall);
          });

          setTracks((prev) => [result, ...prev]);
          successCount++;
        } catch (err: any) {
          console.error('Failed to analyze track', file.name, err);
          toast.error(
            `Could not decode ${file.name}. Audio format might be corrupted.`
          );
        }
      }

      setIsProcessing(false);
      setCurrentProgress(100);
      setCurrentFileName('');
      if (successCount > 0) {
        trackPvuvEvent('audio_analyzed', {
          tracks_count: successCount,
          is_pro: isPro,
        });
        toast.success(
          `Analyzed ${successCount} track${successCount > 1 ? 's' : ''} in browser!`
        );
      }
    },
    [isPro, maxFreeTracks, tracks.length]
  );

  // Recursively collect files from dropped directories (webkitGetAsEntry)
  const collectFilesFromEntry = async (
    entry: FileSystemEntry
  ): Promise<File[]> => {
    if (entry.isFile) {
      return new Promise((resolve) => {
        (entry as FileSystemFileEntry).file(
          (f) => resolve([f]),
          () => resolve([])
        );
      });
    }
    if (entry.isDirectory) {
      const reader = (entry as FileSystemDirectoryEntry).createReader();
      const allEntries: FileSystemEntry[] = [];
      await new Promise<void>((resolve) => {
        const readBatch = () => {
          reader.readEntries(
            (batch) => {
              if (batch.length === 0) {
                resolve();
              } else {
                allEntries.push(...batch);
                readBatch();
              }
            },
            () => resolve()
          );
        };
        readBatch();
      });
      const nested = await Promise.all(allEntries.map(collectFilesFromEntry));
      return nested.flat();
    }
    return [];
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const items = e.dataTransfer.items;
      if (
        items &&
        items.length > 0 &&
        typeof items[0].webkitGetAsEntry === 'function'
      ) {
        const entries: FileSystemEntry[] = [];
        for (let i = 0; i < items.length; i++) {
          const entry = items[i].webkitGetAsEntry();
          if (entry) entries.push(entry);
        }
        if (entries.length > 0) {
          const nestedFiles = (
            await Promise.all(entries.map(collectFilesFromEntry))
          ).flat();
          if (nestedFiles.length > 0) {
            handleFiles(nestedFiles);
            return;
          }
        }
      }

      if (e.dataTransfer.files) {
        handleFiles(e.dataTransfer.files);
      }
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Toggle Half / Double Tempo (×2 / ÷2)
  const toggleTempoMultiplier = (trackId: string, multiplier: 0.5 | 2) => {
    setTracks((prev) =>
      prev.map((t) => {
        if (t.id !== trackId) return t;
        const newMultiplier = t.bpmMultiplier === multiplier ? 1 : multiplier;
        const newBpm = Math.round(t.originalBpm * newMultiplier * 10) / 10;
        return {
          ...t,
          bpmMultiplier: newMultiplier as 1 | 0.5 | 2,
          bpm: newBpm,
        };
      })
    );
    setTransitions({});
  };

  // Free Action: Export CSV
  const handleExportCsv = () => {
    if (tracks.length === 0) return;
    exportTracksToCsv(tracks);
    trackPvuvEvent('export_csv', { tracks_count: tracks.length });
    toast.success('Crate exported to CSV!');
  };

  // Free Action: Export M3U8 DJ Playlist
  const handleExportM3u8 = () => {
    if (tracks.length === 0) return;
    exportTracksToM3u8(tracks);
    trackPvuvEvent('export_m3u8', { tracks_count: tracks.length });
    toast.success('Playlist exported to M3U8 for Rekordbox & Serato!');
  };

  // Single-track ID3 writer (free preview for 1 track or per-row download for Pro)
  const handleSingleId3Write = async (track: AudioAnalysisResult) => {
    try {
      const { downloadUrl, filename } = await writeId3TagsToAudio(track);
      downloadFile(downloadUrl, filename);
      trackPvuvEvent('id3_tag_written', { mode: 'single', tagged_count: 1 });
      toast.success(
        `Downloaded ${filename} with embedded Camelot & BPM ID3 tags!`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.message || 'Failed to write ID3 tags. Ensure file is a valid MP3.'
      );
    }
  };

  // Pro Action: Write ID3 Tags to MP3 (single file free preview; batch ZIP for Pro)
  const handleWriteId3Tags = async () => {
    if (tracks.length === 0 || isTagging) return;

    if (tracks.length === 1) {
      await handleSingleId3Write(tracks[0]);
      return;
    }

    if (!isPro) {
      setProModalTrigger('Batch ID3 Tag Writing for Rekordbox & Serato');
      setProModalOpen(true);
      trackPvuvEvent('pro_modal_opened', { trigger: 'batch_id3' });
      return;
    }

    setIsTagging(true);
    try {
      const { downloadUrl, filename, taggedCount, skippedCount } =
        await writeBatchId3TagsToZip(tracks);
      downloadFile(downloadUrl, filename);
      trackPvuvEvent('id3_tag_written', {
        mode: 'batch_zip',
        tagged_count: taggedCount,
      });
      const skipNote =
        skippedCount > 0
          ? ` (${skippedCount} non-MP3 track${skippedCount > 1 ? 's' : ''} included in bundled CSV)`
          : '';
      toast.success(
        `Tagged ${taggedCount} MP3 file${taggedCount > 1 ? 's' : ''} and downloaded ${filename}!${skipNote}`
      );
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Failed to package batch ID3 tags.');
    } finally {
      setIsTagging(false);
    }
  };

  // Pro Action: Harmonic Mix Sequence Auto-Sorter
  const handleHarmonicSort = () => {
    if (tracks.length < 2) return;

    if (!isPro) {
      setProModalTrigger('Harmonic Mix Sequence Auto-Sorter');
      setProModalOpen(true);
      trackPvuvEvent('pro_modal_opened', { trigger: 'harmonic_sort' });
      return;
    }

    const { sortedTracks, transitions: list, smoothCount, totalTransitions } =
      sortTracksHarmonically(tracks);

    const transitionMap: Record<string, HarmonicTransition> = {};
    sortedTracks.forEach((t, idx) => {
      const tr = list[idx];
      if (tr) transitionMap[t.id] = tr;
    });

    setTracks(sortedTracks);
    setTransitions(transitionMap);

    const smoothPct =
      totalTransitions > 0
        ? Math.round((smoothCount / totalTransitions) * 100)
        : 100;
    trackPvuvEvent('harmonic_sort_used', {
      tracks_count: sortedTracks.length,
      smooth_pct: smoothPct,
    });
    toast.success(
      `Harmonically sorted ${sortedTracks.length} tracks (${smoothCount}/${totalTransitions} smooth Camelot transitions · ${smoothPct}%)!`
    );
  };

  const removeTrack = (trackId: string) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId));
    setTransitions({});
  };

  const clearAll = () => {
    setTracks([]);
    setTransitions({});
  };

  return (
    <div className={`w-full max-w-5xl mx-auto ${className}`}>
      {/* Drop Zone Box */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group cursor-pointer border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 overflow-hidden ${
          isDragging
            ? 'border-orange-500 bg-orange-500/10 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-900/90 shadow-xs dark:shadow-none'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,.mp3,.wav,.flac,.m4a,.aac,.ogg"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleFiles(e.target.files);
            e.target.value = '';
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500/15 to-amber-500/15 dark:from-orange-500/20 dark:to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-500 dark:text-orange-400 group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-orange-500/10">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 dark:text-orange-400" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              {isDragging
                ? 'Drop Your Audio Files Here'
                : 'Drop MP3, WAV, or FLAC Files Here'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Drag & drop entire crates or click to browse. Runs{' '}
              <strong className="text-slate-900 dark:text-slate-200">
                100% locally in your browser
              </strong>{' '}
              — files are{' '}
              <strong className="text-emerald-600 dark:text-emerald-400">
                never uploaded to any server
              </strong>
              .
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Badge
              variant="outline"
              className="bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs"
            >
              ⚡ Instant Key & BPM
            </Badge>
            <Badge
              variant="outline"
              className="bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs"
            >
              🎯 Camelot 8A / 8B Wheels
            </Badge>
            <Badge
              variant="outline"
              className="bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs"
            >
              🔒 100% Client-Side Privacy
            </Badge>
            <Badge
              variant="outline"
              className="bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs"
            >
              📁 Batch Folder Drop
            </Badge>
          </div>

          <div className="pt-2">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold text-xs shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <UploadCloud className="w-4 h-4" />
              <span>Browse or Drop Audio Files</span>
            </span>
          </div>
        </div>

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="mt-6 max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="truncate max-w-[250px]">{currentFileName}</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-1.5 bg-slate-200 dark:bg-slate-800" />
          </div>
        )}
      </div>

      {/* Results Section */}
      {tracks.length > 0 && (
        <div className="mt-8 space-y-4">
          {/* Action Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs dark:shadow-none">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <Disc className="w-5 h-5 text-orange-500 dark:text-orange-400 shrink-0" />
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                Analyzed Crate ({tracks.length} track
                {tracks.length > 1 ? 's' : ''})
              </span>
              {isPro ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  <Crown className="w-3 h-3" />
                  PRO UNLIMITED
                </span>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Free: {tracks.length}/{maxFreeTracks})
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Free CSV Export */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCsv}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>

              {/* Free M3U8 DJ Playlist Export */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportM3u8}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs gap-1.5"
              >
                <ListMusic className="w-3.5 h-3.5" />
                M3U8
              </Button>

              {/* Pro ID3 Tag Writing */}
              <Button
                size="sm"
                onClick={handleWriteId3Tags}
                disabled={isTagging}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs gap-1.5 shadow-sm shadow-orange-500/20"
              >
                {isTagging ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Tag className="w-3.5 h-3.5" />
                )}
                {isTagging
                  ? 'Tagging ZIP...'
                  : tracks.length > 1 && isPro
                    ? 'Write ID3 ZIP'
                    : 'Write ID3 Tags'}
                {!isPro && <Lock className="w-3 h-3 text-orange-200 ml-0.5" />}
              </Button>

              {/* Pro Harmonic Sort */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleHarmonicSort}
                disabled={tracks.length < 2}
                className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs gap-1.5"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Harmonic Sort
                {!isPro ? (
                  <Lock className="w-3 h-3 text-amber-500 dark:text-amber-400 ml-0.5" />
                ) : (
                  <Sparkles className="w-3 h-3 text-emerald-600 dark:text-emerald-400 ml-0.5" />
                )}
              </Button>

              {/* Clear */}
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                title="Clear all tracks"
                className="text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 text-xs px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Results Table */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto bg-white dark:bg-slate-950/70 shadow-xs dark:shadow-none">
            <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Track Name</th>
                  <th className="py-3 px-4 font-semibold">Camelot</th>
                  <th className="py-3 px-4 font-semibold">Key</th>
                  <th className="py-3 px-4 font-semibold">BPM & Halving</th>
                  <th className="py-3 px-4 font-semibold">
                    Harmonic Transitions
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">
                    Duration
                  </th>
                  <th className="py-3 px-2 font-semibold text-right w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono text-xs">
                {tracks.map((track) => {
                  const transition = transitions[track.id];
                  return (
                    <tr
                      key={track.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      {/* Filename */}
                      <td className="py-3 px-4 font-sans font-medium text-slate-900 dark:text-slate-200 max-w-[240px]">
                        <div className="flex items-center gap-2">
                          <FileAudio className="w-4 h-4 text-slate-400 shrink-0" />
                          <span className="truncate" title={track.name}>
                            {track.name}
                          </span>
                        </div>
                        {transition && (
                          <span
                            className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded border text-[10px] font-medium ${TRANSITION_STYLES[transition.quality]}`}
                          >
                            ↳ {transition.label}
                          </span>
                        )}
                      </td>

                      {/* Camelot Badge */}
                      <td className="py-3 px-4">
                        <span
                          className="inline-flex items-center justify-center font-bold px-2.5 py-1 rounded-md text-slate-950 text-xs shadow-sm"
                          style={{ backgroundColor: track.keyInfo.color }}
                        >
                          {track.camelot}
                        </span>
                      </td>

                      {/* Key Name */}
                      <td className="py-3 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {track.key}
                      </td>

                      {/* BPM & Half/Double Buttons */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {track.bpm.toFixed(1)}
                          </span>
                          <div className="inline-flex rounded-md bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-0.5">
                            <button
                              title="Halve BPM (e.g. 140 -> 70 for Trap/Dubstep)"
                              onClick={() =>
                                toggleTempoMultiplier(track.id, 0.5)
                              }
                              className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                                track.bpmMultiplier === 0.5
                                  ? 'bg-orange-500 text-white font-bold'
                                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                              }`}
                            >
                              ÷2
                            </button>
                            <button
                              title="Double BPM (e.g. 70 -> 140)"
                              onClick={() => toggleTempoMultiplier(track.id, 2)}
                              className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                                track.bpmMultiplier === 2
                                  ? 'bg-orange-500 text-white font-bold'
                                  : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white'
                              }`}
                            >
                              ×2
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Compatible Keys */}
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                        <span
                          className="truncate max-w-[200px] inline-block"
                          title={track.keyInfo.compatibleKeys.join(', ')}
                        >
                          {track.keyInfo.compatibleKeys
                            .slice(0, 3)
                            .map((k) => k.split(' ')[0])
                            .join(', ')}
                          {' · '}
                          <span className="text-orange-600 dark:text-orange-400 font-semibold">
                            {track.keyInfo.relativeKey.split(' ')[0]}
                          </span>
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 font-mono">
                        {Math.floor(track.duration / 60)}:
                        {Math.floor(track.duration % 60)
                          .toString()
                          .padStart(2, '0')}
                      </td>

                      {/* Per-row quick actions */}
                      <td className="py-3 px-2 text-right">
                        <div className="inline-flex items-center gap-1">
                          {isPro && isMp3File(track.file) && (
                            <button
                              title="Write ID3 tags to this MP3"
                              onClick={() => handleSingleId3Write(track)}
                              className="p-1 rounded text-slate-500 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                            >
                              <Tag className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            title="Remove track"
                            onClick={() => removeTrack(track.id)}
                            className="p-1 rounded text-slate-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pro Modal */}
      <ProUpgradeModal
        open={proModalOpen}
        onOpenChange={setProModalOpen}
        triggerFeature={proModalTrigger}
      />
    </div>
  );
}
