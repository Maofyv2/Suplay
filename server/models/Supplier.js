import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    category: { type: String, required: true },
    description: { type: String, default: '' },
    verified: { type: Boolean, default: false },
    rating: { type: Number, default: 4.5 },
    totalProducts: { type: Number, default: 0 },
    logo: { type: String, default: null },
    joinedAt: { type: String },
  },
  { timestamps: true }
);

supplierSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;
