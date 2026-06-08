/* Conscious Café — menu data + helpers (ES module).
   Drinks/desserts use the live catalogue; food images stream from Gumlet. */

const GUMLET = "https://consciouscafe.gumlet.io";

// Build an optimized CDN url from a stored asset path
function img(path, { w = 1200, h, q = 86, mode } = {}) {
  if (/^https?:\/\//.test(path)) return path; // already absolute (drinks use unsplash)
  const clean = path.replace(/^\//, "");
  const enc = clean.split("/").map(encodeURIComponent).join("/");
  const p = new URLSearchParams();
  if (w) p.append("w", w);
  if (h) p.append("h", h);
  if (q) p.append("q", q);
  if (mode) p.append("mode", mode);
  p.append("fm", "auto");
  return `${GUMLET}/${enc}?${p.toString()}`;
}

const BASE = "images/Food Menu Conscious Cafe August'25";

// Food menu ported from the live product catalogue
const PRODUCTS = [
  // TOAST
  { id: 1, name: "Mushroom Toast", category: "toast", price: 190, src: `${BASE}/TOASTS/mushroom toast/MushroomToast.webp.JPG`, desc: "Sourdough, babaganoush, roasted mushrooms, pesto and micro-greens", diet: "vegan", kcal: 239 },
  { id: 2, name: "Avocado Toast", category: "toast", price: 199, bestseller: true, src: `${BASE}/TOASTS/avacado toast/avocadotoast.webp.JPG`, desc: "Sourdough, avocado, fetta, micro-greens, optional poached egg", diet: "veg / egg", kcal: 285 },
  { id: 3, name: "Pesto Cream Cheese", category: "toast", price: 199, src: `${BASE}/TOASTS/pesto cream cheese/pestocreamcheese.webp.JPG`, desc: "Sourdough, cream cheese, pesto, roasted beetroot, radish, micro-greens", diet: "veg", kcal: 214 },
  { id: 4, name: "Burrata Bruschetta", category: "toast", price: 220, src: `${BASE}/TOASTS/buratta bruchetta/burratabruschetta.JPG`, desc: "Sourdough, burrata, roasted cherry tomatoes, balsamic, fresh basil", diet: "veg", kcal: 191 },

  // ALL DAY BREAKFAST
  { id: 5, name: "Muhammara", category: "all-day-breakfast", price: 250, src: `${BASE}/ALL DAY BREAKFAST/Muhammara/Muhammara.jpg`, desc: "Roasted red pepper dip, smoked eggplant, vegan sour cream, chilli oil, warm pita", diet: "vegan", kcal: 360 },
  { id: 6, name: "Cilbir", category: "all-day-breakfast", price: 290, src: `${BASE}/ALL DAY BREAKFAST/Turkish eggs/Turkish Eggs.JPG`, desc: "Turkish poached eggs on herbed yogurt, chilli oil, warm pita", diet: "veg / egg", kcal: 391 },
  { id: 7, name: "Pancake", category: "all-day-breakfast", price: 380, src: `${BASE}/ALL DAY BREAKFAST/Pancakes/Pancake.JPG`, desc: "Gluten-free pancakes, strawberry compote, chocolate, caramel, fresh fruit", diet: "veg / GF", kcal: 295 },
  { id: 8, name: "French Toast", category: "all-day-breakfast", price: 380, bestseller: true, src: `${BASE}/ALL DAY BREAKFAST/french toast/French Toast.JPG`, desc: "Served with lemon curd and fresh orange", diet: "veg / egg", kcal: 291 },

  // SMOOTHIE BOWLS
  { id: 9, name: "Berry Blast Smoothie", category: "smoothie-bowls", price: 270, src: `${BASE}/SMOOTHIE BOWLS/Berry blast smoothie/Berry Blast Smoothie.JPG`, desc: "Mixed berries, banana, coconut milk, seasonal fruit, muesli, coconut flakes", diet: "vegan", kcal: 273 },
  { id: 10, name: "Cocoa Peanut Smoothie", category: "smoothie-bowls", price: 320, src: `${BASE}/SMOOTHIE BOWLS/cacao bowl/Cacao Bowl.JPG`, desc: "Banana, oat, cocoa, peanut butter, soy milk, seasonal fruit, muesli", diet: "vegan", kcal: 355 },
  { id: 11, name: "Goodness Bowl", category: "smoothie-bowls", price: 280, bestseller: true, src: `${BASE}/SMOOTHIE BOWLS/Goodness bowl/Goodness Bowl.JPG`, desc: "Yogurt, honey, papaya, orange, pomegranate, muesli, coconut flakes", diet: "veg", kcal: 305 },
  { id: 12, name: "Fruit Bliss Bowl", category: "smoothie-bowls", price: 320, src: `${BASE}/SMOOTHIE BOWLS/fruit bliss bowl/Fruit Bliss Bowl.JPG`, desc: "Seasonal fruit, coconut flakes, dates, almonds, chia, date syrup, coconut milk", diet: "vegan", kcal: 449 },
  { id: 13, name: "Overnight Oats", category: "smoothie-bowls", price: 260, src: `${BASE}/SMOOTHIE BOWLS/Overnight Oats/Overnight Oats.JPG`, desc: "Oat milk, peanut butter, vanilla, strawberry compote, banana, house muesli", diet: "vegan", kcal: 280 },
  { id: 14, name: "Matcha Chia Pudding", category: "smoothie-bowls", price: 270, src: `${BASE}/SMOOTHIE BOWLS/Chia pudding/Match Chia Pudding.JPG`, desc: "Matcha-coconut chia pudding, tropical fruit, house muesli", diet: "vegan", kcal: 260 },

  // EARTH GRILLS / CRISPS
  { id: 15, name: "Grilled Sweet Potato", category: "earth-grills-crisps", price: 280, src: `${BASE}/EARTH GRILS/Grilled sweet potato/Grilled Sweet Potato.JPG`, desc: "Smoky grilled sweet potato, vegan sour cream and pesto", diet: "vegan / GF", kcal: 135 },
  { id: 16, name: "Grilled Tofu Satay", category: "earth-grills-crisps", price: 350, bestseller: true, src: `${BASE}/EARTH GRILS/Tofu Satay/Grilled Tofu Satay.JPG`, desc: "Grilled tofu skewers, asian peanut satay sauce", diet: "vegan / GF", kcal: 220 },
  { id: 17, name: "Taro Root Crisps", category: "earth-grills-crisps", price: 250, src: `${BASE}/EARTH CRISPS/Tarot root fries/Taro Root Crisps.JPG`, desc: "Arbi root fries, zaatar, pesto and vegan mayo", diet: "vegan / GF", kcal: 273 },
  { id: 18, name: "Cassava Crisps", category: "earth-grills-crisps", price: 200, src: `${BASE}/EARTH CRISPS/Yuka (tapiocca fries)/Cassava Crisps.JPG`, desc: "Tapioca fries, sweet & spicy pineapple jalapeño salsa", diet: "vegan / GF", kcal: 240 },

  // SALADS
  { id: 19, name: "Watermelon Feta", category: "salads", price: 270, src: `${BASE}/SALADS/Watermelon fetta salad/Watermelon Fetta Salad.JPG`, desc: "Lettuce, watermelon, cucumber, feta, almonds, balsamic vinaigrette", diet: "veg / GF", kcal: 228 },
  { id: 20, name: "Tropical Salad", category: "salads", price: 350, src: `${BASE}/SALADS/Tropical salad/Tropical Salad.JPG`, desc: "Lettuce, roasted beetroot, orange, walnuts, bocconcini, orange-tahini", diet: "veg / GF", kcal: 277 },
  { id: 21, name: "Botanical Balance Salad", category: "salads", price: 420, src: `${BASE}/SALADS/BB salad/Botanical Balance (BB) Salad.JPG`, desc: "Madagascar beans, crispy tofu, fresh veg, zesty miso-citrus dressing", diet: "veg / GF", kcal: 270 },

  // PLATTERS
  { id: 22, name: "Yogi Platter", category: "platters", price: 380, src: `${BASE}/PLATTERS/yogi platter/Yogi Platter.JPG`, desc: "Roasted mushrooms, babaganoush, hash brown, sour cream, toast, salad, chia pudding", diet: "vegan" },
  { id: 23, name: "Zulfi Platter", category: "platters", price: 420, src: `${BASE}/PLATTERS/Zulfi platter/Zulfi Platter.JPG`, desc: "Eggs, hash browns, babaganoush, salad, mushrooms, corn drip, sourdough", diet: "veg / egg" },
  { id: 24, name: "Mezze Platter", category: "platters", price: 590, src: `${BASE}/PLATTERS/Mezze platter/Mezze Platter.JPG`, desc: "Roasted veg, chips, falafel, hummus, babaganoush, muhammara, feta, pita", diet: "vegan" },

  // EARTH BOWLS
  { id: 26, name: "Thai Bowl", category: "earth-bowls", price: 620, bestseller: true, src: `${BASE}/EARTH BOWLS/Thai Bowl.JPG`, desc: "Tofu krapao, citrus salad, jasmine rice, steamed greens, nam phrik", diet: "vegan" },
  { id: 27, name: "Tokyo Katsu", category: "earth-bowls", price: 550, src: `${BASE}/EARTH BOWLS/Tokyo Katsu.JPG`, desc: "Crispy eggplant katsu, curry, steamed greens, goma salad, jasmine rice", diet: "vegan" },
  { id: 28, name: "Rangla Punjab", category: "earth-bowls", price: 420, bestseller: true, src: `${BASE}/EARTH BOWLS/Rangla Punjab.JPG`, desc: "Malai kofta, hara saag, millets, salad, makki corn roti", diet: "veg" },
  { id: 29, name: "Sol Bowl", category: "earth-bowls", price: 410, src: `${BASE}/EARTH BOWLS/Sol Bowl.JPG`, desc: "Black beans, millets, sour cream, roasted corn salsa, guacamole, plantain", diet: "vegan" },
  { id: 30, name: "Mezze Kodo Bowl", category: "earth-bowls", price: 380, src: `${BASE}/EARTH BOWLS/Mezze Kodo Bowl.JPG`, desc: "Beetroot hummus, feta, kodo, falafel, grilled veg, muhammara", diet: "vegan" },

  // NOODLE BOWLS
  { id: 31, name: "Khao Soi", category: "noodle-bowls", price: 480, src: `${BASE}/NOODLE BOWLS/Khao Soi.JPG`, desc: "Coconut turmeric broth, udon, veg, tofu, crispy noodle, shallots, peanuts", diet: "vegan", kcal: 460 },
  { id: 32, name: "Laksa", category: "noodle-bowls", price: 490, bestseller: true, src: `${BASE}/NOODLE BOWLS/Laksa.JPG`, desc: "Spicy peanut broth, rice noodles, crispy tofu, bok choy, pickled cabbage, corn", diet: "vegan", kcal: 530 },
  { id: 33, name: "Miso Ramen", category: "noodle-bowls", price: 405, src: `${BASE}/NOODLE BOWLS/Miso Ramen.JPG`, desc: "Creamy miso broth, udon, mushrooms, bok choy, kimchi", diet: "vegan", kcal: 355 },
  { id: 34, name: "Bibim Guksu", category: "noodle-bowls", price: 420, src: `${BASE}/NOODLE BOWLS/Bibim Guksu.jpg`, desc: "Gochujang soba, cold, kimchi & asian veg (egg optional)", diet: "vegan", kcal: 360 },

  // PASTA / PIZZA
  { id: 35, name: "Meatless Meatball", category: "pasta-pizza", price: 510, src: `${BASE}/PASTAS/Meatless Meatballs (M&M).JPG`, desc: "Meatless meatballs, aromatic tomato sauce, spaghetti, basil, parmesan", diet: "veg", kcal: 423 },
  { id: 36, name: "Zucchini Zoodles", category: "pasta-pizza", price: 470, bestseller: true, src: `${BASE}/PASTAS/Zucchini Zoodles(ZZ).JPG`, desc: "Zucchini noodles, creamy pesto, greens, basil, cherry tomato, bocconcini", diet: "veg / GF", kcal: 340 },

  // ===== DESSERTS =====
  { id: 41, name: "Coconut Panna Cotta", category: "desserts", price: 220, bestseller: true, src: `${BASE}/DESSERTS/Coconut Panna Cotta.JPG`, desc: "Coconut panna cotta, passion fruit coulis, tropical fruit", diet: "vegan", kcal: 247 },
  { id: 42, name: "Chocolate Mousse", category: "desserts", price: 289, src: `${BASE}/DESSERTS/Chocolate Mousse.JPG`, desc: "Dark chocolate-orange mousse, orange concentrate, almond praline tuile", diet: "vegan", kcal: 389 },

  // ===== DRINKS · JUICES =====
  { id: 43, name: "Detoxifier", category: "juices", price: 250, src: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80&auto=format&fit=crop", desc: "Green vegetable & fruit detox blend", diet: "vegan / GF" },
  { id: 44, name: "Vit C Booster", category: "juices", price: 200, src: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80&auto=format&fit=crop", desc: "Citrus juice with immunity-boosting fruits", diet: "vegan / GF" },
  { id: 45, name: "Anti Oxidant", category: "juices", price: 320, src: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80&auto=format&fit=crop", desc: "Berry & pomegranate antioxidant blend", diet: "vegan / GF" },
  { id: 46, name: "Immunity Punch", category: "juices", price: 190, src: "https://images.unsplash.com/photo-1565299585323-38174c13a5c9?w=800&q=80&auto=format&fit=crop", desc: "Turmeric, ginger and citrus", diet: "vegan / GF" },
  { id: 47, name: "Morning Radiance", category: "juices", price: 250, src: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=800&q=80&auto=format&fit=crop", desc: "Carrot, orange and ginger", diet: "vegan / GF" },
  { id: 48, name: "Tropical Zen Blend", category: "juices", price: 290, src: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80&auto=format&fit=crop", desc: "Mango, pineapple and coconut water", diet: "vegan / GF" },
  { id: 49, name: "Strawberry Spirulina", category: "juices", price: 290, src: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80&auto=format&fit=crop", desc: "Strawberry juice with spirulina superfood", diet: "vegan / GF" },
  { id: 50, name: "Fresh Kokum", category: "juices", price: 220, src: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80&auto=format&fit=crop", desc: "Cooling kokum juice", diet: "vegan / GF" },
  { id: 51, name: "Indian Sarsaparilla Bliss", category: "juices", price: 220, src: "https://images.unsplash.com/photo-1565299585323-38174c13a5c9?w=800&q=80&auto=format&fit=crop", desc: "Sarsaparilla root, natural cooling", diet: "vegan / GF" },
  { id: 52, name: "Mango Margarita", category: "juices", price: 230, src: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80&auto=format&fit=crop", desc: "Mango, lime and mint", diet: "vegan / GF" },
  { id: 53, name: "Summer Blossom", category: "juices", price: 200, src: "https://images.unsplash.com/photo-1546173159-315724a31696?w=800&q=80&auto=format&fit=crop", desc: "Light summer fruit blend", diet: "vegan / GF" },
  { id: 54, name: "Kokum Chilli Fizz", category: "juices", price: 210, src: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800&q=80&auto=format&fit=crop", desc: "Kokum with chilli and fizzy water", diet: "vegan / GF" },
  { id: 55, name: "Strawberry Spritzer", category: "juices", price: 230, src: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&q=80&auto=format&fit=crop", desc: "Sparkling strawberry with herbs", diet: "vegan / GF" },

  // ===== DRINKS · MOCKTAILS =====
  { id: 56, name: "Peach Ice Tea", category: "mocktails", price: 200, bestseller: true, src: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&q=80&auto=format&fit=crop", desc: "Iced tea with sweet peach", diet: "vegan / GF" },
  { id: 57, name: "Tamarind Ginger", category: "mocktails", price: 210, src: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&auto=format&fit=crop", desc: "Tangy tamarind with fresh ginger", diet: "vegan / GF" },
  { id: 58, name: "Pinacolada", category: "mocktails", price: 250, src: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&q=80&auto=format&fit=crop", desc: "Pineapple and coconut cream", diet: "vegan / GF" },
  { id: 59, name: "Mojito", category: "mocktails", price: 180, src: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&auto=format&fit=crop", desc: "Classic virgin mojito, mint & lime", diet: "vegan / GF" },
  { id: 60, name: "Kombucha from Tap", category: "mocktails", price: 230, src: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&q=80&auto=format&fit=crop", desc: "Fresh kombucha on tap, probiotic & fizzy", diet: "vegan / GF" },
  { id: 61, name: "Orange Jalapeno Mint", category: "mocktails", price: 230, src: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&auto=format&fit=crop", desc: "Orange with jalapeño and fresh mint", diet: "vegan / GF" },
  { id: 62, name: "Watermelon Mint Fizz", category: "mocktails", price: 210, src: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=800&q=80&auto=format&fit=crop", desc: "Watermelon, mint and sparkling water", diet: "vegan / GF" },
  { id: 63, name: "Virgin Mojito", category: "mocktails", price: 210, src: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80&auto=format&fit=crop", desc: "Lime, mint and soda", diet: "vegan / GF" },

  // ===== DRINKS · FLORAL TEAS =====
  { id: 64, name: "Rose Tea", category: "floral-teas", price: 160, src: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80&auto=format&fit=crop", desc: "Rose petal tea, floral and calming", diet: "vegan / GF" },
  { id: 65, name: "Jasmine Green Tea", category: "floral-teas", price: 120, src: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&q=80&auto=format&fit=crop", desc: "Jasmine-scented green tea", diet: "vegan / GF" },
  { id: 66, name: "Lavender Chamomile Tea", category: "floral-teas", price: 140, src: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80&auto=format&fit=crop", desc: "Lavender and chamomile, for peaceful moments", diet: "vegan / GF" },

  // ===== DRINKS · CHAI =====
  { id: 67, name: "Maharani Chai", category: "chai", price: 100, src: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=800&q=80&auto=format&fit=crop", desc: "Spiced tea blend with traditional Indian spices", diet: "veg" },

  // ===== DRINKS · COFFEE =====
  { id: 68, name: "Iced Americano, Orange & Cinnamon", category: "coffee", price: 175, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Cold brew americano, orange zest, cinnamon", diet: "vegan / GF" },
  { id: 69, name: "Frappe", category: "coffee", price: 290, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Iced coffee frappe, blended with cream", diet: "veg" },
  { id: 70, name: "Caramel Iced Latte", category: "coffee", price: 180, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Iced latte with rich caramel", diet: "veg" },
  { id: 71, name: "Iced Vanilla Latte", category: "coffee", price: 180, bestseller: true, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Iced latte with vanilla bean", diet: "veg" },
  { id: 72, name: "Vegan Iced Latte", category: "coffee", price: 240, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Iced latte with oat or almond milk", diet: "vegan" },
  { id: 73, name: "Espresso", category: "coffee", price: 70, src: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80&auto=format&fit=crop", desc: "Single shot with rich crema", diet: "vegan / GF" },
  { id: 74, name: "Doppio", category: "coffee", price: 130, src: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=800&q=80&auto=format&fit=crop", desc: "Double shot espresso", diet: "vegan / GF" },
  { id: 75, name: "Latte", category: "coffee", price: 150, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Espresso, steamed milk, foam art", diet: "veg" },
  { id: 76, name: "Cappuccino", category: "coffee", price: 150, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Equal parts espresso, milk and foam", diet: "veg" },
  { id: 77, name: "Cortado", category: "coffee", price: 120, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Espresso cut with warm milk", diet: "veg" },
  { id: 78, name: "Mochaccino", category: "coffee", price: 240, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Chocolate, espresso, steamed milk, cream", diet: "veg" },
  { id: 79, name: "Hot Chocolate", category: "coffee", price: 280, src: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80&auto=format&fit=crop", desc: "Rich, creamy hot chocolate", diet: "veg" },
];

// Two top-level groups the guest sees first
const GROUPS = [
  { id: "food",   name: "Food",   note: "Plant-forward plates, all day" },
  { id: "drinks", name: "Drinks", note: "Pressed, brewed & poured" },
];

// Ordered categories with editorial labels + a one-line note, grouped
const CATEGORIES = [
  // FOOD
  { id: "toast", group: "food", name: "Toast", note: "Sourdough, slow-fermented" },
  { id: "all-day-breakfast", group: "food", name: "All Day Breakfast", note: "Morning, whenever it finds you" },
  { id: "smoothie-bowls", group: "food", name: "Smoothie Bowls", note: "Fruit, grain & quiet ritual" },
  { id: "earth-grills-crisps", group: "food", name: "Earth Grills & Crisps", note: "Fire & root" },
  { id: "salads", group: "food", name: "Salads", note: "Garden-led, dressed with care" },
  { id: "platters", group: "food", name: "Platters", note: "Made to gather around" },
  { id: "earth-bowls", group: "food", name: "Earth Bowls", note: "A continent in a single bowl" },
  { id: "noodle-bowls", group: "food", name: "Noodle Bowls", note: "Broth, brewed long" },
  { id: "pasta-pizza", group: "food", name: "Pasta", note: "Hand-finished, herb-forward" },
  { id: "desserts", group: "food", name: "Desserts", note: "A gentle, plant-based close" },
  // DRINKS
  { id: "juices", group: "drinks", name: "Juices", note: "Cold-pressed, fruit-led" },
  { id: "mocktails", group: "drinks", name: "Mocktails", note: "Shaken & sparkling" },
  { id: "floral-teas", group: "drinks", name: "Floral Teas", note: "Petal-steeped, calming" },
  { id: "chai", group: "drinks", name: "Chai", note: "Spiced, brewed slow" },
  { id: "coffee", group: "drinks", name: "Coffee", note: "Small-batch beans" },
];

// Hero / editorial imagery drawn from the menu shots
const HERO = {
  poster: img(`${BASE}/EARTH BOWLS/Thai Bowl.JPG`, { w: 1920, q: 88 }),
  // Landscape (16:9) source — used on tablet & desktop
  video: "https://play.gumlet.io/embed/6925f88a3c99376d4fd48188?background=true&autoplay=true&loop=true&disableControls=true&muted=true&preload=true",
  // Mobile portrait reframe (9:16). Replace this embed id with the reframed
  // asset from Gumlet (Reframe → 9:16) so the hero fills a phone without cropping.
  // Falls back to the landscape source until the reframed asset is ready.
  videoMobile: "https://play.gumlet.io/embed/6925f88a3c99376d4fd48188?background=true&autoplay=true&loop=true&disableControls=true&muted=true&preload=true",
  // Set true once `videoMobile` points to a true 9:16 reframed asset, so the
  // hero box switches to portrait and the video frames correctly on phones.
  videoMobileIsPortrait: false,
};

// Striped fallback used when a remote image fails to load
function ph(label) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='720' height='900'>
    <defs><pattern id='s' width='14' height='14' patternTransform='rotate(45)' patternUnits='userSpaceOnUse'>
      <rect width='14' height='14' fill='%23ece7df'/><line x1='0' y1='0' x2='0' y2='14' stroke='rgba(27,26,22,0.06)' stroke-width='8'/></pattern></defs>
    <rect width='720' height='900' fill='url(%23s)'/>
    <text x='360' y='455' font-family='monospace' font-size='22' letter-spacing='2' fill='%23807c70' text-anchor='middle'>${encodeURIComponent(label).replace(/%20/g,' ')}</text>
    <text x='360' y='490' font-family='monospace' font-size='13' letter-spacing='3' fill='%23a8a292' text-anchor='middle'>PRODUCT PHOTO</text>
  </svg>`;
  return "data:image/svg+xml;utf8," + svg.replace(/\n\s*/g, "");
}

export const CC = {
  img,
  ph,
  PRODUCTS,
  GROUPS,
  CATEGORIES,
  HERO,
  MAPS: "https://www.google.com/maps/search/?api=1&query=Conscious%20Cafe%20Auroville",
  byCategory: (id) => PRODUCTS.filter((p) => p.category === id),
  byGroup: (gid) => CATEGORIES.filter((c) => c.group === gid),
  groupOf: (catId) => (CATEGORIES.find((c) => c.id === catId) || {}).group || "food",
  groupName: (gid) => (GROUPS.find((g) => g.id === gid) || {}).name || gid,
  groupCount: (gid) => PRODUCTS.filter((p) => CATEGORIES.find((c) => c.id === p.category && c.group === gid)).length,
  bestsellers: () => PRODUCTS.filter((p) => p.bestseller),
  find: (id) => PRODUCTS.find((p) => p.id === id),
  catName: (id) => (CATEGORIES.find((c) => c.id === id) || {}).name || id,
};
