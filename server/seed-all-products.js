import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eco_electro';

// Your refrigerator data
const refrigerators = [
  {
    title: 'BEKO RDSE450K20S',
    brand: 'BEKO',
    model: 'RDSE450K20S',
    reference: 'RDSE450K20S',
    category: 'refrigerator',
    condition: 'new',
    priceDzd: 80000,
    type: '2 Portes',
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
    title: 'BEKO RCNE620E40DSX',
    brand: 'BEKO',
    model: 'RCNE620E40DSX',
    reference: 'RCNE620E40DSX',
    category: 'refrigerator',
    condition: 'new',
    priceDzd: 158000,
    type: 'Combiné',
    appearance: { color: 'silver' },
    dimensions: {
      width_cm: 70,
      height_cm: 192,
      depth_cm: 74.5,
      weight_kg: 76.5
    },
    capacity: {
      total_l: 497,
      refrigerator_l: 352,
      freezer_l: 145,
      freezing_capacity_kg_24h: 6.5,
      freezer_autonomy_h: null
    },
    energy: {
      class: 'A++',
      consumption_kwh_an: 342,
      climate_class: 'SN-T',
      noise_level_db: 40
    },
    technical: {
      refrigerant: 'R600a',
      cooling_technology: 'No Frost',
      inverter: true,
      auto_defrost: true,
      fast_freezing: true
    },
    features: {
      special_technologies: ['ProSmart Inverter', 'LED Illumination', 'SlimTank'],
      door_count: 2,
      freezer_position: 'Bas',
      refrigerator_drawers: 2,
      refrigerator_shelves: 3,
      freezer_drawers: 3,
      freezer_shelves: null,
      included_accessories: []
    }
  }
];

// Your washing machine data
const washingMachines = [
  {
    title: 'BEKO B5DFT810542MG',
    brand: 'BEKO',
    model: 'B5DFT810542MG',
    reference: 'B5DFT810542MG',
    category: 'washing_machine',
    condition: 'new',
    priceDzd: 85000,
    type: 'Frontal',
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
  {
    title: 'BEKO B3WFT51242MG',
    brand: 'BEKO',
    model: 'B3WFT51242MG',
    reference: 'B3WFT51242MG',
    category: 'washing_machine',
    condition: 'new',
    priceDzd: 78000,
    type: 'Frontal',
    appearance: { color: 'Manhattan grey' },
    features: {
      installation_type: 'Pose Libre',
      program_count: 15,
      dryer: false,
      pre_wash: true,
      spin: true,
      rinse: true,
      adjustable_thermostat: null,
      digital_display: true,
      child_lock: true,
      special_programs: [
        'Coton', 'Coton Eco', 'Synthétique', 'Express 14\'', 'Laine/Lavage à la main',
        'DarkWash/Jeans', 'Programmes téléchargeables', 'Essorage + Vidange',
        'Rinçage', 'Outdoor / Sport', 'Expert Taches', 'Hygiène+',
        'Couette / Doudoune', 'Chemises', 'SteamCure'
      ]
    },
    technical: {
      motor_type: 'Inverter',
      washing_type: 'Automatique',
      spin_speed: 1400
    },
    capacity: { total_l: 12 },
    energy: {
      class: 'A+++',
      consumption_kwh_an: 252,
      water_per_cycle: 13045
    },
    dimensions: {
      width_cm: 60,
      height_cm: 84.5,
      depth_cm: 63,
      weight_kg: 78
    }
  }
];

// Add more categories as needed
const dishwashers = [];
const ovens = [];
const microwaves = [];

async function seedAllProducts() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Import all categories
    const allProducts = [
      ...refrigerators,
      ...washingMachines,
      ...dishwashers,
      ...ovens,
      ...microwaves
    ];

    // Insert all products
    const products = await Product.insertMany(allProducts);
    console.log(`Inserted ${products.length} products total`);

    // Summary by category
    const summary = {};
    products.forEach(product => {
      if (!summary[product.category]) {
        summary[product.category] = 0;
      }
      summary[product.category]++;
    });

    console.log('\n📊 Import Summary:');
    Object.entries(summary).forEach(([category, count]) => {
      console.log(`  ${category}: ${count} products`);
    });

    console.log('\n✅ Database populated successfully!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
}

seedAllProducts();


