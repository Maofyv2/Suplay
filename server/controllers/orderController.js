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
  try {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toISOString().slice(0, 10);
    const orderData = {
      id: `ord-${randomNum}`,
      createdAt: dateStr,
      updatedAt: dateStr,
      status: 'pending',
      shipping: 0,
      ...req.body,
    };

    const newOrder = await Order.create(orderData);

    // Auto-deduct stock for ordered items
    if (Array.isArray(req.body.items)) {
      for (const item of req.body.items) {
        if (item.productId && item.qty) {
          await Product.findOneAndUpdate(
            { $or: [{ id: item.productId }, { _id: item.productId.match(/^[0-9a-fA-F]{24}$/) ? item.productId : null }] },
            { $inc: { stock: -Number(item.qty) } }
          );
        }
      }
    }

    res.status(201).json(newOrder);
  } catch (err) {
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
