import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getProducts(req, res) {
  try {
    const { category, supplierId, status, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (supplierId) query.supplierId = supplierId;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { supplierName: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getProductById(req, res) {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createProduct(req, res) {
  try {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const productData = {
      id: `p-${Date.now()}-${randomNum}`,
      ...req.body,
    };

    // If an image was uploaded, store the URL path
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    // Parse numeric fields that may arrive as strings from FormData
    if (productData.price) productData.price = parseFloat(productData.price);
    if (productData.stock) productData.stock = parseInt(productData.stock, 10);
    if (productData.moq) productData.moq = parseInt(productData.moq, 10);

    const newProduct = await Product.create(productData);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // If a new image was uploaded, store the new path
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;

      // Delete old image file if it exists
      const existing = await Product.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
      if (existing?.image && existing.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', existing.image);
        fs.unlink(oldPath, () => {}); // silent delete
      }
    }

    // Parse numeric fields
    if (updateData.price) updateData.price = parseFloat(updateData.price);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock, 10);
    if (updateData.moq) updateData.moq = parseInt(updateData.moq, 10);

    const updated = await Product.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: updateData },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Product.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    // Clean up image file
    if (deleted.image && deleted.image.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', deleted.image);
      fs.unlink(imgPath, () => {});
    }

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateStock(req, res) {
  try {
    const { id } = req.params;
    const { quantityDeducted } = req.body;
    const product = await Product.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    product.stock = Math.max(0, product.stock - (Number(quantityDeducted) || 0));
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
