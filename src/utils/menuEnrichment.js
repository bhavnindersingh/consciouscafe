// Shared menu metadata used by FoodMenuPage and PrintMenuPage.

export const CATEGORY_META = {
  'toast':               { name: 'Toast',              note: 'Sourdough, slow-fermented' },
  'all-day-breakfast':   { name: 'All Day Breakfast',  note: 'Morning, whenever it finds you' },
  'smoothie-bowls':      { name: 'Smoothie Bowls',     note: 'Fruit, grain & quiet ritual' },
  'earth-grills-crisps': { name: 'Earth Grills & Crisps', note: 'Fire & root' },
  'salads':              { name: 'Salads',             note: 'Garden-led, dressed with care' },
  'platters':            { name: 'Platters',           note: 'Made to gather around' },
  'earth-bowls':         { name: 'Earth Bowls',        note: 'A continent in a single bowl' },
  'noodle-bowls':        { name: 'Noodle Bowls',       note: 'Broth, brewed long' },
  'pasta-pizza':         { name: 'Pasta',              note: 'Hand-finished, herb-forward' },
  'pasta':               { name: 'Pasta',              note: 'Hand-finished, herb-forward' },
  'desserts':            { name: 'Desserts',           note: 'A gentle, plant-based close' },
  'juices':              { name: 'Juices',             note: 'Cold-pressed, fruit-led' },
  'mocktails':           { name: 'Mocktails',          note: 'Shaken & sparkling' },
  'floral-teas':         { name: 'Floral Teas',        note: 'Petal-steeped, calming' },
  'chai':                { name: 'Chai',               note: 'Spiced, brewed slow' },
  'coffee':              { name: 'Coffee',             note: 'Small-batch beans' },
};

export const MAIN_CATEGORY_META = {
  food:       { name: 'Food',       note: 'Plant-forward plates, all day' },
  drinks:     { name: 'Drinks',     note: 'Pressed, brewed & poured' },
  patisserie: { name: 'Patisserie', note: 'Fresh bakes & sweet endings' },
};

export const CATEGORY_ORDER = [
  'toast', 'all-day-breakfast', 'smoothie-bowls', 'earth-grills-crisps',
  'salads', 'platters', 'earth-bowls', 'noodle-bowls', 'pasta-pizza', 'pasta',
  'desserts', 'juices', 'mocktails', 'floral-teas', 'chai', 'coffee',
];

export const MAIN_CATEGORY_ORDER = ['food', 'drinks', 'patisserie'];
