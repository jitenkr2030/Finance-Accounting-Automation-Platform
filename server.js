const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');
const winston = require('winston');

// Load environment variables
dotenv.config();

// Import database configuration
const { sequelize } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const ledgerRoutes = require('./routes/ledger');
const gstRoutes = require('./routes/gst');
const auditRoutes = require('./routes/audit');
const reportingRoutes = require('./routes/reporting');
const billingRoutes = require('./routes/billing');
const payrollRoutes = require('./routes/payroll');
const expenseRoutes = require('./routes/expense');
const bankRoutes = require('./routes/bank');
const vendorRoutes = require('./routes/vendor');
const inventoryRoutes = require('./routes/inventory');
const tdsRoutes = require('./routes/tds');
const assetsRoutes = require('./routes/assets');
const consolidationRoutes = require('./routes/consolidation');
const budgetingRoutes = require('./routes/budgeting');
const cashflowRoutes = require('./routes/cashflow');
const documentRoutes = require('./routes/document');
const complianceRoutes = require('./routes/compliance');
const auditTrailRoutes = require('./routes/auditTrail');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const paymentsRoutes = require('./routes/payments');
const integrationRoutes = require('./routes/integration');

// Import middleware
const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/errorHandler');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'finance-platform' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Create uploads directory if it doesn't exist
const fs = require('fs');
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Static files
app.use('/uploads', express.static(uploadsDir));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/ledger', authMiddleware, ledgerRoutes);
app.use('/api/gst', authMiddleware, gstRoutes);
app.use('/api/audit', authMiddleware, auditRoutes);
app.use('/api/reporting', authMiddleware, reportingRoutes);
app.use('/api/billing', authMiddleware, billingRoutes);
app.use('/api/payroll', authMiddleware, payrollRoutes);
app.use('/api/expense', authMiddleware, expenseRoutes);
app.use('/api/bank', authMiddleware, bankRoutes);
app.use('/api/vendor', authMiddleware, vendorRoutes);
app.use('/api/inventory', authMiddleware, inventoryRoutes);
app.use('/api/tds', authMiddleware, tdsRoutes);
app.use('/api/assets', authMiddleware, assetsRoutes);
app.use('/api/consolidation', authMiddleware, consolidationRoutes);
app.use('/api/budgeting', authMiddleware, budgetingRoutes);
app.use('/api/cashflow', authMiddleware, cashflowRoutes);
app.use('/api/document', authMiddleware, documentRoutes);
app.use('/api/compliance', authMiddleware, complianceRoutes);
app.use('/api/audit-trail', authMiddleware, auditTrailRoutes);
app.use('/api/analytics', authMiddleware, analyticsRoutes);
app.use('/api/ai', authMiddleware, aiRoutes);
app.use('/api/payments', authMiddleware, paymentsRoutes);
app.use('/api/integration', authMiddleware, integrationRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Database sync and server start
const startServer = async () => {
  try {
    // Sync database models
    await sequelize.sync({ force: false, logging: false });
    logger.info('Database synchronized successfully');

    // Start server
    app.listen(PORT, () => {
      logger.info(`🚀 Finance Automation Platform server running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔐 JWT Secret configured: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully');
  await sequelize.close();
  process.exit(0);
});

startServer();