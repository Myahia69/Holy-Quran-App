import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, RefreshCw, X, Languages, Quote, BookOpen } from "lucide-react";
import { AUTHENTIC_HADEETHS, Hadeeth } from "../data/hadeeths";

interface DailyHadeethCardProps {
  isArabic: boolean;
}

export default function DailyHadeethCard({ isArabic }: DailyHadeethCardProps) {
  const [hadeethIndex, setHadeethIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  // View mode: 'both' | 'ar' | 'en'
  const [viewMode, setViewMode] = useState<'both' | 'ar' | 'en'>('both');
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("hadeeth_daily_card_dismissed") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Pick a hadeeth based on the current day of the month so it changes daily
    const day = new Date().getDate();
    const index = (day - 1) % AUTHENTIC_HADEETHS.length;
    setHadeethIndex(index);
  }, []);

  const handleFetchRandom = () => {
    setIsLoading(true);
    // Simulate real fetching delay for a smooth UX transition
    setTimeout(() => {
      setHadeethIndex((prev) => {
        let next = prev;
        while (next === prev && AUTHENTIC_HADEETHS.length > 1) {
          next = Math.floor(Math.random() * AUTHENTIC_HADEETHS.length);
        }
        return next;
      });
      setIsLoading(false);
    }, 600);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      localStorage.setItem("hadeeth_daily_card_dismissed", "true");
    } catch {}
  };

  const handleRestore = () => {
    setIsDismissed(false);
    try {
      localStorage.removeItem("hadeeth_daily_card_dismissed");
    } catch {}
  };

  if (isDismissed) {
    return (
      <div className="mb-4 flex justify-end">
        <button
          onClick={handleRestore}
          className="text-[10px] text-emerald-800 dark:text-gold-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
        >
          📜 {isArabic ? "إظهار بطاقة الحديث النبوي الشريف" : "Show Daily Prophetic Hadeeth"}
        </button>
      </div>
    );
  }

  const activeHadeeth: Hadeeth = AUTHENTIC_HADEETHS[hadeethIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mb-8 p-6 rounded-3xl bg-white dark:bg-[#021c12] border-2 border-gold-400/20 shadow-md relative overflow-hidden"
      id="daily-hadeeth-container"
    >
      {/* Decorative sparkles */}
      <div className="absolute top-2 right-2 flex h-2 w-2">
        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-gold-400/40"></span>
      </div>

      {/* Upper row header */}
      <div className="flex items-center justify-between pb-3 border-b border-gold-400/10 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-500" />
          <h3 className="font-serif font-black text-xs md:text-sm text-[#113f28] dark:text-gold-250 uppercase tracking-wider">
            {isArabic ? "من مشكاة النبوة (حديث اليوم)" : "Prophetic Wisdom (Hadeeth of the Day)"}
          </h3>
        </div>

        <div className="flex items-center gap-3">
          {/* Language Toggle selector */}
          <div className="flex items-center bg-stone-100 dark:bg-emerald-950/60 p-0.5 rounded-xl border border-gold-400/15">
            <button
              onClick={() => setViewMode('ar')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'ar'
                  ? 'bg-[#113f28] text-gold-300 dark:bg-gold-500/20 dark:text-gold-200'
                  : 'text-stone-500 dark:text-gold-400/70 hover:text-stone-800'
              }`}
            >
              عربي
            </button>
            <button
              onClick={() => setViewMode('both')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'both'
                  ? 'bg-[#113f28] text-gold-300 dark:bg-gold-500/20 dark:text-gold-200'
                  : 'text-stone-500 dark:text-gold-400/70 hover:text-stone-800'
              }`}
            >
              {isArabic ? "معاً" : "Both"}
            </button>
            <button
              onClick={() => setViewMode('en')}
              className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                viewMode === 'en'
                  ? 'bg-[#113f28] text-gold-300 dark:bg-gold-500/20 dark:text-gold-200'
                  : 'text-stone-500 dark:text-gold-400/70 hover:text-stone-800'
              }`}
            >
              EN
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleFetchRandom}
              disabled={isLoading}
              title={isArabic ? "حديث شريف آخر" : "Fetch another random Hadeeth"}
              className="p-1.5 rounded-lg hover:bg-stone-100 dark:hover:bg-emerald-950/40 text-stone-500 hover:text-[#113f28] dark:text-gold-400/80 dark:hover:text-gold-300 transition cursor-pointer disabled:opacity-40"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
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
      </div>

      {/* Main Hadeeth display area */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-12 flex flex-col items-center justify-center gap-3 text-center"
          >
            <RefreshCw className="w-8 h-8 text-amber-500 animate-spin" />
            <p className="text-xs font-serif text-stone-500 dark:text-gold-400/70">
              {isArabic ? "جاري البحث في مصادر السنة النبوية..." : "Fetching from authentic Prophetic sources..."}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={hadeethIndex}
            initial={{ opacity: 0, x: isArabic ? 10 : -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isArabic ? -10 : 10 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            {/* Arabic content */}
            {(viewMode === 'ar' || viewMode === 'both') && (
              <div className="text-center py-2" dir="rtl">
                <Quote className="w-6 h-6 text-gold-400/35 mx-auto mb-2 rotate-180" />
                <h2
                  className="text-lg md:text-2xl font-black font-serif leading-relaxed text-[#113f28] dark:text-gold-150 max-w-4xl mx-auto"
                  style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                >
                  « {activeHadeeth.textAr} »
                </h2>
                <div className="mt-2 text-xs md:text-sm text-emerald-800 dark:text-gold-300/80 font-bold font-serif">
                  {isArabic ? "عن" : "On the authority of"} {activeHadeeth.narratorAr}
                </div>
                <div className="text-[10px] text-stone-450 dark:text-gold-400/50 mt-1 font-sans">
                  {isArabic ? `المصدر: ${activeHadeeth.sourceAr}` : `Source: ${activeHadeeth.sourceAr}`}
                </div>
              </div>
            )}

            {/* Split divider for 'both' mode */}
            {viewMode === 'both' && (
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-dashed border-gold-400/25"></div>
                <span className="flex-shrink mx-4 text-xs font-mono text-gold-400/40">★</span>
                <div className="flex-grow border-t border-dashed border-gold-400/25"></div>
              </div>
            )}

            {/* English content */}
            {(viewMode === 'en' || viewMode === 'both') && (
              <div className="text-center py-2" dir="ltr">
                {viewMode === 'en' && <Quote className="w-6 h-6 text-gold-400/35 mx-auto mb-2" />}
                <p className="text-xs md:text-sm text-stone-600 dark:text-gold-300/80 font-medium italic max-w-2xl mx-auto leading-relaxed">
                  "{activeHadeeth.textEn}"
                </p>
                <div className="mt-2 text-[11px] md:text-xs text-stone-500 dark:text-gold-400/70 font-semibold">
                  Narrated by: {activeHadeeth.narratorEn}
                </div>
                <div className="text-[9px] text-stone-450 dark:text-gold-400/40 mt-0.5 font-mono uppercase tracking-wider">
                  Source: {activeHadeeth.sourceEn}
                </div>
              </div>
            )}

            {/* Explanation box */}
            <div className="mt-4 p-4 rounded-2xl bg-gold-400/5 dark:bg-[#032014]/60 border border-gold-400/10 text-right rtl:text-right ltr:text-left text-xs text-stone-500 dark:text-gold-400/70 font-serif leading-relaxed max-w-2xl mx-auto space-y-1">
              <span className="font-bold text-[#113f28] dark:text-gold-300 flex items-center gap-1.5 text-[11px] mb-1">
                💡 {isArabic ? "فوائد الحديث والفوائد المستنبطة:" : "Brief Explanation & Legal Lessons:"}
              </span>
              <p className="text-[11px] leading-relaxed">
                {isArabic ? activeHadeeth.explanationAr : activeHadeeth.explanationEn}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
