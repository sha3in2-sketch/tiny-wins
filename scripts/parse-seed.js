import fs from 'fs';

const html = fs.readFileSync('recipe-pantry.html', 'utf8');
const marker = 'const D=`';
const start = html.indexOf(marker) + marker.length;
const end = html.indexOf('`;', start);
const raw = html.substring(start, end).trim();
const lines = raw.split('\n');

const recipes = lines.map((l, idx) => {
  const [n, c, i, s] = l.split('|');
  const ings = i.split(',').map(x => x.trim()).filter(Boolean);
  return {
    id: `seed-${idx + 1}`,
    name: n.trim(),
    category: c.trim(),
    ingredients: ings,
    method: s.trim()
  };
});

fs.mkdirSync('src/db', { recursive: true });
fs.writeFileSync('src/db/seedRecipes.json', JSON.stringify(recipes, null, 2));
console.log(`Parsed ${recipes.length} recipes successfully.`);
