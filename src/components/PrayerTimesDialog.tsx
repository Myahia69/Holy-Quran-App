import { useEffect, useState, useRef, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, 
  MapPin, 
  Search, 
  X, 
  ExternalLink, 
  RefreshCw, 
  Compass, 
  AlertCircle, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Navigation,
  Play,
  Square
} from "lucide-react";

interface PrayerTimesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
}

interface PrayerData {
  location: string;
  date: string;
  calculationMethod?: string;
  latitude?: number;
  longitude?: number;
  prayerTimes: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  sources?: Array<{ title: string; url: string }>;
}

type DialogTab = "times" | "qibla" | "alerts";

export default function PrayerTimesDialog({ isOpen, onClose, isArabic }: PrayerTimesDialogProps) {
  const [activeTab, setActiveTab] = useState<DialogTab>("times");
  const [locationInput, setLocationInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data State
  const [prayerData, setPrayerData] = useState<PrayerData | null>(() => {
    try {
      const saved = localStorage.getItem("quran_cached_prayer_times");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Next prayer tracking
  const [nextPrayerName, setNextPrayerName] = useState<string>("");
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Compass (Qibla) states
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [hasCompassSensor, setHasCompassSensor] = useState<boolean>(false);
  const [manualRotation, setManualRotation] = useState<number>(0);
  const [orientationPermissionGranted, setOrientationPermissionGranted] = useState<boolean>(false);

  // Adhan Alert Settings States (saved in localStorage for background player in App.tsx)
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(() => {
    return localStorage.getItem("quran_adhan_alerts_enabled") !== "false"; // default true
  });
  const [selectedAdhan, setSelectedAdhan] = useState<string>(() => {
    return localStorage.getItem("quran_adhan_sound_url") || "https://www.islamcan.com/audio/adhan/azan2.mp3";
  });
  const [alertType, setAlertType] = useState<"full" | "takbeer">(() => {
    return (localStorage.getItem("quran_adhan_alert_type") as "full" | "takbeer") || "takbeer";
  });

  // Preview Audio Player for Testing inside Dialog
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  // Auto-detect or load initial times when opened
  useEffect(() => {
    if (isOpen) {
      if (!prayerData) {
        // Try timezone-based location on first open
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz) {
          const parts = tz.split("/");
          const city = parts[parts.length - 1]?.replace(/_/g, " ") || "Makkah";
          setLocationInput(city);
          fetchPrayerTimes(city);
        } else {
          setLocationInput("Makkah");
          fetchPrayerTimes("Makkah");
        }
      } else {
        if (!prayerData.location.includes(",")) {
          setLocationInput(prayerData.location);
        }
      }
    }
  }, [isOpen]);

  // Handle countdown and next prayer tracking
  useEffect(() => {
    if (prayerData) {
      updateNextPrayer(prayerData);
      timerRef.current = setInterval(() => {
        updateNextPrayer(prayerData);
      }, 60000); // Update every minute
      
      // Calculate Qibla if coords exist
      if (prayerData.latitude && prayerData.longitude) {
        calculateQibla(prayerData.latitude, prayerData.longitude);
      } else {
        setQiblaAngle(null);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [prayerData, isArabic]);

  // Listen to Device Orientation for real mobile compass
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      // webkitCompassHeading is supported on iOS
      const heading = (e as any).webkitCompassHeading !== undefined
        ? (e as any).webkitCompassHeading
        : e.alpha !== null
          ? 360 - e.alpha // standard heading on Android
          : null;

      if (heading !== null && heading !== undefined) {
        setDeviceHeading(heading);
        setHasCompassSensor(true);
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const requestOrientationPermission = async () => {
    const devOrient = DeviceOrientationEvent as any;
    if (typeof devOrient !== "undefined" && typeof devOrient.requestPermission === "function") {
      try {
        const response = await devOrient.requestPermission();
        if (response === "granted") {
          setOrientationPermissionGranted(true);
          setHasCompassSensor(true);
        }
      } catch (err) {
        console.warn("Orientation permission denied or failed:", err);
      }
    } else {
      // Not iOS or already granted implicitly
      setOrientationPermissionGranted(true);
    }
  };

  const calculateQibla = (lat: number, lng: number) => {
    // Makkah Coordinates (Kaaba)
    const mLat = 21.4225;
    const mLng = 39.8262;

    const latRad = (lat * Math.PI) / 180;
    const lngRad = (lng * Math.PI) / 180;
    const mLatRad = (mLat * Math.PI) / 180;
    const mLngRad = (mLng * Math.PI) / 180;

    const dLng = mLngRad - lngRad;

    const y = Math.sin(dLng);
    const x = Math.cos(latRad) * Math.tan(mLatRad) - Math.sin(latRad) * Math.cos(dLng);

    const qiblaRad = Math.atan2(y, x);
    const qiblaDeg = (qiblaRad * 180) / Math.PI;
    
    // Normalize to 0-360
    setQiblaAngle((qiblaDeg + 360) % 360);
  };

  const parseTimeToDate = (timeStr: string): Date | null => {
    if (!timeStr) return null;
    const now = new Date();
    
    const clean = timeStr.trim().toUpperCase();
    const match = clean.match(/(\d+):(\d+)\s*(AM|PM)?/);
    if (!match) return null;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const ampm = match[3];
    
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    
    const d = new Date(now);
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  const updateNextPrayer = (data: PrayerData) => {
    const times = data.prayerTimes;
    const prayerKeys: Array<keyof typeof times> = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"];
    
    const arabicNames: Record<string, string> = {
      fajr: "الفجر",
      sunrise: "الشروق",
      dhuhr: "الظهر",
      asr: "العصر",
      maghrib: "المغرب",
      isha: "العشاء",
    };

    const englishNames: Record<string, string> = {
      fajr: "Fajr",
      sunrise: "Sunrise",
      dhuhr: "Dhuhr",
      asr: "Asr",
      maghrib: "Maghrib",
      isha: "Isha",
    };

    const now = new Date();
    let nextKey: keyof typeof times | null = null;
    let minDiff = Infinity;
    let nextDate: Date | null = null;

    for (const key of prayerKeys) {
      const pTime = times[key];
      const pDate = parseTimeToDate(pTime);
      if (pDate) {
        let diff = pDate.getTime() - now.getTime();
        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          nextKey = key;
          nextDate = pDate;
        }
      }
    }

    if (!nextKey) {
      nextKey = "fajr";
      const fajrTime = times.fajr;
      const pDate = parseTimeToDate(fajrTime);
      if (pDate) {
        pDate.setDate(pDate.getDate() + 1); // Tomorrow's Fajr
        minDiff = pDate.getTime() - now.getTime();
        nextDate = pDate;
      }
    }

    if (nextKey && nextDate) {
      const name = isArabic ? arabicNames[nextKey] : englishNames[nextKey];
      setNextPrayerName(name);

      const totalMinutes = Math.floor(minDiff / 60000);
      const hours = Math.floor(totalMinutes / 60);
      const mins = totalMinutes % 60;

      if (hours > 0) {
        setTimeRemaining(
          isArabic
            ? `متبقي ${hours} ساعة و ${mins} دقيقة`
            : `${hours}h ${mins}m remaining`
        );
      } else {
        setTimeRemaining(
          isArabic
            ? `متبقي ${mins} دقيقة`
            : `${mins}m remaining`
        );
      }
    }
  };

  const fetchPrayerTimes = async (queryLocation: string) => {
    if (!queryLocation.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const formattedDate = new Date().toISOString().split("T")[0];
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      const res = await fetch("/api/prayer-times", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: queryLocation,
          date: formattedDate,
          timezone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch prayer times.");
      }

      setPrayerData(data);
      localStorage.setItem("quran_cached_prayer_times", JSON.stringify(data));
      
      if (data.location && !data.location.includes(",")) {
        setLocationInput(data.location);
      }
    } catch (err: any) {
      console.warn("Server API failed, attempting fallback to Aladhan Public API...", err);
      
      try {
        let aladhanUrl = "";
        if (queryLocation.includes(",")) {
          const [lat, lng] = queryLocation.split(",").map(s => s.trim());
          aladhanUrl = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=4`;
        } else {
          aladhanUrl = `https://api.aladhan.com/v1/timingsByAddress?address=${encodeURIComponent(queryLocation)}&method=4`;
        }

        const aladhanRes = await fetch(aladhanUrl);
        if (!aladhanRes.ok) {
          throw new Error("Aladhan fallback request failed.");
        }
        
        const aladhanData = await aladhanRes.json();
        if (aladhanData.code !== 200 || !aladhanData.data) {
          throw new Error("Invalid response from Aladhan fallback API.");
        }

        const timings = aladhanData.data.timings;
        
        const formatTimeWithPeriod = (timeStr: string) => {
          const [hStr, mStr] = timeStr.split(":");
          const h = parseInt(hStr);
          const m = parseInt(mStr);
          const period = h >= 12 ? "PM" : "AM";
          const displayH = h % 12 === 0 ? 12 : h % 12;
          const formattedMin = m < 10 ? `0${m}` : mStr;
          return `${displayH}:${formattedMin} ${period}`;
        };

        const resolvedLocation = queryLocation.includes(",")
          ? (isArabic ? `الإحداثيات الجغرافية (${queryLocation})` : `GPS Coordinates (${queryLocation})`)
          : (aladhanData.data.meta.timezone || queryLocation);

        const latVal = queryLocation.includes(",") 
          ? parseFloat(queryLocation.split(",")[0]) 
          : parseFloat(aladhanData.data.meta.latitude) || undefined;
        const lngVal = queryLocation.includes(",") 
          ? parseFloat(queryLocation.split(",")[1]) 
          : parseFloat(aladhanData.data.meta.longitude) || undefined;

        const fallbackData: PrayerData = {
          location: resolvedLocation,
          date: aladhanData.data.date.readable,
          calculationMethod: aladhanData.data.meta.method?.name || (isArabic ? "الحساب الفلكي" : "Astronomical Calculation"),
          latitude: latVal,
          longitude: lngVal,
          prayerTimes: {
            fajr: formatTimeWithPeriod(timings.Fajr),
            sunrise: formatTimeWithPeriod(timings.Sunrise),
            dhuhr: formatTimeWithPeriod(timings.Dhuhr),
            asr: formatTimeWithPeriod(timings.Asr),
            maghrib: formatTimeWithPeriod(timings.Maghrib),
            isha: formatTimeWithPeriod(timings.Isha),
          },
          sources: [
            { title: "Aladhan API (Fallback)", url: "https://aladhan.com" }
          ]
        };

        setPrayerData(fallbackData);
        localStorage.setItem("quran_cached_prayer_times", JSON.stringify(fallbackData));
        
        const errorMessage = err.message || "";
        const isQuotaError = errorMessage.includes("429") || 
                             errorMessage.toLowerCase().includes("quota") || 
                             errorMessage.includes("RESOURCE_EXHAUSTED") || 
                             errorMessage.toLowerCase().includes("limit");
                             
        setError(
          isArabic
            ? (isQuotaError 
                ? "💡 نظراً لتجاوز حدّ وحصّة الطلبات (Rate Limit 429) الخاصة بمفتاح Gemini، تم الانتقال تلقائياً لنظام مواقيت الصلاة الفلكي Aladhan لضمان استمرار الخدمة بدقة."
                : "💡 تم الانتقال تلقائياً لنظام مواقيت الصلاة الفلكي البديل لضمان استمرار الخدمة.")
            : (isQuotaError
                ? "💡 Gemini API key quota exceeded (Rate Limit 429). We have automatically switched to the astronomical Aladhan API for uninterrupted service."
                : "💡 Automatically fell back to the astronomical prayer system for continuous service.")
        );

        if (!queryLocation.includes(",")) {
          setLocationInput(resolvedLocation);
        }

      } catch (fallbackErr) {
        console.error("Both primary API and fallback API failed:", fallbackErr);
        setError(
          isArabic
            ? `حدث خطأ في النظام الأساسي: ${err.message || "فشل الاتصال"}. ولم نتمكن من الوصول للمخدم البديل.`
            : `Primary API Error: ${err.message || "Failed to reach"}. Also failed to reach fallback prayer server.`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    setDetectingLocation(true);
    setError(null);

    if (!navigator.geolocation) {
      setError(isArabic ? "تحديد الموقع الجغرافي غير مدعوم في متصفحك." : "Geolocation is not supported by your browser.");
      setDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const query = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        fetchPrayerTimes(query);
        setDetectingLocation(false);
      },
      (err) => {
        console.warn(err);
        setDetectingLocation(false);
        setError(
          isArabic
            ? "تعذر تحديد الموقع تلقائياً. يرجى كتابة مدينتك بالأسفل والبحث."
            : "Could not auto-detect location. Please search for your city manually."
        );
      },
      { timeout: 8000 }
    );
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    fetchPrayerTimes(locationInput);
  };

  const isCurrentOrNext = (prayerKey: string): boolean => {
    if (!prayerData) return false;
    const arabicNames: Record<string, string> = {
      fajr: "الفجر",
      sunrise: "الشروق",
      dhuhr: "الظهر",
      asr: "العصر",
      maghrib: "المغرب",
      isha: "العشاء",
    };
    const englishNames: Record<string, string> = {
      fajr: "Fajr",
      sunrise: "Sunrise",
      dhuhr: "Dhuhr",
      asr: "Asr",
      maghrib: "Maghrib",
      isha: "Isha",
    };
    const currentNextName = nextPrayerName;
    return (
      currentNextName === arabicNames[prayerKey] ||
      currentNextName === englishNames[prayerKey]
    );
  };

  // Audio settings saving helpers
  const toggleAlerts = (checked: boolean) => {
    setAlertsEnabled(checked);
    localStorage.setItem("quran_adhan_alerts_enabled", String(checked));
    
    // Dispatch custom event to notify App.tsx immediately
    window.dispatchEvent(new Event("quran_adhan_settings_changed"));
  };

  const changeAdhanSound = (url: string) => {
    setSelectedAdhan(url);
    localStorage.setItem("quran_adhan_sound_url", url);
    stopTestAudio();
    window.dispatchEvent(new Event("quran_adhan_settings_changed"));
  };

  const changeAlertType = (type: "full" | "takbeer") => {
    setAlertType(type);
    localStorage.setItem("quran_adhan_alert_type", type);
    stopTestAudio();
    window.dispatchEvent(new Event("quran_adhan_settings_changed"));
  };

  const playTestAudio = () => {
    if (isPlayingTest) {
      stopTestAudio();
      return;
    }

    try {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
      }
      
      const audio = new Audio(selectedAdhan);
      audio.volume = 0.8;
      
      if (alertType === "takbeer") {
        // Stop automatically after 18 seconds (approx length of start Takbeerat)
        audio.addEventListener("timeupdate", () => {
          if (audio.currentTime > 18) {
            audio.pause();
            setIsPlayingTest(false);
          }
        });
      }

      audio.addEventListener("ended", () => {
        setIsPlayingTest(false);
      });

      testAudioRef.current = audio;
      audio.play();
      setIsPlayingTest(true);
    } catch (err) {
      console.error("Failed to play test audio:", err);
    }
  };

  const stopTestAudio = () => {
    if (testAudioRef.current) {
      testAudioRef.current.pause();
      testAudioRef.current = null;
    }
    setIsPlayingTest(false);
  };

  // Cleanup audio when dialog closes
  useEffect(() => {
    return () => {
      if (testAudioRef.current) {
        testAudioRef.current.pause();
      }
    };
  }, [isOpen]);

  // Calculations for visual compass positioning
  const finalCompassAngle = hasCompassSensor ? (360 - deviceHeading) : manualRotation;
  const targetQiblaRotation = qiblaAngle !== null ? (finalCompassAngle + qiblaAngle) % 360 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-xl bg-[#fdfbf6] dark:bg-[#021810] border-2 border-gold-400 rounded-3xl overflow-hidden shadow-2xl z-10 text-stone-800 dark:text-gold-100 flex flex-col max-h-[90vh]"
            id="prayer-times-modal-body"
          >
            {/* Islamic Star Ornaments & Framing */}
            <div className="absolute inset-1.5 border border-gold-400/20 rounded-[22px] pointer-events-none" />
            
            {/* Header */}
            <div className="p-6 pb-2 border-b border-gold-400/10 flex items-center justify-between shrink-0 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-950/40 dark:bg-emerald-900/40 border border-gold-400/30 flex items-center justify-center text-gold-400">
                  <Clock className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-serif font-black text-lg text-[#113f28] dark:text-gold-250 leading-tight">
                    {isArabic ? "مواقيت الصلاة والتنبيهات والقبلة" : "Prayer, Alerts & Qibla Finder"}
                  </h3>
                  <p className="text-[10px] text-stone-500 dark:text-gold-400/60 font-serif">
                    {isArabic ? "مواقيت دقيقة وبوصلة قبلة تفاعلية وتنبيه صوتي ذكي" : "Precise times, interactive Qibla finder & smart audio alerts"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-emerald-950 text-stone-500 dark:text-gold-400 transition cursor-pointer border border-transparent hover:border-gold-400/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Elegant Tab Switcher */}
            <div className="px-6 pt-3 flex gap-1 border-b border-gold-400/10 relative z-10">
              {[
                { id: "times", ar: "مواقيت الصلاة", en: "Prayer Times", icon: Clock },
                { id: "qibla", ar: "بوصلة القبلة", en: "Qibla Compass", icon: Navigation },
                { id: "alerts", ar: "تنبيه الأذان", en: "Adhan Alerts", icon: Volume2 },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as DialogTab);
                      stopTestAudio();
                    }}
                    className={`flex-1 py-2 px-1 text-xs font-bold rounded-t-xl transition-all border-t-2 border-x border-transparent flex items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? "bg-white dark:bg-[#032014] text-emerald-950 dark:text-gold-250 border-t-gold-400 border-x-gold-400/10 font-black shadow-[0_-2px_6px_rgba(0,0,0,0.03)]"
                        : "text-stone-500 dark:text-gold-400/60 hover:text-emerald-950 dark:hover:text-gold-200"
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? "text-gold-400" : ""}`} />
                    <span>{isArabic ? tab.ar : tab.en}</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Content */}
            <div className="p-6 overflow-y-auto flex-1 relative z-10 custom-scrollbar max-h-[60vh]">
              
              {/* Tab 1: PRAYER TIMES */}
              {activeTab === "times" && (
                <div className="space-y-4 animate-fade-in">
                  {/* Form to Search Location */}
                  <form onSubmit={handleSearchSubmit} className="flex gap-2" id="prayer-search-form">
                    <div className="relative flex-1">
                      <span className="absolute left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-gold-500 text-sm">
                        📍
                      </span>
                      <input
                        type="text"
                        value={locationInput}
                        onChange={(e) => setLocationInput(e.target.value)}
                        placeholder={isArabic ? "مثال: الرياض، دبي، القاهرة..." : "Enter City, Country..."}
                        className="w-full bg-white dark:bg-[#032014] border-2 border-gold-400/20 focus:border-gold-400 rounded-2xl py-2.5 pl-10 pr-4 rtl:pr-10 rtl:pl-4 text-xs font-semibold text-stone-900 dark:text-gold-100 placeholder-stone-400 dark:placeholder-gold-500/50 outline-none transition"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !locationInput.trim()}
                      className="px-4 py-2.5 bg-[#113f28] hover:bg-emerald-900 text-gold-300 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer border border-gold-400/30 disabled:opacity-50"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span>{isArabic ? "بحث" : "Search"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={detectLocation}
                      disabled={loading || detectingLocation}
                      title={isArabic ? "تحديد موقعي التلقائي" : "Auto-detect my location"}
                      className="p-2.5 bg-gold-400 hover:bg-gold-500 text-emerald-950 rounded-2xl transition flex items-center justify-center cursor-pointer border border-gold-450 disabled:opacity-50 shrink-0"
                    >
                      {detectingLocation ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Compass className="w-4 h-4" />
                      )}
                    </button>
                  </form>

                  {/* Status alerts */}
                  {error && (
                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2.5 animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <p>{error}</p>
                    </div>
                  )}

                  {loading ? (
                    <div className="py-12 flex flex-col items-center justify-center space-y-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-gold-400/20 border-t-gold-400 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center text-xs">🕌</div>
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-stone-600 dark:text-gold-300 animate-pulse">
                          {isArabic ? "جاري الاستخلاص والمطابقة..." : "Grounding prayer times..."}
                        </p>
                      </div>
                    </div>
                  ) : prayerData ? (
                    <div className="space-y-4">
                      {/* Next Prayer Banner */}
                      {nextPrayerName && (
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 to-[#0a2f1c] dark:from-[#032517] dark:to-[#021810] border border-gold-400/40 text-white flex items-center justify-between shadow-md relative overflow-hidden">
                          <div className="absolute right-0 bottom-0 opacity-[0.03] text-gold-400 translate-x-4 translate-y-4">
                            <Clock className="w-32 h-32" />
                          </div>
                          <div className="relative z-10">
                            <div className="flex items-center gap-1.5 text-gold-400 font-bold text-[10px] uppercase tracking-wider mb-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                              <span>{isArabic ? "الصلاة القادمة" : "UPCOMING PRAYER"}</span>
                            </div>
                            <h4 className="text-lg font-black text-gold-250">
                              {nextPrayerName}
                            </h4>
                          </div>
                          <div className="text-right relative z-10">
                            <span className="inline-block text-xs font-mono font-bold bg-gold-400/15 border border-gold-400/35 text-gold-300 px-3 py-1 rounded-xl shadow-sm">
                              {timeRemaining}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Location Info & Date */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 pb-1">
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="text-gold-500">📍</span>
                          <span className="font-bold text-[#113f28] dark:text-gold-300">
                            {prayerData.location}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono font-bold text-stone-500 dark:text-gold-400/70">
                          📅 {prayerData.date}
                        </div>
                      </div>

                      {/* Prayer Times Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { key: "fajr", ar: "الفجر", en: "Fajr", icon: "🌅" },
                          { key: "sunrise", ar: "الشروق", en: "Sunrise", icon: "☀️" },
                          { key: "dhuhr", ar: "الظهر", en: "Dhuhr", icon: "🌞" },
                          { key: "asr", ar: "العصر", en: "Asr", icon: "🌇" },
                          { key: "maghrib", ar: "المغرب", en: "Maghrib", icon: "🌙" },
                          { key: "isha", ar: "العشاء", en: "Isha", icon: "🌌" },
                        ].map((p) => {
                          const value = prayerData.prayerTimes[p.key as keyof typeof prayerData.prayerTimes] || "--:--";
                          const isActive = isCurrentOrNext(p.key);
                          return (
                            <div
                              key={p.key}
                              className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center relative ${
                                isActive
                                  ? "bg-emerald-950/40 border-gold-400 dark:bg-emerald-900/20 text-gold-300 scale-[1.02] shadow-md islamic-glow"
                                  : "bg-white dark:bg-[#032014] border-gold-400/10 dark:border-gold-500/10 hover:border-gold-400/20"
                              }`}
                            >
                              {isActive && (
                                <div className="absolute top-2 right-2 flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gold-400"></span>
                                </div>
                              )}
                              <span className="text-lg mb-1">{p.icon}</span>
                              <span className="text-[10px] font-bold tracking-wider text-stone-500 dark:text-gold-400/70 uppercase">
                                {isArabic ? p.ar : p.en}
                              </span>
                              <span className="text-sm font-mono font-extrabold text-[#113f28] dark:text-gold-200 mt-1">
                                {value}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Metadata */}
                      {prayerData.calculationMethod && (
                        <p className="text-[10px] text-center italic text-stone-500 dark:text-gold-400/50 font-serif pt-1">
                          {isArabic ? "الهيئة الحسابية: " : "Calculation Method: "} {prayerData.calculationMethod}
                        </p>
                      )}

                      {/* Citations */}
                      {prayerData.sources && prayerData.sources.length > 0 && (
                        <div className="pt-3 border-t border-gold-400/10">
                          <p className="text-[10px] font-bold text-stone-500 dark:text-gold-400/60 mb-2 flex items-center gap-1.5 uppercase tracking-wide">
                            🔍 <span>{isArabic ? "مصادر ومطابقات حية:" : "Grounded source citations:"}</span>
                          </p>
                          <div className="flex flex-col gap-1.5">
                            {prayerData.sources.map((src, index) => (
                              <a
                                key={index}
                                href={src.url}
                                target="_blank"
                                referrerPolicy="no-referrer"
                                className="text-[11px] text-emerald-800 dark:text-gold-400 hover:underline flex items-center gap-1.5 truncate max-w-full font-serif"
                              >
                                <ExternalLink className="w-3 h-3 shrink-0 text-gold-500" />
                                <span className="truncate">{src.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-stone-500 dark:text-gold-400/50 space-y-2">
                      <Compass className="w-10 h-10 mx-auto text-gold-400/50" />
                      <p className="text-xs font-semibold">
                        {isArabic ? "يرجى البحث عن مدينة أولاً لتفعيل مواقيت الصلاة والقبلة." : "Please search for a city first to populate times & compass."}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: INTERACTIVE QIBLA COMPASS */}
              {activeTab === "qibla" && (
                <div className="space-y-5 animate-fade-in flex flex-col items-center justify-center py-4">
                  
                  {prayerData && qiblaAngle !== null ? (
                    <div className="w-full text-center space-y-5">
                      
                      <div className="px-4 py-2.5 rounded-2xl bg-gold-400/5 border border-gold-400/20 text-xs text-[#113f28] dark:text-gold-200 inline-block">
                        📍 {isArabic ? "موقعك الحالي:" : "Your Current Location:"}{" "}
                        <span className="font-bold">{prayerData.location}</span>
                        {prayerData.latitude && prayerData.longitude && (
                          <div className="font-mono text-[10px] text-stone-500 dark:text-gold-400/60 mt-0.5">
                            {prayerData.latitude.toFixed(4)}°N, {prayerData.longitude.toFixed(4)}°E
                          </div>
                        )}
                      </div>

                      {/* Mobile Sensor Request Permission */}
                      {!orientationPermissionGranted && (
                        <div className="w-full max-w-xs mx-auto">
                          <button
                            onClick={requestOrientationPermission}
                            className="w-full py-2 bg-gold-400 hover:bg-gold-500 text-emerald-950 font-bold text-xs rounded-xl transition cursor-pointer"
                          >
                            📱 {isArabic ? "تفعيل مستشعرات الهاتف للبوصلة الحية" : "Activate mobile compass sensors"}
                          </button>
                        </div>
                      )}

                      {/* Visual Compass Canvas */}
                      <div className="relative w-64 h-64 mx-auto flex items-center justify-center">
                        
                        {/* Compass Frame & Ring */}
                        <div className="absolute inset-0 rounded-full border-4 border-gold-400/30 dark:border-gold-400/20 bg-stone-50 dark:bg-[#031d13] shadow-inner flex items-center justify-center">
                          
                          {/* Inner Circle ornament */}
                          <div className="w-52 h-52 rounded-full border border-gold-400/10 flex items-center justify-center relative">
                            {/* Kaaba Center Icon (always at targetQiblaRotation relative to dial) */}
                            <motion.div
                              animate={{ rotate: targetQiblaRotation }}
                              transition={{ type: "spring", stiffness: 60, damping: 15 }}
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            >
                              {/* Glowing Golden Pointer to Kaaba */}
                              <div className="absolute top-1 flex flex-col items-center">
                                <span className="text-xl leading-none select-none z-10 animate-bounce">🕋</span>
                                <div className="w-1.5 h-16 bg-gradient-to-b from-amber-400 to-transparent rounded-full shadow-lg" />
                              </div>
                            </motion.div>
                          </div>
                        </div>

                        {/* Dial with Directions (N, E, S, W) - rotates based on deviceHeading */}
                        <motion.div
                          animate={{ rotate: finalCompassAngle }}
                          transition={{ type: "spring", stiffness: 60, damping: 15 }}
                          className="absolute inset-0 w-full h-full pointer-events-none flex items-center justify-center text-xs font-serif font-black text-stone-400 dark:text-gold-400/40"
                        >
                          <span className="absolute top-4 text-rose-600 dark:text-rose-500 font-extrabold">N (الشمال)</span>
                          <span className="absolute right-4">E (الشرق)</span>
                          <span className="absolute bottom-4">S (الجنوب)</span>
                          <span className="absolute left-4">W (الغرب)</span>
                          
                          {/* Subtle compass lines */}
                          <div className="w-full h-[1px] bg-stone-300/30 dark:bg-gold-400/5 absolute" />
                          <div className="h-full w-[1px] bg-stone-300/30 dark:bg-gold-400/5 absolute" />
                        </motion.div>

                        {/* Exact Center Pin */}
                        <div className="absolute w-4 h-4 bg-emerald-950 dark:bg-gold-400 border border-gold-400 rounded-full shadow-md z-10" />
                      </div>

                      {/* Display Info */}
                      <div className="space-y-1.5 max-w-sm mx-auto">
                        <p className="text-sm font-black text-[#113f28] dark:text-gold-250 font-serif">
                          {isArabic ? `اتجاه القبلة: ${qiblaAngle.toFixed(1)}° درجة` : `Qibla Angle: ${qiblaAngle.toFixed(1)}°`}
                        </p>
                        <p className="text-[11px] text-stone-500 dark:text-gold-400/60 font-serif leading-relaxed">
                          {isArabic 
                            ? "الكعبة تقع بزاوية انحراف عن الشمال الحقيقي بمقدار الموضح أعلاه. يرجى محاذاة سهم الكعبة 🕋 مع الأعلى لتحديد وجهتك." 
                            : "The Kaaba is located at the angle shown relative to True North. Align the Kaaba icon 🕋 to the top center to face the exact direction."}
                        </p>

                        {/* Manual rotation simulation slider for desktop */}
                        {!hasCompassSensor && (
                          <div className="pt-3 border-t border-gold-400/10 space-y-1">
                            <label className="text-[10px] font-bold text-stone-500 dark:text-gold-400/60 uppercase block">
                              ⚙️ {isArabic ? "محاكاة تدوير الهاتف يدوياً (لأجهزة الكمبيوتر)" : "Simulate compass rotation (for Desktop)"}
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="360"
                              value={manualRotation}
                              onChange={(e) => setManualRotation(parseInt(e.target.value))}
                              className="w-full h-1 bg-stone-200 dark:bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-gold-400"
                            />
                            <div className="flex justify-between text-[9px] font-mono text-stone-400 dark:text-gold-500/40">
                              <span>0°</span>
                              <span>{manualRotation}° {isArabic ? "دوران" : "heading"}</span>
                              <span>360°</span>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  ) : (
                    <div className="py-12 text-center text-stone-500 dark:text-gold-400/50 space-y-3">
                      <Compass className="w-12 h-12 mx-auto text-gold-400/40 animate-spin" />
                      <p className="text-xs font-bold">
                        {isArabic ? "الرجاء البحث وتحديد موقعك أولاً لحساب القبلة." : "Please search/set your city first to calculate the Qibla angle."}
                      </p>
                    </div>
                  )}

                </div>
              )}

              {/* Tab 3: ADHAN AUDIO ALERTS */}
              {activeTab === "alerts" && (
                <div className="space-y-5 animate-fade-in">
                  
                  {/* Enable Alerts Card */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#032014] border-2 border-gold-400/20 flex items-center justify-between shadow-sm">
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-black text-[#113f28] dark:text-gold-250 font-serif">
                        {isArabic ? "التنبيهات الصوتية للصلوات" : "Audio Prayer Alerts"}
                      </h4>
                      <p className="text-[10px] text-stone-500 dark:text-gold-400/60 leading-tight">
                        {isArabic ? "تشغيل صوت الأذان تلقائياً عند حلول موعد الصلاة" : "Play the Adhan automatically when prayer time starts"}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleAlerts(!alertsEnabled)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        alertsEnabled ? "bg-[#113f28] dark:bg-gold-400" : "bg-stone-300 dark:bg-emerald-950"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white dark:bg-[#021810] shadow ring-0 transition duration-200 ease-in-out ${
                          alertsEnabled ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {alertsEnabled && (
                    <div className="space-y-4 animate-fade-in">
                      
                      {/* Audio Alert Settings */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-500 dark:text-gold-400/60 uppercase tracking-wide">
                          🎵 {isArabic ? "اختر صوت الأذان المفضّل:" : "Choose your favorite Adhan:"}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { 
                              name: isArabic ? "أذان المسجد الحرام (مكي)" : "Makkah Al-Haram Adhan", 
                              url: "https://www.islamcan.com/audio/adhan/azan2.mp3",
                              desc: isArabic ? "صوت روحاني عذب من الحرم المكي" : "Spiritual voice from Makkah"
                            },
                            { 
                              name: isArabic ? "أذان المسجد النبوي (مدني)" : "Madinah Adhan", 
                              url: "https://www.islamcan.com/audio/adhan/azan1.mp3",
                              desc: isArabic ? "صوت ندي هادئ من طيبة الطيبة" : "Serene voice from Madinah"
                            }
                          ].map((sound) => (
                            <button
                              key={sound.url}
                              onClick={() => changeAdhanSound(sound.url)}
                              className={`p-3 rounded-xl border-2 text-right rtl:text-right ltr:text-left transition-all cursor-pointer flex flex-col justify-center ${
                                selectedAdhan === sound.url
                                  ? "bg-emerald-950/20 dark:bg-emerald-900/10 border-gold-400 text-gold-300"
                                  : "bg-white dark:bg-[#032014] border-gold-400/10 hover:border-gold-400/20 text-stone-700 dark:text-gold-200"
                              }`}
                            >
                              <span className="text-xs font-bold font-serif">{sound.name}</span>
                              <span className="text-[9px] text-stone-400 dark:text-gold-400/50 mt-0.5">{sound.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Notification Alert Type */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-stone-500 dark:text-gold-400/60 uppercase tracking-wide">
                          ⏰ {isArabic ? "نوع التنبيه المسموع:" : "Audio Alert Length:"}
                        </label>
                        <div className="grid grid-cols-2 gap-2.5">
                          {[
                            { 
                              id: "takbeer", 
                              ar: "بداية الأذان (التكبير فقط)", 
                              en: "Takbeer Start Only",
                              desc: isArabic ? "يردد التكبيرات الأولى (18 ثانية)" : "First Takbeerat only (18s)"
                            },
                            { 
                              id: "full", 
                              ar: "الأذان كاملاً", 
                              en: "Full Adhan",
                              desc: isArabic ? "تشغيل صوت الأذان بالكامل" : "Plays the full Adhan sound"
                            }
                          ].map((type) => (
                            <button
                              key={type.id}
                              onClick={() => changeAlertType(type.id as "full" | "takbeer")}
                              className={`p-3 rounded-xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center ${
                                alertType === type.id
                                  ? "bg-emerald-950/20 dark:bg-emerald-900/10 border-gold-400 text-gold-300"
                                  : "bg-white dark:bg-[#032014] border-gold-400/10 hover:border-gold-400/20 text-stone-700 dark:text-gold-200"
                              }`}
                            >
                              <span className="text-xs font-bold font-serif">{isArabic ? type.ar : type.en}</span>
                              <span className="text-[9px] text-stone-400 dark:text-gold-400/50 mt-0.5">{type.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Test Player controls */}
                      <div className="p-4 rounded-xl bg-gold-400/5 border border-gold-400/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <h5 className="text-xs font-bold text-[#113f28] dark:text-gold-300 font-serif">
                            {isArabic ? "تجريب واختبار الصوت" : "Test Adhan Alert Volume"}
                          </h5>
                          <p className="text-[10px] text-stone-500 dark:text-gold-400/50">
                            {isArabic ? "اضغط للاستماع للتنبيه الآن والتأكد من مستوى الصوت" : "Click to test playback level and hear selected alert"}
                          </p>
                        </div>
                        <button
                          onClick={playTestAudio}
                          className="px-4 py-2 bg-[#113f28] hover:bg-emerald-900 text-gold-250 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-gold-400/30"
                        >
                          {isPlayingTest ? (
                            <>
                              <Square className="w-3.5 h-3.5 fill-gold-250 text-gold-250" />
                              <span>{isArabic ? "إيقاف الاختبار" : "Stop Test"}</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5 fill-gold-250 text-gold-250" />
                              <span>{isArabic ? "تشغيل تجريبي" : "Play Test"}</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Instructions for Background Play */}
                      <div className="p-4 rounded-xl bg-emerald-950/20 dark:bg-emerald-950/10 border border-gold-400/10 text-stone-600 dark:text-gold-300 space-y-1.5 text-[11px] font-serif leading-relaxed">
                        <div className="flex items-center gap-1 font-bold text-[#113f28] dark:text-gold-250">
                          <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                          <span>{isArabic ? "كيف يعمل التنبيه التلقائي؟" : "How does the automatic alert work?"}</span>
                        </div>
                        <p>
                          {isArabic 
                            ? "١. تأكد من إبقاء تطبيق المصحف الشريف مفتوحاً في متصفحك." 
                            : "1. Make sure to keep this Quran web application open in a browser tab."}
                        </p>
                        <p>
                          {isArabic 
                            ? "٢. سيتعرف التطبيق ذكياً على وقت الصلاة في الخلفية ويطلق صوت الأذان/التكبير المختار مع ظهور نافذة تنبيه على الشاشة." 
                            : "2. The app will securely detect the prayer time in the background and trigger the chosen sound along with an on-screen alert banner."}
                        </p>
                        <p className="text-[10px] text-amber-600 dark:text-amber-400 italic">
                          ⚠️ {isArabic 
                            ? "ملاحظة: تتطلب المتصفحات الحديثة تفاعلك الأول مع الصفحة مرة واحدة (أي نقرة) لتسمح بتشغيل الأصوات تلقائياً." 
                            : "Note: Modern browsers require you to click once on the page before they permit automated audio playback."}
                        </p>
                      </div>

                    </div>
                  )}

                  {!alertsEnabled && (
                    <div className="py-8 text-center text-stone-400 dark:text-gold-400/40 space-y-2">
                      <VolumeX className="w-10 h-10 mx-auto opacity-50" />
                      <p className="text-xs">
                        {isArabic ? "التنبيهات الصوتية معطلة حالياً." : "Audio alerts are currently disabled."}
                      </p>
                    </div>
                  )}

                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
