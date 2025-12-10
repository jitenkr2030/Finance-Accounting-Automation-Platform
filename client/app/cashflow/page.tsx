'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  BanknotesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  ClockIcon,
  TagIcon,
  ListBulletIcon,
  Squares2X2Icon,
  CalendarDaysIcon as CalendarIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  LightBulbIcon,
  CogIcon,
  BeakerIcon,
  SparklesIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  WrenchScrewdriverIcon,
  BoltIcon,
  CreditCardIcon,
  HomeIcon
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
  AreaChart,
  ComposedChart,
  ScatterChart,
  Scatter,
  ReferenceLine,
  Legend,
  RadialBarChart,
  RadialBar
} from 'recharts';

// Types
interface CashflowItem {
  _id: string;
  date: string;
  type: 'inflow' | 'outflow';
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  account: string;
  reference: string;
  status: 'pending' | 'confirmed' | 'cleared';
  source: 'invoice' | 'payment' | 'transfer' | 'adjustment' | 'loan' | 'investment';
  recurring: boolean;
  recurringPattern?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    nextDate: string;
    endDate?: string;
  };
  tags: string[];
  metadata: {
    customer?: string;
    vendor?: string;
    project?: string;
    invoiceNumber?: string;
    paymentMethod?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CashflowForecast {
  _id: string;
  name: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  horizon: number; // days/weeks/months
  methodology: 'naive' | 'moving_average' | 'exponential' | 'linear_regression' | 'ml_model';
  confidence: number; // 0-100
  data: CashflowForecastPoint[];
  assumptions: CashflowAssumption[];
  accuracy: {
    mape: number;
    rmse: number;
    lastCalculated: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CashflowForecastPoint {
  date: string;
  predictedInflow: number;
  predictedOutflow: number;
  predictedNet: number;
  confidence: {
    lower: number;
    upper: number;
  };
  scenario?: 'optimistic' | 'realistic' | 'pessimistic';
}

interface CashflowAssumption {
  key: string;
  value: number | string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface CashflowAlert {
  _id: string;
  type: 'low_balance' | 'overdraft' | 'large_transaction' | 'unusual_pattern' | 'forecast_deviation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  amount?: number;
  date: string;
  status: 'active' | 'acknowledged' | 'resolved';
  actions: Array<{
    type: 'notify' | 'block' | 'require_approval' | 'auto_transfer';
    status: 'pending' | 'executed' | 'failed';
    timestamp?: string;
  }>;
}

interface CashflowMetric {
  name: string;
  value: number;
  target?: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number; // percentage
  status: 'good' | 'warning' | 'critical';
}

// Sample data
const sampleCashflowItems: CashflowItem[] = [
  {
    _id: '1',
    date: '2024-12-09',
    type: 'inflow',
    category: 'Revenue',
    subcategory: 'Sales',
    description: 'Payment from ABC Corp - Invoice #INV-2024-156',
    amount: 750000,
    account: 'Main Operating Account',
    reference: 'TXN-2024-1209-001',
    status: 'confirmed',
    source: 'invoice',
    recurring: false,
    tags: ['sales', 'accounts-receivable'],
    metadata: {
      customer: 'ABC Corp',
      invoiceNumber: 'INV-2024-156',
      paymentMethod: 'bank_transfer'
    },
    createdAt: '2024-12-08T10:30:00Z',
    updatedAt: '2024-12-09T09:15:00Z'
  },
  {
    _id: '2',
    date: '2024-12-09',
    type: 'outflow',
    category: 'Expenses',
    subcategory: 'Payroll',
    description: 'Monthly salary payment - December 2024',
    amount: 450000,
    account: 'Payroll Account',
    reference: 'PAY-2024-12-001',
    status: 'cleared',
    source: 'payment',
    recurring: true,
    recurringPattern: {
      frequency: 'monthly',
      nextDate: '2025-01-09',
      endDate: '2025-12-31'
    },
    tags: ['payroll', 'salaries', 'monthly'],
    metadata: {
      paymentMethod: 'bank_transfer'
    },
    createdAt: '2024-12-01T08:00:00Z',
    updatedAt: '2024-12-09T06:00:00Z'
  },
  {
    _id: '3',
    date: '2024-12-10',
    type: 'outflow',
    category: 'Operations',
    subcategory: 'Rent',
    description: 'Office rent payment - December 2024',
    amount: 120000,
    account: 'Main Operating Account',
    reference: 'RENT-2024-12-001',
    status: 'confirmed',
    source: 'payment',
    recurring: true,
    recurringPattern: {
      frequency: 'monthly',
      nextDate: '2025-01-10',
      endDate: '2025-12-31'
    },
    tags: ['rent', 'office', 'monthly'],
    metadata: {
      vendor: 'Real Estate Management LLC',
      paymentMethod: 'automatic_debit'
    },
    createdAt: '2024-11-10T12:00:00Z',
    updatedAt: '2024-12-08T14:30:00Z'
  },
  {
    _id: '4',
    date: '2024-12-11',
    type: 'inflow',
    category: 'Revenue',
    subcategory: 'Consulting',
    description: 'Consulting fee - Project Delta',
    amount: 300000,
    account: 'Main Operating Account',
    reference: 'TXN-2024-1209-002',
    status: 'pending',
    source: 'invoice',
    recurring: false,
    tags: ['consulting', 'project-delta'],
    metadata: {
      customer: 'Delta Technologies',
      invoiceNumber: 'INV-2024-157',
      paymentMethod: 'bank_transfer'
    },
    createdAt: '2024-12-08T16:45:00Z',
    updatedAt: '2024-12-09T09:15:00Z'
  },
  {
    _id: '5',
    date: '2024-12-15',
    type: 'outflow',
    category: 'Operations',
    subcategory: 'Utilities',
    description: 'Electricity bill payment',
    amount: 35000,
    account: 'Main Operating Account',
    reference: 'UTIL-2024-12-001',
    status: 'pending',
    source: 'payment',
    recurring: true,
    recurringPattern: {
      frequency: 'monthly',
      nextDate: '2025-01-15',
      endDate: '2025-12-31'
    },
    tags: ['utilities', 'electricity', 'monthly'],
    metadata: {
      vendor: 'City Electric Company',
      paymentMethod: 'automatic_debit'
    },
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-09T11:20:00Z'
  }
];

const sampleCashflowForecast: CashflowForecast = {
  _id: '1',
  name: '30-Day Cashflow Forecast',
  type: 'daily',
  horizon: 30,
  methodology: 'ml_model',
  confidence: 87.5,
  data: [
    { date: '2024-12-09', predictedInflow: 750000, predictedOutflow: 570000, predictedNet: 180000, confidence: { lower: 150000, upper: 210000 }, scenario: 'realistic' },
    { date: '2024-12-10', predictedInflow: 200000, predictedOutflow: 320000, predictedNet: -120000, confidence: { lower: -150000, upper: -90000 }, scenario: 'realistic' },
    { date: '2024-12-11', predictedInflow: 300000, predictedOutflow: 180000, predictedNet: 120000, confidence: { lower: 90000, upper: 150000 }, scenario: 'realistic' },
    { date: '2024-12-12', predictedInflow: 150000, predictedOutflow: 200000, predictedNet: -50000, confidence: { lower: -80000, upper: -20000 }, scenario: 'realistic' },
    { date: '2024-12-13', predictedInflow: 400000, predictedOutflow: 250000, predictedNet: 150000, confidence: { lower: 120000, upper: 180000 }, scenario: 'realistic' },
    { date: '2024-12-14', predictedInflow: 100000, predictedOutflow: 150000, predictedNet: -50000, confidence: { lower: -80000, upper: -20000 }, scenario: 'realistic' }
  ],
  assumptions: [
    { key: 'collection_period', value: 45, description: 'Average collection period (days)', impact: 'high' },
    { key: 'payment_terms', value: 30, description: 'Average payment terms (days)', impact: 'high' },
    { key: 'seasonal_factor', value: 1.15, description: 'December seasonal adjustment', impact: 'medium' }
  ],
  accuracy: {
    mape: 8.2,
    rmse: 25000,
    lastCalculated: '2024-12-09T08:00:00Z'
  },
  createdAt: '2024-12-08T08:00:00Z',
  updatedAt: '2024-12-09T08:00:00Z'
};

const sampleCashflowAlerts: CashflowAlert[] = [
  {
    _id: '1',
    type: 'low_balance',
    severity: 'medium',
    message: 'Main Operating Account balance below预警 threshold',
    amount: 500000,
    date: '2024-12-09T10:30:00Z',
    status: 'active',
    actions: [
      { type: 'notify', status: 'executed', timestamp: '2024-12-09T10:31:00Z' },
      { type: 'auto_transfer', status: 'pending' }
    ]
  },
  {
    _id: '2',
    type: 'large_transaction',
    severity: 'high',
    message: 'Large outflow detected: ₹750,000 payment to ABC Corp',
    amount: 750000,
    date: '2024-12-09T09:15:00Z',
    status: 'acknowledged',
    actions: [
      { type: 'notify', status: 'executed', timestamp: '2024-12-09T09:16:00Z' },
      { type: 'require_approval', status: 'pending' }
    ]
  }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export default function CashflowPage() {
  const [cashflowItems, setCashflowItems] = useState<CashflowItem[]>(sampleCashflowItems);
  const [forecast] = useState<CashflowForecast>(sampleCashflowForecast);
  const [alerts] = useState<CashflowAlert[]>(sampleCashflowAlerts);
  const [selectedView, setSelectedView] = useState<'dashboard' | 'forecast' | 'transactions' | 'analytics'>('dashboard');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  const [showForecast, setShowForecast] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<CashflowItem | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter transactions
  const filteredTransactions = cashflowItems.filter(item => {
    const matchesSearch = item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || item.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate metrics
  const currentBalance = 1250000; // Sample current balance
  const totalInflows = cashflowItems.filter(item => item.type === 'inflow').reduce((sum, item) => sum + item.amount, 0);
  const totalOutflows = cashflowItems.filter(item => item.type === 'outflow').reduce((sum, item) => sum + item.amount, 0);
  const netCashflow = totalInflows - totalOutflows;
  const pendingAmount = cashflowItems.filter(item => item.status === 'pending').reduce((sum, item) => sum + item.amount, 0);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' || alert.severity === 'high').length;

  const metrics: CashflowMetric[] = [
    {
      name: 'Current Balance',
      value: currentBalance,
      target: 1000000,
      unit: '₹',
      trend: 'up',
      change: 12.5,
      status: 'good'
    },
    {
      name: 'Net Cashflow (30d)',
      value: netCashflow,
      target: 500000,
      unit: '₹',
      trend: 'up',
      change: 8.3,
      status: 'good'
    },
    {
      name: 'Forecast Accuracy',
      value: forecast.accuracy.mape,
      target: 10,
      unit: '%',
      trend: 'down',
      change: -2.1,
      status: 'good'
    },
    {
      name: 'Pending Transactions',
      value: pendingAmount,
      target: 200000,
      unit: '₹',
      trend: 'stable',
      change: 0,
      status: 'warning'
    }
  ];

  // Analytics data
  const dailyCashflow = [
    { date: '2024-12-03', inflow: 450000, outflow: 320000, net: 130000 },
    { date: '2024-12-04', inflow: 380000, outflow: 410000, net: -30000 },
    { date: '2024-12-05', inflow: 520000, outflow: 280000, net: 240000 },
    { date: '2024-12-06', inflow: 600000, outflow: 350000, net: 250000 },
    { date: '2024-12-07', inflow: 420000, outflow: 480000, net: -60000 },
    { date: '2024-12-08', inflow: 750000, outflow: 570000, net: 180000 },
    { date: '2024-12-09', inflow: 1050000, outflow: 970000, net: 80000 }
  ];

  const categoryData = cashflowItems.reduce((acc, item) => {
    const existing = acc.find(cat => cat.name === item.category);
    if (existing) {
      if (item.type === 'inflow') {
        existing.inflow += item.amount;
      } else {
        existing.outflow += item.amount;
      }
    } else {
      acc.push({
        name: item.category,
        inflow: item.type === 'inflow' ? item.amount : 0,
        outflow: item.type === 'outflow' ? item.amount : 0,
        net: item.type === 'inflow' ? item.amount : -item.amount
      });
    }
    return acc;
  }, [] as Array<{ name: string; inflow: number; outflow: number; net: number }>);

  const accountData = [
    { name: 'Main Operating', balance: 850000, available: 850000 },
    { name: 'Payroll Account', balance: 200000, available: 200000 },
    { name: 'Savings', balance: 200000, available: 200000 },
    { name: 'Investment', balance: 500000, available: 500000 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'cleared': return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'pending': return <ClockIcon className="h-4 w-4 text-amber-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cleared': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />;
      default: return <ArrowPathIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'good': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-amber-100 text-amber-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Cashflow Intelligence</h1>
              <p className="text-gray-600">Real-time cash flow monitoring and predictive analytics</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowForecast(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SparklesIcon className="h-5 w-5 mr-2 text-purple-600" />
                Forecast
              </button>
              <button
                onClick={() => setShowAddTransaction(true)}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Transaction
              </button>
            </div>
          </div>

          {/* Alert Banner */}
          {criticalAlerts > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-3" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">
                    {criticalAlerts} critical cashflow alert{criticalAlerts > 1 ? 's' : ''} require immediate attention
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    Check the alerts panel for detailed information and recommended actions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-600">{metric.name}</h3>
                  {getTrendIcon(metric.trend)}
                </div>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {metric.unit === '₹' ? formatCurrency(metric.value) : `${metric.value}${metric.unit}`}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeColor(metric.status)}`}>
                        {metric.status}
                      </span>
                      {metric.target && (
                        <span className="text-xs text-gray-500">
                          Target: {metric.unit === '₹' ? formatCurrency(metric.target) : `${metric.target}${metric.unit}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      metric.change > 0 ? 'text-green-600' : 
                      metric.change < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </p>
                    <p className="text-xs text-gray-500">vs last period</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg mb-8">
          <div className="flex space-x-8 px-6">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: PresentationChartLineIcon },
              { id: 'forecast', label: 'Forecast', icon: SparklesIcon },
              { id: 'transactions', label: 'Transactions', icon: BanknotesIcon },
              { id: 'analytics', label: 'Analytics', icon: ChartBarIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedView(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    selectedView === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        {selectedView === 'dashboard' ? (
          <div className="space-y-8">
            {/* Cashflow Chart & Forecast */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Cash Flow Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={dailyCashflow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="inflow" fill="#10B981" name="Inflow" />
                    <Bar dataKey="outflow" fill="#EF4444" name="Outflow" />
                    <Line type="monotone" dataKey="net" stroke="#3B82F6" name="Net Cashflow" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Balances</h3>
                <div className="space-y-4">
                  {accountData.map((account, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{account.name}</div>
                        <div className="text-sm text-gray-600">Available: {formatCurrency(account.available)}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(account.balance)}</div>
                        <div className="text-xs text-green-600">Healthy</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Alerts & Recent Transactions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Cashflow Alerts</h3>
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert._id} className={`border rounded-lg p-4 ${getAlertColor(alert.severity)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <ExclamationTriangleIcon className="h-5 w-5" />
                            <span className="font-medium capitalize">{alert.type.replace('_', ' ')}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              alert.severity === 'critical' ? 'bg-red-200 text-red-800' :
                              alert.severity === 'high' ? 'bg-orange-200 text-orange-800' :
                              alert.severity === 'medium' ? 'bg-amber-200 text-amber-800' :
                              'bg-blue-200 text-blue-800'
                            }`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm">{alert.message}</p>
                          {alert.amount && (
                            <p className="text-sm font-medium mt-1">{formatCurrency(alert.amount)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-600">{formatDate(alert.date)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Transactions</h3>
                <div className="space-y-3">
                  {cashflowItems.slice(0, 5).map((transaction) => (
                    <div key={transaction._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div className={`p-1 rounded ${
                            transaction.type === 'inflow' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {transaction.type === 'inflow' ? 
                              <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" /> :
                              <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">{transaction.description}</div>
                            <div className="text-xs text-gray-600">{transaction.category}</div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${
                          transaction.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'inflow' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </div>
                        <div className="text-xs text-gray-500">{formatDate(transaction.date)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : selectedView === 'forecast' ? (
          <div className="space-y-8">
            {/* Forecast Header */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{forecast.name}</h3>
                  <p className="text-gray-600">Confidence Level: {forecast.confidence}% • Method: {forecast.methodology.replace('_', ' ')}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Accuracy (MAPE)</div>
                  <div className="text-2xl font-bold text-green-600">{forecast.accuracy.mape}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {forecast.assumptions.map((assumption, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium text-gray-900 capitalize">{assumption.key.replace('_', ' ')}</div>
                    <div className="text-lg font-bold text-blue-600">{assumption.value}</div>
                    <div className="text-xs text-gray-600">{assumption.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Chart */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">30-Day Cashflow Forecast</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={forecast.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Area type="monotone" dataKey="predictedInflow" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Predicted Inflow" />
                  <Area type="monotone" dataKey="predictedOutflow" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Predicted Outflow" />
                  <Line type="monotone" dataKey="predictedNet" stroke="#3B82F6" strokeWidth={3} name="Predicted Net" />
                  <Line type="monotone" dataKey="confidence.upper" stroke="#94A3B8" strokeDasharray="5 5" name="Upper Confidence" />
                  <Line type="monotone" dataKey="confidence.lower" stroke="#94A3B8" strokeDasharray="5 5" name="Lower Confidence" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : selectedView === 'transactions' ? (
          <div className="space-y-8">
            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="inflow">Inflows</option>
                    <option value="outflow">Outflows</option>
                  </select>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cleared">Cleared</option>
                  </select>

                  <select
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button className="px-3 py-1 rounded-md text-sm font-medium transition-colors bg-white text-gray-900 shadow-sm">
                      <ListBulletIcon className="h-4 w-4" />
                    </button>
                    <button className="px-3 py-1 rounded-md text-sm font-medium transition-colors text-gray-600 hover:text-gray-900">
                      <Squares2X2Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type & Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
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
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                            <div className="text-sm text-gray-600">Ref: {transaction.reference}</div>
                            {transaction.recurring && (
                              <div className="flex items-center mt-1">
                                <ArrowPathIcon className="h-3 w-3 text-blue-500 mr-1" />
                                <span className="text-xs text-blue-600">Recurring</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className={`p-1 rounded ${
                              transaction.type === 'inflow' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {transaction.type === 'inflow' ? 
                                <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" /> :
                                <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                              }
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 capitalize">{transaction.type}</div>
                              <div className="text-xs text-gray-600">{transaction.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`text-sm font-medium ${
                            transaction.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'inflow' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{transaction.account}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedTransaction(transaction)}
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
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          /* Analytics View */
          <div className="space-y-8">
            {/* Category Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Cashflow by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="inflow" fill="#10B981" name="Inflow" />
                    <Bar dataKey="outflow" fill="#EF4444" name="Outflow" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Net Cashflow by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="net" fill="#3B82F6" name="Net Cashflow" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Analytics */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Cashflow Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BanknotesIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalInflows)}</p>
                  <p className="text-sm text-gray-600">Total Inflows</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ArrowTrendingDownIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalOutflows)}</p>
                  <p className="text-sm text-gray-600">Total Outflows</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ArrowPathIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(netCashflow)}</p>
                  <p className="text-sm text-gray-600">Net Cashflow</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ClockIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(pendingAmount)}</p>
                  <p className="text-sm text-gray-600">Pending Amount</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No Results */}
        {selectedView === 'transactions' && filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first transaction.'}
            </p>
            {!searchTerm && selectedType === 'all' && selectedStatus === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Transaction
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {showAddTransaction && (
        <AddTransactionModal
          onClose={() => setShowAddTransaction(false)}
          onSubmit={(transactionData) => {
            const newTransaction: CashflowItem = {
              _id: Date.now().toString(),
              ...transactionData,
              status: 'pending',
              recurring: false,
              tags: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setCashflowItems(prev => [newTransaction, ...prev]);
            setShowAddTransaction(false);
          }}
        />
      )}

      {selectedTransaction && (
        <TransactionDetailModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onUpdate={(updatedTransaction) => {
            setCashflowItems(prev => prev.map(item => 
              item._id === updatedTransaction._id ? updatedTransaction : item
            ));
          }}
        />
      )}

      {showForecast && (
        <ForecastDetailModal
          forecast={forecast}
          onClose={() => setShowForecast(false)}
        />
      )}
    </div>
  );
}

// Add Transaction Modal Component
interface AddTransactionModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<CashflowItem>) => void;
}

function AddTransactionModal({ onClose, onSubmit }: AddTransactionModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'inflow' as CashflowItem['type'],
    category: '',
    subcategory: '',
    description: '',
    amount: '0',
    account: 'Main Operating Account',
    reference: '',
    source: 'payment' as CashflowItem['source'],
    recurring: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add Cashflow Transaction</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as CashflowItem['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="inflow">Inflow</option>
                  <option value="outflow">Outflow</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select category</option>
                  <option value="Revenue">Revenue</option>
                  <option value="Expenses">Expenses</option>
                  <option value="Operations">Operations</option>
                  <option value="Investment">Investment</option>
                  <option value="Loan">Loan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account *</label>
                <select
                  required
                  value={formData.account}
                  onChange={(e) => setFormData(prev => ({ ...prev, account: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Main Operating Account">Main Operating Account</option>
                  <option value="Payroll Account">Payroll Account</option>
                  <option value="Savings Account">Savings Account</option>
                  <option value="Investment Account">Investment Account</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as CashflowItem['source'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="payment">Payment</option>
                  <option value="invoice">Invoice</option>
                  <option value="transfer">Transfer</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="loan">Loan</option>
                  <option value="investment">Investment</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Transaction description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reference</label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData(prev => ({ ...prev, reference: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Transaction reference or ID"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="recurring"
                checked={formData.recurring}
                onChange={(e) => setFormData(prev => ({ ...prev, recurring: e.target.checked }))}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
                This is a recurring transaction
              </label>
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
                Add Transaction
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Transaction Detail Modal Component
interface TransactionDetailModalProps {
  transaction: CashflowItem;
  onClose: () => void;
  onUpdate: (transaction: CashflowItem) => void;
}

function TransactionDetailModal({ transaction, onClose, onUpdate }: TransactionDetailModalProps) {
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
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'cleared': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Transaction Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{transaction.description}</h3>
                <p className="text-gray-600">{transaction.reference}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`px-2 py-1 rounded-full text-sm font-medium border ${getStatusColor(transaction.status)}`}>
                    {transaction.status}
                  </span>
                  <span className="text-sm text-gray-600 capitalize">{transaction.type}</span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{transaction.category}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  transaction.type === 'inflow' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'inflow' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                <div className="text-sm text-gray-600">{formatDate(transaction.date)}</div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account</label>
                <p className="text-gray-900">{transaction.account}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <p className="text-gray-900 capitalize">{transaction.source}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <p className="text-gray-900">{transaction.category}</p>
                {transaction.subcategory && (
                  <p className="text-sm text-gray-600">{transaction.subcategory}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <p className="text-gray-900">{formatDate(transaction.date)}</p>
              </div>
            </div>

            {/* Metadata */}
            {Object.keys(transaction.metadata).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Information</label>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {transaction.metadata.customer && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Customer:</span>
                      <span className="text-sm font-medium text-gray-900">{transaction.metadata.customer}</span>
                    </div>
                  )}
                  {transaction.metadata.vendor && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Vendor:</span>
                      <span className="text-sm font-medium text-gray-900">{transaction.metadata.vendor}</span>
                    </div>
                  )}
                  {transaction.metadata.invoiceNumber && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Invoice:</span>
                      <span className="text-sm font-medium text-gray-900">{transaction.metadata.invoiceNumber}</span>
                    </div>
                  )}
                  {transaction.metadata.paymentMethod && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700 mb-1">Payment Method</span>
                      <span className="text-sm font-medium text-gray-900">{transaction.metadata.paymentMethod}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {transaction.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {transaction.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recurring Info */}
            {transaction.recurring && transaction.recurringPattern && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Recurring Pattern</label>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Frequency:</span>
                      <span className="ml-2 font-medium capitalize">{transaction.recurringPattern.frequency}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Next Date:</span>
                      <span className="ml-2 font-medium">{formatDate(transaction.recurringPattern.nextDate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-4 pt-6 border-t">
              <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Transaction
              </button>
              <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Approve
              </button>
              <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Export
              </button>
            </div>

            <div className="flex justify-end">
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

// Forecast Detail Modal Component
interface ForecastDetailModalProps {
  forecast: CashflowForecast;
  onClose: () => void;
}

function ForecastDetailModal({ forecast, onClose }: ForecastDetailModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Forecast Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Confidence Level</h4>
                <p className="text-2xl font-bold text-blue-600">{forecast.confidence}%</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Method</h4>
                <p className="text-sm font-medium capitalize">{forecast.methodology.replace('_', ' ')}</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Accuracy (MAPE)</h4>
                <p className="text-2xl font-bold text-purple-600">{forecast.accuracy.mape}%</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Horizon</h4>
                <p className="text-2xl font-bold text-amber-600">{forecast.horizon}</p>
                <p className="text-sm text-gray-600 capitalize">{forecast.type}</p>
              </div>
            </div>

            {/* Assumptions */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Forecast Assumptions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {forecast.assumptions.map((assumption, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-1 capitalize">
                      {assumption.key.replace('_', ' ')}
                    </h4>
                    <p className="text-lg font-bold text-blue-600">{assumption.value}</p>
                    <p className="text-sm text-gray-600">{assumption.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Forecast Data */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Forecast Data</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Date</th>
                      <th className="text-right py-2">Predicted Inflow</th>
                      <th className="text-right py-2">Predicted Outflow</th>
                      <th className="text-right py-2">Predicted Net</th>
                      <th className="text-right py-2">Confidence Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.data.slice(0, 10).map((dataPoint, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="py-2">{formatDate(dataPoint.date)}</td>
                        <td className="py-2 text-right font-medium text-green-600">
                          {formatCurrency(dataPoint.predictedInflow)}
                        </td>
                        <td className="py-2 text-right font-medium text-red-600">
                          {formatCurrency(dataPoint.predictedOutflow)}
                        </td>
                        <td className="py-2 text-right font-medium text-blue-600">
                          {formatCurrency(dataPoint.predictedNet)}
                        </td>
                        <td className="py-2 text-right text-gray-600">
                          {formatCurrency(dataPoint.confidence.lower)} - {formatCurrency(dataPoint.confidence.upper)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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