const FOOD = 'images/menu-photos/food';
const DRINKS = 'images/menu-photos/drinks';

// Curated dish photography — the real source for every image on the site.
// POS uploads (recipes.image_url) are capped at 600px / WebP q0.60, which cannot
// back the 1800x2400 detail panel or the 2000x1120 hero, so they are only a
// last-resort fallback in menuService.toProduct().
//
// Key   = recipes.sku  — assigned once by a BEFORE INSERT trigger and read-only
//         in the POS recipe form, so renaming a dish can no longer silently
//         detach its photo. (No DB constraint forbids an UPDATE, but nothing in
//         the app issues one, and check:images catches it if anything ever does.)
// Value = `${DIR}/<human-readable filename>.<ext>`  (ASCII-folded where the
//         dish name has non-ASCII or & chars, so Gumlet URL-encoding can't 404).
//
// Trailing comment = the dish name at the time of writing, for readability only.
// Nothing reads it; if it drifts from the POS that is cosmetic.
//
// Run `npm run check:images` after any edit here, after renaming a dish in the
// POS, or after replacing a photo — it verifies every key against the live menu
// and every value against public/, including filename case.
//
// Replacing a photo: `/images/*` is served immutable for a year and Gumlet
// caches on top, so reusing a filename keeps serving the old picture. Give the
// new file a different name and update the value here.
export const IMAGE_MAP = {

  // ═══════════════ DRINKS ═══════════════
  // ── Cocoa ──
  'DHB 051': `${DRINKS}/Hot Chocolate.jpg`,                           // Hot Chocolate
  'DHB 050': `${DRINKS}/Mochaccino.JPG`,                              // Mochaccino
  // ── Health Shakes ──
  'DHB 006': `${DRINKS}/Chocolate Shake.JPG`,                         // Chocolate Shake
  'DHB 007': `${DRINKS}/Date and Coconut Shake.JPG`,                  // Date and Coconut Shake
  'DHB 008': `${DRINKS}/Pistachio and Fig Shake.JPG`,                 // Pistachio & Fig Shake
  'DHB 005': `${DRINKS}/Strawberry Shake.JPG`,                        // Strawberry Shake
  // ── Hot Coffees ──
  'DHB 044': `${DRINKS}/Americano.JPG`,                               // Americano
  'DHB 048': `${DRINKS}/Cappuccino.JPG`,                              // Cappuccino
  'DHB 046': `${DRINKS}/Cortado.JPG`,                                 // Cortado
  'DHB 043': `${DRINKS}/Doppio.jpg`,                                  // Doppio
  'DHB 045': `${DRINKS}/Double Shot Americano.JPG`,                   // Double Shot Americano
  'DHB 042': `${DRINKS}/Espresso.jpg`,                                // Espresso
  'DHB 049': `${DRINKS}/Flat White.JPG`,                              // Flat White
  'DHB 047': `${DRINKS}/Latte.JPG`,                                   // Latte
  // ── Iced Coffees ──
  'DHB 039': `${DRINKS}/Frappe.jpg`,                                  // Frappe
  'DHB 040': `${DRINKS}/Iced Americano with Orange and Cinnamon.jpg`, // Iced Americano with Orange and Cinnamon
  'DHB 038': `${DRINKS}/Iced Latte.JPG`,                              // Iced Latte
  'DHB 037': `${DRINKS}/Mont Blanc.JPG`,                              // Mont Blanc
  'DHB 041': `${DRINKS}/Vegan Iced Latte.JPG`,                        // Vegan Iced Latte
  'FHB 002': `${DRINKS}/Vietnam Iced Coffee.JPG`,                     // Vietnam Iced Coffee
  // ── Juices ──
  'DHB 003': `${DRINKS}/Antioxidant.JPG`,                             // Antioxidant
  'DHB 001': `${DRINKS}/Detoxifier.JPG`,                              // Detoxifier
  'DHB 024': `${DRINKS}/Green Glow.JPG`,                              // Green Glow
  'DHB 023': `${DRINKS}/Immunity Punch.JPG`,                          // Immunity Punch
  'DHB 004': `${DRINKS}/Morning Radiance.JPG`,                        // Morning Radiance
  'DHB 002': `${DRINKS}/Vitamin C.JPG`,                               // Vitamin C
  // ── Kombucha ──
  'DHB 026': `${DRINKS}/Alphonso Mango Kombucha.JPG`,                 // Alphonso Mango Kombucha
  'DHB 027': `${DRINKS}/Berry Mix Kombucha.JPG`,                      // Berry Mix Kombucha
  'DHB 028': `${DRINKS}/Black Detox Kombucha.JPG`,                    // Black Detox Kombucha
  'DHB 030': `${DRINKS}/Lychee Rose Kombucha.JPG`,                    // Lychee Rose Kombucha
  'DHB 029': `${DRINKS}/Passion Blossom Kombucha.JPG`,                // Passion Blossom Kombucha
  'DHB 025': `${DRINKS}/Rose Kombucha v2.jpg`,                           // Rose Kombucha
  // ── Matcha Specialities ──
  'DHB 033': `${DRINKS}/Iced Matcha Latte.JPG`,                       // Iced Matcha Latte
  'DHB 032': `${DRINKS}/Matcha Latte.JPG`,                            // Matcha Latte
  'DHB 034': `${DRINKS}/Tropical Zen Blend.JPG`,                      // Tropical Zen Blend
  // ── Mocktails ──
  'DHB 018': `${DRINKS}/Fresh Kokum.JPG`,                             // Fresh Kokum
  'DHB 013': `${DRINKS}/Kokum Chilli Fizz v2.JPG`,                       // Kokum Chilli Fizz
  'DHB 054': `${DRINKS}/Lime Soda v2.jpeg`,                              // Lime Soda
  'DHB 016': `${DRINKS}/Mango Margarita.JPG`,                         // Mango Margarita
  'DHB 053': `${DRINKS}/Mojito.jpeg`,                                 // Mojito
  'DHB 011': `${DRINKS}/Pina Colada v2.JPG`,                             // Pina Colada
  'DHB 014': `${DRINKS}/Sheetali Paan Thandai.JPG`,                   // Sheetali Paan Thandai
  'DHB 019': `${DRINKS}/Strawberry Blue Spirulina.JPG`,               // Strawberry Blue Spirulina
  'DHB 015': `${DRINKS}/Strawberry Spritzer.JPG`,                     // Strawberry Spritzer
  'DHB 010': `${DRINKS}/Summer Blossom Iced Tea v2.JPG`,                 // Summer Blossom Iced Tea
  'DHB 012': `${DRINKS}/Tamarind Ginger Fizz.JPG`,                    // Tamarind Ginger Fizz
  'DHB 017': `${DRINKS}/Watermelon Mint Fizz v2.jpg`,                    // Watermelon Mint Fizz
  // ── Teas ──
  'DHB 022': `${DRINKS}/Lavender Chamomile Tea.JPG`,                  // Lavender Chamomile Tea
  'DHB 020': `${DRINKS}/Maharani Chai.jpeg`,                          // Maharani Chai
  'DHB 021': `${DRINKS}/Rose Tea.JPG`,                                // Rose Tea
  'DHB 031': `${DRINKS}/Smoked Orange Pekoe and Jasmine Tea.JPG`,     // Smoked Orange Pekoe and Jasmine Tea
  // ── Thai Favourites ──
  'DHB 009': `${DRINKS}/Peach Iced Tea v2.JPG`,                          // Peach Iced Tea
  'DHB 035': `${DRINKS}/Thai Iced Tea.JPG`,                           // Thai Iced Tea
  'DHB 036': `${DRINKS}/Thai Lemon Iced Tea.JPG`,                     // Thai Lemon Iced Tea
  'DHB 052': `${DRINKS}/Thai Tea with Orange and Cardamom.JPG`,       // Thai Tea with Orange and Cardamom

  // ═══════════════ FOOD ═══════════════
  // ── All Day Breakfast ──
  'FHB 009': `${FOOD}/Cilbir Turkish Eggs.JPG`,                       // Çılbır Turkish Eggs
  'FHB 010': `${FOOD}/French Toast.JPG`,                              // French Toast
  'FHB 008': `${FOOD}/Muhammara.jpeg`,                                // Muhammara
  'FHB 011': `${FOOD}/Pancakes.JPG`,                                  // Pancakes
  // ── Earth Bowls ──
  'FHB 032': `${FOOD}/Mezze Kodo Bowl.JPG`,                           // Mezze Kodo Bowl
  'FHB 029': `${FOOD}/Rangla Punjab Bowl.JPG`,                        // Rangla Punjab Bowl
  'FHB 028': `${FOOD}/Sol Bowl.JPG`,                                  // Sol Bowl
  'FHB 031': `${FOOD}/Thai Bowl.JPG`,                                 // Thai Bowl
  'FHB 030': `${FOOD}/Tokyo Katsu Bowl.JPG`,                          // Tokyo Katsu Bowl
  // ── Earth Crisps ──
  'FHB 018': `${FOOD}/Cassava Crisps.JPG`,                            // Cassava Crisps
  'FHB 019': `${FOOD}/Taro Root Crisps.JPG`,                          // Taro Root Crisps
  // ── Earth Grills ──
  'FHB 021': `${FOOD}/Grilled Tofu Satay.JPG`,                        // Grilled Tofu Satay
  // ── Noodle Bowls ──
  'FHB 036': `${FOOD}/Bibim Guksu.jpg`,                               // Bibim Guksu
  'FHB 033': `${FOOD}/Khao Soi.JPG`,                                  // Khao Soi
  'FHB 034': `${FOOD}/Laksa.JPG`,                                     // Laksa
  'FHB 035': `${FOOD}/Miso Ramen.jpeg`,                               // Miso Ramen
  // ── Pastas ──
  'FHB 044': `${FOOD}/Aglio e Olio.jpeg`,                             // Aglio e Olio
  'FHB 037': `${FOOD}/Meatless Meatball.JPG`,                         // Meatless Meatball
  'FHB 043': `${FOOD}/Mushroom Alfredo Pasta.jpeg`,                   // Mushroom Alfredo Pasta
  'FHB 038': `${FOOD}/Zucchini Zoodles.JPG`,                          // Zucchini Zoodles
  // ── Platters ──
  'FHB 027': `${FOOD}/Mezze Platter.JPG`,                             // Mezze Platter
  'FHB 025': `${FOOD}/Yogi Platter.JPG`,                              // Yogi Platter
  'FHB 026': `${FOOD}/Zulfi Platter.JPG`,                             // Zulfi Platter
  // ── Salads ──
  'FHB 024': `${FOOD}/Botanical Balance.JPG`,                         // Botanical Balance
  'FHB 023': `${FOOD}/Tropical Salad.JPG`,                            // Tropical Salad
  'FHB 022': `${FOOD}/Watermelon Feta Salad.JPG`,                     // Watermelon Feta Salad
  // ── Sandwiches ──
  'FHB 041': `${FOOD}/Caprese Sandwich.jpeg`,                         // Caprese Sandwich
  'FHB 040': `${FOOD}/Egg Cream Sandwich.jpeg`,                       // Egg Cream Sandwich
  'FHB 042': `${FOOD}/Mushroom Grilled Cheese Sandwich.jpeg`,         // Mushroom Grilled Cheese Sandwich
  // ── Smoothie Bowls ──
  'FHB 012': `${FOOD}/Berry Blast Smoothie.JPG`,                      // Berry Blast Smoothie
  'FHB 013': `${FOOD}/Cocoa Peanut Butter Smoothie.JPG`,              // Cocoa Peanut Butter Smoothie
  'FHB 015': `${FOOD}/Fruit Bliss Bowl.JPG`,                          // Fruit Bliss Bowl
  'FHB 014': `${FOOD}/Goodness Bowl.JPG`,                             // Goodness Bowl
  'FHB 017': `${FOOD}/Matcha Chia Pudding.JPG`,                       // Matcha Chia Pudding
  'FHB 016': `${FOOD}/Overnight Oats.JPG`,                            // Overnight Oats
  // ── Toasts ──
  'FHB 005': `${FOOD}/Avocado Toast.JPG`,                             // Avocado Toast
  'FHB 006': `${FOOD}/Avocado Toast with Egg.JPG`,                    // Avocado Toast with Egg
  'FHB 004': `${FOOD}/Burrata Bruschetta.jpeg`,                       // Burrata Bruschetta
  'FHB 003': `${FOOD}/Mushroom Toast.JPG`,                            // Mushroom Toast
  'FHB 007': `${FOOD}/Pesto Cream Cheese.JPG`,                        // Pesto Cream Cheese

  // ═══════════════ NO PHOTO YET ═══════════════
  // Explicit empty slots so this file is a complete inventory of all live
  // dishes. null renders the 600px POS fallback — fine, but not shoot quality.
  // Replace a null with a real path once the dish has been photographed.
  // A dish missing from this file ENTIRELY is a check:images error, not a warning.
  // ── Extras ──
  'FHB 050': null,  // Chia Pudding Extra
  'FHB 048': null,  // Extra Eggs
  'FHB 047': null,  // Extra Falafel
  'FHB 049': null,  // Extra Hash-Browns
  'FHB 046': null,  // Extra Pita Bread
  // ── Patisserie · Brownies ──
  'PHB 009': null,  // Chocolate Brownie
  // ── Patisserie · Cakes ──
  'PHB 008': null,  // Chocolate Lava Cake
  'PHB 015': null,  // Gluten Free Banana Cake
  'PHB 016': null,  // Swiss Roll Coffee
  'PHB 012': null,  // Tres Leches
  'PHB 011': null,  // Vegan Chocolate Cake
  // ── Patisserie · Cheesecakes ──
  'PHB 014': null,  // Blueberry Cheesecake
  'FHB 039': null,  // San Sebastian
  'PHB 013': null,  // Strawberry Cheesecake
  'PHB 010': null,  // Tiramisu Cheesecake
  // ── Patisserie · Cookies ──
  'PHB 003': null,  // Chocolate Sea Salt Cookie
  'PHB 005': null,  // Oat and Cranberry Cookie
  'PHB 004': null,  // White Chocolate and Strawberry Cookie
  // ── Patisserie · Eclair ──
  'PHB 006': null,  // Chocolate Eclair
  // ── Patisserie · Tarts ──
  'PHB 007': null,  // Chocolate Tart

  // ═══════════════ SHOT, BUT DISH NOT ON THE MENU ═══════════════
  // Photos from the June 2025 shoot whose dishes are no longer (or not yet) live
  // in the POS, so there is no SKU to key them by. The files sit in public/ ready
  // to go; check:images reports them as "unreferenced" warnings, which is correct.
  // If one of these dishes returns to the POS, move it up into FOOD with its SKU:
  //   'XXX 000': `${FOOD}/Chocolate Mousse.JPG`,       // Chocolate Mousse
  //   'XXX 000': `${FOOD}/Grilled Sweet Potato.JPG`,   // Grilled Sweet Potato
  //   'XXX 000': `${FOOD}/Panna Cotta.JPG`,            // Panna Cotta
};
