import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    unit: { type: String, required: true, default: 'piece' },
    moq: { type: Number, required: true, min: 1, default: 1 },
    supplierId: { type: String, required: true },
    supplierName: { type: String, required: true },
    description: { type: String, default: '' },
    image: { type: String, default: null },
    rating: { type: Number, default: 4.5 },
    reviews: { type: Number, default: 0 },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

productSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.__v;
    return ret;
  },
});

export const Product = mongoose.model('Product', productSchema);
export default Product;
