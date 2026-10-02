import Order from '../models/Order.js';
import Product from '../models/Product.js';

export async function getOrders(req, res) {
  try {
    const { userId, supplierId, status, search } = req.query;
    const query = {};

    if (userId) query.userId = userId;
    if (supplierId) {
      query.$or = [
        { supplierId: supplierId },
        { 'items.supplierId': supplierId },
      ];
    }
    if (status) query.status = status;
    if (search) {
      const searchRegex = { $regex: search, $options: 'i' };
      query.$or = [
        { id: searchRegex },
        { userName: searchRegex },
        { supplierName: searchRegex },
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const order = await Order.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createOrder(req, res) {
  const deductedStock = [];

  try {
    const { items, address, notes } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Add at least one product to the order.' });
    }
    if (!address?.trim()) {
      return res.status(400).json({ message: 'A delivery address is required.' });
    }

    const quantitiesByProduct = new Map();
    for (const item of items) {
      const productId = String(item.productId || '');
      const quantity = Number(item.qty);
      if (!productId || !Number.isSafeInteger(quantity) || quantity < 1) {
        return res.status(400).json({ message: 'Each order item must have a valid product and whole-number quantity.' });
      }
      quantitiesByProduct.set(productId, (quantitiesByProduct.get(productId) || 0) + quantity);
    }

    const products = [];
    for (const [productId, quantity] of quantitiesByProduct) {
      const product = await Product.findOne({
        $or: [
          { id: productId },
          { _id: /^[0-9a-fA-F]{24}$/.test(productId) ? productId : null },
        ],
      });
      if (!product || product.status !== 'active') {
        return res.status(404).json({ message: 'One or more products are unavailable.' });
      }
      if (quantity < product.moq) {
        return res.status(400).json({
          message: `${product.name} has a minimum order quantity of ${product.moq}.`,
        });
      }
      if (quantity > product.stock) {
        return res.status(409).json({
          message: `Not enough stock for ${product.name}. Available quantity: ${product.stock}.`,
        });
      }
      products.push({ product, quantity });
    }

    const orderItems = products.map(({ product, quantity }) => ({
      productId: String(product.id || product._id),
      name: product.name,
      qty: quantity,
      unitPrice: product.price,
      total: product.price * quantity,
      supplierId: product.supplierId,
      supplierName: product.supplierName,
    }));

    for (const { product, quantity } of products) {
      const updated = await Product.findOneAndUpdate(
        { _id: product._id, stock: { $gte: quantity }, status: 'active' },
        { $inc: { stock: -quantity } },
        { new: true }
      );
      if (!updated) {
        await Promise.all(
          deductedStock.map(({ productId, quantity: deducted }) =>
            Product.updateOne({ _id: productId }, { $inc: { stock: deducted } })
          )
        );
        deductedStock.length = 0;
        return res.status(409).json({ message: `Stock changed while placing your order for ${product.name}. Please review your cart.` });
      }
      deductedStock.push({ productId: product._id, quantity });
    }

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10);
    const orderData = {
      id: `ord-${Date.now()}-${randomNum}`,
      createdAt: dateStr,
      updatedAt: dateStr,
      status: 'pending',
      shipping: 0,
      userId: String(req.user.id || req.user._id),
      userName: req.user.name,
      supplierId: orderItems[0].supplierId,
      supplierName: orderItems[0].supplierName,
      items: orderItems,
      subtotal: orderItems.reduce((sum, item) => sum + item.total, 0),
      total: orderItems.reduce((sum, item) => sum + item.total, 0),
      address: address.trim(),
      notes: notes || '',
    };

    const newOrder = await Order.create(orderData);
    deductedStock.length = 0;
    res.status(201).json(newOrder);
  } catch (err) {
    if (deductedStock.length > 0) {
      await Promise.all(
        deductedStock.map(({ productId, quantity }) =>
          Product.updateOne({ _id: productId }, { $inc: { stock: quantity } })
        )
      );
    }
    res.status(500).json({ message: err.message });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const dateStr = new Date().toISOString().slice(0, 10);

    const updated = await Order.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: { status, updatedAt: dateStr } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function cancelOrder(req, res) {
  try {
    const { id } = req.params;
    const dateStr = new Date().toISOString().slice(0, 10);

    const updated = await Order.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: { status: 'cancelled', updatedAt: dateStr } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Order not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
