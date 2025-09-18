import express from "express";
import Notification from "../models/Notification.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = express.Router();

// 📌 GET notifications du vendeur connecté
router.get("/", requireAuth, requireRole("seller"), async (req, res) => {
  try {
    const notifications = await Notification.find({ sellerId: req.user.id })
      .populate("buyerId", "name email")
      .populate("productId", "title priceDzd")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    console.error("❌ Error fetching notifications:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 📌 Marquer une notification comme lue
router.post("/:id/read", requireAuth, requireRole("seller"), async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, sellerId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notif) return res.status(404).json({ message: "Notification introuvable" });

    res.json(notif);
  } catch (err) {
    console.error("❌ Error marking as read:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default router;
