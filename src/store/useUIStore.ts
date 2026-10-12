import { create } from 'zustand';

export type TabId = 'today' | 'recipes' | 'pantry' | 'cook' | 'shopping';

interface UIState {
  activeTab: TabId;
  recipeSearch: string;
  recipeCategory: string;
  readyOnly: boolean;
  flippedRecipeIds: Set<string>;
  
  // Modals
  recipeModalOpen: boolean;
  editingRecipeId: string | null;
  importModalOpen: boolean;
  backupModalOpen: boolean;
  commandPaletteOpen: boolean;

  // Actions
  setActiveTab: (tab: TabId) => void;
  setRecipeSearch: (query: string) => void;
  setRecipeCategory: (category: string) => void;
  setReadyOnly: (val: boolean) => void;
  toggleFlipCard: (recipeId: string) => void;
  openRecipeModal: (recipeId?: string) => void;
  closeRecipeModal: () => void;
  openImportModal: () => void;
  closeImportModal: () => void;
  openBackupModal: () => void;
  closeBackupModal: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  activeTab: 'today',
  recipeSearch: '',
  recipeCategory: 'All',
  readyOnly: false,
  flippedRecipeIds: new Set(),

  recipeModalOpen: false,
  editingRecipeId: null,
  importModalOpen: false,
  backupModalOpen: false,
  commandPaletteOpen: false,

  setActiveTab: (activeTab) => set({ activeTab }),
  setRecipeSearch: (recipeSearch) => set({ recipeSearch }),
  setRecipeCategory: (recipeCategory) => set({ recipeCategory }),
  setReadyOnly: (readyOnly) => set({ readyOnly }),
  toggleFlipCard: (recipeId) =>
    set((state) => {
      const next = new Set(state.flippedRecipeIds);
      if (next.has(recipeId)) next.delete(recipeId);
      else next.add(recipeId);
      return { flippedRecipeIds: next };
    }),
  openRecipeModal: (recipeId) =>
    set({ recipeModalOpen: true, editingRecipeId: recipeId || null }),
  closeRecipeModal: () => set({ recipeModalOpen: false, editingRecipeId: null }),
  openImportModal: () => set({ importModalOpen: true }),
  closeImportModal: () => set({ importModalOpen: false }),
  openBackupModal: () => set({ backupModalOpen: true }),
  closeBackupModal: () => set({ backupModalOpen: false }),
  setCommandPaletteOpen: (commandPaletteOpen) => set({ commandPaletteOpen }),
}));
