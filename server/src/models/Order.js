import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // ✅ seller lié
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

const shippingAddressSchema = new mongoose.Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { _id: false } // ⚡ pas besoin d’un id pour chaque adresse
);

const orderSchema = new mongoose.Schema(
  {
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    totalItems: { type: Number, required: true },
    shippingAddress: { type: shippingAddressSchema, required: true }, // ✅ objet au lieu de string
    paymentMethod: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"], default: "pending" },
    paymentStatus: { type: String, enum: ["unpaid", "pending", "paid", "refunded"], default: "unpaid" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
