import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    id: { type: String, unique: true, sparse: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'supplier', 'admin'], default: 'user' },
    supplierId: { type: String, default: null },
    companyName: { type: String, default: '' },
    businessType: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    avatar: { type: String, default: null },
    createdAt: { type: String },
  },
  { timestamps: true }
);

// Hash password before saving if modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  // If plain text matches (for dev/testing legacy fallback)
  if (this.password === candidatePassword) return true;
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform to JSON
userSchema.set('toJSON', {
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.__v;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
export default User;
