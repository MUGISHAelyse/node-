// Starting product data (acts as a fake database). Each product has a unique `id`
// that is used in the dynamic route /products/:productId.
// The live list is kept by context/ProductsContext.jsx, which starts from these
// products and then lets the admin add, edit and delete them.

// The category names, in the order they are shown. New categories made by the admin are added after these.
export const seedCategories = ['Electronics', 'Fashion', 'Clothes', 'Books', 'Sports']

// One object per product: id (used in the URL), name, emoji picture, price in dollars, category, rating, stock and description.
export const seedProducts = [
  { id: '1', name: 'Wireless Headphones', emoji: '🎧', price: 89, category: 'Electronics', rating: 4.6, stock: 25, description: 'Noise-cancelling over-ear headphones with a 30-hour battery and fast charging.' },
  { id: '2', name: 'Smartwatch', emoji: '⌚', price: 149, category: 'Electronics', rating: 4.4, stock: 18, description: 'Tracks sleep, steps and heart rate. Water resistant with a bright always-on display.' },
  { id: '3', name: 'Laptop', emoji: '💻', price: 899, category: 'Electronics', rating: 4.7, stock: 8, description: 'Fast and light 14-inch laptop for work and study, with all-day battery life.' },
  { id: '4', name: 'Camera', emoji: '📷', price: 449, category: 'Electronics', rating: 4.5, stock: 6, description: '24MP mirrorless camera with a kit lens, 4K video and Wi-Fi sharing.' },
  { id: '5', name: 'Running Sneakers', emoji: '👟', price: 79, category: 'Fashion', rating: 4.3, stock: 40, description: 'Cushioned, breathable sneakers made for daily runs and long walks.' },
  { id: '6', name: 'Backpack', emoji: '🎒', price: 55, category: 'Fashion', rating: 4.5, stock: 30, description: 'Water-resistant backpack with a padded laptop sleeve and many pockets.' },
  { id: '7', name: 'Sunglasses', emoji: '🕶️', price: 35, category: 'Fashion', rating: 4.1, stock: 50, description: 'Lightweight frame with UV400 protection for sunny days.' },
  { id: '8', name: 'Classic Jeans', emoji: '👖', price: 45, category: 'Clothes', rating: 4.2, stock: 35, description: 'Straight-fit denim that is comfortable all day and easy to style.' },
  { id: '9', name: 'Summer Dress', emoji: '👗', price: 49, category: 'Clothes', rating: 4.6, stock: 22, description: 'Light floral dress made from soft, breathable fabric.' },
  { id: '10', name: 'Winter Coat', emoji: '🧥', price: 99, category: 'Clothes', rating: 4.8, stock: 14, description: 'Warm padded coat with a water-resistant shell and a snug hood.' },
  { id: '11', name: 'Paperback Books', emoji: '📚', price: 12, category: 'Books', rating: 4.7, stock: 60, description: 'A bundle of three bestselling novels to keep you reading all month.' },
  { id: '12', name: 'Football', emoji: '⚽', price: 25, category: 'Sports', rating: 4.4, stock: 45, description: 'Size 5 match ball with durable stitching, good for grass and turf.' },
  { id: '13', name: 'Acoustic Guitar', emoji: '🎸', price: 199, category: 'Sports', rating: 4.5, stock: 9, description: 'Spruce-top acoustic guitar with a warm tone, great for beginners.' },
]

