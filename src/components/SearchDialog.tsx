/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, X, BookOpen, Loader2, Play } from 'lucide-react';
import { performSearch } from '../services/quranApi';
import { SearchResultItem } from '../types';

interface SearchDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeLanguage: 'en' | 'ar';
  // Triggered when a search result is clicked.
  // Translates to: change surah and trigger play/highlight
  onSelectResult: (verseKey: string) => void;
}

export default function SearchDialog({
  isOpen,
  onClose,
  activeLanguage,
  onSelectResult,
}: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

  const isArabic = activeLanguage === 'ar';

  const triggerSearch = async (query: string) => {
    if (!query || query.trim().length < 3) {
      setResults([]);
      setTotalResults(0);
      return;
    }
    setIsLoading(true);
    try {
      const resp = await performSearch(query, activeLanguage);
      setResults(resp.results);
      setTotalResults(resp.totalResults);
    } catch (err) {
      console.error('Search failure:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Debouncing search updates
  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    if (searchQuery.trim().length >= 3) {
      const timeout = setTimeout(() => {
        triggerSearch(searchQuery);
      }, 5000 / 10); // 500ms
      setDebounceTimeout(timeout);
    } else {
      setResults([]);
      setTotalResults(0);
    }

    return () => {
      if (debounceTimeout) clearTimeout(debounceTimeout);
    };
  }, [searchQuery]);

  // Clean-up on close
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
      setResults([]);
      setTotalResults(0);
    }
  }, [isOpen]);

  const handleResultClick = (item: SearchResultItem) => {
    onSelectResult(item.verse_key);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-16 md:pt-28">
      {/* Search Modal Box */}
      <div
        className="w-full max-w-2xl bg-[#fdfcf8] dark:bg-[#02130c] border-2 border-gold-400 dark:border-gold-550/30 rounded-3xl shadow-2xl flex flex-col max-h-[75vh]"
        id="search-dialog-box"
      >
        {/* Search header & Input */}
        <div className="flex items-center gap-3 p-4 border-b-2 border-gold-400/20 bg-[#faf7ef] dark:bg-[#031d13] rounded-t-[22px]">
          <Search className="w-5 h-5 text-gold-500 shrink-0" />
          <input
            id="search-raw-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isArabic
                ? 'ابحث بالكلمة، الآية، أو السورة (مثال: رحمة، 1:1)...'
                : 'Search words, verses, topics (e.g. mercy, 1:1)...'
            }
            className="flex-1 text-sm bg-transparent border-0 text-stone-900 dark:text-gold-100 placeholder-stone-400 dark:placeholder-gold-400/50 focus:outline-none focus:ring-0 outline-none font-sans font-semibold"
            autoFocus
          />
          {searchQuery && (
            <button
              id="clear-search-btn"
              onClick={() => setSearchQuery('')}
              className="p-1 rounded-full hover:bg-gold-400/15 text-stone-400 hover:text-gold-500"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            id="close-search-dlg"
            onClick={onClose}
            className="px-2.5 py-1 text-xs rounded-lg bg-gold-400/10 dark:bg-gold-450/20 text-[#143d26] dark:text-gold-200 border border-gold-400/20 hover:bg-[#faf5eb] transition font-mono font-bold cursor-pointer"
          >
            Esc
          </button>
        </div>

        {/* Results Stream Area */}
        <div className="flex-1 overflow-y-auto p-4" id="search-results-list">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-gold-500 text-sm">
              <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
              <span className="font-serif italic text-xs">
                {isArabic ? 'جاري البحث في آيات الذكر الحكيم...' : 'Searching Holy Quran...'}
              </span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-[11px] font-sans text-stone-500 dark:text-gold-400/50 px-1 mb-1 font-bold">
                <span>
                  {isArabic ? `تم العثور على ${totalResults} نتيجة` : `Found ${totalResults} matches`}
                </span>
                <span>{isArabic ? 'انقر على النتيجة للانتقال والتشغيل' : 'Click match to study / play'}</span>
              </div>

              {results.map((item, idx) => (
                <button
                  key={`${item.verse_key}-${idx}`}
                  id={`search-result-item-${item.verse_key}`}
                  onClick={() => handleResultClick(item)}
                  className="w-full text-left p-3.5 rounded-2xl border border-gold-400/15 dark:border-gold-500/10 bg-white/40 dark:bg-emerald-950/10 hover:border-gold-400 hover:bg-[#faf6ed] dark:hover:bg-emerald-950/20 transition flex flex-col gap-2 group cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full text-xs font-mono">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 dark:bg-gold-400/10 text-gold-300 border border-gold-400/20 dark:border-gold-550/15 text-xs font-bold">
                      {item.verse_key}
                    </span>
                    <span className="text-[10px] text-stone-400 group-hover:text-gold-500 dark:group-hover:text-gold-400 flex items-center gap-1">
                      <Play className="w-3 h-3 fill-current" />
                      {isArabic ? 'انتقل واستمع' : 'Go to verse & play'}
                    </span>
                  </div>

                  {/* Standard Arabic Text highlight */}
                  <div className="text-right w-full" style={{ direction: 'rtl' }}>
                    <p
                      className="font-scheherazade text-emerald-950 dark:text-stone-100 text-lg md:text-xl leading-loose"
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  </div>

                  {/* English Snippet Translation */}
                  {item.translations && item.translations.length > 0 && (
                    <div className="text-left w-full mt-1">
                      <p
                        className="text-xs text-stone-500 dark:text-gold-200/80 leading-relaxed truncate-2"
                        dangerouslySetInnerHTML={{ __html: item.translations[0].text }}
                      />
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : searchQuery.trim().length >= 3 ? (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400 text-sm">
              <BookOpen className="w-12 h-12 stroke-[1] text-gold-400 mb-2" />
              <span>
                {isArabic ? 'عذراً، لم نجد أي تطابقات للبحث.' : 'No accurate matches found.'}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-stone-400 text-center text-xs md:text-sm max-w-md mx-auto gap-2">
              <Search className="w-12 h-12 stroke-[1] text-gold-400" />
              <div className="font-cinzel font-bold text-emerald-950 dark:text-gold-200">
                {isArabic ? 'تواصل المباشر والبحث السريع' : 'Fast API Search Engine'}
              </div>
              <p className="text-stone-500 dark:text-gold-400/50 leading-relaxed text-xs">
                {isArabic
                  ? 'اكتب ٣ أحرف على الأقل للبحث في كامل القرآن الكريم باللغتين العربية والإنجليزية.'
                  : 'Type 3 or more letters to query Arabic script or standard English translation keys instantly.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
