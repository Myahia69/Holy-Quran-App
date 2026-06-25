import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Send, Sparkles, AlertCircle, Copy, Check, 
  ExternalLink, RefreshCw, BookOpen, Scale, MessageSquare, Bot
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: Array<{ title: string; url: string }>;
  timestamp: Date;
}

interface IslamicAiDialogProps {
  isOpen: boolean;
  onClose: () => void;
  isArabic: boolean;
}

const PRESET_PROMPTS_AR = [
  'تفسير آية الكرسي وأسرارها العظيمة',
  'فضل الاستغفار وأثره في سعة الرزق',
  'ما هو حكم صلاة الجماعة في المذاهب الأربعة؟',
  'كيف أبدأ بتدبر آيات القرآن الكريم بشكل صحيح؟',
];

const PRESET_PROMPTS_EN = [
  'Tafsir of Ayat al-Kursi (2:255)',
  'Virtues of seeking forgiveness (Istighfar)',
  'Ruling on congregational prayer in Sunni schools',
  'How to start meditating on the Noble Quran?',
];

export default function IslamicAiDialog({ isOpen, onClose, isArabic }: IslamicAiDialogProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [useSearch, setUseSearch] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Reset chat if empty on open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: isArabic
          ? 'مرحباً بك في المساعد الشرعي الذكي لبوابة القرآن الكريم. أنا هنا لمساعدتك في تفاسير الآيات، مراجعة الأحاديث، والبحث الفقهي الموثوق المعتمد على كبرى دور الإفتاء والأزهر الشريف والمصادر الكلاسيكية لأهل السنة والجماعة. كيف يمكنني مساعدتك اليوم؟'
          : 'Welcome to the Quranic Islamic AI Scholar. I am here to assist you with Quranic commentaries (Tafsir), verified Hadith check, and Islamic jurisprudence grounded strictly in official Fatwa councils (e.g. Al-Azhar, Egypt Dar Al-Ifta) and reliable Sunni classical sources. How can I help you today?',
        timestamp: new Date()
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, isArabic]);

  if (!isOpen) return null;

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setError(null);
    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Build history payload for Gemini conversational context
      // Exclude the welcome message and keep the last 6 messages to avoid bloating token count
      const chatHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({
          role: m.role,
          content: m.content
        }));

      const response = await fetch('/api/islamic-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: text,
          history: chatHistory,
          enableSearch: useSearch
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        if (
          textResponse.includes('Action required to load your app') || 
          textResponse.includes('security cookie') || 
          textResponse.includes('blocking a required security cookie')
        ) {
          throw new Error(
            isArabic
              ? 'يبدو أن متصفحك يحظر ملفات تعريف الارتباط الأمنية المطلوبة (Security Cookies). يرجى فتح التطبيق في نافذة/علامة تبويب جديدة باستخدام زر الرابط الخارجي (في أعلى الصفحة)، أو السماح لملفات تعريف الارتباط في متصفحك لتفعيل الذكاء الاصطناعي.'
              : 'It looks like your browser is blocking a required security cookie. Please open the app in a new tab by clicking the external link button at the top, or enable cookies in your browser to use the AI assistant.'
          );
        } else {
          throw new Error(
            isArabic
              ? 'حدث خطأ في الاتصال بالخادم أو تم اعتراض الطلب. يرجى محاولة فتح التطبيق في نافذة/علامة تبويب جديدة.'
              : 'A server error occurred or the request was blocked. Please try opening the app in a new tab.'
          );
        }
      }

      if (!response.ok) {
        throw new Error(data?.error || (isArabic ? 'حدث خطأ أثناء معالجة الطلب' : 'An error occurred during process'));
      }

      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        role: 'assistant',
        content: data.answer,
        sources: data.sources || [],
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (isArabic ? 'فشل الاتصال بالمساعد الذكي' : 'Failed to connect to the AI Assistant'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    const initialMessage: Message = {
      id: 'welcome',
      role: 'assistant',
      content: isArabic
        ? 'مرحباً بك في المساعد الشرعي الذكي لبوابة القرآن الكريم. أنا هنا لمساعدتك في تفاسير الآيات، مراجعة الأحاديث، والبحث الفقهي الموثوق المعتمد على كبرى دور الإفتاء والأزهر الشريف والمصادر الكلاسيكية لأهل السنة والجماعة. كيف يمكنني مساعدتك اليوم؟'
        : 'Welcome to the Quranic Islamic AI Scholar. I am here to assist you with Quranic commentaries (Tafsir), verified Hadith check, and Islamic jurisprudence grounded strictly in official Fatwa councils (e.g. Al-Azhar, Egypt Dar Al-Ifta) and reliable Sunni classical sources. How can I help you today?',
      timestamp: new Date()
    };
    setMessages([initialMessage]);
    setError(null);
  };

  const presets = isArabic ? PRESET_PROMPTS_AR : PRESET_PROMPTS_EN;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="islamic-ai-dialog-container">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 dark:bg-black/85 backdrop-blur-sm"
        />

        {/* Dialog Content Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-[#fdfbf6] dark:bg-[#021810] border-2 border-emerald-800 dark:border-gold-400 rounded-3xl overflow-hidden shadow-2xl z-10 text-stone-800 dark:text-gold-100 flex flex-col max-h-[85vh]"
          id="islamic-ai-dialog-card"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-gold-400/10 flex items-center justify-between bg-gradient-to-r from-emerald-950 to-[#042d1b] text-gold-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gold-400/10 flex items-center justify-center border border-gold-400/30 shrink-0">
                <Bot className="w-5 h-5 text-gold-300 animate-pulse" />
              </div>
              <div className="flex flex-col text-right rtl:text-right ltr:text-left">
                <h3 className="font-serif font-black text-sm sm:text-base text-gold-300 flex items-center gap-1.5 leading-none mb-1">
                  {isArabic ? 'المساعد الشرعي الذكي بـالذكاء الاصطناعي' : 'Islamic AI Scholar Assistant'}
                  <span className="text-[9px] font-sans font-bold bg-gold-400/20 text-gold-300 border border-gold-400/30 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                    {isArabic ? 'موثوق' : 'Verified'}
                  </span>
                </h3>
                <p className="text-[10px] text-gold-400/80 font-serif leading-none">
                  {isArabic 
                    ? 'بحث تفسير وفتاوى مستنداً على الأزهر الشريف ودور الإفتاء المعتمدة' 
                    : 'Authentic Tafsir & Fatwa based on Al-Azhar & Official Fatwa Councils'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title={isArabic ? 'محادثة جديدة' : 'New chat'}
                className="p-1.5 rounded-xl hover:bg-emerald-900/50 text-gold-300 transition shrink-0 cursor-pointer border border-transparent hover:border-gold-400/20"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl hover:bg-emerald-900/50 text-gold-300 transition shrink-0 cursor-pointer border border-transparent hover:border-gold-400/20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Body & Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4" id="chat-messages-scroll-area">
            {messages.map((msg) => {
              const isAssistant = msg.role === 'assistant';
              return (
                <div 
                  key={msg.id} 
                  className={`flex gap-3 max-w-[85%] ${isAssistant ? 'mr-auto rtl:ml-auto rtl:mr-0' : 'ml-auto rtl:mr-auto rtl:ml-0 flex-row-reverse'}`}
                >
                  {/* Icon Avatar */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border select-none ${
                    isAssistant 
                      ? 'bg-emerald-950 text-gold-300 border-gold-400/20' 
                      : 'bg-gold-400/10 text-emerald-800 dark:text-gold-250 border-emerald-800/10'
                  }`}>
                    {isAssistant ? <Bot className="w-4 h-4 text-gold-300" /> : <span className="font-bold text-xs">👤</span>}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-1.5">
                    <div className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed border shadow-sm ${
                      isAssistant
                        ? 'bg-emerald-950/5 dark:bg-[#031d10]/45 border-gold-400/15 text-stone-800 dark:text-stone-100 rounded-tl-none'
                        : 'bg-emerald-800 text-stone-100 border-emerald-900 rounded-tr-none'
                    }`}>
                      <p className="whitespace-pre-wrap font-sans">{msg.content}</p>

                      {/* Display Sources Grounding if assistant has verified citations */}
                      {isAssistant && msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3.5 pt-3.5 border-t border-gold-400/10 space-y-2">
                          <p className="text-[10px] font-serif font-black text-emerald-800 dark:text-gold-350 flex items-center gap-1">
                            <Scale className="w-3 h-3 text-gold-400" />
                            {isArabic ? 'المصادر والروابط الرسمية المعتمدة المستند إليها:' : 'Verified Sources & Citations referenced:'}
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {msg.sources.map((source, sIdx) => (
                              <a
                                key={sIdx}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer referrerPolicy='no-referrer'"
                                className="flex items-center justify-between p-2 rounded-xl bg-gold-400/5 dark:bg-[#042214] border border-gold-400/10 hover:border-gold-400/30 text-[10px] text-emerald-900 dark:text-gold-300 hover:underline transition truncate"
                              >
                                <span className="truncate font-sans font-medium max-w-[85%]">{source.title}</span>
                                <ExternalLink className="w-2.5 h-2.5 text-gold-400 shrink-0" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Copy and Timestamp bar */}
                    <div className={`flex items-center gap-2 text-[10px] text-stone-500 dark:text-gold-400/60 px-1 ${
                      isAssistant ? 'justify-start' : 'justify-end'
                    }`}>
                      <button 
                        onClick={() => handleCopy(msg.content, msg.id)}
                        className="hover:text-emerald-800 dark:hover:text-gold-300 transition flex items-center gap-1 cursor-pointer font-sans"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            <span>{isArabic ? 'تم النسخ' : 'Copied'}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>{isArabic ? 'نسخ الإجابة' : 'Copy'}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* AI is thinking loading animation */}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%] mr-auto rtl:ml-auto rtl:mr-0 animate-pulse">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-gold-400/20 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-gold-300" />
                </div>
                <div className="space-y-1.5">
                  <div className="p-4 rounded-2xl bg-emerald-950/5 dark:bg-[#031d10]/45 border border-gold-400/15 rounded-tl-none text-xs flex flex-col gap-2">
                    <div className="flex items-center gap-2 font-serif font-black text-stone-500 dark:text-gold-300/80">
                      <RefreshCw className="w-3 h-3 animate-spin text-gold-500" />
                      <span>{isArabic ? 'جاري البحث في المصادر الإسلامية الموثوقة والفتوى وصياغة الإجابة...' : 'Searching authentic Islamic fatwas & formulating answer...'}</span>
                    </div>
                    <div className="space-y-1.5 w-56 sm:w-80">
                      <div className="h-2.5 bg-stone-200 dark:bg-emerald-900/30 rounded-full w-full" />
                      <div className="h-2.5 bg-stone-200 dark:bg-emerald-900/30 rounded-full w-5/6" />
                      <div className="h-2.5 bg-stone-200 dark:bg-emerald-900/30 rounded-full w-3/4" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error box */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Dummy element for scrolling */}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick preset suggestions if conversation hasn't gone far */}
          {messages.length === 1 && !isLoading && (
            <div className="px-4 sm:px-5 pb-3">
              <p className="text-[10px] font-bold text-stone-500 dark:text-gold-400/60 mb-2 uppercase tracking-wide">
                💡 {isArabic ? 'مواضيع مقترحة للبحث السريع والفتوى:' : 'Suggested topics for quick research & rulings:'}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {presets.map((promptText, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(promptText)}
                    className="px-3 py-1.5 text-xs rounded-xl bg-gold-400/5 hover:bg-gold-400/10 dark:bg-emerald-950/40 dark:hover:bg-gold-500/10 border border-gold-400/20 text-emerald-900 dark:text-gold-300 transition cursor-pointer text-right"
                  >
                    {promptText}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Footer Input form */}
          <div className="p-4 border-t border-gold-400/10 bg-[#FAF7F0] dark:bg-[#02140d]/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3.5 px-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-stone-700 dark:text-gold-200 font-semibold">
                <input
                  type="checkbox"
                  checked={useSearch}
                  onChange={(e) => setUseSearch(e.target.checked)}
                  className="w-4 h-4 rounded border-gold-400/30 text-emerald-900 focus:ring-emerald-800 accent-emerald-800 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className={`w-3.5 h-3.5 ${useSearch ? 'text-gold-500 animate-pulse' : 'text-stone-400 dark:text-gold-500/40'}`} />
                  {isArabic 
                    ? "تفعيل البحث الموسع عبر الإنترنت (دار الإفتاء والأزهر)" 
                    : "Enable live web search (Official Fatwa Councils & Al-Azhar)"}
                </span>
              </label>
              <span className="text-[10px] text-stone-500 dark:text-gold-400/50 italic font-medium">
                {useSearch 
                  ? (isArabic ? "قد يستغرق وقتاً أطول للبحث" : "May take longer to ground search")
                  : (isArabic ? "معرفة النموذج المدمجة (أسرع وأكثر استقراراً)" : "Using offline model knowledge - instant & stable")}
              </span>
            </div>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                placeholder={
                  isArabic 
                    ? 'اسأل عن حكم شرعي، تفسير آية، أو موثوقية حديث...' 
                    : 'Ask about Tafsir, Fatwa, or authenticity of a Hadith...'
                }
                className="flex-1 bg-white dark:bg-[#032014] border-2 border-gold-400/20 focus:border-emerald-800 dark:focus:border-gold-400 rounded-2xl py-2.5 px-4 text-xs sm:text-sm font-semibold text-stone-900 dark:text-gold-100 placeholder-stone-400 dark:placeholder-gold-500/50 outline-none transition"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="px-4 bg-emerald-900 hover:bg-emerald-800 disabled:opacity-40 text-gold-100 dark:text-gold-150 text-xs sm:text-sm font-bold rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-gold-400/30"
              >
                <Send className="w-4 h-4" />
                <span className="hidden sm:inline">{isArabic ? 'إرسال' : 'Send'}</span>
              </button>
            </form>

            <div className="mt-2.5 text-center flex items-center justify-center gap-1.5 text-[9px] text-stone-500 dark:text-gold-400/50">
              <Scale className="w-3 h-3 text-gold-500 shrink-0" />
              <span>
                {isArabic 
                  ? 'تنبيه: يُنصح دائماً باستفتاء دور الإفتاء المباشرة للمسائل الشخصية الشائكة. الإجابات استرشادية وبحثية فقط.'
                  : 'Scholarly Notice: For complex personal trials, directly consult official fatwa councils. Output is for research purposes.'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
