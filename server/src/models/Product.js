import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    category: { type: String, enum: ['washing_machine', 'refrigerator', 'dishwasher', 'oven', 'microwave', 'other'], default: 'other' },
    condition: { type: String, enum: ['new', 'used'], default: 'new' },
    priceDzd: { type: Number, required: false },
    images: [{ type: String }],
    specs: {
      brand: { type: String, default: '' },
      model: { type: String, default: '' },
      energyClass: { type: String, default: '' },
      powerWatts: { type: Number, default: 0 },
      annualKwh: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model('Product', ProductSchema); 