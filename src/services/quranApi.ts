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
  // Famous Egyptian Reciters / القراء المصريين المشهورين
  { id: 6, reciter_name: 'Mahmoud Khalil Al-Husary', translated_name: 'محمود خليل الحصري (مرتل)', style: 'Murattal', isEgyptian: true, region: 'Egypt' },
  { id: 12, reciter_name: 'Mahmoud Khalil Al-Husary (Muallim)', translated_name: 'محمود خليل الحصري (معلم)', style: 'Muallim', isEgyptian: true, region: 'Egypt' },
  { id: 2, reciter_name: 'Abdul Basit Abdus Samad (Murattal)', translated_name: 'عبد الباسط عبد الصمد (مرتل)', style: 'Murattal', isEgyptian: true, region: 'Egypt' },
  { id: 1, reciter_name: 'Abdul Basit Abdus Samad (Mujawwad)', translated_name: 'عبد الباسط عبد الصمد (مجود)', style: 'Mujawwad', isEgyptian: true, region: 'Egypt' },
  { id: 9, reciter_name: 'Mohamed Siddiq al-Minshawi (Murattal)', translated_name: 'محمد صديق المنشاوي (مرتل)', style: 'Murattal', isEgyptian: true, region: 'Egypt' },
  { id: 8, reciter_name: 'Mohamed Siddiq al-Minshawi (Mujawwad)', translated_name: 'محمد صديق المنشاوي (مجود)', style: 'Mujawwad', isEgyptian: true, region: 'Egypt' },
  { id: 11, reciter_name: 'Mohamed al-Tablawi', translated_name: 'محمد الطبلاوي', style: 'Murattal', isEgyptian: true, region: 'Egypt' },
  
  // Other Popular Reciters
  { id: 7, reciter_name: 'Mishari Rashid al-`Afasy', translated_name: 'مشاري راشد العفاسي', style: 'Murattal', region: 'Kuwait' },
  { id: 3, reciter_name: 'Abdur-Rahman as-Sudais', translated_name: 'عبد الرحمن السديس', style: 'Murattal', region: 'KSA' },
  { id: 10, reciter_name: 'Sa`ud ash-Shuraym', translated_name: 'سعود الشريم', style: 'Murattal', region: 'KSA' },
  { id: 4, reciter_name: 'Abu Bakr al-Shatri', translated_name: 'أبو بكر الشاطري', style: 'Murattal', region: 'KSA' },
  { id: 5, reciter_name: 'Hani ar-Rifai', translated_name: 'هاني الرفاعي', style: 'Murattal', region: 'KSA' },
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
  { id: 16, name: 'التفسير الميسر', language: 'ar' },
  { id: 91, name: 'تفسير السعدي (تيسير الكريم الرحمن في تفسير كلام المنان)', language: 'ar' },
  { id: 14, name: 'تفسير ابن كثير', language: 'ar' },
  { id: 15, name: 'تفسير الطبري', language: 'ar' },
  { id: 90, name: 'تفسير القرطبي', language: 'ar' },
  { id: 94, name: 'تفسير البغوي', language: 'ar' },
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
      `${BASE_URL}/verses/by_chapter/${chapterId}?language=en&translations=${translationId}&fields=text_uthmani&page=${page}&per_page=${perPage}&words=true`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch verses for chapter ${chapterId}`);
    }
    const data = await response.json();
    if (data.verses && data.verses.length > 0) {
      const parsedVerses = data.verses.map((v: any) => {
        const verseWords = v.words ? v.words.map((w: any) => {
          let cleanAudioUrl = w.audio_url || '';
          if (cleanAudioUrl) {
            if (cleanAudioUrl.startsWith('//')) {
              cleanAudioUrl = 'https:' + cleanAudioUrl;
            } else if (!cleanAudioUrl.startsWith('http')) {
              cleanAudioUrl = 'https://audio.qurancdn.com/' + cleanAudioUrl;
            }
          }
          return {
            id: w.id,
            position: w.position,
            text_uthmani: w.text_uthmani || w.text || '',
            text: w.text || w.text_uthmani || '',
            transliteration: w.transliteration ? {
              text: w.transliteration.text || '',
              language_name: w.transliteration.language_name || 'english'
            } : undefined,
            translation: w.translation ? {
              text: w.translation.text || '',
              language_name: w.translation.language_name || 'english'
            } : undefined,
            audio_url: cleanAudioUrl
          };
        }) : [];

        return {
          id: v.id,
          verse_number: v.verse_number,
          verse_key: v.verse_key,
          juz_number: v.juz_number,
          text_uthmani: v.text_uthmani,
          translations: v.translations,
          words: verseWords
        };
      });

      return {
        verses: parsedVerses,
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
  // Since some specific IDs like 16, 14, 91, 15 return empty arrays on the direct endpoint "/quran/tafsirs/{id}", 
  // but public endpoints like 165 or 160 return the full list of all 44 tafsearch resources, 
  // we query multiple fallbacks and search inside the list to guarantee we find the requested Tafsir.
  const endpoints = [
    `${BASE_URL}/quran/tafsirs/165?verse_key=${verseKey}`,
    `${BASE_URL}/quran/tafsirs/160?verse_key=${verseKey}`,
    `${BASE_URL}/quran/tafsirs/93?verse_key=${verseKey}`,
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
      
      // Support plural 'tafsirs' list (returned by endpoints like 165, 160, 93 containing all 44 entries)
      if (data.tafsirs && data.tafsirs.length > 0) {
        // Look for the element matching our specific requested tafsirId
        const matchedItem = data.tafsirs.find((t: any) => t.resource_id === tafsirId);
        if (matchedItem) {
          return {
            resource_id: matchedItem.resource_id ?? tafsirId,
            text: matchedItem.text ?? '',
            resource_name: matchedItem.resource_name || POPULAR_TAFSIRS.find(t => t.id === tafsirId)?.name || 'Tafsir',
            language: matchedItem.language_name || matchedItem.language || POPULAR_TAFSIRS.find(t => t.id === tafsirId)?.language || 'arabic',
          };
        }
        
        // If we didn't find an exact resource_id match but we requested the singular ID directly, 
        // fall back to the first item (legacy/default comportamento)
        if (url.includes(`/quran/tafsirs/${tafsirId}?`)) {
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
      }

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
    } catch (error) {
      console.warn(`Attempt failed for Tafsir URL ${url}:`, error);
    }
  }
  
  console.error(`Failed to load Tafsir ${tafsirId} for ${verseKey} from all endpoints.`);
  return null;
}

/**
 * Retrieves the offline cached AudioFile if it exists in caches and localStorage
 */
export async function getOfflineAudioFile(reciterId: number, chapterNumber: number): Promise<AudioFile | null> {
  try {
    const key = `quran_offline_meta_${reciterId}_${chapterNumber}`;
    const cachedMeta = localStorage.getItem(key);
    if (!cachedMeta) return null;
    
    const meta = JSON.parse(cachedMeta) as AudioFile;
    if (!meta || !meta.url) return null;

    if (typeof window !== 'undefined' && 'caches' in window) {
      const cache = await window.caches.open('quran-offline-audio-cache');
      const matched = await cache.match(meta.url);
      if (matched) {
        const blob = await matched.blob();
        const objectUrl = URL.createObjectURL(blob);
        return {
          ...meta,
          url: objectUrl,
          isOffline: true,
        };
      }
    }
  } catch (err) {
    console.error('Error retrieving offline audio file:', err);
  }
  return null;
}

/**
 * Checks if a specific recitation is downloaded offline
 */
export async function isAudioFileDownloaded(reciterId: number, chapterNumber: number): Promise<boolean> {
  try {
    const key = `quran_offline_meta_${reciterId}_${chapterNumber}`;
    const cachedMeta = localStorage.getItem(key);
    if (!cachedMeta) return false;

    const meta = JSON.parse(cachedMeta) as AudioFile;
    if (!meta || !meta.url) return false;

    if (typeof window !== 'undefined' && 'caches' in window) {
      const cache = await window.caches.open('quran-offline-audio-cache');
      const matched = await cache.match(meta.url);
      return !!matched;
    }
  } catch (err) {
    console.error('Error checking outline download:', err);
  }
  return false;
}

export interface OfflineRecitationItem {
  reciterId: number;
  chapterNumber: number;
  reciterName: string;
  reciterTranslatedName: string;
  surahNameComplex: string;
  surahNameArabic: string;
  sizeInBytes: number;
}

/**
 * Lists all offline recitation chapters verified in Cache API and local storage
 */
export async function listOfflineRecitations(): Promise<OfflineRecitationItem[]> {
  const items: OfflineRecitationItem[] = [];
  try {
    if (typeof window === 'undefined') return [];
    
    const cache = await window.caches.open('quran-offline-audio-cache');

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('quran_offline_meta_')) {
        const parts = key.split('_');
        const reciterId = parseInt(parts[3], 10);
        const chapterNumber = parseInt(parts[4], 10);
        
        if (isNaN(reciterId) || isNaN(chapterNumber)) continue;
        
        const cachedMeta = localStorage.getItem(key);
        if (!cachedMeta) continue;
        
        const meta = JSON.parse(cachedMeta) as AudioFile;
        if (!meta || !meta.url) continue;
        
        // Verify response exists in Cache API
        const cachedResponse = await cache.match(meta.url);
        if (!cachedResponse) {
          // Metadata exists but not cache file, remove stale metadata
          localStorage.removeItem(key);
          continue;
        }

        let sizeInBytes = meta.sizeInBytes || 0;
        if (!sizeInBytes) {
          try {
            const blob = await cachedResponse.clone().blob();
            sizeInBytes = blob.size;
            meta.sizeInBytes = sizeInBytes;
            localStorage.setItem(key, JSON.stringify(meta));
          } catch {
            sizeInBytes = 5 * 1024 * 1024; // fallback 5MB estimate
          }
        }
        
        const reciter = POPULAR_RECITERS.find(r => r.id === reciterId);
        const chapter = FALLBACK_CHAPTERS.find(c => c.id === chapterNumber);
        
        items.push({
          reciterId,
          chapterNumber,
          reciterName: reciter?.reciter_name || `Sheikh ID ${reciterId}`,
          reciterTranslatedName: reciter?.translated_name || `الشيخ رقم ${reciterId}`,
          surahNameComplex: chapter?.name_complex || `Surah ${chapterNumber}`,
          surahNameArabic: chapter?.name_arabic || `سورة ${chapterNumber}`,
          sizeInBytes,
        });
      }
    }
  } catch (err) {
    console.error('Error listing offline recitations:', err);
  }
  return items;
}

function getFallbackUrl(reciterId: number, chapterNumber: number): string {
  const surahPadded = String(chapterNumber).padStart(3, '0');
  switch (reciterId) {
    case 7: // Alafasy
      return `https://download.quranicaudio.com/quran/mishary_rashid_alafasy/${surahPadded}.mp3`;
    case 3: // Sudais
      return `https://download.quranicaudio.com/quran/sudais/${surahPadded}.mp3`;
    case 4: // Abu Bakr al-Shatri
      return `https://download.quranicaudio.com/quran/abu_bakr_al_shatri/${surahPadded}.mp3`;
    case 6: // Husary Murattal
      return `https://download.quranicaudio.com/quran/khalil_al-husaree/murattal/${surahPadded}.mp3`;
    case 12: // Husary Muallim
      return `https://download.quranicaudio.com/quran/khalil_al-husaree/muallim/${surahPadded}.mp3`;
    case 2: // Abdul Basit Murattal
      return `https://download.quranicaudio.com/quran/abdul_basit_murattal/${surahPadded}.mp3`;
    case 1: // Abdul Basit Mujawwad
      return `https://download.quranicaudio.com/quran/abdul_basit_mujawwad/${surahPadded}.mp3`;
    case 9: // Al-Minshawi Murattal
      return `https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/murattal/${surahPadded}.mp3`;
    case 8: // Al-Minshawi Mujawwad
      return `https://download.quranicaudio.com/quran/muhammad_siddeeq_al-minshaawee/mujawwad/${surahPadded}.mp3`;
    case 10: // Shuraym
      return `https://download.quranicaudio.com/quran/shuraym/${surahPadded}.mp3`;
    case 11: // Tablawi
      return `https://download.quranicaudio.com/quran/mohammad_altablawi/${surahPadded}.mp3`;
    case 5: // Hani ar-Rifai
      return `https://download.quranicaudio.com/quran/hani_ar_rifai/${surahPadded}.mp3`;
    default:
      return `https://download.quranicaudio.com/quran/mishary_rashid_alafasy/${surahPadded}.mp3`;
  }
}

/**
 * Downloads a recitation audio file to Cache API and saves the timing details in localStorage
 */
export async function downloadAudioFile(
  reciterId: number,
  chapterNumber: number,
  onProgress?: (progress: number) => void
): Promise<void> {
  let fileData: AudioFile | null = null;
  const endpoints = [
    `${BASE_URL}/chapter_recitations/${reciterId}/${chapterNumber}?segments=true`,
    `${BASE_URL}/recitations/${reciterId}/by_chapter/${chapterNumber}?segments=true`
  ];

  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data.audio_file) {
          const rawUrl = data.audio_file.audio_url || data.audio_file.url;
          let cleanUrl = rawUrl;
          if (cleanUrl && cleanUrl.startsWith('//')) {
            cleanUrl = 'https:' + cleanUrl;
          }
          fileData = {
            url: cleanUrl,
            duration: data.audio_file.duration,
            verse_timings: data.audio_file.timestamps || data.audio_file.verse_timings || [],
          };
          break;
        }
      }
    } catch {
      // ignore, try next
    }
  }

  // Fallback if metadata endpoints failed
  if (!fileData) {
    const fallbackWebUrl = getFallbackUrl(reciterId, chapterNumber);
    fileData = {
      url: fallbackWebUrl,
      duration: 0,
      verse_timings: [],
    };
  }

  const mp3Url = fileData.url;
  if (!mp3Url) {
    throw new Error('No audio URL found for this chapter.');
  }

  // Fetch the audio blob with progress tracking
  const response = await fetch(mp3Url);
  if (!response.ok) {
    throw new Error(`Failed to download audio file: ${response.statusText}`);
  }

  const contentLength = response.headers.get('content-length');
  const total = contentLength ? parseInt(contentLength, 10) : 0;
  
  let downloadedSize = 0;

  if (response.body && total > 0 && typeof ReadableStream !== 'undefined') {
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        loaded += value.length;
        if (onProgress) {
          onProgress(Math.round((loaded / total) * 100));
        }
      }
    }

    const blob = new Blob(chunks, { type: 'audio/mpeg' });
    downloadedSize = blob.size;
    const cache = await window.caches.open('quran-offline-audio-cache');
    await cache.put(mp3Url, new Response(blob));
  } else {
    if (onProgress) onProgress(50);
    const blob = await response.blob();
    downloadedSize = blob.size;
    const cache = await window.caches.open('quran-offline-audio-cache');
    await cache.put(mp3Url, new Response(blob));
    if (onProgress) onProgress(100);
  }

  // Save metadata to localStorage including precalculated file size
  const enrichedData: AudioFile = {
    ...fileData,
    sizeInBytes: downloadedSize,
  };
  localStorage.setItem(`quran_offline_meta_${reciterId}_${chapterNumber}`, JSON.stringify(enrichedData));
}

/**
 * Deletes an offline cached recitation audio and metadata
 */
export async function deleteOfflineAudioFile(reciterId: number, chapterNumber: number): Promise<void> {
  try {
    const key = `quran_offline_meta_${reciterId}_${chapterNumber}`;
    const cachedMeta = localStorage.getItem(key);
    if (cachedMeta) {
      const meta = JSON.parse(cachedMeta) as AudioFile;
      if (meta && meta.url && typeof window !== 'undefined' && 'caches' in window) {
        const cache = await window.caches.open('quran-offline-audio-cache');
        await cache.delete(meta.url);
      }
    }
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Error deleting offline audio file:', err);
  }
}

/**
 * Fetches the recitation audio file details and verse-level timestamps for a specific surah
 */
export async function fetchAudioFile(reciterId: number, chapterNumber: number): Promise<AudioFile | null> {
  // Check offline cache FIRST
  const offlineCached = await getOfflineAudioFile(reciterId, chapterNumber);
  if (offlineCached) {
    console.log(`Using offline cached recitation for reciter ${reciterId}, surah ${chapterNumber}`);
    return offlineCached;
  }

  // Let's try BOTH endpoints for Quran.com API v4 (since structures differ across API versions)
  const endpoints = [
    `${BASE_URL}/chapter_recitations/${reciterId}/${chapterNumber}?segments=true`,
    `${BASE_URL}/recitations/${reciterId}/by_chapter/${chapterNumber}?segments=true`
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
            verse_timings: data.audio_file.timestamps || data.audio_file.verse_timings || [],
          };
        }
      }
    } catch (err) {
      console.warn(`Failed fetching audio from ${url}:`, err);
    }
  }

  // If both endpoints failed, let's return a curated online fallback URL to ensure it never crashes
  // Many popular recitations are hosted directly on download.quranicaudio.com
  const fallbackWebUrl = getFallbackUrl(reciterId, chapterNumber);

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
