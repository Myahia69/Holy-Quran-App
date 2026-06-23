import React, { useState, useEffect } from 'react';
import { Search, Star, BookOpen, ChevronLeft, ChevronRight, X, Heart, Sparkles, Filter } from 'lucide-react';
import { DUAS_LIST, DuaItem } from '../data/duasData';
import { motion, AnimatePresence } from 'motion/react';

interface DuaSidebarSectionProps {
  isArabic: boolean;
  onNavigateToVerse: (surahId: number, verseNumber: number) => void;
  activeSurah: number;
}

export default function DuaSidebarSection({ isArabic, onNavigateToVerse, activeSurah }: DuaSidebarSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedDua, setSelectedDua] = useState<DuaItem | null>(null);

  // Load favorites from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quran_bookmarked_duas');
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to load bookmarked duas:', e);
    }
  }, []);

  // Save favorites to local storage
  const toggleFavorite = (duaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    if (favorites.includes(duaId)) {
      updated = favorites.filter((id) => id !== duaId);
    } else {
      updated = [...favorites, duaId];
    }
    setFavorites(updated);
    try {
      localStorage.setItem('quran_bookmarked_duas', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save bookmarked duas:', err);
    }
  };

  // Get unique categories for filters
  const categories = ['all', ...Array.from(new Set(DUAS_LIST.map((d) => isArabic ? d.category_ar : d.category_en)))];

  // Filter the supplications list
  const filteredDuas = DUAS_LIST.filter((dua) => {
    // Search query filter
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      dua.arabic.includes(searchQuery) ||
      dua.translation_en.toLowerCase().includes(searchLower) ||
      dua.translation_ar.includes(searchQuery) ||
      dua.transliteration.toLowerCase().includes(searchLower) ||
      dua.source_en.toLowerCase().includes(searchLower) ||
      dua.source_ar.includes(searchQuery);

    // Category filter
    const matchesCategory =
      selectedCategory === 'all' ||
      (isArabic ? dua.category_ar === selectedCategory : dua.category_en === selectedCategory);

    // Favorites filter
    const matchesFavorite = !showFavoritesOnly || favorites.includes(dua.id);

    return matchesSearch && matchesCategory && matchesFavorite;
  });

  const handleDuaClick = (dua: DuaItem) => {
    setSelectedDua(dua);
  };

  const handleGoToVerse = (dua: DuaItem) => {
    onNavigateToVerse(dua.surah_id, dua.verse_number);
  };

  return (
    <div className="flex flex-col h-full text-stone-900 dark:text-gold-100 font-sans" id="dua-sidebar-root">
      {/* Search Bar */}
      <div className="relative mb-3 shrink-0" id="dua-search-container">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isArabic ? 'ابحث في الأدعية القرآنية...' : 'Search Quranic supplications...'}
          className="w-full pl-3 pr-10 py-2.5 rounded-xl border border-gold-400/25 bg-white dark:bg-emerald-950/20 text-xs text-stone-900 dark:text-gold-200 outline-none focus:ring-2 focus:ring-emerald-800 focus:border-gold-400 transition"
        />
        <Search className={`absolute ${isArabic ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400`} />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className={`absolute ${isArabic ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600`}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Favorites Toggle */}
      <div className="flex items-center justify-between mb-3 bg-white/40 dark:bg-emerald-950/10 p-2 rounded-xl border border-gold-400/10 shrink-0 select-none">
        <div className="flex items-center gap-1.5">
          <Star className={`w-3.5 h-3.5 ${favorites.length > 0 ? 'text-amber-500 fill-amber-500' : 'text-stone-400'}`} />
          <span className="text-[11px] font-bold">
            {isArabic ? `المفضلة (${favorites.length})` : `Favorites (${favorites.length})`}
          </span>
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold cursor-pointer transition border ${
            showFavoritesOnly
              ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400'
              : 'bg-stone-50 border-stone-200 dark:bg-emerald-950/40 dark:border-gold-400/10 text-stone-500 dark:text-gold-400'
          }`}
        >
          {isArabic ? 'عرض المفضلة فقط' : 'Favorites Only'}
        </button>
      </div>

      {/* Category Horizontal scroll */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 shrink-0 scrollbar-thin scrollbar-thumb-gold-400/10" id="dua-categories-scroller">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          let label = cat;
          if (cat === 'all') {
            label = isArabic ? 'الكل 🤲' : 'All 🤲';
          }
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-serif font-black border transition cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950 border-gold-400 text-gold-300 dark:bg-gold-500/15'
                  : 'bg-stone-50 dark:bg-emerald-950/20 border-gold-400/10 text-[#0c2e1c] dark:text-gold-300'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Duas List or Expanded Detail View */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-2.5 min-h-0" id="dua-items-list">
        <AnimatePresence mode="wait">
          {selectedDua ? (
            /* EXPANDED VIEW */
            <motion.div
              key="expanded-dua"
              initial={{ opacity: 0, x: isArabic ? 12 : -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isArabic ? -12 : 12 }}
              className="p-4 rounded-2xl bg-amber-500/5 dark:bg-emerald-950/30 border-2 border-gold-400/25 space-y-4 text-right shadow-sm relative overflow-hidden"
            >
              {/* Corner Design/Aura */}
              <div className="absolute top-0 left-0 w-24 h-24 bg-gold-400/5 rounded-full blur-xl pointer-events-none" />

              {/* Back Button */}
              <div className="flex items-center justify-between border-b border-gold-400/15 pb-2.5">
                <button
                  onClick={() => setSelectedDua(null)}
                  className="flex items-center gap-1 text-[11px] font-serif font-black text-emerald-800 dark:text-gold-400 hover:text-gold-500 cursor-pointer"
                >
                  {isArabic ? (
                    <>
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>رجوع للقائمة</span>
                    </>
                  ) : (
                    <>
                      <ChevronLeft className="w-3.5 h-3.5" />
                      <span>Back to list</span>
                    </>
                  )}
                </button>

                {/* Subtitle / Reference */}
                <span className="text-[10px] font-bold text-stone-500 dark:text-gold-450 bg-stone-100 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-gold-400/10">
                  {isArabic ? selectedDua.source_ar : selectedDua.source_en}
                </span>
              </div>

              {/* Dua Text (Arabic) */}
              <div className="space-y-2">
                <p 
                  className="text-stone-900 dark:text-gold-200 text-lg leading-relaxed font-bold font-serif text-center py-2 px-1 text-right border-r-4 border-gold-400/60 bg-white/20 dark:bg-[#021810]"
                  style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                >
                  {selectedDua.arabic}
                </p>
              </div>

              {/* Transliteration */}
              <div className="text-left space-y-1">
                <p className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-wider">Pronunciation (Transliteration)</p>
                <p className="text-[11px] font-sans font-medium text-stone-600 dark:text-stone-300 italic leading-relaxed text-left bg-stone-100/50 dark:bg-[#032014]/50 p-2.5 rounded-xl border border-stone-200/40 dark:border-transparent">
                  "{selectedDua.transliteration}"
                </p>
              </div>

              {/* English Meaning */}
              <div className="text-left space-y-1">
                <p className="text-[10px] font-sans font-bold text-stone-400 uppercase tracking-wider">English Meaning</p>
                <p className="text-[11px] font-sans text-stone-700 dark:text-stone-200 leading-relaxed text-left bg-stone-100/50 dark:bg-[#032014]/50 p-2.5 rounded-xl border border-stone-200/40 dark:border-transparent">
                  {selectedDua.translation_en}
                </p>
              </div>

              {/* Arabic Meaning / Summary */}
              <div className="space-y-1 text-right">
                <p className="text-[10px] font-sans font-bold text-stone-400 dark:text-gold-500/70 uppercase tracking-wide">الفوائد والوقوف والمعنى</p>
                <p className="text-xs font-serif font-black text-stone-800 dark:text-gold-150 leading-relaxed bg-[#f6efe0]/50 dark:bg-gold-500/5 p-2.5 rounded-xl border border-gold-400/5">
                  {selectedDua.translation_ar}
                </p>
              </div>

              {/* Dual Action Toolbar */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gold-400/10">
                {/* Heart Toggle */}
                <button
                  onClick={(e) => toggleFavorite(selectedDua.id, e)}
                  style={{ cursor: 'pointer' }}
                  className={`py-2 px-3 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition active:scale-95 ${
                    favorites.includes(selectedDua.id)
                      ? 'bg-rose-500/10 border-rose-450 text-rose-600 dark:text-rose-400 font-extrabold'
                      : 'bg-white dark:bg-emerald-950/20 border-stone-200 dark:border-gold-450/10 text-stone-600 dark:text-stone-300 hover:border-rose-450/40'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${favorites.includes(selectedDua.id) ? 'fill-rose-500 text-rose-500 font-extrabold' : ''}`} />
                  <span>{isArabic ? 'المفضلة' : 'Favorite'}</span>
                </button>

                {/* View in Quran */}
                <button
                  onClick={() => handleGoToVerse(selectedDua)}
                  disabled={false}
                  style={{ cursor: 'pointer' }}
                  className="py-2 px-3 bg-emerald-950 dark:bg-gold-500/10 border border-gold-400/30 text-gold-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 hover:bg-emerald-900 dark:hover:bg-gold-500/20 active:scale-95 transition"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isArabic ? 'عرض بالمصحف' : 'View in Quran'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* COLLAPSED / ALL ITEMS LIST */
            <motion.div
              key="list-duas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-2"
            >
              {filteredDuas.length === 0 ? (
                <div className="text-center py-10 font-serif">
                  <p className="text-xs text-stone-400">{isArabic ? 'لا توجد أدعية مطابقة لخيارات البحث.' : 'No matched supplications found.'}</p>
                </div>
              ) : (
                filteredDuas.map((dua) => {
                  const isBookmarked = favorites.includes(dua.id);
                  return (
                    <div
                      key={dua.id}
                      onClick={() => handleDuaClick(dua)}
                      className="p-3.5 rounded-xl border border-gold-400/15 hover:border-gold-400/50 bg-[#faf6ed]/50 hover:bg-[#faf4e5] dark:bg-emerald-950/15 dark:hover:bg-emerald-950/25 cursor-pointer flex flex-col gap-2 transition duration-200 relative group overflow-hidden"
                    >
                      {/* Interactive subtle gold left indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-gold-400/40 transition" />

                      {/* Header with name and Bookmark */}
                      <div className="flex items-center justify-between pointer-events-none">
                        <span className="text-[9px] font-sans font-bold text-stone-400 dark:text-gold-450 uppercase tracking-widest bg-stone-100 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-stone-200/40 dark:border-transparent">
                          {isArabic ? dua.category_ar : dua.category_en}
                        </span>

                        <div className="flex items-center gap-1">
                          <span className="text-[9px] font-bold text-stone-500 dark:text-gold-450 font-serif">
                            {isArabic ? dua.source_ar : dua.source_en}
                          </span>
                          <button
                            onClick={(e) => toggleFavorite(dua.id, e)}
                            className="p-1 rounded hover:bg-stone-200/55 dark:hover:bg-emerald-950/40 pointer-events-auto transition text-stone-400 hover:text-rose-400 cursor-pointer"
                            title={isArabic ? 'إضافة إلى المفضلة' : 'Add to Favorites'}
                          >
                            <Heart className={`w-3.5 h-3.5 ${isBookmarked ? 'text-rose-500 fill-rose-500' : 'text-stone-300 dark:text-emerald-900/60'}`} />
                          </button>
                        </div>
                      </div>

                      {/* Supplication text preview in lovely layout */}
                      <p
                        className="text-stone-800 dark:text-gold-200 text-sm font-semibold text-right leading-relaxed truncate-2-lines pointer-events-none"
                        style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                      >
                        {dua.arabic}
                      </p>

                      {/* Translation preview */}
                      <p className="text-[10px] font-sans text-stone-500 dark:text-stone-300 leading-snug line-clamp-1 truncate text-left pointer-events-none">
                        {isArabic ? dua.translation_ar : dua.translation_en}
                      </p>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
