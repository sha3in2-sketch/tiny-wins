export type IngredientState = 'have' | 'low' | 'out';

export type IngredientCategory =
  | 'Spices'
  | 'Dals & legumes'
  | 'Flours & grains'
  | 'Dairy'
  | 'Vegetables'
  | 'Fruits'
  | 'Oils & fats'
  | 'Nuts & seeds'
  | 'Sweeteners'
  | 'Sauces & packaged'
  | 'Other';

export interface Ingredient {
  id: string;               // normalized canonical slug, e.g. "whole-wheat-flour"
  name: string;             // canonical display name, e.g. "whole wheat flour"
  aliases: string[];        // ["atta", "whole wheat flour (atta)", "gehu ka atta"]
  category: IngredientCategory;
  state: IngredientState;   // "have" | "low" | "out"
  alwaysHave: boolean;      // staple item (salt, basic oil, etc.)
  createdAt: number;
  updatedAt: number;
}

export type RecipeCategory =
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snack'
  | 'Dessert'
  | 'Drink'
  | 'Mine';

export interface RecipeIngredientRef {
  ingredientId: string;     // canonical id
  rawText: string;          // original text as authored
  quantity?: number;
  unit?: string;
}

export interface Recipe {
  id: string;
  name: string;
  category: RecipeCategory;
  ingredientRefs: RecipeIngredientRef[];
  method: string[];         // parsed steps
  rawMethod: string;
  favorite: boolean;
  rating?: number;
  notes?: string;
  timeMinutes?: number;
  dietTags?: string[];
  source: 'seed' | 'user';
  createdAt: number;
  updatedAt: number;
}

export interface ShoppingItem {
  id: string;
  ingredientId: string;
  name: string;
  category: IngredientCategory;
  reason: 'low' | 'out' | 'pinned_recipe';
  recipeId?: string;
  checked: boolean;
  createdAt: number;
}

export interface AppSettings {
  id: string;
  staplesHidden: boolean;
  theme: 'dark';
}
