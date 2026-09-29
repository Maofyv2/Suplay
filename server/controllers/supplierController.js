import Supplier from '../models/Supplier.js';

export async function getSuppliers(req, res) {
  try {
    const { category, search } = req.query;
    const query = {};

    if (category) query.category = category;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const suppliers = await Supplier.find(query).sort({ rating: -1 });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getSupplierById(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateSupplier(req, res) {
  try {
    const { id } = req.params;
    const updated = await Supplier.findOneAndUpdate(
      { $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] },
      { $set: req.body },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: 'Supplier not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function toggleSupplierVerification(req, res) {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findOne({ $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }] });
    if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

    supplier.verified = !supplier.verified;
    await supplier.save();
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteSupplier(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Supplier.findOneAndDelete({
      $or: [{ id }, { _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }],
    });
    if (!deleted) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
