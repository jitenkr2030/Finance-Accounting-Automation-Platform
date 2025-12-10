'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
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
  BanknotesIcon,
  CreditCardIcon,
  WrenchScrewdriverIcon,
  ClockIcon,
  TagIcon,
  ListBulletIcon,
  Squares2X2Icon,
  CalendarDaysIcon as CalendarIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  TruckIcon,
  HomeIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  LightBulbIcon
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
  Scatter
} from 'recharts';

// Types
interface Asset {
  _id: string;
  name: string;
  description: string;
  assetCode: string;
  category: string;
  subcategory?: string;
  location: {
    building: string;
    floor: string;
    room?: string;
    department: string;
  };
  purchase: {
    date: string;
    cost: number;
    supplier: string;
    invoiceNumber: string;
    warrantyExpiry: string;
    warrantyDetails: string;
  };
  depreciation: {
    method: 'straight_line' | 'declining_balance' | 'sum_of_years' | 'units_of_production';
    usefulLife: number; // in years
    salvageValue: number;
    rate: number; // percentage
    accumulated: number;
    currentBookValue: number;
    lastCalculationDate: string;
  };
  status: 'active' | 'disposed' | 'under_maintenance' | 'retired';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  assignments: AssetAssignment[];
  maintenance: MaintenanceRecord[];
  documents: AssetDocument[];
  specifications: {
    [key: string]: string | number;
  };
  tags: string[];
  barcode?: string;
  serialNumber?: string;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

interface AssetAssignment {
  _id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  assignedDate: string;
  returnDate?: string;
  purpose: string;
  location: string;
  status: 'assigned' | 'returned' | 'transferred';
}

interface MaintenanceRecord {
  _id: string;
  type: 'preventive' | 'corrective' | 'emergency';
  description: string;
  scheduledDate: string;
  completedDate?: string;
  cost: number;
  vendor: string;
  technician: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  nextDueDate?: string;
  parts: Array<{
    name: string;
    cost: number;
    quantity: number;
  }>;
  notes: string;
}

interface AssetDocument {
  _id: string;
  name: string;
  type: 'invoice' | 'warranty' | 'manual' | 'maintenance' | 'other';
  fileUrl: string;
  uploadDate: string;
  expiryDate?: string;
}

interface DepreciationSchedule {
  year: number;
  beginningBookValue: number;
  depreciationExpense: number;
  accumulatedDepreciation: number;
  endingBookValue: number;
}

// Sample data
const sampleAssets: Asset[] = [
  {
    _id: '1',
    name: 'Dell Latitude 7420 Laptop',
    description: 'Business laptop for software development team',
    assetCode: 'IT-LAP-001',
    category: 'Electronics',
    subcategory: 'Computers',
    location: {
      building: 'Head Office',
      floor: '3rd Floor',
      room: 'Dev Team Room',
      department: 'IT'
    },
    purchase: {
      date: '2024-01-15',
      cost: 85000,
      supplier: 'Dell Technologies',
      invoiceNumber: 'INV-2024-001',
      warrantyExpiry: '2027-01-15',
      warrantyDetails: '3 years on-site warranty'
    },
    depreciation: {
      method: 'straight_line',
      usefulLife: 4,
      salvageValue: 5000,
      rate: 25,
      accumulated: 20000,
      currentBookValue: 65000,
      lastCalculationDate: '2024-12-01'
    },
    status: 'active',
    condition: 'excellent',
    assignments: [
      {
        _id: 'as1',
        employeeId: 'emp1',
        employeeName: 'John Doe',
        department: 'IT',
        assignedDate: '2024-01-20',
        purpose: 'Primary development machine',
        location: 'Dev Team Room',
        status: 'assigned'
      }
    ],
    maintenance: [],
    documents: [
      {
        _id: 'doc1',
        name: 'Purchase Invoice',
        type: 'invoice',
        fileUrl: '/documents/invoice-001.pdf',
        uploadDate: '2024-01-15'
      },
      {
        _id: 'doc2',
        name: 'Warranty Certificate',
        type: 'warranty',
        fileUrl: '/documents/warranty-001.pdf',
        uploadDate: '2024-01-15'
      }
    ],
    specifications: {
      processor: 'Intel Core i7-1165G7',
      memory: '16GB RAM',
      storage: '512GB SSD',
      os: 'Windows 11 Pro'
    },
    tags: ['laptop', 'development', 'portable'],
    serialNumber: 'DL7420-2024-001',
    barcode: '1234567890123',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-12-01T16:45:00Z'
  },
  {
    _id: '2',
    name: 'Office Furniture Set',
    description: 'Ergonomic desk and chair set for reception area',
    assetCode: 'FUR-REC-001',
    category: 'Furniture',
    subcategory: 'Office Setup',
    location: {
      building: 'Head Office',
      floor: 'Ground Floor',
      room: 'Reception',
      department: 'Administration'
    },
    purchase: {
      date: '2024-02-10',
      cost: 45000,
      supplier: 'Office Solutions Ltd',
      invoiceNumber: 'INV-2024-045',
      warrantyExpiry: '2027-02-10',
      warrantyDetails: '3 years structural warranty'
    },
    depreciation: {
      method: 'straight_line',
      usefulLife: 10,
      salvageValue: 5000,
      rate: 10,
      accumulated: 4500,
      currentBookValue: 40500,
      lastCalculationDate: '2024-12-01'
    },
    status: 'active',
    condition: 'good',
    assignments: [],
    maintenance: [],
    documents: [
      {
        _id: 'doc3',
        name: 'Purchase Invoice',
        type: 'invoice',
        fileUrl: '/documents/invoice-045.pdf',
        uploadDate: '2024-02-10'
      }
    ],
    specifications: {
      material: 'Engineered Wood',
      color: 'Walnut',
      dimensions: '160x80x75 cm',
      capacity: '150 kg'
    },
    tags: ['furniture', 'reception', 'office'],
    createdAt: '2024-02-10T09:00:00Z',
    updatedAt: '2024-12-01T14:30:00Z'
  },
  {
    _id: '3',
    name: 'HVAC System - Central AC',
    description: 'Central air conditioning unit for office building',
    assetCode: 'HVAC-001',
    category: 'Infrastructure',
    subcategory: 'Climate Control',
    location: {
      building: 'Head Office',
      floor: 'Roof Level',
      department: 'Facilities'
    },
    purchase: {
      date: '2023-08-20',
      cost: 250000,
      supplier: 'Climate Solutions Pvt Ltd',
      invoiceNumber: 'INV-2023-156',
      warrantyExpiry: '2026-08-20',
      warrantyDetails: '3 years comprehensive warranty'
    },
    depreciation: {
      method: 'straight_line',
      usefulLife: 15,
      salvageValue: 25000,
      rate: 6.67,
      accumulated: 37500,
      currentBookValue: 212500,
      lastCalculationDate: '2024-12-01'
    },
    status: 'active',
    condition: 'good',
    assignments: [],
    maintenance: [
      {
        _id: 'm1',
        type: 'preventive',
        description: 'Quarterly filter replacement and system cleaning',
        scheduledDate: '2024-12-15',
        cost: 5000,
        vendor: 'Climate Solutions Pvt Ltd',
        technician: 'Raj Kumar',
        status: 'scheduled',
        nextDueDate: '2025-03-15',
        parts: [
          { name: 'Air Filter', cost: 800, quantity: 4 },
          { name: 'Refrigerant', cost: 2000, quantity: 1 }
        ],
        notes: 'Replace all filters and check refrigerant levels'
      }
    ],
    documents: [
      {
        _id: 'doc4',
        name: 'Installation Manual',
        type: 'manual',
        fileUrl: '/documents/hvac-manual.pdf',
        uploadDate: '2023-08-20'
      }
    ],
    specifications: {
      capacity: '5 Tons',
      power: '380V 3-Phase',
      refrigerant: 'R410A',
      efficiency: '3.5 EER'
    },
    tags: ['hvac', 'climate', 'infrastructure'],
    createdAt: '2023-08-20T08:00:00Z',
    updatedAt: '2024-12-01T10:15:00Z'
  }
];

const sampleDepreciationSchedule: DepreciationSchedule[] = [
  { year: 1, beginningBookValue: 85000, depreciationExpense: 20000, accumulatedDepreciation: 20000, endingBookValue: 65000 },
  { year: 2, beginningBookValue: 65000, depreciationExpense: 20000, accumulatedDepreciation: 40000, endingBookValue: 45000 },
  { year: 3, beginningBookValue: 45000, depreciationExpense: 20000, accumulatedDepreciation: 60000, endingBookValue: 25000 },
  { year: 4, beginningBookValue: 25000, depreciationExpense: 20000, accumulatedDepreciation: 80000, endingBookValue: 5000 }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(sampleAssets);
  const [selectedView, setSelectedView] = useState<'list' | 'grid' | 'analytics'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showDepreciation, setShowDepreciation] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssignment, setShowAssignment] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get unique categories
  const categories = Array.from(new Set(assets.map(asset => asset.category)));

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || asset.status === selectedStatus;
    const matchesCondition = selectedCondition === 'all' || asset.condition === selectedCondition;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesCondition;
  });

  // Calculate statistics
  const stats = {
    totalAssets: assets.length,
    totalValue: assets.reduce((sum, asset) => sum + asset.purchase.cost, 0),
    currentBookValue: assets.reduce((sum, asset) => sum + asset.depreciation.currentBookValue, 0),
    activeAssets: assets.filter(asset => asset.status === 'active').length,
    underMaintenance: assets.filter(asset => asset.status === 'under_maintenance').length,
    avgAge: assets.length > 0 ? assets.reduce((sum, asset) => {
      const purchaseDate = new Date(asset.purchase.date);
      const now = new Date();
      const yearsDiff = (now.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
      return sum + yearsDiff;
    }, 0) / assets.length : 0,
    categoriesCount: categories.length
  };

  // Analytics data
  const categoryData = categories.map(category => {
    const categoryAssets = assets.filter(asset => asset.category === category);
    return {
      name: category,
      count: categoryAssets.length,
      value: categoryAssets.reduce((sum, asset) => sum + asset.purchase.cost, 0),
      bookValue: categoryAssets.reduce((sum, asset) => sum + asset.depreciation.currentBookValue, 0)
    };
  });

  const conditionData = [
    { name: 'Excellent', value: assets.filter(a => a.condition === 'excellent').length, color: '#10B981' },
    { name: 'Good', value: assets.filter(a => a.condition === 'good').length, color: '#3B82F6' },
    { name: 'Fair', value: assets.filter(a => a.condition === 'fair').length, color: '#F59E0B' },
    { name: 'Poor', value: assets.filter(a => a.condition === 'poor').length, color: '#EF4444' },
    { name: 'Critical', value: assets.filter(a => a.condition === 'critical').length, color: '#DC2626' }
  ];

  const depreciationData = sampleDepreciationSchedule;

  const maintenanceUpcoming = assets.reduce((count, asset) => {
    return count + asset.maintenance.filter(m => m.status === 'scheduled' && new Date(m.scheduledDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length;
  }, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'under_maintenance': return <WrenchScrewdriverIcon className="h-4 w-4 text-amber-500" />;
      case 'disposed': return <XCircleIcon className="h-4 w-4 text-gray-500" />;
      case 'retired': return <ClockIcon className="h-4 w-4 text-gray-500" />;
      default: return <CheckCircleIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'under_maintenance': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'disposed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'retired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
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

  const formatYears = (years: number) => {
    return `${years.toFixed(1)} years`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Asset Management</h1>
              <p className="text-gray-600">Track fixed assets, manage depreciation, and schedule maintenance</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowMaintenance(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <WrenchScrewdriverIcon className="h-5 w-5 mr-2 text-amber-600" />
                Maintenance
                {maintenanceUpcoming > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                    {maintenanceUpcoming}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowDepreciation(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Depreciation
              </button>
              <button
                onClick={() => setShowAddAsset(true)}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Asset
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalAssets}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{formatCurrency(stats.totalValue)}</span>
                  <span className="ml-1">total cost</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Book Value</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.currentBookValue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-green-600">
                    {formatCurrency(stats.totalValue - stats.currentBookValue)}
                  </span>
                  <span className="ml-1">depreciated</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Assets</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeAssets}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-blue-600">{stats.underMaintenance}</span>
                  <span className="ml-1">under maintenance</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Age</p>
                  <p className="text-2xl font-bold text-purple-600">{formatYears(stats.avgAge)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-purple-600">{stats.categoriesCount}</span>
                  <span className="ml-1">categories</span>
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
                  placeholder="Search assets, codes, or serial numbers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full sm:w-80 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="disposed">Disposed</option>
                <option value="retired">Retired</option>
              </select>

              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Conditions</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="critical">Critical</option>
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
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {selectedView === 'analytics' ? (
          <div className="space-y-8">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Distribution */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Assets by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="count"
                      label={({ name, count }) => `${name}: ${count}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Condition Distribution */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Condition</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={conditionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Value by Category */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Asset Value by Category</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar yAxisId="left" dataKey="value" fill="#3B82F6" name="Purchase Cost" />
                  <Bar yAxisId="left" dataKey="bookValue" fill="#10B981" name="Book Value" />
                  <Line yAxisId="right" type="monotone" dataKey="count" stroke="#F59E0B" name="Count" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Depreciation Schedule */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Depreciation Schedule (Sample Asset)</h3>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={depreciationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Area type="monotone" dataKey="beginningBookValue" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Beginning Value" />
                  <Area type="monotone" dataKey="accumulatedDepreciation" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.6} name="Accumulated Depreciation" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : selectedView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAssets.map((asset) => {
              const ageInYears = (new Date().getTime() - new Date(asset.purchase.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
              const StatusIcon = asset.status === 'active' ? CheckCircleIcon : 
                                asset.status === 'under_maintenance' ? WrenchScrewdriverIcon : ClockIcon;
              
              return (
                <div key={asset._id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{asset.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">Code: {asset.assetCode}</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(asset.purchase.cost)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-3 w-3" />
                        <span className="capitalize">{asset.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Value:</span>
                      <span className="font-medium">{formatCurrency(asset.depreciation.currentBookValue)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Condition:</span>
                      <span className={`font-medium capitalize ${getConditionColor(asset.condition)}`}>
                        {asset.condition}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{ageInYears.toFixed(1)} years</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{asset.location.building}</span>
                    </div>
                  </div>

                  {asset.assignments.length > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-xs text-blue-700 font-medium">Assigned to:</p>
                      <p className="text-sm text-blue-900">{asset.assignments[0].employeeName}</p>
                      <p className="text-xs text-blue-600">{asset.assignments[0].department}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedAsset(asset)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowAssignment(true)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <ArrowPathIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{asset.category}</p>
                      <p className="text-xs text-gray-500">{asset.depreciation.method.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asset Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status & Condition
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Financial
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredAssets.map((asset) => {
                    const ageInYears = (new Date().getTime() - new Date(asset.purchase.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
                    
                    return (
                      <tr key={asset._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                            <div className="text-sm text-gray-600">Code: {asset.assetCode}</div>
                            <div className="text-xs text-gray-500">{asset.category} • {asset.subcategory}</div>
                            {asset.serialNumber && (
                              <div className="text-xs text-gray-500">SN: {asset.serialNumber}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                              {getStatusIcon(asset.status)}
                              <span className="ml-1 capitalize">{asset.status.replace('_', ' ')}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Condition: <span className={`capitalize font-medium ${getConditionColor(asset.condition)}`}>
                                {asset.condition}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              Age: {ageInYears.toFixed(1)} years
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(asset.purchase.cost)}
                            </div>
                            <div className="text-xs text-gray-600">
                              Book: {formatCurrency(asset.depreciation.currentBookValue)}
                            </div>
                            <div className="text-xs text-gray-600">
                              Method: {asset.depreciation.method.replace('_', ' ')}
                            </div>
                            <div className="text-xs text-gray-600">
                              Life: {asset.depreciation.usefulLife} years
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {asset.assignments.length > 0 ? (
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {asset.assignments[0].employeeName}
                              </div>
                              <div className="text-xs text-gray-600">{asset.assignments[0].department}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(asset.assignments[0].assignedDate)}
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-500">Not assigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{asset.location.building}</div>
                          <div className="text-xs text-gray-600">{asset.location.floor}</div>
                          <div className="text-xs text-gray-500">{asset.location.department}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedAsset(asset)}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowAssignment(true)}
                              className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            >
                              <ArrowPathIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-red-600 transition-colors">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all' || selectedCondition !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first asset.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && selectedCondition === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddAsset(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Asset
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {showAddAsset && (
        <AddAssetModal
          onClose={() => setShowAddAsset(false)}
          onSubmit={(assetData) => {
            const newAsset: Asset = {
              _id: Date.now().toString(),
              ...assetData,
              status: 'active',
              condition: 'excellent',
              assignments: [],
              maintenance: [],
              documents: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setAssets(prev => [newAsset, ...prev]);
            setShowAddAsset(false);
          }}
          categories={categories}
        />
      )}

      {selectedAsset && (
        <AssetDetailModal
          asset={selectedAsset}
          onClose={() => setSelectedAsset(null)}
          onUpdate={(updatedAsset) => {
            setAssets(prev => prev.map(asset => 
              asset._id === updatedAsset._id ? updatedAsset : asset
            ));
          }}
        />
      )}

      {showMaintenance && (
        <MaintenanceModal
          assets={assets}
          onClose={() => setShowMaintenance(false)}
        />
      )}

      {showDepreciation && (
        <DepreciationModal
          assets={assets}
          onClose={() => setShowDepreciation(false)}
        />
      )}

      {showAssignment && (
        <AssignmentModal
          assets={assets}
          onClose={() => setShowAssignment(false)}
          onAssign={(assetId, assignment) => {
            setAssets(prev => prev.map(asset => 
              asset._id === assetId 
                ? { ...asset, assignments: [...asset.assignments, { ...assignment, _id: Date.now().toString() }] }
                : asset
            ));
          }}
        />
      )}
    </div>
  );
}

// Add Asset Modal Component
interface AddAssetModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Asset>) => void;
  categories: string[];
}

function AddAssetModal({ onClose, onSubmit, categories }: AddAssetModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    assetCode: '',
    category: '',
    subcategory: '',
    building: '',
    floor: '',
    room: '',
    department: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: '0',
    supplier: '',
    invoiceNumber: '',
    warrantyExpiry: '',
    warrantyDetails: '',
    depreciationMethod: 'straight_line',
    usefulLife: '5',
    salvageValue: '0',
    serialNumber: '',
    barcode: '',
    tags: '',
    specifications: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const specifications: { [key: string]: string | number } = {};
    if (formData.specifications) {
      formData.specifications.split(',').forEach(spec => {
        const [key, value] = spec.split(':').map(s => s.trim());
        if (key && value) {
          specifications[key] = isNaN(Number(value)) ? value : Number(value);
        }
      });
    }

    onSubmit({
      ...formData,
      purchase: {
        date: formData.purchaseDate,
        cost: parseFloat(formData.purchaseCost),
        supplier: formData.supplier,
        invoiceNumber: formData.invoiceNumber,
        warrantyExpiry: formData.warrantyExpiry,
        warrantyDetails: formData.warrantyDetails
      },
      location: {
        building: formData.building,
        floor: formData.floor,
        room: formData.room,
        department: formData.department
      },
      depreciation: {
        method: formData.depreciationMethod as any,
        usefulLife: parseInt(formData.usefulLife),
        salvageValue: parseFloat(formData.salvageValue),
        rate: 100 / parseInt(formData.usefulLife),
        accumulated: 0,
        currentBookValue: parseFloat(formData.purchaseCost),
        lastCalculationDate: new Date().toISOString()
      },
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      specifications
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Asset</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter asset name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Asset Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.assetCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, assetCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Unique asset identifier"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Asset description"
                  />
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
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                    <option value="new">+ Add New Category</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Manufacturer serial number"
                  />
                </div>
              </div>
            </div>

            {/* Purchase Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.purchaseCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, purchaseCost: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Invoice/reference number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Expiry</label>
                  <input
                    type="date"
                    value={formData.warrantyExpiry}
                    onChange={(e) => setFormData(prev => ({ ...prev, warrantyExpiry: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warranty Details</label>
                  <input
                    type="text"
                    value={formData.warrantyDetails}
                    onChange={(e) => setFormData(prev => ({ ...prev, warrantyDetails: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Warranty terms"
                  />
                </div>
              </div>
            </div>

            {/* Depreciation */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Depreciation Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Method *</label>
                  <select
                    required
                    value={formData.depreciationMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, depreciationMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="straight_line">Straight Line</option>
                    <option value="declining_balance">Declining Balance</option>
                    <option value="sum_of_years">Sum of Years</option>
                    <option value="units_of_production">Units of Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Useful Life (Years) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.usefulLife}
                    onChange={(e) => setFormData(prev => ({ ...prev, usefulLife: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salvage Value (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.salvageValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, salvageValue: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Building *</label>
                  <input
                    type="text"
                    required
                    value={formData.building}
                    onChange={(e) => setFormData(prev => ({ ...prev, building: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Building name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Floor *</label>
                  <input
                    type="text"
                    required
                    value={formData.floor}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Floor number/name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Room</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData(prev => ({ ...prev, room: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Room number/name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Department name"
                  />
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    onChange={(e) => setFormData(prev => ({ ...prev, barcode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Barcode number"
                  />
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

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Specifications</label>
                  <textarea
                    value={formData.specifications}
                    onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="key:value, key:value format (e.g., processor:Intel i7, memory:16GB)"
                  />
                </div>
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
                Add Asset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Asset Detail Modal Component
interface AssetDetailModalProps {
  asset: Asset;
  onClose: () => void;
  onUpdate: (asset: Asset) => void;
}

function AssetDetailModal({ asset, onClose, onUpdate }: AssetDetailModalProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'under_maintenance': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'disposed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'retired': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const ageInYears = (new Date().getTime() - new Date(asset.purchase.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Asset Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{asset.name}</h3>
                <p className="text-gray-600">Code: {asset.assetCode}</p>
                <p className="text-sm text-gray-500">{asset.category} • {asset.subcategory}</p>
                {asset.serialNumber && (
                  <p className="text-sm text-gray-500">Serial: {asset.serialNumber}</p>
                )}
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(asset.status)}`}>
                <span className="capitalize">{asset.status.replace('_', ' ')}</span>
              </div>
            </div>

            {/* Purchase & Financial */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Purchase Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Date:</span>
                    <span className="font-medium">{formatDate(asset.purchase.date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Purchase Cost:</span>
                    <span className="font-bold text-green-600">{formatCurrency(asset.purchase.cost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supplier:</span>
                    <span className="font-medium">{asset.purchase.supplier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Invoice:</span>
                    <span className="font-medium">{asset.purchase.invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{ageInYears.toFixed(1)} years</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Depreciation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Book Value:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(asset.depreciation.currentBookValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Accumulated:</span>
                    <span className="font-medium">{formatCurrency(asset.depreciation.accumulated)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{asset.depreciation.method.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Useful Life:</span>
                    <span className="font-medium">{asset.depreciation.usefulLife} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Salvage Value:</span>
                    <span className="font-medium">{formatCurrency(asset.depreciation.salvageValue)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Building:</span>
                    <span className="font-medium">{asset.location.building}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Floor:</span>
                    <span className="font-medium">{asset.location.floor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room:</span>
                    <span className="font-medium">{asset.location.room || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{asset.location.department}</span>
                  </div>
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Assignment</h4>
                {asset.assignments.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned to:</span>
                      <span className="font-medium">{asset.assignments[0].employeeName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Department:</span>
                      <span className="font-medium">{asset.assignments[0].department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Assigned Date:</span>
                      <span className="font-medium">{formatDate(asset.assignments[0].assignedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purpose:</span>
                      <span className="font-medium">{asset.assignments[0].purpose}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">Not assigned</p>
                )}
              </div>
            </div>

            {/* Description */}
            {asset.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{asset.description}</p>
              </div>
            )}

            {/* Specifications */}
            {Object.keys(asset.specifications).length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Specifications</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(asset.specifications).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tags */}
            {asset.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {asset.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance Records */}
            {asset.maintenance.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Maintenance Records</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-2">Type</th>
                        <th className="text-left py-2">Description</th>
                        <th className="text-left py-2">Scheduled</th>
                        <th className="text-left py-2">Cost</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {asset.maintenance.map((maintenance) => (
                        <tr key={maintenance._id} className="border-b border-gray-100">
                          <td className="py-2 capitalize">{maintenance.type}</td>
                          <td className="py-2">{maintenance.description}</td>
                          <td className="py-2">{formatDate(maintenance.scheduledDate)}</td>
                          <td className="py-2">{formatCurrency(maintenance.cost)}</td>
                          <td className="py-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              maintenance.status === 'completed' ? 'bg-green-100 text-green-800' :
                              maintenance.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              maintenance.status === 'scheduled' ? 'bg-amber-100 text-amber-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {maintenance.status.replace('_', ' ')}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Documents */}
            {asset.documents.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Documents</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {asset.documents.map((document) => (
                    <div key={document._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{document.name}</p>
                        <p className="text-xs text-gray-600 capitalize">{document.type}</p>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View
                      </button>
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

// Maintenance Modal Component
interface MaintenanceModalProps {
  assets: Asset[];
  onClose: () => void;
}

function MaintenanceModal({ assets, onClose }: MaintenanceModalProps) {
  const upcomingMaintenance = assets.flatMap(asset => 
    asset.maintenance.filter(m => m.status === 'scheduled' && new Date(m.scheduledDate) >= new Date())
      .map(m => ({ ...m, assetName: asset.name, assetCode: asset.assetCode }))
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

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

  const getDaysUntil = (dateString: string) => {
    const days = Math.ceil((new Date(dateString).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Maintenance Schedule</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {upcomingMaintenance.length > 0 ? (
              <div className="space-y-4">
                {upcomingMaintenance.map((maintenance) => {
                  const daysUntil = getDaysUntil(maintenance.scheduledDate);
                  const isUrgent = daysUntil <= 7;
                  
                  return (
                    <div key={maintenance._id} className={`border rounded-lg p-4 ${
                      isUrgent ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{maintenance.assetName}</h3>
                            <span className="text-sm text-gray-600">({maintenance.assetCode})</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              maintenance.type === 'preventive' ? 'bg-blue-100 text-blue-800' :
                              maintenance.type === 'corrective' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {maintenance.type}
                            </span>
                          </div>
                          
                          <p className="text-gray-700 mb-2">{maintenance.description}</p>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Scheduled:</span>
                              <p className="font-medium">{formatDate(maintenance.scheduledDate)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Cost:</span>
                              <p className="font-medium">{formatCurrency(maintenance.cost)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Vendor:</span>
                              <p className="font-medium">{maintenance.vendor}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Technician:</span>
                              <p className="font-medium">{maintenance.technician}</p>
                            </div>
                          </div>

                          {maintenance.parts.length > 0 && (
                            <div className="mt-3">
                              <span className="text-sm text-gray-600">Parts Required:</span>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {maintenance.parts.map((part, index) => (
                                  <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                    {part.name} ({part.quantity}) - {formatCurrency(part.cost)}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {maintenance.notes && (
                            <div className="mt-2">
                              <span className="text-sm text-gray-600">Notes:</span>
                              <p className="text-sm text-gray-700">{maintenance.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="ml-4 text-right">
                          <div className={`text-sm font-medium ${
                            isUrgent ? 'text-red-600' : daysUntil <= 30 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {daysUntil > 0 ? `${daysUntil} days` : 'Overdue'}
                          </div>
                          <div className="flex space-x-2 mt-2">
                            <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                              Edit
                            </button>
                            <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors">
                              Complete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <WrenchScrewdriverIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No upcoming maintenance</h3>
                <p className="mt-1 text-sm text-gray-500">All scheduled maintenance is up to date.</p>
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

// Depreciation Modal Component
interface DepreciationModalProps {
  assets: Asset[];
  onClose: () => void;
}

function DepreciationModal({ assets, onClose }: DepreciationModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const totalOriginalValue = assets.reduce((sum, asset) => sum + asset.purchase.cost, 0);
  const totalBookValue = assets.reduce((sum, asset) => sum + asset.depreciation.currentBookValue, 0);
  const totalAccumulated = assets.reduce((sum, asset) => sum + asset.depreciation.accumulated, 0);

  const methodBreakdown = assets.reduce((acc, asset) => {
    const method = asset.depreciation.method;
    if (!acc[method]) {
      acc[method] = { count: 0, value: 0, bookValue: 0 };
    }
    acc[method].count++;
    acc[method].value += asset.purchase.cost;
    acc[method].bookValue += asset.depreciation.currentBookValue;
    return acc;
  }, {} as Record<string, { count: number; value: number; bookValue: number }>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Depreciation Report</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Original Value</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalOriginalValue)}</p>
                <p className="text-sm text-gray-600">{assets.length} assets</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Current Book Value</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalBookValue)}</p>
                <p className="text-sm text-gray-600">Net value</p>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Accumulated Depreciation</h4>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(totalAccumulated)}</p>
                <p className="text-sm text-gray-600">
                  {((totalAccumulated / totalOriginalValue) * 100).toFixed(1)}% of original
                </p>
              </div>
            </div>

            {/* Method Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Depreciation by Method</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Assets</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Original Value</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Book Value</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Depreciation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(methodBreakdown).map(([method, data]) => (
                      <tr key={method}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 capitalize">
                          {method.replace('_', ' ')}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{data.count}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(data.value)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(data.bookValue)}</td>
                        <td className="px-4 py-3 text-sm text-red-600 text-right font-medium">
                          {formatCurrency(data.value - data.bookValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Depreciation Methods Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(methodBreakdown).map(([method, data]) => ({
                      name: method.replace('_', ' '),
                      value: data.value
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                  >
                    {Object.entries(methodBreakdown).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Individual Asset Depreciation */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Asset Depreciation Details</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Original</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Book Value</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Depreciation</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% Depreciated</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {assets.map((asset) => {
                      const depreciation = asset.purchase.cost - asset.depreciation.currentBookValue;
                      const depreciationPercent = (depreciation / asset.purchase.cost) * 100;
                      
                      return (
                        <tr key={asset._id}>
                          <td className="px-4 py-3">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{asset.name}</div>
                              <div className="text-xs text-gray-600">{asset.assetCode}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(asset.purchase.cost)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">{formatCurrency(asset.depreciation.currentBookValue)}</td>
                          <td className="px-4 py-3 text-sm text-red-600 text-right font-medium">{formatCurrency(depreciation)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{depreciationPercent.toFixed(1)}%</td>
                          <td className="px-4 py-3 text-sm text-gray-600 capitalize">{asset.depreciation.method.replace('_', ' ')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Assignment Modal Component
interface AssignmentModalProps {
  assets: Asset[];
  onClose: () => void;
  onAssign: (assetId: string, assignment: Omit<AssetAssignment, '_id'>) => void;
}

function AssignmentModal({ assets, onClose, onAssign }: AssignmentModalProps) {
  const [formData, setFormData] = useState({
    assetId: '',
    employeeName: '',
    department: '',
    purpose: '',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAssign(formData.assetId, {
      employeeId: `emp_${Date.now()}`,
      employeeName: formData.employeeName,
      department: formData.department,
      assignedDate: new Date().toISOString(),
      purpose: formData.purpose,
      location: formData.location,
      status: 'assigned'
    });
    onClose();
  };

  const unassignedAssets = assets.filter(asset => 
    !asset.assignments.some(assignment => assignment.status === 'assigned')
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Assign Asset</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Asset *</label>
              <select
                required
                value={formData.assetId}
                onChange={(e) => setFormData(prev => ({ ...prev, assetId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select asset</option>
                {unassignedAssets.map(asset => (
                  <option key={asset._id} value={asset._id}>
                    {asset.name} ({asset.assetCode}) - {formatCurrency(asset.purchase.cost)}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={formData.employeeName}
                  onChange={(e) => setFormData(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Employee name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Department *</label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Department"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Purpose *</label>
              <input
                type="text"
                required
                value={formData.purpose}
                onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Purpose of assignment"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Assignment location"
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
                Assign Asset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0
  }).format(amount);
};