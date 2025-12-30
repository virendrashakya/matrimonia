require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const passport = require('./config/passport');

const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profiles');
const uploadRoutes = require('./routes/upload');
const adminRoutes = require('./routes/admin');
const searchRoutes = require('./routes/search');
const importRoutes = require('./routes/import');
const configRoutes = require('./routes/config');
const userRoutes = require('./routes/user');
const interestRoutes = require('./routes/interest');
const notificationRoutes = require('./routes/notifications');
const analyticsRoutes = require('./routes/analytics');
const accessRoutes = require('./routes/access');

const app = express();

// ======================
// DETAILED LOGGING - DEV
// ======================

// Intercept response body for logging
app.use((req, res, next) => {
  const start = Date.now();

  // Store original json method
  const originalJson = res.json.bind(res);

  // Capture request details
  const reqLog = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent')?.substring(0, 50),
  };

  // Override json method to capture response
  res.json = (body) => {
    const duration = Date.now() - start;
    const isError = res.statusCode >= 400;

    // Log request
    console.log('\n' + '='.repeat(60));
    console.log(`${isError ? '❌' : '✅'} ${req.method} ${req.url} → ${res.statusCode} (${duration}ms)`);
    console.log('='.repeat(60));

    // Request details
    console.log('\n📥 REQUEST:');
    console.log(`   Time: ${reqLog.timestamp}`);
    console.log(`   IP: ${reqLog.ip}`);
    if (reqLog.query) console.log(`   Query: ${JSON.stringify(reqLog.query)}`);

    // Log request body (hide sensitive data)
    if (req.body && Object.keys(req.body).length > 0) {
      const safeBody = { ...req.body };
      if (safeBody.password) safeBody.password = '***HIDDEN***';
      if (safeBody.passwordHash) safeBody.passwordHash = '***HIDDEN***';
      console.log(`   Body: ${JSON.stringify(safeBody, null, 2).substring(0, 500)}`);
    }

    // Log response
    console.log('\n📤 RESPONSE:');
    console.log(`   Status: ${res.statusCode}`);
    console.log(`   Duration: ${duration}ms`);

    // Log response body (always show for errors, truncate for success)
    if (body) {
      const bodyStr = JSON.stringify(body, null, 2);
      if (isError) {
        console.log(`   Body: ${bodyStr}`);
      } else {
        console.log(`   Body: ${bodyStr.substring(0, 300)}${bodyStr.length > 300 ? '...' : ''}`);
      }
    }

    console.log('');

    // Call original json method
    return originalJson(body);
  };

  next();
});

// ======================
// SECURITY MIDDLEWARE
// ======================
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  handler: (req, res, next, options) => {
    console.log(`\n⚠️ RATE LIMIT: ${req.ip} exceeded limit for ${req.method} ${req.url}`);
    res.status(options.statusCode).json(options.message);
  }
});
app.use(limiter);

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later' }
});

// Body parsing
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Security middleware
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss());           // Sanitize user input to prevent XSS
app.use(xss());           // Sanitize user input to prevent XSS
app.use(hpp());           // Prevent HTTP parameter pollution
app.use(passport.initialize());

// ======================
// ROUTES
// ======================
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/import', importRoutes);
app.use('/api/config', configRoutes);
app.use('/api/user', userRoutes);
app.use('/api/interests', interestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/access', accessRoutes);

// Health check (no logging needed)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use((req, res, next) => {
  console.log(`\n❓ 404 NOT FOUND: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.url,
    method: req.method,
    hint: 'Available routes start with /api/'
  });
});

// ======================
// ERROR HANDLING
// ======================
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();

  console.log('\n' + '!'.repeat(60));
  console.log(`🚨 ERROR in ${req.method} ${req.url}`);
  console.log('!'.repeat(60));
  console.log(`   Time: ${timestamp}`);
  console.log(`   User: ${req.user?._id || 'Not authenticated'}`);
  console.log(`   IP: ${req.ip}`);
  console.log(`   Error Name: ${err.name}`);
  console.log(`   Error Message: ${err.message}`);
  console.log(`   Stack:\n${err.stack}`);
  console.log('!'.repeat(60) + '\n');

  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message, type: 'ValidationError' });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token', type: 'UnauthorizedError' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format', type: 'CastError' });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message,
    type: err.name
  });
});

// ======================
// STARTUP
// ======================
const PORT = process.env.PORT || 3000;

console.log('\n' + '='.repeat(60));
console.log('🪔 PEHCHAN SERVER');
console.log('='.repeat(60));
console.log(`📅 Started: ${new Date().toISOString()}`);
console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔗 Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');

    // Log collection counts
    try {
      const db = mongoose.connection.db;
      const users = await db.collection('users').countDocuments();
      const profiles = await db.collection('profiles').countDocuments();
      console.log(`   Users: ${users}, Profiles: ${profiles}`);
    } catch (e) { }

    app.listen(PORT, () => {
      console.log(`\n🚀 Server: http://localhost:${PORT}`);
      console.log(`📡 API: http://localhost:${PORT}/api`);
      console.log('\n📋 Routes:');
      console.log('   POST /api/auth/register');
      console.log('   POST /api/auth/login');
      console.log('   GET  /api/profiles');
      console.log('   POST /api/profiles');
      console.log('   ... and more');
      console.log('='.repeat(60) + '\n');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB error:', err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  mongoose.connection.close(false).then(() => process.exit(0));
});

module.exports = app;
