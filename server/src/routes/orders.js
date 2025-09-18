import express from "express";
import Order from "../models/Order.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import Notification from "../models/Notification.js";
import Product from "../models/Product.js";

const router = express.Router();

/* =====================
   Buyer Routes
===================== */

// 📌 Créer une commande
router.post("/", requireAuth, async (req, res) => {
  try {
    let { items, totalAmount, totalItems, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Aucun article dans la commande." });
    }

    // ✅ Validation shippingAddress object
    if (
      !shippingAddress ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.postalCode ||
      !shippingAddress.country
    ) {
      return res.status(400).json({ message: "Adresse de livraison invalide ou incomplète." });
    }

    const enrichedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Produit introuvable : ${item.productId}` });
      }

      enrichedItems.push({
        productId: product._id,
        sellerId: product.sellerId, // ✅ récupéré depuis la DB
        quantity: item.quantity,
        price: item.price,
      });

      // 📌 Créer une notification vendeur
      await Notification.create({
        sellerId: product.sellerId,
        buyerId: req.user.id,
        productId: product._id,
        type: "order",
        message: `${req.user.name} a commandé ${item.quantity}x ${product.title}`,
      });
    }

    const order = new Order({
      buyerId: req.user.id,
      items: enrichedItems,
      totalAmount,
      totalItems,
      shippingAddress, // ✅ sauvegardé comme objet
      paymentMethod,
      notes,
    });

    await order.save();
    res.status(201).json(order);
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({
      message: "Erreur lors de la création de la commande.",
      error: err.message,
    });
  }
});

// 📌 Récupérer les commandes de l’acheteur connecté
router.get("/my", requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Erreur serveur lors du chargement des commandes" });
  }
});

/* =====================
   Seller Routes
===================== */

// 📌 Récupérer les commandes d’un vendeur connecté
router.get("/seller", requireAuth, requireRole("seller"), async (req, res) => {
  try {
    const orders = await Order.find({ "items.sellerId": req.user.id })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error("Error fetching seller orders:", err);
    res.status(500).json({ message: "Erreur lors du chargement des commandes vendeur." });
  }
});

// 📌 Mettre à jour le statut d’une commande
router.put("/:id/status", requireAuth, requireRole("seller"), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Commande non trouvée." });

    const { status, paymentStatus } = req.body;

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la mise à jour du statut." });
  }
});

/* =====================
   Generic Order Routes
===================== */

// 📌 Récupérer une commande spécifique (acheteur seulement)
router.get("/:id", requireAuth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.productId");
    if (!order) return res.status(404).json({ message: "Commande non trouvée." });

    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Accès interdit." });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur lors du chargement de la commande." });
  }
});

// 📌 Annuler une commande (si elle est en attente)
router.put("/:id/cancel", requireAuth, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      _id: req.params.id,
      buyerId: req.user.id,
    });

    if (!order) {
      return res.status(404).json({ message: "Commande introuvable ou déjà supprimée" });
    }

    res.json({ message: "Commande supprimée avec succès" });
  } catch (err) {
    console.error("Cancel order error:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
