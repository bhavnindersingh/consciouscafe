const FOOD = 'images/menu-photos/food';
const DRINKS = 'images/menu-photos/drinks';

// Single source of truth: the POS recipe name.
// Key   = toSlug(recipe.name)  — what menuService looks up.
// Value = `${DIR}/<exact POS recipe name>.<ext>`  (ASCII-folded only where the
//         name has non-ASCII or & chars, so Gumlet URL-encoding can't 404).
// Regenerate from POS, do not hand-edit keys.
export const IMAGE_MAP = {

  // ═══════════════ DRINKS ═══════════════
  // ── Cocoa ──
  'hot-chocolate':                           `${DRINKS}/Hot Chocolate.jpg`,
  'mochaccino':                              `${DRINKS}/Mochaccino.JPG`,
  // ── Health Shakes ──
  'chocolate-shake':                         `${DRINKS}/Chocolate Shake.JPG`,
  'date-and-coconut-shake':                  `${DRINKS}/Date and Coconut Shake.JPG`,
  'pistachio-fig-shake':                     `${DRINKS}/Pistachio and Fig Shake.JPG`,
  'strawberry-shake':                        `${DRINKS}/Strawberry Shake.JPG`,
  // ── Hot Coffees ──
  'americano':                               `${DRINKS}/Americano.JPG`,
  'cappuccino':                              `${DRINKS}/Cappuccino.JPG`,
  'cortado':                                 `${DRINKS}/Cortado.JPG`,
  'doppio':                                  `${DRINKS}/Doppio.jpg`,
  'double-shot-americano':                   `${DRINKS}/Double Shot Americano.JPG`,
  'espresso':                                `${DRINKS}/Espresso.jpg`,
  'flat-white':                              `${DRINKS}/Flat White.JPG`,
  'latte':                                   `${DRINKS}/Latte.JPG`,
  // ── Iced Coffees ──
  'frappe':                                  `${DRINKS}/Frappe.jpg`,
  'iced-americano-with-orange-and-cinnamon': `${DRINKS}/Iced Americano with Orange and Cinnamon.jpg`,
  'iced-latte':                              `${DRINKS}/Iced Latte.JPG`,
  'mont-blanc':                              `${DRINKS}/Mont Blanc.JPG`,
  'vegan-iced-latte':                        `${DRINKS}/Vegan Iced Latte.JPG`,
  'vietnam-iced-coffee':                     `${DRINKS}/Vietnam Iced Coffee.JPG`,
  // ── Juices ──
  'antioxidant':                             `${DRINKS}/Antioxidant.JPG`,
  'detoxifier':                              `${DRINKS}/Detoxifier.JPG`,
  'green-glow':                              `${DRINKS}/Green Glow.JPG`,
  'immunity-punch':                          `${DRINKS}/Immunity Punch.JPG`,
  'morning-radiance':                        `${DRINKS}/Morning Radiance.JPG`,
  'vitamin-c':                               `${DRINKS}/Vitamin C.JPG`,
  // ── Kombucha ──
  'alphonso-mango-kombucha':                 `${DRINKS}/Alphonso Mango Kombucha.JPG`,
  'berry-mix-kombucha':                      `${DRINKS}/Berry Mix Kombucha.JPG`,
  'black-detox-kombucha':                    `${DRINKS}/Black Detox Kombucha.JPG`,
  'passion-blossom-kombucha':                `${DRINKS}/Passion Blossom Kombucha.JPG`,
  'rose-kombucha':                           `${DRINKS}/Rose Kombucha.jpg`,
  // ── Matcha Specialities ──
  'iced-matcha-latte':                       `${DRINKS}/Iced Matcha Latte.JPG`,
  'matcha-latte':                            `${DRINKS}/Matcha Latte.JPG`,
  'tropical-zen-blend':                      `${DRINKS}/Tropical Zen Blend.JPG`,
  // ── Mocktails ──
  'fresh-kokum':                             `${DRINKS}/Fresh Kokum.JPG`,
  'kokum-chilli-fizz':                       `${DRINKS}/Kokum Chilli Fizz.JPG`,
  'lime-soda':                               `${DRINKS}/Lime Soda.jpeg`,
  'mango-margarita':                         `${DRINKS}/Mango Margarita.JPG`,
  'mojito':                                  `${DRINKS}/Mojito.jpeg`,
  'pina-colada':                             `${DRINKS}/Pina Colada.JPG`,
  'sheetali-paan-thandai':                   `${DRINKS}/Sheetali Paan Thandai.JPG`,
  'strawberry-blue-spirulina':               `${DRINKS}/Strawberry Blue Spirulina.JPG`,
  'strawberry-spritzer':                     `${DRINKS}/Strawberry Spritzer.JPG`,
  'summer-blossoms-iced-tea':                `${DRINKS}/Summer Blossoms Iced Tea.JPG`,
  'tamarind-ginger-fizz':                    `${DRINKS}/Tamarind Ginger Fizz.JPG`,
  'watermelon-mint-fizz':                    `${DRINKS}/Watermelon Mint Fizz.jpg`,
  // ── Teas ──
  'lavender-chamomile-tea':                  `${DRINKS}/Lavender Chamomile Tea.JPG`,
  'maharani-chai':                           `${DRINKS}/Maharani Chai.jpeg`,
  'rose-tea':                                `${DRINKS}/Rose Tea.JPG`,
  'smoked-orange-pekoe-and-jasmine-tea':     `${DRINKS}/Smoked Orange Pekoe and Jasmine Tea.JPG`,
  // ── Thai Favourites ──
  'peach-iced-tea':                          `${DRINKS}/Peach Iced Tea.JPG`,
  'thai-iced-tea':                           `${DRINKS}/Thai Iced Tea.JPG`,
  'thai-lemon-iced-tea':                     `${DRINKS}/Thai Lemon Iced Tea.JPG`,
  'thai-tea-with-orange-and-cardamom':       `${DRINKS}/Thai Tea with Orange and Cardamom.JPG`,

  // ═══════════════ FOOD ═══════════════
  // ── All Day Breakfast ──
  'lbr-turkish-eggs':                        `${FOOD}/Cilbir Turkish Eggs.JPG`,
  'french-toast':                            `${FOOD}/French Toast.JPG`,
  'muhammara':                               `${FOOD}/Muhammara.jpeg`,
  'pancakes':                                `${FOOD}/Pancakes.JPG`,
  // ── Earth Bowls ──
  'mezze-kodo-bowl':                         `${FOOD}/Mezze Kodo Bowl.JPG`,
  'rangla-punjab-bowl':                      `${FOOD}/Rangla Punjab Bowl.JPG`,
  'sol-bowl':                                `${FOOD}/Sol Bowl.JPG`,
  'thai-bowl':                               `${FOOD}/Thai Bowl.JPG`,
  'tokyo-katsu-bowl':                        `${FOOD}/Tokyo Katsu Bowl.JPG`,
  // ── Earth Crisps ──
  'cassava-crisps':                          `${FOOD}/Cassava Crisps.JPG`,
  'taro-root-crisps':                        `${FOOD}/Taro Root Crisps.JPG`,
  // ── Earth Grills ──
  'grilled-tofu-satay':                      `${FOOD}/Grilled Tofu Satay.JPG`,
  // ── Noodle Bowls ──
  'bibim-guksu':                             `${FOOD}/Bibim Guksu.jpg`,
  'khao-soi':                                `${FOOD}/Khao Soi.JPG`,
  'laksa':                                   `${FOOD}/Laksa.JPG`,
  'miso-ramen':                              `${FOOD}/Miso Ramen.jpeg`,
  // ── Pastas ──
  'aglio-e-olio':                            `${FOOD}/Aglio e Olio.jpeg`,
  'meatless-meatball':                       `${FOOD}/Meatless Meatball.JPG`,
  'mushroom-alfredo-pasta':                  `${FOOD}/Mushroom Alfredo Pasta.jpeg`,
  'zucchini-zoodles':                        `${FOOD}/Zucchini Zoodles.JPG`,
  // ── Platters ──
  'mezze-platter':                           `${FOOD}/Mezze Platter.JPG`,
  'yogi-platter':                            `${FOOD}/Yogi Platter.JPG`,
  'zulfi-platter':                           `${FOOD}/Zulfi Platter.JPG`,
  // ── Salads ──
  'botanical-balance':                       `${FOOD}/Botanical Balance.JPG`,
  'tropical-salad':                          `${FOOD}/Tropical Salad.JPG`,
  'watermelon-feta-salad':                   `${FOOD}/Watermelon Feta Salad.JPG`,
  // ── Sandwiches ──
  'caprese-sandwich':                        `${FOOD}/Caprese Sandwich.jpeg`,
  'egg-cream-sandwich':                      `${FOOD}/Egg Cream Sandwich.jpeg`,
  'mushroom-grilled-cheese-sandwich':        `${FOOD}/Mushroom Grilled Cheese Sandwich.jpeg`,
  // ── Smoothie Bowls ──
  'berry-blast-smoothie':                    `${FOOD}/Berry Blast Smoothie.JPG`,
  'cocoa-peanut-butter-smoothie':            `${FOOD}/Cocoa Peanut Butter Smoothie.JPG`,
  'fruit-bliss-bowl':                        `${FOOD}/Fruit Bliss Bowl.JPG`,
  'goodness-bowl':                           `${FOOD}/Goodness Bowl.JPG`,
  'matcha-chia-pudding':                     `${FOOD}/Matcha Chia Pudding.JPG`,
  'overnight-oats':                          `${FOOD}/Overnight Oats.JPG`,
  // ── Toasts ──
  'avocado-toast':                           `${FOOD}/Avocado Toast.JPG`,
  'avocado-toast-with-egg':                  `${FOOD}/Avocado Toast with Egg.JPG`,
  'burrata-bruschetta':                      `${FOOD}/Burrata Bruschetta.jpeg`,
  'mushroom-toast':                          `${FOOD}/Mushroom Toast.JPG`,
  'pesto-cream-cheese':                      `${FOOD}/Pesto Cream Cheese.JPG`,
};
