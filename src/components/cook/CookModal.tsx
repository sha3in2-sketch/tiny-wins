import React, { useEffect, useMemo } from 'react';
import { useCookStore } from '../../store/useCookStore';
import { usePantryStore } from '../../store/usePantryStore';

/**
 * Parses timer duration from step text (e.g. "10 min", "15-20 min")
 */
function parseTimerMinutes(text: string): number | null {
  const match = text.match(/(\d+)(?:-\d+)?\s*(?:min|minute|minutes)/i);
  if (match && match[1]) {
    const mins = parseInt(match[1], 10);
    return isNaN(mins) ? null : mins;
  }
  return null;
}

export const CookModal: React.FC = () => {
  const {
    activeRecipe,
    currentStepIndex,
    isOpen,
    timerSecondsLeft,
    timerActive,
    closeCookMode,
    nextStep,
    prevStep,
    startTimer,
    pauseTimer,
    tickTimer,
  } = useCookStore();

  const { ingredients } = usePantryStore();
  const ingsMap = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);

  // Screen Wake Lock API implementation
  useEffect(() => {
    if (!isOpen) return;
    let wakeLockSentinel: any = null;

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator) {
          wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock request error:', err);
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isOpen) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (wakeLockSentinel) {
        wakeLockSentinel.release().catch(() => {});
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isOpen]);

  // Timer interval ticker
  useEffect(() => {
    if (!timerActive) return;
    const interval = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, tickTimer]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        prevStep();
      } else if (e.key === 'Escape') {
        closeCookMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, prevStep, closeCookMode]);

  if (!isOpen || !activeRecipe) return null;

  const steps = activeRecipe.method;
  const currentStepText = steps[currentStepIndex] || '';
  const detectedMinutes = parseTimerMinutes(currentStepText);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[680px] min-h-[70vh] gl p-7 sm:p-10 rounded-[28px] border border-line bg-[#121a16] text-ink flex flex-col justify-between text-center relative shadow-2xl">
        {/* Close Button */}
        <button
          onClick={closeCookMode}
          className="absolute top-5 right-5 w-8 h-8 rounded-full border border-line text-mut hover:text-ink hover:border-gold flex items-center justify-center text-sm transition-colors"
          aria-label="Close cook mode"
        >
          ✕
        </button>

        {/* Top Header */}
        <div>
          <span className="text-[11px] font-medium tracking-[2px] uppercase text-mut inline-flex items-center justify-center gap-2 mb-2">
            <span
              className={`inline-block w-2 h-2 rounded-full cat-${activeRecipe.category}`}
            />
            {activeRecipe.category}
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-ink mb-4">
            {activeRecipe.name}
          </h2>

          {/* Ingredient Pills */}
          <div className="flex flex-wrap justify-center gap-1.5 max-h-24 overflow-y-auto px-2">
            {activeRecipe.ingredientRefs.map((ref) => {
              const ing = ingsMap.get(ref.ingredientId);
              const hasIt = ing && (ing.state === 'have' || ing.alwaysHave);
              return (
                <span
                  key={ref.ingredientId}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full border ${
                    hasIt
                      ? 'border-sage/40 bg-sage/10 text-[#d6ecd9]'
                      : 'border-clay/40 text-clay'
                  }`}
                >
                  {hasIt ? '✓ ' : ''}{ref.rawText}
                </span>
              );
            })}
          </div>
        </div>

        {/* Center: Current Step */}
        <div className="my-8 px-2">
          <div className="text-xs font-semibold uppercase tracking-[2px] text-mut mb-4">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
          <p className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal leading-snug text-ink text-center max-w-[580px] mx-auto">
            {currentStepText}
          </p>

          {/* Smart Step Timer */}
          {detectedMinutes && (
            <div className="mt-6 flex items-center justify-center gap-3">
              {timerSecondsLeft !== null ? (
                <div className="flex items-center gap-3 bg-white/[0.04] px-5 py-2 rounded-full border border-gold/40">
                  <span className="font-mono text-xl text-gold font-medium">
                    ⏱ {formatTimer(timerSecondsLeft)}
                  </span>
                  <button
                    onClick={() => (timerActive ? pauseTimer() : startTimer(timerSecondsLeft))}
                    className="text-xs px-3 py-1 rounded-full border border-line text-ink hover:border-gold transition-colors"
                  >
                    {timerActive ? 'Pause' : 'Resume'}
                  </button>
                  <button
                    onClick={() => startTimer(detectedMinutes * 60)}
                    className="text-xs text-mut hover:text-ink underline ml-1"
                  >
                    Reset
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startTimer(detectedMinutes * 60)}
                  className="text-xs px-4 py-2 rounded-full border border-gold/40 bg-gold/15 text-gold hover:bg-gold/25 transition-all flex items-center gap-1.5"
                >
                  <span>⏱ Start {detectedMinutes} min timer</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom: Progress Dots and Navigation */}
        <div>
          {/* Step Dots */}
          <div className="flex justify-center items-center gap-1.5 mb-6">
            {steps.map((_, idx) => (
              <span
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx <= currentStepIndex ? 'bg-gold w-3' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={prevStep}
              disabled={currentStepIndex === 0}
              className={`border border-line rounded-full px-6 py-2.5 text-sm font-medium transition-all ${
                currentStepIndex === 0
                  ? 'opacity-30 cursor-not-allowed text-mut'
                  : 'text-ink hover:border-ink/50 active:scale-95'
              }`}
            >
              ← Back
            </button>
            <button
              onClick={nextStep}
              className="border border-ink rounded-full px-7 py-2.5 text-sm font-medium bg-ink text-[#0d1210] hover:bg-opacity-90 active:scale-95 transition-all shadow-md"
            >
              {currentStepIndex < steps.length - 1 ? 'Next →' : 'Done ✓'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
