import React, { useEffect, useState } from 'react';
import { ChevronLeft, Sparkles, Heart } from 'lucide-react';

interface SplashPageProps {
  onEnter: () => void;
}

export default function SplashPage({ onEnter }: SplashPageProps) {
  const [animate, setAnimate] = useState(false);
  const [skipAlways, setSkipAlways] = useState(false);

  useEffect(() => {
    // Small delay to trigger gorgeous css transitions
    const timer = setTimeout(() => {
      setAnimate(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleEnter = () => {
    if (skipAlways) {
      try {
        localStorage.setItem('quran_splash_skip_always', 'true');
      } catch {}
    }
    onEnter();
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-50 overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-br from-[#01100a] via-[#021f12] to-[#01140c] text-stone-100 selection:bg-gold-500/30 selection:text-[#fcf4cf]"
    >
      {/* Exquisite Ambient Islamic Geometry Overlays */}
      <div className="absolute inset-0 opacity-[0.035] pointer-events-none mix-blend-color-dodge overflow-hidden">
        {/* Repeating Islamic Hexagonal grid */}
        <div className="absolute inset-0 bg-repeat bg-[scale-75]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M40 0 L80 20 L80 60 L40 80 L0 60 L0 20 Z' fill='none' stroke='%23d4af37' stroke-width='1.5'/%3E%3Cpath d='M40 10 L70 25 L70 55 L40 70 L10 55 L10 25 Z' fill='none' stroke='%23d4af37' stroke-opacity='0.5' stroke-width='1'/%3E%3Ccircle cx='40' cy='40' r='8' fill='none' stroke='%23d4af37' stroke-width='1'/%3E%3C/svg%3E")`
        }} />
      </div>

      {/* Floating Animated Ornaments (Bg Circles for depth) */}
      <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-gold-400/5 blur-3xl pointer-events-none animate-pulse duration-10000" />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none animate-pulse duration-7000" />

      {/* Content Framed container inside a beautiful dual border Card */}
      <div 
        className={`relative max-w-2xl w-11/12 mx-auto px-6 py-12 md:p-16 rounded-[40px] bg-gradient-to-b from-[#021d10]/95 via-[#01170d]/98 to-[#022112]/95 border-2 border-gold-400/40 dark:border-gold-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-md text-center transition-all duration-1000 transform islamic-glow-strong ${
          animate ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'
        }`}
      >
        {/* Outer and Inner Artistic Symmetrical Islamic Border Overlay */}
        <div className="absolute inset-2 border border-gold-400/10 rounded-[32px] pointer-events-none" />
        <div className="absolute inset-4 border-2 border-dashed border-gold-400/20 rounded-[28px] pointer-events-none" />

        {/* Traditional Islamic Corner Ornaments */}
        <div className="absolute top-6 right-6 w-8 h-8 border-t-2 border-r-2 border-gold-400/50 rounded-tr-md pointer-events-none" />
        <div className="absolute top-6 left-6 w-8 h-8 border-t-2 border-l-2 border-gold-400/50 rounded-tl-md pointer-events-none" />
        <div className="absolute bottom-6 right-6 w-8 h-8 border-b-2 border-r-2 border-gold-400/50 rounded-br-md pointer-events-none" />
        <div className="absolute bottom-6 left-6 w-8 h-8 border-b-2 border-l-2 border-gold-400/50 rounded-bl-md pointer-events-none" />

        {/* Central Islamic Octagram Medallion (Rub el Hizb) */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-32 h-32 flex items-center justify-center animate-spin-slow">
            {/* Double Rotating Golden Squares forming 8-Point Star */}
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500 via-gold-400 to-gold-600 rounded-sm rotate-0 opacity-20 border border-gold-400" />
            <div className="absolute inset-0 bg-gradient-to-br from-gold-500 via-gold-400 to-gold-600 rounded-sm rotate-45 opacity-20 border border-gold-400" />
            
            {/* Intricate Inner Mandala lines */}
            <div className="absolute w-24 h-24 rounded-full border border-gold-400/40 flex items-center justify-center">
              <div className="w-18 h-18 rounded-full border-2 border-double border-gold-400/50 flex items-center justify-center">
                <Heart className="w-8 h-8 text-gold-300 animate-pulse fill-gold-400/10" />
              </div>
            </div>
          </div>
        </div>

        {/* Dedication Header and Call to Action */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-gold-400/60" />
              <p className="font-cinzel text-xs font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-gold-300 animate-pulse" />
                <span>إهداء وصدقة جارية</span>
                <Sparkles className="w-3.5 h-3.5 text-gold-300 animate-pulse" />
              </p>
              <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-gold-400/60" />
            </div>

            <p className="font-scheherazade text-gold-200 text-3xl md:text-4xl font-semibold leading-relaxed">
              صدقة جارية لروح أبي الحبيب
            </p>
          </div>

          {/* Large elegant name of the father */}
          <div className="py-4 my-2 relative">
            {/* Background glowing aura */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-16 bg-gold-400/5 blur-xl rounded-full" />
            
            <h1 
              className="relative font-amiri text-gold-300 text-4xl sm:text-5xl md:text-6.5xl font-extrabold tracking-normal p-2 leading-tight"
              style={{
                textShadow: '0 4px 15px rgba(212, 175, 55, 0.35)'
              }}
            >
              الْحَاجّ يَحْيَى مُحَمَّد صَبِيح
            </h1>
            
            <p className="text-xs sm:text-sm font-scheherazade text-gold-400/85 mt-2 font-bold tracking-wide">
              غفر الله له ورحمه وأثابه جنات الفردوس الأعلى
            </p>
          </div>

          {/* Sincere traditional Du'aa for the father */}
          <div className="max-w-md mx-auto pt-4 border-t border-gold-400/15">
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-950/40 border border-gold-400/10 italic text-[#ebe7d9]">
              <p className="font-scheherazade text-base sm:text-lg md:text-xl leading-relaxed text-stone-200">
                "اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاجْعَلْ قَبْرَهُ رَوْضَةً مِنْ رِيَاضِ الْجَنَّةِ، وَاجْعَلْ هَذَا الْعَمَلَ فِي مِيزَانِ حَسَنَاتِهِ."
              </p>
            </div>
            
            <p className="text-[10px] sm:text-xs font-sans text-stone-400/80 mt-3">
              دعاء لروح فقيدنا الغالي، نسأل الله القبول والإجابة وصالح العمال.
            </p>
          </div>

          {/* CTA Start Button with Islamic Geometric Border effects */}
          <div className="pt-8 flex flex-col items-center gap-4">
            <button
              onClick={handleEnter}
              className="group relative overflow-hidden px-12 py-4 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600 text-emerald-950 font-sans font-extrabold text-base sm:text-lg rounded-2xl cursor-pointer shadow-[0_8px_30px_rgba(212,175,55,0.2)] hover:shadow-[0_15px_45px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 border border-gold-300"
            >
              {/* Overlay pulse sheen */}
              <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
              
              <span>ابدأ القراءة والتدبر</span>
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>

            {/* Visual Skip Always option for returning readers convenience */}
            <label className="flex items-center gap-2 mt-2 cursor-pointer text-xs text-stone-400 hover:text-gold-250 select-none transition">
              <input
                type="checkbox"
                checked={skipAlways}
                onChange={(e) => setSkipAlways(e.target.checked)}
                className="rounded border-gold-400/40 text-gold-500 bg-emerald-950/50 focus:ring-0 cursor-pointer w-4 h-4 ml-1"
              />
              <span>تخطي هذه الصفحة تلقائياً في الزيارات القادمة</span>
            </label>
          </div>
        </div>
      </div>

      {/* Decorative Traditional Footnote Ornament spacing */}
      <div className="absolute bottom-6 text-center text-[10px] text-stone-500/80 font-mono tracking-widest max-w-xs px-4 pointer-events-none">
        تلاوت، تدبر وتفسير القرآن الكريم - ١٤٤٧ هـ
      </div>

      {/* Tailwind & CSS Custom Animations for spin-slow */}
      <style>{`
        @keyframes spin-slow-custom {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow-custom 25s linear infinite;
        }
      `}</style>
    </div>
  );
}
