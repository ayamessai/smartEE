import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eco_electro';

const sampleWashingMachines = [
  {
    title: 'BEKO B5DFT810542MG',
    brand: 'BEKO',
    model: 'B5DFT810542MG',
    reference: 'B5DFT810542MG',
    category: 'washing_machine',
    condition: 'new',
    priceDzd: 85000,
    type: 'Frontal',
    appearance: {
      color: 'Gris'
    },
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
    capacity: {
      total_l: 10.5
    },
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
    },
    sellerId: null // Will be set when creating
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
    appearance: {
      color: 'Manhattan grey'
    },
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
    capacity: {
      total_l: 12
    },
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
    },
    sellerId: null // Will be set when creating
  }
];

async function seedWashingMachines() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing washing machines
    await Product.deleteMany({ category: 'washing_machine' });
    console.log('Cleared existing washing machines');

    // Insert sample data
    const products = await Product.insertMany(sampleWashingMachines);
    console.log(`Inserted ${products.length} washing machines`);

    console.log('Sample washing machines:');
    products.forEach(product => {
      console.log(`- ${product.brand} ${product.model}: ${product.priceDzd} DZD`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding washing machines:', error);
    process.exit(1);
  }
}

seedWashingMachines();


