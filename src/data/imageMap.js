const FOOD = 'images/menu-photos/food';
const DRINKS = 'images/menu-photos/drinks';

// Keys match toSlug(recipe.name.trim()) from the POS database.
export const IMAGE_MAP = {
  // ── ALL DAY BREAKFAST ──────────────────────────────────────────────────────
  'french-toast':                          `${FOOD}/french toast.JPG`,
  'muhamarra':                             `${FOOD}/Muhamarra.jpg`,   // POS: "Muhamarra"
  'muhammara':                             `${FOOD}/Muhamarra.jpg`,   // variant spelling
  'pancake':                               `${FOOD}/pancake.JPG`,
  'pancakes':                              `${FOOD}/pancake.JPG`,
  'cilbir-turkish-eggs':                   `${FOOD}/cilbir.JPG`,     // POS: "Cilbir turkish eggs"
  'cilbir':                                `${FOOD}/cilbir.JPG`,

  // ── SMOOTHIE BOWLS ────────────────────────────────────────────────────────
  'berry-blast-smoothie':                  `${FOOD}/berry blast smoothie.JPG`,
  'cocoa-peanut-butter-smoothie':          `${FOOD}/cocoa peanutbutter smoothie.JPG`, // POS: "Cocoa Peanut butter smoothie"
  'cocoa-peanutbutter-smoothie':           `${FOOD}/cocoa peanutbutter smoothie.JPG`,
  'matcha-chia-pudding':                   `${FOOD}/matcha chia pudding.JPG`,
  'fruit-bliss-bowl':                      `${FOOD}/fruit bliss bowl.JPG`,
  'goodness-bowl':                         `${FOOD}/goodness bowl.JPG`,
  'overnight-oats':                        `${FOOD}/overnight oats.JPG`,

  // ── TOASTS ────────────────────────────────────────────────────────────────
  'avocado-toast':                         `${FOOD}/avocado toast.JPG`,
  'avocado-toast-with-egg':                `${FOOD}/avocado toast.JPG`,
  'burrata-bruschetta':                    `${FOOD}/buratta bruchetta.JPG`,
  'mushroom-toast':                        `${FOOD}/mushroom toast.JPG`,
  'pesto-cream-cheese':                    `${FOOD}/pesto cream cheese.JPG`,

  // ── EARTH BOWLS ───────────────────────────────────────────────────────────
  'mezze-kodo-bowl':                       `${FOOD}/mezze kodo.JPG`,
  'rangla-punjab':                         `${FOOD}/punjab rangla.JPG`,
  'sol-bowl':                              `${FOOD}/sol bowl.JPG`,
  'thai-bowl':                             `${FOOD}/thai bowl.JPG`,
  'tokyo-katsu':                           `${FOOD}/tokyo katsu.JPG`,

  // ── EARTH CRISPS ──────────────────────────────────────────────────────────
  'taro-root-crisps':                      `${FOOD}/taro root.JPG`,
  'casava-crisps':                         `${FOOD}/casava crisps.JPG`,  // POS: "Casava Crisps"
  'cassava-crisps':                        `${FOOD}/casava crisps.JPG`,

  // ── EARTH GRILLS ──────────────────────────────────────────────────────────
  'grilled-sweet-potato':                  `${FOOD}/grilled sweet potato.JPG`,
  'grilled-tofu-satay':                    `${FOOD}/grilled tofu satay.JPG`,

  // ── SALADS ────────────────────────────────────────────────────────────────
  'botanical-salad':                       `${FOOD}/botanical balance.JPG`, // POS: "Botanical Salad"
  'bb-salad':                              `${FOOD}/botanical balance.JPG`,
  'botanical-balance-bb-salad':            `${FOOD}/botanical balance.JPG`,
  'tropical-salad':                        `${FOOD}/tropical salad.JPG`,
  'watermelon-fetta-salad':                `${FOOD}/watermelon fetta salad.JPG`,

  // ── PLATTERS ──────────────────────────────────────────────────────────────
  'mezze-platter':                         `${FOOD}/mezze platter.JPG`,
  'yogi-platter':                          `${FOOD}/yogi platter.JPG`,
  'zulfi-platter':                         `${FOOD}/zulfi platter.JPG`,

  // ── NOODLE BOWLS ──────────────────────────────────────────────────────────
  'bibim-guksu':                           `${FOOD}/bibim guksu.jpg`,
  'khao-soi':                              `${FOOD}/khao soi.JPG`,
  'laksa':                                 `${FOOD}/laksa.JPG`,
  'miso-ramen':                            `${FOOD}/miso ramen.JPG`,

  // ── PASTAS ────────────────────────────────────────────────────────────────
  'meatless-meatball':                     `${FOOD}/meatless meatball pasta.JPG`, // POS: "Meatless meatball"
  'meatless-meatballs':                    `${FOOD}/meatless meatball pasta.JPG`,
  'meatless-meatballs-mm':                 `${FOOD}/meatless meatball pasta.JPG`,
  'zucchini-zoodles':                      `${FOOD}/zucchini zoodles.JPG`,

  // ── DESSERTS ──────────────────────────────────────────────────────────────
  'chocolate-mousse':                      `${FOOD}/chocolate mousse.JPG`,
  'coconut-panna-cotta':                   `${FOOD}/panacotta.JPG`,
  'panacotta':                             `${FOOD}/panacotta.JPG`,

  // ── COFFEE ────────────────────────────────────────────────────────────────
  'americano':                             `${DRINKS}/Americano.JPG`,
  'double-shot-americano':                 `${DRINKS}/Americano.JPG`,
  'capuccino':                             `${DRINKS}/capuccino.JPG`,
  'cappuccino':                            `${DRINKS}/capuccino.JPG`,
  'cortado':                               `${DRINKS}/cortado.JPG`,
  'doppio-double-espresso':                `${DRINKS}/Doppio.jpg`,    // POS: "doppio - double espresso"
  'doppio':                                `${DRINKS}/Doppio.jpg`,
  'espresso-single-shot':                  `${DRINKS}/Espresso.jpg`,  // POS: "Espresso single shot"
  'espresso':                              `${DRINKS}/Espresso.jpg`,
  'flat-white':                            `${DRINKS}/Flat white.JPG`,
  'frappe':                                `${DRINKS}/Frappe.jpg`,
  'hot-chocolate':                         `${DRINKS}/Hot chocolate.jpg`,
  'iced-americano-with-orange-and-cinnamon': `${DRINKS}/Iced Americano with orange and cinamon.jpg`, // POS spelling
  'iced-americano-with-orange-and-cinamon': `${DRINKS}/Iced Americano with orange and cinamon.jpg`,
  'iced-latte':                            `${DRINKS}/Iced Latte.JPG`,
  'latte':                                 `${DRINKS}/Latte.JPG`,
  'matcha-latte':                          `${DRINKS}/Matcha latte.JPG`,
  'mochaccinno':                           `${DRINKS}/Mochaccino.JPG`, // POS: "Mochaccinno" (3 n's)
  'mochaccino':                            `${DRINKS}/Mochaccino.JPG`,
  'mont-blanc':                            `${DRINKS}/Mont blanc coffee.JPG`, // POS: "Mont Blanc"
  'mont-blanc-coffee':                     `${DRINKS}/Mont blanc coffee.JPG`,
  'vegan-iced-latte':                      `${DRINKS}/Vegan iced latte.JPG`,
  'vietnam-iced-coffee':                   `${DRINKS}/Vietnamise iced coffee.JPG`, // POS: "Vietnam iced coffee"
  'vietnamise-iced-coffee':               `${DRINKS}/Vietnamise iced coffee.JPG`,

  // ── MATCHA & TEA ──────────────────────────────────────────────────────────
  'iced-matcha-latte':                     `${DRINKS}/iced matcha latte.JPG`,
  'lavender-chamomile-tea':                `${DRINKS}/lavender chamomile.JPG`, // POS: "Lavender chamomile tea"
  'lavender-chamomile':                    `${DRINKS}/lavender chamomile.JPG`,
  'peach-iced-tea':                        `${DRINKS}/Peach iced tea.JPG`,
  'rose-tea':                              `${DRINKS}/rose tea.JPG`,
  'smoked-orange-pekoe-and-jasmine-tea':   `${DRINKS}/smoked orange pekoe.JPG`, // POS full name
  'smoked-orange-pekoe':                   `${DRINKS}/smoked orange pekoe.JPG`,
  'thai-lemon-iced-tea':                   `${DRINKS}/thai lemon tea.JPG`,      // POS: "Thai lemon iced tea"
  'thai-lemon-tea':                        `${DRINKS}/thai lemon tea.JPG`,
  'thai-iced-tea':                         `${DRINKS}/Thai tea.JPG`,            // POS: "Thai iced Tea"
  'thai-tea':                              `${DRINKS}/Thai tea.JPG`,
  'thai-tea-with-orange-and-cardamom':     `${DRINKS}/thai tea with orange and cardamom.JPG`,

  // ── COLD DRINKS & SHAKES ──────────────────────────────────────────────────
  'chocolate-shake':                       `${DRINKS}/chocolate shake.JPG`,
  'date-ad-coconut-shake':                 `${DRINKS}/date and coconut shake.JPG`, // POS: "Date ad coconut shake"
  'date-and-coconut-shake':               `${DRINKS}/date and coconut shake.JPG`,
  'pistachio-fig-shake':                   `${DRINKS}/Pistachio and fig shake.JPG`, // POS: "Pistachio & Fig shake" (& stripped)
  'pistachio-and-fig-shake':               `${DRINKS}/Pistachio and fig shake.JPG`,
  'strawberry-shake':                      `${DRINKS}/Strawberry shake.JPG`,
  'pina-colada':                           `${DRINKS}/pinacolada.JPG`,  // POS: "Pina Colada"
  'pinacolada':                            `${DRINKS}/pinacolada.JPG`,

  // ── FRESH JUICES & DETOX ──────────────────────────────────────────────────
  'anti-oxidant':                          `${DRINKS}/antioxidant.JPG`, // POS: "Anti Oxidant"
  'antioxidant':                           `${DRINKS}/antioxidant.JPG`,
  'black-detox-kombucha':                  `${DRINKS}/Blackdetox.JPG`,  // POS: "Black Detox kombucha"
  'blackdetox':                            `${DRINKS}/Blackdetox.JPG`,
  'detoxifier':                            `${DRINKS}/detoxifier.JPG`,
  'fresh-kokum':                           `${DRINKS}/fresh kokum.JPG`,
  'greenglowjuice':                        `${DRINKS}/greenglowjuice.JPG`,
  'immunity-punch':                        `${DRINKS}/Immunitypunch.JPG`, // POS: "Immunity Punch"
  'immunitypunch':                         `${DRINKS}/Immunitypunch.JPG`,
  'vitamin-c':                             `${DRINKS}/vitaminC.JPG`,    // POS: "Vitamin C"
  'vitaminc':                              `${DRINKS}/vitaminC.JPG`,

  // ── FIZZ & KOMBUCHA ───────────────────────────────────────────────────────
  'kokum-chilli-fizz':                     `${DRINKS}/kokum chilli fizz.JPG`,
  'rose-kombucha':                         `${DRINKS}/Rosekombucha.jpg`, // POS: "Rose kombucha"
  'rosekombucha':                          `${DRINKS}/Rosekombucha.jpg`,
  'strawberry-spritzer':                   `${DRINKS}/strawberry spritzer.JPG`,
  'tamarind-ginger-fizz':                  `${DRINKS}/tamarind ginger fizz.JPG`,
  'watermelon-mint-fizz':                  `${DRINKS}/watermelon mint fizz.jpg`,

  // ── SPECIAL BLENDS & KOMBUCHA ─────────────────────────────────────────────
  'alphonso-mango-kombucha':               `${DRINKS}/AlphonsoMango.JPG`, // POS: "Alphonso Mango kombucha"
  'alphonsomango':                         `${DRINKS}/AlphonsoMango.JPG`,
  'berry-mix-kombucha':                    `${DRINKS}/Berrymix.JPG`,      // POS: "Berry mix kombucha"
  'berrymix':                              `${DRINKS}/Berrymix.JPG`,
  'lycheerose':                            `${DRINKS}/Lycheerose.JPG`,
  'mango-margarita':                       `${DRINKS}/Mangomargarita.JPG`, // POS: "Mango Margarita"
  'mangomargarita':                        `${DRINKS}/Mangomargarita.JPG`,
  'passion-blossom-kombucha':              `${DRINKS}/passionblossom.JPG`, // POS: "Passion blossom kombucha"
  'passionblossom':                        `${DRINKS}/passionblossom.JPG`,
  'sheetal-pan-thandai':                   `${DRINKS}/sheetal pan thandai.JPG`,
  'strawberry-blue-spirulina':             `${DRINKS}/strawberry spirulina.JPG`, // POS: "Strawberry blue Spirulina"
  'strawberry-spirulina':                  `${DRINKS}/strawberry spirulina.JPG`,
  'summerblossom':                         `${DRINKS}/summerblossom.JPG`,
  'tropical-zen-blend':                    `${DRINKS}/Tropical zen blend.JPG`,
};
