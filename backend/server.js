import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({ origin: CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);

// Centralized error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.name === 'CastError' ? 400 : err.status || 500;
  res.status(status).json({ message: err.message || 'Server error' });
});

// Graceful database connection & server start
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
      console.warn('MongoDB connection failed (running in offline mode):', e.message);
      startServer();
    });
} else {
  startServer();
}
