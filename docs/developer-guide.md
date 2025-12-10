# Finance & Accounting Platform - Developer Guide

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Database Schema](#database-schema)
5. [API Development](#api-development)
6. [Frontend Development](#frontend-development)
7. [Testing Guidelines](#testing-guidelines)
8. [Security Implementation](#security-implementation)
9. [Performance Optimization](#performance-optimization)
10. [Deployment](#deployment)
11. [Contributing Guidelines](#contributing-guidelines)

---

## Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                        │
├─────────────────────────────────────────────────────────────┤
│  React/Next.js Frontend  │  REST API Client  │  Mobile Apps │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
├─────────────────────────────────────────────────────────────┤
│  Express.js Server  │  Authentication  │  Business Logic   │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│    MongoDB Database    │    Redis Cache    │   File Storage  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend**:
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Authentication**: JWT with bcrypt
- **File Processing**: Multer, Sharp
- **OCR**: Tesseract.js
- **PDF Generation**: PDFKit, Puppeteer

**Frontend**:
- **Framework**: Next.js 14 with React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Charts**: Recharts
- **UI Components**: Custom + Headless UI
- **Icons**: Lucide React

**Infrastructure**:
- **Containerization**: Docker & Docker Compose
- **Reverse Proxy**: Nginx
- **Process Management**: PM2
- **Database**: MongoDB
- **Monitoring**: Winston (logs), Sentry (errors)

---

## Development Setup

### Prerequisites

```bash
# Required software
Node.js >= 18.0.0
npm >= 9.0.0
MongoDB >= 6.0
Redis >= 6.0
Git
Docker & Docker Compose (optional)
```

### Local Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/your-org/finance-platform.git
cd finance-platform
```

#### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Update configuration
nano .env
```

#### 3. Install Dependencies
```bash
# Install all dependencies
npm run install:all

# Or install separately
npm install                    # Backend
cd client && npm install       # Frontend
```

#### 4. Database Setup
```bash
# Start MongoDB (if using Docker)
docker-compose up -d mongodb

# Or use local MongoDB
mongod

# Seed database with sample data
npm run seed
```

#### 5. Start Development Servers
```bash
# Start backend (port 5000)
npm run dev

# Start frontend (port 3000) in another terminal
cd client && npm run dev
```

### Docker Development Setup

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Project Structure

### Backend Structure
```
├── config/
│   └── database.js          # Database configuration
├── models/
│   ├── User.js              # User model
│   ├── Company.js           # Company model
│   ├── Ledger.js            # Accounting models
│   ├── Billing.js           # Billing models
│   ├── GST.js               # GST models
│   └── index.js             # Model exports
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── ledger.js            # Ledger routes
│   ├── billing.js           # Billing routes
│   ├── gst.js               # GST routes
│   └── index.js             # Route exports
├── middleware/
│   ├── auth.js              # Authentication middleware
│   ├── validation.js        # Request validation
│   ├── errorHandler.js      # Error handling
│   └── rateLimiter.js       # Rate limiting
├── utils/
│   ├── helpers.js           # Utility functions
│   ├── validators.js        # Input validators
│   └── constants.js         # Application constants
├── tests/
│   ├── setup.js             # Test configuration
│   ├── auth.test.js         # Authentication tests
│   ├── ledger.test.js       # Ledger tests
│   └── helpers/
│       └── TestHelpers.js   # Test utilities
├── uploads/                 # File uploads directory
├── logs/                    # Application logs
├── server.js                # Main server file
├── swagger.js               # API documentation
├── jest.config.js           # Test configuration
└── package.json             # Dependencies
```

### Frontend Structure
```
client/
├── app/                     # Next.js App Router
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── login/
│   │   └── page.tsx         # Login page
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard
│   ├── ledger/
│   │   └── page.tsx         # Ledger module
│   ├── billing/
│   │   └── page.tsx         # Billing module
│   ├── gst/
│   │   └── page.tsx         # GST module
│   └── components/          # Shared components
├── components/
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   ├── charts/              # Chart components
│   └── layout/              # Layout components
├── hooks/                   # Custom React hooks
├── lib/
│   ├── api.ts               # API client
│   ├── utils.ts             # Utility functions
│   └── types.ts             # TypeScript types
├── public/                  # Static assets
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── package.json             # Dependencies
```

---

## Database Schema

### Core Collections

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,              // Unique email
  password: String,           // Hashed password
  name: String,               // Full name
  role: String,               // admin, manager, accountant, user
  companyId: ObjectId,        // Reference to Company
  permissions: [String],      // Array of permissions
  isActive: Boolean,          // Account status
  lastLogin: Date,            // Last login timestamp
  createdAt: Date,
  updatedAt: Date
}
```

#### Companies Collection
```javascript
{
  _id: ObjectId,
  name: String,               // Company name
  email: String,              // Company email
  phone: String,              // Phone number
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  gstin: String,              // GST registration number
  pan: String,                // PAN number
  tan: String,                // TAN number
  cin: String,                // CIN number
  financialYearStart: Date,   // Financial year start
  baseCurrency: String,       // Default currency
  timezone: String,           // Company timezone
  settings: {
    dateFormat: String,
    numberFormat: String,
    theme: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Chart of Accounts
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,        // Reference to Company
  accountCode: String,        // Unique account code
  accountName: String,        // Account name
  accountType: String,        // Assets, Liabilities, Equity, Income, Expenses
  accountGroup: String,       // Account group/subtype
  parentAccount: ObjectId,    // Parent account (for hierarchy)
  openingBalance: Number,     // Opening balance
  currentBalance: Number,     // Current balance
  description: String,        // Account description
  isActive: Boolean,
  isSystemAccount: Boolean,   // System vs custom account
  createdBy: ObjectId,        // Reference to User
  createdAt: Date,
  updatedAt: Date
}
```

#### Journal Entries
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,
  entryNumber: String,        // Auto-generated entry number
  entryDate: Date,            // Transaction date
  description: String,        // Entry description
  reference: String,          // Reference number
  lineItems: [{
    accountId: ObjectId,      // Reference to Account
    description: String,      // Line item description
    debitAmount: Number,      // Debit amount
    creditAmount: Number,     // Credit amount
    costCenter: String,       // Cost center (optional)
    department: String        // Department (optional)
  }],
  totalDebit: Number,         // Sum of debits
  totalCredit: Number,        // Sum of credits
  status: String,             // draft, posted, reversed
  createdBy: ObjectId,
  postedBy: ObjectId,
  postedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Invoices Collection
```javascript
{
  _id: ObjectId,
  companyId: ObjectId,
  invoiceNumber: String,      // Unique invoice number
  invoiceDate: Date,          // Invoice date
  dueDate: Date,              // Due date
  customerId: ObjectId,       // Reference to Customer
  customerName: String,       // Customer name
  customerEmail: String,      // Customer email
  billingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  items: [{
    productId: ObjectId,      // Reference to Product
    productName: String,      // Product name
    description: String,      // Item description
    quantity: Number,         // Quantity
    rate: Number,             // Rate per unit
    discount: Number,         // Discount amount/percentage
    taxRate: Number,          // Tax rate percentage
    discountAmount: Number,   // Calculated discount amount
    taxAmount: Number,        // Calculated tax amount
    totalAmount: Number       // Line total
  }],
  subtotal: Number,           // Subtotal before tax
  discountAmount: Number,     // Total discount
  taxAmount: Number,          // Total tax
  totalAmount: Number,        // Final total
  payments: [{
    amount: Number,           // Payment amount
    paymentDate: Date,        // Payment date
    paymentMethod: String,    // Payment method
    referenceNumber: String,  // Payment reference
    notes: String            // Payment notes
  }],
  status: String,             // draft, sent, paid, overdue, cancelled
  notes: String,              // Invoice notes
  termsAndConditions: String, // Terms and conditions
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### Indexing Strategy

```javascript
// Users collection indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ companyId: 1 });
db.users.createIndex({ role: 1 });

// Chart of accounts indexes
db.chartofaccounts.createIndex({ companyId: 1, accountCode: 1 }, { unique: true });
db.chartofaccounts.createIndex({ companyId: 1, accountType: 1 });
db.chartofaccounts.createIndex({ companyId: 1, isActive: 1 });

// Journal entries indexes
db.journalentries.createIndex({ companyId: 1, entryNumber: 1 }, { unique: true });
db.journalentries.createIndex({ companyId: 1, entryDate: 1 });
db.journalentries.createIndex({ companyId: 1, status: 1 });
db.journalentries.createIndex({ "lineItems.accountId": 1 });

// Invoices indexes
db.invoices.createIndex({ companyId: 1, invoiceNumber: 1 }, { unique: true });
db.invoices.createIndex({ companyId: 1, invoiceDate: 1 });
db.invoices.createIndex({ companyId: 1, customerId: 1 });
db.invoices.createIndex({ companyId: 1, status: 1 });
db.invoices.createIndex({ customerEmail: 1 });
```

---

## API Development

### RESTful API Design

#### Base URL
```
Development: http://localhost:5000/api
Production: https://api.financeplatform.com/api
```

#### Authentication
```javascript
// Headers required for authenticated requests
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

#### Response Format
```javascript
// Success response
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      }
    ]
  }
}
```

### API Endpoints

#### Authentication Endpoints

```javascript
// POST /api/auth/register
{
  "companyName": "Test Company",
  "companyEmail": "admin@testcompany.com",
  "firstName": "Admin",
  "lastName": "User",
  "email": "admin@testcompany.com",
  "password": "SecurePassword123!",
  "phone": "+91-9876543210"
}

// POST /api/auth/login
{
  "email": "admin@testcompany.com",
  "password": "SecurePassword123!"
}

// GET /api/auth/profile
// Headers: Authorization: Bearer <token>

// PUT /api/auth/change-password
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword",
  "confirmPassword": "newpassword"
}
```

#### Ledger Endpoints

```javascript
// GET /api/ledger/accounts
// Query parameters: ?type=Assets&page=1&limit=10&search=cash
// Headers: Authorization: Bearer <token>

// POST /api/ledger/accounts
{
  "accountCode": "ASS001",
  "accountName": "Cash in Hand",
  "accountType": "Assets",
  "accountGroup": "Current Assets",
  "description": "Cash on hand"
}

// GET /api/ledger/accounts/:id
// Headers: Authorization: Bearer <token>

// PUT /api/ledger/accounts/:id
{
  "accountName": "Updated Account Name",
  "description": "Updated description"
}

// DELETE /api/ledger/accounts/:id
// Headers: Authorization: Bearer <token>

// GET /api/ledger/journal-entries
// Query parameters: ?status=posted&startDate=2024-01-01&endDate=2024-12-31

// POST /api/ledger/journal-entries
{
  "entryDate": "2024-12-09",
  "description": "Cash sales entry",
  "reference": "SALES-001",
  "lineItems": [
    {
      "accountId": "507f1f77bcf86cd799439011",
      "description": "Cash received",
      "debitAmount": 1000,
      "creditAmount": 0
    },
    {
      "accountId": "507f1f77bcf86cd799439012",
      "description": "Sales revenue",
      "debitAmount": 0,
      "creditAmount": 1000
    }
  ]
}

// PUT /api/ledger/journal-entries/:id/post
// Headers: Authorization: Bearer <token>

// GET /api/ledger/trial-balance
// Query parameters: ?asOfDate=2024-12-31
```

#### GST Endpoints

```javascript
// GET /api/gst/invoices
// Query parameters: ?customerGstin=29ABCDE1234F1Z5&startDate=2024-01-01&endDate=2024-12-31

// POST /api/gst/invoices
{
  "invoiceNumber": "GST001",
  "invoiceDate": "2024-12-09",
  "customerName": "Test Customer",
  "customerGstin": "29ABCDE1234F1Z5",
  "billingAddress": {
    "street": "123 Test St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "zipCode": "400001",
    "country": "India"
  },
  "items": [
    {
      "productName": "Test Product",
      "hsnCode": "1234",
      "quantity": 1,
      "rate": 1000,
      "taxRate": 18,
      "discount": 0
    }
  ],
  "placeOfSupply": "Maharashtra"
}

// POST /api/gst/invoices/:id/e-invoice
// Headers: Authorization: Bearer <token>

// POST /api/gst/invoices/:id/e-way-bill
{
  "transporterName": "Test Transport",
  "transporterId": "29ABCDE1234F1Z5",
  "vehicleNumber": "MH01AB1234",
  "distance": 150
}

// GET /api/gst/returns
// Query parameters: ?period=2024-08

// GET /api/gst/hsn-master
// Query parameters: ?search=computer&taxRate=18
```

### Middleware Implementation

#### Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: { code: 'NO_TOKEN', message: 'Access denied. No token provided.' }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid token.' }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: { code: 'TOKEN_ERROR', message: 'Invalid token.' }
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: { code: 'INSUFFICIENT_PERMISSIONS', message: 'Insufficient permissions.' }
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
```

#### Validation Middleware
```javascript
// middleware/validation.js
const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data',
        details: errors.array()
      }
    });
  }
  next();
};

const validateAccountCreation = [
  body('accountCode')
    .trim()
    .notEmpty()
    .withMessage('Account code is required')
    .isLength({ min: 1, max: 20 })
    .withMessage('Account code must be 1-20 characters'),
  
  body('accountName')
    .trim()
    .notEmpty()
    .withMessage('Account name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Account name must be 1-100 characters'),
  
  body('accountType')
    .isIn(['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'])
    .withMessage('Invalid account type'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateAccountCreation
};
```

### Error Handling

#### Global Error Handler
```javascript
// middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors
      }
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      success: false,
      error: {
        code: 'DUPLICATE_ERROR',
        message: `${field} already exists`
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid token'
      }
    });
  }

  // Default server error
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error'
    }
  });
};

module.exports = errorHandler;
```

---

## Frontend Development

### Component Architecture

#### Layout Components
```typescript
// components/layout/Header.tsx
import React from 'react';
import { Bell, Settings, User } from 'lucide-react';

interface HeaderProps {
  user: {
    name: string;
    role: string;
    avatar?: string;
  };
  onNotificationClick: () => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onNotificationClick,
  onSettingsClick,
  onProfileClick
}) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Finance Platform
          </h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={onNotificationClick}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Bell className="w-5 h-5" />
          </button>
          
          <button
            onClick={onSettingsClick}
            className="p-2 text-gray-400 hover:text-gray-600"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={onProfileClick}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900"
          >
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">{user.name}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
```

#### Form Components
```typescript
// components/forms/InputField.tsx
import React from 'react';
import { ErrorMessage } from './ErrorMessage';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  placeholder,
  disabled = false
}) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          block w-full px-3 py-2 border rounded-md shadow-sm
          focus:outline-none focus:ring-blue-500 focus:border-blue-500
          ${error ? 'border-red-300' : 'border-gray-300'}
          ${disabled ? 'bg-gray-100' : 'bg-white'}
        `}
      />
      
      {error && <ErrorMessage message={error} />}
    </div>
  );
};
```

#### Chart Components
```typescript
// components/charts/RevenueChart.tsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface RevenueData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  title?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  title = 'Revenue Overview'
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip
              formatter={(value: number, name: string) => [
                `₹${value.toLocaleString()}`,
                name.charAt(0).toUpperCase() + name.slice(1)
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              strokeWidth={2}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#EF4444"
              strokeWidth={2}
              name="Expenses"
            />
            <Line
              type="monotone"
              dataKey="profit"
              stroke="#10B981"
              strokeWidth={2}
              name="Profit"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
```

### State Management

#### Context Provider
```typescript
// hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await api.get('/auth/profile');
        setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user: userData } = response.data.data;
    
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...userData } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
```

### API Client
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error.response?.data || error.message);
  }
);

export { api };
```

---

## Testing Guidelines

### Unit Testing

#### Test Structure
```javascript
// tests/models/User.test.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../models/User');

describe('User Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_DATABASE_URL);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  describe('User Validation', () => {
    it('should create a valid user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
        companyId: new mongoose.Types.ObjectId()
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.name).toBe(userData.name);
      expect(await bcrypt.compare('password123', savedUser.password)).toBe(true);
    });

    it('should require email', async () => {
      const user = new User({
        password: 'password123',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow('Email is required');
    });

    it('should validate email format', async () => {
      const user = new User({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      });

      await expect(user.save()).rejects.toThrow('Invalid email format');
    });
  });
});
```

#### API Testing
```javascript
// tests/integration/auth.test.js
const request = require('supertest');
const app = require('../../server');

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        companyName: 'Test Company',
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

### Test Coverage Goals

- **Unit Tests**: 80% code coverage minimum
- **Integration Tests**: All API endpoints tested
- **E2E Tests**: Critical user journeys covered

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test auth.test.js

# Run tests matching pattern
npm test -- --testNamePattern="User Model"
```

---

## Security Implementation

### Authentication Security

#### Password Hashing
```javascript
// utils/security.js
const bcrypt = require('bcryptjs');

const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

const generateSecurePassword = () => {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateSecurePassword
};
```

#### JWT Security
```javascript
// utils/jwt.js
const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
};

module.exports = {
  generateToken,
  verifyToken,
  generateRefreshToken
};
```

### Data Protection

#### Input Sanitization
```javascript
// middleware/sanitization.js
const DOMPurify = require('isomorphic-dompurify');

const sanitizeInput = (req, res, next) => {
  // Sanitize request body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = DOMPurify.sanitize(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = DOMPurify.sanitize(req.query[key]);
      }
    });
  }

  next();
};

module.exports = { sanitizeInput };
```

#### SQL Injection Prevention
```javascript
// Using Mongoose (NoSQL) - Still validate inputs
const mongoose = require('mongoose');

const validateObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error('Invalid ID format');
  }
  return new mongoose.Types.ObjectId(id);
};

// For any dynamic queries, use Mongoose's built-in protection
const findUser = async (companyId, searchTerm) => {
  // This is safe from injection attacks
  return await User.find({
    companyId: validateObjectId(companyId),
    $or: [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } }
    ]
  });
};
```

### Rate Limiting

```javascript
// middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message
      }
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message
        }
      });
    }
  });
};

// Different limiters for different endpoints
const authLimiter = createRateLimiter(15 * 60 * 1000, 5, 'Too many authentication attempts');
const apiLimiter = createRateLimiter(15 * 60 * 1000, 100, 'Too many API requests');
const uploadLimiter = createRateLimiter(60 * 60 * 1000, 10, 'Too many file uploads');

module.exports = {
  authLimiter,
  apiLimiter,
  uploadLimiter
};
```

### CORS Configuration

```javascript
// middleware/cors.js
const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'https://financeplatform.com',
      'https://app.financeplatform.com'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Access-Token',
    'X-Key'
  ]
};

module.exports = { corsOptions };
```

---

## Performance Optimization

### Database Optimization

#### Indexing Strategy
```javascript
// Add compound indexes for common queries
db.users.createIndex({ companyId: 1, role: 1, isActive: 1 });
db.invoices.createIndex({ companyId: 1, status: 1, invoiceDate: -1 });
db.journalentries.createIndex({ companyId: 1, entryDate: -1, status: 1 });

// Add text indexes for search
db.invoices.createIndex({
  customerName: 'text',
  invoiceNumber: 'text',
  'items.productName': 'text'
});
```

#### Query Optimization
```javascript
// Optimized aggregation pipeline
const getTrialBalance = async (companyId, asOfDate) => {
  return await JournalEntry.aggregate([
    {
      $match: {
        companyId: mongoose.Types.ObjectId(companyId),
        status: 'posted',
        entryDate: { $lte: new Date(asOfDate) }
      }
    },
    { $unwind: '$lineItems' },
    {
      $lookup: {
        from: 'chartofaccounts',
        localField: 'lineItems.accountId',
        foreignField: '_id',
        as: 'account'
      }
    },
    { $unwind: '$account' },
    {
      $group: {
        _id: '$account.accountCode',
        accountName: { $first: '$account.accountName' },
        accountType: { $first: '$account.accountType' },
        totalDebit: { $sum: '$lineItems.debitAmount' },
        totalCredit: { $sum: '$lineItems.creditAmount' }
      }
    },
    {
      $addFields: {
        balance: { $subtract: ['$totalDebit', '$totalCredit'] }
      }
    },
    { $sort: { accountType: 1, accountName: 1 } }
  ]);
};
```

### Caching Strategy

#### Redis Caching
```javascript
// middleware/cache.js
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});

const cache = {
  get: async (key) => {
    try {
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  },

  set: async (key, data, expiry = 3600) => {
    try {
      await client.setEx(key, expiry, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  },

  del: async (key) => {
    try {
      await client.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
};

// Usage in routes
const getCachedTrialBalance = async (req, res) => {
  const { companyId } = req.user;
  const cacheKey = `trial_balance:${companyId}:${req.query.asOfDate || 'current'}`;
  
  let data = await cache.get(cacheKey);
  
  if (!data) {
    data = await getTrialBalance(companyId, req.query.asOfDate);
    await cache.set(cacheKey, data, 1800); // Cache for 30 minutes
  }
  
  res.json({ success: true, data });
};
```

### File Upload Optimization

```javascript
// middleware/upload.js
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file) return next();
  
  try {
    const processedImage = await sharp(req.file.buffer)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    req.file.buffer = processedImage;
    req.file.size = processedImage.length;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, processImage };
```

---

## Deployment

### Docker Configuration

#### Dockerfile (Backend)
```dockerfile
# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership of the app directory
RUN chown -R nextjs:nodejs /app
USER nextjs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Dockerfile (Frontend)
```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Change ownership
RUN chown -R nextjs:nodejs /app
USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV NODE_ENV production

CMD ["npm", "start"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    container_name: finance-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: finance_platform
    volumes:
      - mongodb_data:/data/db
      - ./mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    ports:
      - "27017:27017"
    networks:
      - finance-network

  redis:
    image: redis:7-alpine
    container_name: finance-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    networks:
      - finance-network

  backend:
    build: .
    container_name: finance-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: mongodb://admin:password123@mongodb:27017/finance_platform?authSource=admin
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
      - redis
    networks:
      - finance-network

  frontend:
    build: ./client
    container_name: finance-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 3000
      NEXT_PUBLIC_API_URL: http://backend:5000/api
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - finance-network

  nginx:
    image: nginx:alpine
    container_name: finance-nginx
    restart: unless-stopped
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - frontend
      - backend
    networks:
      - finance-network

volumes:
  mongodb_data:
  redis_data:

networks:
  finance-network:
    driver: bridge
```

### Production Deployment

#### Environment Variables
```bash
# Production .env
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb://username:password@production-mongo:27017/finance_platform
REDIS_URL=redis://username:password@production-redis:6379

# Security
JWT_SECRET=your-super-secure-jwt-secret-256-bits
JWT_REFRESH_SECRET=your-refresh-secret-256-bits

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@financeplatform.com

# File Storage
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=finance-platform-uploads

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-api-key
```

#### Deployment Script
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Build and tag images
echo "📦 Building Docker images..."
docker-compose build --no-cache

# Run database migrations
echo "🗄️ Running database migrations..."
docker-compose run --rm backend npm run migrate

# Seed database if needed
echo "🌱 Seeding database..."
docker-compose run --rm backend npm run seed:prod

# Start services
echo "▶️ Starting services..."
docker-compose up -d

# Health check
echo "🔍 Performing health check..."
sleep 30
curl -f http://localhost/health || exit 1

echo "✅ Deployment completed successfully!"

# Cleanup old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "🎉 All done!"
```

---

## Contributing Guidelines

### Code Style

#### JavaScript/Node.js
- Use ESLint configuration provided
- Follow Prettier formatting
- Use async/await instead of callbacks
- Use meaningful variable and function names
- Add JSDoc comments for functions

#### TypeScript
- Enable strict mode in tsconfig.json
- Use interfaces for type definitions
- Avoid using `any` type
- Use proper error handling

### Git Workflow

#### Branch Naming
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `hotfix/description` - Critical fixes
- `refactor/description` - Code refactoring

#### Commit Messages
```
type(scope): subject

body

footer
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Build process or auxiliary tool changes

Example:
```
feat(auth): add two-factor authentication

Implement TOTP-based 2FA for user authentication.
- Add TOTP secret generation
- Implement QR code display
- Add backup codes feature

Closes #123
```

### Pull Request Process

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Write/update tests**
5. **Ensure all tests pass**
6. **Update documentation**
7. **Submit pull request**

#### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated

## Screenshots (if applicable)
Add screenshots for UI changes
```

### Code Review Guidelines

#### For Reviewers
- Review code for functionality, style, and security
- Provide constructive feedback
- Test the changes locally if possible
- Approve or request changes

#### For Contributors
- Address all review comments
- Respond to feedback promptly
- Keep PR scope focused
- Update tests and documentation

### Release Process

#### Version Numbering
Follow Semantic Versioning (SemVer):
- `MAJOR.MINOR.PATCH`
- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

#### Release Steps
1. Update version in package.json
2. Update CHANGELOG.md
3. Create release branch
4. Run full test suite
5. Create release PR
6. Tag release in Git
7. Deploy to production

---

*This developer guide is maintained by the development team. For questions or suggestions, please create an issue in the repository.*