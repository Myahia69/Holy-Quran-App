/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Translation {
  id: number;
  resource_id: number;
  text: string;
}

export interface Word {
  id: number;
  position: number;
  text_uthmani?: string;
  text?: string;
  transliteration?: {
    text: string;
    language_name?: string;
  };
  translation?: {
    text: string;
    language_name?: string;
  };
  audio_url?: string;
}

export interface Verse {
  id: number;
  verse_number: number;
  verse_key: string;
  juz_number: number;
  text_uthmani?: string;
  text_imlaei?: string;
  translations?: Translation[];
  words?: Word[];
}

export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Reciter {
  id: number;
  reciter_name: string;
  translated_name: string;
  style: string;
  isEgyptian?: boolean;
  region?: string;
}

export interface VerseTiming {
  verse_key: string;
  timestamp_from: number; // in ms
  timestamp_to: number;   // in ms
  duration: number;       // in ms
  segments?: [number, number, number][]; // [word_index, start_ms, end_ms]
}

export interface AudioFile {
  url: string;
  duration?: number;
  verse_timings?: VerseTiming[];
  isOffline?: boolean;
  sizeInBytes?: number;
}

export interface Tafsir {
  resource_id: number;
  text: string;
  resource_name: string;
  language: string;
}

export interface SearchResultItem {
  verse_key: string;
  verse_id: number;
  text: string;
  translations?: {
    name: string;
    text: string;
  }[];
}

export interface UserProgress {
  lastReadSurah: number;
  lastReadAyah: number;
  preferredReciter: number;
  chosenTranslation: number;
  activeLanguage: 'en' | 'ar';
  textScale: number; // e.g. 1 (base), 1.25, 1.5
  audioSpeed: number; // e.g. 1, 1.25, 1.5, etc.
  theme: 'light' | 'dark';
}
