import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  Trash2, 
  Plus, 
  Award,
  ChevronRight,
  ChevronLeft
} from "lucide-react";

interface TasbihDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
}

interface DhikrPreset {
  id: string;
  ar: string;
  en: string;
  translation: string;
}

const DHIKR_PRESETS: DhikrPreset[] = [
  { 
    id: "subhanallah", 
    ar: "سُبْحَانَ اللَّهِ", 
    en: "Subhan Allah", 
    translation: "Glory be to Allah" 
  },
  { 
    id: "alhamdulillah", 
    ar: "الْحَمْدُ لِلَّهِ", 
    en: "Alhamdulillah", 
    translation: "Praise be to Allah" 
  },
  { 
    id: "allahuakbar", 
    ar: "اللَّهُ أَكْبَرُ", 
    en: "Allahu Akbar", 
    translation: "Allah is the Greatest" 
  },
  { 
    id: "la_ilaha_illa_allah", 
    ar: "لَا إِلَٰهَ إِلَّا اللَّهُ", 
    en: "La ilaha illa Allah", 
    translation: "There is no deity but Allah" 
  },
  { 
    id: "astaghfirullah", 
    ar: "أَسْتَغْفِرُ اللَّهَ", 
    en: "Astaghfirullah", 
    translation: "I seek forgiveness from Allah" 
  },
];

export default function TasbihDialog({ isOpen, onClose, isArabic }: TasbihDialogProps) {
  const [activePresetIndex, setActivePresetIndex] = useState<number>(0);
  const [count, setCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(() => {
    try {
      return Number(localStorage.getItem("quran_tasbih_total_count") || "0");
    } catch {
      return 0;
    }
  });

  const [target, setTarget] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem("quran_tasbih_sound") !== "false";
    } catch {
      return true;
    }
  });

  const [history, setHistory] = useState<Array<{ id: string; name: string; count: number; date: string }>>(() => {
    try {
      const saved = localStorage.getItem("quran_tasbih_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cycleCompleted, setCycleCompleted] = useState<boolean>(false);
  
  // Audio files/synthesizer simulation for satisfying click sound
  const audioContextRef = useRef<AudioContext | null>(null);

  const activeDhikr = DHIKR_PRESETS[activePresetIndex];

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem("quran_tasbih_sound", String(soundEnabled));
    } catch {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem("quran_tasbih_total_count", String(totalCount));
    } catch {}
  }, [totalCount]);

  useEffect(() => {
    try {
      localStorage.setItem("quran_tasbih_history", JSON.stringify(history));
    } catch {}
  }, [history]);

  // Click Sound Synthesizer (to avoid loading heavy external audio files)
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Create a nice mechanical wooden "click/pop" sound
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (err) {
      console.warn("AudioContext failed to initialize or play sound:", err);
    }
  };

  // Completion sound: high pleasant ding
  const playCompletionSound = () => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.45);
      osc2.stop(ctx.currentTime + 0.45);
    } catch {}
  };

  const handleIncrement = () => {
    if (cycleCompleted) {
      // Start a new cycle
      setCount(1);
      setTotalCount(prev => prev + 1);
      setCycleCompleted(false);
      playClickSound();
      return;
    }

    const nextCount = count + 1;
    setCount(nextCount);
    setTotalCount(prev => prev + 1);
    playClickSound();

    if (nextCount === target) {
      setCycleCompleted(true);
      playCompletionSound();
      
      // Save to history
      const newHistoryItem = {
        id: Math.random().toString(36).substring(2, 9),
        name: isArabic ? activeDhikr.ar : activeDhikr.en,
        count: target,
        date: new Date().toLocaleTimeString(isArabic ? "ar-EG" : "en-US", {
          hour: "numeric",
          minute: "2-digit"
        })
      };
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 10)); // save last 10
    }
  };

  const handleReset = () => {
    setCount(0);
    setCycleCompleted(false);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setTotalCount(0);
  };

  const nextPreset = () => {
    setActivePresetIndex((prev) => (prev + 1) % DHIKR_PRESETS.length);
    handleReset();
  };

  const prevPreset = () => {
    setActivePresetIndex((prev) => (prev - 1 + DHIKR_PRESETS.length) % DHIKR_PRESETS.length);
    handleReset();
  };

  // Progress percentage (constrained up to 100)
  const percentage = Math.min((count / target) * 100, 100);

  // SVG parameters for visual round ring
  const radius = 90;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="tasbih-modal-overlay">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#000d07]/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="relative w-full max-w-md bg-[#fdfbf6] dark:bg-[#021810] border-2 border-gold-400 rounded-3xl overflow-hidden shadow-2xl z-10 text-stone-800 dark:text-gold-100 flex flex-col max-h-[90vh]"
            id="tasbih-modal-body"
          >
            {/* Islamic border frame */}
            <div className="absolute inset-1.5 border border-gold-400/20 rounded-[22px] pointer-events-none" />

            {/* Header */}
            <div className="p-5 border-b border-gold-400/10 flex items-center justify-between relative z-10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-950/40 dark:bg-emerald-900/40 border border-gold-400/30 flex items-center justify-center text-gold-400">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-base text-[#113f28] dark:text-gold-250 leading-none">
                    {isArabic ? "السبحة الإلكترونية التفاعلية" : "Interactive Smart Tasbih"}
                  </h3>
                  <p className="text-[10px] text-stone-500 dark:text-gold-400/60 font-serif mt-1">
                    {isArabic ? "تسبيح تفاعلي ذكي لترطيب لسانك بذكر الله" : "Beautiful companion to remember Allah daily"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-emerald-950 text-stone-500 dark:text-gold-400 transition cursor-pointer border border-transparent hover:border-gold-400/20 animate-fade-in"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content wrapper */}
            <div className="p-6 overflow-y-auto flex-1 relative z-10 custom-scrollbar space-y-6">
              
              {/* Preset Dhikr Selector */}
              <div className="bg-white dark:bg-[#032014] border-2 border-gold-400/10 rounded-2xl p-4 shadow-sm flex items-center justify-between relative overflow-hidden">
                <button
                  onClick={prevPreset}
                  className="p-1.5 rounded-xl hover:bg-stone-50 dark:hover:bg-[#021810] text-gold-500 hover:text-gold-600 transition border border-gold-400/10"
                >
                  <ChevronLeft className="w-5 h-5 rtl:rotate-180" />
                </button>

                <div className="text-center flex-1 px-4 space-y-1">
                  <span className="text-[9px] font-bold text-stone-400 dark:text-gold-400/50 uppercase tracking-wider block">
                    {isArabic ? "الذِّكْر الحَالِي" : "CURRENT DHIKR"}
                  </span>
                  <h4 
                    className="text-lg md:text-xl font-bold font-serif text-emerald-900 dark:text-gold-250 tracking-wide break-words"
                    style={{ fontFamily: "'Scheherazade New', 'Amiri', serif" }}
                  >
                    {activeDhikr.ar}
                  </h4>
                  <p className="text-[11px] font-sans font-semibold text-stone-500 dark:text-gold-400/70">
                    {isArabic ? activeDhikr.translation : activeDhikr.en}
                  </p>
                </div>

                <button
                  onClick={nextPreset}
                  className="p-1.5 rounded-xl hover:bg-stone-50 dark:hover:bg-[#021810] text-gold-500 hover:text-gold-600 transition border border-gold-400/10"
                >
                  <ChevronRight className="w-5 h-5 rtl:rotate-180" />
                </button>
              </div>

              {/* Target & Sound utilities */}
              <div className="flex items-center justify-between gap-4">
                {/* Target counters */}
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-stone-400 dark:text-gold-400/50 uppercase tracking-wide block">
                    🎯 {isArabic ? "دورة التكرار" : "Target Limit"}
                  </span>
                  <div className="flex gap-1.5 bg-white dark:bg-[#032014] p-1 rounded-xl border border-gold-400/15">
                    {[33, 99, 100].map((t) => (
                      <button
                        key={t}
                        onClick={() => {
                          setTarget(t);
                          handleReset();
                        }}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                          target === t
                            ? "bg-emerald-950 dark:bg-gold-400 text-gold-300 dark:text-[#021810]"
                            : "text-stone-500 dark:text-gold-400/60 hover:text-[#113f28]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sound triggers */}
                <div className="space-y-1 text-right">
                  <span className="text-[9px] font-bold text-stone-400 dark:text-gold-400/50 uppercase tracking-wide block">
                    🔊 {isArabic ? "الصوت" : "Audio Pop"}
                  </span>
                  <button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2.5 rounded-xl border-2 transition cursor-pointer ${
                      soundEnabled
                        ? "bg-gold-400/5 dark:bg-gold-400/10 border-gold-400 text-gold-500"
                        : "bg-white dark:bg-[#032014] border-gold-400/15 text-stone-400"
                    }`}
                  >
                    {soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Interactive Circle Clicker */}
              <div className="relative flex flex-col items-center justify-center py-4">
                
                {/* Round progress bar ring */}
                <div className="relative w-52 h-52 flex items-center justify-center">
                  
                  {/* Outer glow ring */}
                  <div className="absolute inset-0.5 rounded-full bg-gradient-to-tr from-gold-400/10 to-transparent dark:from-gold-400/5 dark:to-transparent animate-pulse" />
                  
                  <svg className="w-full h-full transform -rotate-90">
                    {/* Background ring */}
                    <circle
                      className="text-stone-100 dark:text-[#032014]"
                      strokeWidth={stroke}
                      stroke="currentColor"
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius + stroke}
                      cy={radius + stroke}
                    />
                    {/* Animated foreground ring */}
                    <motion.circle
                      className="text-gold-400"
                      strokeWidth={stroke}
                      strokeDasharray={circumference + " " + circumference}
                      style={{ strokeDashoffset }}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r={normalizedRadius}
                      cx={radius + stroke}
                      cy={radius + stroke}
                      animate={{ strokeDashoffset }}
                      transition={{ type: "spring", stiffness: 80, damping: 20 }}
                    />
                  </svg>

                  {/* Inside Center: Increment Interactive Button */}
                  <motion.button
                    whileTap={{ scale: 0.92 }}
                    onClick={handleIncrement}
                    className="absolute w-[148px] h-[148px] rounded-full bg-[#113f28] hover:bg-emerald-900 border-4 border-gold-400 text-gold-250 flex flex-col items-center justify-center shadow-lg cursor-pointer select-none relative group overflow-hidden"
                  >
                    {/* Glowing effect inside circle */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-gold-400/0 via-gold-400/0 to-gold-400/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <AnimatePresence mode="popLayout">
                      {cycleCompleted ? (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          className="flex flex-col items-center space-y-1 text-center"
                          key="completed-checkmark"
                        >
                          <CheckCircle2 className="w-10 h-10 text-gold-400 animate-bounce" />
                          <span className="text-[10px] font-black uppercase tracking-wider text-gold-300">
                            {isArabic ? "تمت الدورة" : "Cycle Done"}
                          </span>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={`count-${count}`}
                          className="flex flex-col items-center justify-center"
                        >
                          <span className="text-[10px] font-bold text-gold-400/70 tracking-widest uppercase mb-1">
                            {count} / {target}
                          </span>
                          <span className="text-4xl font-mono font-black text-gold-250">
                            {count}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    {/* Quick helper tag */}
                    <span className="absolute bottom-3 text-[9px] font-bold tracking-wider text-gold-400/60 uppercase group-hover:text-gold-400 transition-colors">
                      {isArabic ? "اضغط هنا" : "CLICK"}
                    </span>
                  </motion.button>
                </div>

                {/* Counter resets */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={handleReset}
                    title={isArabic ? "إعادة تصفير" : "Reset count"}
                    disabled={count === 0}
                    className="px-4 py-2 bg-stone-100 hover:bg-stone-200 dark:bg-[#032014] dark:hover:bg-[#021810] text-stone-500 dark:text-gold-400/80 border border-gold-400/10 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{isArabic ? "تصفير" : "Reset"}</span>
                  </button>
                </div>
              </div>

              {/* Total counter & Saved History Logs */}
              <div className="border-t border-gold-400/10 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-gold-500" />
                    <span className="text-xs font-bold text-[#113f28] dark:text-gold-250 font-serif">
                      {isArabic ? `إجمالي التسبيحات: ${totalCount}` : `Total Recitations: ${totalCount}`}
                    </span>
                  </div>
                  {history.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-[10px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>{isArabic ? "مسح السجل" : "Clear Logs"}</span>
                    </button>
                  )}
                </div>

                {history.length > 0 ? (
                  <div className="bg-stone-50 dark:bg-[#031d13] border border-gold-400/10 rounded-2xl p-3 max-h-32 overflow-y-auto custom-scrollbar space-y-1.5">
                    {history.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-[11px] py-1 border-b border-gold-400/5 last:border-0"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-gold-500">✨</span>
                          <span className="font-serif font-black text-stone-700 dark:text-gold-250 leading-none">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-stone-400 dark:text-gold-500/50">{item.date}</span>
                          <span className="bg-emerald-950/20 border border-gold-400/20 px-2 py-0.5 rounded-lg text-[10px] font-bold text-[#113f28] dark:text-gold-300 font-mono">
                            +{item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-center text-stone-400 dark:text-gold-500/40 italic">
                    {isArabic ? "ابدأ التسبيح لتسجيل أولى الإنجازات في السجل." : "Complete a full target cycle to log in history."}
                  </p>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
