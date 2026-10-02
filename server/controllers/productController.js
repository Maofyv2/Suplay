import Product from '../models/Product.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getSupplierIds(user) {
  return [user?.supplierId, user?.id, user?._id?.toString()]
    .filter(Boolean)
    .map(String);
}

function isProductOwnedByUser(product, user) {
  return getSupplierIds(user).includes(String(product.supplierId));
}

export async function getProducts(req, res) {
  try {
    const { category, supplierId, status, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (req.user?.role === 'supplier') {
      query.supplierId = { $in: getSupplierIds(req.user) };
    } else if (supplierId) {
      query.supplierId = supplierId;
    }
    if (req.user?.role === 'admin') {
      if (status) query.status = status;
    } else if (req.user?.role !== 'supplier') {
      query.status = 'active';
    }
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
    if (req.user?.role === 'supplier' && !isProductOwnedByUser(product, req.user)) {
      return res.status(404).json({ message: 'Product not found' });
    }
    if (req.user?.role !== 'admin' && req.user?.role !== 'supplier' && product.status !== 'active') {
      return res.status(404).json({ message: 'Product not found' });
    }
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

    // If authenticated as supplier, ensure supplierId and supplierName are from the authenticated user
    if (req.user && req.user.role === 'supplier') {
      productData.supplierId = String(req.user.supplierId || req.user.id || req.user._id);
      productData.supplierName = req.user.name;
    }

    // If an image was uploaded, store the URL path
    if (req.file) {
      productData.image = `/uploads/products/${req.file.filename}`;
    }

    // Parse numeric fields that may arrive as strings from FormData
    if (productData.price !== undefined) productData.price = parseFloat(productData.price);
    if (productData.stock !== undefined) productData.stock = parseInt(productData.stock, 10);
    if (productData.moq !== undefined) productData.moq = parseInt(productData.moq, 10);

    const newProduct = await Product.create(productData);
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const existing = await Product.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    // Role check: Supplier can only edit their own products
    if (req.user && req.user.role === 'supplier') {
      if (!isProductOwnedByUser(existing, req.user)) {
        return res.status(403).json({ message: 'Forbidden: You can only edit your own products' });
      }
    }

    const updateData = { ...req.body };
    if (req.user?.role === 'supplier') {
      updateData.supplierId = existing.supplierId;
      updateData.supplierName = existing.supplierName;
    }

    // If a new image was uploaded, store the new path
    if (req.file) {
      updateData.image = `/uploads/products/${req.file.filename}`;

      // Delete old image file if it exists
      if (existing?.image && existing.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, '..', existing.image);
        fs.unlink(oldPath, () => {}); // silent delete
      }
    }

    // Parse numeric fields
    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);
    if (updateData.stock !== undefined) updateData.stock = parseInt(updateData.stock, 10);
    if (updateData.moq !== undefined) updateData.moq = parseInt(updateData.moq, 10);

    const updated = await Product.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: updateData },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const existing = await Product.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!existing) return res.status(404).json({ message: 'Product not found' });

    // Role check: Supplier can only delete their own products
    if (req.user && req.user.role === 'supplier') {
      if (!isProductOwnedByUser(existing, req.user)) {
        return res.status(403).json({ message: 'Forbidden: You can only delete your own products' });
      }
    }

    const deleted = await Product.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });

    // Clean up image file
    if (deleted?.image && deleted.image.startsWith('/uploads/')) {
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
