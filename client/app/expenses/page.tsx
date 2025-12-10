'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  TagIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  CreditCardIcon
} from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';

// Types
interface Expense {
  _id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  subcategory?: string;
  date: string;
  vendor: string;
  receipt?: {
    filename: string;
    url: string;
    ocrText?: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  submittedBy: {
    _id: string;
    name: string;
    email: string;
    department: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
    date: string;
  };
  reimbursement?: {
    method: 'bank_transfer' | 'cash' | 'cheque';
    reference: string;
    date: string;
    amount: number;
  };
  tags: string[];
  metadata: {
    project?: string;
    client?: string;
    costCenter?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface ExpenseCategory {
  _id: string;
  name: string;
  description: string;
  budget?: number;
  spent: number;
  color: string;
  icon: string;
  subcategories: string[];
  approvalRequired: boolean;
  maxAmount?: number;
}

interface ApprovalWorkflow {
  _id: string;
  name: string;
  steps: {
    order: number;
    approvers: Array<{
      _id: string;
      name: string;
      email: string;
      role: string;
    }>;
    conditions: {
      minAmount?: number;
      maxAmount?: number;
      categories?: string[];
    };
  }[];
  isActive: boolean;
}

// Sample data
const sampleExpenses: Expense[] = [
  {
    _id: '1',
    title: 'Business Lunch with Client',
    description: 'Lunch meeting with potential client at Taj Restaurant',
    amount: 2450,
    category: 'Meals & Entertainment',
    subcategory: 'Client Entertainment',
    date: '2024-12-08',
    vendor: 'Taj Restaurant',
    receipt: {
      filename: 'receipt_taj_restaurant.pdf '/uploads/re',
      url:ceipts/receipt_taj_restaurant.pdf',
      ocrText: 'Taj Restaurant | Invoice #1234 | Total: Rs. 2,450 | Date: 08/12/2024'
    },
    status: 'pending',
    submittedBy: {
      _id: 'user1',
      name: 'John Smith',
      email: 'john@company.com',
      department: 'Sales'
    },
    tags: ['client-meeting', 'business-development'],
    metadata: {
      project: 'Project Alpha',
      client: 'ABC Corp'
    },
    createdAt: '2024-12-08T10:30:00Z',
    updatedAt: '2024-12-08T10:30:00Z'
  },
  {
    _id: '2',
    title: 'Office Supplies Purchase',
    description: 'Stationery and printer supplies for Q4',
    amount: 1250,
    category: 'Office Supplies',
    subcategory: 'Stationery',
    date: '2024-12-07',
    vendor: 'Stationery Mart',
    status: 'approved',
    submittedBy: {
      _id: 'user2',
      name: 'Jane Doe',
      email: 'jane@company.com',
      department: 'Operations'
    },
    approvedBy: {
      _id: 'manager1',
      name: 'Robert Wilson',
      email: 'robert@company.com',
      date: '2024-12-07T14:20:00Z'
    },
    tags: ['office-supplies', 'q4'],
    metadata: {
      costCenter: 'Operations-001'
    },
    createdAt: '2024-12-07T09:15:00Z',
    updatedAt: '2024-12-07T14:20:00Z'
  },
  {
    _id: '3',
    title: 'Travel - Flight to Mumbai',
    description: 'Business trip to Mumbai for client meeting',
    amount: 15000,
    category: 'Travel',
    subcategory: 'Airfare',
    date: '2024-12-06',
    vendor: 'IndiGo Airlines',
    receipt: {
      filename: 'flight_ticket.pdf',
      url: '/uploads/receipts/flight_ticket.pdf',
      ocrText: 'IndiGo Flight 6E 123 | Mumbai-Delhi | Rs. 15,000 | 06/12/2024'
    },
    status: 'reimbursed',
    submittedBy: {
      _id: 'user1',
      name: 'John Smith',
      email: 'john@company.com',
      department: 'Sales'
    },
    approvedBy: {
      _id: 'manager1',
      name: 'Robert Wilson',
      email: 'robert@company.com',
      date: '2024-12-06T16:30:00Z'
    },
    reimbursement: {
      method: 'bank_transfer',
      reference: 'TXN123456789',
      date: '2024-12-08T10:00:00Z',
      amount: 15000
    },
    tags: ['travel', 'business-trip', 'client-meeting'],
    metadata: {
      project: 'Project Alpha',
      client: 'ABC Corp'
    },
    createdAt: '2024-12-06T12:00:00Z',
    updatedAt: '2024-12-08T10:00:00Z'
  }
];

const sampleCategories: ExpenseCategory[] = [
  {
    _id: '1',
    name: 'Travel',
    description: 'Business travel expenses',
    budget: 100000,
    spent: 45000,
    color: '#3B82F6',
    icon: '✈️',
    subcategories: ['Airfare', 'Hotels', 'Car Rentals', 'Local Transport'],
    approvalRequired: true,
    maxAmount: 50000
  },
  {
    _id: '2',
    name: 'Meals & Entertainment',
    description: 'Business meals and entertainment',
    budget: 50000,
    spent: 12500,
    color: '#10B981',
    icon: '🍽️',
    subcategories: ['Client Entertainment', 'Team Meals', 'Catering'],
    approvalRequired: true,
    maxAmount: 10000
  },
  {
    _id: '3',
    name: 'Office Supplies',
    description: 'Office stationery and supplies',
    budget: 25000,
    spent: 8500,
    color: '#8B5CF6',
    icon: '📎',
    subcategories: ['Stationery', 'Furniture', 'Equipment'],
    approvalRequired: false,
    maxAmount: 5000
  },
  {
    _id: '4',
    name: 'Technology',
    description: 'Software and hardware expenses',
    budget: 75000,
    spent: 32000,
    color: '#F59E0B',
    icon: '💻',
    subcategories: ['Software Licenses', 'Hardware', 'Cloud Services'],
    approvalRequired: true,
    maxAmount: 25000
  }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>(sampleExpenses);
  const [categories] = useState<ExpenseCategory[]>(sampleCategories);
  const [selectedView, setSelectedView] = useState<'list' | 'grid' | 'analytics'>('list');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showReceiptScanner, setShowReceiptScanner] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [dateRange, setDateRange] = useState('this-month');
  const [loading, setLoading] = useState(false);

  // Filter expenses
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || expense.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || expense.category === selectedCategory;
    
    // Date range filter
    const expenseDate = new Date(expense.date);
    const now = new Date();
    let matchesDate = true;
    
    switch (dateRange) {
      case 'this-week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        matchesDate = expenseDate >= weekAgo;
        break;
      case 'this-month':
        matchesDate = expenseDate.getMonth() === now.getMonth() && 
                     expenseDate.getFullYear() === now.getFullYear();
        break;
      case 'this-quarter':
        const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        matchesDate = expenseDate >= quarterStart;
        break;
      case 'this-year':
        matchesDate = expenseDate.getFullYear() === now.getFullYear();
        break;
    }
    
    return matchesSearch && matchesStatus && matchesCategory && matchesDate;
  });

  // Analytics data
  const categoryData = categories.map(cat => ({
    name: cat.name,
    value: cat.spent,
    budget: cat.budget || 0,
    percentage: cat.budget ? (cat.spent / cat.budget) * 100 : 0
  }));

  const monthlyData = [
    { month: 'Jan', amount: 25000 },
    { month: 'Feb', amount: 32000 },
    { month: 'Mar', amount: 28000 },
    { month: 'Apr', amount: 45000 },
    { month: 'May', amount: 38000 },
    { month: 'Jun', amount: 42000 },
    { month: 'Jul', amount: 35000 },
    { month: 'Aug', amount: 41000 },
    { month: 'Sep', amount: 39000 },
    { month: 'Oct', amount: 44000 },
    { month: 'Nov', amount: 38000 },
    { month: 'Dec', amount: 41500 }
  ];

  const statusData = [
    { name: 'Pending', value: expenses.filter(e => e.status === 'pending').length, color: '#F59E0B' },
    { name: 'Approved', value: expenses.filter(e => e.status === 'approved').length, color: '#10B981' },
    { name: 'Rejected', value: expenses.filter(e => e.status === 'rejected').length, color: '#EF4444' },
    { name: 'Reimbursed', value: expenses.filter(e => e.status === 'reimbursed').length, color: '#3B82F6' }
  ];

  // Status statistics
  const statusStats = {
    total: expenses.length,
    pending: expenses.filter(e => e.status === 'pending').length,
    approved: expenses.filter(e => e.status === 'approved').length,
    rejected: expenses.filter(e => e.status === 'rejected').length,
    reimbursed: expenses.filter(e => e.status === 'reimbursed').length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0),
    pendingAmount: expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)
  };

  const handleStatusChange = (expenseId: string, newStatus: Expense['status']) => {
    setExpenses(prev => prev.map(expense => 
      expense._id === expenseId 
        ? { ...expense, status: newStatus, updatedAt: new Date().toISOString() }
        : expense
    ));
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(expense => expense._id !== expenseId));
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate OCR processing
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        // In a real app, you'd upload to server and get OCR results
        alert(`Receipt uploaded: ${file.name}\nOCR processing would extract vendor, amount, and date from this receipt.`);
      }, 2000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon className="h-4 w-4 text-amber-500" />;
      case 'approved': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircleIcon className="h-4 w-4 text-red-500" />;
      case 'reimbursed': return <BanknotesIcon className="h-4 w-4 text-blue-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'reimbursed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Expense Management</h1>
              <p className="text-gray-600">Track, approve, and manage business expenses with intelligent automation</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowReceiptScanner(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CameraIcon className="h-5 w-5 mr-2 text-blue-600" />
                Scan Receipt
              </button>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Expense
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-gray-900">{statusStats.total}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DocumentTextIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{formatCurrency(statusStats.totalAmount)}</span>
                  <span className="ml-1">total value</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-amber-600">{statusStats.pending}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-amber-600">{formatCurrency(statusStats.pendingAmount)}</span>
                  <span className="ml-1">awaiting approval</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{statusStats.approved}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-green-600">✓</span>
                  <span className="ml-1">ready for reimbursement</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Reimbursed</p>
                  <p className="text-2xl font-bold text-blue-600">{statusStats.reimbursed}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-blue-600">✓</span>
                  <span className="ml-1">processed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="reimbursed">Reimbursed</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category._id} value={category.name}>{category.name}</option>
                ))}
              </select>

              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="this-week">This Week</option>
                <option value="this-month">This Month</option>
                <option value="this-quarter">This Quarter</option>
                <option value="this-year">This Year</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView('list')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  List
                </button>
                <button
                  onClick={() => setSelectedView('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setSelectedView('analytics')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Analytics
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedView === 'analytics' ? (
          <div className="space-y-8">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Monthly Trend */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Expense Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value as number), 'Amount']} />
                    <Area type="monotone" dataKey="amount" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Category Distribution */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Category Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, percentage }) => `${name} ${percentage.toFixed(1)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Budget vs Actual */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget vs Actual Spending</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="budget" fill="#E5E7EB" name="Budget" />
                  <Bar dataKey="value" fill="#3B82F6" name="Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Status Overview */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Expense Status Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {statusData.map((status, index) => (
                  <div key={status.name} className="text-center">
                    <div className="relative w-24 h-24 mx-auto mb-4">
                      <svg className="w-24 h-24 transform -rotate-90">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#E5E7EB"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke={status.color}
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(status.value / Math.max(...statusData.map(s => s.value))) * 251.2} 251.2`}
                          className="transition-all duration-300"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-sm font-semibold text-gray-900">{status.value}</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-600">{status.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExpenses.map((expense) => (
              <div key={expense._id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{expense.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{expense.vendor}</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(expense.status)}
                      <span className="capitalize">{expense.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <TagIcon className="h-4 w-4 mr-2" />
                    <span>{expense.category}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    <span>{formatDate(expense.date)}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserGroupIcon className="h-4 w-4 mr-2" />
                    <span>{expense.submittedBy.name}</span>
                  </div>
                </div>

                {expense.receipt && (
                  <div className="flex items-center text-sm text-blue-600 mb-4">
                    <DocumentIcon className="h-4 w-4 mr-2" />
                    <span>Receipt attached</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedExpense(expense)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {expense.status === 'pending' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleStatusChange(expense._id, 'approved')}
                        className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusChange(expense._id, 'rejected')}
                        className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{expense.title}</div>
                          <div className="text-sm text-gray-600">{expense.vendor}</div>
                          {expense.receipt && (
                            <div className="flex items-center mt-1 text-xs text-blue-600">
                              <DocumentIcon className="h-3 w-3 mr-1" />
                              <span>Receipt attached</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{expense.category}</div>
                        {expense.subcategory && (
                          <div className="text-xs text-gray-600">{expense.subcategory}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(expense.amount)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(expense.status)}`}>
                          {getStatusIcon(expense.status)}
                          <span className="ml-1 capitalize">{expense.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(expense.date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedExpense(expense)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:text-red-600 transition-colors">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          {expense.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(expense._id, 'approved')}
                                className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleStatusChange(expense._id, 'rejected')}
                                className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No expenses found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating a new expense.'}
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedCategory === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Expense
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {showAddExpense && (
        <AddExpenseModal
          onClose={() => setShowAddExpense(false)}
          onSubmit={(expenseData) => {
            const newExpense: Expense = {
              _id: Date.now().toString(),
              ...expenseData,
              status: 'pending',
              submittedBy: {
                _id: 'current-user',
                name: 'Current User',
                email: 'user@company.com',
                department: 'General'
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setExpenses(prev => [newExpense, ...prev]);
            setShowAddExpense(false);
          }}
          categories={categories}
        />
      )}

      {showReceiptScanner && (
        <ReceiptScannerModal
          onClose={() => setShowReceiptScanner(false)}
          onUpload={handleReceiptUpload}
          loading={loading}
        />
      )}

      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          onClose={() => setSelectedExpense(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// Add Expense Modal Component
interface AddExpenseModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Expense>) => void;
  categories: ExpenseCategory[];
}

function AddExpenseModal({ onClose, onSubmit, categories }: AddExpenseModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    category: '',
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    tags: '',
    project: '',
    client: '',
    costCenter: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      metadata: {
        project: formData.project,
        client: formData.client,
        costCenter: formData.costCenter
      }
    });
  };

  const selectedCategory = categories.find(cat => cat.name === formData.category);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Expense</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter expense title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹)</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value, subcategory: '' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
                <select
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select subcategory</option>
                  {selectedCategory?.subcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Vendor</label>
                <input
                  type="text"
                  required
                  value={formData.vendor}
                  onChange={(e) => setFormData(prev => ({ ...prev, vendor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Vendor name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the expense..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
                <input
                  type="text"
                  value={formData.project}
                  onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cost Center</label>
                <input
                  type="text"
                  value={formData.costCenter}
                  onChange={(e) => setFormData(prev => ({ ...prev, costCenter: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tags separated by commas"
              />
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Expense
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Receipt Scanner Modal Component
interface ReceiptScannerModalProps {
  onClose: () => void;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  loading: boolean;
}

function ReceiptScannerModal({ onClose, onUpload, loading }: ReceiptScannerModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Scan Receipt</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="text-center">
            {loading ? (
              <div className="py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Processing receipt with OCR...</p>
              </div>
            ) : (
              <div>
                <div className="mx-auto w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <CameraIcon className="h-12 w-12 text-blue-600" />
                </div>
                <p className="text-gray-600 mb-6">
                  Upload a photo of your receipt and our AI will automatically extract the vendor, amount, and date.
                </p>
                <label className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer transition-colors">
                  <DocumentIcon className="h-5 w-5 mr-2" />
                  Choose File
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={onUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Expense Detail Modal Component
interface ExpenseDetailModalProps {
  expense: Expense;
  onClose: () => void;
  onStatusChange: (id: string, status: Expense['status']) => void;
}

function ExpenseDetailModal({ expense, onClose, onStatusChange }: ExpenseDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'reimbursed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Expense Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{expense.title}</h3>
                <p className="text-gray-600">{expense.vendor}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(expense.amount)}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(expense.status)}`}>
                <span className="capitalize">{expense.status}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{expense.category}</p>
                {expense.subcategory && (
                  <p className="text-sm text-gray-600">{expense.subcategory}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-gray-900">{formatDate(expense.date)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted By</label>
                <p className="text-gray-900">{expense.submittedBy.name}</p>
                <p className="text-sm text-gray-600">{expense.submittedBy.department}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <p className="text-gray-900">{expense.submittedBy._id}</p>
              </div>
            </div>

            {/* Description */}
            {expense.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-900">{expense.description}</p>
              </div>
            )}

            {/* Metadata */}
            {(expense.metadata.project || expense.metadata.client || expense.metadata.costCenter) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Project Information</label>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {expense.metadata.project && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Project:</span>
                      <span className="text-sm font-medium text-gray-900">{expense.metadata.project}</span>
                    </div>
                  )}
                  {expense.metadata.client && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Client:</span>
                      <span className="text-sm font-medium text-gray-900">{expense.metadata.client}</span>
                    </div>
                  )}
                  {expense.metadata.costCenter && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost Center:</span>
                      <span className="text-sm font-medium text-gray-900">{expense.metadata.costCenter}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {expense.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {expense.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Receipt */}
            {expense.receipt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Receipt</label>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{expense.receipt.filename}</p>
                      <p className="text-xs text-gray-600">OCR extracted text available</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      View Receipt
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Info */}
            {expense.approvedBy && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approval Information</label>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-green-900">Approved by {expense.approvedBy.name}</p>
                      <p className="text-xs text-green-700">{formatDate(expense.approvedBy.date)}</p>
                    </div>
                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            )}

            {/* Reimbursement Info */}
            {expense.reimbursement && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reimbursement Information</label>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-blue-700">Method</p>
                      <p className="font-medium text-blue-900 capitalize">{expense.reimbursement.method.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Reference</p>
                      <p className="font-medium text-blue-900">{expense.reimbursement.reference}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Amount</p>
                      <p className="font-medium text-blue-900">{formatCurrency(expense.reimbursement.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-700">Date</p>
                      <p className="font-medium text-blue-900">{formatDate(expense.reimbursement.date)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            {expense.status === 'pending' && (
              <div className="flex space-x-4 pt-6 border-t">
                <button
                  onClick={() => {
                    onStatusChange(expense._id, 'approved');
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve Expense
                </button>
                <button
                  onClick={() => {
                    onStatusChange(expense._id, 'rejected');
                    onClose();
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject Expense
                </button>
              </div>
            )}

            {expense.status === 'approved' && (
              <div className="flex space-x-4 pt-6 border-t">
                <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Process Reimbursement
                </button>
              </div>
            )}

            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}