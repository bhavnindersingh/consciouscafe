// Shared menu metadata used by FoodMenuPage and PrintMenuPage.
//
// Keys are `toSlug(recipes.sub_category)` from the POS — this is a curation
// layer over live data, not a source of truth. A section the POS adds still
// renders (auto-titled, no note, sorted last); it just misses its house voice.
// `npm run check:menu` reports both directions of drift: live sections with no
// entry here, and entries here matching nothing live.

export const CATEGORY_META = {
  // Food
  'toasts':              { name: 'Toasts',             note: 'Sourdough, slow-fermented' },
  'all-day-breakfast':   { name: 'All Day Breakfast',  note: 'Morning, whenever it finds you' },
  'smoothie-bowls':      { name: 'Smoothie Bowls',     note: 'Fruit, grain & quiet ritual' },
  'earth-grills':        { name: 'Earth Grills',       note: 'Fire & root' },
  'earth-crisps':        { name: 'Earth Crisps',       note: 'Thin, salted, crisp' },
  'salads':              { name: 'Salads',             note: 'Garden-led, dressed with care' },
  'platters':            { name: 'Platters',           note: 'Made to gather around' },
  'earth-bowls':         { name: 'Earth Bowls',        note: 'A continent in a single bowl' },
  'noodle-bowls':        { name: 'Noodle Bowls',       note: 'Broth, brewed long' },
  'thai-favourites':     { name: 'Thai Favourites',    note: 'Lemongrass, lime & chilli' },
  'pastas':              { name: 'Pastas',             note: 'Hand-finished, herb-forward' },
  'sandwiches':          { name: 'Sandwiches',         note: 'Pressed on house bread' },

  // Drinks
  'juices':              { name: 'Juices',             note: 'Cold-pressed, fruit-led' },
  'mocktails':           { name: 'Mocktails',          note: 'Shaken & sparkling' },
  'kombucha':            { name: 'Kombucha',           note: 'Wild-fermented in-house' },
  'health-shakes':       { name: 'Health Shakes',      note: 'Blended whole, nothing added' },
  'teas':                { name: 'Teas',               note: 'Petal-steeped, calming' },
  'hot-coffees':         { name: 'Hot Coffees',        note: 'Small-batch beans' },
  'iced-coffees':        { name: 'Iced Coffees',       note: 'Poured long over ice' },
  'matcha-specialities': { name: 'Matcha Specialities', note: 'Stone-ground, whisked' },
  'cocoa':               { name: 'Cocoa',              note: 'Slow-melted, unhurried' },

  // Patisserie
  'cakes':               { name: 'Cakes',              note: 'Baked through the morning' },
  'cheesecakes':         { name: 'Cheesecakes',        note: 'Set slow, sliced thick' },
  'cookies':             { name: 'Cookies',            note: 'Chewy centres, crisp edges' },
  'brownies':            { name: 'Brownies',           note: 'Dark, dense, unrepentant' },
  'tarts':               { name: 'Tarts',              note: 'Short pastry, seasonal fills' },
  'eclair':              { name: 'Eclair',             note: 'Choux, filled to order' },
};

export const MAIN_CATEGORY_META = {
  food:       { name: 'Food',       note: 'Plant-forward plates, all day' },
  drinks:     { name: 'Drinks',     note: 'Pressed, brewed & poured' },
  patisserie: { name: 'Patisserie', note: 'Fresh bakes & sweet endings' },
};

// Reading order within a main category. Anything missing sorts to the end.
export const CATEGORY_ORDER = [
  // Food
  'toasts', 'all-day-breakfast', 'smoothie-bowls', 'earth-grills', 'earth-crisps',
  'salads', 'platters', 'earth-bowls', 'noodle-bowls', 'thai-favourites',
  'pastas', 'sandwiches',
  // Drinks
  'juices', 'mocktails', 'kombucha', 'health-shakes', 'teas',
  'hot-coffees', 'iced-coffees', 'matcha-specialities', 'cocoa',
  // Patisserie
  'cakes', 'cheesecakes', 'cookies', 'brownies', 'tarts', 'eclair',
];

export const MAIN_CATEGORY_ORDER = ['food', 'drinks', 'patisserie'];
