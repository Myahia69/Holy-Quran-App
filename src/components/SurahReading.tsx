/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Play, Pause, Bookmark, Copy, Check, ChevronLeft, ChevronRight, HelpCircle, Sparkles } from 'lucide-react';
import { Verse, Chapter } from '../types';
import { fetchChapterVerses, fetchPageVerses, fetchTafsir, POPULAR_TAFSIRS, POPULAR_TRANSLATIONS } from '../services/quranApi';

interface SurahReadingProps {
  activeSurah: number;
  activeSurahDetail: Chapter | null;
  activeLanguage: 'en' | 'ar';
  activeVerseKey: string;
  activeWordPosition?: number | null;
  onVersePlayClick: (verseKey: string) => void;
  onVerseStudyClick: (verseKey: string, text: string) => void;
  isAudioPlaying: boolean;
  textScale: number; // e.g. 1, 1.25, 1.5
  translationId: number;
  onTranslationChange: (id: number) => void;
  // Bookmark state
  bookmarkedVerseKey: string;
  onToggleBookmark: (key: string) => void;
  selectedTafsirId: number;
  mushafMode: boolean;
  onToggleMushaf: () => void;
}

const SURAH_START_PAGES = [
  0, // Dummy
  1, 2, 50, 77, 106, 128, 151, 177, 187, 208, // 1-10
  221, 235, 249, 255, 262, 267, 282, 293, 305, 312, // 11-20
  322, 332, 342, 350, 359, 367, 377, 385, 396, 404, // 21-30
  411, 415, 418, 428, 434, 440, 446, 453, 458, 467, // 31-40
  477, 483, 489, 496, 499, 502, 507, 511, 515, 518, // 41-50
  520, 523, 526, 528, 531, 534, 537, 542, 545, 549, // 51-60
  551, 553, 554, 556, 558, 560, 562, 564, 566, 568, // 61-70
  570, 572, 574, 575, 577, 578, 580, 582, 583, 585, // 71-80
  586, 587, 587, 589, 590, 591, 591, 592, 593, 594, // 81-90
  595, 595, 596, 596, 597, 597, 598, 598, 599, 599, // 91-100
  600, 600, 601, 601, 601, 602, 602, 602, 603, 603, // 101-110
  603, 604, 604, 604 // 111-114
];

const getJuzOfPage = (p: number): number => {
  if (p <= 21) return 1;
  if (p <= 41) return 2;
  if (p <= 61) return 3;
  if (p <= 81) return 4;
  if (p <= 101) return 5;
  if (p <= 121) return 6;
  if (p <= 141) return 7;
  if (p <= 161) return 8;
  if (p <= 181) return 9;
  if (p <= 201) return 10;
  if (p <= 221) return 11;
  if (p <= 241) return 12;
  if (p <= 261) return 13;
  if (p <= 281) return 14;
  if (p <= 301) return 15;
  if (p <= 321) return 16;
  if (p <= 341) return 17;
  if (p <= 361) return 18;
  if (p <= 381) return 19;
  if (p <= 401) return 20;
  if (p <= 421) return 21;
  if (p <= 441) return 22;
  if (p <= 461) return 23;
  if (p <= 481) return 24;
  if (p <= 501) return 25;
  if (p <= 521) return 26;
  if (p <= 541) return 27;
  if (p <= 561) return 28;
  if (p <= 581) return 29;
  return 30;
};

export default function SurahReading({
  activeSurah,
  activeSurahDetail,
  activeLanguage,
  activeVerseKey,
  activeWordPosition,
  onVersePlayClick,
  onVerseStudyClick,
  isAudioPlaying,
  textScale,
  translationId,
  onTranslationChange,
  bookmarkedVerseKey,
  onToggleBookmark,
  selectedTafsirId,
  mushafMode,
  onToggleMushaf,
}: SurahReadingProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedVerseKey, setCopiedVerseKey] = useState<string>('');

  const [mushafPage, setMushafPage] = useState<number>(() => {
    const start = SURAH_START_PAGES[activeSurah] || 1;
    return start;
  });

  const [invertMushaf, setInvertMushaf] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quran_mushaf_invert');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [syncWithAudio, setSyncWithAudio] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quran_mushaf_sync_audio');
      // Default to false so reading is completely decoupled from the audio playback as requested by the user
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [zoomLevel, setZoomLevel] = useState<number>(100);

  const [extraSharp, setExtraSharp] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('quran_mushaf_sharp');
      return saved !== 'false';
    } catch {
      return true;
    }
  });

  const [tafsirs, setTafsirs] = useState<Record<string, string>>({});
  const [isTafsirsLoading, setIsTafsirsLoading] = useState<boolean>(false);

  // States for interactive Mushaf Page Side-by-side Panel
  const [mushafPageVerses, setMushafPageVerses] = useState<Verse[]>([]);
  const [isMushafPageLoading, setIsMushafPageLoading] = useState<boolean>(false);
  const [imageErrorCount, setImageErrorCount] = useState<number>(0);

  const [activeWordId, setActiveWordId] = useState<number | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const activeVerseRef = useRef<HTMLDivElement | null>(null);

  const isArabic = activeLanguage === 'ar';

  const playWordAudio = (audioUrl: string | undefined, wordId: number) => {
    if (!audioUrl) return;
    setActiveWordId(wordId);
    const audio = new Audio(audioUrl);
    audio.play().catch(e => {
      console.warn("Could not play word pronunciation audio:", e);
    }).finally(() => {
      setTimeout(() => {
        setActiveWordId((prev) => (prev === wordId ? null : prev));
      }, 900);
    });
  };

  // Load verses when surah, translation, or page changes
  useEffect(() => {
    let isMounted = true;
    const loadVerses = async () => {
      setIsLoading(true);
      try {
        const data = await fetchChapterVerses(activeSurah, translationId, currentPage, 15);
        if (isMounted) {
          setVerses(data.verses);
          setTotalPages(data.totalPages);
        }
      } catch (err) {
        console.error('Error fetching chapter verses:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVerses();
    return () => {
      isMounted = false;
    };
  }, [activeSurah, translationId, currentPage]);

  // Reset page to 1 when surah changes
  useEffect(() => {
    setCurrentPage(1);
    setVerses([]);
    setTafsirs({});
  }, [activeSurah]);

  // Synchronize localStorage for visual preferrences
  useEffect(() => {
    try {
      localStorage.setItem('quran_mushaf_view_mode', String(mushafMode));
    } catch {}
  }, [mushafMode]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_mushaf_invert', String(invertMushaf));
    } catch {}
  }, [invertMushaf]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_mushaf_sharp', String(extraSharp));
    } catch {}
  }, [extraSharp]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_mushaf_sync_audio', String(syncWithAudio));
    } catch {}
  }, [syncWithAudio]);

  // Sync Mushaf Page when Surah changes from parent select
  useEffect(() => {
    const sPage = SURAH_START_PAGES[activeSurah] || 1;
    setMushafPage(sPage);
  }, [activeSurah]);

  // Reset image error count when page changes to try high-res first
  useEffect(() => {
    setImageErrorCount(0);
  }, [mushafPage]);

  // Load verses of the current Mushaf Page for side-by-side translation/tafsir
  useEffect(() => {
    if (!mushafMode) return;
    
    let isMounted = true;
    const loadVersesForMushafPage = async () => {
      setIsMushafPageLoading(true);
      try {
        const pageVerses = await fetchPageVerses(mushafPage, translationId);
        if (isMounted) {
          setMushafPageVerses(pageVerses);
        }
      } catch (err) {
        console.error('Error fetching verses for mushaf page:', err);
      } finally {
        if (isMounted) {
          setIsMushafPageLoading(false);
        }
      }
    };
    
    loadVersesForMushafPage();
    return () => {
      isMounted = false;
    };
  }, [mushafPage, translationId, mushafMode]);

  // Sync Mushaf Page with Active Verse key during global recitation/audio playing
  useEffect(() => {
    if (syncWithAudio && mushafMode && activeVerseKey) {
      const isAlreadyOnPage = mushafPageVerses.some(v => v.verse_key === activeVerseKey);
      if (!isAlreadyOnPage) {
        const [sKey, vKey] = activeVerseKey.split(':');
        const sNum = Number(sKey);
        const vNum = Number(vKey);
        if (!isNaN(sNum) && !isNaN(vNum)) {
          // Check if we can find page number in loaded default verses
          const loadedVerse = verses.find(v => v.verse_key === activeVerseKey);
          if (loadedVerse && loadedVerse.page_number) {
            setMushafPage(loadedVerse.page_number);
          } else {
            // Rough estimation fallback capped by next surah boundary
            const startPage = SURAH_START_PAGES[sNum] || 1;
            const nextSurahStartPage = SURAH_START_PAGES[sNum + 1] || 605;
            const estimatedPage = Math.min(startPage + Math.floor((vNum - 1) / 10), nextSurahStartPage - 1);
            setMushafPage(Math.max(1, estimatedPage));
          }
        }
      }
    }
  }, [activeVerseKey, mushafMode, verses, mushafPageVerses, syncWithAudio]);

  // Key Down listeners for Left/Right arrows in Mushaf View
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!mushafMode) return;
      if (document.activeElement?.tagName === 'INPUT') return;
      
      if (e.key === 'ArrowLeft') {
        if (mushafPage < 604) {
          setMushafPage((p) => p + 1);
        }
      } else if (e.key === 'ArrowRight') {
        if (mushafPage > 1) {
          setMushafPage((p) => p - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [mushafMode, mushafPage]);

  const handlePrevMushafPage = () => {
    if (mushafPage > 1) {
      setMushafPage((p) => p - 1);
    }
  };

  const handleNextMushafPage = () => {
    if (mushafPage < 604) {
      setMushafPage((p) => p + 1);
    }
  };

  // Load Tafsir text for all verses on the current page
  useEffect(() => {
    if (verses.length === 0) return;

    let isMounted = true;
    const fetchTafsirsForPage = async () => {
      setIsTafsirsLoading(true);
      const loaded: Record<string, string> = { ...tafsirs };
      try {
        await Promise.all(
          verses.map(async (v) => {
            // Only fetch if not already loaded to avoid redundant calls, unless selectedTafsirId changed
            // Actually, fetch representing the selectedTafsirId
            try {
              const res = await fetchTafsir(selectedTafsirId, v.verse_key);
              if (res && isMounted) {
                loaded[v.verse_key] = res.text;
              }
            } catch (err) {
              console.warn(`Error loading tafsir for ${v.verse_key}:`, err);
            }
          })
        );
        if (isMounted) {
          setTafsirs(loaded);
        }
      } catch (e) {
        console.error('Failed loading page tafsirs:', e);
      } finally {
        if (isMounted) {
          setIsTafsirsLoading(false);
        }
      }
    };

    fetchTafsirsForPage();

    return () => {
      isMounted = false;
    };
  }, [verses, selectedTafsirId]);

  // Automatically navigate to the page containing the active verse during audio recitation
  useEffect(() => {
    if (activeVerseKey) {
      const [surahStr, verseStr] = activeVerseKey.split(':');
      const sId = Number(surahStr);
      const vId = Number(verseStr);
      if (sId === activeSurah && !isNaN(vId)) {
        const expectedPage = Math.ceil(vId / 15);
        if (expectedPage !== currentPage && expectedPage >= 1) {
          setCurrentPage(expectedPage);
        }
      }
    }
  }, [activeVerseKey, activeSurah, currentPage]);

  // Scroll active verse smoothly into view when highlighted in the viewport
  useEffect(() => {
    let active = true;
    if (!activeVerseKey || isLoading) return;

    // Helper to perform smooth centering scroll
    const scrollToVerse = () => {
      const element = document.getElementById(`verse-card-${activeVerseKey}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    };

    // 1. Attempt immediate scrolling for already rendered verses (e.g. within same page)
    scrollToVerse();

    // 2. Fallback timeout to guarantee scrolling after browser rendering/layout settles (extremely useful on page transitions)
    const timer = setTimeout(() => {
      if (active) {
        scrollToVerse();
      }
    }, 150);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [activeVerseKey, verses, isLoading]);

  const handleCopyVerse = (text: string, key: string) => {
    navigator.clipboard.writeText(`${text} (${key})`);
    setCopiedVerseKey(key);
    setTimeout(() => setCopiedVerseKey(''), 2000);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-36" ref={scrollContainerRef}>
      {/* Top Reading Preference Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#faf6ec] dark:bg-[#031c11] border-2 border-gold-400/30 dark:border-gold-500/20 shadow-sm">
        {/* Left Actions: Mushaf view mode toggler */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex items-center gap-1.5 py-1.5 text-[#113f28] dark:text-gold-300 font-bold">
            <span>✨</span>
            <span className="text-xs font-serif font-black">{isArabic ? 'تلاوة ومطالعة آيات الذكر الحكيم' : 'Noble Quran Recitation & Reading'}</span>
          </div>

          {/* Scanned Mushaf Page Toggler */}
          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gold-400/25 pt-3 sm:pt-0 sm:pl-4">
            <button
              onClick={() => {
                onToggleMushaf();
                if (!mushafMode) {
                  const sPage = SURAH_START_PAGES[activeSurah] || 1;
                  setMushafPage(sPage);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-black transition cursor-pointer select-none border border-gold-400/30 ${
                mushafMode
                  ? 'bg-gold-400 text-emerald-950 font-extrabold shadow-md'
                  : 'bg-white dark:bg-[#02140c] text-emerald-950 dark:text-gold-250 hover:bg-gold-400/10'
              }`}
              title={isArabic ? 'العرض بالصفحات المصورة (المصحف المصور)' : 'Toggle high quality printed Madinah Mushaf page view'}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{isArabic ? 'المصحف للقراءة' : 'Mushaf Page View'}</span>
            </button>
          </div>
        </div>

        {/* Info panel of the Surah */}
        {activeSurahDetail && (
          <div className="flex items-center justify-between sm:justify-end gap-3 text-xs font-serif text-emerald-950 dark:text-gold-300/80 text-right">
            <div>
              <span>{isArabic ? 'النزول: ' : 'Revealed: '}</span>
              <span className="capitalize font-bold text-stone-800 dark:text-gold-200">
                {isArabic && activeSurahDetail.revelation_place === 'makkah' ? 'مكة المكرمة' : 
                 isArabic && activeSurahDetail.revelation_place === 'madinah' ? 'المدينة المنورة' : 
                 activeSurahDetail.revelation_place}
              </span>
            </div>
            <div className="text-gold-400 font-bold select-none px-0.5">❈</div>
            <div>
              <span>{isArabic ? 'الآيات: ' : 'Ayahs: '}</span>
              <span className="font-bold text-stone-850 dark:text-gold-200">{activeSurahDetail.verses_count}</span>
            </div>
          </div>
        )}
      </div>

      {/* Surah Bismillah Banner if not Al-Tawbah (9) and if chapter requests bismillah_pre */}
      {!mushafMode && activeSurah !== 9 && activeSurahDetail?.bismillah_pre && currentPage === 1 && (
        <div className="text-center py-10 flex flex-col items-center justify-center relative" id="bismillah-banner">
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mb-4" />
          <p
             className="font-scheherazade text-4xl sm:text-5xl text-emerald-950 dark:text-gold-250 select-none leading-relaxed tracking-wider font-semibold"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </p>
          <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent mt-4" />
        </div>
      )}

      {mushafMode ? (
        <div className="flex flex-col gap-6 items-center w-full animate-fadeIn">
          {/* Mushaf Page Control Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-[#02140c] border border-gold-400/20 dark:border-gold-500/10 w-full shadow-sm">
            
            {/* Left page adjustment controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMushafPage}
                className="p-2.5 rounded-xl border border-gold-400/25 hover:border-gold-400 text-stone-700 dark:text-gold-200 bg-stone-50 dark:bg-emerald-950/20 hover:bg-gold-400/10 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center justify-center"
                disabled={mushafPage <= 1}
                title={isArabic ? 'الصفحة السابقة' : 'Previous page'}
              >
                <ChevronRight className="w-5 h-5 font-bold" />
                <span className="text-xs font-serif font-black pr-1">{isArabic ? 'السابقة' : 'Prev'}</span>
              </button>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-stone-50 dark:bg-[#031d10] border border-gold-400/10 rounded-lg">
                <span className="text-xs font-serif font-black text-stone-850 dark:text-gold-200">
                  {isArabic ? 'الصفحة' : 'Page'}
                </span>
                <input
                  type="number"
                  min={1}
                  max={604}
                  value={mushafPage}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= 1 && val <= 604) {
                      setMushafPage(val);
                    }
                  }}
                  className="w-12 text-center bg-white dark:bg-emerald-950/30 border border-gold-400/25 rounded p-0.5 text-xs text-stone-900 dark:text-gold-150 font-bold focus:ring-0 outline-none"
                />
                <span className="text-xs text-stone-400 dark:text-gold-500/40">/ 604</span>
              </div>

              <button
                onClick={handleNextMushafPage}
                className="p-2.5 rounded-xl border border-gold-400/25 hover:border-gold-400 text-stone-700 dark:text-gold-200 bg-stone-50 dark:bg-emerald-950/20 hover:bg-gold-400/10 transition cursor-pointer disabled:opacity-50 disabled:pointer-events-none active:scale-95 flex items-center justify-center"
                disabled={mushafPage >= 604}
                title={isArabic ? 'الصفحة التالية' : 'Next page'}
              >
                <span className="text-xs font-serif font-black pl-1">{isArabic ? 'التالية' : 'Next'}</span>
                <ChevronLeft className="w-5 h-5 font-bold" />
              </button>
            </div>

            {/* Middle: Juz & active Surah identifiers */}
            <div className="text-center font-serif py-1 md:py-0">
              <p className="text-sm font-black text-emerald-950 dark:text-gold-200">
                {isArabic ? `الجزء ${getJuzOfPage(mushafPage)}` : `Juz ${getJuzOfPage(mushafPage)}`}
              </p>
              <p className="text-xs text-stone-500 dark:text-stone-350 font-semibold mt-0.5">
                {isArabic ? `سورة ${activeSurahDetail?.name_arabic || ''}` : `Surah ${activeSurahDetail?.name_complex || ''}`}
              </p>
            </div>

            {/* Right: Night filter / zoom options */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3 justify-end">
              {/* Zoom controls */}
              <div className="flex items-center gap-1 bg-stone-50 dark:bg-emerald-950/20 border border-gold-400/15 rounded-xl px-1.5 py-0.5">
                <button
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 10, 50))}
                  className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-emerald-950/40 text-stone-500 dark:text-gold-300 transition"
                  title={isArabic ? 'تصغير' : 'Zoom Out'}
                >
                  <span className="text-xs font-black">-</span>
                </button>
                <span className="text-xs font-mono font-bold text-stone-500 dark:text-gold-400 px-1">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 10, 200))}
                  className="p-1.5 rounded-lg hover:bg-stone-200 dark:hover:bg-emerald-950/40 text-stone-500 dark:text-gold-300 transition"
                  title={isArabic ? 'تكبير' : 'Zoom In'}
                >
                  <span className="text-xs font-black">+</span>
                </button>
              </div>

              {/* Sync with Audio Toggle */}
              <button
                onClick={() => setSyncWithAudio(!syncWithAudio)}
                className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-serif font-black ${
                  syncWithAudio
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-extrabold shadow-sm'
                    : 'bg-stone-50 border-stone-200 dark:bg-emerald-950/30 dark:border-gold-400/10 text-stone-500 dark:text-gold-400 hover:bg-stone-100'
                }`}
                title={isArabic ? 'ربط صفحة المصحف تلقائياً مع تلاوة الآية الحالية' : 'Synchronize Mushaf page with currently reciting verse'}
              >
                <span>{isArabic ? (syncWithAudio ? 'ربط بالصوت 🔄' : 'مفصول عن الصوت 📴') : (syncWithAudio ? 'Sync Page 🔄' : 'Unsynced 📴')}</span>
              </button>

              {/* Night Mode Toggle for Scans */}
              <button
                onClick={() => setInvertMushaf(!invertMushaf)}
                className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-serif font-black ${
                  invertMushaf
                    ? 'bg-gold-400/25 text-gold-350 border-gold-400/40 font-extrabold'
                    : 'bg-stone-55 border-stone-200 dark:bg-emerald-950/30 dark:border-gold-400/10 text-stone-700 dark:text-gold-300'
                }`}
                title={isArabic ? 'تبديل وضع اللياقة البصرية / القراءة الليلية' : 'Toggle Night Read Visibility Filter'}
              >
                <span>{isArabic ? 'القراءة الليلية 🌙' : 'Night Read 🌙'}</span>
              </button>

              {/* Ultra Sharp Mode Toggle for Scans */}
              <button
                onClick={() => setExtraSharp(!extraSharp)}
                className={`p-2 rounded-xl border transition cursor-pointer flex items-center justify-center gap-1.5 text-xs font-serif font-black ${
                  extraSharp
                    ? 'bg-emerald-900 text-gold-300 border-gold-400/30 dark:bg-gold-500/15 dark:text-gold-250 font-extrabold'
                    : 'bg-stone-55 border-stone-200 dark:bg-emerald-950/30 dark:border-gold-400/10 text-stone-700 dark:text-gold-300'
                }`}
                title={isArabic ? 'تفعيل تصفية وتحسين تباين الكلمات لأقصى وضوح' : 'Toggle Ultra-Sharp Image Contrast Filter'}
              >
                <span>{isArabic ? 'أقصى وضوح ✨' : 'Ultra-Sharp Contrast ✨'}</span>
              </button>
            </div>

          </div>

          {/* Quick Page Slider */}
          <div className="w-full flex items-center gap-4 px-4 py-2.5 rounded-xl bg-amber-500/5 dark:bg-[#031d10]/20 border border-gold-400/10">
            <span className="text-xs font-bold text-stone-500 dark:text-gold-400 font-serif">1</span>
            <input
              type="range"
              min={1}
              max={604}
              value={mushafPage}
              onChange={(e) => setMushafPage(Number(e.target.value))}
              className="w-full accent-gold-500 bg-stone-200 dark:bg-emerald-950/50 rounded-lg appearance-none h-1.5 cursor-pointer"
            />
            <span className="text-xs font-bold text-stone-500 dark:text-gold-400 font-serif">604</span>
          </div>

          {/* Main Content Layout Block: Interactive Multi-pane Split Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start" id="mushaf-interactive-split-grid">
            
            {/* Scanned Mushaf Page Scan Image */}
            <div className="col-span-1 lg:col-span-7 xl:col-span-8 flex flex-col items-center justify-center relative w-full overflow-hidden rounded-2xl bg-[#EBE7D9] dark:bg-[#01140a] p-4 sm:p-7 border-4 border-gold-400/30 dark:border-gold-500/15 min-h-[500px] max-h-[1050px] shadow-lg group">
              
              {/* Desktop Quick Left/Right page-turn buttons */}
              <button
                onClick={handlePrevMushafPage}
                disabled={mushafPage <= 1}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 dark:bg-[#021c10]/95 hover:bg-gold-400 text-stone-900 shadow-xl rounded-full transition duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-95 flex items-center justify-center cursor-pointer border border-[#ddd3b0]/55 z-20"
                title={isArabic ? 'الصفحة السابقة' : 'Previous page'}
              >
                <ChevronLeft className="w-6 h-6 text-emerald-950" />
              </button>
 
              <button
                onClick={handleNextMushafPage}
                disabled={mushafPage >= 604}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/95 dark:bg-[#021c10]/95 hover:bg-gold-400 text-stone-900 shadow-xl rounded-full transition duration-300 opacity-0 group-hover:opacity-100 disabled:opacity-0 active:scale-95 flex items-center justify-center cursor-pointer border border-[#ddd3b0]/55 z-20"
                title={isArabic ? 'الصفحة التالية' : 'Next page'}
              >
                <ChevronRight className="w-6 h-6 text-emerald-950" />
              </button>
 
              {/* Centralized image itself with tiered fallback urls */}
              <div className="relative flex justify-center w-full transition-all duration-350" style={{ maxWidth: '100%' }}>
                <img
                  key={mushafPage}
                  src={
                    imageErrorCount === 0
                      ? `https://cdn.jsdelivr.net/gh/spaorland/quran_images@master/images/page${String(mushafPage).padStart(3, '0')}.png`
                      : imageErrorCount === 1
                        ? `https://raw.githubusercontent.com/spaorland/quran_images/master/images/page${String(mushafPage).padStart(3, '0')}.png`
                        : imageErrorCount === 2
                          ? `https://quran.ksu.edu.sa/png_big/${mushafPage}.png`
                          : `https://cdn.jsdelivr.net/gh/salman-b/quran-pages@master/png/${mushafPage}.png`
                  }
                  alt={`سورة ${activeSurahDetail?.name_arabic || ''} - صفحة ${mushafPage}`}
                  className="shadow-3xl rounded-xl border border-stone-250/20 dark:border-emerald-950/30 select-none duration-550 max-w-full"
                  referrerPolicy="no-referrer"
                  loading="eager"
                  onError={() => {
                    console.warn(`Failed loading image, trying fallback stage ${imageErrorCount + 1}`);
                    setImageErrorCount((prev) => prev + 1);
                  }}
                  style={{
                    filter: invertMushaf
                      ? `invert(1) hue-rotate(180deg) brightness(1.08) contrast(1.15) ${extraSharp ? 'contrast(1.12)' : ''}`
                      : `${extraSharp ? 'contrast(1.14) brightness(0.98) saturate(1.02)' : ''}`.trim() || 'none',
                    width: `${zoomLevel}%`,
                    maxWidth: '100%',
                    height: 'auto',
                    imageRendering: extraSharp ? 'crisp-edges' : 'auto',
                    WebkitImageRendering: extraSharp ? '-webkit-optimize-contrast' : 'auto',
                    transform: 'translateZ(0)',
                    backfaceVisibility: 'hidden',
                  }}
                />
              </div>
            </div>

            {/* Right side: Interactive Translation & Study Panel */}
            <div className="col-span-1 lg:col-span-5 xl:col-span-4 flex flex-col gap-4 p-5 rounded-2xl bg-[#faf6ec] dark:bg-[#03140c] border border-gold-400/20 dark:border-gold-500/10 shadow-sm max-h-[1050px] w-full">
              <div className="flex items-center justify-between pb-3 border-b border-gold-400/20">
                <span className="text-xs font-serif font-black text-[#0c2e1c] dark:text-gold-250">
                  {isArabic ? 'آيات الصفحة وتحليلها' : 'Ayahs on this Page'}
                </span>
                <span className="text-[10px] font-mono select-none px-2.5 py-0.5 rounded-full bg-gold-400/10 border border-gold-400/30 text-gold-500 font-bold">
                  {isArabic ? `${mushafPageVerses.length} آية` : `${mushafPageVerses.length} ayahs`}
                </span>
              </div>

              {isMushafPageLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3 text-gold-500 text-center w-full">
                  <span className="w-7 h-7 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
                  <p className="text-[11px] font-serif italic text-stone-500 dark:text-gold-300/80">
                    {isArabic ? 'تحميل ترجمات وتفاسير الآيات المرافقة...' : 'Loading companion translations...'}
                  </p>
                </div>
              ) : mushafPageVerses.length > 0 ? (
                <div className="flex flex-col gap-3.5 overflow-y-auto max-h-[850px] pr-1.5 scrollbar-thin scrollbar-thumb-gold-400/30 scrollbar-track-transparent">
                  {mushafPageVerses.map((v) => {
                    const isHighlighted = activeVerseKey === v.verse_key;
                    const isBookmarked = bookmarkedVerseKey === v.verse_key;

                    return (
                      <div
                        key={v.id}
                        onClick={() => onVersePlayClick(v.verse_key)}
                        className={`p-4 rounded-xl border transition-all duration-300 text-right cursor-pointer flex flex-col gap-3 relative group/card ${
                          isHighlighted
                            ? 'bg-[#f4efe0] dark:bg-emerald-950/30 border-gold-400 dark:border-gold-500 shadow-md ring-1 ring-gold-400/15'
                            : 'bg-white/90 dark:bg-[#02130b]/70 border-[#eae1cd] dark:border-emerald-900/10 hover:border-gold-400/30'
                        }`}
                      >
                        {/* Card metadata label & control toolbar */}
                        <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            {/* Play Button */}
                            <button
                              onClick={() => onVersePlayClick(v.verse_key)}
                              className={`p-1.5 rounded-lg transition-colors duration-200 cursor-pointer ${
                                isHighlighted 
                                  ? 'bg-gold-500 text-[#0c2e1c]' 
                                  : 'bg-stone-50 dark:bg-emerald-950/40 text-stone-500 hover:text-emerald-900 dark:hover:text-gold-300 hover:bg-gold-400/15'
                              }`}
                              title={isArabic ? 'تشغيل المرتل / إيقاف مؤقت' : 'Play Reciter / Pause'}
                            >
                              {isHighlighted && isAudioPlaying ? (
                                <Pause className="w-3.5 h-3.5" />
                              ) : (
                                <Play className="w-3.5 h-3.5" />
                              )}
                            </button>

                            {/* Bookmark Button */}
                            <button
                              onClick={() => onToggleBookmark(v.verse_key)}
                              className={`p-1.5 rounded-lg transition-colors duration-200 cursor-pointer ${
                                isBookmarked 
                                  ? 'bg-red-500/15 text-red-600' 
                                  : 'bg-stone-50 dark:bg-emerald-950/40 text-stone-550 hover:bg-gold-400/15'
                              }`}
                              title={isArabic ? 'حفظ للتلاوة لاحقاً' : 'Bookmark Ayah'}
                            >
                              <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                            </button>

                            {/* Study / Tafsir Sparkle button */}
                            <button
                              onClick={() => onVerseStudyClick(v.verse_key, v.text_uthmani || '')}
                              className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-850 dark:text-gold-350 hover:bg-emerald-500/15 hover:text-emerald-950 transition cursor-pointer"
                              title={isArabic ? 'البحث في كتب التفسير والتدبر كالتبر الشافي' : 'Open Tafsir details'}
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <span className="text-[10px] font-mono font-bold bg-[#eae1cd]/50 dark:bg-emerald-950/40 text-[#4c3c1b] dark:text-gold-300/80 px-2 py-0.5 rounded border border-[#ddd3b0]/30 select-all">
                            {v.verse_key}
                          </span>
                        </div>

                        {/* Uthmani text */}
                        <p className="font-scheherazade text-xl sm:text-2xl text-[#0c2e1c] dark:text-gold-250 select-all leading-relaxed font-bold tracking-wide">
                          {v.text_uthmani}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-stone-400 text-xs italic">
                  {isArabic ? 'لم تتوفر آيات للمطالعة حالياً.' : 'No verses available to view.'}
                </div>
              )}
            </div>

          </div>
 
          <div className="text-center font-serif text-xs text-stone-400 py-2">
            {isArabic 
              ? 'تلميح تلاوة: يمكنك استخدام أزرار الأسهم يميناً ويساراً في لوحة المفاتيح لتصفح الصفحات لمزيد من السهولة. انقر على أي آية من قائمة التفسير للاستماع أو قراءة شرحها.' 
              : 'Recitation Tip: You can use the left and right arrow keys on your keyboard to turn pages easily. Click any verse from the side list to recite or read Tafsir.'}
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-4 relative">
        {/* Subtle page change top loading line */}
        {isLoading && verses.length > 0 && (
          <div className="absolute -top-3 left-0 right-0 h-1 bg-gold-400/25 overflow-hidden rounded-full z-10">
            <div className="h-full bg-gold-400 w-full animate-pulse rounded-full" />
          </div>
        )}

        {isLoading && verses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-gold-500">
            <span className="w-8 h-8 rounded-full border-2 border-gold-400 border-t-transparent animate-spin" />
            <span className="text-xs font-serif italic">{isArabic ? 'جاري ترتيل وتنزيل الآيات الكريمة...' : 'Loading noble verses...'}</span>
          </div>
        ) : verses.length > 0 ? (
          <div className={`flex flex-col gap-4 transition-opacity duration-300 ${isLoading ? 'opacity-65 pointer-events-none' : 'opacity-100'}`}>
            {verses.map((verse) => {
              const isHighlighted = activeVerseKey === verse.verse_key;
              const isBookmarked = bookmarkedVerseKey === verse.verse_key;

              return (
                <div
                  id={`verse-card-${verse.verse_key}`}
                  key={verse.id}
                  ref={(el) => {
                    if (isHighlighted) {
                      activeVerseRef.current = el;
                    }
                  }}
                  onClick={() => onVersePlayClick(verse.verse_key)}
                className={`flex flex-col gap-4 p-5 md:p-6 transition-all border duration-300 cursor-pointer group/card ${
                  isHighlighted
                    ? 'bg-gradient-to-br from-emerald-50/90 via-[#f8fdfa] to-emerald-100/50 dark:from-[#052b1b] dark:via-[#021c11] dark:to-[#042517] border-2 border-emerald-500 dark:border-emerald-400 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.3)] scale-[1.015] ring-2 ring-emerald-500/30 dark:ring-emerald-400/30 relative overflow-hidden'
                    : 'bg-[#fdfcf9] dark:bg-[#031d13]/50 border border-gold-400/15 dark:border-gold-400/10 rounded-2xl shadow-sm hover:border-gold-400/40 hover:ring-2 hover:ring-gold-400/10 hover:shadow-md'
                }`}
                title={isArabic ? 'انقر للاستماع لهذه الآية الكريمة ومزامنة القارئ' : 'Click to recite this verse and sync the audio player'}
              >
                {/* Visual glowing border accent for active recitation */}
                {isHighlighted && (
                  <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
                )}

                {/* Verse top bar actions (Play, Copy, Bookmark, Tafsir) */}
                <div className="flex items-center justify-between border-b border-emerald-400/10 dark:border-emerald-500/10 pb-3 text-xs font-mono text-stone-500 dark:text-gold-400/70">
                  {/* Left: Metadata identifier */}
                  <div className="flex items-center gap-2 font-serif font-bold text-[#143d26] dark:text-gold-200">
                    <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                      isHighlighted 
                        ? 'bg-emerald-900 border-emerald-500/45 text-emerald-100 dark:bg-emerald-950 dark:border-emerald-400/40' 
                        : 'bg-stone-100 dark:bg-emerald-950/40 border-gold-400/10 text-stone-600 dark:text-gold-300'
                    }`}>
                      {verse.verse_key}
                    </span>
                    <span className="hidden sm:inline">
                      {isArabic ? `الجزء ${verse.juz_number}` : `Juz ${verse.juz_number}`}
                    </span>
                    {isHighlighted && isAudioPlaying ? (
                      <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 dark:border-emerald-400/30 text-[10px] font-sans font-black tracking-wider animate-pulse ml-1">
                        <span className="flex gap-0.5 items-end h-2 w-2.5">
                          <span className="w-0.5 bg-current animate-bounce h-[50%] duration-700" />
                          <span className="w-0.5 bg-current animate-bounce h-[100%] duration-1000 delay-150" />
                          <span className="w-0.5 bg-current animate-bounce h-[70%] duration-500 delay-300" />
                        </span>
                        {isArabic ? 'يتلى الآن' : 'RECITING NOW'}
                      </span>
                    ) : isHighlighted ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-bold flex items-center gap-1 bg-emerald-400/15 px-2 py-0.5 rounded-lg border border-emerald-400/30">
                        {isArabic ? 'محددة' : 'SELECTED'}
                      </span>
                    ) : (
                      <span className="opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 text-[10px] text-stone-400 dark:text-gold-400/50 font-sans font-black tracking-wide pl-2">
                        {isArabic ? '• اضغط لمزامنة التلاوة' : '• Click to sync playback'}
                      </span>
                    )}
                  </div>

                  {/* Right: Functional controls */}
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    {/* Inline Play Audio triggers player seek */}
                    <button
                      id={`btn-play-verse-${verse.verse_key}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onVersePlayClick(verse.verse_key);
                      }}
                      title={isArabic ? 'استماع للآية' : 'Recite this Ayah'}
                      className={`p-2 rounded-full transition-all border cursor-pointer ${
                        isHighlighted && isAudioPlaying
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm animate-pulse'
                          : 'bg-stone-50 dark:bg-emerald-900/10 border-transparent hover:border-emerald-500/20 text-emerald-600 hover:text-emerald-500 dark:text-gold-300 dark:hover:text-emerald-300'
                      }`}
                    >
                      {isHighlighted && isAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current ml-[1px]" />}
                    </button>

                    {/* Tafsir Study button */}
                    <button
                      id={`btn-study-verse-${verse.verse_key}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onVerseStudyClick(verse.verse_key, verse.text_uthmani || '');
                      }}
                      title={isArabic ? 'تفسير الآية ومطالعتها' : 'Read Tafsir & Study'}
                      className="p-2 rounded-full bg-stone-50 dark:bg-emerald-900/10 border border-transparent hover:border-gold-400/20 text-gold-600 hover:text-gold-500 dark:text-gold-300 dark:hover:text-gold-200 transition cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-bookmark-verse-${verse.verse_key}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark(verse.verse_key);
                      }}
                      title={isArabic ? 'حفظ العلامة هنا' : 'Bookmark this verse'}
                      className={`p-2 rounded-full transition border cursor-pointer ${
                        isBookmarked
                          ? 'text-gold-700 hover:text-gold-600 bg-gold-400/10 border-gold-400/30'
                          : 'bg-stone-50 dark:bg-emerald-900/10 border-transparent hover:border-gold-400/20 text-stone-400 hover:text-stone-600 dark:hover:text-gold-200'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" fill={isBookmarked ? 'currentColor' : 'none'} />
                    </button>

                    {/* Copy to clipboard */}
                    <button
                      id={`btn-copy-verse-${verse.verse_key}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopyVerse(verse.text_uthmani || '', verse.verse_key);
                      }}
                      title={isArabic ? 'نسخ الآية' : 'Copy Ayah text'}
                      className="p-2 rounded-full bg-stone-50 dark:bg-emerald-900/10 border border-transparent hover:border-gold-400/20 text-stone-400 hover:text-stone-600 dark:text-gold-350 dark:hover:text-gold-200 transition cursor-pointer"
                    >
                      {copiedVerseKey === verse.verse_key ? (
                        <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-gold-300" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Verse body - Uthmani Arabic Script with beautiful glowing manuscript highlights */}
                <div 
                  className={`text-right py-4 px-5 my-2 leading-relaxed transition-all duration-300 rounded-xl ${
                    isHighlighted 
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-r-4 border-emerald-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.08)]' 
                      : 'border-r-4 border-transparent'
                  }`} 
                  style={{ direction: 'rtl' }}
                >
                  <p
                    className={`font-scheherazade select-all max-w-full inline-block leading-[2.4] tracking-wide antialiased transition-all duration-300 ${
                      isHighlighted 
                        ? 'text-[#012412] dark:text-[#ccf2e2] font-bold drop-shadow-[0_1px_3px_rgba(16,185,129,0.15)]' 
                        : 'text-[#062416] dark:text-stone-100 font-medium'
                    }`}
                    style={{
                      fontSize: `${23 * textScale}px`,
                    }}
                  >
                    {verse.text_uthmani}{' '}
                    <span className={`inline-block font-serif font-black align-middle mx-1.5 text-lg leading-none select-none transition-colors duration-300 ${
                      isHighlighted ? 'text-emerald-600 dark:text-emerald-400 scale-[1.1]' : 'text-gold-500 dark:text-gold-400'
                    }`}>
                       ﴿{verse.verse_number}﴾
                     </span>
                  </p>
                </div>


                {/* Inline Tafsir Block (تفسير الآية) */}
                <div className="mt-4 border-t border-gold-400/10 pt-3 text-right" style={{ direction: 'rtl' }}>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-1.5 text-[#10331e] dark:text-gold-200">
                      <BookOpen className="w-3.5 h-3.5 text-gold-500" />
                      <span className="text-xs font-serif font-black">
                        {isArabic 
                          ? `تفسير الآية (${POPULAR_TAFSIRS.find(t => t.id === selectedTafsirId)?.name || 'الميسر'})` 
                          : `Ayah Tafsir (${POPULAR_TAFSIRS.find(t => t.id === selectedTafsirId)?.name || 'Al-Muyassar'})`}
                      </span>
                    </div>
                    {/* Change Tafsir triggers onVerseStudyClick to open selecting drawer */}
                    <button
                      onClick={() => onVerseStudyClick(verse.verse_key, verse.text_uthmani || '')}
                      className="text-[11px] text-emerald-800 hover:text-emerald-700 dark:text-gold-400 dark:hover:text-gold-300 font-serif font-bold hover:underline transition flex items-center gap-1 cursor-pointer"
                    >
                      {isArabic ? 'تغيير كتاب التفسير ⚙️' : 'Choose Interpretation ⚙️'}
                    </button>
                  </div>

                  {/* Tafsir text body */}
                  {isTafsirsLoading && !tafsirs[verse.verse_key] ? (
                    <div className="animate-pulse bg-stone-50 dark:bg-emerald-950/10 rounded-2xl p-4 border border-gold-400/10 h-16 flex items-center justify-center">
                      <span className="text-xs text-stone-400 italic">
                        {isArabic ? 'جاري تحميل التفسير المعتمد للآية...' : 'Loading chosen tafsir...'}
                      </span>
                    </div>
                  ) : tafsirs[verse.verse_key] ? (
                    <div className="bg-[#FAF7F0] dark:bg-[#031d10]/45 p-4 rounded-2xl border-r-4 border-gold-400/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.02)] border border-l-gold-400/5 duration-300">
                      <p 
                        className="font-sans leading-[1.8] text-stone-800 dark:text-[#ccf2e2]/95 text-right font-medium text-xs sm:text-sm"
                        style={{ fontSize: `${13.5 * textScale}px` }}
                        dangerouslySetInnerHTML={{ __html: tafsirs[verse.verse_key] }}
                      />
                    </div>
                  ) : (
                    <div className="bg-[#FAF7F0] dark:bg-emerald-950/20 p-3.5 rounded-2xl border-2 border-dashed border-gold-400/10 text-center text-xs text-stone-500 dark:text-gold-400/60 italic">
                      {isArabic ? 'التفسير غير متوفر في كتاب التفسير المحدد حالياً لهذه الآية.' : 'Interpretation data unavailable.'}
                    </div>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-stone-500 dark:text-gold-400/60 bg-white dark:bg-[#032014]/40 border border-neutral-100 dark:border-emerald-900/20 rounded-2xl">
            <HelpCircle className="w-12 h-12 stroke-[1] mb-2 text-gold-400" />
            <span>{isArabic ? 'لم نتمكن من جلب الآيات الكريمة حالياً.' : 'Verses could not be fetched.'}</span>
          </div>
        )}
      </div>

      {/* Pagination Delivery Interface */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm font-mono text-xs">
          <button
            id="pagination-prev"
            disabled={currentPage === 1 || isLoading}
            onClick={handlePrevPage}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-neutral-600 dark:text-neutral-400"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>{isArabic ? 'السابق' : 'Prev'}</span>
          </button>

          <span className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 rounded-lg font-semibold">
            {currentPage} / {totalPages}
          </span>

          <button
            id="pagination-next"
            disabled={currentPage === totalPages || isLoading}
            onClick={handleNextPage}
            className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-1 text-neutral-600 dark:text-neutral-400"
          >
            <span>{isArabic ? 'التالي' : 'Next'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
        </>
      )}
    </div>
  );
}
