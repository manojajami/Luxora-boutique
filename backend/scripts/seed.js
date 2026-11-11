import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User, Product, Coupon } from '../models/index.js';
import products from './products.js';

await mongoose.connect(process.env.MONGO_URI);
await Product.deleteMany({});
await Product.insertMany(products);
await Coupon.updateOne({ code: 'WELCOME10' }, { percent: 10, active: true }, { upsert: true });
if (!(await User.findOne({ email: process.env.ADMIN_EMAIL }))) {
  await User.create({ name: 'Admin', email: process.env.ADMIN_EMAIL, role: 'admin', password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10) });
  console.log('Admin created:', process.env.ADMIN_EMAIL);
}
console.log(`Seeded ${products.length} products and coupon WELCOME10`);
process.exit(0);
