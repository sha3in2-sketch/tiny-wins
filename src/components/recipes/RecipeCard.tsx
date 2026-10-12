import { RecipeMatchResult } from '../../utils/recipeMatching';
import { useUIStore } from '../../store/useUIStore';
import { usePantryStore } from '../../store/usePantryStore';
import { useCookStore } from '../../store/useCookStore';

interface RecipeCardProps {
  match: RecipeMatchResult;
  onIngredientClick?: (ingredientName: string) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ match, onIngredientClick }) => {
  const { recipe, haveRefs, missingRefs, totalCount, percentMatch, isReady } = match;
  const { flippedRecipeIds, toggleFlipCard, openRecipeModal } = useUIStore();
  const { toggleFavoriteRecipe, toggleIngredientState } = usePantryStore();
  const { openCookMode } = useCookStore();

  const isFlipped = flippedRecipeIds.has(recipe.id);

  const missingNames = missingRefs.map((r) => r.rawText);
  const missingSummary =
    missingRefs.length === 0
      ? `All ${totalCount} ingredients on hand`
      : `${haveRefs.length} of ${totalCount} · missing ${missingNames.slice(0, 2).join(', ')}${
          missingNames.length > 2 ? ` +${missingNames.length - 2}` : ''
        }`;

  return (
    <div
      className="flip-card h-[310px] w-full cursor-pointer select-none"
      onClick={(e) => {
        // Only flip if not clicking a direct interactive button
        const target = e.target as HTMLElement;
        if (
          target.closest('button') ||
          target.closest('input') ||
          target.closest('.interactive-chip')
        ) {
          return;
        }
        toggleFlipCard(recipe.id);
      }}
    >
      <div className={`flip-inner ${isFlipped ? 'flipped' : ''}`}>
        {/* FRONT FACE */}
        <div className="flip-face gl p-5 flex flex-col justify-between border border-line hover:border-gold/50 transition-colors bg-[#17201c]/95">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-[1.8px] uppercase text-mut flex items-center">
              <span
                className={`inline-block w-[7px] h-[7px] rounded-full mr-2 cat-${recipe.category}`}
              />
              {recipe.category}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavoriteRecipe(recipe.id);
              }}
              className="star text-gold text-xl hover:scale-110 active:scale-95 transition-transform"
              aria-label={recipe.favorite ? 'Unfavorite recipe' : 'Favorite recipe'}
            >
              {recipe.favorite ? '★' : '☆'}
            </button>
          </div>

          <div className="my-auto py-2">
            <h3 className="font-serif text-2xl font-medium tracking-tight text-ink leading-tight line-clamp-2">
              {recipe.name}
            </h3>
            {recipe.source === 'user' && (
              <span className="inline-block mt-1 text-[10px] text-mut uppercase tracking-wider">
                Personal
              </span>
            )}
          </div>

          <div>
            <div className="text-xs text-mut mb-2 truncate">{missingSummary}</div>
            {/* Progress bar */}
            <div className="h-[2px] w-full bg-line rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  isReady ? 'bg-sage' : 'bg-gold'
                }`}
                style={{ width: `${percentMatch}%` }}
              />
            </div>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="flip-face flip-back gl p-5 flex flex-col justify-between border border-line bg-[#17201c]/95 text-xs text-[#d9d1c3]">
          <div className="overflow-y-auto pr-1 flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium tracking-[1.8px] uppercase text-mut flex items-center">
                <span
                  className={`inline-block w-[7px] h-[7px] rounded-full mr-2 cat-${recipe.category}`}
                />
                {recipe.category}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openRecipeModal(recipe.id);
                }}
                className="text-[11px] text-mut hover:text-gold transition-colors underline"
              >
                Edit
              </button>
            </div>

            <h4 className="text-[10px] font-medium tracking-wider uppercase text-mut mt-3 mb-1.5">
              Ingredients · Tap to toggle
            </h4>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {/* Show missing ingredients first, then have */}
              {missingRefs.map((ref) => (
                <button
                  key={ref.ingredientId}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIngredientState(ref.ingredientId);
                    onIngredientClick?.(ref.rawText);
                  }}
                  className="interactive-chip text-[11px] px-2.5 py-1 rounded-full border border-clay/40 text-clay hover:border-gold hover:text-ink transition-colors"
                >
                  {ref.rawText}
                </button>
              ))}
              {haveRefs.map((ref) => (
                <button
                  key={ref.ingredientId}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleIngredientState(ref.ingredientId);
                    onIngredientClick?.(ref.rawText);
                  }}
                  className="interactive-chip text-[11px] px-2.5 py-1 rounded-full border border-sage/40 bg-sage/10 text-[#d6ecd9] hover:border-gold transition-colors"
                >
                  ✓ {ref.rawText}
                </button>
              ))}
            </div>

            <h4 className="text-[10px] font-medium tracking-wider uppercase text-mut mt-3 mb-1.5">
              Method
            </h4>
            <p className="text-[12.5px] leading-relaxed text-[#d9d1c3]/90 whitespace-pre-line mb-3">
              {recipe.rawMethod}
            </p>
          </div>

          <div className="pt-3 border-t border-line flex items-center gap-2 mt-auto">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openCookMode(recipe);
              }}
              className="flex-1 py-2 px-3 rounded-full text-xs font-medium bg-ink text-[#0d1210] hover:bg-opacity-90 active:scale-95 transition-all"
            >
              Cook mode
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFlipCard(recipe.id);
              }}
              className="py-2 px-3 rounded-full text-xs font-medium border border-line text-ink hover:border-ink/40 active:scale-95 transition-all"
            >
              Flip back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
