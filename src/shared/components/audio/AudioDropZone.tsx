'use client';

import React, { useCallback, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  Check,
  Disc,
  Download,
  FileAudio,
  FolderSync,
  HelpCircle,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Sparkles,
  Tag,
  Trash2,
  UploadCloud,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import { useSession } from '@/core/auth/client';
import {
  analyzeAudioFile,
  AudioAnalysisResult,
} from '@/shared/lib/audio/analyzer';
import { CAMELOT_MAP, getCamelotByKey } from '@/shared/lib/audio/camelot';
import { exportTracksToCsv } from '@/shared/lib/audio/csv-exporter';
import { downloadFile, writeId3TagsToAudio } from '@/shared/lib/audio/id3-writer';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { ProUpgradeModal } from './ProUpgradeModal';

interface AudioDropZoneProps {
  maxFreeTracks?: number;
  highlightFeature?: string;
  className?: string;
}

export function AudioDropZone({
  maxFreeTracks = 20,
  highlightFeature,
  className = '',
}: AudioDropZoneProps) {
  const { data: session } = useSession();
  const [tracks, setTracks] = useState<AudioAnalysisResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentFileName, setCurrentFileName] = useState('');
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalTrigger, setProModalTrigger] = useState('Unlimited Batch Drop');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Process incoming files
  const handleFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) =>
        f.type.startsWith('audio/') ||
        /\.(mp3|wav|flac|m4a|aac|ogg|aiff)$/i.test(f.name)
      );

      if (files.length === 0) {
        toast.error('Please drop audio files (MP3, WAV, FLAC, M4A, OGG).');
        return;
      }

      // Check free limit
      if (tracks.length + files.length > maxFreeTracks) {
        setProModalTrigger(`Batching more than ${maxFreeTracks} tracks`);
        setProModalOpen(true);
        // Process up to maxFreeTracks for free anyway
      }

      const filesToProcess = files.slice(0, Math.max(1, maxFreeTracks - tracks.length));
      setIsProcessing(true);

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
        } catch (err: any) {
          console.error('Failed to analyze track', file.name, err);
          toast.error(`Could not decode ${file.name}. Audio format might be corrupted.`);
        }
      }

      setIsProcessing(false);
      setCurrentProgress(100);
      setCurrentFileName('');
      toast.success(`Analyzed ${filesToProcess.length} track${filesToProcess.length > 1 ? 's' : ''} in browser!`);
    },
    [maxFreeTracks, tracks.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
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
          bpmMultiplier: newMultiplier as any,
          bpm: newBpm,
        };
      })
    );
  };

  // Free Action: Export CSV
  const handleExportCsv = () => {
    if (tracks.length === 0) return;
    exportTracksToCsv(tracks);
    toast.success('Crate exported to CSV!');
  };

  // Pro Action: Write ID3 Tags to MP3
  const handleWriteId3Tags = async () => {
    if (tracks.length === 0) return;

    // Check if user has Pro rights; if not, show Pro upgrade modal
    // Free preview: allow writing tag for 1 single track to test quality!
    if (tracks.length > 1) {
      setProModalTrigger('Batch ID3 Tag Writing for Rekordbox & Serato');
      setProModalOpen(true);
      return;
    }

    try {
      const track = tracks[0];
      const { downloadUrl, filename } = await writeId3TagsToAudio(track);
      downloadFile(downloadUrl, filename);
      toast.success(`Downloaded ${filename} with embedded Camelot & BPM ID3 tags!`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to write ID3 tags. Ensure file is a valid MP3.');
    }
  };

  // Pro Action: Harmonic Mix Sort
  const handleHarmonicSort = () => {
    if (tracks.length < 2) return;
    // Free preview for small crates, triggers Pro modal for full workflow
    setProModalTrigger('Harmonic Mix Sequence Auto-Sorter');
    setProModalOpen(true);
  };

  const clearAll = () => {
    setTracks([]);
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
            : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 hover:bg-slate-900/90'
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
          }}
        />

        {/* Ambient Top Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500/20 to-amber-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform duration-200 shadow-lg shadow-orange-500/10">
            {isProcessing ? (
              <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
            ) : (
              <UploadCloud className="w-8 h-8" />
            )}
          </div>

          <div className="space-y-1.5 max-w-md">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {isDragging ? 'Drop Your Audio Files Here' : 'Drop MP3, WAV, or FLAC Files Here'}
            </h3>
            <p className="text-sm text-slate-400">
              Drag & drop entire crates or click to browse. Runs{' '}
              <strong className="text-slate-200">100% locally in your browser</strong> — files are{' '}
              <strong className="text-emerald-400">never uploaded to any server</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Badge variant="outline" className="bg-slate-950/60 border-slate-800 text-slate-300 text-xs">
              ⚡ Instant Key & BPM
            </Badge>
            <Badge variant="outline" className="bg-slate-950/60 border-slate-800 text-slate-300 text-xs">
              🎯 Camelot 8A / 8B Wheels
            </Badge>
            <Badge variant="outline" className="bg-slate-950/60 border-slate-800 text-slate-300 text-xs">
              🔒 100% Client-Side Privacy
            </Badge>
            <Badge variant="outline" className="bg-slate-950/60 border-slate-800 text-slate-300 text-xs">
              📁 Batch Folder Drop
            </Badge>
          </div>
        </div>

        {/* Processing Progress Bar */}
        {isProcessing && (
          <div className="mt-6 max-w-md mx-auto space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span className="truncate max-w-[250px]">{currentFileName}</span>
              <span>{currentProgress}%</span>
            </div>
            <Progress value={currentProgress} className="h-1.5 bg-slate-800" />
          </div>
        )}
      </div>

      {/* Results Section */}
      {tracks.length > 0 && (
        <div className="mt-8 space-y-4">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center gap-2">
              <Disc className="w-5 h-5 text-orange-400" />
              <span className="font-bold text-white text-base">
                Analyzed Crate ({tracks.length} track{tracks.length > 1 ? 's' : ''})
              </span>
              <span className="text-xs text-slate-400">
                (Free batch: {tracks.length}/{maxFreeTracks})
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Free CSV Export */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCsv}
                className="bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800 text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>

              {/* Pro ID3 Tag Writing */}
              <Button
                size="sm"
                onClick={handleWriteId3Tags}
                className="bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs gap-1.5 shadow-sm shadow-orange-500/20"
              >
                <Tag className="w-3.5 h-3.5" />
                Write ID3 Tags
                <Lock className="w-3 h-3 text-orange-200 ml-0.5" />
              </Button>

              {/* Pro Harmonic Sort */}
              <Button
                size="sm"
                variant="outline"
                onClick={handleHarmonicSort}
                className="bg-slate-950 border-slate-800 text-slate-300 hover:text-white text-xs gap-1.5"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                Harmonic Sort
                <Lock className="w-3 h-3 text-amber-400 ml-0.5" />
              </Button>

              {/* Clear */}
              <Button
                size="sm"
                variant="ghost"
                onClick={clearAll}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs px-2"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Results Table */}
          <div className="border border-slate-800 rounded-xl overflow-x-auto bg-slate-950/70">
            <table className="w-full text-left text-sm text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-900/40 text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Track Name</th>
                  <th className="py-3 px-4 font-semibold">Camelot</th>
                  <th className="py-3 px-4 font-semibold">Key</th>
                  <th className="py-3 px-4 font-semibold">BPM & Halving</th>
                  <th className="py-3 px-4 font-semibold">Harmonic Transitions</th>
                  <th className="py-3 px-4 font-semibold text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                {tracks.map((track) => (
                  <tr key={track.id} className="hover:bg-slate-900/50 transition-colors">
                    {/* Filename */}
                    <td className="py-3 px-4 font-sans font-medium text-slate-200 max-w-[240px] truncate">
                      <div className="flex items-center gap-2">
                        <FileAudio className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate" title={track.name}>
                          {track.name}
                        </span>
                      </div>
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
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {track.key}
                    </td>

                    {/* BPM & Half/Double Buttons */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {track.bpm.toFixed(1)}
                        </span>
                        <div className="inline-flex rounded-md bg-slate-900 border border-slate-800 p-0.5">
                          <button
                            title="Halve BPM (e.g. 140 -> 70 for Trap/Dubstep)"
                            onClick={() => toggleTempoMultiplier(track.id, 0.5)}
                            className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                              track.bpmMultiplier === 0.5
                                ? 'bg-orange-500 text-white font-bold'
                                : 'text-slate-400 hover:text-white'
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
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            ×2
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Compatible Keys */}
                    <td className="py-3 px-4 text-slate-400">
                      <span className="truncate max-w-[200px] inline-block" title={track.keyInfo.compatibleKeys.join(', ')}>
                        {track.keyInfo.compatibleKeys.slice(0, 3).map(k => k.split(' ')[0]).join(', ')}
                        {' · '}
                        <span className="text-orange-400 font-semibold">{track.keyInfo.relativeKey.split(' ')[0]}</span>
                      </span>
                    </td>

                    {/* Duration */}
                    <td className="py-3 px-4 text-right text-slate-400 font-mono">
                      {Math.floor(track.duration / 60)}:
                      {Math.floor(track.duration % 60).toString().padStart(2, '0')}
                    </td>
                  </tr>
                ))}
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
