import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, ArrowLeft, ArrowRight, Eye, RefreshCw, X } from "lucide-react";
import { DAILY_VERSES, DailyVerse } from "../data/dailyVerses";

interface DailyContemplationCardProps {
  isArabic: boolean;
  onNavigateToVerse: (surahId: number, verseNumber: number) => void;
}

export default function DailyContemplationCard({
  isArabic,
  onNavigateToVerse,
}: DailyContemplationCardProps) {
  const [verseIndex, setVerseIndex] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      // Check if dismissed recently (can persist in session)
      return localStorage.getItem("quran_daily_card_dismissed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Pick a verse based on the current day of the month so it changes daily
    const day = new Date().getDate();
    const index = (day - 1) % DAILY_VERSES.length;
    setVerseIndex(index);
  }, []);

  const handleShuffle = () => {
    setVerseIndex((prev) => {
      let next = prev;
      while (next === prev && DAILY_VERSES.length > 1) {
        next = Math.floor(Math.random() * DAILY_VERSES.length);
      }
      return next;
    });
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("quran_daily_card_dismissed", "true");
    } catch {}
  };

  const handleRestore = () => {
    setIsDismissed(false);
    try {
      localStorage.removeItem("quran_daily_card_dismissed");
    } catch {}
  };

  if (isDismissed) {
    return (
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleRestore}
          className="text-[10px] text-emerald-800 dark:text-gold-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
        >
          ✨ {isArabic ? "إظهار بطاقة آية التدبر اليومية" : "Show Daily Contemplation Verse"}
        </button>
      </div>
    );
  }

  const activeVerse: DailyVerse = DAILY_VERSES[verseIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-8 p-6 rounded-3xl bg-white dark:bg-[#021c12] border-2 border-gold-400/20 shadow-md relative overflow-hidden"
      id="daily-contemplation-container"
    >
      {/* Decorative stars and frames */}
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold-400/40"></span>
      </div>
      
      {/* Upper row header */}
      <div className="flex items-center justify-between pb-3 border-b border-gold-400/10 mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
          <h3 className="font-serif font-black text-xs md:text-sm text-[#113f28] dark:text-gold-250 uppercase tracking-wider">
            {isArabic ? "آية اليوم للتدبّر والتفكّر" : "Verse of the Day for Contemplation"}
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleShuffle}
            title={isArabic ? "آية عشوائية أخرى" : "Contemplate another random verse"}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-emerald-950/40 text-stone-500 hover:text-[#113f28] dark:text-gold-400/80 dark:hover:text-gold-300 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDismiss}
            title={isArabic ? "إغلاق مؤقت" : "Close card"}
            className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-emerald-950/40 text-stone-450 hover:text-rose-600 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Verse typography */}
      <div className="space-y-4 text-center">
        <div className="relative inline-block py-1">
          <h2 
            className="text-xl md:text-2.5xl font-black font-serif leading-relaxed text-[#113f28] dark:text-gold-150 relative z-10"
            style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
          >
            {activeVerse.textAr}
          </h2>
          <div className="absolute inset-x-0 bottom-1.5 h-1.5 bg-gold-400/5 dark:bg-gold-400/3 rounded-full pointer-events-none" />
        </div>

        {/* Translation translation */}
        <p className="text-xs md:text-sm text-stone-600 dark:text-gold-300/80 font-medium italic max-w-2xl mx-auto leading-relaxed">
          "{activeVerse.textEn}"
        </p>

        {/* Contemplative Explanation box */}
        <div className="p-4 rounded-2xl bg-gold-400/5 dark:bg-[#032014]/60 border border-gold-400/10 text-right rtl:text-right ltr:text-left text-xs text-stone-500 dark:text-gold-400/70 font-serif leading-relaxed max-w-2xl mx-auto space-y-1">
          <span className="font-bold text-[#113f28] dark:text-gold-300 flex items-center gap-1.5 text-[11px] mb-1">
            💡 {isArabic ? "أبعاد تدبرية هامة:" : "Contemplative Insights:"}
          </span>
          <p className="text-[11px] leading-relaxed">
            {isArabic ? activeVerse.tafsirAr : activeVerse.tafsirEn}
          </p>
        </div>

        {/* Action button to navigate straight to context */}
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => onNavigateToVerse(activeVerse.surahId, activeVerse.verseNumber)}
            className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-gold-300 font-bold text-xs rounded-2xl border border-gold-400/35 shadow-md flex items-center gap-2 cursor-pointer transition transform hover:scale-[1.01]"
          >
            <Eye className="w-3.5 h-3.5 text-gold-400" />
            <span>
              {isArabic 
                ? `قراءة وتدبر سورة ${activeVerse.surahNameAr} (آية ${activeVerse.verseNumber})`
                : `Read & Contemplate in ${activeVerse.surahNameEn} (Ayah ${activeVerse.verseNumber})`}
            </span>
            {isArabic ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
