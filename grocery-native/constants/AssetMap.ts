/**
 * Static asset mapping for product images.
 * Necessary for React Native's static image requirement.
 */

export const PRODUCT_IMAGES: { [key: string]: any } = {
    'Apple': require('../assets/products/apple.webp'),
    'Beef Steak': require('../assets/products/beef-steak.webp'),
    'Cat Food': require('../assets/products/cat-food.webp'),
    'Chicken Meat': require('../assets/products/chicken-meat.webp'),
    'Cooking Oil': require('../assets/products/cooking-oil.webp'),
    'Cucumber': require('../assets/products/cucumber.webp'),
    'Dog Food': require('../assets/products/dog-food.webp'),
    'Eggs': require('../assets/products/eggs.webp'),
    'Fish Steak': require('../assets/products/fish-steak.webp'),
    'Green Bell Pepper': require('../assets/products/green-bell-pepper.webp'),
    'Green Chili Pepper': require('../assets/products/green-chili-pepper.webp'),
    'Honey Jar': require('../assets/products/honey-jar.webp'),
    'Ice Cream': require('../assets/products/ice-cream.webp'),
    'Juice': require('../assets/products/juice.webp'),
    'Kiwi': require('../assets/products/kiwi.webp'),
    'Lemon': require('../assets/products/lemon.webp'),
    'Milk': require('../assets/products/milk.webp'),
    'Mulberry': require('../assets/products/mulberry.webp'),
    'Nescafe Coffee': require('../assets/products/nescafe-coffee.webp'),
    'Potatoes': require('../assets/products/potatoes.webp'),
    'Protein Powder': require('../assets/products/protein-powder.webp'),
    'Red Onions': require('../assets/products/red-onions.webp'),
    'Rice': require('../assets/products/rice.webp'),
    'Soft Drinks': require('../assets/products/soft-drinks.webp'),
    'Strawberry': require('../assets/products/strawberry.webp'),
    'Tissue Paper Box': require('../assets/products/tissue-paper-box.webp'),
    'Water': require('../assets/products/water.webp'),
};

export const getProductImage = (name: string) => {
    // Normalize name to match keys
    const key = Object.keys(PRODUCT_IMAGES).find(k =>
        name.toLowerCase().includes(k.toLowerCase()) ||
        k.toLowerCase().includes(name.toLowerCase())
    );
    return key ? PRODUCT_IMAGES[key] : null;
};
