import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { usePantryStore } from '../../store/usePantryStore';
import { useCookStore } from '../../store/useCookStore';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    openRecipeModal,
    openBackupModal,
  } = useUIStore();
  const { recipes } = usePantryStore();
  const { openCookMode } = useCookStore();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener: Cmd/Ctrl + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      } else if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  // Search recipes
  const matchingRecipes = q
    ? recipes.filter((r) => r.name.toLowerCase().includes(q)).slice(0, 5)
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/80 backdrop-blur-sm"
      onClick={() => setCommandPaletteOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-[560px] gl rounded-2xl border border-line bg-[#121a16] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b border-line flex items-center gap-2">
          <span className="text-mut text-sm">🔍</span>
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search recipe..."
            className="w-full bg-transparent text-sm text-ink placeholder:text-mut focus:outline-none"
          />
          <span className="text-[10px] text-mut px-2 py-0.5 rounded border border-line">
            ESC
          </span>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1 text-xs">
          {/* Quick Actions */}
          <div className="text-[10px] uppercase tracking-wider text-mut px-3 py-1 font-semibold">
            Navigation & Actions
          </div>
          <button
            onClick={() => {
              setActiveTab('today');
              setCommandPaletteOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-ink hover:bg-white/[0.06] flex items-center justify-between"
          >
            <span>Go to Today's Dashboard</span>
            <span className="text-mut">Tab 1</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('recipes');
              setCommandPaletteOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-ink hover:bg-white/[0.06] flex items-center justify-between"
          >
            <span>Go to Recipe Library</span>
            <span className="text-mut">Tab 2</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('pantry');
              setCommandPaletteOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-ink hover:bg-white/[0.06] flex items-center justify-between"
          >
            <span>Open Pantry Shelves</span>
            <span className="text-mut">Tab 3</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('cook');
              setCommandPaletteOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-ink hover:bg-white/[0.06] flex items-center justify-between"
          >
            <span>Open Cook Now</span>
            <span className="text-mut">Tab 4</span>
          </button>
          <button
            onClick={() => {
              openRecipeModal();
              setCommandPaletteOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-gold hover:bg-white/[0.06] flex items-center justify-between"
          >
            <span>+ Add New Recipe</span>
            <span className="text-mut">Form</span>
          </button>
          <button
            onClick={() => {
              openBackupModal();
              setCommandPaletteOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-ink hover:bg-white/[0.06] flex items-center justify-between"
          >
            <span>Open Backup & Restore</span>
            <span className="text-mut">JSON</span>
          </button>

          {/* Recipes result */}
          {matchingRecipes.length > 0 && (
            <>
              <div className="text-[10px] uppercase tracking-wider text-mut px-3 pt-3 pb-1 font-semibold">
                Recipes
              </div>
              {matchingRecipes.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    openCookMode(r);
                    setCommandPaletteOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-ink hover:bg-white/[0.06] flex items-center justify-between"
                >
                  <span className="font-serif text-sm">{r.name}</span>
                  <span className="text-mut text-[10px]">{r.category}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
