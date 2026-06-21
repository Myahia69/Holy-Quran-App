/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Local Static Fallback Database of the Holy Quran Chapters & Popular Verses
 * Designed for perfect runtime resilience against network failure or API throttling.
 */

import { Chapter, Verse } from '../types';

export const FALLBACK_CHAPTERS: Chapter[] = [
  {
    id: 1,
    name_complex: "Al-Fatihah",
    name_arabic: "الفاتحة",
    verses_count: 7,
    revelation_place: "makkah",
    revelation_order: 5,
    bismillah_pre: false,
    translated_name: { language_name: "english", name: "The Opening" }
  },
  {
    id: 2,
    name_complex: "Al-Baqarah",
    name_arabic: "البقرة",
    verses_count: 286,
    revelation_place: "madinah",
    revelation_order: 87,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Cow" }
  },
  {
    id: 3,
    name_complex: "Ali 'Imran",
    name_arabic: "آل عمران",
    verses_count: 200,
    revelation_place: "madinah",
    revelation_order: 89,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Family of Imran" }
  },
  {
    id: 4,
    name_complex: "An-Nisa",
    name_arabic: "النساء",
    verses_count: 176,
    revelation_place: "madinah",
    revelation_order: 92,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Women" }
  },
  {
    id: 5,
    name_complex: "Al-Ma'idah",
    name_arabic: "المائدة",
    verses_count: 120,
    revelation_place: "madinah",
    revelation_order: 112,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Table Spread" }
  },
  {
    id: 6,
    name_complex: "Al-An'am",
    name_arabic: "الأنعام",
    verses_count: 165,
    revelation_place: "makkah",
    revelation_order: 55,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Cattle" }
  },
  {
    id: 7,
    name_complex: "Al-A'raf",
    name_arabic: "الأعراف",
    verses_count: 206,
    revelation_place: "makkah",
    revelation_order: 39,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Heights" }
  },
  {
    id: 8,
    name_complex: "Al-Anfal",
    name_arabic: "الأنفال",
    verses_count: 75,
    revelation_place: "madinah",
    revelation_order: 88,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Spoils of War" }
  },
  {
    id: 9,
    name_complex: "At-Tawbah",
    name_arabic: "التوبة",
    verses_count: 129,
    revelation_place: "madinah",
    revelation_order: 113,
    bismillah_pre: false,
    translated_name: { language_name: "english", name: "The Repentance" }
  },
  {
    id: 10,
    name_complex: "Yunus",
    name_arabic: "يونس",
    verses_count: 109,
    revelation_place: "makkah",
    revelation_order: 51,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Jonah" }
  },
  {
    id: 11,
    name_complex: "Hud",
    name_arabic: "هود",
    verses_count: 123,
    revelation_place: "makkah",
    revelation_order: 52,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Hud" }
  },
  {
    id: 12,
    name_complex: "Yusuf",
    name_arabic: "يوسف",
    verses_count: 111,
    revelation_place: "makkah",
    revelation_order: 53,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Joseph" }
  },
  {
    id: 13,
    name_complex: "Ar-Ra'd",
    name_arabic: "الرعد",
    verses_count: 43,
    revelation_place: "madinah",
    revelation_order: 96,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Thunder" }
  },
  {
    id: 14,
    name_complex: "Ibrahim",
    name_arabic: "ابراهيم",
    verses_count: 52,
    revelation_place: "makkah",
    revelation_order: 72,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Abraham" }
  },
  {
    id: 15,
    name_complex: "Al-Hijr",
    name_arabic: "الحجر",
    verses_count: 99,
    revelation_place: "makkah",
    revelation_order: 54,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Rocky Tract" }
  },
  {
    id: 16,
    name_complex: "An-Nahl",
    name_arabic: "النحل",
    verses_count: 128,
    revelation_place: "makkah",
    revelation_order: 70,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Bee" }
  },
  {
    id: 17,
    name_complex: "Al-Isra",
    name_arabic: "الإسراء",
    verses_count: 111,
    revelation_place: "makkah",
    revelation_order: 50,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Night Journey" }
  },
  {
    id: 18,
    name_complex: "Al-Kahf",
    name_arabic: "الكهف",
    verses_count: 110,
    revelation_place: "makkah",
    revelation_order: 69,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Cave" }
  },
  {
    id: 19,
    name_complex: "Maryam",
    name_arabic: "مريم",
    verses_count: 98,
    revelation_place: "makkah",
    revelation_order: 44,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Mary" }
  },
  {
    id: 20,
    name_complex: "Taha",
    name_arabic: "طه",
    verses_count: 135,
    revelation_place: "makkah",
    revelation_order: 45,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Ta-Ha" }
  },
  {
    id: 21,
    name_complex: "Al-Anbya",
    name_arabic: "الأنبياء",
    verses_count: 112,
    revelation_place: "makkah",
    revelation_order: 73,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Prophets" }
  },
  {
    id: 22,
    name_complex: "Al-Hajj",
    name_arabic: "الحج",
    verses_count: 78,
    revelation_place: "madinah",
    revelation_order: 103,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Pilgrimage" }
  },
  {
    id: 23,
    name_complex: "Al-Mu'minun",
    name_arabic: "المؤمنون",
    verses_count: 118,
    revelation_place: "makkah",
    revelation_order: 74,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Believers" }
  },
  {
    id: 24,
    name_complex: "An-Nur",
    name_arabic: "النور",
    verses_count: 64,
    revelation_place: "madinah",
    revelation_order: 102,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Light" }
  },
  {
    id: 25,
    name_complex: "Al-Furqan",
    name_arabic: "الفرقان",
    verses_count: 77,
    revelation_place: "makkah",
    revelation_order: 42,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Criterion" }
  },
  {
    id: 26,
    name_complex: "Ash-Shu'ara",
    name_arabic: "الشعراء",
    verses_count: 227,
    revelation_place: "makkah",
    revelation_order: 47,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Poets" }
  },
  {
    id: 27,
    name_complex: "An-Naml",
    name_arabic: "النمل",
    verses_count: 93,
    revelation_place: "makkah",
    revelation_order: 48,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Ant" }
  },
  {
    id: 28,
    name_complex: "Al-Qasas",
    name_arabic: "القصص",
    verses_count: 88,
    revelation_place: "makkah",
    revelation_order: 49,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Stories" }
  },
  {
    id: 29,
    name_complex: "Al-'Ankabut",
    name_arabic: "العنكبوت",
    verses_count: 69,
    revelation_place: "makkah",
    revelation_order: 81,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Spider" }
  },
  {
    id: 30,
    name_complex: "Ar-Rum",
    name_arabic: "الروم",
    verses_count: 60,
    revelation_place: "makkah",
    revelation_order: 84,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Romans" }
  },
  {
    id: 31,
    name_complex: "Luqman",
    name_arabic: "لقمان",
    verses_count: 34,
    revelation_place: "makkah",
    revelation_order: 57,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Luqman" }
  },
  {
    id: 32,
    name_complex: "As-Sajdah",
    name_arabic: "السجدة",
    verses_count: 30,
    revelation_place: "makkah",
    revelation_order: 75,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Prostration" }
  },
  {
    id: 33,
    name_complex: "Al-Ahzab",
    name_arabic: "الأحزاب",
    verses_count: 73,
    revelation_place: "madinah",
    revelation_order: 90,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Combined Forces" }
  },
  {
    id: 34,
    name_complex: "Saba",
    name_arabic: "سبإ",
    verses_count: 54,
    revelation_place: "makkah",
    revelation_order: 58,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Sheba" }
  },
  {
    id: 35,
    name_complex: "Fatir",
    name_arabic: "فاطر",
    verses_count: 45,
    revelation_place: "makkah",
    revelation_order: 43,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Originator" }
  },
  {
    id: 36,
    name_complex: "Ya-Sin",
    name_arabic: "يس",
    verses_count: 83,
    revelation_place: "makkah",
    revelation_order: 41,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Ya-Sin" }
  },
  {
    id: 37,
    name_complex: "As-Saffat",
    name_arabic: "الصافات",
    verses_count: 182,
    revelation_place: "makkah",
    revelation_order: 56,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Those who set the Ranks" }
  },
  {
    id: 38,
    name_complex: "Sad",
    name_arabic: "ص",
    verses_count: 88,
    revelation_place: "makkah",
    revelation_order: 38,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Letter Sad" }
  },
  {
    id: 39,
    name_complex: "Az-Zumar",
    name_arabic: "الزمر",
    verses_count: 75,
    revelation_place: "makkah",
    revelation_order: 59,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Troops" }
  },
  {
    id: 40,
    name_complex: "Ghafir",
    name_arabic: "غافر",
    verses_count: 85,
    revelation_place: "makkah",
    revelation_order: 60,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Forgiver" }
  },
  {
    id: 41,
    name_complex: "Fussilat",
    name_arabic: "فصلت",
    verses_count: 54,
    revelation_place: "makkah",
    revelation_order: 61,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Explained in Detail" }
  },
  {
    id: 42,
    name_complex: "Ash-Shura",
    name_arabic: "الشورى",
    verses_count: 53,
    revelation_place: "makkah",
    revelation_order: 62,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Consultation" }
  },
  {
    id: 43,
    name_complex: "Az-Zukhruf",
    name_arabic: "الزخرف",
    verses_count: 89,
    revelation_place: "makkah",
    revelation_order: 63,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Ornaments of Gold" }
  },
  {
    id: 44,
    name_complex: "Ad-Dukhan",
    name_arabic: "الدخان",
    verses_count: 59,
    revelation_place: "makkah",
    revelation_order: 64,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Smoke" }
  },
  {
    id: 45,
    name_complex: "Al-Jathiyah",
    name_arabic: "الجاثية",
    verses_count: 37,
    revelation_place: "makkah",
    revelation_order: 65,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Crouching" }
  },
  {
    id: 46,
    name_complex: "Al-Ahqaf",
    name_arabic: "الأحقاف",
    verses_count: 35,
    revelation_place: "makkah",
    revelation_order: 66,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Wind-Curved Sandhills" }
  },
  {
    id: 47,
    name_complex: "Muhammad",
    name_arabic: "محمد",
    verses_count: 38,
    revelation_place: "madinah",
    revelation_order: 95,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Muhammad" }
  },
  {
    id: 48,
    name_complex: "Al-Fath",
    name_arabic: "الفتح",
    verses_count: 29,
    revelation_place: "madinah",
    revelation_order: 111,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Victory" }
  },
  {
    id: 49,
    name_complex: "Al-Hujurat",
    name_arabic: "الحجرات",
    verses_count: 18,
    revelation_place: "madinah",
    revelation_order: 106,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Rooms" }
  },
  {
    id: 50,
    name_complex: "Qaf",
    name_arabic: "ق",
    verses_count: 45,
    revelation_place: "makkah",
    revelation_order: 34,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Letter Qaf" }
  },
  {
    id: 51,
    name_complex: "Adh-Dhariyat",
    name_arabic: "الذاريات",
    verses_count: 60,
    revelation_place: "makkah",
    revelation_order: 67,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Winnowing Winds" }
  },
  {
    id: 52,
    name_complex: "At-Tur",
    name_arabic: "الطور",
    verses_count: 49,
    revelation_place: "makkah",
    revelation_order: 76,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Mount" }
  },
  {
    id: 53,
    name_complex: "An-Najm",
    name_arabic: "النجم",
    verses_count: 62,
    revelation_place: "makkah",
    revelation_order: 23,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Star" }
  },
  {
    id: 54,
    name_complex: "Al-Qamar",
    name_arabic: "القمر",
    verses_count: 55,
    revelation_place: "makkah",
    revelation_order: 37,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Moon" }
  },
  {
    id: 55,
    name_complex: "Ar-Rahman",
    name_arabic: "الرحمن",
    verses_count: 78,
    revelation_place: "makkah",
    revelation_order: 97,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Beneficent" }
  },
  {
    id: 56,
    name_complex: "Al-Waqi'ah",
    name_arabic: "الواقعة",
    verses_count: 96,
    revelation_place: "makkah",
    revelation_order: 46,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Inevitable" }
  },
  {
    id: 57,
    name_complex: "Al-Hadid",
    name_arabic: "الحديد",
    verses_count: 29,
    revelation_place: "madinah",
    revelation_order: 94,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Iron" }
  },
  {
    id: 58,
    name_complex: "Al-Mujadilah",
    name_arabic: "المجادلة",
    verses_count: 22,
    revelation_place: "madinah",
    revelation_order: 105,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Pleading Woman" }
  },
  {
    id: 59,
    name_complex: "Al-Hashr",
    name_arabic: "الحشر",
    verses_count: 24,
    revelation_place: "madinah",
    revelation_order: 101,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Exile" }
  },
  {
    id: 60,
    name_complex: "Al-Mumtahanah",
    name_arabic: "الممتحنة",
    verses_count: 13,
    revelation_place: "madinah",
    revelation_order: 91,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "She that is to be examined" }
  },
  {
    id: 61,
    name_complex: "As-Saff",
    name_arabic: "الصف",
    verses_count: 14,
    revelation_place: "madinah",
    revelation_order: 109,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Ranks" }
  },
  {
    id: 62,
    name_complex: "Al-Jumu'ah",
    name_arabic: "الجمعة",
    verses_count: 11,
    revelation_place: "madinah",
    revelation_order: 110,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Congregation" }
  },
  {
    id: 63,
    name_complex: "Al-Munafiqun",
    name_arabic: "المنافقون",
    verses_count: 11,
    revelation_place: "madinah",
    revelation_order: 104,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Hypocrites" }
  },
  {
    id: 64,
    name_complex: "At-Taghabun",
    name_arabic: "التغابن",
    verses_count: 18,
    revelation_place: "madinah",
    revelation_order: 108,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Mutual Disillusion" }
  },
  {
    id: 65,
    name_complex: "At-Talaq",
    name_arabic: "الطلاق",
    verses_count: 12,
    revelation_place: "madinah",
    revelation_order: 99,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Divorce" }
  },
  {
    id: 66,
    name_complex: "Al-Tahrim",
    name_arabic: "التحريم",
    verses_count: 12,
    revelation_place: "madinah",
    revelation_order: 107,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Prohibition" }
  },
  {
    id: 67,
    name_complex: "Al-Mulk",
    name_arabic: "الملك",
    verses_count: 30,
    revelation_place: "makkah",
    revelation_order: 77,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Sovereignty" }
  },
  {
    id: 68,
    name_complex: "Al-Qalam",
    name_arabic: "القلم",
    verses_count: 52,
    revelation_place: "makkah",
    revelation_order: 2,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Pen" }
  },
  {
    id: 69,
    name_complex: "Al-Haqqah",
    name_arabic: "الحاقة",
    verses_count: 52,
    revelation_place: "makkah",
    revelation_order: 78,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Reality" }
  },
  {
    id: 70,
    name_complex: "Al-Ma'arij",
    name_arabic: "المعارج",
    verses_count: 44,
    revelation_place: "makkah",
    revelation_order: 79,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Ascending Stairways" }
  },
  {
    id: 71,
    name_complex: "Nuh",
    name_arabic: "نوح",
    verses_count: 28,
    revelation_place: "makkah",
    revelation_order: 71,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Noah" }
  },
  {
    id: 72,
    name_complex: "Al-Jinn",
    name_arabic: "الجن",
    verses_count: 28,
    revelation_place: "makkah",
    revelation_order: 40,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Jinn" }
  },
  {
    id: 73,
    name_complex: "Al-Muzzammil",
    name_arabic: "المزمل",
    verses_count: 20,
    revelation_place: "makkah",
    revelation_order: 3,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Enshrouded One" }
  },
  {
    id: 74,
    name_complex: "Al-Muddaththir",
    name_arabic: "المدثر",
    verses_count: 56,
    revelation_place: "makkah",
    revelation_order: 4,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Cloaked One" }
  },
  {
    id: 75,
    name_complex: "Al-Qiyamah",
    name_arabic: "القيامة",
    verses_count: 40,
    revelation_place: "makkah",
    revelation_order: 31,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Resurrection" }
  },
  {
    id: 76,
    name_complex: "Al-Insan",
    name_arabic: "الانسان",
    verses_count: 31,
    revelation_place: "madinah",
    revelation_order: 98,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Man" }
  },
  {
    id: 77,
    name_complex: "Al-Mursalat",
    name_arabic: "المرسلات",
    verses_count: 50,
    revelation_place: "makkah",
    revelation_order: 33,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Emissaries" }
  },
  {
    id: 78,
    name_complex: "An-Naba",
    name_arabic: "النبإ",
    verses_count: 40,
    revelation_place: "makkah",
    revelation_order: 80,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Tidings" }
  },
  {
    id: 79,
    name_complex: "An-Nazi'at",
    name_arabic: "النازعات",
    verses_count: 46,
    revelation_place: "makkah",
    revelation_order: 81,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Those who drag forth" }
  },
  {
    id: 80,
    name_complex: "'Abasa",
    name_arabic: "عبس",
    verses_count: 42,
    revelation_place: "makkah",
    revelation_order: 24,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "He Frowned" }
  },
  {
    id: 81,
    name_complex: "At-Takwir",
    name_arabic: "التكوير",
    verses_count: 29,
    revelation_place: "makkah",
    revelation_order: 7,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Overthrowing" }
  },
  {
    id: 82,
    name_complex: "Al-Infitar",
    name_arabic: "الانفطار",
    verses_count: 19,
    revelation_place: "makkah",
    revelation_order: 82,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Cleaving" }
  },
  {
    id: 83,
    name_complex: "Al-Mutaffifin",
    name_arabic: "المطففين",
    verses_count: 36,
    revelation_place: "makkah",
    revelation_order: 86,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Defrauding" }
  },
  {
    id: 84,
    name_complex: "Al-Inshiqaq",
    name_arabic: "الانشقاق",
    verses_count: 25,
    revelation_place: "makkah",
    revelation_order: 83,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Sundering" }
  },
  {
    id: 85,
    name_complex: "Al-Buruj",
    name_arabic: "البروج",
    verses_count: 22,
    revelation_place: "makkah",
    revelation_order: 27,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Mansions of the Stars" }
  },
  {
    id: 86,
    name_complex: "At-Tariq",
    name_arabic: "الطارق",
    verses_count: 17,
    revelation_place: "makkah",
    revelation_order: 36,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Nightcomer" }
  },
  {
    id: 87,
    name_complex: "Al-A'la",
    name_arabic: "الأعلى",
    verses_count: 19,
    revelation_place: "makkah",
    revelation_order: 8,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Most High" }
  },
  {
    id: 88,
    name_complex: "Al-Ghashiyah",
    name_arabic: "الغاشية",
    verses_count: 26,
    revelation_place: "makkah",
    revelation_order: 68,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Overwhelming" }
  },
  {
    id: 89,
    name_complex: "Al-Fajr",
    name_arabic: "الفجر",
    verses_count: 30,
    revelation_place: "makkah",
    revelation_order: 10,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Dawn" }
  },
  {
    id: 90,
    name_complex: "Al-Balad",
    name_arabic: "البلد",
    verses_count: 20,
    revelation_place: "makkah",
    revelation_order: 35,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The City" }
  },
  {
    id: 91,
    name_complex: "Ash-Shams",
    name_arabic: "الشمس",
    verses_count: 15,
    revelation_place: "makkah",
    revelation_order: 26,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Sun" }
  },
  {
    id: 92,
    name_complex: "Al-Layl",
    name_arabic: "الليل",
    verses_count: 21,
    revelation_place: "makkah",
    revelation_order: 9,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Night" }
  },
  {
    id: 93,
    name_complex: "Ad-Duha",
    name_arabic: "الضحى",
    verses_count: 11,
    revelation_place: "makkah",
    revelation_order: 11,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Morning Hours" }
  },
  {
    id: 94,
    name_complex: "Ash-Sharh",
    name_arabic: "الشرح",
    verses_count: 8,
    revelation_place: "makkah",
    revelation_order: 12,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Relief" }
  },
  {
    id: 95,
    name_complex: "At-Tin",
    name_arabic: "التين",
    verses_count: 8,
    revelation_place: "makkah",
    revelation_order: 28,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Fig" }
  },
  {
    id: 96,
    name_complex: "Al-'Alaq",
    name_arabic: "العلق",
    verses_count: 19,
    revelation_place: "makkah",
    revelation_order: 1,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Clot" }
  },
  {
    id: 97,
    name_complex: "Al-Qadr",
    name_arabic: "القدر",
    verses_count: 5,
    revelation_place: "makkah",
    revelation_order: 25,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Power" }
  },
  {
    id: 98,
    name_complex: "Al-Bayyinah",
    name_arabic: "البينة",
    verses_count: 8,
    revelation_place: "madinah",
    revelation_order: 100,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Clear Proof" }
  },
  {
    id: 99,
    name_complex: "Az-Zalzalah",
    name_arabic: "الزلزلة",
    verses_count: 8,
    revelation_place: "madinah",
    revelation_order: 93,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Earthquake" }
  },
  {
    id: 100,
    name_complex: "Al-'Adiyat",
    name_arabic: "العاديات",
    verses_count: 11,
    revelation_place: "makkah",
    revelation_order: 14,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Courser" }
  },
  {
    id: 101,
    name_complex: "Al-Qari'ah",
    name_arabic: "القارعة",
    verses_count: 11,
    revelation_place: "makkah",
    revelation_order: 30,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Calamity" }
  },
  {
    id: 102,
    name_complex: "At-Takathur",
    name_arabic: "التكاثر",
    verses_count: 8,
    revelation_place: "makkah",
    revelation_order: 16,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Rivalry in world increase" }
  },
  {
    id: 103,
    name_complex: "Al-'Asr",
    name_arabic: "العصر",
    verses_count: 3,
    revelation_place: "makkah",
    revelation_order: 13,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Declining Day" }
  },
  {
    id: 104,
    name_complex: "Al-Humazah",
    name_arabic: "الهمزة",
    verses_count: 9,
    revelation_place: "makkah",
    revelation_order: 32,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Traducer" }
  },
  {
    id: 105,
    name_complex: "Al-Fil",
    name_arabic: "الفيل",
    verses_count: 5,
    revelation_place: "makkah",
    revelation_order: 19,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Elephant" }
  },
  {
    id: 106,
    name_complex: "Quraysh",
    name_arabic: "قريش",
    verses_count: 4,
    revelation_place: "makkah",
    revelation_order: 29,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Quraysh" }
  },
  {
    id: 107,
    name_complex: "Al-Ma'un",
    name_arabic: "الماعون",
    verses_count: 7,
    revelation_place: "makkah",
    revelation_order: 17,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Small Kindnesses" }
  },
  {
    id: 108,
    name_complex: "Al-Kawthar",
    name_arabic: "الكوثر",
    verses_count: 3,
    revelation_place: "makkah",
    revelation_order: 15,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Abundance" }
  },
  {
    id: 109,
    name_complex: "Al-Kafirun",
    name_arabic: "الكافرون",
    verses_count: 6,
    revelation_place: "makkah",
    revelation_order: 18,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Disbelievers" }
  },
  {
    id: 110,
    name_complex: "An-Nasr",
    name_arabic: "النصر",
    verses_count: 3,
    revelation_place: "madinah",
    revelation_order: 114,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Divine Support" }
  },
  {
    id: 111,
    name_complex: "Al-Masad",
    name_arabic: "المسد",
    verses_count: 5,
    revelation_place: "makkah",
    revelation_order: 6,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Palm Fiber" }
  },
  {
    id: 112,
    name_complex: "Al-Ikhlas",
    name_arabic: "الإخلاص",
    verses_count: 4,
    revelation_place: "makkah",
    revelation_order: 22,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Sincerity" }
  },
  {
    id: 113,
    name_complex: "Al-Falaq",
    name_arabic: "الفلق",
    verses_count: 5,
    revelation_place: "makkah",
    revelation_order: 20,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "The Daybreak" }
  },
  {
    id: 114,
    name_complex: "An-Nas",
    name_arabic: "الناس",
    verses_count: 6,
    revelation_place: "makkah",
    revelation_order: 21,
    bismillah_pre: true,
    translated_name: { language_name: "english", name: "Mankind" }
  }
];

// Offline fallback verses for extremely popular shorter Surahs
export const OFFLINE_VERSES_CACHE: Record<number, Verse[]> = {
  // Surah Al-Fatihah (1)
  1: [
    {
      id: 1,
      verse_number: 1,
      verse_key: "1:1",
      juz_number: 1,
      text_uthmani: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translations: [{ id: 131, resource_id: 131, text: "In the name of Allah, the Most Compassionate, the Most Merciful." }]
    },
    {
      id: 2,
      verse_number: 2,
      verse_key: "1:2",
      juz_number: 1,
      text_uthmani: "ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ",
      translations: [{ id: 131, resource_id: 131, text: "All praise is for Allah—Lord of all worlds," }]
    },
    {
      id: 3,
      verse_number: 3,
      verse_key: "1:3",
      juz_number: 1,
      text_uthmani: "ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
      translations: [{ id: 131, resource_id: 131, text: "the Most Compassionate, the Most Merciful," }]
    },
    {
      id: 4,
      verse_number: 4,
      verse_key: "1:4",
      juz_number: 1,
      text_uthmani: "مَٰلِكِ يَوْمِ ٱلدِّينِ",
      translations: [{ id: 131, resource_id: 131, text: "Master of the Day of Judgment." }]
    },
    {
      id: 5,
      verse_number: 5,
      verse_key: "1:5",
      juz_number: 1,
      text_uthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
      translations: [{ id: 131, resource_id: 131, text: "You alone we worship and You alone we ask for help." }]
    },
    {
      id: 6,
      verse_number: 6,
      verse_key: "1:6",
      juz_number: 1,
      text_uthmani: "ٱهْدِنَا ٱلصِّرَٰطَ ٱلْمُسْتَقِيمَ",
      translations: [{ id: 131, resource_id: 131, text: "Guide us to the Straight Path," }]
    },
    {
      id: 7,
      verse_number: 7,
      verse_key: "1:7",
      juz_number: 1,
      text_uthmani: "صِرَٰطَ ٱلَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ ٱلْمَغْضُوبِ عَلَيْهِمْ وَلَا ٱلضَّآلِّينَ",
      translations: [{ id: 131, resource_id: 131, text: "the Path of those You have blessed—not those who incurred Your anger, nor those who are astray." }]
    }
  ],
  // Surah Al-Ikhlas (112)
  112: [
    {
      id: 1,
      verse_number: 1,
      verse_key: "112:1",
      juz_number: 30,
      text_uthmani: "قُلْ هُوَ ٱللَّهُ أَحَدٌ",
      translations: [{ id: 131, resource_id: 131, text: "Say, \"He is Allah, [who is] One," }]
    },
    {
      id: 2,
      verse_number: 2,
      verse_key: "112:2",
      juz_number: 30,
      text_uthmani: "ٱللَّهُ ٱلصَّمَدُ",
      translations: [{ id: 131, resource_id: 131, text: "Allah, the Eternal Refuge." }]
    },
    {
      id: 3,
      verse_number: 3,
      verse_key: "112:3",
      juz_number: 30,
      text_uthmani: "لَمْ يَلِدْ وَلَمْ يُولَدْ",
      translations: [{ id: 131, resource_id: 131, text: "He neither begets nor is born," }]
    },
    {
      id: 4,
      verse_number: 4,
      verse_key: "112:4",
      juz_number: 30,
      text_uthmani: "وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌ",
      translations: [{ id: 131, resource_id: 131, text: "Nor is there to Him any equivalent.\"" }]
    }
  ],
  // Surah Al-Kawthar (108)
  108: [
    {
      id: 1,
      verse_number: 1,
      verse_key: "108:1",
      juz_number: 30,
      text_uthmani: "إِنَّآ أَعْطَيْنَٰكَ ٱلْكَوْثَرَ",
      translations: [{ id: 131, resource_id: 131, text: "Indeed, We have granted you, [O Muhammad], al-Kawthar." }]
    },
    {
      id: 2,
      verse_number: 2,
      verse_key: "108:2",
      juz_number: 30,
      text_uthmani: "فَصَلِّ لِرَبِّكَ وَٱنْحَرْ",
      translations: [{ id: 131, resource_id: 131, text: "So pray to your Lord and sacrifice [to Him alone]." }]
    },
    {
      id: 3,
      verse_number: 3,
      verse_key: "108:3",
      juz_number: 30,
      text_uthmani: "إِنَّ شَانِئَكَ هُوَ ٱلْأَبْتَرُ",
      translations: [{ id: 131, resource_id: 131, text: "Indeed, your enemy is the one cut off [from any future good]." }]
    }
  ],
  // Surah An-Nasr (110)
  110: [
    {
      id: 1,
      verse_number: 1,
      verse_key: "110:1",
      juz_number: 30,
      text_uthmani: "إِذَا جَآءَ نَصْرُ ٱللَّهِ وَٱلْفَتْحُ",
      translations: [{ id: 131, resource_id: 131, text: "When the victory of Allah has come and the conquest," }]
    },
    {
      id: 2,
      verse_number: 2,
      verse_key: "110:2",
      juz_number: 30,
      text_uthmani: "وَرَأَيْتَ ٱلنَّاسَ يَدْخُلُونَ فِي دِينِ ٱللَّهِ أَفْوَاجًا",
      translations: [{ id: 131, resource_id: 131, text: "And you see the people entering into the religion of Allah in multitudes," }]
    },
    {
      id: 3,
      verse_number: 3,
      verse_key: "110:3",
      juz_number: 30,
      text_uthmani: "فَسَبِّحْ بِحَمْدِ رَبِّكَ وَٱسْتَغْفِرْهُ ۚ إِنَّهُۥ كَانَ تَوَّابًۢا",
      translations: [{ id: 131, resource_id: 131, text: "Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance." }]
    }
  ]
};
