/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { fetchChapters } from './services/quranApi';
import { Chapter } from './types';
import HeaderComponent from './components/Header';
import AudioPlayer from './components/AudioPlayer';
import SurahReading from './components/SurahReading';
import TafsirDrawer from './components/TafsirDrawer';
import SearchDialog from './components/SearchDialog';
import { BookOpen, MapPin, Layers, Sparkles, HelpCircle, AlertCircle, RefreshCw, History } from 'lucide-react';

export const JUZ_SURAH_MAP: Record<number, number[]> = {
  1: [1, 2],
  2: [2],
  3: [2, 3],
  4: [3, 4],
  5: [4],
  6: [4, 5],
  7: [5, 6],
  8: [6, 7],
  9: [7, 8],
  10: [8, 9],
  11: [9, 10, 11],
  12: [11, 12],
  13: [12, 13, 14],
  14: [15, 16],
  15: [17, 18],
  16: [18, 19, 20],
  17: [21, 22],
  18: [23, 24, 25],
  19: [25, 26, 27],
  20: [27, 28, 29],
  21: [29, 30, 31, 32, 33],
  22: [33, 34, 35, 36],
  23: [36, 37, 38, 39],
  24: [39, 40, 41],
  25: [41, 42, 43, 44, 45],
  26: [46, 47, 48, 49, 50, 51],
  27: [51, 52, 53, 54, 55, 56, 57],
  28: [58, 59, 60, 61, 62, 63, 64, 65, 66],
  29: [67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77],
  30: [
    78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93,
    94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107,
    108, 109, 110, 111, 112, 113, 114
  ],
};

export function getJuzsForSurah(surahId: number): number[] {
  const juzs: number[] = [];
  for (const juzNumStr in JUZ_SURAH_MAP) {
    const juzNum = Number(juzNumStr);
    if (JUZ_SURAH_MAP[juzNum].includes(surahId)) {
      juzs.push(juzNum);
    }
  }
  return juzs;
}

export default function App() {
  // Global App States
  const [chaptersList, setChaptersList] = useState<Chapter[]>([]);
  const [sidebarTab, setSidebarTab] = useState<'all' | 'juz'>('all');
  const [selectedJuz, setSelectedJuz] = useState<number>(1);
  const [recentlyRead, setRecentlyRead] = useState<number[]>(() => {
    try {
      const cachedRecentlyRead = localStorage.getItem('quran_recently_read');
      if (cachedRecentlyRead) {
        const parsed = JSON.parse(cachedRecentlyRead);
        if (Array.isArray(parsed)) {
          return parsed.map(Number).filter((id) => !isNaN(id) && id >= 1 && id <= 114);
        }
      }
    } catch {}
    return [];
  });
  const [activeSurah, setActiveSurah] = useState<number>(1);
  const [activeLanguage, setActiveLanguage] = useState<'en' | 'ar'>('ar');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [textScale, setTextScale] = useState<number>(1.0);
  const [reciterId, setReciterId] = useState<number>(7);
  const [translationId, setTranslationId] = useState<number>(131);
  const [bookmarkedVerseKey, setBookmarkedVerseKey] = useState<string>('');

  // Audio Playback Synchronization states
  const [activeVerseKey, setActiveVerseKey] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [seekToVerseKey, setSeekToVerseKey] = useState<string>('');

  // Drawers and Overlays
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [tafsirDrawerOpen, setTafsirDrawerOpen] = useState<boolean>(false);
  const [tafsirVerseKey, setTafsirVerseKey] = useState<string>('');
  const [tafsirVerseText, setTafsirVerseText] = useState<string>('');

  // App Initializers & Fallbacks
  const [isChapterLoading, setIsChapterLoading] = useState<boolean>(true);

  const isArabic = activeLanguage === 'ar';

  // 1. Session Restoration (LocalStorage Cache)
  useEffect(() => {
    try {
      const cachedLang = localStorage.getItem('quran_active_language');
      if (cachedLang !== 'ar') {
        localStorage.setItem('quran_active_language', 'ar');
      }
      setActiveLanguage('ar');

      const cachedSurah = localStorage.getItem('quran_last_surah');
      if (cachedSurah) {
        setActiveSurah(Number(cachedSurah));
      }

      const cachedReciter = localStorage.getItem('quran_preferred_reciter');
      if (cachedReciter) {
        setReciterId(Number(cachedReciter));
      }

      const cachedTranslation = localStorage.getItem('quran_chosen_translation');
      if (cachedTranslation) {
        setTranslationId(Number(cachedTranslation));
      }

      const cachedScale = localStorage.getItem('quran_text_scale');
      if (cachedScale) {
        setTextScale(Number(cachedScale));
      }

      const cachedTheme = localStorage.getItem('quran_theme');
      if (cachedTheme === 'dark' || cachedTheme === 'light') {
        setTheme(cachedTheme);
      } else {
        // Match system configurations
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }

      const cachedBookmark = localStorage.getItem('quran_bookmark_key');
      if (cachedBookmark) {
        setBookmarkedVerseKey(cachedBookmark);
      }
    } catch (e) {
      console.warn('LocalStorage retrieval prevented or empty:', e);
    }
  }, []);

  // 2. Persist Cache updates
  useEffect(() => {
    try {
      localStorage.setItem('quran_active_language', activeLanguage);
    } catch {}
  }, [activeLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_last_surah', String(activeSurah));
    } catch {}
  }, [activeSurah]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_preferred_reciter', String(reciterId));
    } catch {}
  }, [reciterId]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_chosen_translation', String(translationId));
    } catch {}
  }, [translationId]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_text_scale', String(textScale));
    } catch {}
  }, [textScale]);

  useEffect(() => {
    try {
      localStorage.setItem('quran_theme', theme);
    } catch {}
  }, [theme]);

  useEffect(() => {
    try {
      if (bookmarkedVerseKey) {
        localStorage.setItem('quran_bookmark_key', bookmarkedVerseKey);
      } else {
        localStorage.removeItem('quran_bookmark_key');
      }
    } catch {}
  }, [bookmarkedVerseKey]);

  // Update Recently Read list when activeSurah changes
  useEffect(() => {
    if (activeSurah) {
      setRecentlyRead((prev) => {
        const next = [activeSurah, ...prev.filter((id) => id !== activeSurah)].slice(0, 5);
        try {
          localStorage.setItem('quran_recently_read', JSON.stringify(next));
        } catch (e) {
          console.warn('Could not save recently read surahs to localStorage:', e);
        }
        return next;
      });
    }
  }, [activeSurah]);

  // Automatically update selectedJuz when activeSurah changes so that the highlighted surah is visible in Juz mode
  useEffect(() => {
    if (activeSurah) {
      const surahJuzs = getJuzsForSurah(activeSurah);
      if (surahJuzs.length > 0 && !surahJuzs.includes(selectedJuz)) {
        setSelectedJuz(surahJuzs[0]);
      }
    }
  }, [activeSurah, selectedJuz]);

  // 3. Render HTML structure directions and theme classifications
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // 4. Fetch the full Chapters indexing list on change of language
  useEffect(() => {
    let isMounted = true;
    const loadChapters = async () => {
      setIsChapterLoading(true);
      try {
        const list = await fetchChapters(activeLanguage === 'en');
        if (isMounted) {
          setChaptersList(list);
        }
      } catch (err) {
        console.error('Error fetching chapters list:', err);
      } finally {
        if (isMounted) {
          setIsChapterLoading(false);
        }
      }
    };

    loadChapters();
    return () => {
      isMounted = false;
    };
  }, [activeLanguage]);

  // App handlers
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleBookmark = (key: string) => {
    setBookmarkedVerseKey((prev) => (prev === key ? '' : key));
  };

  const handleNavigateToBookmark = () => {
    if (bookmarkedVerseKey) {
      const parts = bookmarkedVerseKey.split(':');
      if (parts.length === 2 && !isNaN(Number(parts[0]))) {
        const surahId = Number(parts[0]);
        setActiveSurah(surahId);
        // Trigger seek and audio play once loaded
        setSeekToVerseKey(bookmarkedVerseKey);
      }
    }
  };

  // Click handler from verses to study Tafsir
  const handleVerseStudyClick = (verseKey: string, text: string) => {
    setTafsirVerseKey(verseKey);
    setTafsirVerseText(text);
    setTafsirDrawerOpen(true);
  };

  // Click handler from search dialog results or bookmark jumps
  const handleSelectSearchResult = (verseKey: string) => {
     const parts = verseKey.split(':');
     if (parts.length === 2) {
       const surahId = Number(parts[0]);
       setActiveSurah(surahId);
       setSeekToVerseKey(verseKey);
     }
  };

  // Handle auto-advance surah completely finished
  const handleSurahPlaybackComplete = () => {
     if (activeSurah < 114) {
       // Load next surah auto
       setActiveSurah((prev) => prev + 1);
       setIsPlaying(true);
     } else {
       setIsPlaying(false);
     }
  };

  const handlePrevSurah = () => {
    if (activeSurah > 1) {
      setActiveSurah((prev) => prev - 1);
    }
  };

  const handleNextSurah = () => {
    if (activeSurah < 114) {
      setActiveSurah((prev) => prev + 1);
    }
  };

  const activeSurahDetail = chaptersList.find((ch) => ch.id === activeSurah) || null;
  const activeSurahName = activeSurahDetail
    ? isArabic
      ? activeSurahDetail.name_arabic
      : activeSurahDetail.name_complex
    : 'Surah';

  const filteredChapters =
    sidebarTab === 'all'
      ? chaptersList
      : chaptersList.filter((ch) => JUZ_SURAH_MAP[selectedJuz]?.includes(ch.id));

  return (
    <div
      dir={isArabic ? 'rtl' : 'ltr'}
      className="min-h-screen bg-[#faf8f2] dark:bg-[#02100a] text-stone-900 dark:text-gold-100 flex flex-col font-sans transition-colors duration-300 antialiased bg-pattern-islamic selection:bg-gold-450/30 selection:text-emerald-950"
    >
      {/* 1. Dynamic Top Banner/Header */}
      <HeaderComponent
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        textScale={textScale}
        onTextScaleChange={setTextScale}
        onOpenSearch={() => setIsSearchOpen(true)}
        chaptersList={chaptersList}
        selectedSurahId={activeSurah}
        onSurahSelect={setActiveSurah}
        bookmarkedVerseKey={bookmarkedVerseKey}
        onNavigateToBookmark={handleNavigateToBookmark}
      />

      {/* 2. Primary layout dashboard */}
      <div className="flex-1 flex max-w-[1700px] mx-auto w-full relative">
        {/* Left column (Desktop only structural Surah sidebar list index) */}
        {!isChapterLoading && chaptersList.length > 0 && (
          <aside
            id="sidebar-chapter-list"
            className="hidden lg:flex flex-col w-80 shrink-0 border-r-2 border-gold-400/25 dark:border-gold-500/20 h-[calc(100vh-6rem)] overflow-y-auto sticky top-24 bg-[#faf7ef] dark:bg-[#02140c] px-4 py-6"
          >
            {/* Recently Read Section */}
            {recentlyRead.length > 0 && (
              <div className="mb-6 shrink-0" id="sidebar-recently-read-section">
                <div className="flex items-center gap-2 mb-3 px-2 pb-2 border-b border-gold-400/10">
                  <History className="w-4 h-4 text-emerald-800 dark:text-gold-400" />
                  <h3 className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#143d26] dark:text-gold-300">
                    {isArabic ? 'المقروءة مؤخراً' : 'RECENTLY READ'}
                  </h3>
                </div>
                <div className="flex flex-col gap-1.5">
                  {recentlyRead.map((id) => {
                    const ch = chaptersList.find((c) => c.id === id);
                    if (!ch) return null;
                    const isChActive = ch.id === activeSurah;
                    return (
                      <button
                        id={`sidebar-btn-recent-${ch.id}`}
                        key={`recent-${ch.id}`}
                        onClick={() => {
                          setActiveSurah(ch.id);
                          setIsPlaying(false);
                          setActiveVerseKey('');
                        }}
                        className={`w-full text-right p-2.5 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold transition cursor-pointer border ${
                          isChActive
                            ? 'bg-emerald-950 text-gold-300 border-gold-400 shadow-sm'
                            : 'bg-white/40 dark:bg-emerald-900/5 text-[#0c2e1c] dark:text-gold-200 border-transparent hover:border-gold-400/10 dark:hover:border-gold-550/10 hover:bg-[#faf5eb] dark:hover:bg-emerald-900/20'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md text-[9px] font-bold font-mono flex items-center justify-center border ${
                              isChActive
                                ? 'bg-gold-400 text-emerald-950 border-gold-400'
                                : 'bg-stone-50 dark:bg-emerald-950/60 text-[#143d26] dark:text-gold-300 border-gold-400/10'
                            }`}
                          >
                            {ch.id}
                          </span>
                          <div className="text-left font-sans">
                            <p className={`text-xs leading-none ${isChActive ? 'text-gold-300 font-bold' : 'text-stone-900 dark:text-stone-105 font-bold'}`}>
                              {ch.name_complex}
                            </p>
                          </div>
                        </div>
                        
                        <span
                          className={`font-semibold text-xs pr-1 ${isChActive ? 'text-gold-300 font-bold' : 'text-emerald-800 dark:text-gold-300'}`}
                          style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                        >
                          {ch.name_arabic}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex bg-[#faf5eb]/70 dark:bg-emerald-950/40 p-1 rounded-2xl border-2 border-gold-400/15 mb-4" id="sidebar-tabs">
              <button
                id="tab-all-surahs"
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'all'
                    ? 'bg-emerald-950 dark:bg-gold-500/15 text-gold-300 dark:text-gold-300 shadow-sm border border-gold-400/20'
                    : 'text-[#143d26] dark:text-gold-300/70 hover:text-emerald-900 dark:hover:text-gold-200'
                }`}
                onClick={() => setSidebarTab('all')}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isArabic ? 'السور' : 'Surahs'}</span>
              </button>
              <button
                id="tab-juz-surahs"
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'juz'
                    ? 'bg-emerald-950 dark:bg-gold-500/15 text-gold-300 dark:text-gold-300 shadow-sm border border-gold-400/20'
                    : 'text-[#143d26] dark:text-gold-300/70 hover:text-emerald-900 dark:hover:text-gold-200'
                }`}
                onClick={() => setSidebarTab('juz')}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{isArabic ? 'الأجزاء' : 'Juzs'}</span>
              </button>
            </div>

            {sidebarTab === 'juz' && (
              <div className="mb-4 animate-fade-in" id="juz-selector-container">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#143d26]/70 dark:text-gold-400/70 mb-1.5 px-1">
                  {isArabic ? 'اختر الجزء الشريف' : 'SELECT HOLY JUZ'}
                </label>
                <select
                  id="juz-dropdown"
                  value={selectedJuz}
                  onChange={(e) => setSelectedJuz(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gold-400/35 bg-white dark:bg-emerald-950 text-[#143d26] dark:text-gold-300 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:border-gold-400 cursor-pointer shadow-sm animate-fade-in"
                >
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
                    const surahCount = JUZ_SURAH_MAP[juzNum]?.length || 0;
                    return (
                      <option key={juzNum} value={juzNum} className="font-sans">
                        {isArabic
                          ? `الجزء ${juzNum} (${surahCount} سور)`
                          : `Juz ${juzNum} (${surahCount} surahs)`}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            <div className="flex items-center gap-2 mb-5 px-2 pb-2 border-b border-gold-400/10">
              <BookOpen className="w-4 h-4 text-emerald-800 dark:text-gold-400" />
              <h3 className="font-cinzel font-bold text-xs uppercase tracking-wider text-[#143d26] dark:text-gold-300">
                {sidebarTab === 'all'
                  ? (isArabic ? 'فهرس السور الكريمة' : 'SURAH INDEX')
                  : (isArabic ? `سور الجزء ${selectedJuz}` : `SURAS OF JUZ ${selectedJuz}`)}
              </h3>
            </div>

            <div className="flex flex-col gap-2" id="sidebar-chapters-ul">
              {filteredChapters.map((ch) => {
                const isChActive = ch.id === activeSurah;
                return (
                  <button
                    id={`sidebar-btn-surah-${ch.id}`}
                    key={ch.id}
                    onClick={() => {
                      setActiveSurah(ch.id);
                      setIsPlaying(false);
                      setActiveVerseKey('');
                    }}
                    className={`w-full text-right p-3 rounded-xl flex items-center justify-between gap-3 text-xs font-semibold transition cursor-pointer border-2 ${
                      isChActive
                        ? 'bg-emerald-950 text-gold-300 border-gold-400 shadow-md scale-[1.015]'
                        : 'bg-white/50 dark:bg-emerald-900/10 text-[#0c2e1c] dark:text-gold-200 border-transparent hover:border-gold-400/20 dark:hover:border-gold-550/20 hover:bg-[#faf5eb] dark:hover:bg-emerald-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-6 h-6 rounded-lg text-[10px] font-bold font-mono flex items-center justify-center border ${
                          isChActive
                            ? 'bg-gold-400 text-emerald-950 border-gold-400'
                            : 'bg-stone-50 dark:bg-emerald-950/60 text-[#143d26] dark:text-gold-300 border-gold-400/10'
                        }`}
                      >
                        {ch.id}
                      </span>
                      <div className="text-left font-sans">
                        <p className={isChActive ? 'text-gold-300 font-bold' : 'text-stone-900 dark:text-stone-105 font-bold'}>
                          {ch.name_complex}
                        </p>
                        <p className={`text-[10px] ${isChActive ? 'text-gold-300/80' : 'text-stone-450 dark:text-gold-400/75 font-mono'}`}>
                          {isArabic ? `${ch.verses_count} آية` : `${ch.verses_count} verses`}
                        </p>
                      </div>
                    </div>
                    
                    <span
                      className={`font-semibold text-sm pr-1 ${isChActive ? 'text-gold-300 font-bold lg:text-base' : 'text-emerald-800 dark:text-gold-300'}`}
                      style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                    >
                      {ch.name_arabic}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>
        )}

        {/* Center column (Main presentation platform) */}
        <main className="flex-1 px-4 sm:px-6 md:px-10 py-6 md:py-8 overflow-hidden min-w-0" id="main-presentation-platform">
          {/* Header metadata label */}
          {activeSurahDetail && (
            <div className="mb-8 p-7 rounded-3xl bg-gradient-to-r from-emerald-950 to-[#0c331f] dark:from-[#021810] dark:to-[#093521] border-2 border-gold-400 shadow-lg text-white flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden islamic-glow" id="active-surah-jumbotron">
              {/* Absolutes and Ornaments */}
              <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-[0.035] text-gold-300">
                <BookOpen className="w-80 h-80" />
              </div>
              <div className="absolute inset-1.5 border border-gold-400/20 rounded-[22px] pointer-events-none" />

              <div className="relative z-10 p-1">
                <span className="text-[10px] uppercase font-bold font-sans tracking-widest text-gold-400 mb-1.5 block">
                  {isArabic ? 'السورة الكريمة المعروضة' : 'ACTIVE NOBLE SURAH'}
                </span>
                <h2 className="text-2xl md:text-3.5xl font-serif font-black tracking-wide text-gold-250 flex items-center gap-3">
                  {activeSurahName}{' '}
                  <span className="text-xs text-gold-400/80 font-mono font-bold bg-white/5 px-2 py-0.5 rounded-lg border border-gold-400/10">
                    {isArabic ? `${activeSurahDetail.verses_count} آية` : `${activeSurahDetail.verses_count} ayahs`}
                  </span>
                </h2>
                <p className="text-xs text-stone-200/90 mt-2 max-w-xl leading-relaxed italic font-serif">
                  {isArabic
                    ? `سورة ${activeSurahDetail.name_arabic}، نزلت في ${activeSurahDetail.revelation_place === 'makkah' ? 'مكة المكرمة' : 'المدينة المنورة'} وترتيبها في المصحف الشريف ${activeSurahDetail.revelation_order}`
                    : `Surah ${activeSurahDetail.name_complex} is a ${activeSurahDetail.revelation_place} Revelation, chronicles as revelation order index #${activeSurahDetail.revelation_order} inside the Holy Quran.`}
                </p>
              </div>

              {/* Quick bookmarks badge */}
              {bookmarkedVerseKey && bookmarkedVerseKey.startsWith(`${activeSurah}:`) && (
                <div className="relative z-10 self-start md:self-center px-4 py-2.5 rounded-2xl bg-gold-400/10 border border-gold-400/40 text-gold-300 text-xs flex items-center gap-2 shadow-sm font-semibold">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-400 animate-pulse" />
                  <span>
                    {isArabic 
                      ? `علامتك المحفوظة: آية ${bookmarkedVerseKey.split(':')[1]}` 
                      : `Your bookmark is on Ayah ${bookmarkedVerseKey.split(':')[1]}`}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Reading grid delivering verses */}
          <SurahReading
            activeSurah={activeSurah}
            activeSurahDetail={activeSurahDetail}
            activeLanguage={activeLanguage}
            activeVerseKey={activeVerseKey}
            onVersePlayClick={(vKey) => {
              // Toggle play or seek
              if (activeVerseKey === vKey && isPlaying) {
                setIsPlaying(false);
              } else {
                setActiveVerseKey(vKey);
                setSeekToVerseKey(vKey);
                setIsPlaying(true);
              }
            }}
            onVerseStudyClick={handleVerseStudyClick}
            isAudioPlaying={isPlaying}
            textScale={textScale}
            translationId={translationId}
            onTranslationChange={setTranslationId}
            bookmarkedVerseKey={bookmarkedVerseKey}
            onToggleBookmark={handleToggleBookmark}
          />
        </main>
      </div>

      {/* 3. Global Audio Player Synchronizer (Stays docked bottom-bar) */}
      <AudioPlayer
        activeSurah={activeSurah}
        activeSurahName={activeSurahName}
        activeLanguage={activeLanguage}
        reciterId={reciterId}
        onReciterChange={setReciterId}
        activeVerseKey={activeVerseKey}
        onActiveVerseChange={setActiveVerseKey}
        onSurahComplete={handleSurahPlaybackComplete}
        onPrevSurah={handlePrevSurah}
        onNextSurah={handleNextSurah}
        isPlaying={isPlaying}
        onPlayPauseToggle={setIsPlaying}
        seekToVerseKey={seekToVerseKey}
        onClearSeekRequest={() => setSeekToVerseKey('')}
        versesCount={activeSurahDetail?.verses_count || 0}
      />

      {/* 4. Overlay Modals & studying Drawers */}
      <SearchDialog
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        activeLanguage={activeLanguage}
        onSelectResult={handleSelectSearchResult}
      />

      <TafsirDrawer
        isOpen={tafsirDrawerOpen}
        onClose={() => setTafsirDrawerOpen(false)}
        verseKey={tafsirVerseKey}
        surahName={activeSurahName}
        verseText={tafsirVerseText}
        isArabic={isArabic}
      />
    </div>
  );
}
