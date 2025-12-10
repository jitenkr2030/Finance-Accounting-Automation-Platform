'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChartBarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  BanknotesIcon,
  CreditCardIcon,
  BeakerIcon,
  LightBulbIcon,
  PresentationChartLineIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  TagIcon,
  ListBulletIcon,
  Squares2X2Icon,
  CalendarDaysIcon as CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon
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
  ReferenceLine
} from 'recharts';

// Types
interface Forecast {
  _id: string;
  name: string;
  description: string;
  type: 'revenue' | 'expense' | 'cashflow' | 'profit' | 'balance_sheet';
  timeframe: 'monthly' | 'quarterly' | 'yearly';
  horizon: number; // months/quarters/years
  method: 'linear' | 'exponential' | 'seasonal' | 'ml_regression' | 'monte_carlo';
  status: 'draft' | 'active' | 'archived';
  assumptions: ForecastAssumption[];
  data: ForecastDataPoint[];
  scenarios: ForecastScenario[];
  accuracy: {
    mape: number; // Mean Absolute Percentage Error
    rmse: number; // Root Mean Square Error
    lastUpdated: string;
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ForecastAssumption {
  key: string;
  value: number | string;
  description: string;
  impact: 'high' | 'medium' | 'low';
}

interface ForecastDataPoint {
  period: string;
  actual?: number;
  forecast: number;
  confidence: {
    lower: number;
    upper: number;
  };
  scenario?: 'best_case' | 'most_likely' | 'worst_case';
}

interface ForecastScenario {
  name: string;
  description: string;
  probability: number; // 0-100
  data: ForecastDataPoint[];
  assumptions: ForecastAssumption[];
}

interface HistoricalData {
  period: string;
  revenue: number;
  expenses: number;
  profit: number;
  cashflow: number;
  customers: number;
  growthRate: number;
}

// Sample data
const sampleForecasts: Forecast[] = [
  {
    _id: '1',
    name: 'Revenue Forecast 2025',
    description: '12-month revenue projection based on historical trends and market analysis',
    type: 'revenue',
    timeframe: 'monthly',
    horizon: 12,
    method: 'ml_regression',
    status: 'active',
    assumptions: [
      { key: 'market_growth', value: 15, description: 'Expected market growth rate', impact: 'high' },
      { key: 'customer_acquisition', value: 25, description: 'New customer acquisition rate', impact: 'high' },
      { key: 'price_increase', value: 8, description: 'Average price increase', impact: 'medium' },
      { key: 'seasonality', value: 0.12, description: 'Seasonal variation factor', impact: 'medium' }
    ],
    data: [
      { period: '2025-01', forecast: 2500000, confidence: { lower: 2200000, upper: 2800000 }, scenario: 'most_likely' },
      { period: '2025-02', forecast: 2650000, confidence: { lower: 2300000, upper: 3000000 }, scenario: 'most_likely' },
      { period: '2025-03', forecast: 2800000, confidence: { lower: 2400000, upper: 3200000 }, scenario: 'most_likely' },
      { period: '2025-04', forecast: 2750000, confidence: { lower: 2350000, upper: 3150000 }, scenario: 'most_likely' },
      { period: '2025-05', forecast: 2900000, confidence: { lower: 2500000, upper: 3300000 }, scenario: 'most_likely' },
      { period: '2025-06', forecast: 3050000, confidence: { lower: 2650000, upper: 3450000 }, scenario: 'most_likely' }
    ],
    scenarios: [
      {
        name: 'Best Case',
        description: 'Optimistic growth scenario with higher market penetration',
        probability: 25,
        data: [
          { period: '2025-01', forecast: 2750000, confidence: { lower: 2500000, upper: 3000000 } },
          { period: '2025-02', forecast: 2950000, confidence: { lower: 2700000, upper: 3200000 } }
        ],
        assumptions: [
          { key: 'market_growth', value: 20, description: 'Higher market growth', impact: 'high' },
          { key: 'customer_acquisition', value: 35, description: 'Aggressive acquisition', impact: 'high' }
        ]
      },
      {
        name: 'Worst Case',
        description: 'Conservative scenario with economic headwinds',
        probability: 15,
        data: [
          { period: '2025-01', forecast: 2250000, confidence: { lower: 2000000, upper: 2500000 } },
          { period: '2025-02', forecast: 2350000, confidence: { lower: 2100000, upper: 2600000 } }
        ],
        assumptions: [
          { key: 'market_growth', value: 8, description: 'Slow market growth', impact: 'high' },
          { key: 'customer_acquisition', value: 15, description: 'Reduced acquisition', impact: 'high' }
        ]
      }
    ],
    accuracy: {
      mape: 8.5,
      rmse: 125000,
      lastUpdated: '2024-12-08T10:00:00Z'
    },
    createdBy: 'John Doe',
    createdAt: '2024-12-01T09:00:00Z',
    updatedAt: '2024-12-08T10:00:00Z'
  },
  {
    _id: '2',
    name: 'Cash Flow Projection Q1 2025',
    description: 'Quarterly cash flow forecast with working capital analysis',
    type: 'cashflow',
    timeframe: 'quarterly',
    horizon: 4,
    method: 'seasonal',
    status: 'active',
    assumptions: [
      { key: 'collection_period', value: 45, description: 'Average collection period (days)', impact: 'high' },
      { key: 'payment_period', value: 30, description: 'Average payment period (days)', impact: 'high' },
      { key: 'inventory_turnover', value: 6, description: 'Inventory turnover ratio', impact: 'medium' }
    ],
    data: [
      { period: '2025-Q1', forecast: 850000, confidence: { lower: 750000, upper: 950000 } },
      { period: '2025-Q2', forecast: 920000, confidence: { lower: 820000, upper: 1020000 } },
      { period: '2025-Q3', forecast: 780000, confidence: { lower: 680000, upper: 880000 } },
      { period: '2025-Q4', forecast: 1050000, confidence: { lower: 950000, upper: 1150000 } }
    ],
    scenarios: [],
    accuracy: {
      mape: 12.3,
      rmse: 95000,
      lastUpdated: '2024-12-05T14:30:00Z'
    },
    createdBy: 'Jane Smith',
    createdAt: '2024-11-15T11:00:00Z',
    updatedAt: '2024-12-05T14:30:00Z'
  }
];

const sampleHistoricalData: HistoricalData[] = [
  { period: '2024-01', revenue: 1800000, expenses: 1200000, profit: 600000, cashflow: 450000, customers: 1250, growthRate: 12.5 },
  { period: '2024-02', revenue: 1950000, expenses: 1300000, profit: 650000, cashflow: 520000, customers: 1320, growthRate: 8.3 },
  { period: '2024-03', revenue: 2100000, expenses: 1400000, profit: 700000, cashflow: 580000, customers: 1450, growthRate: 7.7 },
  { period: '2024-04', revenue: 2050000, expenses: 1380000, profit: 670000, cashflow: 550000, customers: 1480, growthRate: -2.4 },
  { period: '2024-05', revenue: 2250000, expenses: 1500000, profit: 750000, cashflow: 620000, customers: 1580, growthRate: 9.8 },
  { period: '2024-06', revenue: 2400000, expenses: 1600000, profit: 800000, cashflow: 680000, customers: 1680, growthRate: 6.7 },
  { period: '2024-07', revenue: 2350000, expenses: 1570000, profit: 780000, cashflow: 650000, customers: 1720, growthRate: -2.1 },
  { period: '2024-08', revenue: 2500000, expenses: 1670000, profit: 830000, cashflow: 720000, customers: 1820, growthRate: 6.4 },
  { period: '2024-09', revenue: 2650000, expenses: 1770000, profit: 880000, cashflow: 750000, customers: 1920, growthRate: 6.0 },
  { period: '2024-10', revenue: 2700000, expenses: 1800000, profit: 900000, cashflow: 780000, customers: 1980, growthRate: 1.9 },
  { period: '2024-11', revenue: 2850000, expenses: 1900000, profit: 950000, cashflow: 820000, customers: 2080, growthRate: 5.6 },
  { period: '2024-12', revenue: 3000000, expenses: 2000000, profit: 1000000, cashflow: 850000, customers: 2200, growthRate: 5.3 }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export default function ForecastingPage() {
  const [forecasts, setForecasts] = useState<Forecast[]>(sampleForecasts);
  const [historicalData] = useState<HistoricalData[]>(sampleHistoricalData);
  const [selectedView, setSelectedView] = useState<'list' | 'grid' | 'analytics' | 'scenarios'>('list');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForecast, setShowAddForecast] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [selectedForecast, setSelectedForecast] = useState<Forecast | null>(null);
  const [showAssumptions, setShowAssumptions] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter forecasts
  const filteredForecasts = forecasts.filter(forecast => {
    const matchesSearch = forecast.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         forecast.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || forecast.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || forecast.status === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalForecasts: forecasts.length,
    activeForecasts: forecasts.filter(f => f.status === 'active').length,
    avgAccuracy: forecasts.length > 0 ? 
      forecasts.reduce((sum, f) => sum + f.accuracy.mape, 0) / forecasts.length : 0,
    totalForecasted: forecasts.reduce((sum, f) => 
      sum + f.data.reduce((dataSum, d) => dataSum + d.forecast, 0), 0),
    typesCount: Array.from(new Set(forecasts.map(f => f.type))).length,
    scenariosCount: forecasts.reduce((sum, f) => sum + f.scenarios.length, 0)
  };

  // Analytics data
  const typeData = [
    { name: 'Revenue', value: forecasts.filter(f => f.type === 'revenue').length, color: '#10B981' },
    { name: 'Cash Flow', value: forecasts.filter(f => f.type === 'cashflow').length, color: '#3B82F6' },
    { name: 'Expense', value: forecasts.filter(f => f.type === 'expense').length, color: '#EF4444' },
    { name: 'Profit', value: forecasts.filter(f => f.type === 'profit').length, color: '#8B5CF6' },
    { name: 'Balance Sheet', value: forecasts.filter(f => f.type === 'balance_sheet').length, color: '#F59E0B' }
  ].filter(item => item.value > 0);

  const accuracyData = forecasts.map(forecast => ({
    name: forecast.name,
    mape: forecast.accuracy.mape,
    rmse: forecast.accuracy.rmse / 1000 // Convert to thousands for better visualization
  }));

  const combinedHistoricalAndForecast = [
    ...historicalData.slice(-6).map(data => ({
      period: data.period,
      actual: data.revenue,
      forecast: null,
      type: 'actual'
    })),
    ...forecasts[0]?.data.slice(0, 6).map(data => ({
      period: data.period,
      actual: null,
      forecast: data.forecast,
      confidence: data.confidence,
      type: 'forecast'
    })) || []
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'draft': return <ClockIcon className="h-4 w-4 text-amber-500" />;
      case 'archived': return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'draft': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <TrendingUpIcon className="h-5 w-5 text-green-600" />;
      case 'cashflow': return <BanknotesIcon className="h-5 w-5 text-blue-600" />;
      case 'expense': return <TrendingDownIcon className="h-5 w-5 text-red-600" />;
      case 'profit': return <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />;
      case 'balance_sheet': return <ChartBarIcon className="h-5 w-5 text-orange-600" />;
      default: return <ChartBarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      linear: 'Linear Regression',
      exponential: 'Exponential Smoothing',
      seasonal: 'Seasonal Analysis',
      ml_regression: 'Machine Learning',
      monte_carlo: 'Monte Carlo Simulation'
    };
    return labels[method as keyof typeof labels] || method;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Forecasting</h1>
              <p className="text-gray-600">AI-powered predictions and scenario analysis for strategic planning</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowAssumptions(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BeakerIcon className="h-5 w-5 mr-2 text-purple-600" />
                Assumptions
              </button>
              <button
                onClick={() => setShowScenario(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SparklesIcon className="h-5 w-5 mr-2 text-amber-600" />
                Scenarios
              </button>
              <button
                onClick={() => setShowAddForecast(true)}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Forecast
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Forecasts</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalForecasts}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <PresentationChartLineIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{stats.activeForecasts}</span>
                  <span className="ml-1">active</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Accuracy</p>
                  <p className="text-2xl font-bold text-green-600">{formatPercentage(stats.avgAccuracy)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-green-600">MAPE</span>
                  <span className="ml-1">error rate</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Forecasted</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalForecasted)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-purple-600">{stats.typesCount}</span>
                  <span className="ml-1">types</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Scenarios</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.scenariosCount}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <SparklesIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-amber-600">what-if</span>
                  <span className="ml-1">analyses</span>
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
                  placeholder="Search forecasts..."
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
                <option value="revenue">Revenue</option>
                <option value="cashflow">Cash Flow</option>
                <option value="expense">Expense</option>
                <option value="profit">Profit</option>
                <option value="balance_sheet">Balance Sheet</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
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
                  <ListBulletIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedView('grid')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Squares2X2Icon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedView('analytics')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'analytics' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <ChartBarIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedView('scenarios')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedView === 'scenarios' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <SparklesIcon className="h-4 w-4" />
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
              {/* Forecast Types Distribution */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Forecast Types</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Model Accuracy */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Model Accuracy (MAPE)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={accuracyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}%`, 'MAPE']} />
                    <Bar dataKey="mape" fill="#3B82F6" />
                    <ReferenceLine y={10} stroke="#EF4444" strokeDasharray="5 5" label="Target" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Historical vs Forecast */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Historical vs Forecast Analysis</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={combinedHistoricalAndForecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="actual" fill="#10B981" name="Actual Revenue" />
                  <Bar dataKey="forecast" fill="#3B82F6" name="Forecasted Revenue" />
                  <Line type="monotone" dataKey="confidence?.upper" stroke="#EF4444" strokeDasharray="5 5" name="Upper Confidence" />
                  <Line type="monotone" dataKey="confidence?.lower" stroke="#EF4444" strokeDasharray="5 5" name="Lower Confidence" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Accuracy Metrics */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Accuracy Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {forecasts.map((forecast) => (
                  <div key={forecast._id} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">{forecast.name}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">MAPE:</span>
                        <span className={`font-medium ${
                          forecast.accuracy.mape < 10 ? 'text-green-600' : 
                          forecast.accuracy.mape < 20 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {formatPercentage(forecast.accuracy.mape)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">RMSE:</span>
                        <span className="font-medium">{formatCurrency(forecast.accuracy.rmse)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Last Updated:</span>
                        <span className="font-medium">{formatDate(forecast.accuracy.lastUpdated)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : selectedView === 'scenarios' ? (
          <div className="space-y-6">
            {forecasts.map((forecast) => (
              <div key={forecast._id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{forecast.name}</h3>
                    <p className="text-gray-600">{forecast.description}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(forecast.type)}
                    <span className="text-sm text-gray-500 capitalize">{forecast.type.replace('_', ' ')}</span>
                  </div>
                </div>

                {forecast.scenarios.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {forecast.scenarios.map((scenario, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {scenario.probability}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                        <div className="space-y-2 text-sm">
                          {scenario.data.slice(0, 3).map((dataPoint, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="text-gray-600">{dataPoint.period}:</span>
                              <span className="font-medium">{formatCurrency(dataPoint.forecast)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No scenarios defined</h3>
                    <p className="mt-1 text-sm text-gray-500">Add scenarios to compare different outcomes.</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : selectedView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredForecasts.map((forecast) => (
              <div key={forecast._id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{forecast.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{forecast.description}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(forecast.status)}`}>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(forecast.status)}
                      <span className="capitalize">{forecast.status}</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <div className="flex items-center space-x-1">
                      {getTypeIcon(forecast.type)}
                      <span className="capitalize font-medium">{forecast.type.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{getMethodLabel(forecast.method)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Horizon:</span>
                    <span className="font-medium">{forecast.horizon} {forecast.timeframe}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Accuracy:</span>
                    <span className={`font-medium ${
                      forecast.accuracy.mape < 10 ? 'text-green-600' : 
                      forecast.accuracy.mape < 20 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(forecast.accuracy.mape)} MAPE
                    </span>
                  </div>
                </div>

                {forecast.data.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <p className="text-xs text-gray-600 mb-1">Latest Forecast:</p>
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(forecast.data[forecast.data.length - 1]?.forecast || 0)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {forecast.data[forecast.data.length - 1]?.period}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedForecast(forecast)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowScenario(true)}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <SparklesIcon className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Created by</p>
                    <p className="text-xs text-gray-500">{forecast.createdBy}</p>
                  </div>
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
                      Forecast Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type & Method
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Performance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Latest Forecast
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredForecasts.map((forecast) => (
                    <tr key={forecast._id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{forecast.name}</div>
                          <div className="text-sm text-gray-600">{forecast.description}</div>
                          <div className="text-xs text-gray-500">Created: {formatDate(forecast.createdAt)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {getTypeIcon(forecast.type)}
                            <span className="text-sm font-medium capitalize">{forecast.type.replace('_', ' ')}</span>
                          </div>
                          <div className="text-xs text-gray-600">{getMethodLabel(forecast.method)}</div>
                          <div className="text-xs text-gray-600">{forecast.horizon} {forecast.timeframe}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="text-gray-600">MAPE: </span>
                            <span className={`font-medium ${
                              forecast.accuracy.mape < 10 ? 'text-green-600' : 
                              forecast.accuracy.mape < 20 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {formatPercentage(forecast.accuracy.mape)}
                            </span>
                          </div>
                          <div className="text-xs text-gray-600">
                            RMSE: {formatCurrency(forecast.accuracy.rmse)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Updated: {formatDate(forecast.accuracy.lastUpdated)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {forecast.data.length > 0 ? (
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(forecast.data[forecast.data.length - 1].forecast)}
                            </div>
                            <div className="text-xs text-gray-600">
                              {forecast.data[forecast.data.length - 1].period}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatCurrency(forecast.data[forecast.data.length - 1].confidence.lower)} - {formatCurrency(forecast.data[forecast.data.length - 1].confidence.upper)}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No data</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(forecast.status)}`}>
                          {getStatusIcon(forecast.status)}
                          <span className="ml-1 capitalize">{forecast.status}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedForecast(forecast)}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowScenario(true)}
                            className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                          >
                            <SparklesIcon className="h-4 w-4" />
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
        )}

        {/* No Results */}
        {filteredForecasts.length === 0 && (
          <div className="text-center py-12">
            <PresentationChartLineIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No forecasts found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first forecast.'}
            </p>
            {!searchTerm && selectedType === 'all' && selectedStatus === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForecast(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Create Forecast
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {showAddForecast && (
        <AddForecastModal
          onClose={() => setShowAddForecast(false)}
          onSubmit={(forecastData) => {
            const newForecast: Forecast = {
              _id: Date.now().toString(),
              ...forecastData,
              status: 'draft',
              assumptions: [],
              data: [],
              scenarios: [],
              accuracy: {
                mape: 0,
                rmse: 0,
                lastUpdated: new Date().toISOString()
              },
              createdBy: 'Current User',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setForecasts(prev => [newForecast, ...prev]);
            setShowAddForecast(false);
          }}
        />
      )}

      {selectedForecast && (
        <ForecastDetailModal
          forecast={selectedForecast}
          onClose={() => setSelectedForecast(null)}
          onUpdate={(updatedForecast) => {
            setForecasts(prev => prev.map(forecast => 
              forecast._id === updatedForecast._id ? updatedForecast : forecast
            ));
          }}
        />
      )}

      {showAssumptions && (
        <AssumptionsModal
          forecasts={forecasts}
          onClose={() => setShowAssumptions(false)}
        />
      )}

      {showScenario && (
        <ScenarioModal
          forecasts={forecasts}
          onClose={() => setShowScenario(false)}
        />
      )}
    </div>
  );
}

// Add Forecast Modal Component
interface AddForecastModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Forecast>) => void;
}

function AddForecastModal({ onClose, onSubmit }: AddForecastModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'revenue' as Forecast['type'],
    timeframe: 'monthly' as Forecast['timeframe'],
    horizon: '12',
    method: 'ml_regression' as Forecast['method']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      horizon: parseInt(formData.horizon)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Forecast</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter forecast name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the forecast purpose and scope"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Forecast['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="revenue">Revenue</option>
                  <option value="expense">Expense</option>
                  <option value="cashflow">Cash Flow</option>
                  <option value="profit">Profit</option>
                  <option value="balance_sheet">Balance Sheet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe *</label>
                <select
                  required
                  value={formData.timeframe}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeframe: e.target.value as Forecast['timeframe'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forecast Horizon *</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="60"
                  value={formData.horizon}
                  onChange={(e) => setFormData(prev => ({ ...prev, horizon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Number of periods"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Forecasting Method *</label>
                <select
                  required
                  value={formData.method}
                  onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as Forecast['method'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="linear">Linear Regression</option>
                  <option value="exponential">Exponential Smoothing</option>
                  <option value="seasonal">Seasonal Analysis</option>
                  <option value="ml_regression">Machine Learning</option>
                  <option value="monte_carlo">Monte Carlo Simulation</option>
                </select>
              </div>
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
                Create Forecast
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Forecast Detail Modal Component
interface ForecastDetailModalProps {
  forecast: Forecast;
  onClose: () => void;
  onUpdate: (forecast: Forecast) => void;
}

function ForecastDetailModal({ forecast, onClose, onUpdate }: ForecastDetailModalProps) {
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
      day: 'numeric'
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getMethodLabel = (method: string) => {
    const labels = {
      linear: 'Linear Regression',
      exponential: 'Exponential Smoothing',
      seasonal: 'Seasonal Analysis',
      ml_regression: 'Machine Learning',
      monte_carlo: 'Monte Carlo Simulation'
    };
    return labels[method as keyof typeof labels] || method;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'revenue': return <TrendingUpIcon className="h-5 w-5 text-green-600" />;
      case 'cashflow': return <BanknotesIcon className="h-5 w-5 text-blue-600" />;
      case 'expense': return <TrendingDownIcon className="h-5 w-5 text-red-600" />;
      case 'profit': return <CurrencyDollarIcon className="h-5 w-5 text-purple-600" />;
      case 'balance_sheet': return <ChartBarIcon className="h-5 w-5 text-orange-600" />;
      default: return <ChartBarIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Forecast Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{forecast.name}</h3>
                <p className="text-gray-600 mt-1">{forecast.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(forecast.type)}
                    <span className="text-sm text-gray-600 capitalize">{forecast.type.replace('_', ' ')}</span>
                  </div>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{getMethodLabel(forecast.method)}</span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{forecast.horizon} {forecast.timeframe}</span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Model Accuracy</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">MAPE:</span>
                    <span className={`font-bold ${
                      forecast.accuracy.mape < 10 ? 'text-green-600' : 
                      forecast.accuracy.mape < 20 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(forecast.accuracy.mape)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">RMSE:</span>
                    <span className="font-medium">{formatCurrency(forecast.accuracy.rmse)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated:</span>
                    <span className="font-medium">{formatDate(forecast.accuracy.lastUpdated)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Forecast Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Forecasted:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(forecast.data.reduce((sum, d) => sum + d.forecast, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Data Points:</span>
                    <span className="font-medium">{forecast.data.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Scenarios:</span>
                    <span className="font-medium">{forecast.scenarios.length}</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Configuration</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{getMethodLabel(forecast.method)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Timeframe:</span>
                    <span className="font-medium capitalize">{forecast.timeframe}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Horizon:</span>
                    <span className="font-medium">{forecast.horizon} {forecast.timeframe}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Forecast Chart */}
            {forecast.data.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Forecast Visualization</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forecast.data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Area type="monotone" dataKey="forecast" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} name="Forecast" />
                    <Area type="monotone" dataKey="confidence.upper" stroke="#EF4444" fill="none" strokeDasharray="5 5" name="Upper Bound" />
                    <Area type="monotone" dataKey="confidence.lower" stroke="#EF4444" fill="none" strokeDasharray="5 5" name="Lower Bound" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Assumptions */}
            {forecast.assumptions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Assumptions</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {forecast.assumptions.map((assumption, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 capitalize">{assumption.key.replace('_', ' ')}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          assumption.impact === 'high' ? 'bg-red-100 text-red-800' :
                          assumption.impact === 'medium' ? 'bg-amber-100 text-amber-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {assumption.impact} impact
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{assumption.description}</p>
                      <p className="text-sm font-medium text-gray-900">{assumption.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Forecast Data Table */}
            {forecast.data.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Forecast Data</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Period</th>
                        <th className="text-right py-2">Forecast</th>
                        <th className="text-right py-2">Lower Bound</th>
                        <th className="text-right py-2">Upper Bound</th>
                        <th className="text-right py-2">Confidence Range</th>
                      </tr>
                    </thead>
                    <tbody>
                      {forecast.data.map((dataPoint, index) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2">{dataPoint.period}</td>
                          <td className="py-2 text-right font-medium">{formatCurrency(dataPoint.forecast)}</td>
                          <td className="py-2 text-right text-gray-600">{formatCurrency(dataPoint.confidence.lower)}</td>
                          <td className="py-2 text-right text-gray-600">{formatCurrency(dataPoint.confidence.upper)}</td>
                          <td className="py-2 text-right text-gray-600">
                            {formatPercentage(((dataPoint.confidence.upper - dataPoint.confidence.lower) / dataPoint.forecast) * 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Scenarios */}
            {forecast.scenarios.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Scenarios</h3>
                <div className="space-y-4">
                  {forecast.scenarios.map((scenario, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900">{scenario.name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {scenario.probability}% probability
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{scenario.description}</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        {scenario.data.slice(0, 3).map((dataPoint, idx) => (
                          <div key={idx} className="text-center">
                            <p className="text-gray-600">{dataPoint.period}</p>
                            <p className="font-medium">{formatCurrency(dataPoint.forecast)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
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

// Assumptions Modal Component
interface AssumptionsModalProps {
  forecasts: Forecast[];
  onClose: () => void;
}

function AssumptionsModal({ forecasts, onClose }: AssumptionsModalProps) {
  const allAssumptions = forecasts.flatMap(forecast => 
    forecast.assumptions.map(assumption => ({
      ...assumption,
      forecastName: forecast.name,
      forecastType: forecast.type
    }))
  );

  const impactColors = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-amber-100 text-amber-800 border-amber-200',
    low: 'bg-green-100 text-green-800 border-green-200'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Forecast Assumptions</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {allAssumptions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allAssumptions.map((assumption, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {assumption.key.replace('_', ' ')}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${impactColors[assumption.impact]}`}>
                        {assumption.impact} impact
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{assumption.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">{assumption.value}</span>
                      <span className="text-xs text-gray-500">{assumption.forecastName}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BeakerIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No assumptions defined</h3>
                <p className="mt-1 text-sm text-gray-500">Add assumptions to your forecasts to improve accuracy.</p>
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

// Scenario Modal Component
interface ScenarioModalProps {
  forecasts: Forecast[];
  onClose: () => void;
}

function ScenarioModal({ forecasts, onClose }: ScenarioModalProps) {
  const allScenarios = forecasts.flatMap(forecast => 
    forecast.scenarios.map(scenario => ({
      ...scenario,
      forecastName: forecast.name,
      forecastType: forecast.type
    }))
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Forecast Scenarios</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {allScenarios.length > 0 ? (
              allScenarios.map((scenario, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{scenario.name}</h3>
                      <p className="text-gray-600">{scenario.description}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        Forecast: {scenario.forecastName} ({scenario.forecastType.replace('_', ' ')})
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                        {scenario.probability}% probability
                      </span>
                    </div>
                  </div>

                  {scenario.data.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {scenario.data.slice(0, 6).map((dataPoint, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 text-center">
                          <p className="text-sm text-gray-600">{dataPoint.period}</p>
                          <p className="text-lg font-bold text-gray-900">{formatCurrency(dataPoint.forecast)}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {scenario.assumptions.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium text-gray-900 mb-2">Scenario Assumptions:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {scenario.assumptions.map((assumption, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-gray-600 capitalize">{assumption.key.replace('_', ' ')}:</span>
                            <span className="font-medium">{assumption.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <SparklesIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No scenarios defined</h3>
                <p className="mt-1 text-sm text-gray-500">Create scenarios to explore different forecast outcomes.</p>
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