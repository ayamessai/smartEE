import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eco_electro';

// Sample users for each role
const sampleUsers = [
  // Sellers
  {
    name: 'Ahmed Benali',
    email: 'ahmed.seller@example.com',
    password: 'password123',
    role: 'seller',
    profile: {
      bio: 'Vendeur professionnel d\'appareils électroménagers avec plus de 10 ans d\'expérience',
      experienceYears: 10,
      wilaya: 'Alger',
      phone: '+213 123 456 789'
    }
  },
  {
    name: 'Fatima Zerrouki',
    email: 'fatima.seller@example.com',
    password: 'password123',
    role: 'seller',
    profile: {
      bio: 'Spécialiste en réfrigérateurs et machines à laver de haute qualité',
      experienceYears: 7,
      wilaya: 'Oran',
      phone: '+213 987 654 321'
    }
  },
  
  // Buyers
  {
    name: 'Karim Boudiaf',
    email: 'karim.buyer@example.com',
    password: 'password123',
    role: 'buyer',
    profile: {
      bio: 'Acheteur à la recherche d\'appareils économiques et efficaces',
      experienceYears: 0,
      wilaya: 'Constantine',
      phone: '+213 555 123 456'
    }
  },
  {
    name: 'Amina Messaoudi',
    email: 'amina.buyer@example.com',
    password: 'password123',
    role: 'buyer',
    profile: {
      bio: 'Mère de famille cherchant des appareils durables pour la maison',
      experienceYears: 0,
      wilaya: 'Annaba',
      phone: '+213 777 888 999'
    }
  },
  
  // Repairmen
  {
    name: 'Mohammed Tadjer',
    email: 'mohammed.repair@example.com',
    password: 'password123',
    role: 'repairman',
    profile: {
      bio: 'Technicien réparateur certifié avec 15 ans d\'expérience en électroménager',
      experienceYears: 15,
      wilaya: 'Alger',
      phone: '+213 111 222 333'
    }
  },
  {
    name: 'Hassan Bouazza',
    email: 'hassan.repair@example.com',
    password: 'password123',
    role: 'repairman',
    profile: {
      bio: 'Expert en réparation de réfrigérateurs et machines à laver toutes marques',
      experienceYears: 12,
      wilaya: 'Oran',
      phone: '+213 444 555 666'
    }
  }
];

// Sample products linked to sellers
const sampleProducts = [
  // Products for Ahmed Benali (Seller 1)
  {
    title: 'BEKO RDSE450K20S - Réfrigérateur 2 Portes',
    brand: 'BEKO',
    model: 'RDSE450K20S',
    reference: 'RDSE450K20S',
    category: 'refrigerator',
    condition: 'new',
    priceDzd: 80000,
    type: '2 Portes',
    sellerId: null, // Will be set dynamically
    appearance: { color: 'gris' },
    dimensions: {
      width_cm: 70,
      height_cm: 175,
      depth_cm: 67.5,
      weight_kg: 48
    },
    capacity: {
      total_l: 400,
      refrigerator_l: 298,
      freezer_l: 102,
      freezing_capacity_kg_24h: 5.5,
      freezer_autonomy_h: null
    },
    energy: {
      class: 'A',
      consumption_kwh_an: 1.054,
      climate_class: 'SN-T',
      noise_level_db: 41
    },
    technical: {
      refrigerant: null,
      cooling_technology: 'Froid Statique',
      inverter: false,
      auto_defrost: true,
      fast_freezing: true
    },
    features: {
      special_technologies: [],
      door_count: 2,
      freezer_position: 'Haut',
      refrigerator_drawers: 1,
      refrigerator_shelves: 4,
      freezer_drawers: 0,
      freezer_shelves: 2,
      included_accessories: ['Un support à Oeufs']
    }
  },
  {
    title: 'BEKO B5DFT810542MG - Machine à Laver 10.5kg',
    brand: 'BEKO',
    model: 'B5DFT810542MG',
    reference: 'B5DFT810542MG',
    category: 'washing_machine',
    condition: 'new',
    priceDzd: 85000,
    type: 'Frontal',
    sellerId: null, // Will be set dynamically
    appearance: { color: 'Gris' },
    features: {
      installation_type: 'Pose Libre',
      program_count: 15,
      dryer: true,
      pre_wash: true,
      spin: true,
      rinse: true,
      adjustable_thermostat: false,
      digital_display: true,
      child_lock: true,
      special_programs: []
    },
    technical: {
      motor_type: 'Inverter',
      washing_type: 'Automatique',
      spin_speed: 1400
    },
    capacity: { total_l: 10.5 },
    energy: {
      class: 'A',
      consumption_kwh_an: 1360,
      water_per_cycle: null
    },
    dimensions: {
      width_cm: 60,
      height_cm: 84.5,
      depth_cm: 60,
      weight_kg: 76.3
    }
  },
  
  // Products for Fatima Zerrouki (Seller 2)
  {
    title: 'LG GN-F71HLHU - Réfrigérateur 2 Portes',
    brand: 'LG',
    model: 'GN-F71HLHU',
    reference: 'GN-F71HLHU',
    category: 'refrigerator',
    condition: 'new',
    priceDzd: 185000,
    type: '2 Portes',
    sellerId: null, // Will be set dynamically
    appearance: { color: 'silver' },
    dimensions: {
      width_cm: null,
      height_cm: null,
      depth_cm: null,
      weight_kg: null
    },
    capacity: {
      total_l: 490,
      refrigerator_l: null,
      freezer_l: null,
      freezing_capacity_kg_24h: null,
      freezer_autonomy_h: null
    },
    energy: {
      class: 'A+',
      consumption_kwh_an: null,
      climate_class: null,
      noise_level_db: null
    },
    technical: {
      refrigerant: null,
      cooling_technology: 'Total No Frost',
      inverter: true,
      auto_defrost: null,
      fast_freezing: null
    },
    features: {
      special_technologies: ['DoorCooling+', 'LINEARCooling', 'HygieneFresh+'],
      door_count: 2,
      freezer_position: null,
      refrigerator_drawers: null,
      refrigerator_shelves: null,
      freezer_drawers: null,
      freezer_shelves: null,
      included_accessories: []
    }
  },
  {
    title: 'Brandt BD4410NS - Réfrigérateur Compact',
    brand: 'Brandt',
    model: 'BD4410NS',
    reference: 'BD4410NS',
    category: 'refrigerator',
    condition: 'new',
    priceDzd: 64860,
    type: '2 Portes',
    sellerId: null, // Will be set dynamically
    appearance: { color: 'blanc' },
    dimensions: {
      width_cm: null,
      height_cm: null,
      depth_cm: null,
      weight_kg: null
    },
    capacity: {
      total_l: 339,
      refrigerator_l: null,
      freezer_l: null,
      freezing_capacity_kg_24h: null,
      freezer_autonomy_h: null
    },
    energy: {
      class: 'A+',
      consumption_kwh_an: null,
      climate_class: null,
      noise_level_db: null
    },
    technical: {
      refrigerant: null,
      cooling_technology: 'No Frost',
      inverter: null,
      auto_defrost: null,
      fast_freezing: null
    },
    features: {
      special_technologies: ['Multiflow', 'Turbo Air', 'fonction Vacances', 'éclairage LED'],
      door_count: 2,
      freezer_position: null,
      refrigerator_drawers: null,
      refrigerator_shelves: null,
      freezer_drawers: null,
      freezer_shelves: null,
      included_accessories: []
    }
  }
];

async function seedCompleteSystem() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing users and products');

    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        profile: userData.profile
      });
      createdUsers.push(user);
      console.log(`👤 Created ${userData.role}: ${userData.name} (${userData.email})`);
    }

    // Get seller users
    const sellers = createdUsers.filter(user => user.role === 'seller');
    console.log(`\n📦 Found ${sellers.length} sellers`);

    // Create products and link them to sellers
    const allProducts = [];
    for (let i = 0; i < sampleProducts.length; i++) {
      const product = { ...sampleProducts[i] };
      // Distribute products between sellers
      const sellerIndex = i % sellers.length;
      product.sellerId = sellers[sellerIndex]._id;
      allProducts.push(product);
    }

    // Insert products
    const products = await Product.insertMany(allProducts);
    console.log(`\n✅ Successfully created ${products.length} products!`);

    // Summary by category
    const summary = {};
    products.forEach(product => {
      if (!summary[product.category]) {
        summary[product.category] = 0;
      }
      summary[product.category]++;
    });

    console.log('\n📊 Product Summary:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

    // Show seller-product relationships
    console.log('\n🔗 Seller-Product Relationships:');
    for (const seller of sellers) {
      const sellerProducts = products.filter(p => p.sellerId.toString() === seller._id.toString());
      console.log(`  ${seller.name}: ${sellerProducts.length} products`);
      sellerProducts.forEach(product => {
        console.log(`    - ${product.title} (${product.priceDzd} DZD)`);
      });
    }

    // Show login credentials
    console.log('\n🔑 Login Credentials:');
    createdUsers.forEach(user => {
      console.log(`  ${user.role.toUpperCase()}: ${user.email} / password123`);
    });

    console.log('\n🎉 Complete system seeded successfully!');
    console.log('\n💡 You can now:');
    console.log('  1. Login with any user account');
    console.log('  2. Browse products as a buyer');
    console.log('  3. Manage products as a seller');
    console.log('  4. Offer repair services as a repairman');

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding system:', error);
    process.exit(1);
  }
}

seedCompleteSystem();







