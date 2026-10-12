import { create } from 'zustand';
import { Recipe } from '../types';

interface CookState {
  activeRecipe: Recipe | null;
  currentStepIndex: number;
  isOpen: boolean;
  timerSecondsLeft: number | null;
  timerActive: boolean;

  openCookMode: (recipe: Recipe) => void;
  closeCookMode: () => void;
  nextStep: () => void;
  prevStep: () => void;
  startTimer: (seconds: number) => void;
  pauseTimer: () => void;
  tickTimer: () => void;
}

export const useCookStore = create<CookState>((set, get) => ({
  activeRecipe: null,
  currentStepIndex: 0,
  isOpen: false,
  timerSecondsLeft: null,
  timerActive: false,

  openCookMode: (recipe: Recipe) => {
    set({
      activeRecipe: recipe,
      currentStepIndex: 0,
      isOpen: true,
      timerSecondsLeft: null,
      timerActive: false,
    });
  },

  closeCookMode: () => {
    set({
      activeRecipe: null,
      isOpen: false,
      timerSecondsLeft: null,
      timerActive: false,
    });
  },

  nextStep: () => {
    const { activeRecipe, currentStepIndex } = get();
    if (!activeRecipe) return;
    if (currentStepIndex < activeRecipe.method.length - 1) {
      set({
        currentStepIndex: currentStepIndex + 1,
        timerSecondsLeft: null,
        timerActive: false,
      });
    } else {
      set({ isOpen: false });
    }
  },

  prevStep: () => {
    const { currentStepIndex } = get();
    if (currentStepIndex > 0) {
      set({
        currentStepIndex: currentStepIndex - 1,
        timerSecondsLeft: null,
        timerActive: false,
      });
    }
  },

  startTimer: (seconds: number) => {
    set({ timerSecondsLeft: seconds, timerActive: true });
  },

  pauseTimer: () => {
    set({ timerActive: false });
  },

  tickTimer: () => {
    const { timerSecondsLeft, timerActive } = get();
    if (timerActive && timerSecondsLeft !== null && timerSecondsLeft > 0) {
      set({ timerSecondsLeft: timerSecondsLeft - 1 });
    } else if (timerSecondsLeft === 0) {
      set({ timerActive: false });
    }
  },
}));
