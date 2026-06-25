/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sun, Moon, Search, Sliders, Type, BookOpen, Bookmark, Volume2, Sparkles, Clock, CircleDot } from 'lucide-react';
import { Chapter } from '../types';

interface HeaderProps {
  activeLanguage: 'en' | 'ar';
  onLanguageChange: (lang: 'en' | 'ar') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  textScale: number;
  onTextScaleChange: (scale: number) => void;
  onOpenSearch: () => void;
  // Surah navigation shortcuts
  chaptersList: Chapter[];
  selectedSurahId: number;
  onSurahSelect: (id: number) => void;
  // Bookmarked verse indicator
  bookmarkedVerseKey: string;
  onNavigateToBookmark: () => void;
  onOpenDua?: () => void;
  mushafMode: boolean;
  onToggleMushaf: () => void;
  onOpenPrayerTimes?: () => void;
  onOpenTasbih?: () => void;
}

export default function Header({
  activeLanguage,
  onLanguageChange,
  theme,
  onToggleTheme,
  textScale,
  onTextScaleChange,
  onOpenSearch,
  chaptersList,
  selectedSurahId,
  onSurahSelect,
  bookmarkedVerseKey,
  onNavigateToBookmark,
  onOpenDua,
  mushafMode,
  onToggleMushaf,
  onOpenPrayerTimes,
  onOpenTasbih,
}: HeaderProps) {
  const isArabic = activeLanguage === 'ar';

  const decreaseScale = () => {
    onTextScaleChange(Math.max(textScale - 0.15, 0.85));
  };

  const increaseScale = () => {
    onTextScaleChange(Math.min(textScale + 0.15, 1.6));
  };

  const activeSurahName = chaptersList.find((c) => c.id === selectedSurahId)?.name_complex || 'Quran';

  return (
    <header
      className="sticky top-0 left-0 right-0 h-16 md:h-24 bg-[#fdfbf5] dark:bg-[#021810] border-b-2 border-gold-400/35 dark:border-gold-400/25 z-30 flex items-center justify-between px-4 md:px-8 transition-colors duration-300 shadow-sm islamic-glow"
      id="root-header-navigation"
    >
      {/* Brand Launcher Icon & Title */}
      <div className="flex items-center gap-3" id="brand-logo-container">
        <div className="w-11 h-11 rounded-full border-2 border-gold-400 bg-emerald-900 flex items-center justify-center text-gold-300 font-cinzel font-black text-xl shadow-md relative shrink-0">
          <div className="absolute inset-0.5 rounded-full border border-gold-200/30" />
          <span className="relative -top-[1px]">ق</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xs sm:text-sm font-cinzel font-bold text-emerald-900 dark:text-gold-300 tracking-wider sm:tracking-widest leading-none mb-0.5">
            {isArabic ? 'بوابة القرآن الكريم' : 'AL-QURAN GLOBAL'}
          </h1>
          <p className="text-[9px] sm:text-[10px] text-amber-600 dark:text-gold-400/80 font-serif italic leading-none hidden sm:block">
            {isArabic ? 'تلاوات، ترجمة، تفسير ومطالعة الذكر الحكيم' : 'Noble Recitations & Commentary'}
          </p>
        </div>
      </div>

      {/* Centerpiece: Chapter Switcher Carousel or Dropdown Selector */}
      <div className="flex items-center gap-2 max-w-[170px] sm:max-w-xs md:max-w-sm flex-1 mx-2 sm:mx-4" id="surah-switcher-header">
        <div className="relative w-full">
          <select
            id="header-surah-dropdown"
            value={selectedSurahId}
            onChange={(e) => onSurahSelect(Number(e.target.value))}
            className="w-full bg-stone-50 dark:bg-emerald-950/40 text-stone-900 dark:text-gold-100 text-xs font-semibold rounded-xl p-2 md:p-3 pb-2 md:pb-2.5 border-2 border-gold-400/30 dark:border-gold-500/25 focus:border-gold-400 hover:border-gold-400 outline-none cursor-pointer transition truncate pl-8 rtl:pr-8"
          >
            {chaptersList.map((ch) => (
              <option key={ch.id} value={ch.id} className="dark:bg-[#021810] dark:text-gold-200 bg-white text-stone-900 text-xs">
                {ch.id}. {isArabic ? ch.name_arabic : `${ch.name_arabic} (${ch.name_complex})`}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 left-3 rtl:right-3 flex items-center pointer-events-none text-gold-500 text-[10px]">
            ▼
          </div>
        </div>
      </div>

      {/* Righthand actions toolbar */}
      <div className="flex items-center gap-1 sm:gap-2" id="header-toolbar">
        {/* Bookmark Quick Jump link */}
        {bookmarkedVerseKey && (
          <button
            id="header-bookmark-jump-btn"
            onClick={onNavigateToBookmark}
            title={isArabic ? `الانتقال إلى العلامة المحفوظة (${bookmarkedVerseKey})` : `Jump to your bookmarked verse (${bookmarkedVerseKey})`}
            className="p-1.5 md:p-2 text-gold-600 hover:text-gold-700 bg-gold-400/5 hover:bg-gold-400/10 dark:bg-gold-400/10 dark:hover:bg-gold-400/15 border border-gold-400/30 rounded-xl transition flex items-center gap-1.5"
          >
            <Bookmark className="w-4 h-4 fill-current animate-pulse text-gold-500" />
            <span className="text-[10px] md:text-xs font-mono font-bold hidden sm:inline">{bookmarkedVerseKey}</span>
          </button>
        )}

        {/* Supplications / Dua Section trigger */}
        <button
          id="header-dua-drawer-trigger"
          onClick={onOpenDua}
          title={isArabic ? 'الأدعية القرآنية الكريمة' : 'Quranic Duas'}
          className="p-1.5 md:p-2 text-[#113f28] dark:text-gold-300 hover:text-gold-500 bg-amber-500/5 hover:bg-gold-400/10 dark:bg-emerald-950/40 dark:hover:bg-gold-500/10 border border-gold-400/25 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <span className="text-[10px] md:text-xs font-bold leading-none hidden sm:inline">
            {isArabic ? 'الأدعية' : 'Duas'}
          </span>
        </button>

        {/* Daily Prayer Times Trigger */}
        <button
          id="header-prayer-times-trigger"
          onClick={onOpenPrayerTimes}
          title={isArabic ? 'مواقيت الصلاة اليومية' : 'Daily Prayer Times'}
          className="p-1.5 md:p-2 text-[#113f28] dark:text-gold-300 hover:text-gold-500 bg-emerald-500/5 hover:bg-gold-400/10 dark:bg-emerald-950/40 dark:hover:bg-gold-500/10 border border-gold-400/25 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <Clock className="w-4 h-4 text-emerald-600 dark:text-gold-400" />
          <span className="text-[10px] md:text-xs font-bold leading-none hidden sm:inline font-serif">
            {isArabic ? 'المواقيت' : 'Prayers'}
          </span>
        </button>

        {/* Smart Tasbih Trigger */}
        <button
          id="header-tasbih-trigger"
          onClick={onOpenTasbih}
          title={isArabic ? 'السبحة الإلكترونية' : 'Smart Tasbih'}
          className="p-1.5 md:p-2 text-[#113f28] dark:text-gold-300 hover:text-gold-500 bg-amber-500/5 hover:bg-gold-400/10 dark:bg-emerald-950/40 dark:hover:bg-gold-500/10 border border-gold-400/25 rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0"
        >
          <CircleDot className="w-4 h-4 text-amber-600 dark:text-gold-400 transition-transform duration-300 hover:rotate-90" />
          <span className="text-[10px] md:text-xs font-bold leading-none hidden sm:inline font-serif">
            {isArabic ? 'السبحة' : 'Tasbih'}
          </span>
        </button>

        {/* Mushaf للقراءة Button right next to the Duas button */}
        <button
          id="header-mushaf-mode-trigger"
          onClick={onToggleMushaf}
          title={isArabic ? 'المصحف للقراءة' : 'Mushaf Reading Mode'}
          className={`p-1.5 md:p-2 border rounded-xl transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
            mushafMode
              ? 'bg-gold-400 text-emerald-950 border-gold-450 font-extrabold shadow-sm'
              : 'text-[#113f28] dark:text-gold-250 hover:text-[#b4923e] border-gold-400/25 dark:border-gold-500/10 hover:bg-gold-400/10'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span className="text-[10px] md:text-xs font-bold leading-none hidden sm:inline font-serif">
            {isArabic ? 'المصحف للقراءة' : 'Mushaf Read'}
          </span>
        </button>

        {/* Global Search trigger styled as search input pill */}
        <button
          id="header-search-modal-trigger"
          onClick={onOpenSearch}
          title={isArabic ? 'البحث في القرآن' : 'Search Quran (v4)'}
          className="flex items-center gap-2 bg-white dark:bg-[#042015] border-2 border-gold-400/20 focus-within:border-gold-400 rounded-full px-3.5 py-2 w-32 sm:w-40 md:w-56 hover:border-gold-400/50 transition-all cursor-pointer text-left overflow-hidden shrink-0 shadow-sm"
        >
          <span className="text-xs shrink-0 text-gold-500">🔍</span>
          <span className="text-xs text-stone-500 dark:text-stone-400 truncate select-none">
            {isArabic ? 'ابحث في الآيات...' : 'Search Revelation...'}
          </span>
        </button>

        {/* Text Scaling utility switcher */}
        <div className="flex items-center bg-stone-100/60 dark:bg-[#032014] border-2 border-gold-450/15 rounded-xl px-1.5 py-0.5" id="header-scale-controls">
          <button
            id="header-scale-decrease"
            onClick={decreaseScale}
            title={isArabic ? 'تصغير الخط' : 'Decrease text size'}
            className="p-1 hover:bg-stone-200 dark:hover:bg-emerald-900 rounded-lg text-stone-500 dark:text-gold-400/80 cursor-pointer"
          >
            <span className="text-xs font-black font-mono">A-</span>
          </button>
          <span className="hidden sm:inline text-[9px] font-bold font-mono px-1.5 text-stone-600 dark:text-gold-300 select-none">
            {Math.round(textScale * 100)}%
          </span>
          <button
            id="header-scale-increase"
            onClick={increaseScale}
            title={isArabic ? 'تكبير الخط' : 'Increase text size'}
            className="p-1 hover:bg-stone-200 dark:hover:bg-emerald-900 rounded-lg text-stone-500 dark:text-gold-400/80 cursor-pointer"
          >
            <span className="text-xs font-black font-mono">A+</span>
          </button>
        </div>

        {/* Theme mode manual select */}
        <button
          id="header-theme-toggle"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Light Theme' : 'Dark Theme'}
          className="p-2 text-stone-500 hover:text-gold-500 dark:text-stone-400 dark:hover:text-gold-400 hover:bg-stone-100 dark:hover:bg-emerald-950 rounded-xl transition cursor-pointer border border-transparent hover:border-gold-400/20"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 sm:w-5 h-5" /> : <Moon className="w-4 h-4 sm:w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
