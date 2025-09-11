export const products = [
  // TOAST
  { 
    id: 1, 
    name: "Mushroom Toast", 
    category: "toast", 
    price: 190, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/TOASTS/mushroom%20toast/MushroomToast.webp.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/TOASTS/mushroom%20toast/MushroomToast.webp.JPG",
    description: "Sourdough toast, babaganoush, roasted mushrooms, pesto and micro-greens",
    nutrition: { calories: 239, protein: 8, carbs: 28, fats: 10.5 },
    dietary: "vegan"
  },
    {
    id: 2,
    name: "Avocado Toast",
    category: "toast",
    price: 199,
    bestseller: true,
    options: [
      { name: "Veg", price: 199 },
      { name: "With Poached Egg", price: 220 },
    ],
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/TOASTS/avacado%20toast/avocadotoast.webp.JPG",
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/TOASTS/avacado%20toast/avocadotoast.webp.JPG",
    description: "Sourdough toast, avocado, fetta cheese, micro greens & optional poached egg",
    nutrition: { calories: "285/350", protein: "7.2/13.2", carbs: 25, fats: "17/22" },
    dietary: "veg/egg"
  },
  { 
    id: 3, 
    name: "Pesto Cream Cheese", 
    category: "toast", 
    price: 199, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/TOASTS/pesto%20cream%20cheese/pestocreamcheese.webp.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/TOASTS/pesto%20cream%20cheese/pestocreamcheese.webp.JPG",
    description: "Sourdough toast, cream cheese, pesto, roasted beetroot, radish, micro-greens",
    nutrition: { calories: 214, protein: 7.5, carbs: 25, fats: 9 },
    dietary: "veg"
  },
  { 
    id: 4, 
    name: "Burrata Bruschetta", 
    category: "toast", 
    price: 220, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/TOASTS/buratta%20bruchetta/burratabruschetta.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/TOASTS/buratta%20bruchetta/burratabruschetta.JPG",
    description: "Sourdough toast, burrata cheese, roasted cherry tomatoes, balsamic dressing and fresh basil",
    nutrition: { calories: 191, protein: 7, carbs: 25, fats: 6.6 },
    dietary: "veg"
  },

  // ALL DAY BREAKFAST
  { 
    id: 5, 
    name: "Muhammara", 
    category: "all-day-breakfast", 
    price: 250, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/ALL%20DAY%20BREAKFAST/Muhammara/Muhammara.jpg", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/ALL%20DAY%20BREAKFAST/Muhammara/Muhammara.jpg",
    description: "Roasted red pepper dip with salad, smoked eggplant, vegan sour cream & chilli oil, served with a side of warm pita bread",
    nutrition: { calories: 360, protein: 8.2, carbs: 47, fats: 15 },
    dietary: "vegan"
  },
  { 
    id: 6, 
    name: "Cilbir", 
    category: "all-day-breakfast", 
    price: 290, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/ALL%20DAY%20BREAKFAST/Turkish%20eggs/Turkish%20Eggs.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/ALL%20DAY%20BREAKFAST/Turkish%20eggs/Turkish%20Eggs.JPG",
    description: "Turkish style poached eggs, on a bed of herbed yogurt, chilli oil and served with a side of warm pita bread",
    nutrition: { calories: 391, protein: 20, carbs: 32, fats: 19 },
    dietary: "veg/contains egg"
  },
  { 
    id: 7, 
    name: "Pancake", 
    category: "all-day-breakfast", 
    price: 380, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/ALL%20DAY%20BREAKFAST/Pancakes/Pancake.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/ALL%20DAY%20BREAKFAST/Pancakes/Pancake.JPG",
    description: "Gluten free pancakes, topped with strawberry compote, chocolate, caramel with a side of fresh fruits",
    nutrition: { calories: 295, protein: 6.3, carbs: 36, fats: 14.8 },
    dietary: "veg/gluten free"
  },
  { 
    id: 8, 
    name: "French Toast", 
    category: "all-day-breakfast", 
    price: 380, 
    bestseller: true, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/ALL%20DAY%20BREAKFAST/french%20toast/French%20Toast.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/ALL%20DAY%20BREAKFAST/french%20toast/French%20Toast.JPG",
    description: "Served with a side of lemon curd and fresh orange",
    nutrition: { calories: 291, protein: 8.7, carbs: 43, fats: 10 },
    dietary: "veg/contains egg"
  },

  // SMOOTHIE BOWLS
  { 
    id: 9, 
    name: "Berry Blast Smoothie", 
    category: "smoothie-bowls", 
    price: 270, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/Berry%20blast%20smoothie/Berry%20Blast%20Smoothie.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/Berry%20blast%20smoothie/Berry%20Blast%20Smoothie.JPG",
    description: "Mixed berries, bananas, coconut milk topped with fresh seasonal fruit, muesli and coconut flakes",
    nutrition: { calories: 273, protein: 5, carbs: 49, fats: 9 },
    dietary: "vegan"
  },
  { 
    id: 10, 
    name: "Cocoa Peanut Smoothie", 
    category: "smoothie-bowls", 
    price: 320, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/cacao%20bowl/Cacao%20Bowl.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/cacao%20bowl/Cacao%20Bowl.JPG",
    description: "Bananas, oat, cocoa, peanut butter and soy milk, topped with fresh seasonal fruit, muesli and coconut flakes",
    nutrition: { calories: 355, protein: 9, carbs: 53, fats: 13 },
    dietary: "vegan"
  },
  { 
    id: 11, 
    name: "Goodness Bowl", 
    category: "smoothie-bowls", 
    price: 280, 
    bestseller: true, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/Goodness%20bowl/Goodness%20Bowl.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/Goodness%20bowl/Goodness%20Bowl.JPG",
    description: "Yogurt, honey papaya, orange and pomegranate topped with honey, muesli and coconut flakes",
    nutrition: { calories: 305, protein: 9, carbs: 50, fats: 8.7 },
    dietary: "veg"
  },
  { 
    id: 12, 
    name: "Fruit Bliss Bowl", 
    category: "smoothie-bowls", 
    price: 320, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/fruit%20bliss%20bowl/Fruit%20Bliss%20Bowl.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/fruit%20bliss%20bowl/Fruit%20Bliss%20Bowl.JPG",
    description: "Seasonal fruits, topped with coconut flakes, dates, almonds and chia seeds served with a side of date syrup and coconut milk",
    nutrition: { calories: 449, protein: 7, carbs: 59, fats: 24 },
    dietary: "vegan"
  },
  { 
    id: 13, 
    name: "Overnight Oats", 
    category: "smoothie-bowls", 
    price: 260, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/Overnight%20Oats/Overnight%20Oats.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/Overnight%20Oats/Overnight%20Oats.JPG",
    description: "Over night oats made with oat milk, peanut butter, and vanilla topped with strawberry compote, fresh bananas and house made muesli",
    nutrition: { calories: 280, protein: 10, carbs: 38, fats: 8 },
    dietary: "vegan"
  },
  { 
    id: 14, 
    name: "Matcha Chia Pudding", 
    category: "smoothie-bowls", 
    price: 270, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/Chia%20pudding/Match%20Chia%20Pudding.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SMOOTHIE%20BOWLS/Chia%20pudding/Match%20Chia%20Pudding.JPG",
    description: "Creamy chia pudding made with matcha, coconut, topped with seasonal tropical fruits and house made muesli",
    nutrition: { calories: 260, protein: 5, carbs: 10, fats: 23 },
    dietary: "vegan"
  },

  // EARTH GRILLS/CRISPS
  { 
    id: 15, 
    name: "Grilled Sweet Potato", 
    category: "earth-grills-crisps", 
    price: 280, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20GRILS/Grilled%20sweet%20potato/Grilled%20Sweet%20Potato.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20GRILS/Grilled%20sweet%20potato/Grilled%20Sweet%20Potato.JPG",
    description: "Sweet and smoky grilled sweet potato with vegan sour cream and pesto",
    nutrition: { calories: 135, protein: 4.1, carbs: 25, fats: 1.8 },
    dietary: "vegan/gluten free"
  },
  { 
    id: 16, 
    name: "Grilled Tofu Satay", 
    category: "earth-grills-crisps", 
    price: 350, 
    bestseller: true,
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20GRILS/Tofu%20Satay/Grilled%20Tofu%20Satay.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20GRILS/Tofu%20Satay/Grilled%20Tofu%20Satay.JPG",
    description: "Grilled tofu skewers with asian peanut satay sauce",
    nutrition: { calories: 220, protein: 26, carbs: 12, fats: 24 },
    dietary: "vegan/gluten free"
  },
  { 
    id: 17, 
    name: "Taro Root Crisps", 
    category: "earth-grills-crisps", 
    price: 250, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20CRISPS/Tarot%20root%20fries/Taro%20Root%20Crisps.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20CRISPS/Tarot%20root%20fries/Taro%20Root%20Crisps.JPG",
    description: "Arbi root fries seasoned with zatar and served with pesto and vegan mayo",
    nutrition: { calories: 273, protein: 2, carbs: 37, fats: 13 },
    dietary: "vegan/gluten free"
  },
  { 
    id: 18, 
    name: "Cassava Crisps", 
    category: "earth-grills-crisps", 
    price: 200, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20CRISPS/Yuka%20(tapiocca%20fries)/Cassava%20Crisps.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20CRISPS/Yuka%20(tapiocca%20fries)/Cassava%20Crisps.JPG",
    description: "Tapioca fries served with a sweet and spicy pineapple jalapeño salsa",
    nutrition: { calories: 240, protein: 1.4, carbs: 42, fats: 7.4 },
    dietary: "vegan/gluten free"
  },

  // SALADS
  { 
    id: 19, 
    name: "Watermelon Feta", 
    category: "salads", 
    price: 270, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SALADS/Watermelon%20fetta%20salad/Watermelon%20Fetta%20Salad.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SALADS/Watermelon%20fetta%20salad/Watermelon%20Fetta%20Salad.JPG",
    description: "A spread of lettuce with watermelon, cucumber, feta, almonds, and a balsamic vinaigrette",
    nutrition: { calories: 228, protein: 8.2, carbs: 20, fats: 13.8 },
    dietary: "veg/gluten free"
  },
  { 
    id: 20, 
    name: "Tropical Salad", 
    category: "salads", 
    price: 350, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SALADS/Tropical%20salad/Tropical%20Salad.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SALADS/Tropical%20salad/Tropical%20Salad.JPG",
    description: "Lettuce, roasted beetroot, orange, walnuts, bocconcini and a orange tahini dressing",
    nutrition: { calories: 277, protein: 10.4, carbs: 23.4, fats: 17.2 },
    dietary: "veg/gluten free"
  },
  { 
    id: 21, 
    name: "Botanical Balance (BB) Salad", 
    category: "salads", 
    price: 420, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SALADS/BB%20salad/Botanical%20Balance%20(BB)%20Salad.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/SALADS/BB%20salad/Botanical%20Balance%20(BB)%20Salad.JPG",
    description: "Flavor-packed salad with madagascar beans, crispy tofu, fresh veggies, and a zesty miso-citrus dressing",
    nutrition: { calories: 270, protein: 14, carbs: 14, fats: 18 },
    dietary: "veg/gluten free"
  },

  // PLATTERS
  { 
    id: 22, 
    name: "Yogi Platter", 
    category: "platters", 
    price: 380, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PLATTERS/yogi%20platter/Yogi%20Platter.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PLATTERS/yogi%20platter/Yogi%20Platter.JPG",
    description: "Roasted mushrooms, babaganoush, hash brown, vegan sour cream, sourdough toast, salads and chia pudding",
    dietary: "vegan"
  },
  { 
    id: 23, 
    name: "Zulfi Platter", 
    category: "platters", 
    price: 420, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PLATTERS/Zulfi%20platter/Zulfi%20Platter.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PLATTERS/Zulfi%20platter/Zulfi%20Platter.JPG",
    description: "Eggs (of your choice), hash browns, babaganoush, salad, roasted mushrooms, vegan sour cream and spinach and corn creamy drip with sour dough toast",
    dietary: "veg/contains egg"
  },
  { 
    id: 24, 
    name: "Mezze Platter", 
    category: "platters", 
    price: 590, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PLATTERS/Mezze%20platter/Mezze%20Platter.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PLATTERS/Mezze%20platter/Mezze%20Platter.JPG",
    description: "Mediterranean platter with roasted veggies, chips, falafel, hummus, babaganoush, muhamarra, fetta cheese, pickles and pita bread",
    dietary: "vegan"
  },

  // EARTH BOWLS
  { 
    id: 26, 
    name: "Thai Bowl", 
    category: "earth-bowls", 
    price: 620, 
    bestseller: true,
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Thai%20Bowl.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Thai%20Bowl.JPG",
    description: "Tofu Krapao, pomelo or citrus salad, jasmine rice, and steamed greens with a side of Nam Phrik sauce",
    dietary: "vegan"
  },
  { 
    id: 27, 
    name: "Tokyo Katsu", 
    category: "earth-bowls", 
    price: 550, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Tokyo%20Katsu.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Tokyo%20Katsu.JPG",
    description: "Crispy eggplant katsu, curry, steamed greens, Goma salad and Jasmine rice",
    dietary: "vegan"
  },
  { 
    id: 28, 
    name: "Rangla Punjab", 
    category: "earth-bowls", 
    price: 420, 
    bestseller: true,
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Rangla%20Punjab.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Rangla%20Punjab.JPG",
    description: "Malai koft, hara saag, millets, salad and makki corn roti",
    dietary: "veg"
  },
  { 
    id: 29, 
    name: "Sol Bowl", 
    category: "earth-bowls", 
    price: 410, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Sol%20Bowl.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Sol%20Bowl.JPG",
    description: "Black beans, millets, sour cream, roasted corn and pepper salsa, guacamole and plantain",
    dietary: "vegan"
  },
  { 
    id: 30, 
    name: "Mezze Kodo Bowl", 
    category: "earth-bowls", 
    price: 380, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Mezze%20Kodo%20Bowl.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/EARTH%20BOWLS/Mezze%20Kodo%20Bowl.JPG",
    description: "Beetroot Hummus, fetta, kodo, falafel, grilled veggies with muhamarra",
    dietary: "vegan"
  },

  // NOODLE BOWLS
  { 
    id: 31, 
    name: "Khao Soi", 
    category: "noodle-bowls", 
    price: 480, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/NOODLE%20BOWLS/Khao%20Soi.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/NOODLE%20BOWLS/Khao%20Soi.JPG",
    description: "Coconut and spiced turmeric broth with udon noodles, veggies and tofu, topped with crispy rice noodle, fried shallots, peanuts, coriander and green onions",
    nutrition: { calories: 460, protein: 20, carbs: 30, fats: 18 },
    dietary: "vegan"
  },
  { 
    id: 32, 
    name: "Laksa", 
    category: "noodle-bowls", 
    price: 490, 
    bestseller: true,
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/NOODLE%20BOWLS/Laksa.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/NOODLE%20BOWLS/Laksa.JPG",
    description: "Spicy peanut broth, rice noodles, crispy tofu, bok-choi, pickled cabbage and corn",
    nutrition: { calories: 530, protein: 22, carbs: 30, fats: 20 },
    dietary: "vegan"
  },
  { 
    id: 33, 
    name: "Miso Ramen", 
    category: "noodle-bowls", 
    price: 405, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/NOODLE%20BOWLS/Miso%20Ramen.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/NOODLE%20BOWLS/Miso%20Ramen.JPG",
    description: "Creamy miso broth, udon noodles, mushrooms, bokchoi and kimchi",
    nutrition: { calories: 355, protein: 12, carbs: 53, fats: 9.5 },
    dietary: "vegan"
  },
  { 
    id: 34, 
    name: "Bibim Guksu", 
    category: "noodle-bowls", 
    price: 420, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/NOODLE%20BOWLS/Bibim%20Guksu.jpg", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/NOODLE%20BOWLS/Bibim%20Guksu.jpg",
    description: "Gochujang soba noodles served cold with kimchi & asian veggies (egg optional)",
    nutrition: { calories: 360, protein: 12, carbs: 60, fats: 10 },
    dietary: "vegan"
  },

  // PASTA/PIZZA
  { 
    id: 35, 
    name: "Meatless Meatball (M&M)", 
    category: "pasta-pizza", 
    price: 510, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PASTAS/Meatless%20Meatballs%20(M%26M).JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PASTAS/Meatless%20Meatballs%20(M%26M).JPG",
    description: "Meatless meat balls cooked in aromatic tomato sauce, with spaghetti, fresh basil and parmesan cheese",
    nutrition: { calories: 423, protein: 15, carbs: 53, fats: 17 },
    dietary: "veg"
  },
  { 
    id: 36, 
    name: "Zucchini Zoodles (ZZ)", 
    category: "pasta-pizza", 
    price: 470, 
    bestseller: true,
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PASTAS/Zucchini%20Zoodles(ZZ).JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/PASTAS/Zucchini%20Zoodles(ZZ).JPG",
    description: "Zucchini noodles with creamy pesto, topped with fresh greens, basil, cherry tomatoes, and bocconcini",
    nutrition: { calories: 340, protein: 12, carbs: 12, fats: 28 },
    dietary: "veg/gluten free"
  },

  // DESSERTS
  { 
    id: 41, 
    name: "Coconut Panna Cotta", 
    category: "desserts", 
    price: 220, 
    bestseller: true,
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/DESSERTS/Coconut%20Panna%20Cotta.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/DESSERTS/Coconut%20Panna%20Cotta.JPG",
    description: "Coconut panna cotta with passion fruit coulis and tropical fruit topping",
    nutrition: { calories: 247, protein: 2, carbs: 11, fats: 23 },
    dietary: "vegan"
  },
  { 
    id: 42, 
    name: "Chocolate Mousse", 
    category: "desserts", 
    price: 289, 
    imageType: 'sirv',
    image: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/DESSERTS/Chocolate%20Mousse.JPG", 
    sirvDataSrc: "https://consciouscafe.sirv.com/Food%20Menu%20Conscious%20Cafe%20August'25/DESSERTS/Chocolate%20Mousse.JPG",
    description: "Vegan dark chocolate orange mousse, orange concentrate, almond praline salted tuile",
    nutrition: { calories: 389, protein: 5.3, carbs: 29, fats: 30 },
    dietary: "vegan"
  },

  // DRINKS - JUICES
  { id: 43, name: "Detoxifier", category: "juices", subcategory: "juices", price: 250, image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop", description: "Refreshing detox juice blend with green vegetables and fruits." },
  { id: 44, name: "Vit C Booster", category: "juices", subcategory: "juices", price: 200, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop", description: "Vitamin C rich juice with citrus fruits and immunity boosting ingredients." },
  { id: 45, name: "Anti Oxidant", category: "juices", subcategory: "juices", price: 320, image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop", description: "Antioxidant-rich berry and pomegranate juice blend." },
  { id: 46, name: "Immunity Punch", category: "juices", subcategory: "juices", price: 190, image: "https://images.unsplash.com/photo-1565299585323-38174c13a5c9?w=400&h=400&fit=crop", description: "Immune-boosting juice with turmeric, ginger, and citrus." },
  { id: 47, name: "Morning Radiance", category: "juices", subcategory: "juices", price: 250, image: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=400&h=400&fit=crop", description: "Energizing morning juice with carrots, oranges, and ginger." },
  { id: 48, name: "Tropical Zen Blend", category: "juices", subcategory: "juices", price: 290, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop", description: "Tropical fruit blend with mango, pineapple, and coconut water." },
  { id: 49, name: "Strawberry Spirulina", category: "juices", subcategory: "juices", price: 290, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop", description: "Nutrient-packed strawberry juice with spirulina superfood." },
  { id: 50, name: "Fresh Kokum", category: "juices", subcategory: "juices", price: 220, image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop", description: "Refreshing kokum juice with cooling properties." },
  { id: 51, name: "Indian Sarsaparilla Bliss", category: "juices", subcategory: "juices", price: 220, image: "https://images.unsplash.com/photo-1565299585323-38174c13a5c9?w=400&h=400&fit=crop", description: "Traditional Indian sarsaparilla root juice for natural cooling." },
  { id: 52, name: "Mango Margarita", category: "juices", subcategory: "juices", price: 230, image: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&h=400&fit=crop", description: "Fresh mango juice with lime and mint for a tropical twist." },
  { id: 53, name: "Summer Blossom", category: "juices", subcategory: "juices", price: 200, image: "https://images.unsplash.com/photo-1546173159-315724a31696?w=400&h=400&fit=crop", description: "Light and refreshing summer fruit blend." },
  { id: 54, name: "Kokum Chilli Fizz", category: "juices", subcategory: "juices", price: 210, image: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=400&fit=crop", description: "Spicy kokum drink with chilli and fizzy water." },
  { id: 55, name: "Strawberry Spritzer", category: "juices", subcategory: "juices", price: 230, image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop", description: "Sparkling strawberry drink with fresh fruit and herbs." },

  // DRINKS - MOCKTAILS  
  { id: 56, name: "Peach Ice Tea", category: "mocktails", subcategory: "mocktails", price: 200, image: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=400&fit=crop", description: "Refreshing iced tea with sweet peach flavor." },
  { id: 57, name: "Tamarind Ginger", category: "mocktails", subcategory: "mocktails", price: 210, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop", description: "Tangy tamarind drink with fresh ginger kick." },
  { id: 58, name: "Pinacolada", category: "mocktails", subcategory: "mocktails", price: 250, image: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=400&fit=crop", description: "Tropical pineapple and coconut cream mocktail." },
  { id: 59, name: "Mojito", category: "mocktails", subcategory: "mocktails", price: 180, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop", description: "Classic virgin mojito with fresh mint and lime." },
  { id: 60, name: "Kombucha from Tap", category: "mocktails", subcategory: "mocktails", price: 230, image: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=400&fit=crop", description: "Fresh kombucha on tap with probiotics and fizz." },
  { id: 61, name: "Orange Jalapeno Mint", category: "mocktails", subcategory: "mocktails", price: 230, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop", description: "Spicy orange drink with jalapeno and fresh mint." },
  { id: 62, name: "Watermelon Mint Fizz", category: "mocktails", subcategory: "mocktails", price: 210, image: "https://images.unsplash.com/photo-1571091655789-405eb7a3a3a8?w=400&h=400&fit=crop", description: "Refreshing watermelon drink with mint and sparkling water." },
  { id: 63, name: "Virgin Mojito", category: "mocktails", subcategory: "mocktails", price: 210, image: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&h=400&fit=crop", description: "Non-alcoholic mojito with lime, mint, and soda." },

  // DRINKS - FLORAL TEAS
  { id: 64, name: "Rose Tea", category: "floral-teas", subcategory: "floral-teas", price: 160, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop", description: "Delicate rose petal tea with floral aroma and calming properties." },
  { id: 65, name: "Jasmine Green Tea", category: "floral-teas", subcategory: "floral-teas", price: 120, image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop", description: "Aromatic jasmine-scented green tea with antioxidants." },
  { id: 66, name: "Lavender Chamomile Tea", category: "floral-teas", subcategory: "floral-teas", price: 140, image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop", description: "Relaxing blend of lavender and chamomile for peaceful moments." },

  // DRINKS - CHAI
  { id: 67, name: "Maharani Chai", category: "chai", subcategory: "chai", price: 100, image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=400&h=400&fit=crop", description: "Premium spiced tea blend fit for royalty with traditional Indian spices." },

  // DRINKS - COFFEE
  { id: 68, name: "Iced Americano with Orange & Cinnamon", category: "coffee", subcategory: "coffee", price: 175, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Cold brew americano with orange zest and cinnamon spice." },
  { id: 69, name: "Frappe", category: "coffee", subcategory: "coffee", price: 290, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Iced coffee frappe blended with ice and cream." },
  { id: 70, name: "Caramel Iced Latte", category: "coffee", subcategory: "coffee", price: 180, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Smooth iced latte with rich caramel syrup." },
  { id: 71, name: "Iced Vanilla Latte", category: "coffee", subcategory: "coffee", price: 180, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Creamy iced latte with vanilla bean flavor." },
  { id: 72, name: "Vegan Iced Latte", category: "coffee", subcategory: "coffee", price: 240, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Plant-based iced latte with oat or almond milk." },
  { id: 73, name: "Espresso", category: "coffee", subcategory: "coffee", price: 70, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop", description: "Classic single shot espresso with rich crema." },
  { id: 74, name: "Doppio", category: "coffee", subcategory: "coffee", price: 130, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=400&fit=crop", description: "Double shot espresso for an extra caffeine boost." },
  { id: 75, name: "Latte", category: "coffee", subcategory: "coffee", price: 150, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Smooth espresso with steamed milk and foam art." },
  { id: 76, name: "Cappuccino", category: "coffee", subcategory: "coffee", price: 150, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Classic cappuccino with equal parts espresso, steamed milk, and foam." },
  { id: 77, name: "Cortado", category: "coffee", subcategory: "coffee", price: 120, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Spanish-style coffee with equal parts espresso and warm milk." },
  { id: 78, name: "Mochaccino", category: "coffee", subcategory: "coffee", price: 240, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Chocolate and espresso blend with steamed milk and whipped cream." },
  { id: 79, name: "Hot Chocolate", category: "coffee", subcategory: "coffee", price: 280, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop", description: "Rich and creamy hot chocolate with marshmallows." }
];