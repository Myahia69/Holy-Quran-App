/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, BookOpen, Loader2 } from 'lucide-react';
import { fetchTafsir, POPULAR_TAFSIRS } from '../services/quranApi';
import { Tafsir } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface TafsirDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  verseKey: string;
  surahName: string;
  verseText?: string;
  isArabic: boolean;
  selectedTafsirId: number;
  onTafsirChange: (id: number) => void;
}

export default function TafsirDrawer({
  isOpen,
  onClose,
  verseKey,
  surahName,
  verseText,
  isArabic,
  selectedTafsirId,
  onTafsirChange,
}: TafsirDrawerProps) {
  const [tafsirData, setTafsirData] = useState<Tafsir | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(16); // in pixels

  const isTafsirRtl =
    tafsirData?.language?.toLowerCase() === 'arabic' ||
    tafsirData?.language?.toLowerCase() === 'ar' ||
    POPULAR_TAFSIRS.find(t => t.id === selectedTafsirId)?.language === 'ar';

  const handleTafsirChange = (id: number) => {
    onTafsirChange(id);
  };

  // Fetch Tafsir on verse or Tafsir model change
  useEffect(() => {
    if (!isOpen || !verseKey) return;

    let isMounted = true;
    const loadTafsir = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTafsir(selectedTafsirId, verseKey);
        if (isMounted) {
          setTafsirData(data);
        }
      } catch (err) {
        console.error('Error loading Tafsir:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadTafsir();

    return () => {
      isMounted = false;
    };
  }, [isOpen, verseKey, selectedTafsirId]);

  const handleZoomIn = () => {
    setFontSize((prev) => Math.min(prev + 2, 32));
  };

  const handleZoomOut = () => {
    setFontSize((prev) => Math.max(prev - 2, 12));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 z-40 transition-opacity"
            id="tafsir-backdrop"
          />

          {/* Drawer Panel */}
          <motion.div
            id="tafsir-drawer-container"
            initial={{ x: isArabic ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isArabic ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed top-0 bottom-0 ${
              isArabic ? 'left-0' : 'right-0'
            } w-full max-w-lg md:max-w-xl bg-[#fdfcf8] dark:bg-[#02130c] border-l-2 border-r-2 border-gold-400/20 dark:border-gold-500/15 shadow-[0_0_50px_rgba(0,0,0,0.5)] z-50 flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b-2 border-gold-400/25 bg-[#faf7ef] dark:bg-[#031d13]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-800 dark:text-gold-400 animate-pulse" />
                <div>
                  <h3 className="font-cinzel font-bold text-sm md:text-base text-emerald-950 dark:text-gold-200">
                    {isArabic ? 'التفسير والمطالعة الميسّرة' : 'TAFSIR & STUDY GUIDE'}
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-gold-400/70 font-mono mt-0.5">
                    {surahName} • {isArabic ? `آية ${verseKey}` : `Verse ${verseKey}`}
                  </p>
                </div>
              </div>
              <button
                id="tafsir-close-btn"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gold-400/15 text-stone-400 hover:text-gold-500 dark:hover:text-gold-300 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#f6f2e6] dark:bg-[#021810] border-b border-gold-400/15 text-sm">
              {/* Tafsir Source Selector */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-emerald-900 dark:text-gold-300 font-bold font-serif">
                  {isArabic ? 'مكتبة التفسير:' : 'Tafsir Source:'}
                </label>
                <select
                  id="tafsir-selector"
                  value={selectedTafsirId}
                  onChange={(e) => handleTafsirChange(Number(e.target.value))}
                  className="bg-[#fdfcf8] dark:bg-[#031d13] border-2 border-gold-400/20 dark:border-gold-500/15 text-stone-900 dark:text-gold-200 text-xs rounded-lg p-1 px-2 focus:border-gold-400 focus:ring-0 outline-none font-semibold cursor-pointer"
                >
                  {POPULAR_TAFSIRS.map((t) => (
                    <option key={t.id} value={t.id} className="dark:bg-[#02130c]">
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Text Zoom Control */}
              <div className="flex items-center gap-1 bg-[#fdfcf8] dark:bg-[#031c11] px-2 py-1 rounded-lg border-2 border-gold-400/20 dark:border-gold-400/10">
                <button
                  id="tafsir-zoom-out"
                  onClick={handleZoomOut}
                  title="Zoom Out"
                  className="p-1 hover:bg-gold-400/10 rounded text-stone-600 dark:text-gold-300 cursor-pointer"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-xs px-2 font-mono text-stone-700 dark:text-gold-200 font-bold">
                  {fontSize}px
                </span>
                <button
                  id="tafsir-zoom-in"
                  onClick={handleZoomIn}
                  title="Zoom In"
                  className="p-1 hover:bg-gold-400/10 rounded text-stone-600 dark:text-gold-300 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6" id="tafsir-drawer-content">
              {/* Verse Text Quote */}
              {verseText && (
                <div className="mb-6 p-5 border-l-4 border-gold-400 rounded-2xl bg-gradient-to-r from-emerald-50/70 to-[#faf5eb] dark:from-emerald-950/25 dark:to-emerald-900/10 border-y-transparent border-r-transparent shadow-sm">
                  <span className="text-xs text-emerald-950 dark:text-gold-300 font-bold block mb-2 font-serif">
                    {isArabic ? 'الآية الكريمة المحددة:' : 'Noble Ayah Quote:'}
                  </span>
                  <p
                    className="font-scheherazade text-right leading-loose text-emerald-950 dark:text-gold-150 font-bold"
                    style={{ fontSize: `${fontSize + 3}px` }}
                  >
                    {verseText}
                  </p>
                </div>
              )}

              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-gold-500">
                  <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
                  <span className="text-xs font-serif italic">
                    {isArabic ? 'يجري جلب وتحضير التفسير المختار...' : 'Retrieving Tafsir data...'}
                  </span>
                </div>
              ) : tafsirData ? (
                <div className="prose dark:prose-invert max-w-none">
                  <div
                    className={`leading-[2] text-stone-850 dark:text-stone-150 ${
                      isTafsirRtl ? 'text-right font-scheherazade font-medium' : 'text-left font-sans font-normal'
                    }`}
                    style={{
                      fontSize: `${isTafsirRtl ? fontSize + 4 : fontSize}px`,
                      direction: isTafsirRtl ? 'rtl' : 'ltr',
                    }}
                    dangerouslySetInnerHTML={{ __html: tafsirData.text }}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-stone-400 text-sm">
                  <BookOpen className="w-12 h-12 stroke-[1] mb-2 text-gold-400" />
                  <span>
                    {isArabic
                      ? 'عذراً، لم نتمكن من العثور على التفسير لهذه الآية.'
                      : 'Sorry, Tafsir data could not be fetched for this verse.'}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-gold-400/10 bg-[#faf7ef] dark:bg-[#031d13]/55 flex justify-end text-[10px] text-stone-400 dark:text-gold-400/40 font-mono">
              <span>Noble Quran Portal via Quran.com API v4</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
