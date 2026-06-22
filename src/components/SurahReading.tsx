/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState } from 'react';
import { BookOpen, Play, Pause, Bookmark, Copy, Check, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { Verse, Chapter } from '../types';
import { fetchChapterVerses, POPULAR_TRANSLATIONS } from '../services/quranApi';

interface SurahReadingProps {
  activeSurah: number;
  activeSurahDetail: Chapter | null;
  activeLanguage: 'en' | 'ar';
  activeVerseKey: string;
  onVersePlayClick: (verseKey: string) => void;
  onVerseStudyClick: (verseKey: string, text: string) => void;
  isAudioPlaying: boolean;
  textScale: number; // e.g. 1, 1.25, 1.5
  translationId: number;
  onTranslationChange: (id: number) => void;
  // Bookmark state
  bookmarkedVerseKey: string;
  onToggleBookmark: (key: string) => void;
}

export default function SurahReading({
  activeSurah,
  activeSurahDetail,
  activeLanguage,
  activeVerseKey,
  onVersePlayClick,
  onVerseStudyClick,
  isAudioPlaying,
  textScale,
  translationId,
  onTranslationChange,
  bookmarkedVerseKey,
  onToggleBookmark,
}: SurahReadingProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedVerseKey, setCopiedVerseKey] = useState<string>('');

  const [wbwEnabled, setWbwEnabled] = useState<boolean>(false);
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
  }, [activeSurah]);

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
        {/* Left Actions: Translation & Word-by-Word toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Translation select */}
          <div className="flex items-center gap-3">
            <label htmlFor="translation-select" className="text-xs text-emerald-900 dark:text-gold-300 font-bold whitespace-nowrap">
              {isArabic ? 'الترجمة المعروضة:' : 'English translation:'}
            </label>
            <select
              id="translation-select"
              value={translationId}
              onChange={(e) => {
                onTranslationChange(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white dark:bg-[#02140c] border-2 border-gold-400/25 dark:border-gold-500/15 text-stone-900 dark:text-gold-100 text-xs rounded-xl p-2 focus:border-gold-400 focus:ring-0 outline-none hover:bg-stone-50 transition font-semibold min-w-[200px]"
            >
              {POPULAR_TRANSLATIONS.map((trans) => (
                <option key={trans.id} value={trans.id} className="dark:bg-[#021c10] text-xs">
                  {trans.name}
                </option>
              ))}
            </select>
          </div>

          {/* Word-by-Word translation mode switch toggle */}
          <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-gold-400/25 pt-3 sm:pt-0 sm:pl-4">
            <label htmlFor="wbw-switch" className="text-xs text-emerald-900 dark:text-gold-300 font-bold whitespace-nowrap">
              {isArabic ? 'عرض كلمة بكلمة:' : 'Word-by-Word Mode:'}
            </label>
            <button
              id="wbw-switch"
              onClick={() => setWbwEnabled(!wbwEnabled)}
              title={isArabic ? 'تفعيل وضع نطق وترجمة كل كلمة بمفردها' : 'Toggle interactive word translations and pronunciation audios'}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
                wbwEnabled ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-stone-300 dark:bg-emerald-950/80 border border-gold-400/15'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  wbwEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="text-[11px] font-bold text-stone-600 dark:text-gold-200">
              {wbwEnabled ? (isArabic ? 'مفعّل' : 'ON') : (isArabic ? 'ملغى' : 'OFF')}
            </span>
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
      {activeSurah !== 9 && activeSurahDetail?.bismillah_pre && currentPage === 1 && (
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

      {/* Verses Delivery Cards */}
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

                {/* Verse body - Uthmani Arabic Script with beautiful glowing manuscript highlights or Word-By-Word mode */}
                <div 
                  className={`text-right py-4 px-5 my-2 leading-relaxed transition-all duration-300 rounded-xl ${
                    isHighlighted 
                      ? 'bg-emerald-500/5 dark:bg-emerald-500/10 border-r-4 border-emerald-500 shadow-[inset_0_0_15px_rgba(16,185,129,0.08)]' 
                      : 'border-r-4 border-transparent'
                  }`} 
                  style={{ direction: 'rtl' }}
                >
                  {wbwEnabled ? (
                    <div className="flex flex-row-reverse flex-wrap gap-x-3 gap-y-4 items-center justify-start leading-[2.6]">
                      {verse.words && verse.words.length > 0 ? (
                        verse.words.map((word) => {
                          const isWordActive = activeWordId === word.id;
                          return (
                            <div
                              key={word.id}
                              onClick={(e) => {
                                e.stopPropagation(); // Avoid playing the entire verse when clicking a single word
                                if (word.audio_url) {
                                  playWordAudio(word.audio_url, word.id);
                                }
                              }}
                              className={`flex flex-col items-center px-2 py-1.5 rounded-xl border transition-all duration-300 cursor-help select-none ${
                                isWordActive
                                  ? 'bg-emerald-500/15 border-emerald-400 dark:border-emerald-500 scale-[1.08] shadow-sm ring-1 ring-emerald-500'
                                  : 'border-transparent hover:bg-gold-400/10 hover:border-gold-400/25 dark:hover:bg-emerald-900/10'
                              }`}
                              title={isArabic 
                                ? `اضغط للاستماع لنطق كلمة: "${word.text_uthmani}" (${word.transliteration?.text || ''})` 
                                : `Click to hear audio pronunciation for: "${word.text_uthmani}" (${word.transliteration?.text || ''})`
                              }
                            >
                              {/* Arabic Word Script */}
                              <span
                                className={`font-scheherazade leading-none tracking-wide text-center antialiased transition-colors duration-300 ${
                                  isWordActive
                                    ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                                    : isHighlighted
                                    ? 'text-emerald-950 dark:text-[#ccf2e2] font-semibold'
                                    : 'text-[#062416] dark:text-stone-100 font-medium'
                                }`}
                                style={{ fontSize: `${24 * textScale}px` }}
                              >
                                {word.text_uthmani}
                              </span>
                              
                              {/* Transliteration (Phonetics) */}
                              {word.transliteration && (
                                <span className="text-[10px] font-sans text-stone-500 dark:text-gold-300/80 mt-1.5 font-semibold leading-none tracking-normal">
                                  {word.transliteration.text}
                                </span>
                              )}
                              
                              {/* Meaning translation */}
                              {word.translation && (
                                <span className="text-[10px] font-sans text-emerald-800 dark:text-emerald-400 font-bold mt-1 leading-none max-w-[95px] truncate text-center">
                                  {word.translation.text}
                                </span>
                              )}
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-xs italic text-stone-400">
                          {isArabic ? 'جاري تحميل تفصيل الكلمات...' : 'Loading word translations...'}
                        </span>
                      )}

                      {/* End of verse ayah marker */}
                      <span className={`inline-block font-serif font-black align-middle mx-1.5 text-lg leading-none select-none transition-colors duration-300 ${
                        isHighlighted ? 'text-emerald-600 dark:text-emerald-400 scale-[1.1]' : 'text-gold-500 dark:text-gold-400'
                      }`}>
                        ﴿{verse.verse_number}﴾
                      </span>
                    </div>
                  ) : (
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
                  )}
                </div>

                {/* Translation display text */}
                {!isArabic && (
                  <div className={`text-left mt-2 border-t border-gold-400/5 pt-2 px-1 transition-all duration-300 ${
                    isHighlighted ? 'bg-emerald-500/[0.03] rounded-lg p-2 border-l-2 border-emerald-500/40' : ''
                  }`}>
                    {verse.translations && verse.translations.length > 0 ? (
                      <p
                        className={`leading-relaxed font-sans transition-colors duration-300 ${
                          isHighlighted 
                            ? 'text-stone-900 dark:text-[#d1fae5] font-bold' 
                            : 'text-stone-700 dark:text-gold-100/90 font-medium'
                        }`}
                        style={{ fontSize: `${14.5 * textScale}px` }}
                        dangerouslySetInnerHTML={{ __html: verse.translations[0].text }}
                      />
                    ) : (
                      <p className="text-xs italic text-stone-400">
                        {isArabic ? 'الترجمة غير متوفرة.' : 'Translation data unavailable.'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-16 text-stone-400 bg-white dark:bg-neutral-905 border border-neutral-100 dark:border-neutral-800 rounded-2xl">
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
    </div>
  );
}
