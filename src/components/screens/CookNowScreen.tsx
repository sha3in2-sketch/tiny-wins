import React, { useMemo } from 'react';
import { usePantryStore } from '../../store/usePantryStore';
import { calculateRecipeMatches } from '../../utils/recipeMatching';
import { RecipeCard } from '../recipes/RecipeCard';

export const CookNowScreen: React.FC = () => {
  const { recipes, ingredients } = usePantryStore();

  const ingsMap = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const matches = useMemo(
    () => calculateRecipeMatches(recipes, ingsMap),
    [recipes, ingsMap]
  );

  // Ready recipes (0 missing)
  const readyMatches = useMemo(() => matches.filter((m) => m.isReady), [matches]);

  // Almost there (1 to 2 missing)
  const almostReadyMatches = useMemo(() => {
    return matches
      .filter((m) => m.missingCount >= 1 && m.missingCount <= 2 && m.haveCount > 0)
      .sort((a, b) => a.missingCount - b.missingCount || b.haveCount - a.haveCount);
  }, [matches]);

  return (
    <div className="space-y-8">
      {/* SECTION 1: READY TO COOK */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-3xl font-medium text-ink">
            Ready to cook <span className="text-sage text-2xl">({readyMatches.length})</span>
          </h2>
          <span className="text-xs text-mut">All ingredients on hand</span>
        </div>

        {readyMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {readyMatches.map((m) => (
              <RecipeCard key={m.recipe.id} match={m} />
            ))}
          </div>
        ) : (
          <div className="gl p-10 rounded-[20px] text-center text-mut text-sm">
            No recipes are 100% ready yet. Check "Almost there" below or tick a few more items in your pantry.
          </div>
        )}
      </div>

      {/* SECTION 2: ALMOST THERE (1-2 MISSING) */}
      <div>
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="font-serif text-3xl font-medium text-ink">
            Almost there · 1–2 missing{' '}
            <span className="text-gold text-2xl">({almostReadyMatches.length})</span>
          </h2>
          <span className="text-xs text-mut">One or two pantry items away</span>
        </div>

        {almostReadyMatches.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {almostReadyMatches.map((m) => (
              <RecipeCard key={m.recipe.id} match={m} />
            ))}
          </div>
        ) : (
          <div className="gl p-10 rounded-[20px] text-center text-mut text-sm">
            Tick some ingredients in your pantry to see nearby unlockable recipes.
          </div>
        )}
      </div>
    </div>
  );
};
