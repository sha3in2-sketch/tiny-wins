import { IngredientCategory } from '../types';

/**
 * Common culinary synonyms and alias resolution mappings
 */
export const ALIAS_MAP: Record<string, string> = {
  // Dairy & Curd
  'curd': 'curd',
  'dahi': 'curd',
  'yogurt': 'curd',
  'yoghurt': 'curd',
  'malai': 'curd',
  'milk': "milk (cow's milk)",
  "cow's milk": "milk (cow's milk)",
  "cows milk": "milk (cow's milk)",
  'paneer': 'paneer',
  'cottage cheese': 'paneer',
  'butter': 'butter',
  'ghee': 'cow ghee',
  'cow ghee': 'cow ghee',
  'cheese': 'cheese',

  // Flours & Grains
  'atta': 'whole wheat flour',
  'whole wheat flour': 'whole wheat flour',
  'whole wheat flour (atta)': 'whole wheat flour',
  'wheat flour': 'whole wheat flour',
  'besan': 'gram flour (besan)',
  'gram flour': 'gram flour (besan)',
  'gram flour (besan)': 'gram flour (besan)',
  'chana besan': 'gram flour (besan)',
  'sooji': 'semolina (sooji/rava)',
  'rava': 'semolina (sooji/rava)',
  'semolina': 'semolina (sooji/rava)',
  'semolina (sooji/rava)': 'semolina (sooji/rava)',
  'sattu': 'chana sattu',
  'chana sattu': 'chana sattu',
  'ragi': 'ragi flour',
  'ragi flour': 'ragi flour',
  'oats': 'rolled oats',
  'rolled oats': 'rolled oats',
  'oat flour': 'oat flour',
  'poha': 'red rice poha',
  'red rice poha': 'red rice poha',
  'rice': 'semi-brown rice',
  'brown rice': 'brown rice',
  'semi-brown rice': 'semi-brown rice',
  'millets': 'millets (various)',
  'millet': 'millets (various)',
  'millets (various)': 'millets (various)',
  'foxtail millet': 'foxtail millet',

  // Spices & Aromatics
  'cumin': 'cumin seeds',
  'cumin seeds': 'cumin seeds',
  'jeera': 'cumin seeds',
  'roasted cumin powder': 'roasted cumin powder (jeera powder)',
  'roasted cumin powder (jeera powder)': 'roasted cumin powder (jeera powder)',
  'jeera powder': 'roasted cumin powder (jeera powder)',
  'mustard seeds': 'mustard seeds',
  'rai': 'mustard seeds',
  'sarson': 'mustard seeds',
  'coriander seeds': 'coriander seeds',
  'dhania seeds': 'coriander seeds',
  'coriander powder': 'coriander powder',
  'dhania powder': 'coriander powder',
  'cloves': 'cloves',
  'laung': 'cloves',
  'peppercorns': 'peppercorns',
  'black pepper': 'black pepper',
  'kali mirch': 'black pepper',
  'ginger': 'ginger',
  'adrak': 'ginger',
  'green chili': 'green chili',
  'green chilli': 'green chili',
  'hari mirch': 'green chili',
  'dried red chili': 'dried red chili',
  'dry red chili': 'dried red chili',
  'lal mirch': 'dried red chili',
  'chili flakes': 'chili flakes',
  'asafoetida': 'asafoetida (hing)',
  'asafoetida (hing)': 'asafoetida (hing)',
  'hing': 'asafoetida (hing)',
  'turmeric': 'turmeric powder',
  'turmeric powder': 'turmeric powder',
  'haldi': 'turmeric powder',
  'garam masala': 'garam masala',
  'chaat masala': 'chaat masala',
  'pav bhaji masala': 'pav bhaji masala',
  'green cardamom': 'green cardamom',
  'elaichi': 'green cardamom',
  'cinnamon': 'cinnamon stick/powder',
  'cinnamon stick': 'cinnamon stick/powder',
  'cinnamon powder': 'cinnamon stick/powder',
  'cinnamon stick/powder': 'cinnamon stick/powder',
  'oregano': 'oregano',
  'curry leaves': 'curry leaves',
  'kadi patta': 'curry leaves',
  'lemongrass': 'lemongrass',
  'lime leaves': 'lime leaves',
  'lemon zest': 'lemon zest',
  'saffron': 'saffron threads',
  'saffron threads': 'saffron threads',
  'kesar': 'saffron threads',

  // Herbs & Greens
  'coriander leaves': 'coriander leaves',
  'coriander': 'coriander leaves',
  'cilantro': 'coriander leaves',
  'mint leaves': 'mint leaves',
  'mint': 'mint leaves',
  'pudina': 'mint leaves',
  'spinach': 'spinach (palak)',
  'spinach (palak)': 'spinach (palak)',
  'palak': 'spinach (palak)',

  // Dals & Legumes
  'mixed dal': 'mixed dal',
  'dal': 'mixed dal',
  'moong dal': 'green moong dal',
  'green moong dal': 'green moong dal',
  'moong dal (split/sprouted)': 'moong dal (split/sprouted)',
  'sprouted moong': 'moong dal (split/sprouted)',
  'kidney beans': 'kidney beans (rajma)',
  'kidney beans (rajma)': 'kidney beans (rajma)',
  'rajma': 'kidney beans (rajma)',
  'chickpeas': 'chickpeas (chana)',
  'chickpeas (chana)': 'chickpeas (chana)',
  'chana': 'chickpeas (chana)',
  'kabuli chana': 'chickpeas (chana)',
  'black chana': 'black chana',
  'kala chana': 'black chana',
  'soya chunks': 'soya chunks',
  'soya': 'soya chunks',

  // Vegetables
  'onion': 'onion',
  'onions': 'onion',
  'pyaz': 'onion',
  'spring onion': 'spring onion',
  'potatoes': 'potatoes',
  'potato': 'potatoes',
  'aloo': 'potatoes',
  'sweet potatoes': 'sweet potatoes',
  'sweet potato': 'sweet potatoes',
  'shakarkandi': 'sweet potatoes',
  'tomatoes': 'tomatoes',
  'tomato': 'tomatoes',
  'tamatar': 'tomatoes',
  'cabbage': 'cabbage',
  'patta gobhi': 'cabbage',
  'carrots': 'carrots',
  'carrot': 'carrots',
  'gajar': 'carrots',
  'green capsicum': 'green capsicum',
  'capsicum': 'green capsicum',
  'bell pepper': 'green capsicum',
  'shimla mirch': 'green capsicum',
  'green beans': 'green beans',
  'beans': 'green beans',
  'french beans': 'green beans',
  'green peas': 'green peas',
  'peas': 'green peas',
  'matar': 'green peas',
  'mushrooms': 'mushrooms',
  'mushroom': 'mushrooms',
  'broccoli': 'broccoli',
  'baby corn': 'baby corn',
  'corn': 'corn',
  'sweet corn': 'corn',
  'cucumber': 'cucumber',
  'khira': 'cucumber',

  // Fruits
  'bananas': 'bananas',
  'banana': 'bananas',
  'kela': 'bananas',
  'watermelon': 'watermelon',
  'tarbooz': 'watermelon',
  'bael fruit': 'bael fruit',
  'bael': 'bael fruit',
  'lemon juice': 'lemon juice',
  'lemon': 'lemon juice',
  'nimbu': 'lemon juice',
  'dates': 'dates',
  'khajoor': 'dates',
  'chuare': 'chuare (dry dates)',
  'chuare (dry dates)': 'chuare (dry dates)',
  'dry dates': 'chuare (dry dates)',

  // Oils & Fats
  'olive oil': 'olive oil',
  'sesame oil': 'sesame oil',
  'cold-pressed sesame oil': 'cold-pressed sesame oil',
  'mustard oil': 'mustard oil',
  'sarson ka tel': 'mustard oil',
  'thick coconut milk': 'thick coconut milk',
  'coconut milk': 'thick coconut milk',

  // Nuts & Seeds
  'almonds': 'almonds',
  'badam': 'almonds',
  'cashews': 'cashews',
  'kaju': 'cashews',
  'walnuts': 'walnuts',
  'akhrot': 'walnuts',
  'peanuts': 'peanuts (roasted peanuts)',
  'peanuts (roasted peanuts)': 'peanuts (roasted peanuts)',
  'roasted peanuts': 'peanuts (roasted peanuts)',
  'sesame seeds': 'sesame seeds',
  'til': 'sesame seeds',
  'peanut butter': 'peanut butter',
  'crushed dry fruits': 'crushed dry fruits',
  'dry fruits': 'crushed dry fruits',

  // Sweeteners
  'jaggery powder': 'jaggery powder',
  'jaggery': 'jaggery powder',
  'gur': 'jaggery powder',
  'gud': 'jaggery powder',
  'honey': 'honey',
  'shahad': 'honey',
  'desi khand': 'desi khand',
  'khand': 'desi khand',
  'mishri powder': 'mishri powder',
  'mishri': 'mishri powder',
  'rock sugar': 'mishri powder',
  'coconut sugar': 'coconut sugar',

  // Sauces & Packaged & Other
  'soy sauce': 'soy sauce',
  'chili sauce': 'chili sauce',
  'tomato ketchup': 'tomato ketchup',
  'ketchup': 'tomato ketchup',
  'whole wheat chapati': 'whole wheat chapati',
  'chapati': 'whole wheat chapati',
  'atta bread slices': 'atta bread slices',
  'bread': 'atta bread slices',
  'durum wheat pasta': 'durum wheat pasta',
  'pasta': 'durum wheat pasta',
  'papad': 'papad',
  'baking soda': 'baking soda',
  'baking powder': 'baking powder',
  'tamarind': 'tamarind',
  'imli': 'tamarind',
  'black salt': 'black salt',
  'kala namak': 'black salt',
  'rock salt': 'rock salt',
  'sendha namak': 'rock salt',
  'gond katira (edible gum)': 'gond katira (edible gum)',
  'gond katira': 'gond katira (edible gum)',
  'edible gum': 'gond katira (edible gum)',
  'grated coconut': 'grated coconut',
  'coconut': 'grated coconut',
  'unsweetened cocoa powder': 'unsweetened cocoa powder',
  'cocoa powder': 'unsweetened cocoa powder',
  'roasted chicory powder': 'roasted chicory powder',
  'chicory': 'roasted chicory powder',
};

/**
 * Keyword-based category classification heuristics
 */
export function categorizeIngredient(name: string): IngredientCategory {
  const n = name.toLowerCase();

  // Sweeteners first (e.g. jaggery powder, mishri powder, coconut sugar)
  if (
    n.includes('jaggery') ||
    n.includes('honey') ||
    n.includes('khand') ||
    n.includes('mishri') ||
    n.includes('sugar') ||
    n.includes('dates') ||
    n.includes('chuare')
  ) {
    return 'Sweeteners';
  }

  // Spices & Seasonings
  if (
    n.includes('powder') ||
    n.includes('masala') ||
    n.includes('seeds') ||
    n.includes('salt') ||
    n.includes('pepper') ||
    n.includes('clove') ||
    n.includes('cardamom') ||
    n.includes('cinnamon') ||
    n.includes('turmeric') ||
    n.includes('hing') ||
    n.includes('asafoetida') ||
    n.includes('oregano') ||
    n.includes('chili flakes') ||
    n.includes('saffron') ||
    n.includes('zest') ||
    n.includes('curry leaves') ||
    n.includes('leaves') ||
    n.includes('ginger') ||
    n.includes('lemongrass')
  ) {
    if (
      n.includes('salt') ||
      n.includes('pepper') ||
      n.includes('masala') ||
      n.includes('powder') ||
      n.includes('seeds') ||
      n.includes('spices') ||
      n.includes('cardamom') ||
      n.includes('cinnamon') ||
      n.includes('clove') ||
      n.includes('hing') ||
      n.includes('turmeric')
    ) {
      return 'Spices';
    }
  }

  // Dairy
  if (
    n.includes('milk') ||
    n.includes('paneer') ||
    n.includes('curd') ||
    n.includes('butter') ||
    n.includes('cheese') ||
    n.includes('ghee') ||
    n.includes('dahi') ||
    n.includes('lassi')
  ) {
    if (!n.includes('coconut milk')) {
      return 'Dairy';
    }
  }

  // Dals & Legumes
  if (
    n.includes('dal') ||
    n.includes('chana') ||
    n.includes('chickpea') ||
    n.includes('beans') ||
    n.includes('rajma') ||
    n.includes('soya') ||
    n.includes('sprout')
  ) {
    if (!n.includes('coffee')) return 'Dals & legumes';
  }

  // Flours & Grains
  if (
    n.includes('flour') ||
    n.includes('atta') ||
    n.includes('besan') ||
    n.includes('sooji') ||
    n.includes('rava') ||
    n.includes('semolina') ||
    n.includes('sattu') ||
    n.includes('rice') ||
    n.includes('poha') ||
    n.includes('millet') ||
    n.includes('oat') ||
    n.includes('ragi') ||
    n.includes('pasta') ||
    n.includes('bread') ||
    n.includes('chapati')
  ) {
    return 'Flours & grains';
  }

  // Oils & Fats
  if (n.includes('oil') || n.includes('coconut milk')) {
    return 'Oils & fats';
  }

  // Nuts & Seeds
  if (
    n.includes('almond') ||
    n.includes('cashew') ||
    n.includes('walnut') ||
    n.includes('peanut') ||
    n.includes('sesame seeds') ||
    n.includes('dry fruits')
  ) {
    return 'Nuts & seeds';
  }

  // Sweeteners
  if (
    n.includes('jaggery') ||
    n.includes('honey') ||
    n.includes('khand') ||
    n.includes('mishri') ||
    n.includes('sugar') ||
    n.includes('dates') ||
    n.includes('chuare')
  ) {
    return 'Sweeteners';
  }

  // Fruits
  if (
    n.includes('banana') ||
    n.includes('watermelon') ||
    n.includes('lemon') ||
    n.includes('lime') ||
    n.includes('bael')
  ) {
    return 'Fruits';
  }

  // Sauces & packaged
  if (
    n.includes('sauce') ||
    n.includes('ketchup') ||
    n.includes('papad') ||
    n.includes('baking') ||
    n.includes('tamarind') ||
    n.includes('cocoa')
  ) {
    return 'Sauces & packaged';
  }

  // Vegetables & Herbs
  if (
    n.includes('onion') ||
    n.includes('potato') ||
    n.includes('tomato') ||
    n.includes('cabbage') ||
    n.includes('carrot') ||
    n.includes('capsicum') ||
    n.includes('spinach') ||
    n.includes('palak') ||
    n.includes('mushroom') ||
    n.includes('broccoli') ||
    n.includes('corn') ||
    n.includes('cucumber') ||
    n.includes('coriander') ||
    n.includes('mint') ||
    n.includes('chili')
  ) {
    return 'Vegetables';
  }

  return 'Other';
}

/**
 * Creates a normalized slug id from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\(.*?\)/g, '') // remove parenthetical annotations
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes an ingredient query or raw string to canonical form
 */
export function normalizeIngredient(raw: string): {
  id: string;
  name: string;
  category: IngredientCategory;
  aliasMatch: boolean;
} {
  const clean = raw.trim().toLowerCase();
  // Check exact or without parens in ALIAS_MAP
  const withoutParens = clean.replace(/\(.*?\)/g, '').trim();

  let canonical = ALIAS_MAP[clean] || ALIAS_MAP[withoutParens] || clean;
  const aliasMatch = canonical !== clean;

  const id = slugify(canonical);
  const category = categorizeIngredient(canonical);

  return {
    id,
    name: canonical,
    category,
    aliasMatch,
  };
}
