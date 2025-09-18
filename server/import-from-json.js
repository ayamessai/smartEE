import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Product from './src/models/Product.js';
import User from './src/models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/eco_electro';

// Function to transform your JSON data to our database format
function transformRefrigeratorData(item, sellerId) {
  return {
    title: `${item.marque} ${item.modele}`,
    brand: item.marque,
    model: item.modele,
    reference: item.reference,
    category: 'refrigerator',
    condition: 'new',
    priceDzd: item.prix_indicatif_da,
    type: item.type,
    sellerId: sellerId, // Link to seller
    appearance: {
      color: item.couleur,
      finish_material: item.materiau_finition,
      interior_lighting: item.eclairage_interieur
    },
    dimensions: {
      width_cm: item.largeur_cm,
      height_cm: item.hauteur_cm,
      depth_cm: item.profondeur_cm,
      weight_kg: item.poids_kg
    },
    capacity: {
      total_l: item.capacite_totale_l,
      refrigerator_l: item.capacite_refrigerateur_l,
      freezer_l: item.capacite_congelateur_l,
      freezing_capacity_kg_24h: item.capacite_congelation_kg_24h,
      freezer_autonomy_h: item.autonomie_congelateur_h
    },
    energy: {
      class: item.classe_energetique,
      consumption_kwh_an: item.consommation_energie_kwh_an,
      climate_class: item.classe_climatique,
      noise_level_db: item.niveau_bruit_db
    },
    technical: {
      refrigerant: item.refrigerant,
      cooling_technology: item.technologie_froid,
      inverter: item.inverter,
      auto_defrost: item.degivrage_automatique,
      fast_freezing: item.congelation_rapide
    },
    features: {
      special_technologies: item.technologies_speciales || [],
      door_count: item.nombre_portes,
      freezer_position: item.position_congelateur,
      refrigerator_drawers: item.tiroirs_refrigerateur,
      refrigerator_shelves: item.etagères_refrigerateur,
      freezer_drawers: item.tiroirs_congelateur,
      freezer_shelves: item.etagères_congelateur,
      included_accessories: item.accessoires_inclus || []
    },
    availability: item.disponibilite,
    source: item.source
  };
}

function transformWashingMachineData(item, sellerId) {
  return {
    title: `${item.marque} ${item.modele}`,
    brand: item.marque,
    model: item.modele,
    reference: item.reference,
    category: 'washing_machine',
    condition: 'new',
    priceDzd: item.prix_dzd,
    type: item.categorie,
    sellerId: sellerId, // Link to seller
    appearance: {
      color: item.couleur
    },
    features: {
      installation_type: item.type_pose,
      program_count: item.programmes_fonctions?.nombre_programmes,
      dryer: item.programmes_fonctions?.sechant,
      pre_wash: item.programmes_fonctions?.prelavage,
      spin: item.programmes_fonctions?.essorage,
      rinse: item.programmes_fonctions?.rinçage,
      adjustable_thermostat: item.programmes_fonctions?.thermostat_reglable,
      digital_display: item.programmes_fonctions?.ecran === 'Digital',
      child_lock: item.programmes_fonctions?.verrouillage_enfant,
      special_programs: item.programmes_fonctions?.details || []
    },
    technical: {
      motor_type: item.type_moteur,
      washing_type: item.type_lave_linge,
      spin_speed: item.vitesse_essorage_tr_min
    },
    capacity: {
      total_l: item.capacite_chargement_kg
    },
    energy: {
      class: item.consommation?.classe_energetique,
      consumption_kwh_an: item.consommation?.energie ? 
        parseFloat(item.consommation.energie.replace(' kWh/an', '')) : null,
      water_per_cycle: item.consommation?.eau_par_cycle_l
    },
    dimensions: {
      width_cm: item.dimensions?.largeur_cm,
      height_cm: item.dimensions?.hauteur_cm,
      depth_cm: item.dimensions?.profondeur_cm,
      weight_kg: item.dimensions?.poids_kg
    }
  };
}

async function importFromJsonFiles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create or find a default seller user
    let defaultSeller = await User.findOne({ role: 'seller' });
    if (!defaultSeller) {
      const passwordHash = await bcrypt.hash('password123', 10);
      defaultSeller = await User.create({
        name: 'Default Seller',
        email: 'seller@example.com',
        passwordHash,
        role: 'seller',
        profile: {
          bio: 'Default seller account for imported products',
          experienceYears: 5,
          wilaya: 'Alger',
          phone: '+213 123 456 789'
        }
      });
      console.log('👤 Created default seller user');
    } else {
      console.log('👤 Using existing seller user');
    }

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    const allProducts = [];

    // Import refrigerators
    try {
      const refrigeratorData = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'data', 'refrigerators.json'), 'utf8'
      ));
      
      const refrigerators = refrigeratorData.map(item => transformRefrigeratorData(item, defaultSeller._id));
      allProducts.push(...refrigerators);
      console.log(`📦 Loaded ${refrigerators.length} refrigerators`);
    } catch (error) {
      console.log('⚠️  No refrigerators.json file found, skipping...');
    }

    // Import washing machines
    try {
      const washingMachineData = JSON.parse(fs.readFileSync(
        path.join(__dirname, 'data', 'washing-machines.json'), 'utf8'
      ));
      
      const washingMachines = washingMachineData.lave_linges.map(item => transformWashingMachineData(item, defaultSeller._id));
      allProducts.push(...washingMachines);
      console.log(`🧺 Loaded ${washingMachines.length} washing machines`);
    } catch (error) {
      console.log('⚠️  No washing-machines.json file found, skipping...');
    }

    if (allProducts.length === 0) {
      console.log('❌ No products found to import');
      return;
    }

    // Insert all products
    const products = await Product.insertMany(allProducts);
    console.log(`\n✅ Successfully imported ${products.length} products!`);

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

    console.log(`\n🔗 All products linked to seller: ${defaultSeller.name} (${defaultSeller.email})`);

    await mongoose.disconnect();
    console.log('\n🎉 Database import completed successfully!');
  } catch (error) {
    console.error('Error importing products:', error);
    process.exit(1);
  }
}

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log('📁 Created data directory');
  console.log('📝 Place your JSON files in the server/data/ folder');
  console.log('   - refrigerators.json (your refrigerator data)');
  console.log('   - washing-machines.json (your washing machine data)');
}

importFromJsonFiles();
