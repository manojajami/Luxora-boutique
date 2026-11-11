import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Product, Order, Coupon } from '../models/index.js';
import { protect, admin } from '../middleware/auth.js';

const r = Router();
const ah = fn => (req, res, next) => fn(req, res, next).catch(next); // async error wrapper
const setCookie = (res, u) => res.cookie('token', jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 7 * 864e5 });
const pub = u => ({ id: u._id, name: u.name, email: u.email, role: u.role });

/* ---------- AUTH ---------- */
r.post('/auth/register', ah(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !/\S+@\S+\.\S+/.test(email || '') || (password || '').length < 6)
    return res.status(400).json({ message: 'Name, valid email and 6+ character password required' });
  if (await User.findOne({ email: email.toLowerCase() })) return res.status(409).json({ message: 'Email already registered' });
  const u = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  setCookie(res, u); res.status(201).json({ user: pub(u) });
}));
r.post('/auth/login', ah(async (req, res) => {
  const u = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (!u || !(await bcrypt.compare(req.body.password || '', u.password))) return res.status(401).json({ message: 'Invalid email or password' });
  setCookie(res, u); res.json({ user: pub(u) });
}));
r.post('/auth/logout', (req, res) => { res.clearCookie('token'); res.json({ ok: true }); });
r.get('/auth/me', protect, ah(async (req, res) => {
  const u = await User.findById(req.user._id).populate('cart.product');
  res.json({ user: pub(u), cart: u.cart.filter(c => c.product), wishlist: u.wishlist });
}));
r.put('/auth/password', protect, ah(async (req, res) => {
  const { current, next } = req.body;
  if (!(await bcrypt.compare(current || '', req.user.password)) || (next || '').length < 6)
    return res.status(400).json({ message: 'Wrong current password or new password too short' });
  req.user.password = await bcrypt.hash(next, 10); await req.user.save(); res.json({ ok: true });
}));

/* ---------- PRODUCTS ---------- */
r.get('/products', ah(async (req, res) => {
  const { q, category, min, max, sort, size, color, featured, sale } = req.query;
  const f = {};
  if (q) f.name = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  if (category) f.category = category;
  if (size) f.sizes = size;
  if (color) f.colors = color;
  if (featured) f.featured = true;
  if (sale) f.discountPrice = { $gt: 0 };
  if (min || max) f.price = { ...(min && { $gte: +min }), ...(max && { $lte: +max }) };
  const order = { low: { price: 1 }, high: { price: -1 }, new: { createdAt: -1 } }[sort] || { featured: -1 };
  res.json(await Product.find(f).sort(order));
}));
r.get('/products/:id', ah(async (req, res) => {
  const p = await Product.findById(req.params.id);
  p ? res.json(p) : res.status(404).json({ message: 'Product not found' });
}));
r.post('/products', protect, admin, ah(async (req, res) => res.status(201).json(await Product.create(req.body))));
r.put('/products/:id', protect, admin, ah(async (req, res) => res.json(await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }))));
r.delete('/products/:id', protect, admin, ah(async (req, res) => { await Product.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

/* ---------- CART ---------- */
r.post('/cart', protect, ah(async (req, res) => {
  const { productId, size, color, qty = 1 } = req.body;
  const p = await Product.findById(productId);
  if (!p || p.stock < 1) return res.status(400).json({ message: 'Product unavailable' });
  const u = req.user;
  const item = u.cart.find(c => c.product.equals(productId) && c.size === size && c.color === color);
  item ? (item.qty = Math.min(item.qty + qty, p.stock)) : u.cart.push({ product: productId, size, color, qty });
  await u.save(); res.json({ ok: true });
}));
r.put('/cart/:id', protect, ah(async (req, res) => {
  const item = req.user.cart.id(req.params.id);
  if (item) item.qty = Math.max(1, +req.body.qty);
  await req.user.save(); res.json({ ok: true });
}));
r.delete('/cart/:id', protect, ah(async (req, res) => { req.user.cart.pull(req.params.id); await req.user.save(); res.json({ ok: true }); }));

/* ---------- WISHLIST ---------- */
r.get('/wishlist', protect, ah(async (req, res) => res.json((await User.findById(req.user._id).populate('wishlist')).wishlist)));
r.post('/wishlist', protect, ah(async (req, res) => { await User.updateOne({ _id: req.user._id }, { $addToSet: { wishlist: req.body.productId } }); res.json({ ok: true }); }));
r.delete('/wishlist/:productId', protect, ah(async (req, res) => { await User.updateOne({ _id: req.user._id }, { $pull: { wishlist: req.params.productId } }); res.json({ ok: true }); }));

/* ---------- COUPONS ---------- */
r.post('/coupons/validate', ah(async (req, res) => {
  const c = await Coupon.findOne({ code: (req.body.code || '').toUpperCase(), active: true });
  c ? res.json({ percent: c.percent }) : res.status(404).json({ message: 'Invalid coupon' });
}));

/* ---------- ORDERS (all prices calculated on the server) ---------- */
r.post('/orders', protect, ah(async (req, res) => {
  const u = await User.findById(req.user._id).populate('cart.product');
  if (!u.cart.length) return res.status(400).json({ message: 'Cart is empty' });
  const { address, couponCode } = req.body;
  if (!address?.name || !/^\d{10}$/.test(address.phone || '') || !address.line || !address.city || !/^\d{6}$/.test(address.pincode || ''))
    return res.status(400).json({ message: 'Complete address required (10-digit phone, 6-digit pincode)' });
  let subtotal = 0; const items = [];
  for (const c of u.cart) {
    const p = c.product;
    if (!p || p.stock < c.qty) return res.status(400).json({ message: `${p?.name || 'An item'} is out of stock` });
    const price = p.discountPrice || p.price;
    subtotal += price * c.qty;
    items.push({ product: p._id, name: p.name, image: p.images[0], price, qty: c.qty, size: c.size, color: c.color });
  }
  let discount = 0;
  if (couponCode) {
    const c = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
    if (!c) return res.status(400).json({ message: 'Invalid coupon' });
    discount = Math.round(subtotal * c.percent / 100);
  }
  const shipping = subtotal - discount >= 2999 ? 0 : 99;
  const order = await Order.create({ user: u._id, items, address, subtotal, discount, shipping, total: subtotal - discount + shipping, coupon: couponCode, paymentMethod: 'COD' });
  for (const i of items) await Product.updateOne({ _id: i.product }, { $inc: { stock: -i.qty } });
  u.cart = []; await u.save();
  res.status(201).json(order);
}));
r.get('/orders/my-orders', protect, ah(async (req, res) => res.json(await Order.find({ user: req.user._id }).sort({ createdAt: -1 }))));
r.put('/orders/:id/cancel', protect, ah(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!o) return res.status(404).json({ message: 'Order not found' });
  if (!['Pending', 'Confirmed'].includes(o.status)) return res.status(400).json({ message: 'Order can no longer be cancelled' });
  o.status = 'Cancelled'; await o.save();
  for (const i of o.items) await Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } });
  res.json(o);
}));

/* ---------- ADMIN ---------- */
r.get('/admin/dashboard', protect, admin, ah(async (req, res) => {
  const ok = { $match: { status: { $ne: 'Cancelled' } } };
  const [orders, users, products, revenue, monthly, lowStock] = await Promise.all([
    Order.countDocuments(), User.countDocuments({ role: 'user' }), Product.countDocuments(),
    Order.aggregate([ok, { $group: { _id: null, total: { $sum: '$total' } } }]),
    Order.aggregate([ok, { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, revenue: { $sum: '$total' } } }, { $sort: { _id: 1 } }]),
    Product.find({ stock: { $lt: 10 } }).select('name stock'),
  ]);
  res.json({ orders, users, products, revenue: revenue[0]?.total || 0, monthly, lowStock });
}));
r.get('/admin/orders', protect, admin, ah(async (req, res) => res.json(await Order.find().populate('user', 'name email').sort({ createdAt: -1 }))));
r.put('/admin/orders/:id/status', protect, admin, ah(async (req, res) => res.json(await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }))));
r.get('/admin/users', protect, admin, ah(async (req, res) => res.json(await User.find().select('-password -cart'))));
r.post('/admin/coupons', protect, admin, ah(async (req, res) => res.status(201).json(await Coupon.create(req.body))));

export default r;
