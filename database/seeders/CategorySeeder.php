<?php

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $categories = [
            'TOAST',
            'ALL DAY BREAKFAST',
            'SMOOTHIE BOWLS',
            'EARTH GRILLS/CRISPS',
            'SALADS',
            'PLATTERS',
            'EARTH BOWLS',
            'NOODLE BOWLS',
            'PASTA/PIZZA',
            'DESSERTS'
        ];

        foreach ($categories as $category) {
            Category::create(['name' => $category]);
        }
    }
}
