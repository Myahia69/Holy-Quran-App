/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ChevronLeft,
  ChevronRight,
  Volume2,
  VolumeX,
  RotateCw,
  Repeat,
  Loader2,
  AlertCircle,
  Clock,
  ExternalLink,
  Download,
  Check,
  Trash2,
} from 'lucide-react';
import { fetchAudioFile, POPULAR_RECITERS, isAudioFileDownloaded, downloadAudioFile, deleteOfflineAudioFile } from '../services/quranApi';
import { AudioFile, VerseTiming } from '../types';

interface AudioPlayerProps {
  activeSurah: number;
  activeSurahName: string;
  activeLanguage: 'en' | 'ar';
  reciterId: number;
  onReciterChange: (id: number) => void;
  // This reports back to the parent which verse is currently active based on times
  activeVerseKey: string;
  onActiveVerseChange: (key: string) => void;
  // Triggered when surah finishes completely to let parent auto-advance
  onSurahComplete: () => void;
  onPrevSurah: () => void;
  onNextSurah: () => void;
  // Playback control overrides
  isPlaying: boolean;
  onPlayPauseToggle: (isPlaying: boolean) => void;
  // Allow verses to trigger audio seeks
  seekToVerseKey: string;
  onClearSeekRequest: () => void;
}

export default function AudioPlayer({
  activeSurah,
  activeSurahName,
  activeLanguage,
  reciterId,
  onReciterChange,
  activeVerseKey,
  onActiveVerseChange,
  onSurahComplete,
  onPrevSurah,
  onNextSurah,
  isPlaying,
  onPlayPauseToggle,
  seekToVerseKey,
  onClearSeekRequest,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioData, setAudioData] = useState<AudioFile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // HTML5 audio basic state
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds
  const [totalDuration, setTotalDuration] = useState<number>(0); // in seconds
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);

  // Memorization & Looping
  const [isSurahLoopEnabled, setIsSurahLoopEnabled] = useState<boolean>(false);
  const [verseRepeatLimit, setVerseRepeatLimit] = useState<number>(1); // 1 = play once, 2 = repeat twice, etc.
  const [currentVerseRepeatCount, setCurrentVerseRepeatCount] = useState<number>(0);
  const [lastFinishedVerseKey, setLastFinishedVerseKey] = useState<string>('');

  // Track the absolute timing offsets
  const timingsRef = useRef<VerseTiming[]>([]);
  timingsRef.current = audioData?.verse_timings || [];

  const isArabic = activeLanguage === 'ar';

  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);

  // Sync / check offline download status whenever surah or reciter changes
  useEffect(() => {
    let isMounted = true;
    const checkOfflineStatus = async () => {
      const status = await isAudioFileDownloaded(reciterId, activeSurah);
      if (isMounted) {
        setIsDownloaded(status);
      }
    };
    checkOfflineStatus();
    return () => {
      isMounted = false;
    };
  }, [activeSurah, reciterId, isDownloading]);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadProgress(0);
    try {
      await downloadAudioFile(reciterId, activeSurah, (progress) => {
        setDownloadProgress(progress);
      });
      setIsDownloaded(true);
      // Reload audio to switch to offline Object URL!
      onActiveVerseChange('');
      const file = await fetchAudioFile(reciterId, activeSurah);
      if (file) {
        setAudioData(file);
      }
    } catch (err) {
      console.error('Download offline error:', err);
      alert(isArabic ? 'حدث خطأ أثناء تحميل السورة للاستماع دون اتصال بالإنترنت.' : 'Error downloading Surah for offline play.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(null);
    }
  };

  const handleDeleteDownload = async () => {
    try {
      await deleteOfflineAudioFile(reciterId, activeSurah);
      setIsDownloaded(false);
      // Re-load online audio URL
      onActiveVerseChange('');
      const file = await fetchAudioFile(reciterId, activeSurah);
      if (file) {
        setAudioData(file);
      }
    } catch (err) {
      console.error('Delete offline error:', err);
    }
  };

  // Load Audio File when surah or reciter changes
  useEffect(() => {
    let isMounted = true;
    const loadAudio = async () => {
      setIsLoading(true);
      setHasError(false);
      onActiveVerseChange('');
      try {
        const file = await fetchAudioFile(reciterId, activeSurah);
        if (isMounted) {
          if (file && file.url) {
            setAudioData(file);
            setHasError(false);
            // If currently playing, HTML5 play will be triggered by deep effects
          } else {
            console.error('Audio file has no valid URL');
            setHasError(true);
          }
        }
      } catch (err) {
        console.error('Failed to loading audio:', err);
        if (isMounted) {
          setHasError(true);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadAudio();
    return () => {
      isMounted = false;
    };
  }, [activeSurah, reciterId]);

  // Sync state modifications onto the HTML5 Audio Instance
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch((e) => {
        console.warn('Playback error or abort check:', e);
        onPlayPauseToggle(false);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, audioData]);

  // Track speech rate speed modifier
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, audioData]);

  // Track foreign volume levels
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }
  }, [volume, isMuted]);

  // Respond to Seek Requests from Verse Grid list click
  useEffect(() => {
    if (seekToVerseKey && audioData && audioData.verse_timings && audioRef.current) {
      const match = audioData.verse_timings.find((t) => t.verse_key === seekToVerseKey);
      if (match) {
        // seek to timestamp_from
        audioRef.current.currentTime = match.timestamp_from / 1000;
        setCurrentTime(match.timestamp_from / 1000);
        onActiveVerseChange(seekToVerseKey);
        // Auto start playing
        onPlayPauseToggle(true);
        audioRef.current.play().catch(() => {});
      }
      onClearSeekRequest();
    }
  }, [seekToVerseKey, audioData]);

  // Dynamic Verse Syncer & Repetition Memorization Engine
  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audioData) return;

    const currentSecs = audio.currentTime;
    setCurrentTime(currentSecs);
    const currentMs = currentSecs * 1000;

    // 1. Synchronize Timestamp active verse highlight
    const timings = timingsRef.current;
    if (timings.length > 0) {
      // Find matching verse timing
      const activeMatch = timings.find(
        (t) => currentMs >= t.timestamp_from && currentMs < t.timestamp_to
      );

      if (activeMatch) {
         if (activeVerseKey !== activeMatch.verse_key) {
           onActiveVerseChange(activeMatch.verse_key);
         }
      }

      // 2. Memorization Loop logic: Verse Repetition Check
      // We look at the verse timing of the currently highlighted verse
      const currentActiveTiming = timings.find((t) => t.verse_key === activeVerseKey);
      if (currentActiveTiming && verseRepeatLimit > 1) {
        // If we are nearing the end of this verse (within 150ms buffer)
        const verseEndThreshold = currentActiveTiming.timestamp_to - 150;
        if (currentMs >= verseEndThreshold && lastFinishedVerseKey !== activeVerseKey) {
          
          if (currentVerseRepeatCount < verseRepeatLimit - 1) {
            // Repeat this verse! Rewind seek back to timestamp_from of this verse
            audio.currentTime = currentActiveTiming.timestamp_from / 1000;
            setCurrentTime(currentActiveTiming.timestamp_from / 1000);
            setCurrentVerseRepeatCount((prev) => prev + 1);
            
            // Brief visual or console indicator
            console.log(`Repeating Verse ${activeVerseKey} (${currentVerseRepeatCount + 1}/${verseRepeatLimit})`);
          } else {
            // Repetitions completed. Mark as finished so we don't repeat again, and let it proceed to next verse
            setLastFinishedVerseKey(activeVerseKey);
            setCurrentVerseRepeatCount(0);
          }
        }
      }

      // If we move to a different verse, reset repetition counters for that new verse
      if (activeMatch && activeMatch.verse_key !== activeVerseKey) {
        setLastFinishedVerseKey('');
        setCurrentVerseRepeatCount(0);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setTotalDuration(audioRef.current.duration);
    }
  };

  const handleAudioEnded = () => {
    if (isSurahLoopEnabled) {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } else {
      onPlayPauseToggle(false);
      onSurahComplete();
    }
  };

  const handleNextVerse = () => {
    if (!audioData || !audioData.verse_timings || audioData.verse_timings.length === 0) return;
    const timings = audioData.verse_timings;
    
    let currentIndex = timings.findIndex((t) => t.verse_key === activeVerseKey);
    if (currentIndex === -1 && audioRef.current) {
      const currentMs = audioRef.current.currentTime * 1000;
      currentIndex = timings.findIndex(
        (t) => currentMs >= t.timestamp_from && currentMs < t.timestamp_to
      );
    }
    
    if (currentIndex !== -1 && currentIndex < timings.length - 1) {
      const nextVerse = timings[currentIndex + 1];
      if (audioRef.current) {
        audioRef.current.currentTime = nextVerse.timestamp_from / 1000;
        setCurrentTime(nextVerse.timestamp_from / 1000);
        onActiveVerseChange(nextVerse.verse_key);
        onPlayPauseToggle(true);
        audioRef.current.play().catch(() => {});
      }
    } else {
      onNextSurah();
    }
  };

  const handlePrevVerse = () => {
    if (!audioData || !audioData.verse_timings || audioData.verse_timings.length === 0) return;
    const timings = audioData.verse_timings;
    
    let currentIndex = timings.findIndex((t) => t.verse_key === activeVerseKey);
    if (currentIndex === -1 && audioRef.current) {
      const currentMs = audioRef.current.currentTime * 1000;
      currentIndex = timings.findIndex(
        (t) => currentMs >= t.timestamp_from && currentMs < t.timestamp_to
      );
    }
    
    if (currentIndex > 0) {
      const prevVerse = timings[currentIndex - 1];
      if (audioRef.current) {
        audioRef.current.currentTime = prevVerse.timestamp_from / 1000;
        setCurrentTime(prevVerse.timestamp_from / 1000);
        onActiveVerseChange(prevVerse.verse_key);
        onPlayPauseToggle(true);
        audioRef.current.play().catch(() => {});
      }
    } else {
      onPrevSurah();
    }
  };

  const handlePlayPause = () => {
    onPlayPauseToggle(!isPlaying);
  };

  const handleProgressBarChange = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const toggleMute = () => {
     setIsMuted(!isMuted);
  };

  // Human readable time translations
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = Math.floor(secs % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const getSourceDisplayUrl = () => {
    if (!audioData?.url) return '';
    try {
      const parsed = new URL(audioData.url);
      return parsed.hostname;
    } catch {
      return 'Audio Provider';
    }
  };

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-[#072416] dark:bg-[#01140c] text-stone-100 border-t-4 border-gold-400 shadow-[0_-15px_30px_rgba(0,0,0,0.35)] z-30 transition-all duration-300 px-4 md:px-8 py-3.5 md:py-4 flex flex-col md:gap-3"
      id="global-audio-sync-player"
    >
      {/* Invisible HTML5 Player core */}
      {audioData?.url && (
        <audio
          ref={audioRef}
          src={audioData.url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          onError={() => setHasError(true)}
        />
      )}

      {/* Progress timeline bar */}
      <div className="flex items-center gap-3 w-full mb-1">
        <span className="text-[11px] text-gold-300 font-mono w-10 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          id="audio-progress-bar"
          type="range"
          min={0}
          max={totalDuration || 100}
          value={currentTime}
          onChange={(e) => handleProgressBarChange(Number(e.target.value))}
          className="flex-1 h-1.5 bg-[#143d26] dark:bg-emerald-950/60 rounded-lg appearance-none cursor-pointer accent-gold-400 focus:outline-none"
        />
        <span className="text-[11px] text-gold-300 font-mono w-10">
          {formatTime(totalDuration)}
        </span>
      </div>

      {/* Player controls deck */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        {/* Lefthand side: Recitation status and details */}
        <div className="flex items-center gap-3 min-w-[200px]" id="player-meta-pane">
          <div className="p-2.5 rounded-xl bg-emerald-950 border border-gold-400/20 text-gold-400">
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gold-400" />
            ) : isPlaying ? (
              <div className="flex items-end gap-0.5 h-5 w-5 justify-center py-0.5">
                <span className="w-0.5 bg-gold-400 h-2 animate-pulse" />
                <span className="w-0.5 bg-gold-400 h-4 animate-pulse delay-75" />
                <span className="w-0.5 bg-gold-400 h-1 animate-pulse delay-150" />
                <span className="w-0.5 bg-gold-400 h-5 animate-pulse" />
              </div>
            ) : (
              <Clock className="w-5 h-5 text-gold-400/80" />
            )}
          </div>
          <div className="overflow-hidden p-0.5">
            <h4 className="font-serif font-black text-xs md:text-sm text-gold-200 truncate">
              {activeSurahName}
            </h4>
            <div className="text-[10px] text-stone-300 truncate flex items-center gap-1.5 mt-0.5">
              <span className="font-semibold">{POPULAR_RECITERS.find((r) => r.id === reciterId)?.reciter_name || 'Sheikh'}</span>
              
              {audioData && audioData.verse_timings && audioData.verse_timings.length > 0 ? (
                <div className="relative inline-block text-left" id="dropdown-active-verse-sync">
                  <select
                    id="player-active-verse-dropdown"
                    value={activeVerseKey || ''}
                    onChange={(e) => {
                      const vKey = e.target.value;
                      if (vKey) {
                        const match = audioData.verse_timings.find((t) => t.verse_key === vKey);
                        if (match && audioRef.current) {
                          audioRef.current.currentTime = match.timestamp_from / 1000;
                          setCurrentTime(match.timestamp_from / 1000);
                          onActiveVerseChange(vKey);
                          onPlayPauseToggle(true);
                          audioRef.current.play().catch(() => {});
                        }
                      }
                    }}
                    className="bg-[#0c3a21] hover:bg-[#084d28] border border-gold-400/35 hover:border-gold-400 text-gold-300 text-[10px] rounded px-1.5 py-0.5 font-sans font-bold cursor-pointer outline-none transition"
                    title={isArabic ? 'تغيير الآية المقروءة ومزامنة التلاوة' : 'Change active verse and sync playback'}
                  >
                    <option value="" disabled className="bg-[#02130c] text-stone-400">
                      {isArabic ? 'اختر آية...' : 'Select Ayah...'}
                    </option>
                    {audioData.verse_timings.map((vt) => {
                      const ayahNum = vt.verse_key.split(':')[1];
                      return (
                        <option
                          key={vt.verse_key}
                          value={vt.verse_key}
                          className="bg-[#02130c] text-gold-200"
                        >
                          {isArabic ? `آية ${ayahNum}` : `Ayah ${ayahNum}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              ) : activeVerseKey ? (
                <span className="px-2 py-0.5 rounded bg-gold-400/10 text-gold-300 border border-gold-500/20 font-mono font-bold text-[10px]">
                  {isArabic ? `آية ${activeVerseKey}` : `Ayah ${activeVerseKey}`}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        {/* Center: Playback state controllers */}
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5" id="player-core-controls">
          {/* Looping options */}
          <button
            id="player-surah-loop-toggle"
            onClick={() => setIsSurahLoopEnabled(!isSurahLoopEnabled)}
            title={isArabic ? 'تكرار السورة' : 'Loop Surah'}
            className={`p-2 rounded-full cursor-pointer transition ${
              isSurahLoopEnabled
                ? 'bg-gold-400/25 text-gold-300 border border-gold-400/40'
                : 'text-stone-300 hover:text-gold-300'
            }`}
          >
            <Repeat className="w-4 h-4 md:w-5 h-5" />
          </button>

          {/* Memorization loop (Verse repetition limit toggle) */}
          <button
            id="player-verse-repeat-toggle"
            onClick={() => {
              // Cycle through 1 (no repeat), 2, 3, 5 repetitions
              setVerseRepeatLimit((prev) => {
                if (prev === 1) return 2;
                if (prev === 2) return 3;
                if (prev === 3) return 5;
                return 1;
              });
            }}
            title={isArabic ? 'تكرار الآية للحفظ' : 'Verse Memorization Repeater'}
            className={`p-2 rounded-full cursor-pointer transition flex items-center gap-1 ${
              verseRepeatLimit > 1
                ? 'bg-gold-400/25 text-gold-300 border border-gold-400/40'
                : 'text-stone-300 hover:text-gold-300'
            }`}
          >
            <RotateCw className="w-4 h-4 md:w-5 h-5" />
            {verseRepeatLimit > 1 && (
              <span className="text-[10px] font-bold font-mono text-gold-300">
                {verseRepeatLimit}x
                {currentVerseRepeatCount > 0 && ` (${currentVerseRepeatCount + 1})`}
              </span>
            )}
          </button>

          {/* Previous Surah */}
          <button
            id="player-btn-prev"
            onClick={onPrevSurah}
            title={isArabic ? 'السورة السابقة' : 'Previous Surah'}
            className="p-2 text-stone-300 hover:text-gold-300 transition cursor-pointer"
          >
            <SkipBack className="w-5 h-5" />
          </button>

          {/* Previous Verse */}
          <button
            id="player-btn-prev-verse"
            onClick={handlePrevVerse}
            disabled={!audioData || !audioData.verse_timings || audioData.verse_timings.length === 0}
            title={isArabic ? 'الآية السابقة' : 'Previous Ayah'}
            className="p-1 text-stone-300 hover:text-gold-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Master Play Button with beautiful royal golden circle */}
          <button
            id="player-btn-toggle-play"
            onClick={handlePlayPause}
            disabled={isLoading || hasError}
            className={`w-11 h-11 rounded-full shadow-md text-emerald-950 transition flex items-center justify-center cursor-pointer ${
              hasError
                ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300 cursor-not-allowed'
                : 'bg-gold-400 hover:bg-gold-300 hover:scale-105 active:scale-95 border border-gold-450/45'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-950" />
            ) : isPlaying ? (
              <Pause className="w-4 h-4 fill-emerald-950 text-emerald-950" />
            ) : (
              <Play className="w-4 h-4 fill-emerald-950 text-emerald-950 ml-0.5" />
            )}
          </button>

          {/* Next Verse */}
          <button
            id="player-btn-next-verse"
            onClick={handleNextVerse}
            disabled={!audioData || !audioData.verse_timings || audioData.verse_timings.length === 0}
            title={isArabic ? 'الآية التالية' : 'Next Ayah'}
            className="p-1 text-stone-300 hover:text-gold-300 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Next Surah */}
          <button
            id="player-btn-next"
            onClick={onNextSurah}
            title={isArabic ? 'السورة التالية' : 'Next Surah'}
            className="p-2 text-stone-300 hover:text-gold-300 transition cursor-pointer"
          >
            <SkipForward className="w-5 h-5" />
          </button>

          {/* Speed tuning styled select */}
          <select
            id="player-speed-multiplier"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            title={isArabic ? 'سرعة التلاوة' : 'Recitation speed'}
            className="bg-emerald-950 dark:bg-[#02130c] border border-gold-400/35 text-gold-200 text-[11px] md:text-xs rounded-lg p-1.5 focus:ring-0 outline-none cursor-pointer font-sans font-bold"
          >
            <option value="0.5" className="bg-[#072416] text-gold-200">0.5x</option>
            <option value="0.75" className="bg-[#072416] text-gold-200">0.75x</option>
            <option value="1" className="bg-[#072416] text-gold-200">1.0x</option>
            <option value="1.25" className="bg-[#072416] text-gold-200">1.25x</option>
            <option value="1.5" className="bg-[#072416] text-gold-200">1.5x</option>
            <option value="2" className="bg-[#072416] text-gold-200">2.0x</option>
          </select>
        </div>

        {/* Rightside: Reciter dropdown slider & Volume controls */}
        <div className="flex items-center justify-end gap-3 md:min-w-[240px]" id="player-volume-pane">
          {/* Offline Download Button */}
          {isDownloading ? (
            <div className="flex items-center gap-1 bg-gold-400/25 border border-gold-400/30 text-gold-300 px-2.5 py-1.5 rounded-lg text-[10px] font-bold animate-pulse" id="downloading-indicator">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-gold-400" />
              <span>{downloadProgress}%</span>
            </div>
          ) : isDownloaded ? (
            <button
              id="btn-delete-offline"
              onClick={handleDeleteDownload}
              title={isArabic ? 'السورة محملة وجاهزة للاستماع دون اتصال. انقر لحذف الملف' : 'Surah downloaded offline. Click to remove'}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-emerald-900/50 hover:bg-rose-900/25 border border-emerald-500/30 hover:border-rose-500/30 text-emerald-300 hover:text-rose-300 rounded-lg transition cursor-pointer group"
            >
              <Check className="w-3.5 h-3.5 group-hover:hidden shrink-0 text-emerald-400" />
              <Trash2 className="w-3.5 h-3.5 hidden group-hover:block shrink-0" />
              <span className="text-[10px] font-bold group-hover:block hidden">{isArabic ? 'حذف' : 'Remove'}</span>
              <span className="text-[10px] font-bold group-hover:hidden">{isArabic ? 'جاهزة' : 'Ready'}</span>
            </button>
          ) : (
            <button
              id="btn-download-offline"
              onClick={handleDownload}
              title={isArabic ? 'تحميل السورة للاستماع دون اتصال بالإنترنت' : 'Download Surah for offline play'}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 bg-emerald-950 hover:bg-emerald-900/70 border border-gold-400/35 hover:border-gold-300 text-gold-300 hover:text-gold-200 rounded-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-bold">{isArabic ? 'تحميل' : 'Download'}</span>
            </button>
          )}

          {/* Reciter selector on player */}
          <select
            id="player-reciter-selector"
            value={reciterId}
            onChange={(e) => onReciterChange(Number(e.target.value))}
            className="bg-emerald-950 dark:bg-[#02130c] border border-gold-400/35 text-gold-200 text-xs rounded-lg p-1.5 focus:ring-0 outline-none max-w-[120px] md:max-w-[150px] truncate font-bold cursor-pointer"
          >
            {POPULAR_RECITERS.map((r) => (
              <option key={r.id} value={r.id} className="bg-[#072416] text-gold-200">
                {isArabic ? r.translated_name : r.reciter_name}
              </option>
            ))}
          </select>

          {/* Volume bars */}
          <div className="flex items-center gap-1.5">
            <button
              id="player-btn-mute"
              onClick={toggleMute}
              className="p-1.5 hover:bg-gold-400/10 rounded-lg text-gold-300 hover:text-gold-200 cursor-pointer"
            >
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              id="player-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                if (isMuted) setIsMuted(false);
              }}
              className="w-12 md:w-16 h-1 bg-[#143d26] dark:bg-emerald-950 rounded appearance-none cursor-pointer accent-gold-400 outline-none"
            />
          </div>

          {/* Source Link */}
          {audioData?.url && (
            <a
              href={audioData.url}
              target="_blank"
              rel="noopener noreferrer"
              title={isArabic ? 'فتح المسار الصوتي المباشر' : 'Open direct audio path'}
              className="p-1.5 hover:bg-gold-400/10 rounded-lg text-gold-400 hover:text-gold-300 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </div>

      {/* Network or format error alert */}
      {hasError && (
        <div
          className="bg-rose-950/40 text-rose-300 p-2.5 rounded-lg border border-rose-500/20 text-xs flex items-center gap-2 mt-2"
          id="audio-playing-error-alert"
        >
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-300" />
          <span>
            {isArabic
              ? 'تنبيه: لم نتمكن من بث القراءة المباشرة من الخادم. يرجى تجربة قارئ آخر.'
              : `Unable to establish audio stream (${getSourceDisplayUrl()}). Feel free to swap reciters.`}
          </span>
        </div>
      )}
    </div>
  );
}
