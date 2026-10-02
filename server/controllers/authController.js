import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';

function generateToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'suplay_secret_key',
    { expiresIn: '7d' }
  );
}

export async function register(req, res) {
  try {
    const { name, email, password, role, companyName, businessType, phone, address } = req.body;
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const accountRole = role || 'user';
    const accountId = `u-${Date.now()}`;
    const supplierId = accountRole === 'supplier' ? `s-${accountId}` : null;
    const user = await User.create({
      id: accountId,
      name,
      email: email.toLowerCase(),
      password,
      role: accountRole,
      supplierId,
      companyName: companyName || '',
      businessType: businessType || '',
      phone: phone || '',
      address: address || '',
      createdAt: new Date().toISOString().slice(0, 10),
      status: 'active',
    });

    if (accountRole === 'supplier') {
      try {
        await Supplier.create({
          id: supplierId,
          name: companyName || name,
          email: email.toLowerCase(),
          phone: phone || '',
          address: address || '',
          category: businessType || 'Other',
          description: '',
          verified: false,
          totalProducts: 0,
          joinedAt: new Date().toISOString().slice(0, 10),
        });
      } catch (err) {
        await User.deleteOne({ _id: user._id });
        throw err;
      }
    }

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error during registration' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'This account has been suspended' });
    }

    const token = generateToken(user);
    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Server error during login' });
  }
}

export async function getMe(req, res) {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
