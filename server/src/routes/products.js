import express from 'express';
import { z } from 'zod';
import Product from '../models/Product.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get categories (just names)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories); // ["Réfrigérateur", "Machine à laver", ...]
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});
// Get products with filters
router.get('/api/products', async (req, res) => {
  try {
    const { category, priceRange, energyClass } = req.query;
    let filter = {};

    if (category) {
      filter.category = category;
    }
    if (priceRange) {
      if (priceRange.includes('-')) {
        const [min, max] = priceRange.split('-').map(Number);
        filter.price = { $gte: min, $lte: max };
      } else if (priceRange.endsWith('+')) {
        const min = Number(priceRange.replace('+', ''));
        filter.price = { $gte: min };
      }
    }
    if (energyClass) {
      filter.energyClass = energyClass;
    }

    const products = await Product.find(filter);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

//app.listen(4000, () => console.log('Server running on port 4000'));

// Get all products with filtering
router.get('/', async (req, res) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      energyClass, 
      condition,
      brand,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      limit = 20,
      page = 1
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (condition) {
      filter.condition = condition;
    }
    
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Price filter
    if (minPrice || maxPrice) {
      filter.priceDzd = {};
      if (minPrice) filter.priceDzd.$gte = parseFloat(minPrice);
      if (maxPrice) filter.priceDzd.$lte = parseFloat(maxPrice);
    }
    
    // Energy class filter (for both refrigerators and washing machines)
    if (energyClass) {
      filter['energy.class'] = energyClass;
    }

    // Build sort object
    const sort = {};
    if (sortBy === 'price') {
      sort.priceDzd = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'energy') {
      // Sort by energy efficiency (A+++ is best, then A++, A+, A, etc.)
      sort['energy.class'] = 1;
    } else {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get products with filters
    const products = await Product.find(filter)
      .populate('sellerId', 'name profile.wilaya')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Product.countDocuments(filter);

    // Get available filter options for UI
    const filterOptions = await Product.aggregate([
      { $match: {} }, // Match all products
      {
        $group: {
          _id: null,
          categories: { $addToSet: '$category' },
          brands: { $addToSet: '$brand' },
          conditions: { $addToSet: '$condition' },
          energyClasses: { $addToSet: '$energy.class' },
          minPrice: { $min: '$priceDzd' },
          maxPrice: { $max: '$priceDzd' }
        }
      }
    ]);

    const options = filterOptions[0] || {
      categories: [],
      brands: [],
      conditions: [],
      energyClasses: [],
      minPrice: 0,
      maxPrice: 0
    };

    res.json({
      products,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      },
      filters: {
        available: {
          categories: options.categories.filter(Boolean).sort(),
          brands: options.brands.filter(Boolean).sort(),
          conditions: options.conditions.filter(Boolean).sort(),
          energyClasses: options.energyClasses.filter(Boolean).sort(),
          priceRange: {
            min: options.minPrice || 0,
            max: options.maxPrice || 0
          }
        },
        applied: {
          category,
          minPrice,
          maxPrice,
          energyClass,
          condition,
          brand,
          search
        }
      }
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

router.get('/mine', requireAuth, requireRole('seller'), async (req, res) => {
  const products = await Product.find({ sellerId: req.user.id }).sort({ createdAt: -1 });
  res.json(products);
});

// Get available categories and their specifications
router.get('/categories', (req, res) => {
  const categories = {
    refrigerator: {
      name: 'Réfrigérateur',
      fields: [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', options: ['2 Portes', 'Combiné', 'Multi-Portes', 'Side by Side'], required: true },
        { key: 'dimensions.width_cm', label: 'Largeur (cm)', type: 'number' },
        { key: 'dimensions.height_cm', label: 'Hauteur (cm)', type: 'number' },
        { key: 'dimensions.depth_cm', label: 'Profondeur (cm)', type: 'number' },
        { key: 'dimensions.weight_kg', label: 'Poids (kg)', type: 'number' },
        { key: 'capacity.total_l', label: 'Capacité totale (L)', type: 'number' },
        { key: 'capacity.refrigerator_l', label: 'Capacité réfrigérateur (L)', type: 'number' },
        { key: 'capacity.freezer_l', label: 'Capacité congélateur (L)', type: 'number' },
        { key: 'energy.class', label: 'Classe énergétique', type: 'select', options: ['A', 'A+', 'A++', 'A+++'], required: true },
        { key: 'energy.consumption_kwh_an', label: 'Consommation annuelle (kWh)', type: 'number' },
        { key: 'technical.cooling_technology', label: 'Technologie de froid', type: 'select', options: ['No Frost', 'Froid Statique', 'Total No Frost'] },
        { key: 'technical.inverter', label: 'Inverter', type: 'checkbox' },
        { key: 'features.door_count', label: 'Nombre de portes', type: 'number' },
        { key: 'features.freezer_position', label: 'Position congélateur', type: 'select', options: ['Haut', 'Bas'] },
        { key: 'appearance.color', label: 'Couleur', type: 'text' },
        { key: 'priceDzd', label: 'Prix (DA)', type: 'number', required: true }
      ]
    },
    washing_machine: {
      name: 'Machine à laver',
      fields: [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'reference', label: 'Référence', type: 'text', required: true },
        { key: 'type', label: 'Catégorie', type: 'select', options: ['Frontal', 'Top', 'Séchant'], required: true },
        { key: 'appearance.color', label: 'Couleur', type: 'text', required: true },
        { key: 'features.installation_type', label: 'Type de pose', type: 'select', options: ['Pose Libre', 'Encastrable'], required: true },
        { key: 'technical.motor_type', label: 'Type de moteur', type: 'select', options: ['Inverter', 'Standard'], required: true },
        { key: 'technical.washing_type', label: 'Type de machine', type: 'select', options: ['Automatique', 'Semi-automatique'], required: true },
        { key: 'capacity.total_l', label: 'Capacité de chargement (kg)', type: 'number', required: true },
        { key: 'technical.spin_speed', label: 'Vitesse d\'essorage (tr/min)', type: 'number', required: true },
        { key: 'features.program_count', label: 'Nombre de programmes', type: 'number', required: true },
        { key: 'features.dryer', label: 'Fonction séchage', type: 'checkbox' },
        { key: 'features.pre_wash', label: 'Pré-lavage', type: 'checkbox' },
        { key: 'features.spin', label: 'Essorage', type: 'checkbox' },
        { key: 'features.rinse', label: 'Rinçage', type: 'checkbox' },
        { key: 'features.adjustable_thermostat', label: 'Thermostat réglable', type: 'checkbox' },
        { key: 'features.digital_display', label: 'Écran digital', type: 'checkbox' },
        { key: 'features.child_lock', label: 'Verrouillage enfant', type: 'checkbox' },
        { key: 'features.special_programs', label: 'Programmes spéciaux', type: 'tags' },
        { key: 'energy.class', label: 'Classe énergétique', type: 'select', options: ['A', 'A+', 'A++', 'A+++'], required: true },
        { key: 'energy.consumption_kwh_an', label: 'Consommation énergétique (kWh/an)', type: 'number' },
        { key: 'energy.water_per_cycle', label: 'Consommation d\'eau par cycle (L)', type: 'number' },
        { key: 'dimensions.width_cm', label: 'Largeur (cm)', type: 'number', required: true },
        { key: 'dimensions.height_cm', label: 'Hauteur (cm)', type: 'number', required: true },
        { key: 'dimensions.depth_cm', label: 'Profondeur (cm)', type: 'number', required: true },
        { key: 'dimensions.weight_kg', label: 'Poids (kg)', type: 'number', required: true },
        { key: 'priceDzd', label: 'Prix (DA)', type: 'number', required: true }
      ]
    },
    dishwasher: {
      name: 'Lave-vaisselle',
      fields: [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'capacity.total_l', label: 'Capacité (couverts)', type: 'number', required: true },
        { key: 'energy.class', label: 'Classe énergétique', type: 'select', options: ['A', 'A+', 'A++', 'A+++'], required: true },
        { key: 'energy.consumption_kwh_an', label: 'Consommation annuelle (kWh)', type: 'number' },
        { key: 'features.special_technologies', label: 'Programmes spéciaux', type: 'tags' },
        { key: 'appearance.color', label: 'Couleur', type: 'text' },
        { key: 'priceDzd', label: 'Prix (DA)', type: 'number', required: true }
      ]
    },
    oven: {
      name: 'Four',
      fields: [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'type', label: 'Type', type: 'select', options: ['Électrique', 'Gaz', 'Micro-ondes', 'Combiné'], required: true },
        { key: 'capacity.total_l', label: 'Capacité (L)', type: 'number' },
        { key: 'energy.class', label: 'Classe énergétique', type: 'select', options: ['A', 'A+', 'A++', 'A+++'] },
        { key: 'features.special_technologies', label: 'Fonctions spéciales', type: 'tags' },
        { key: 'appearance.color', label: 'Couleur', type: 'text' },
        { key: 'priceDzd', label: 'Prix (DA)', type: 'number', required: true }
      ]
    },
    microwave: {
      name: 'Micro-ondes',
      fields: [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'capacity.total_l', label: 'Capacité (L)', type: 'number', required: true },
        { key: 'energy.consumption_kwh_an', label: 'Consommation annuelle (kWh)', type: 'number' },
        { key: 'features.special_technologies', label: 'Fonctions spéciales', type: 'tags' },
        { key: 'appearance.color', label: 'Couleur', type: 'text' },
        { key: 'priceDzd', label: 'Prix (DA)', type: 'number', required: true }
      ]
    }
  };
  
  res.json(categories);
});

const productSchema = z.object({
  title: z.string().min(1, "Titre requis"),
  description: z.string().optional(),
  category: z.enum([
    "washing_machine",
    "refrigerator",
    "dishwasher",
    "oven",
    "microwave",
    "other",
  ]),
  condition: z.enum(["new", "used"]),
  priceDzd: z.number().optional(),
  images: z.array(z.string()).optional(),
  specs: z.object({
    brand: z.string().optional(),
    model: z.string().optional(),
    energyClass: z.string().optional(),
    powerWatts: z.number().optional(),
    annualKwh: z.number().optional(),
  }),
});

/*
// Base product schema
const baseProductSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(['refrigerator', 'washing_machine', 'dishwasher', 'oven', 'microwave', 'other']),
  condition: z.enum(['new', 'used']).default('new'),
  priceDzd: z.number().positive(),
  images: (req.body.images || []).map((url, i) => ({
    url,
    alt: `Image ${i + 1}`
  })),
  
  // Basic info
  brand: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  reference: z.string().optional(),
  type: z.string().optional(),
  
  // Dimensions
  dimensions: z.object({
    width_cm: z.number().positive().optional().nullable(),
    height_cm: z.number().positive().optional().nullable(),
    depth_cm: z.number().positive().optional().nullable(),
    weight_kg: z.number().positive().optional().nullable()
  }).optional(),
  
  // Capacity
  capacity: z.object({
    total_l: z.number().positive().optional().nullable(),
    refrigerator_l: z.number().positive().optional().nullable(),
    freezer_l: z.number().positive().optional().nullable(),
    freezing_capacity_kg_24h: z.number().positive().optional().nullable(),
    freezer_autonomy_h: z.number().positive().optional().nullable()
  }).optional(),
  
  // Energy
  energy: z.object({
    class: z.string().optional(),
    consumption_kwh_an: z.number().positive().optional().nullable(),
    climate_class: z.string().optional(),
    noise_level_db: z.number().positive().optional().nullable(),
    // Washing machine specific
    water_per_cycle: z.number().positive().optional().nullable()
  }).optional(),
  
  // Technical
  technical: z.object({
    refrigerant: z.string().optional().nullable(),
    cooling_technology: z.string().optional(),
    inverter: z.boolean().optional().nullable(),
    auto_defrost: z.boolean().optional().nullable(),
    fast_freezing: z.boolean().optional().nullable(),
    // Washing machine specific
    motor_type: z.string().optional(),
    washing_type: z.string().optional(),
    spin_speed: z.number().positive().optional().nullable()
  }).optional(),
  
  // Features
  features: z.object({
    special_technologies: z.array(z.string()).optional(),
    door_count: z.number().int().positive().optional().nullable(),
    freezer_position: z.string().optional(),
    refrigerator_drawers: z.number().int().min(0).optional().nullable(),
    refrigerator_shelves: z.number().int().min(0).optional().nullable(),
    freezer_drawers: z.number().int().min(0).optional().nullable(),
    freezer_shelves: z.number().int().min(0).optional().nullable(),
    included_accessories: z.array(z.string()).optional(),
    // Washing machine specific
    installation_type: z.string().optional(),
    program_count: z.number().int().positive().optional().nullable(),
    dryer: z.boolean().optional().nullable(),
    pre_wash: z.boolean().optional().nullable(),
    spin: z.boolean().optional().nullable(),
    rinse: z.boolean().optional().nullable(),
    adjustable_thermostat: z.boolean().optional().nullable(),
    digital_display: z.boolean().optional().nullable(),
    child_lock: z.boolean().optional().nullable(),
    special_programs: z.array(z.string()).optional()
  }).optional(),
  
  // Appearance
  appearance: z.object({
    color: z.string().optional().nullable(),
    finish_material: z.string().optional().nullable(),
    interior_lighting: z.string().optional().nullable()
  }).optional(),
  
  // Other
  availability: z.string().optional().nullable(),
  source: z.string().optional()
});*/

router.post('/', requireAuth, requireRole('seller'), async (req, res) => {
  try {
    const data = baseProductSchema.parse(req.body);
    
    // Create title from brand and model if not provided
    if (!data.title) {
      data.title = `${data.brand} ${data.model}`;
    }
    
    const doc = await Product.create({ ...data, sellerId: req.user.id });
    res.status(201).json(doc);
  } catch (err) {
    if (err instanceof z.ZodError) {
      console.error('Validation error:', err.errors);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    console.error('Product creation error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', requireAuth, requireRole('seller'), async (req, res) => {
  try {
    const data = baseProductSchema.partial().parse(req.body);
    const updated = await Product.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user.id }, 
      { $set: data }, 
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message }))
      });
    }
    return res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', requireAuth, requireRole('seller'), async (req, res) => {
  const deleted = await Product.findOneAndDelete({ _id: req.params.id, sellerId: req.user.id });
  if (!deleted) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

router.get('/refrigerators', (req, res) => {
  const dataPath = path.join(__dirname, '../data/refrigerators.json');
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  res.json(jsonData);
});

router.get('/washing-machines', (req, res) => {
  const dataPath = path.join(__dirname, '../data/washing-machines.json');
  const jsonData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  res.json(jsonData);
});

export default router; 