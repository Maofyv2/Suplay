import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  supplierId: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    supplierId: { type: String, required: true },
    supplierName: { type: String, required: true },
    items: [orderItemSchema],
    subtotal: { type: Number, required: true },
    shipping: { type: Number, default: 0 },
    total: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    address: { type: String, required: true },
    notes: { type: String, default: '' },
    createdAt: { type: String },
    updatedAt: { type: String },
  },
  { timestamps: true }
);

orderSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Order = mongoose.model('Order', orderSchema);
export default Order;
