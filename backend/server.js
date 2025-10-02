const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const userRoutes = require('./routes/users');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'your-frontend-domain.com' : 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Basic rate limiting to protect APIs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing & cookies
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection
const startDatabase = async () => {
  try {
    let mongoUri = process.env.MONGODB_URI;

    // Build URI if not provided but parts exist
    if (!mongoUri && process.env.MONGO_USER && process.env.MONGO_PASS && process.env.MONGO_HOST) {
      // URL-encode password to handle special characters
      const user = encodeURIComponent(process.env.MONGO_USER);
      const pass = encodeURIComponent(process.env.MONGO_PASS);
      const host = process.env.MONGO_HOST;
      const db = process.env.DB_NAME || 'app';
      mongoUri = `mongodb+srv://${user}:${pass}@${host}/${db}?retryWrites=true&w=majority`;
    }

    // Try to connect to provided MongoDB URI first
    if (mongoUri) {
      try {
        await mongoose.connect(mongoUri);
        console.log('✅ MongoDB connected successfully');
        return;
      } catch (err) {
        console.log('⚠️ Primary MongoDB connection failed:', err.message);
      }
    }

    // Fallback to in-memory MongoDB for development only
    if (process.env.NODE_ENV !== 'production') {
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected successfully (In-Memory for Dev)');
      console.log('📝 Note: Using in-memory database - data will not persist after restart');
      return;
    }

    throw new Error('No valid MongoDB connection could be established');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    process.exit(1);
  }
};

startDatabase();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});

module.exports = app;