import mongoose from 'mongoose';
const { Schema, model } = mongoose;
const oid = Schema.Types.ObjectId;

export const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  cart: [{ product: { type: oid, ref: 'Product' }, size: String, color: String, qty: { type: Number, default: 1, min: 1 } }],
  wishlist: [{ type: oid, ref: 'Product' }],
}, { timestamps: true }));

const productSchema = new Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, min: 0 },
  category: { type: String, index: true },
  images: [String], sizes: [String], colors: [String],
  stock: { type: Number, default: 0, min: 0 },
  sku: { type: String, unique: true },
  featured: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
}, { timestamps: true });
productSchema.index({ name: 'text' });
export const Product = model('Product', productSchema);

export const Order = model('Order', new Schema({
  user: { type: oid, ref: 'User', required: true, index: true },
  items: [{ product: { type: oid, ref: 'Product' }, name: String, image: String, price: Number, qty: Number, size: String, color: String }],
  address: { name: String, phone: String, line: String, city: String, pincode: String },
  subtotal: Number, discount: Number, shipping: Number, total: Number, coupon: String,
  paymentMethod: { type: String, default: 'COD' },
  status: { type: String, enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
}, { timestamps: true }));

export const Coupon = model('Coupon', new Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  percent: { type: Number, min: 1, max: 90, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true }));
