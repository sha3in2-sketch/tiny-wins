import React, { useMemo } from 'react';
import { usePantryStore } from '../../store/usePantryStore';
import { useUIStore } from '../../store/useUIStore';
import { calculateRecipeMatches } from '../../utils/recipeMatching';
import { RecipeCard } from '../recipes/RecipeCard';

export const RecipesScreen: React.FC = () => {
  const { recipes, ingredients } = usePantryStore();
  const {
    recipeSearch,
    setRecipeSearch,
    recipeCategory,
    setRecipeCategory,
    readyOnly,
    setReadyOnly,
  } = useUIStore();

  const ingsMap = useMemo(() => new Map(ingredients.map((i) => [i.id, i])), [ingredients]);
  const matches = useMemo(
    () => calculateRecipeMatches(recipes, ingsMap),
    [recipes, ingsMap]
  );

  const categories = ['All', '★', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink', 'Mine'];

  const filteredMatches = useMemo(() => {
    const q = recipeSearch.toLowerCase().trim();

    return matches.filter((m) => {
      // Category filter
      if (recipeCategory === '★' && !m.recipe.favorite) return false;
      if (recipeCategory !== 'All' && recipeCategory !== '★') {
        if (recipeCategory === 'Mine' && m.recipe.source !== 'user') return false;
        if (recipeCategory !== 'Mine' && m.recipe.category !== recipeCategory) return false;
      }

      // Ready filter
      if (readyOnly && !m.isReady) return false;

      // Text query
      if (q) {
        const matchesName = m.recipe.name.toLowerCase().includes(q);
        const matchesCat = m.recipe.category.toLowerCase().includes(q);
        const matchesIngs = m.recipe.ingredientRefs.some((ref) =>
          ref.rawText.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesCat && !matchesIngs) return false;
      }

      return true;
    });
  }, [matches, recipeCategory, readyOnly, recipeSearch]);

  return (
    <div className="space-y-5">
      {/* Search and Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="search"
          value={recipeSearch}
          onChange={(e) => setRecipeSearch(e.target.value)}
          placeholder="Search recipe, ingredient, category…"
          className="flex-1 min-w-[200px] text-sm px-4 py-2.5 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none transition-colors"
        />

        <select
          value={recipeCategory}
          onChange={(e) => setRecipeCategory(e.target.value)}
          aria-label="Filter by category"
          className="text-sm px-3.5 py-2.5 rounded-xl border border-line bg-white/[0.04] text-ink focus:border-gold outline-none transition-colors"
        >
          {categories.map((c) => (
            <option key={c} value={c} className="bg-[#121a16] text-ink">
              {c === '★' ? '★ Favorites' : c}
            </option>
          ))}
        </select>

        <button
          onClick={() => setReadyOnly(!readyOnly)}
          className={`border rounded-full px-4 py-2.5 text-xs font-medium transition-all ${
            readyOnly
              ? 'bg-sage/20 border-sage text-[#d6ecd9]'
              : 'border-line text-ink hover:border-ink/40'
          }`}
        >
          {readyOnly ? '✓ Ready only' : 'Ready only'}
        </button>
      </div>

      {/* Grid of 3D Flip Cards */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredMatches.map((match) => (
            <RecipeCard key={match.recipe.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="gl p-12 text-center rounded-[20px] text-mut text-sm">
          No recipes found matching your filter.
        </div>
      )}
    </div>
  );
};
