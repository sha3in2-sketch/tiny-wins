import { Ingredient, Recipe, RecipeIngredientRef } from '../types';

export interface RecipeMatchResult {
  recipe: Recipe;
  haveRefs: RecipeIngredientRef[];
  missingRefs: RecipeIngredientRef[];
  totalCount: number;
  haveCount: number;
  missingCount: number;
  percentMatch: number;
  isReady: boolean;
}

/**
 * Calculates match statistics for a list of recipes against active ingredients
 */
export function calculateRecipeMatches(
  recipes: Recipe[],
  ingredientsMap: Map<string, Ingredient>
): RecipeMatchResult[] {
  return recipes.map((recipe) => {
    const haveRefs: RecipeIngredientRef[] = [];
    const missingRefs: RecipeIngredientRef[] = [];

    for (const ref of recipe.ingredientRefs) {
      const ing = ingredientsMap.get(ref.ingredientId);
      // Considered on-hand if state === 'have' OR alwaysHave staple
      if (ing && (ing.state === 'have' || ing.alwaysHave)) {
        haveRefs.push(ref);
      } else {
        missingRefs.push(ref);
      }
    }

    const totalCount = recipe.ingredientRefs.length;
    const haveCount = haveRefs.length;
    const missingCount = missingRefs.length;
    const percentMatch = totalCount > 0 ? Math.round((haveCount / totalCount) * 100) : 0;
    const isReady = missingCount === 0;

    return {
      recipe,
      haveRefs,
      missingRefs,
      totalCount,
      haveCount,
      missingCount,
      percentMatch,
      isReady,
    };
  });
}

export interface OneAwayRanking {
  ingredientId: string;
  name: string;
  unlockCount: number;
}

/**
 * Finds ingredients that if acquired would unlock the highest number of locked recipes
 */
export function calculateOneAwayUnlocks(
  matches: RecipeMatchResult[],
  ingredientsMap: Map<string, Ingredient>
): OneAwayRanking[] {
  const unlockMap = new Map<string, number>();

  for (const match of matches) {
    if (match.missingCount === 1) {
      const missingId = match.missingRefs[0].ingredientId;
      unlockMap.set(missingId, (unlockMap.get(missingId) || 0) + 1);
    }
  }

  const result: OneAwayRanking[] = [];
  for (const [id, count] of unlockMap.entries()) {
    const ing = ingredientsMap.get(id);
    result.push({
      ingredientId: id,
      name: ing ? ing.name : id,
      unlockCount: count,
    });
  }

  // Sort descending by unlock count
  return result.sort((a, b) => b.unlockCount - a.unlockCount);
}

/**
 * Picks "Tonight's Pick" - closest makeable recipe prioritizing highest progress
 */
export function getTonightsPick(matches: RecipeMatchResult[]): RecipeMatchResult | null {
  if (matches.length === 0) return null;

  // Prefer recipes with ingredients on hand, sorted by least missing then most have
  const candidates = [...matches].filter((m) => m.haveCount > 0);
  if (candidates.length === 0) return matches[0] || null;

  candidates.sort((a, b) => {
    if (a.missingCount !== b.missingCount) {
      return a.missingCount - b.missingCount;
    }
    return b.haveCount - a.haveCount;
  });

  return candidates[0];
}
