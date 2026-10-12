import { describe, it, expect } from 'vitest';
import {
  calculateRecipeMatches,
  calculateOneAwayUnlocks,
  getTonightsPick,
} from '../utils/recipeMatching';
import { Ingredient, Recipe } from '../types';

describe('recipeMatching', () => {
  const dummyIngredients: Ingredient[] = [
    {
      id: 'paneer',
      name: 'paneer',
      aliases: [],
      category: 'Dairy',
      state: 'have',
      alwaysHave: false,
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'curd',
      name: 'curd',
      aliases: [],
      category: 'Dairy',
      state: 'have',
      alwaysHave: false,
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'onion',
      name: 'onion',
      aliases: [],
      category: 'Vegetables',
      state: 'out',
      alwaysHave: false,
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'salt',
      name: 'salt',
      aliases: [],
      category: 'Spices',
      state: 'out',
      alwaysHave: true, // Staple, so considered on-hand!
      createdAt: 0,
      updatedAt: 0,
    },
  ];

  const ingsMap = new Map<string, Ingredient>(dummyIngredients.map((i) => [i.id, i]));

  const dummyRecipes: Recipe[] = [
    {
      id: 'r1',
      name: 'Paneer Snack',
      category: 'Snack',
      ingredientRefs: [
        { ingredientId: 'paneer', rawText: 'paneer' },
        { ingredientId: 'salt', rawText: 'salt' },
      ],
      method: ['Mix paneer with salt.'],
      rawMethod: 'Mix paneer with salt.',
      favorite: false,
      source: 'seed',
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'r2',
      name: 'Paneer Onion Curry',
      category: 'Dinner',
      ingredientRefs: [
        { ingredientId: 'paneer', rawText: 'paneer' },
        { ingredientId: 'onion', rawText: 'onion' },
        { ingredientId: 'curd', rawText: 'curd' },
      ],
      method: ['Cook together.'],
      rawMethod: 'Cook together.',
      favorite: false,
      source: 'seed',
      createdAt: 0,
      updatedAt: 0,
    },
  ];

  it('correctly calculates ready and missing ingredients including staples', () => {
    const matches = calculateRecipeMatches(dummyRecipes, ingsMap);
    expect(matches).toHaveLength(2);

    // r1: paneer (have) + salt (staple/alwaysHave) -> fully ready!
    expect(matches[0].isReady).toBe(true);
    expect(matches[0].haveCount).toBe(2);
    expect(matches[0].missingCount).toBe(0);

    // r2: paneer (have) + curd (have) + onion (out) -> 1 missing
    expect(matches[1].isReady).toBe(false);
    expect(matches[1].haveCount).toBe(2);
    expect(matches[1].missingCount).toBe(1);
    expect(matches[1].missingRefs[0].ingredientId).toBe('onion');
  });

  it('accurately identifies 1-ingredient away unlock rankings', () => {
    const matches = calculateRecipeMatches(dummyRecipes, ingsMap);
    const unlocks = calculateOneAwayUnlocks(matches, ingsMap);

    expect(unlocks).toHaveLength(1);
    expect(unlocks[0].ingredientId).toBe('onion');
    expect(unlocks[0].unlockCount).toBe(1);
  });

  it('selects the most ready recipe as Tonights Pick', () => {
    const matches = calculateRecipeMatches(dummyRecipes, ingsMap);
    const pick = getTonightsPick(matches);

    expect(pick?.recipe.id).toBe('r1');
  });
});
