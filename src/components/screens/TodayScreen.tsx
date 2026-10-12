import React, { useMemo } from 'react';
import { usePantryStore } from '../../store/usePantryStore';
import { useUIStore } from '../../store/useUIStore';
import {
  calculateRecipeMatches,
  calculateOneAwayUnlocks,
  getTonightsPick,
} from '../../utils/recipeMatching';
import { useCookStore } from '../../store/useCookStore';

export const TodayScreen: React.FC = () => {
  const { ingredients, recipes, addIngredientQuick, toggleIngredientState } = usePantryStore();
  const { setActiveTab } = useUIStore();
  const { openCookMode } = useCookStore();
  const [quickInput, setQuickInput] = React.useState('');

  const ingsMap = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);

  const matches = useMemo(
    () => calculateRecipeMatches(recipes, ingsMap),
    [recipes, ingsMap]
  );

  const readyMatches = useMemo(() => matches.filter((m) => m.isReady), [matches]);
  const oneAwayUnlocks = useMemo(
    () => calculateOneAwayUnlocks(matches, ingsMap).slice(0, 8),
    [matches, ingsMap]
  );
  const tonightsPick = useMemo(() => getTonightsPick(matches), [matches]);

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;
    await addIngredientQuick(quickInput.trim(), true);
    setQuickInput('');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5">
      {/* HERO TILE: TONIGHT'S PICK */}
      <div className="gl p-7 md:col-span-4 rounded-[20px] relative overflow-hidden">
        <h4 className="text-[11px] font-medium tracking-[2px] uppercase text-mut mb-2">
          Tonight
        </h4>

        {tonightsPick ? (
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-ink mb-2">
              {tonightsPick.recipe.name}
            </h2>
            <p className="text-sm text-mut mb-5">
              {tonightsPick.missingCount === 0
                ? 'Everything is on hand.'
                : `${tonightsPick.haveCount} of ${tonightsPick.totalCount} ingredients on hand`}
            </p>

            {/* Columns of ingredients with checkmarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2 my-5">
              {tonightsPick.recipe.ingredientRefs.map((ref) => {
                const ing = ingsMap.get(ref.ingredientId);
                const hasIt = ing && (ing.state === 'have' || ing.alwaysHave);
                return (
                  <button
                    key={ref.ingredientId}
                    onClick={() => toggleIngredientState(ref.ingredientId)}
                    className={`text-left text-sm py-1.5 border-b border-line transition-colors flex items-center justify-between ${
                      hasIt ? 'text-ink font-medium' : 'text-mut hover:text-ink'
                    }`}
                  >
                    <span>
                      <span className={`mr-2 ${hasIt ? 'text-sage' : 'text-mut'}`}>
                        {hasIt ? '✓' : '○'}
                      </span>
                      {ref.rawText}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="h-[2px] w-full bg-line rounded-full overflow-hidden my-4">
              <div
                className={`h-full transition-all duration-300 ${
                  tonightsPick.isReady ? 'bg-sage' : 'bg-gold'
                }`}
                style={{ width: `${tonightsPick.percentMatch}%` }}
              />
            </div>

            {/* Action buttons */}
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                onClick={() => openCookMode(tonightsPick.recipe)}
                className="border border-ink rounded-full px-6 py-2.5 text-sm font-medium bg-ink text-[#0d1210] hover:bg-opacity-90 active:scale-95 transition-all"
              >
                Start cooking
              </button>
              <button
                onClick={() => setActiveTab('cook')}
                className="border border-line rounded-full px-6 py-2.5 text-sm font-medium bg-transparent text-ink hover:border-ink/50 active:scale-95 transition-all"
              >
                Everything I can cook
              </button>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="font-serif text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-ink mb-2">
              What's in your <em className="text-gold italic">kitchen</em>?
            </h2>
            <p className="text-sm text-mut mb-5">
              Tick a few ingredients in your pantry and the best dinner rises to the top.
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <button
                onClick={() => setActiveTab('pantry')}
                className="border border-ink rounded-full px-6 py-2.5 text-sm font-medium bg-ink text-[#0d1210] hover:bg-opacity-90 active:scale-95 transition-all"
              >
                Open pantry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* READY NOW TILE */}
      <div className="gl p-5 rounded-[20px] flex flex-col justify-between">
        <h4 className="text-[11px] font-medium tracking-[2px] uppercase text-mut mb-2">
          Ready now
        </h4>
        <div className="font-serif text-6xl md:text-7xl font-medium tracking-tighter text-ink leading-none my-2">
          {readyMatches.length}
        </div>
        <div className="text-xs text-mut">of {recipes.length} recipes</div>
      </div>

      {/* ONE INGREDIENT AWAY TILE */}
      <div className="gl p-5 md:col-span-2 rounded-[20px] flex flex-col justify-between">
        <h4 className="text-[11px] font-medium tracking-[2px] uppercase text-mut mb-2">
          One ingredient away
        </h4>
        <div className="flex flex-wrap gap-1.5 my-2">
          {oneAwayUnlocks.length > 0 ? (
            oneAwayUnlocks.map((u) => (
              <button
                key={u.ingredientId}
                onClick={() => addIngredientQuick(u.name, true)}
                className="text-xs px-3 py-1.5 rounded-full border border-line bg-transparent hover:border-gold text-ink transition-colors flex items-center gap-1.5"
                title={`Mark ${u.name} as on-hand to unlock ${u.unlockCount} recipe(s)`}
              >
                <span>+ {u.name}</span>
                <span className="text-mut text-[10px]">· {u.unlockCount}</span>
              </button>
            ))
          ) : (
            <span className="text-xs text-mut leading-relaxed">
              Tick some ingredients to see which single item unlocks the most dishes.
            </span>
          )}
        </div>
        <div className="text-[11px] text-mut">Tap to mark as on-hand and unlock recipes</div>
      </div>

      {/* QUICK ADD INGREDIENT TILE */}
      <div className="gl p-5 rounded-[20px] flex flex-col justify-between">
        <h4 className="text-[11px] font-medium tracking-[2px] uppercase text-mut mb-2">
          Quick add
        </h4>
        <form onSubmit={handleQuickAdd} className="space-y-3">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="e.g. paneer"
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none transition-colors"
          />
          <button
            type="submit"
            className="w-full border border-ink rounded-full py-2 text-xs font-medium bg-ink text-[#0d1210] hover:bg-opacity-90 active:scale-95 transition-all"
          >
            Add & mark have
          </button>
        </form>
      </div>

      {/* FAVORITES LIST */}
      <div className="gl p-5 md:col-span-2 rounded-[20px]">
        <h4 className="text-[11px] font-medium tracking-[2px] uppercase text-mut mb-2">
          Favorites
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {recipes.filter((r) => r.favorite).length > 0 ? (
            recipes
              .filter((r) => r.favorite)
              .map((r) => (
                <button
                  key={r.id}
                  onClick={() => openCookMode(r)}
                  className="text-xs px-3 py-1.5 rounded-full border border-line hover:border-gold text-ink transition-colors"
                >
                  ★ {r.name}
                </button>
              ))
          ) : (
            <span className="text-xs text-mut">Star a recipe in the Recipes tab to keep it here.</span>
          )}
        </div>
      </div>

      {/* READY LIST PREVIEW */}
      <div className="gl p-5 md:col-span-2 rounded-[20px]">
        <h4 className="text-[11px] font-medium tracking-[2px] uppercase text-mut mb-2">
          Ready to cook
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {readyMatches.length > 0 ? (
            readyMatches.slice(0, 8).map((m) => (
              <button
                key={m.recipe.id}
                onClick={() => openCookMode(m.recipe)}
                className="text-xs px-3 py-1.5 rounded-full border border-sage/40 bg-sage/10 text-[#d6ecd9] hover:border-gold transition-colors"
              >
                {m.recipe.name}
              </button>
            ))
          ) : (
            <span className="text-xs text-mut">Nothing fully ready yet. Tweak pantry items or add staples.</span>
          )}
        </div>
      </div>
    </div>
  );
};
