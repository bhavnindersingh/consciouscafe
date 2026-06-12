const FOOD = 'images/menu-photos/food';
const DRINKS = 'images/menu-photos/drinks';

// Keys match toSlug(recipe.name) from the POS database.
// Image filenames are the POS product names.
export const IMAGE_MAP = {
  // ── ALL DAY BREAKFAST ──────────────────────────────────────────────────────
  'french-toast':                    `${FOOD}/french toast.JPG`,
  'muhammara':                       `${FOOD}/Muhamarra.jpg`,
  'pancake':                         `${FOOD}/pancake.JPG`,
  'pancakes':                        `${FOOD}/pancake.JPG`,
  'cilbir':                          `${FOOD}/cilbir.JPG`,
  'turkish-eggs':                    `${FOOD}/cilbir.JPG`,

  // ── SMOOTHIE BOWLS ────────────────────────────────────────────────────────
  'berry-blast-smoothie':            `${FOOD}/berry blast smoothie.JPG`,
  'cocoa-peanutbutter-smoothie':     `${FOOD}/cocoa peanutbutter smoothie.JPG`,
  'matcha-chia-pudding':             `${FOOD}/matcha chia pudding.JPG`,
  'fruit-bliss-bowl':                `${FOOD}/fruit bliss bowl.JPG`,
  'goodness-bowl':                   `${FOOD}/goodness bowl.JPG`,
  'overnight-oats':                  `${FOOD}/overnight oats.JPG`,

  // ── TOASTS ────────────────────────────────────────────────────────────────
  'avocado-toast':                   `${FOOD}/avocado toast.JPG`,
  'burrata-bruschetta':              `${FOOD}/buratta bruchetta.JPG`,
  'mushroom-toast':                  `${FOOD}/mushroom toast.JPG`,
  'pesto-cream-cheese':              `${FOOD}/pesto cream cheese.JPG`,

  // ── EARTH BOWLS ───────────────────────────────────────────────────────────
  'mezze-kodo-bowl':                 `${FOOD}/mezze kodo.JPG`,
  'rangla-punjab':                   `${FOOD}/punjab rangla.JPG`,
  'sol-bowl':                        `${FOOD}/sol bowl.JPG`,
  'thai-bowl':                       `${FOOD}/thai bowl.JPG`,
  'tokyo-katsu':                     `${FOOD}/tokyo katsu.JPG`,

  // ── EARTH CRISPS ──────────────────────────────────────────────────────────
  'taro-root-crisps':                `${FOOD}/taro root.JPG`,
  'cassava-crisps':                  `${FOOD}/casava crisps.JPG`,

  // ── EARTH GRILLS ──────────────────────────────────────────────────────────
  'grilled-sweet-potato':            `${FOOD}/grilled sweet potato.JPG`,
  'grilled-tofu-satay':              `${FOOD}/grilled tofu satay.JPG`,

  // ── SALADS ────────────────────────────────────────────────────────────────
  'bb-salad':                        `${FOOD}/botanical balance.JPG`,
  'botanical-balance-bb-salad':      `${FOOD}/botanical balance.JPG`,
  'tropical-salad':                  `${FOOD}/tropical salad.JPG`,
  'watermelon-fetta-salad':          `${FOOD}/watermelon fetta salad.JPG`,

  // ── PLATTERS ──────────────────────────────────────────────────────────────
  'mezze-platter':                   `${FOOD}/mezze platter.JPG`,
  'yogi-platter':                    `${FOOD}/yogi platter.JPG`,
  'zulfi-platter':                   `${FOOD}/zulfi platter.JPG`,

  // ── NOODLE BOWLS ──────────────────────────────────────────────────────────
  'bibim-guksu':                     `${FOOD}/bibim guksu.jpg`,
  'khao-soi':                        `${FOOD}/khao soi.JPG`,
  'laksa':                           `${FOOD}/laksa.JPG`,
  'miso-ramen':                      `${FOOD}/miso ramen.JPG`,

  // ── PASTAS ────────────────────────────────────────────────────────────────
  'meatless-meatballs':              `${FOOD}/meatless meatball pasta.JPG`,
  'meatless-meatballs-mm':           `${FOOD}/meatless meatball pasta.JPG`,
  'zucchini-zoodles':                `${FOOD}/zucchini zoodles.JPG`,

  // ── DESSERTS ──────────────────────────────────────────────────────────────
  'chocolate-mousse':                `${FOOD}/chocolate mousse.JPG`,
  'coconut-panna-cotta':             `${FOOD}/panacotta.JPG`,
  'panacotta':                       `${FOOD}/panacotta.JPG`,

  // ── COFFEE ────────────────────────────────────────────────────────────────
  'americano':                       `${DRINKS}/Americano.JPG`,
  'capuccino':                       `${DRINKS}/capuccino.JPG`,
  'cappuccino':                      `${DRINKS}/capuccino.JPG`,
  'cortado':                         `${DRINKS}/cortado.JPG`,
  'doppio':                          `${DRINKS}/Doppio.jpg`,
  'espresso':                        `${DRINKS}/Espresso.jpg`,
  'flat-white':                      `${DRINKS}/Flat white.JPG`,
  'frappe':                          `${DRINKS}/Frappe.jpg`,
  'hot-chocolate':                   `${DRINKS}/Hot chocolate.jpg`,
  'iced-americano-with-orange-and-cinamon': `${DRINKS}/Iced Americano with orange and cinamon.jpg`,
  'iced-latte':                      `${DRINKS}/Iced Latte.JPG`,
  'latte':                           `${DRINKS}/Latte.JPG`,
  'matcha-latte':                    `${DRINKS}/Matcha latte.JPG`,
  'mochaccino':                      `${DRINKS}/Mochaccino.JPG`,
  'mont-blanc-coffee':               `${DRINKS}/Mont blanc coffee.JPG`,
  'vegan-iced-latte':                `${DRINKS}/Vegan iced latte.JPG`,
  'vietnamise-iced-coffee':          `${DRINKS}/Vietnamise iced coffee.JPG`,

  // ── MATCHA & TEA ──────────────────────────────────────────────────────────
  'iced-matcha-latte':               `${DRINKS}/iced matcha latte.JPG`,
  'lavender-chamomile':              `${DRINKS}/lavender chamomile.JPG`,
  'peach-iced-tea':                  `${DRINKS}/Peach iced tea.JPG`,
  'rose-tea':                        `${DRINKS}/rose tea.JPG`,
  'smoked-orange-pekoe':             `${DRINKS}/smoked orange pekoe.JPG`,
  'thai-lemon-tea':                  `${DRINKS}/thai lemon tea.JPG`,
  'thai-tea':                        `${DRINKS}/Thai tea.JPG`,
  'thai-tea-with-orange-and-cardamom': `${DRINKS}/thai tea with orange and cardamom.JPG`,

  // ── COLD DRINKS & SHAKES ──────────────────────────────────────────────────
  'chocolate-shake':                 `${DRINKS}/chocolate shake.JPG`,
  'date-and-coconut-shake':          `${DRINKS}/date and coconut shake.JPG`,
  'pistachio-and-fig-shake':         `${DRINKS}/Pistachio and fig shake.JPG`,
  'strawberry-shake':                `${DRINKS}/Strawberry shake.JPG`,
  'pinacolada':                      `${DRINKS}/pinacolada.JPG`,

  // ── FRESH JUICES & DETOX ──────────────────────────────────────────────────
  'antioxidant':                     `${DRINKS}/antioxidant.JPG`,
  'blackdetox':                      `${DRINKS}/Blackdetox.JPG`,
  'detoxifier':                      `${DRINKS}/detoxifier.JPG`,
  'fresh-kokum':                     `${DRINKS}/fresh kokum.JPG`,
  'greenglowjuice':                  `${DRINKS}/greenglowjuice.JPG`,
  'immunitypunch':                   `${DRINKS}/Immunitypunch.JPG`,
  'vitaminc':                        `${DRINKS}/vitaminC.JPG`,

  // ── FIZZ & KOMBUCHA ───────────────────────────────────────────────────────
  'kokum-chilli-fizz':               `${DRINKS}/kokum chilli fizz.JPG`,
  'rosekombucha':                    `${DRINKS}/Rosekombucha.jpg`,
  'strawberry-spritzer':             `${DRINKS}/strawberry spritzer.JPG`,
  'summerblossom':                   `${DRINKS}/summerblossom.JPG`,
  'tamarind-ginger-fizz':            `${DRINKS}/tamarind ginger fizz.JPG`,
  'watermelon-mint-fizz':            `${DRINKS}/watermelon mint fizz.jpg`,

  // ── SPECIAL BLENDS ────────────────────────────────────────────────────────
  'alphonsomango':                   `${DRINKS}/AlphonsoMango.JPG`,
  'berrymix':                        `${DRINKS}/Berrymix.JPG`,
  'lycheerose':                      `${DRINKS}/Lycheerose.JPG`,
  'mangomargarita':                  `${DRINKS}/Mangomargarita.JPG`,
  'passionblossom':                  `${DRINKS}/passionblossom.JPG`,
  'sheetal-pan-thandai':             `${DRINKS}/sheetal pan thandai.JPG`,
  'strawberry-spirulina':            `${DRINKS}/strawberry spirulina.JPG`,
  'tropical-zen-blend':              `${DRINKS}/Tropical zen blend.JPG`,
};
