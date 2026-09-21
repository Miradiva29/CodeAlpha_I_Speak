import { useEffect, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRightLeft,
  Check,
  ChevronDown,
  Clipboard,
  Copy,
  Languages,
  Loader2,
  MessageCircleMore,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

const queryClient = new QueryClient();

const LANGUAGE_OPTIONS = [
  { name: 'English', code: 'en', speechCode: 'en-US' },
  { name: 'Spanish', code: 'es', speechCode: 'es-ES' },
  { name: 'French', code: 'fr', speechCode: 'fr-FR' },
  { name: 'German', code: 'de', speechCode: 'de-DE' },
  { name: 'Italian', code: 'it', speechCode: 'it-IT' },
  { name: 'Portuguese', code: 'pt', speechCode: 'pt-BR' },
  { name: 'Arabic', code: 'ar', speechCode: 'ar-SA' },
  { name: 'Chinese', code: 'zh-CN', speechCode: 'zh-CN' },
  { name: 'Japanese', code: 'ja', speechCode: 'ja-JP' },
  { name: 'Korean', code: 'ko', speechCode: 'ko-KR' },
  { name: 'Russian', code: 'ru', speechCode: 'ru-RU' },
  { name: 'Hindi', code: 'hi', speechCode: 'hi-IN' },
  { name: 'Turkish', code: 'tr', speechCode: 'tr-TR' },
  { name: 'Dutch', code: 'nl', speechCode: 'nl-NL' },
  { name: 'Polish', code: 'pl', speechCode: 'pl-PL' },
  { name: 'Ukrainian', code: 'uk', speechCode: 'uk-UA' },
  { name: 'Vietnamese', code: 'vi', speechCode: 'vi-VN' },
  { name: 'Indonesian', code: 'id', speechCode: 'id-ID' },
  { name: 'Swahili', code: 'sw', speechCode: 'sw-KE' },
  { name: 'Greek', code: 'el', speechCode: 'el-GR' },
  { name: 'Czech', code: 'cs', speechCode: 'cs-CZ' },
  { name: 'Danish', code: 'da', speechCode: 'da-DK' },
  { name: 'Finnish', code: 'fi', speechCode: 'fi-FI' },
  { name: 'Norwegian', code: 'no', speechCode: 'nb-NO' },
  { name: 'Swedish', code: 'sv', speechCode: 'sv-SE' },
  { name: 'Romanian', code: 'ro', speechCode: 'ro-RO' },
  { name: 'Hebrew', code: 'he', speechCode: 'he-IL' },
  { name: 'Thai', code: 'th', speechCode: 'th-TH' },
  { name: 'Bengali', code: 'bn', speechCode: 'bn-BD' },
  { name: 'Malay', code: 'ms', speechCode: 'ms-MY' },
] as const;

function Home() {
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [copied, setCopied] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    document.title = 'I Speak — Language Translation';
    return () => window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleTranslate = async () => {
    const cleanText = sourceText.trim();
    if (!cleanText) {
      setStatus('error');
      setTranslatedText('');
      setTranslationError('Add a little text first, then try translating.');
      return;
    }
    if (sourceLanguage === targetLanguage) {
      setStatus('error');
      setTranslatedText('');
      setTranslationError('Choose two different languages to translate between.');
      return;
    }

    setStatus('loading');
    setCopied(false);
    setTranslationError('');

    const sourceCode = LANGUAGE_OPTIONS.find(
      (language) => language.name === sourceLanguage,
    )?.code;
    const targetCode = LANGUAGE_OPTIONS.find(
      (language) => language.name === targetLanguage,
    )?.code;

    try {
      const query = new URLSearchParams({
        q: cleanText,
        langpair: `${sourceCode}|${targetCode}`,
      });
      const response = await fetch(
        `https://api.mymemory.translated.net/get?${query.toString()}`,
      );
      if (!response.ok) {
        throw new Error('The translation service is unavailable right now.');
      }
      const result = (await response.json()) as {
        responseData?: { translatedText?: string };
        responseStatus?: number;
      };
      const nextTranslation = result.responseData?.translatedText?.trim();
      if (!nextTranslation || result.responseStatus === 403) {
        throw new Error('The translation service could not translate that text.');
      }

      setTranslatedText(nextTranslation);
      setStatus('success');
    } catch (error) {
      setTranslatedText('');
      setStatus('error');
      setTranslationError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      );
    }
  };

  const handleSwap = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
    setStatus(translatedText ? 'success' : 'idle');
    setTranslationError('');
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    try {
      await navigator.clipboard.writeText(translatedText);
    } catch {
      const temporaryInput = document.createElement('textarea');
      temporaryInput.value = translatedText;
      document.body.appendChild(temporaryInput);
      temporaryInput.select();
      document.execCommand('copy');
      temporaryInput.remove();
    }
    setCopied(true);
  };

  const handleListen = () => {
    if (!translatedText) return;

    if (!('speechSynthesis' in window)) {
      setTranslationError('Text-to-speech is not supported in this browser.');
      setStatus('error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const target = LANGUAGE_OPTIONS.find(
      (language) => language.name === targetLanguage,
    );
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = target?.speechCode ?? 'en-US';
    const matchingVoice = window.speechSynthesis
      .getVoices()
      .find((voice) => voice.lang.toLowerCase().startsWith(utterance.lang.toLowerCase().split('-')[0]));
    if (matchingVoice) utterance.voice = matchingVoice;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setTranslationError('This device could not play the pronunciation.');
      setStatus('error');
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const loadExample = () => {
    setSourceText('Hello, how are you?');
    setStatus('idle');
    setTranslatedText('');
    setCopied(false);
    setTranslationError('');
    setIsSpeaking(false);
  };

  const sourceIsEmpty = !sourceText.trim();
  const errorMessage = translationError || (sourceIsEmpty
    ? 'Add a little text first, then try translating.'
    : 'Choose two different languages to translate between.');

  return (
    <main className="translator-shell noise-layer min-h-[100dvh] overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <div className="flex items-center gap-3" data-testid="brand-language-bridge">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-primary))] shadow-sm">
            <Languages size={20} strokeWidth={2.2} />
          </div>
          <div>
            <p className="font-display text-lg leading-none text-[hsl(var(--foreground))]">I Speak</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
              language translation
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs font-medium text-[hsl(var(--muted-foreground))] sm:flex">
          <span className="h-2 w-2 rounded-full bg-[hsl(var(--primary))]" />
          A clear start to every conversation
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 pt-10 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20">
        <div className="max-w-3xl animate-rise">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--card-border))] bg-[hsl(var(--card)/0.72)] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary))] shadow-sm backdrop-blur-sm">
            <Sparkles size={14} />
            Translation, made human
          </div>
          <h1 className="font-display max-w-3xl text-5xl leading-[0.98] tracking-[-0.035em] text-[hsl(var(--foreground))] sm:text-6xl lg:text-7xl">
            Speak clearly.
            <span className="text-[hsl(var(--primary))]"> Anywhere.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[hsl(var(--muted-foreground))] sm:text-lg">
            Translate ideas, messages, and moments with a tool that keeps every
            language within reach.
          </p>
        </div>

        <div className="soft-grid mt-12 rounded-[2rem] border border-[hsl(var(--card-border))] p-2 shadow-[var(--shadow-md)] animate-rise-delay sm:p-3 lg:mt-16">
          <div className="rounded-[1.5rem] bg-[hsl(var(--card)/0.9)] p-5 backdrop-blur-xl sm:p-7 lg:p-9">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground))]">
                  Your translation desk
                </p>
                <h2 className="font-display mt-2 text-2xl text-[hsl(var(--foreground))] sm:text-3xl">
                  Start with a sentence
                </h2>
              </div>
              <button
                type="button"
                onClick={loadExample}
                data-testid="button-load-example"
                className="group inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--border))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-transform hover:-translate-y-0.5 hover:border-[hsl(var(--primary)/0.45)] hover:text-[hsl(var(--primary))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
              >
                <Clipboard size={14} />
                Try an example
                <span className="text-[hsl(var(--accent))] transition-transform group-hover:translate-x-0.5">→</span>
              </button>
            </div>

            <div className="grid items-stretch gap-3 lg:grid-cols-[minmax(0,1fr)_52px_minmax(0,1fr)]">
              <LanguagePanel
                label="I speak"
                language={sourceLanguage}
                onLanguageChange={setSourceLanguage}
                text={sourceText}
                onTextChange={(value) => {
                  setSourceText(value);
                  if (status !== 'idle') setStatus('idle');
                  setTranslationError('');
                }}
                placeholder="Type something to translate..."
                count={sourceText.length}
                side="source"
              />

              <div className="flex items-center justify-center lg:pt-8">
                <button
                  type="button"
                  onClick={handleSwap}
                  data-testid="button-swap-languages"
                  aria-label="Swap languages"
                  className="group flex h-11 w-11 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background)/0.72)] text-[hsl(var(--primary))] transition-transform hover:-rotate-180 hover:border-[hsl(var(--primary)/0.45)] hover:bg-[hsl(var(--primary)/0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
                >
                  <ArrowRightLeft size={18} />
                </button>
              </div>

              <LanguagePanel
                label="I want"
                language={targetLanguage}
                onLanguageChange={(value) => {
                  window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                  setTargetLanguage(value);
                  setTranslatedText('');
                  if (status !== 'idle') setStatus('idle');
                  setTranslationError('');
                }}
                text={translatedText}
                placeholder="Your translation will appear here..."
                count={translatedText.length}
                side="result"
                readOnly
                status={status}
                copied={copied}
                 onCopy={handleCopy}
                 isSpeaking={isSpeaking}
                 onListen={handleListen}
              />
            </div>

            {status === 'error' && (
              <div
                role="alert"
                data-testid="status-translation-error"
                className="mt-4 flex items-center gap-2 rounded-xl border border-[hsl(var(--destructive)/0.2)] bg-[hsl(var(--destructive)/0.07)] px-4 py-3 text-sm text-[hsl(var(--destructive))]"
              >
                <AlertCircle size={17} />
                {errorMessage}
              </div>
            )}

            <div className="mt-7 flex flex-col-reverse items-stretch justify-between gap-4 border-t border-[hsl(var(--border))] pt-6 sm:flex-row sm:items-center">
              <p className="flex items-center gap-2 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
                <MessageCircleMore size={16} className="text-[hsl(var(--accent))]" />
                Side by side, so the meaning stays visible.
              </p>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={status === 'loading'}
                data-testid="button-translate"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-[0_8px_18px_hsl(var(--primary)/0.2)] transition-[transform,box-shadow,background-color] hover:-translate-y-0.5 hover:bg-[hsl(var(--primary)/0.9)] hover:shadow-[0_12px_24px_hsl(var(--primary)/0.26)] disabled:cursor-wait disabled:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    Translating
                  </>
                ) : (
                  <>
                    Translate
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[hsl(var(--muted-foreground))] animate-rise-delay-2">
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} className="text-[hsl(var(--primary))]" />
            Clear, beginner-friendly results
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} className="text-[hsl(var(--primary))]" />
             30 languages to get started
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Check size={14} className="text-[hsl(var(--primary))]" />
            Copy with one click
          </span>
        </div>
      </section>
    </main>
  );
}

type LanguagePanelProps = {
  label: string;
  language: string;
  onLanguageChange?: (value: string) => void;
  text: string;
  onTextChange?: (value: string) => void;
  placeholder: string;
  count: number;
  side: 'source' | 'result';
  readOnly?: boolean;
  status?: 'idle' | 'loading' | 'success' | 'error';
  copied?: boolean;
  onCopy?: () => void;
  isSpeaking?: boolean;
  onListen?: () => void;
};

function LanguagePanel({
  label,
  language,
  onLanguageChange,
  text,
  onTextChange,
  placeholder,
  count,
  side,
  readOnly = false,
  status = 'idle',
  copied = false,
  onCopy,
  isSpeaking = false,
  onListen,
}: LanguagePanelProps) {
  return (
    <div
      className={`relative flex min-h-[268px] flex-col rounded-2xl border p-4 transition-[border-color,background-color] sm:p-5 ${
        side === 'source'
          ? 'border-[hsl(var(--border))] bg-[hsl(var(--background)/0.6)] focus-within:border-[hsl(var(--primary)/0.45)]'
          : 'border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--primary)/0.055)]'
      }`}
      data-testid={`panel-${side}`}
    >
      <div className="flex items-center justify-between">
        <label
          htmlFor={`language-${side}`}
          className="text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]"
        >
          {label}
        </label>
        <div className="relative">
          <select
            id={`language-${side}`}
            value={language}
            onChange={(event) => onLanguageChange?.(event.target.value)}
            data-testid={`select-${side}-language`}
            className="h-9 appearance-none rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.75)] py-0 pl-3 pr-8 text-xs font-bold text-[hsl(var(--foreground))] outline-none transition-colors hover:border-[hsl(var(--primary)/0.45)] focus:border-[hsl(var(--ring))] disabled:cursor-default disabled:opacity-100"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.code} value={option.name}>{option.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
        </div>
      </div>

      <div className="relative mt-5 flex flex-1">
        {status === 'loading' && side === 'result' ? (
          <div className="w-full space-y-3 pt-1" data-testid="status-translation-loading" aria-label="Translation loading">
            <div className="h-4 w-11/12 animate-pulse rounded-full bg-[hsl(var(--primary)/0.12)]" />
            <div className="h-4 w-8/12 animate-pulse rounded-full bg-[hsl(var(--primary)/0.12)]" />
            <div className="h-4 w-10/12 animate-pulse rounded-full bg-[hsl(var(--primary)/0.12)]" />
          </div>
        ) : (
          <textarea
            value={text}
            onChange={(event) => onTextChange?.(event.target.value)}
            readOnly={readOnly}
            maxLength={500}
            placeholder={placeholder}
            data-testid={`textarea-${side}-text`}
            className={`min-h-[166px] w-full resize-none border-0 bg-transparent text-[1.05rem] leading-8 outline-none placeholder:text-[hsl(var(--muted-foreground)/0.62)] ${
              side === 'result' ? 'pr-3 text-[hsl(var(--foreground))]' : 'text-[hsl(var(--foreground))]'
            }`}
          />
        )}
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[11px] text-[hsl(var(--muted-foreground))]" data-testid={`text-character-count-${side}`}>
          {count}/500
        </span>
        {side === 'result' && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onListen}
              disabled={!text || status === 'loading'}
              data-testid="button-listen-translation"
              aria-label={isSpeaking ? 'Stop listening' : 'Listen to translation'}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)/0.1)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            >
              {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
              {isSpeaking ? 'Stop' : 'Listen'}
            </button>
            <button
              type="button"
              onClick={onCopy}
              disabled={!text || status === 'loading'}
              data-testid="button-copy-translation"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[hsl(var(--primary))] transition-colors hover:bg-[hsl(var(--primary)/0.1)] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
        {side === 'source' && text && (
          <button
            type="button"
            onClick={() => onTextChange?.('')}
            data-testid="button-clear-source"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))]"
          >
            <RotateCcw size={13} />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
