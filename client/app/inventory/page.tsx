'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CubeIcon,
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
  TruckIcon,
  ArchiveBoxIcon,
  BuildingStorefrontIcon,
  TagIcon,
  ListBulletIcon,
  Squares2X2Icon,
  CalendarDaysIcon as CalendarIcon,
  ClockIcon,
  BeakerIcon
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
interface InventoryItem {
  _id: string;
  name: string;
  description: string;
  sku: string;
  category: string;
  subcategory?: string;
  unit: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  sellingPrice: number;
  supplier: {
    _id: string;
    name: string;
    contact: string;
    leadTime: number;
  };
  location: {
    warehouse: string;
    section: string;
    shelf?: string;
  };
  valuation: {
    method: 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification';
    totalValue: number;
    averageCost: number;
    lastPurchaseDate: string;
    lastPurchasePrice: number;
  };
  stockMovements: StockMovement[];
  alerts: {
    lowStock: boolean;
    overstock: boolean;
    expired: boolean;
  };
  tags: string[];
  barcode?: string;
  serialNumbers?: string[];
  expiryDate?: string;
  batchNumber?: string;
  image?: string;
  status: 'active' | 'discontinued' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface StockMovement {
  _id: string;
  type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return';
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  reference: string;
  reason: string;
  date: string;
  userId: string;
  userName: string;
  batchNumber?: string;
  expiryDate?: string;
  notes?: string;
}

interface Supplier {
  _id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  paymentTerms: string;
  leadTime: number;
  rating: number;
  category: string;
  totalOrders: number;
  totalValue: number;
  lastOrderDate: string;
}

interface InventoryValuation {
  method: 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification';
  totalValue: number;
  totalQuantity: number;
  averageUnitCost: number;
  categoryBreakdown: Array<{
    category: string;
    value: number;
    quantity: number;
    percentage: number;
  }>;
  valuationDate: string;
}

// Sample data
const sampleInventoryItems: InventoryItem[] = [
  {
    _id: '1',
    name: 'Laptop Computer Dell XPS 13',
    description: 'High-performance ultrabook for business use',
    sku: 'DELL-XPS13-001',
    category: 'Electronics',
    subcategory: 'Computers',
    unit: 'piece',
    currentStock: 25,
    minStockLevel: 10,
    maxStockLevel: 50,
    reorderPoint: 15,
    reorderQuantity: 20,
    unitCost: 85000,
    sellingPrice: 95000,
    supplier: {
      _id: 'sup1',
      name: 'Dell Technologies',
      contact: 'Rahul Sharma',
      leadTime: 7
    },
    location: {
      warehouse: 'Main Warehouse',
      section: 'A-1',
      shelf: 'SH-001'
    },
    valuation: {
      method: 'weighted_average',
      totalValue: 2125000,
      averageCost: 85000,
      lastPurchaseDate: '2024-12-01',
      lastPurchasePrice: 85000
    },
    stockMovements: [
      {
        _id: 'mv1',
        type: 'purchase',
        quantity: 20,
        unitCost: 85000,
        totalCost: 1700000,
        reference: 'PO-2024-001',
        reason: 'Initial stock purchase',
        date: '2024-12-01T10:00:00Z',
        userId: 'user1',
        userName: 'John Doe'
      },
      {
        _id: 'mv2',
        type: 'purchase',
        quantity: 5,
        unitCost: 85000,
        totalCost: 425000,
        reference: 'PO-2024-002',
        reason: 'Additional stock',
        date: '2024-12-05T14:30:00Z',
        userId: 'user1',
        userName: 'John Doe'
      }
    ],
    alerts: {
      lowStock: false,
      overstock: false,
      expired: false
    },
    tags: ['electronics', 'computers', 'business'],
    barcode: '1234567890123',
    status: 'active',
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-08T16:45:00Z'
  },
  {
    _id: '2',
    name: 'Office Chair Ergonomic',
    description: 'Adjustable ergonomic office chair with lumbar support',
    sku: 'CHAIR-ERG-001',
    category: 'Furniture',
    subcategory: 'Chairs',
    unit: 'piece',
    currentStock: 8,
    minStockLevel: 5,
    maxStockLevel: 30,
    reorderPoint: 10,
    reorderQuantity: 15,
    unitCost: 12000,
    sellingPrice: 15000,
    supplier: {
      _id: 'sup2',
      name: 'Ergonomic Solutions',
      contact: 'Priya Patel',
      leadTime: 5
    },
    location: {
      warehouse: 'Main Warehouse',
      section: 'B-2',
      shelf: 'SH-015'
    },
    valuation: {
      method: 'fifo',
      totalValue: 96000,
      averageCost: 12000,
      lastPurchaseDate: '2024-11-15',
      lastPurchasePrice: 12000
    },
    stockMovements: [
      {
        _id: 'mv3',
        type: 'purchase',
        quantity: 15,
        unitCost: 12000,
        totalCost: 180000,
        reference: 'PO-2024-003',
        reason: 'Bulk purchase',
        date: '2024-11-15T09:00:00Z',
        userId: 'user2',
        userName: 'Jane Smith'
      },
      {
        _id: 'mv4',
        type: 'sale',
        quantity: 7,
        reference: 'SO-2024-001',
        reason: 'Office setup',
        date: '2024-12-07T11:30:00Z',
        userId: 'user3',
        userName: 'Mike Johnson'
      }
    ],
    alerts: {
      lowStock: true,
      overstock: false,
      expired: false
    },
    tags: ['furniture', 'office', 'ergonomic'],
    status: 'active',
    createdAt: '2024-11-15T09:00:00Z',
    updatedAt: '2024-12-07T11:30:00Z'
  },
  {
    _id: '3',
    name: 'Printer Ink Cartridge Black',
    description: 'High-yield black ink cartridge for laser printers',
    sku: 'INK-BLK-001',
    category: 'Consumables',
    subcategory: 'Ink & Toner',
    unit: 'piece',
    currentStock: 45,
    minStockLevel: 20,
    maxStockLevel: 100,
    reorderPoint: 25,
    reorderQuantity: 50,
    unitCost: 2500,
    sellingPrice: 3200,
    supplier: {
      _id: 'sup3',
      name: 'Print Solutions Ltd',
      contact: 'Amit Kumar',
      leadTime: 3
    },
    location: {
      warehouse: 'Main Warehouse',
      section: 'C-3',
      shelf: 'SH-025'
    },
    valuation: {
      method: 'lifo',
      totalValue: 112500,
      averageCost: 2500,
      lastPurchaseDate: '2024-12-06',
      lastPurchasePrice: 2500
    },
    stockMovements: [
      {
        _id: 'mv5',
        type: 'purchase',
        quantity: 50,
        unitCost: 2500,
        totalCost: 125000,
        reference: 'PO-2024-004',
        reason: 'Regular replenishment',
        date: '2024-12-06T15:00:00Z',
        userId: 'user1',
        userName: 'John Doe'
      }
    ],
    alerts: {
      lowStock: false,
      overstock: false,
      expired: false
    },
    tags: ['consumables', 'printer', 'ink'],
    barcode: '9876543210987',
    status: 'active',
    createdAt: '2024-12-06T15:00:00Z',
    updatedAt: '2024-12-06T15:00:00Z'
  }
];

const sampleSuppliers: Supplier[] = [
  {
    _id: 'sup1',
    name: 'Dell Technologies',
    contactPerson: 'Rahul Sharma',
    email: 'rahul.sharma@dell.com',
    phone: '+91-9876543210',
    address: 'Tech Park, Bangalore',
    paymentTerms: 'Net 30',
    leadTime: 7,
    rating: 4.8,
    category: 'Electronics',
    totalOrders: 45,
    totalValue: 2850000,
    lastOrderDate: '2024-12-01'
  },
  {
    _id: 'sup2',
    name: 'Ergonomic Solutions',
    contactPerson: 'Priya Patel',
    email: 'priya@ergosol.com',
    phone: '+91-9876543211',
    address: 'Furniture District, Mumbai',
    paymentTerms: 'Net 15',
    leadTime: 5,
    rating: 4.6,
    category: 'Furniture',
    totalOrders: 28,
    totalValue: 840000,
    lastOrderDate: '2024-11-15'
  }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>(sampleInventoryItems);
  const [suppliers] = useState<Supplier[]>(sampleSuppliers);
  const [selectedView, setSelectedView] = useState<'list' | 'grid' | 'analytics'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [showStockMovement, setShowStockMovement] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showValuation, setShowValuation] = useState(false);
  const [valuationMethod, setValuationMethod] = useState<'fifo' | 'lifo' | 'weighted_average' | 'specific_identification'>('weighted_average');
  const [showAlerts, setShowAlerts] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get unique categories
  const categories = Array.from(new Set(inventory.map(item => item.category)));

  // Filter inventory items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    totalItems: inventory.length,
    totalValue: inventory.reduce((sum, item) => sum + item.valuation.totalValue, 0),
    totalStock: inventory.reduce((sum, item) => sum + item.currentStock, 0),
    lowStockItems: inventory.filter(item => item.alerts.lowStock).length,
    overstockItems: inventory.filter(item => item.alerts.overstock).length,
    outOfStockItems: inventory.filter(item => item.currentStock === 0).length,
    activeSuppliers: suppliers.length,
    categoriesCount: categories.length
  };

  // Analytics data
  const categoryData = categories.map(category => {
    const items = inventory.filter(item => item.category === category);
    return {
      name: category,
      value: items.reduce((sum, item) => sum + item.valuation.totalValue, 0),
      quantity: items.reduce((sum, item) => sum + item.currentStock, 0),
      items: items.length
    };
  });

  const stockMovementData = [
    { date: '2024-11-01', purchases: 45000, sales: 32000, adjustments: 5000 },
    { date: '2024-11-08', purchases: 62000, sales: 41000, adjustments: -2000 },
    { date: '2024-11-15', purchases: 38000, sales: 55000, adjustments: 3000 },
    { date: '2024-11-22', purchases: 75000, sales: 48000, adjustments: 1000 },
    { date: '2024-11-29', purchases: 54000, sales: 39000, adjustments: -1500 },
    { date: '2024-12-06', purchases: 68000, sales: 45000, adjustments: 2500 },
    { date: '2024-12-08', purchases: 32000, sales: 28000, adjustments: 800 }
  ];

  const valuationBreakdown = categories.map(category => {
    const items = inventory.filter(item => item.category === category);
    const totalValue = items.reduce((sum, item) => sum + item.valuation.totalValue, 0);
    return {
      category,
      fifo: totalValue * 1.05, // Simulate FIFO valuation
      lifo: totalValue * 0.98, // Simulate LIFO valuation
      weighted: totalValue,
      actual: totalValue
    };
  });

  // Stock alerts
  const stockAlerts = inventory.filter(item => 
    item.alerts.lowStock || item.alerts.overstock || item.currentStock === 0
  );

  const handleStockUpdate = (itemId: string, newQuantity: number, movementType: StockMovement['type'], reason: string) => {
    setInventory(prev => prev.map(item => {
      if (item._id === itemId) {
        const updatedMovements = [...item.stockMovements, {
          _id: Date.now().toString(),
          type: movementType,
          quantity: newQuantity - item.currentStock,
          reference: `ADJ-${Date.now()}`,
          reason,
          date: new Date().toISOString(),
          userId: 'current-user',
          userName: 'Current User'
        }];

        const newAlerts = {
          lowStock: newQuantity <= item.reorderPoint,
          overstock: newQuantity >= item.maxStockLevel,
          expired: false // Would check expiry date in real app
        };

        return {
          ...item,
          currentStock: newQuantity,
          stockMovements: updatedMovements,
          alerts: newAlerts,
          updatedAt: new Date().toISOString()
        };
      }
      return item;
    }));
  };

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200', icon: ExclamationTriangleIcon };
    } else if (item.alerts.lowStock) {
      return { label: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: ExclamationTriangleIcon };
    } else if (item.alerts.overstock) {
      return { label: 'Overstock', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ExclamationTriangleIcon };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircleIcon };
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Management & Valuation</h1>
              <p className="text-gray-600">Track stock levels, manage valuations, and optimize inventory costs</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowAlerts(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-amber-600" />
                Stock Alerts
                {stockAlerts.length > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                    {stockAlerts.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowValuation(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Valuation Report
              </button>
              <button
                onClick={() => setShowAddItem(true)}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Item
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Inventory Value</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalValue)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{formatNumber(stats.totalStock)}</span>
                  <span className="ml-1">total units</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CubeIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-green-600">{stats.categoriesCount}</span>
                  <span className="ml-1">categories</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Stock Alerts</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.lowStockItems}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-amber-600">{stats.outOfStockItems}</span>
                  <span className="ml-1">out of stock</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.activeSuppliers}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <TruckIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-blue-600">4.7</span>
                  <span className="ml-1">avg rating</span>
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
                  placeholder="Search items, SKU, or description..."
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
                <option value="discontinued">Discontinued</option>
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
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory Value by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Stock Movement Trend */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Movement Trend</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={stockMovementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="purchases" fill="#10B981" name="Purchases" />
                    <Bar dataKey="sales" fill="#EF4444" name="Sales" />
                    <Line type="monotone" dataKey="adjustments" stroke="#F59E0B" name="Adjustments" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Valuation Methods Comparison */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Valuation Methods Comparison</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={valuationBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="fifo" fill="#3B82F6" name="FIFO" />
                  <Bar dataKey="lifo" fill="#8B5CF6" name="LIFO" />
                  <Bar dataKey="weighted" fill="#10B981" name="Weighted Average" />
                  <Bar dataKey="actual" fill="#F59E0B" name="Current Cost" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Stock Status Overview */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Stock Status Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">
                    {inventory.filter(item => !item.alerts.lowStock && !item.alerts.overstock && item.currentStock > 0).length}
                  </p>
                  <p className="text-sm text-gray-600">In Stock</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ExclamationTriangleIcon className="h-8 w-8 text-amber-600" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{stats.lowStockItems}</p>
                  <p className="text-sm text-gray-600">Low Stock</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
                  <p className="text-sm text-gray-600">Out of Stock</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <ArchiveBoxIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{stats.overstockItems}</p>
                  <p className="text-sm text-gray-600">Overstock</p>
                </div>
              </div>
            </div>
          </div>
        ) : selectedView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInventory.map((item) => {
              const stockStatus = getStockStatus(item);
              const StatusIcon = stockStatus.icon;
              
              return (
                <div key={item._id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-1">SKU: {item.sku}</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(item.valuation.totalValue)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                      <div className="flex items-center space-x-1">
                        <StatusIcon className="h-3 w-3" />
                        <span>{stockStatus.label}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Stock:</span>
                      <span className="font-medium">{formatNumber(item.currentStock)} {item.unit}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Unit Cost:</span>
                      <span className="font-medium">{formatCurrency(item.unitCost)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Selling Price:</span>
                      <span className="font-medium text-green-600">{formatCurrency(item.sellingPrice)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Reorder Point:</span>
                      <span className="font-medium text-amber-600">{formatNumber(item.reorderPoint)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowStockMovement(true)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{item.category}</p>
                      <p className="text-xs text-gray-500">{item.location.warehouse}</p>
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
                      Item Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stock Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valuation
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
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
                  {filteredInventory.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const StatusIcon = stockStatus.icon;
                    
                    return (
                      <tr key={item._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-600">SKU: {item.sku}</div>
                            <div className="text-xs text-gray-500">{item.category} • {item.subcategory}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4 text-gray-500" />
                            <div>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                                {stockStatus.label}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {formatNumber(item.currentStock)} {item.unit}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(item.valuation.totalValue)}</div>
                          <div className="text-xs text-gray-600">Avg: {formatCurrency(item.valuation.averageCost)}</div>
                          <div className="text-xs text-gray-600">Method: {item.valuation.method.replace('_', ' ').toUpperCase()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.supplier.name}</div>
                          <div className="text-xs text-gray-600">Lead Time: {item.supplier.leadTime} days</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{item.location.warehouse}</div>
                          <div className="text-xs text-gray-600">{item.location.section}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedItem(item)}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowStockMovement(true)}
                              className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            >
                              <ArrowDownTrayIcon className="h-4 w-4" />
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
        {filteredInventory.length === 0 && (
          <div className="text-center py-12">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedCategory !== 'all' || selectedStatus !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by adding your first inventory item.'}
            </p>
            {!searchTerm && selectedCategory === 'all' && selectedStatus === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddItem(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Add Item
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {showAddItem && (
        <AddItemModal
          onClose={() => setShowAddItem(false)}
          onSubmit={(itemData) => {
            const newItem: InventoryItem = {
              _id: Date.now().toString(),
              ...itemData,
              stockMovements: [],
              alerts: {
                lowStock: false,
                overstock: false,
                expired: false
              },
              status: 'active',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setInventory(prev => [newItem, ...prev]);
            setShowAddItem(false);
          }}
          categories={categories}
          suppliers={suppliers}
        />
      )}

      {showStockMovement && (
        <StockMovementModal
          onClose={() => setShowStockMovement(false)}
          items={inventory}
          onUpdateStock={handleStockUpdate}
        />
      )}

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={(updatedItem) => {
            setInventory(prev => prev.map(item => 
              item._id === updatedItem._id ? updatedItem : item
            ));
          }}
        />
      )}

      {showValuation && (
        <ValuationModal
          inventory={inventory}
          categories={categories}
          onClose={() => setShowValuation(false)}
          method={valuationMethod}
          onMethodChange={setValuationMethod}
        />
      )}

      {showAlerts && (
        <StockAlertsModal
          items={stockAlerts}
          onClose={() => setShowAlerts(false)}
          onUpdateStock={handleStockUpdate}
        />
      )}
    </div>
  );
}

// Add Item Modal Component
interface AddItemModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<InventoryItem>) => void;
  categories: string[];
  suppliers: Supplier[];
}

function AddItemModal({ onClose, onSubmit, categories, suppliers }: AddItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category: '',
    subcategory: '',
    unit: 'piece',
    currentStock: '0',
    minStockLevel: '0',
    maxStockLevel: '0',
    reorderPoint: '0',
    reorderQuantity: '0',
    unitCost: '0',
    sellingPrice: '0',
    supplierId: '',
    warehouse: '',
    section: '',
    shelf: '',
    tags: '',
    barcode: '',
    expiryDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedSupplier = suppliers.find(s => s._id === formData.supplierId);
    if (!selectedSupplier) return;

    onSubmit({
      ...formData,
      currentStock: parseInt(formData.currentStock),
      minStockLevel: parseInt(formData.minStockLevel),
      maxStockLevel: parseInt(formData.maxStockLevel),
      reorderPoint: parseInt(formData.reorderPoint),
      reorderQuantity: parseInt(formData.reorderQuantity),
      unitCost: parseFloat(formData.unitCost),
      sellingPrice: parseFloat(formData.sellingPrice),
      supplier: {
        _id: selectedSupplier._id,
        name: selectedSupplier.name,
        contact: selectedSupplier.contactPerson,
        leadTime: selectedSupplier.leadTime
      },
      location: {
        warehouse: formData.warehouse,
        section: formData.section,
        shelf: formData.shelf
      },
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      valuation: {
        method: 'weighted_average',
        totalValue: parseInt(formData.currentStock) * parseFloat(formData.unitCost),
        averageCost: parseFloat(formData.unitCost),
        lastPurchaseDate: new Date().toISOString(),
        lastPurchasePrice: parseFloat(formData.unitCost)
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New Inventory Item</h2>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Stock Keeping Unit"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Item description"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram</option>
                    <option value="meter">Meter</option>
                    <option value="liter">Liter</option>
                    <option value="box">Box</option>
                    <option value="pack">Pack</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Stock Levels */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Levels</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.currentStock}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentStock: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minStockLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, minStockLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Stock Level</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.maxStockLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxStockLevel: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Point</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderPoint}
                    onChange={(e) => setFormData(prev => ({ ...prev, reorderPoint: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reorder Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reorderQuantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, reorderQuantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.unitCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitCost: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, sellingPrice: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Supplier & Location */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Supplier & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Supplier *</label>
                  <select
                    required
                    value={formData.supplierId}
                    onChange={(e) => setFormData(prev => ({ ...prev, supplierId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select supplier</option>
                    {suppliers.map(supplier => (
                      <option key={supplier._id} value={supplier._id}>{supplier.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Warehouse</label>
                  <input
                    type="text"
                    value={formData.warehouse}
                    onChange={(e) => setFormData(prev => ({ ...prev, warehouse: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Warehouse name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                  <input
                    type="text"
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Section/Bay"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shelf/Bin</label>
                  <input
                    type="text"
                    value={formData.shelf}
                    onChange={(e) => setFormData(prev => ({ ...prev, shelf: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Shelf or bin number"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter tags separated by commas"
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
                Add Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Stock Movement Modal Component
interface StockMovementModalProps {
  onClose: () => void;
  items: InventoryItem[];
  onUpdateStock: (itemId: string, newQuantity: number, type: StockMovement['type'], reason: string) => void;
}

function StockMovementModal({ onClose, items, onUpdateStock }: StockMovementModalProps) {
  const [formData, setFormData] = useState({
    itemId: '',
    type: 'adjustment' as StockMovement['type'],
    quantity: '0',
    reason: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = items.find(item => item._id === formData.itemId);
    if (!selectedItem) return;

    const newQuantity = selectedItem.currentStock + parseInt(formData.quantity);
    onUpdateStock(formData.itemId, newQuantity, formData.type, formData.reason);
    onClose();
  };

  const selectedItem = items.find(item => item._id === formData.itemId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Stock Movement</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Item *</label>
              <select
                required
                value={formData.itemId}
                onChange={(e) => setFormData(prev => ({ ...prev, itemId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select item</option>
                {items.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name} (Current: {item.currentStock} {item.unit})
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Current Stock Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="ml-2 font-medium">{selectedItem.currentStock} {selectedItem.unit}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Reorder Point:</span>
                    <span className="ml-2 font-medium">{selectedItem.reorderPoint}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Movement Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as StockMovement['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="purchase">Purchase</option>
                  <option value="sale">Sale</option>
                  <option value="adjustment">Adjustment</option>
                  <option value="transfer">Transfer</option>
                  <option value="return">Return</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity ({formData.type === 'sale' || formData.type === 'return' ? '-' : '+'}) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
              <input
                type="text"
                required
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Reason for stock movement"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes (optional)"
              />
            </div>

            {selectedItem && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">New Stock Level</h4>
                <p className="text-sm text-blue-700">
                  After this movement: <span className="font-bold">
                    {selectedItem.currentStock + parseInt(formData.quantity || '0')} {selectedItem.unit}
                  </span>
                </p>
                {(selectedItem.currentStock + parseInt(formData.quantity || '0')) <= selectedItem.reorderPoint && (
                  <p className="text-sm text-amber-700 mt-1">
                    ⚠️ Stock will be at or below reorder point
                  </p>
                )}
              </div>
            )}

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
                Update Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Item Detail Modal Component
interface ItemDetailModalProps {
  item: InventoryItem;
  onClose: () => void;
  onUpdate: (item: InventoryItem) => void;
}

function ItemDetailModal({ item, onClose, onUpdate }: ItemDetailModalProps) {
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

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (item.alerts.lowStock) {
      return { label: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    } else if (item.alerts.overstock) {
      return { label: 'Overstock', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    } else {
      return { label: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const stockStatus = getStockStatus(item);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Item Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{item.name}</h3>
                <p className="text-gray-600">SKU: {item.sku}</p>
                <p className="text-sm text-gray-500">{item.category} • {item.subcategory}</p>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${stockStatus.color}`}>
                {stockStatus.label}
              </div>
            </div>

            {/* Stock & Valuation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Stock Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Stock:</span>
                    <span className="font-medium">{item.currentStock} {item.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Min Level:</span>
                    <span className="font-medium">{item.minStockLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Max Level:</span>
                    <span className="font-medium">{item.maxStockLevel}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reorder Point:</span>
                    <span className="font-medium text-amber-600">{item.reorderPoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reorder Quantity:</span>
                    <span className="font-medium">{item.reorderQuantity}</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Valuation</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Value:</span>
                    <span className="font-bold text-blue-600">{formatCurrency(item.valuation.totalValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Cost:</span>
                    <span className="font-medium">{formatCurrency(item.unitCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Selling Price:</span>
                    <span className="font-medium text-green-600">{formatCurrency(item.sellingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium">{item.valuation.method.replace('_', ' ').toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margin:</span>
                    <span className="font-medium text-green-600">
                      {(((item.sellingPrice - item.unitCost) / item.unitCost) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Supplier Information</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Supplier:</span>
                    <span className="font-medium">{item.supplier.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Contact:</span>
                    <span className="font-medium">{item.supplier.contact}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lead Time:</span>
                    <span className="font-medium">{item.supplier.leadTime} days</span>
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Location</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Warehouse:</span>
                    <span className="font-medium">{item.location.warehouse}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Section:</span>
                    <span className="font-medium">{item.location.section}</span>
                  </div>
                  {item.location.shelf && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shelf:</span>
                      <span className="font-medium">{item.location.shelf}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                <p className="text-gray-700">{item.description}</p>
              </div>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Stock Movements */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recent Stock Movements</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2">Date</th>
                      <th className="text-left py-2">Type</th>
                      <th className="text-left py-2">Quantity</th>
                      <th className="text-left py-2">Reason</th>
                      <th className="text-left py-2">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {item.stockMovements.slice(-5).map((movement) => (
                      <tr key={movement._id} className="border-b border-gray-100">
                        <td className="py-2">{formatDate(movement.date)}</td>
                        <td className="py-2 capitalize">{movement.type}</td>
                        <td className="py-2">
                          <span className={`${movement.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                          </span>
                        </td>
                        <td className="py-2">{movement.reason}</td>
                        <td className="py-2">{movement.userName}</td>
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

// Valuation Modal Component
interface ValuationModalProps {
  inventory: InventoryItem[];
  categories: string[];
  onClose: () => void;
  method: 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification';
  onMethodChange: (method: 'fifo' | 'lifo' | 'weighted_average' | 'specific_identification') => void;
}

function ValuationModal({ inventory, categories, onClose, method, onMethodChange }: ValuationModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const calculateValuation = (method: string) => {
    // Simplified calculation for demo
    return inventory.reduce((total, item) => {
      let adjustedValue = item.valuation.totalValue;
      
      switch (method) {
        case 'fifo':
          adjustedValue *= 1.05; // FIFO typically higher
          break;
        case 'lifo':
          adjustedValue *= 0.98; // LIFO typically lower
          break;
        case 'weighted_average':
          // No adjustment needed
          break;
        case 'specific_identification':
          adjustedValue *= 1.02; // Specific ID typically higher
          break;
      }
      
      return total + adjustedValue;
    }, 0);
  };

  const categoryBreakdown = categories.map(category => {
    const items = inventory.filter(item => item.category === category);
    const baseValue = items.reduce((sum, item) => sum + item.valuation.totalValue, 0);
    const adjustedValue = calculateValuation(method) * (baseValue / inventory.reduce((sum, item) => sum + item.valuation.totalValue, 0));
    
    return {
      category,
      baseValue,
      adjustedValue,
      quantity: items.reduce((sum, item) => sum + item.currentStock, 0),
      percentage: (baseValue / inventory.reduce((sum, item) => sum + item.valuation.totalValue, 0)) * 100
    };
  });

  const totalValuation = calculateValuation(method);
  const baseTotal = inventory.reduce((sum, item) => sum + item.valuation.totalValue, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Inventory Valuation Report</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Valuation Method Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Valuation Method</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'fifo', label: 'FIFO', description: 'First In, First Out' },
                  { value: 'lifo', label: 'LIFO', description: 'Last In, First Out' },
                  { value: 'weighted_average', label: 'Weighted Average', description: 'Average Cost Method' },
                  { value: 'specific_identification', label: 'Specific ID', description: 'Specific Identification' }
                ].map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      name="valuationMethod"
                      value={option.value}
                      checked={method === option.value}
                      onChange={(e) => onMethodChange(e.target.value as any)}
                      className="sr-only"
                    />
                    <div className={`p-3 rounded-lg border-2 transition-colors ${
                      method === option.value 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-xs text-gray-600">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Base Valuation</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(baseTotal)}</p>
                <p className="text-sm text-gray-600">Current cost method</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Selected Method</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(totalValuation)}</p>
                <p className="text-sm text-gray-600">{method.replace('_', ' ').toUpperCase()}</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Difference</h4>
                <p className={`text-2xl font-bold ${totalValuation >= baseTotal ? 'text-green-600' : 'text-red-600'}`}>
                  {totalValuation >= baseTotal ? '+' : ''}{formatCurrency(totalValuation - baseTotal)}
                </p>
                <p className="text-sm text-gray-600">
                  {((totalValuation - baseTotal) / baseTotal * 100).toFixed(2)}% change
                </p>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Category Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Base Value</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Adjusted Value</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {categoryBreakdown.map((category) => (
                      <tr key={category.category}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{category.category}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(category.baseValue)}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(category.adjustedValue)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{category.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 text-right">{category.percentage.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Valuation Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="baseValue" fill="#E5E7EB" name="Base Value" />
                  <Bar dataKey="adjustedValue" fill="#3B82F6" name={`${method.replace('_', ' ').toUpperCase()}`} />
                </BarChart>
              </ResponsiveContainer>
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

// Stock Alerts Modal Component
interface StockAlertsModalProps {
  items: InventoryItem[];
  onClose: () => void;
  onUpdateStock: (itemId: string, newQuantity: number, type: StockMovement['type'], reason: string) => void;
}

function StockAlertsModal({ items, onClose, onUpdateStock }: StockAlertsModalProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const getAlertType = (item: InventoryItem) => {
    if (item.currentStock === 0) {
      return { type: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200', icon: ExclamationTriangleIcon };
    } else if (item.alerts.lowStock) {
      return { type: 'Low Stock', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: ExclamationTriangleIcon };
    } else if (item.alerts.overstock) {
      return { type: 'Overstock', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: ExclamationTriangleIcon };
    }
    return null;
  };

  const groupedAlerts = items.reduce((groups, item) => {
    const alertType = getAlertType(item);
    if (!alertType) return groups;

    const key = alertType.type;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, InventoryItem[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Stock Alerts</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedAlerts).map(([alertType, alertItems]) => {
              const alertConfig = getAlertType(alertItems[0]);
              if (!alertConfig) return null;
              const AlertIcon = alertConfig.icon;

              return (
                <div key={alertType} className="border border-gray-200 rounded-lg">
                  <div className={`px-4 py-3 border-b border-gray-200 ${alertConfig.color}`}>
                    <div className="flex items-center space-x-2">
                      <AlertIcon className="h-5 w-5" />
                      <h3 className="font-semibold">{alertType} ({alertItems.length} items)</h3>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Reorder Point</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Value</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {alertItems.map((item) => (
                          <tr key={item._id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-xs text-gray-600">SKU: {item.sku}</div>
                                <div className="text-xs text-gray-500">{item.category}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {formatNumber(item.currentStock)} {item.unit}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="text-sm text-gray-600">{formatNumber(item.reorderPoint)}</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {formatCurrency(item.valuation.totalValue)}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex justify-center space-x-2">
                                <button
                                  onClick={() => onUpdateStock(item._id, item.reorderQuantity, 'purchase', 'Auto-reorder from stock alert')}
                                  className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors"
                                >
                                  Reorder
                                </button>
                                <button className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded hover:bg-green-200 transition-colors">
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-green-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No stock alerts</h3>
                <p className="mt-1 text-sm text-gray-500">All items are within acceptable stock levels.</p>
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