import { 
  Coffee, 
  Sandwich, 
  Pizza, 
  Apple, 
  Salad, 
  Soup, 
  Fish, 
  Beef, 
  Egg, 
  Cookie,
  IceCream,
  Cake,
  Cherry,
  Banana,
  Carrot,
  Milk
} from 'lucide-react';

export const MEAL_ICONS = {
  // Breakfast
  coffee: Coffee,
  egg: Egg,
  milk: Milk,
  
  // Lunch/Dinner
  sandwich: Sandwich,
  pizza: Pizza,
  salad: Salad,
  soup: Soup,
  fish: Fish,
  beef: Beef,
  
  // Snacks/Fruits
  apple: Apple,
  banana: Banana,
  cherry: Cherry,
  carrot: Carrot,
  cookie: Cookie,
  icecream: IceCream,
  cake: Cake,
};

export const MEAL_ICON_OPTIONS = [
  { value: 'apple', label: 'Apple', category: 'fruit' },
  { value: 'banana', label: 'Banana', category: 'fruit' },
  { value: 'cherry', label: 'Cherry', category: 'fruit' },
  { value: 'carrot', label: 'Carrot', category: 'vegetable' },
  { value: 'salad', label: 'Salad', category: 'meal' },
  { value: 'sandwich', label: 'Sandwich', category: 'meal' },
  { value: 'pizza', label: 'Pizza', category: 'meal' },
  { value: 'soup', label: 'Soup', category: 'meal' },
  { value: 'fish', label: 'Fish', category: 'protein' },
  { value: 'beef', label: 'Beef', category: 'protein' },
  { value: 'egg', label: 'Egg', category: 'protein' },
  { value: 'coffee', label: 'Coffee', category: 'beverage' },
  { value: 'milk', label: 'Milk', category: 'beverage' },
  { value: 'cookie', label: 'Cookie', category: 'dessert' },
  { value: 'icecream', label: 'Ice Cream', category: 'dessert' },
  { value: 'cake', label: 'Cake', category: 'dessert' },
];

export function getMealIcon(iconName: string) {
  return MEAL_ICONS[iconName as keyof typeof MEAL_ICONS] || Apple;
}