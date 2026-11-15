import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const isProd = process.env.NODE_ENV === 'production';

app.set('trust proxy', 1);
app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);

// In production, serve the built React site from the same server
if (isProd) {
  const dist = path.join(__dirname, '../frontend/dist');
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.name === 'CastError' ? 400 : err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

const startServer = () => {
  app.listen(PORT, () => console.log(`LUXORA API running on port ${PORT}`));
};

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      startServer();
    })
    .catch(e => {
      console.error('MongoDB connection failed:', e.message);
      if (isProd) process.exit(1); // online, stop instead of running without a database
      startServer();
    });
} else {
  startServer();
}