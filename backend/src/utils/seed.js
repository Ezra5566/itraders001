require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Category, Product } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/itraders_store';

// Seed data
const categories = [
  {
    name: 'iPhone',
    description: 'Apple iPhones - Latest models and accessories',
    icon: 'Smartphone',
    order: 1,
  },
  {
    name: 'MacBook',
    description: 'Apple MacBooks - Pro, Air, and accessories',
    icon: 'Laptop',
    order: 2,
  },
  {
    name: 'iPad',
    description: 'Apple iPads - All models available',
    icon: 'Tablet',
    order: 3,
  },
  {
    name: 'Apple Watch',
    description: 'Apple Watch - Series and accessories',
    icon: 'Watch',
    order: 4,
  },
  {
    name: 'AirPods',
    description: 'Apple AirPods - All generations',
    icon: 'Headphones',
    order: 5,
  },
  {
    name: 'Samsung Phones',
    description: 'Samsung Galaxy smartphones',
    icon: 'Smartphone',
    order: 6,
  },
  {
    name: 'Samsung Tablets',
    description: 'Samsung Galaxy tablets',
    icon: 'Tablet',
    order: 7,
  },
  {
    name: 'Accessories',
    description: 'Cases, chargers, cables, and more',
    icon: 'Package',
    order: 8,
  },
];

const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'The most advanced iPhone ever with A17 Pro chip, titanium design, and 48MP camera system.',
    shortDescription: 'Titanium design, A17 Pro chip, 48MP camera',
    brand: 'Apple',
    price: 184999,
    comparePrice: 199999,
    sku: 'IPH15PM-256',
    inventory: 50,
    tags: ['iphone', 'smartphone', 'flagship'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Display', value: '6.7" Super Retina XDR' },
      { name: 'Chip', value: 'A17 Pro' },
      { name: 'Storage', value: '256GB' },
      { name: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto' },
      { name: 'Battery', value: 'Up to 29 hours video playback' },
    ],
    features: [
      { title: 'Titanium Design', description: 'Aerospace-grade titanium design' },
      { title: 'Action Button', description: 'Customizable quick action button' },
      { title: 'USB-C', description: 'USB-C connector for fast charging' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
  {
    name: 'iPhone 15 Pro',
    description: 'The first iPhone to feature an aerospace-grade titanium design.',
    shortDescription: 'Titanium design, A17 Pro chip',
    brand: 'Apple',
    price: 154999,
    comparePrice: 169999,
    sku: 'IPH15P-256',
    inventory: 45,
    tags: ['iphone', 'smartphone', 'flagship'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Display', value: '6.1" Super Retina XDR' },
      { name: 'Chip', value: 'A17 Pro' },
      { name: 'Storage', value: '256GB' },
      { name: 'Camera', value: '48MP Main + 12MP Ultra Wide + 12MP Telephoto' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
  {
    name: 'iPhone 15',
    description: 'Dynamic Island, 48MP Main camera, and USB-C.',
    shortDescription: 'Dynamic Island, 48MP camera',
    brand: 'Apple',
    price: 124999,
    comparePrice: 134999,
    sku: 'IPH15-128',
    inventory: 60,
    tags: ['iphone', 'smartphone'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Display', value: '6.1" Super Retina XDR' },
      { name: 'Chip', value: 'A16 Bionic' },
      { name: 'Storage', value: '128GB' },
      { name: 'Camera', value: '48MP Main + 12MP Ultra Wide' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
  {
    name: 'MacBook Pro 14" M3',
    description: 'Mind-blowing performance with the M3 chip.',
    shortDescription: 'M3 chip, 14.2" Liquid Retina XDR',
    brand: 'Apple',
    price: 289999,
    comparePrice: 309999,
    sku: 'MBP14-M3-512',
    inventory: 25,
    tags: ['macbook', 'laptop', 'pro'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Display', value: '14.2" Liquid Retina XDR' },
      { name: 'Chip', value: 'Apple M3' },
      { name: 'Memory', value: '18GB Unified Memory' },
      { name: 'Storage', value: '512GB SSD' },
      { name: 'Battery', value: 'Up to 22 hours' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
  {
    name: 'MacBook Air 15" M2',
    description: 'Impressively big. Impossibly thin.',
    shortDescription: 'M2 chip, 15.3" Liquid Retina',
    brand: 'Apple',
    price: 219999,
    comparePrice: 234999,
    sku: 'MBA15-M2-256',
    inventory: 30,
    tags: ['macbook', 'laptop', 'air'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Display', value: '15.3" Liquid Retina' },
      { name: 'Chip', value: 'Apple M2' },
      { name: 'Memory', value: '8GB Unified Memory' },
      { name: 'Storage', value: '256GB SSD' },
      { name: 'Battery', value: 'Up to 18 hours' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
  {
    name: 'iPad Pro 12.9" M2',
    description: 'The ultimate iPad experience with M2 chip.',
    shortDescription: 'M2 chip, 12.9" Liquid Retina XDR',
    brand: 'Apple',
    price: 159999,
    comparePrice: 174999,
    sku: 'IPADPRO12-M2-256',
    inventory: 20,
    tags: ['ipad', 'tablet', 'pro'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Display', value: '12.9" Liquid Retina XDR' },
      { name: 'Chip', value: 'Apple M2' },
      { name: 'Storage', value: '256GB' },
      { name: 'Camera', value: '12MP Wide + 10MP Ultra Wide' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
  {
    name: 'Apple Watch Series 9',
    description: 'Smarter. Brighter. Mightier.',
    shortDescription: 'S9 SiP, Advanced health features',
    brand: 'Apple',
    price: 54999,
    comparePrice: 59999,
    sku: 'AWS9-45MM',
    inventory: 40,
    tags: ['watch', 'wearable'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Display', value: '45mm Always-On Retina' },
      { name: 'Chip', value: 'S9 SiP' },
      { name: 'Health', value: 'Blood Oxygen, ECG, Temperature' },
      { name: 'Connectivity', value: 'GPS + Cellular' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
  {
    name: 'AirPods Pro 2nd Gen',
    description: 'Rebuilt from the sound up.',
    shortDescription: 'Active Noise Cancellation, Adaptive Audio',
    brand: 'Apple',
    price: 32999,
    comparePrice: 36999,
    sku: 'APP-2NDGEN',
    inventory: 80,
    tags: ['airpods', 'audio'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Chip', value: 'H2' },
      { name: 'Noise Cancellation', value: 'Active Noise Cancellation' },
      { name: 'Battery', value: 'Up to 6 hours listening time' },
      { name: 'Connectivity', value: 'Bluetooth 5.3' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'The new era of mobile AI is here.',
    shortDescription: 'Galaxy AI, 200MP camera, S Pen',
    brand: 'Samsung',
    price: 174999,
    comparePrice: 189999,
    sku: 'SGS24U-256',
    inventory: 35,
    tags: ['samsung', 'smartphone', 'android'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Display', value: '6.8" QHD+ Dynamic AMOLED 2X' },
      { name: 'Processor', value: 'Snapdragon 8 Gen 3' },
      { name: 'Storage', value: '256GB' },
      { name: 'Camera', value: '200MP Wide + 50MP Telephoto + 10MP Telephoto + 12MP Ultra Wide' },
      { name: 'Battery', value: '5000mAh' },
    ],
    warranty: { duration: 12, description: 'Samsung Warranty' },
  },
  {
    name: 'Samsung Galaxy Z Fold5',
    description: 'The most powerful Galaxy Z Fold yet.',
    shortDescription: 'Foldable, multitasking powerhouse',
    brand: 'Samsung',
    price: 264999,
    comparePrice: 284999,
    sku: 'SGZF5-256',
    inventory: 15,
    tags: ['samsung', 'smartphone', 'foldable'],
    isFeatured: true,
    status: 'active',
    specifications: [
      { name: 'Cover Display', value: '6.2" HD+ Dynamic AMOLED 2X' },
      { name: 'Main Display', value: '7.6" QXGA+ Dynamic AMOLED 2X' },
      { name: 'Processor', value: 'Snapdragon 8 Gen 2' },
      { name: 'Storage', value: '256GB' },
    ],
    warranty: { duration: 12, description: 'Samsung Warranty' },
  },
  {
    name: 'Samsung Galaxy Tab S9 Ultra',
    description: 'Ultra-large screen. Ultra-powerful.',
    shortDescription: '14.6" display, S Pen included',
    brand: 'Samsung',
    price: 149999,
    comparePrice: 164999,
    sku: 'SGTS9U-256',
    inventory: 20,
    tags: ['samsung', 'tablet', 'android'],
    isFeatured: false,
    status: 'active',
    specifications: [
      { name: 'Display', value: '14.6" Dynamic AMOLED 2X' },
      { name: 'Processor', value: 'Snapdragon 8 Gen 2' },
      { name: 'Storage', value: '256GB' },
      { name: 'S Pen', value: 'Included' },
    ],
    warranty: { duration: 12, description: 'Samsung Warranty' },
  },
  {
    name: 'Apple 20W USB-C Power Adapter',
    description: 'Fast charging for your Apple devices.',
    shortDescription: '20W fast charging',
    brand: 'Apple',
    price: 2999,
    sku: 'AP-20W-ADAPTER',
    inventory: 200,
    tags: ['accessories', 'charger'],
    isFeatured: false,
    status: 'active',
    specifications: [
      { name: 'Power', value: '20W' },
      { name: 'Connector', value: 'USB-C' },
    ],
    warranty: { duration: 12, description: 'Apple Limited Warranty' },
  },
];

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Category.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing categories and products');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@itraders.store' });
    if (!adminExists) {
      await User.create({
        email: 'admin@itraders.store',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'superadmin',
      });
      console.log('Created admin user: admin@itraders.store / admin123');
    }

    // Create categories
    const createdCategories = await Category.insertMany(categories);
    console.log(`Created ${createdCategories.length} categories`);

    // Create a map of category names to IDs
    const categoryMap = {};
    createdCategories.forEach(cat => {
      categoryMap[cat.name] = cat._id;
    });

    // Assign categories to products
    const productsWithCategories = products.map(product => {
      let categoryId;
      if (product.name.includes('iPhone')) categoryId = categoryMap['iPhone'];
      else if (product.name.includes('MacBook')) categoryId = categoryMap['MacBook'];
      else if (product.name.includes('iPad')) categoryId = categoryMap['iPad'];
      else if (product.name.includes('Watch')) categoryId = categoryMap['Apple Watch'];
      else if (product.name.includes('AirPods')) categoryId = categoryMap['AirPods'];
      else if (product.brand === 'Samsung' && product.tags.includes('smartphone')) categoryId = categoryMap['Samsung Phones'];
      else if (product.brand === 'Samsung' && product.tags.includes('tablet')) categoryId = categoryMap['Samsung Tablets'];
      else categoryId = categoryMap['Accessories'];

      return {
        ...product,
        category: categoryId,
      };
    });

    // Create products
    const createdProducts = await Product.insertMany(productsWithCategories);
    console.log(`Created ${createdProducts.length} products`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nAdmin Login:');
    console.log('Email: admin@itraders.store');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
