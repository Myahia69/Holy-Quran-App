/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Chapter, Verse, AudioFile, Tafsir, SearchResultItem } from '../types';
import { FALLBACK_CHAPTERS, OFFLINE_VERSES_CACHE } from './fallbackData';

const BASE_URL = 'https://api.quran.com/api/v4';

/**
 * Curated list of high-quality reciters with reliable verse timings
 */
export const POPULAR_RECITERS = [
  { id: 7, reciter_name: 'Mishary Rashid Alafasy', translated_name: 'مشاري راشد العفاسي', style: 'Murattal' },
  { id: 3, reciter_name: 'Abdul Rahman Al-Sudais', translated_name: 'عبد الرحمن السديس', style: 'An-Nazaer' },
  { id: 4, reciter_name: 'Saad Al-Ghamdi', translated_name: 'سعد الغامدي', style: 'Murattal' },
  { id: 12, reciter_name: 'Mahmoud Khalil Al-Husary', translated_name: 'محمود خليل الحصري', style: 'Murattal' },
  { id: 10, reciter_name: 'Saud Al-Shuraim', translated_name: 'سعود الشريم', style: 'Murattal' },
  { id: 2, reciter_name: 'Abdul Basit Abdus Samad', translated_name: 'عبد الباسط عبد الصمد', style: 'Mojawwad' },
];

/**
 * Curated list of translation resources from Quran.com
 */
export const POPULAR_TRANSLATIONS = [
  { id: 131, name: 'Dr. Mustafa Khattab (The Clear Quran)', language: 'en' },
  { id: 20, name: 'Saheeh International', language: 'en' },
  { id: 84, name: 'Mufti Taqi Usmani', language: 'en' },
  { id: 77, name: 'Yusuf Ali', language: 'en' },
];

/**
 * Curated list of Tafsirs
 */
export const POPULAR_TAFSIRS = [
  { id: 169, name: 'Tafsir Al-Saadi (يسير في تفسير كلام المنان)', language: 'ar' },
  { id: 165, name: 'Tafsir Al-Maysar (التفسير الميسر)', language: 'ar' },
  { id: 14, name: 'Tafsir Ibn Kathir (ابن كثير - English Translation)', language: 'en' },
];

export async function fetchChapters(languageEn: boolean = true): Promise<Chapter[]> {
  try {
    const lang = languageEn ? 'en' : 'ar';
    const response = await fetch(`${BASE_URL}/chapters?language=${lang}`);
    if (!response.ok) {
      throw new Error('Failed to fetch chapters');
    }
    const data = await response.json();
    if (data.chapters && data.chapters.length > 0) {
      return data.chapters;
    }
    return FALLBACK_CHAPTERS;
  } catch (error) {
    console.error('Error fetching chapters, using static fallback:', error);
    return FALLBACK_CHAPTERS;
  }
}

export async function fetchChapterVerses(
  chapterId: number,
  translationId: number = 131,
  page: number = 1,
  perPage: number = 20
): Promise<{ verses: Verse[]; totalPages: number; currentPage: number }> {
  try {
    const response = await fetch(
      `${BASE_URL}/verses/by_chapter/${chapterId}?language=en&translations=${translationId}&fields=text_uthmani&page=${page}&per_page=${perPage}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch verses for chapter ${chapterId}`);
    }
    const data = await response.json();
    if (data.verses && data.verses.length > 0) {
      return {
        verses: data.verses,
        totalPages: data.pagination?.total_pages || 1,
        currentPage: data.pagination?.current_page || 1,
      };
    }
    
    // Fallback to local offline cache if server handles nothing
    if (OFFLINE_VERSES_CACHE[chapterId]) {
      return {
        verses: OFFLINE_VERSES_CACHE[chapterId],
        totalPages: 1,
        currentPage: 1,
      };
    }
    return { verses: [], totalPages: 1, currentPage: 1 };
  } catch (error) {
    console.error('Error fetching verses, checking offline cache:', error);
    if (OFFLINE_VERSES_CACHE[chapterId]) {
      return {
        verses: OFFLINE_VERSES_CACHE[chapterId],
        totalPages: 1,
        currentPage: 1,
      };
    }
    return { verses: [], totalPages: 1, currentPage: 1 };
  }
}

/**
 * Fetches Tafsir text for a specific verse key (e.g. "1:1")
 */
export async function fetchTafsir(tafsirId: number, verseKey: string): Promise<Tafsir | null> {
  const endpoints = [
    `${BASE_URL}/quran/tafsirs/${tafsirId}?verse_key=${verseKey}`,
    `${BASE_URL}/tafsirs/${tafsirId}?verse_key=${verseKey}`
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        continue;
      }
      const data = await response.json();
      if (!data) continue;
      
      // Support singular 'tafsir' object (Quran.com API v4 format for single-verse)
      if (data.tafsir) {
        const item = data.tafsir;
        return {
          resource_id: item.resource_id ?? tafsirId,
          text: item.text ?? '',
          resource_name: item.resource_name || POPULAR_TAFSIRS.find(t => t.id === tafsirId)?.name || 'Tafsir',
          language: item.language_name || item.language || POPULAR_TAFSIRS.find(t => t.id === tafsirId)?.language || 'arabic',
        };
      }

      // Support plural 'tafsirs' list (older versions or alternative shapes)
      if (data.tafsirs && data.tafsirs.length > 0) {
        const item = data.tafsirs[0];
        if (item) {
          return {
            resource_id: item.resource_id ?? tafsirId,
            text: item.text ?? '',
            resource_name: item.resource_name || POPULAR_TAFSIRS.find(t => t.id === tafsirId)?.name || 'Tafsir',
            language: item.language_name || item.language || POPULAR_TAFSIRS.find(t => t.id === tafsirId)?.language || 'arabic',
          };
        }
      }
    } catch (error) {
      console.warn(`Attempt failed for Tafsir URL ${url}:`, error);
    }
  }
  
  console.error(`Failed to load Tafsir ${tafsirId} for ${verseKey} from all endpoints.`);
  return null;
}

/**
 * Fetches the recitation audio file details and verse-level timestamps for a specific surah
 */
export async function fetchAudioFile(reciterId: number, chapterNumber: number): Promise<AudioFile | null> {
  // Let's try BOTH endpoints for Quran.com API v4 (since structures differ across API versions)
  const endpoints = [
    `${BASE_URL}/chapter_recitations/${reciterId}/${chapterNumber}`,
    `${BASE_URL}/recitations/${reciterId}/by_chapter/${chapterNumber}`
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.audio_file) {
          const rawUrl = data.audio_file.audio_url || data.audio_file.url;
          // Clean up any double slashes in paths, keeping the protocol intact
          let cleanUrl = rawUrl;
          if (cleanUrl && cleanUrl.startsWith('//')) {
            cleanUrl = 'https:' + cleanUrl;
          }
          return {
            url: cleanUrl,
            duration: data.audio_file.duration,
            verse_timings: data.audio_file.verse_timings || [],
          };
        }
      }
    } catch (err) {
      console.warn(`Failed fetching audio from ${url}:`, err);
    }
  }

  // If both endpoints failed, let's return a curated online fallback URL to ensure it never crashes
  // Many popular recitations are hosted directly on download.quranicaudio.com
  // Formats depend on the reciter, Mishary Alafasy is reciter 7 (Mishary_Rashid_Alafasy)
  const surahPadded = String(chapterNumber).padStart(3, '0');
  let fallbackWebUrl = '';
  if (reciterId === 7) {
    fallbackWebUrl = `https://download.quranicaudio.com/quran/mishary_rashid_alafasy/${surahPadded}.mp3`;
  } else if (reciterId === 3) {
    fallbackWebUrl = `https://download.quranicaudio.com/quran/sudais/${surahPadded}.mp3`;
  } else if (reciterId === 4) {
    fallbackWebUrl = `https://download.quranicaudio.com/quran/sa3d_al9amdi/compleet/${surahPadded}.mp3`;
  } else if (reciterId === 12) {
    fallbackWebUrl = `https://download.quranicaudio.com/quran/khalil_al-husaree/murattal/${surahPadded}.mp3`;
  } else {
    fallbackWebUrl = `https://download.quranicaudio.com/quran/mishary_rashid_alafasy/${surahPadded}.mp3`;
  }

  console.log(`Using static direct cdn fallback for audio track: ${fallbackWebUrl}`);
  return {
    url: fallbackWebUrl,
    duration: 0,
    verse_timings: [],
  };
}

/**
 * Perform server-side natural language search on Quran.com API v4
 */
export async function performSearch(query: string, language: 'en' | 'ar' = 'en', page: number = 1): Promise<{
  results: SearchResultItem[];
  totalResults: number;
  totalPages: number;
}> {
  try {
    if (!query || query.trim().length === 0) {
      return { results: [], totalResults: 0, totalPages: 0 };
    }
    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(query)}&language=${language}&size=20&page=${page}`
    );
    if (!response.ok) {
      throw new Error('Search failed');
    }
    const data = await response.json();
    const searchData = data.search || {};
    
    const resultsResponse: SearchResultItem[] = (searchData.results || []).map((res: any) => {
      return {
        verse_key: res.verse_key,
        verse_id: res.verse_id,
        text: res.text,
        translations: res.translations || [],
      };
    });

    return {
      results: resultsResponse,
      totalResults: searchData.total_results || 0,
      totalPages: searchData.total_pages || 0,
    };
  } catch (error) {
    console.error('Search error:', error);
    return { results: [], totalResults: 0, totalPages: 0 };
  }
}
