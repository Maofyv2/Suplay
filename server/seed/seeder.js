import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import Order from '../models/Order.js';

dotenv.config();

const mockUsers = [
  {
    id: 'u-cust',
    name: 'Test Customer',
    email: 'customer@test.com',
    password: 'password123',
    role: 'user',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'u-sup',
    supplierId: 's1',
    name: 'TechParts Philippines',
    email: 'supplier@test.com',
    password: 'password123',
    role: 'supplier',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'u-admin',
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    status: 'active',
    createdAt: '2025-01-01',
  },
  {
    id: 'u1',
    name: 'Ana Reyes',
    email: 'ana.reyes@example.com',
    password: 'password123',
    role: 'user',
    status: 'active',
    createdAt: '2025-01-15',
  },
  {
    id: 'u2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@example.com',
    password: 'password123',
    role: 'user',
    status: 'active',
    createdAt: '2025-02-20',
  },
  {
    id: 'u3',
    name: 'Admin User',
    email: 'admin@suplay.com',
    password: 'password123',
    role: 'admin',
    status: 'active',
    createdAt: '2024-12-01',
  },
  {
    id: 'u4',
    name: 'Maria Santos',
    email: 'maria.santos@supplierco.com',
    password: 'password123',
    role: 'supplier',
    status: 'active',
    createdAt: '2025-03-10',
  },
];

const mockSuppliers = [
  {
    id: 's1',
    name: 'TechParts Philippines',
    email: 'sales@techpartsph.com',
    phone: '+63 2 8123 4567',
    address: 'Caloocan City, Metro Manila',
    category: 'Industrial',
    description: 'Leading supplier of precision industrial components and mechanical parts for manufacturing.',
    verified: true,
    rating: 4.7,
    totalProducts: 84,
    joinedAt: '2024-06-10',
  },
  {
    id: 's2',
    name: 'OfficeMax Distributors',
    email: 'orders@officemaxph.com',
    phone: '+63 2 8765 4321',
    address: 'Quezon City, Metro Manila',
    category: 'Office Supplies',
    description: 'Complete office solutions: furniture, supplies, and equipment for businesses of all sizes.',
    verified: true,
    rating: 4.5,
    totalProducts: 212,
    joinedAt: '2024-03-22',
  },
  {
    id: 's3',
    name: 'PackRight Solutions',
    email: 'info@packright.ph',
    phone: '+63 32 412 5678',
    address: 'Cebu City, Cebu',
    category: 'Packaging',
    description: 'Sustainable and industrial packaging materials for e-commerce and manufacturing.',
    verified: true,
    rating: 4.3,
    totalProducts: 56,
    joinedAt: '2024-08-05',
  },
  {
    id: 's4',
    name: 'ChemTrade PH',
    email: 'procurement@chemtradeph.com',
    phone: '+63 2 8234 5678',
    address: 'Pasig City, Metro Manila',
    category: 'Chemicals',
    description: 'Industrial and laboratory chemicals supplier with nationwide delivery.',
    verified: false,
    rating: 4.6,
    totalProducts: 39,
    joinedAt: '2025-01-18',
  },
];

const mockProducts = [
  {
    id: 'p1',
    name: 'Industrial Ball Bearings (Pack of 50)',
    category: 'Industrial',
    price: 2850,
    stock: 320,
    unit: 'pack',
    supplierId: 's1',
    supplierName: 'TechParts Philippines',
    description: 'High-precision steel ball bearings suitable for heavy-duty industrial machinery.',
    rating: 4.7,
    reviews: 42,
    status: 'active',
    moq: 5,
  },
  {
    id: 'p2',
    name: 'A4 Bond Paper Ream',
    category: 'Office Supplies',
    price: 320,
    stock: 1500,
    unit: 'ream',
    supplierId: 's2',
    supplierName: 'OfficeMax Distributors',
    description: '500 sheets per ream, 80gsm, suitable for laser and inkjet printers.',
    rating: 4.5,
    reviews: 128,
    status: 'active',
    moq: 10,
  },
  {
    id: 'p3',
    name: 'Corrugated Cardboard Boxes (25pcs)',
    category: 'Packaging',
    price: 980,
    stock: 450,
    unit: 'bundle',
    supplierId: 's3',
    supplierName: 'PackRight Solutions',
    description: 'Double-wall corrugated shipping boxes, 12x10x8 inches.',
    rating: 4.3,
    reviews: 35,
    status: 'active',
    moq: 4,
  },
  {
    id: 'p4',
    name: 'Ergonomic Office Chair',
    category: 'Office Supplies',
    price: 8500,
    stock: 45,
    unit: 'unit',
    supplierId: 's2',
    supplierName: 'OfficeMax Distributors',
    description: 'Adjustable lumbar support, breathable mesh back, 3D armrests.',
    rating: 4.8,
    reviews: 64,
    status: 'active',
    moq: 2,
  },
  {
    id: 'p5',
    name: 'Hydraulic Seal Kit (Set of 12)',
    category: 'Industrial',
    price: 4200,
    stock: 80,
    unit: 'set',
    supplierId: 's1',
    supplierName: 'TechParts Philippines',
    description: 'Heavy-duty polyurethane seals for hydraulic cylinders and industrial pumps.',
    rating: 4.6,
    reviews: 19,
    status: 'active',
    moq: 3,
  },
  {
    id: 'p6',
    name: 'Thermal Transfer Label Roll',
    category: 'Packaging',
    price: 560,
    stock: 600,
    unit: 'roll',
    supplierId: 's3',
    supplierName: 'PackRight Solutions',
    description: '1000 labels per roll, 4x6 inches, compatible with Zebra and Sato printers.',
    rating: 4.4,
    reviews: 51,
    status: 'active',
    moq: 5,
  },
  {
    id: 'p7',
    name: 'Isopropyl Alcohol 99% (20L Drum)',
    category: 'Chemicals',
    price: 3400,
    stock: 120,
    unit: 'drum',
    supplierId: 's4',
    supplierName: 'ChemTrade PH',
    description: 'Technical grade isopropyl alcohol for industrial degreasing and electronic cleaning.',
    rating: 4.7,
    reviews: 28,
    status: 'active',
    moq: 1,
  },
  {
    id: 'p8',
    name: 'Safety Steel-Toe Work Boots',
    category: 'Safety & PPE',
    price: 2100,
    stock: 200,
    unit: 'pair',
    supplierId: 's1',
    supplierName: 'TechParts Philippines',
    description: 'OSHA compliant, oil-resistant rubber outsole, puncture-resistant steel midsole.',
    rating: 4.5,
    reviews: 73,
    status: 'active',
    moq: 5,
  },
];

const mockOrders = [
  {
    id: 'ord-001',
    userId: 'u1',
    userName: 'Ana Reyes',
    supplierId: 's1',
    supplierName: 'TechParts Philippines',
    items: [
      { productId: 'p1', name: 'Industrial Ball Bearings (Pack of 50)', qty: 10, unitPrice: 2850, total: 28500, supplierId: 's1' },
    ],
    subtotal: 28500,
    shipping: 0,
    total: 28500,
    status: 'delivered',
    createdAt: '2025-08-12',
    updatedAt: '2025-08-18',
    address: 'Makati City, Metro Manila',
  },
  {
    id: 'ord-002',
    userId: 'u1',
    userName: 'Ana Reyes',
    supplierId: 's2',
    supplierName: 'OfficeMax Distributors',
    items: [
      { productId: 'p2', name: 'A4 Bond Paper Ream', qty: 50, unitPrice: 320, total: 16000, supplierId: 's2' },
      { productId: 'p4', name: 'Ergonomic Office Chair', qty: 5, unitPrice: 8500, total: 42500, supplierId: 's2' },
    ],
    subtotal: 58500,
    shipping: 0,
    total: 58500,
    status: 'processing',
    createdAt: '2025-09-01',
    updatedAt: '2025-09-02',
    address: 'Makati City, Metro Manila',
  },
  {
    id: 'ord-003',
    userId: 'u2',
    userName: 'Carlos Mendoza',
    supplierId: 's3',
    supplierName: 'PackRight Solutions',
    items: [
      { productId: 'p3', name: 'Corrugated Cardboard Boxes (25pcs)', qty: 20, unitPrice: 980, total: 19600, supplierId: 's3' },
      { productId: 'p6', name: 'Thermal Transfer Label Roll', qty: 10, unitPrice: 560, total: 5600, supplierId: 's3' },
    ],
    subtotal: 25200,
    shipping: 0,
    total: 25200,
    status: 'shipped',
    createdAt: '2025-09-05',
    updatedAt: '2025-09-07',
    address: 'Davao City, Davao del Sur',
  },
];

async function seed() {
  try {
    console.log('[Seeder] Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/suplay');
    console.log('[Seeder] Connected.');

    // Clear existing collections
    await User.deleteMany({});
    await Supplier.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    console.log('[Seeder] Cleared existing data.');

    // Seed Suppliers
    await Supplier.insertMany(mockSuppliers);
    console.log(`[Seeder] Seeded ${mockSuppliers.length} suppliers.`);

    // Seed Products
    await Product.insertMany(mockProducts);
    console.log(`[Seeder] Seeded ${mockProducts.length} products.`);

    // Seed Orders
    await Order.insertMany(mockOrders);
    console.log(`[Seeder] Seeded ${mockOrders.length} orders.`);

    // Seed Users with bcrypt hashing
    for (const u of mockUsers) {
      await User.create(u);
    }
    console.log(`[Seeder] Seeded ${mockUsers.length} users with hashed passwords.`);

    console.log('✅ [Seeder] Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seeder] Seeding error:', error.message);
    process.exit(1);
  }
}

seed();
