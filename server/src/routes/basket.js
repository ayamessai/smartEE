import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth.js';
import BasketItem from '../models/BasketItem.js';
import Product from '../models/Product.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// GET all basket items for buyer, populate product details
router.get('/', requireAuth, requireRole('buyer'), async (req, res) => {
  try {
    const items = await BasketItem.find({ buyerId: req.user.id })
      .populate('productId'); // fill productId with full product document
      console.log('Basket items:', JSON.stringify(items, null, 2));
      res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add product to basket
const addSchema = z.object({ productId: z.string() });
router.post('/', requireAuth, requireRole('buyer'), async (req, res) => {
  try {
    const { productId } = addSchema.parse(req.body);
    const exists = await BasketItem.findOne({ buyerId: req.user.id, productId });
    if (exists) return res.json(exists);

    const item = await BasketItem.create({ buyerId: req.user.id, productId });
    const populatedItem = await item.populate('productId'); // populate immediately
    res.status(201).json(populatedItem);
  } catch (err) {
    if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0]?.message || 'Invalid input' });
    return res.status(500).json({ message: 'Server error' });
  }
});

// Delete basket item
router.delete('/:id', requireAuth, requireRole('buyer'), async (req, res) => {
  await BasketItem.findOneAndDelete({ _id: req.params.id, buyerId: req.user.id });
  res.json({ ok: true });
});

// Notify seller of interest (buy)
router.post('/:id/buy', requireAuth, requireRole('buyer'), async (req, res) => {
  try {
    const item = await BasketItem.findOne({ _id: req.params.id, buyerId: req.user.id }).populate('productId');
    if (!item) return res.status(404).json({ message: 'Basket item not found' });

    const product = item.productId;
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await Notification.create({
      type: 'interest',
      sellerId: product.sellerId,
      buyerId: req.user.id,
      productId: product._id
    });

    // Optionally remove item from basket
    await BasketItem.findByIdAndDelete(item._id);

    res.json({ ok: true, message: 'Seller notified successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
