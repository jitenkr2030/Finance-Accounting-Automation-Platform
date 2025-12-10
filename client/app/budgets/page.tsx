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
  ReferenceLine,
  Legend
} from 'recharts';

// Types
interface Budget {
  _id: string;
  name: string;
  description: string;
  type: 'annual' | 'quarterly' | 'monthly' | 'project';
  fiscalYear: string;
  department: string;
  category: string;
  status: 'draft' | 'submitted' | 'approved' | 'active' | 'closed';
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  lineItems: BudgetLineItem[];
  approvals: BudgetApproval[];
  attachments: BudgetAttachment[];
  metadata: {
    version: number;
    createdBy: string;
    approvedBy?: string;
    approvedDate?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface BudgetLineItem {
  _id: string;
  category: string;
  subcategory: string;
  description: string;
  allocated: number;
  spent: number;
  committed: number; // Pending but approved expenses
  remaining: number;
  variance: number; // spent vs allocated
  variancePercentage: number;
  period: string;
  tags: string[];
  approvals: {
    status: 'pending' | 'approved' | 'rejected';
    approver?: string;
    date?: string;
    comments?: string;
  };
}

interface BudgetApproval {
  _id: string;
  approverId: string;
  approverName: string;
  approverRole: string;
  level: number; // Approval hierarchy level
  status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  date?: string;
  signature?: string;
}

interface BudgetAttachment {
  _id: string;
  name: string;
  type: 'spreadsheet' | 'document' | 'presentation' | 'image';
  fileUrl: string;
  size: number;
  uploadDate: string;
}

interface BudgetTemplate {
  _id: string;
  name: string;
  description: string;
  type: 'annual' | 'quarterly' | 'monthly' | 'project';
  categories: string[];
  lineItems: Omit<BudgetLineItem, '_id' | 'spent' | 'committed' | 'remaining' | 'variance' | 'variancePercentage' | 'approvals'>[];
  isDefault: boolean;
  createdBy: string;
  createdAt: string;
}

// Sample data
const sampleBudgets: Budget[] = [
  {
    _id: '1',
    name: 'Marketing Department Budget 2025',
    description: 'Annual marketing budget including digital campaigns, events, and brand activities',
    type: 'annual',
    fiscalYear: '2025',
    department: 'Marketing',
    category: 'Departmental',
    status: 'approved',
    totalAllocated: 5000000,
    totalSpent: 3200000,
    totalRemaining: 1800000,
    lineItems: [
      {
        _id: 'li1',
        category: 'Digital Marketing',
        subcategory: 'Google Ads',
        description: 'Google Ads campaigns and PPC management',
        allocated: 1500000,
        spent: 980000,
        committed: 200000,
        remaining: 320000,
        variance: -200000,
        variancePercentage: -13.3,
        period: '2025-Q1',
        tags: ['digital', 'ppc', 'google'],
        approvals: { status: 'approved', approver: 'John Smith', date: '2024-12-01' }
      },
      {
        _id: 'li2',
        category: 'Events',
        subcategory: 'Trade Shows',
        description: 'Industry trade show participation and sponsorship',
        allocated: 800000,
        spent: 650000,
        committed: 100000,
        remaining: 50000,
        variance: -50000,
        variancePercentage: -6.3,
        period: '2025-Q1',
        tags: ['events', 'trade-shows'],
        approvals: { status: 'approved', approver: 'John Smith', date: '2024-12-01' }
      },
      {
        _id: 'li3',
        category: 'Content Marketing',
        subcategory: 'Video Production',
        description: 'Corporate video content and social media videos',
        allocated: 600000,
        spent: 420000,
        committed: 80000,
        remaining: 100000,
        variance: -80000,
        variancePercentage: -13.3,
        period: '2025-Q1',
        tags: ['content', 'video', 'social-media'],
        approvals: { status: 'approved', approver: 'John Smith', date: '2024-12-01' }
      }
    ],
    approvals: [
      {
        _id: 'ap1',
        approverId: 'user1',
        approverName: 'John Smith',
        approverRole: 'Marketing Director',
        level: 1,
        status: 'approved',
        date: '2024-12-01',
        comments: 'Approved with minor adjustments'
      },
      {
        _id: 'ap2',
        approverId: 'user2',
        approverName: 'Jane Doe',
        approverRole: 'CFO',
        level: 2,
        status: 'approved',
        date: '2024-12-02',
        comments: 'Budget looks reasonable'
      }
    ],
    attachments: [
      {
        _id: 'att1',
        name: 'Marketing Budget Detailed.xlsx',
        type: 'spreadsheet',
        fileUrl: '/documents/marketing-budget-2025.xlsx',
        size: 245760,
        uploadDate: '2024-11-15'
      }
    ],
    metadata: {
      version: 1,
      createdBy: 'Marketing Team',
      approvedBy: 'Jane Doe',
      approvedDate: '2024-12-02'
    },
    createdAt: '2024-11-15T09:00:00Z',
    updatedAt: '2024-12-02T16:30:00Z'
  },
  {
    _id: '2',
    name: 'IT Infrastructure Budget Q1 2025',
    description: 'Quarterly IT infrastructure including hardware, software, and maintenance',
    type: 'quarterly',
    fiscalYear: '2025',
    department: 'IT',
    category: 'Operational',
    status: 'active',
    totalAllocated: 2500000,
    totalSpent: 1800000,
    totalRemaining: 700000,
    lineItems: [
      {
        _id: 'li4',
        category: 'Hardware',
        subcategory: 'Servers',
        description: 'Server upgrades and replacements',
        allocated: 1000000,
        spent: 750000,
        committed: 150000,
        remaining: 100000,
        variance: -100000,
        variancePercentage: -10,
        period: '2025-Q1',
        tags: ['hardware', 'servers'],
        approvals: { status: 'approved', approver: 'Mike Johnson', date: '2024-12-15' }
      },
      {
        _id: 'li5',
        category: 'Software',
        subcategory: 'Licenses',
        description: 'Annual software license renewals',
        allocated: 800000,
        spent: 700000,
        committed: 50000,
        remaining: 50000,
        variance: -50000,
        variancePercentage: -6.3,
        period: '2025-Q1',
        tags: ['software', 'licenses'],
        approvals: { status: 'approved', approver: 'Mike Johnson', date: '2024-12-15' }
      },
      {
        _id: 'li6',
        category: 'Maintenance',
        subcategory: 'Support Contracts',
        description: 'Annual maintenance and support contracts',
        allocated: 700000,
        spent: 350000,
        committed: 200000,
        remaining: 150000,
        variance: -150000,
        variancePercentage: -21.4,
        period: '2025-Q1',
        tags: ['maintenance', 'support'],
        approvals: { status: 'approved', approver: 'Mike Johnson', date: '2024-12-15' }
      }
    ],
    approvals: [
      {
        _id: 'ap3',
        approverId: 'user3',
        approverName: 'Mike Johnson',
        approverRole: 'IT Director',
        level: 1,
        status: 'approved',
        date: '2024-12-15'
      }
    ],
    attachments: [],
    metadata: {
      version: 2,
      createdBy: 'IT Team',
      approvedBy: 'Mike Johnson',
      approvedDate: '2024-12-15'
    },
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-15T14:20:00Z'
  }
];

const sampleBudgetTemplates: BudgetTemplate[] = [
  {
    _id: 't1',
    name: 'Department Budget Template',
    description: 'Standard template for departmental budgets',
    type: 'annual',
    categories: ['Personnel', 'Operations', 'Marketing', 'Technology', 'Travel', 'Miscellaneous'],
    lineItems: [
      { category: 'Personnel', subcategory: 'Salaries', description: 'Employee salaries and benefits', allocated: 0, period: '2025', tags: ['personnel'] },
      { category: 'Operations', subcategory: 'Office Supplies', description: 'Office supplies and materials', allocated: 0, period: '2025', tags: ['operations'] },
      { category: 'Marketing', subcategory: 'Digital', description: 'Digital marketing campaigns', allocated: 0, period: '2025', tags: ['marketing'] },
      { category: 'Technology', subcategory: 'Software', description: 'Software licenses and tools', allocated: 0, period: '2025', tags: ['technology'] }
    ],
    isDefault: true,
    createdBy: 'Admin',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export default function BudgetingPage() {
  const [budgets, setBudgets] = useState<Budget[]>(sampleBudgets);
  const [templates] = useState<BudgetTemplate[]>(sampleBudgetTemplates);
  const [selectedView, setSelectedView] = useState<'list' | 'grid' | 'analytics'>('list');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showApproval, setShowApproval] = useState(false);
  const [loading, setLoading] = useState(false);

  // Filter budgets
  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         budget.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || budget.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || budget.status === selectedStatus;
    const matchesDepartment = selectedDepartment === 'all' || budget.department === selectedDepartment;
    
    return matchesSearch && matchesType && matchesStatus && matchesDepartment;
  });

  // Calculate statistics
  const stats = {
    totalBudgets: budgets.length,
    totalAllocated: budgets.reduce((sum, b) => sum + b.totalAllocated, 0),
    totalSpent: budgets.reduce((sum, b) => sum + b.totalSpent, 0),
    totalRemaining: budgets.reduce((sum, b) => sum + b.totalRemaining, 0),
    avgUtilization: budgets.length > 0 ? 
      budgets.reduce((sum, b) => sum + (b.totalSpent / b.totalAllocated * 100), 0) / budgets.length : 0,
    activeBudgets: budgets.filter(b => b.status === 'active').length,
    pendingApprovals: budgets.filter(b => b.status === 'submitted').length,
    departmentsCount: Array.from(new Set(budgets.map(b => b.department))).length
  };

  // Analytics data
  const departmentData = Array.from(new Set(budgets.map(b => b.department))).map(dept => {
    const deptBudgets = budgets.filter(b => b.department === dept);
    return {
      name: dept,
      allocated: deptBudgets.reduce((sum, b) => sum + b.totalAllocated, 0),
      spent: deptBudgets.reduce((sum, b) => sum + b.totalSpent, 0),
      remaining: deptBudgets.reduce((sum, b) => sum + b.totalRemaining, 0),
      count: deptBudgets.length
    };
  });

  const statusData = [
    { name: 'Active', value: budgets.filter(b => b.status === 'active').length, color: '#10B981' },
    { name: 'Approved', value: budgets.filter(b => b.status === 'approved').length, color: '#3B82F6' },
    { name: 'Submitted', value: budgets.filter(b => b.status === 'submitted').length, color: '#F59E0B' },
    { name: 'Draft', value: budgets.filter(b => b.status === 'draft').length, color: '#6B7280' },
    { name: 'Closed', value: budgets.filter(b => b.status === 'closed').length, color: '#EF4444' }
  ].filter(item => item.value > 0);

  const monthlySpending = [
    { month: 'Jan', budget: 800000, actual: 750000, variance: -50000 },
    { month: 'Feb', budget: 850000, actual: 920000, variance: 70000 },
    { month: 'Mar', budget: 900000, actual: 880000, variance: -20000 },
    { month: 'Apr', budget: 950000, actual: 1100000, variance: 150000 },
    { month: 'May', budget: 1000000, actual: 980000, variance: -20000 },
    { month: 'Jun', budget: 1050000, actual: 1020000, variance: -30000 }
  ];

  const categoryData = budgets.flatMap(b => b.lineItems).reduce((acc, item) => {
    const existing = acc.find(cat => cat.name === item.category);
    if (existing) {
      existing.allocated += item.allocated;
      existing.spent += item.spent;
    } else {
      acc.push({
        name: item.category,
        allocated: item.allocated,
        spent: item.spent,
        remaining: item.remaining
      });
    }
    return acc;
  }, [] as Array<{ name: string; allocated: number; spent: number; remaining: number }>);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'approved': return <CheckCircleIcon className="h-4 w-4 text-blue-500" />;
      case 'submitted': return <ClockIcon className="h-4 w-4 text-amber-500" />;
      case 'draft': return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
      case 'closed': return <XCircleIcon className="h-4 w-4 text-gray-500" />;
      default: return <ClockIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'submitted': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'annual': return <CalendarDaysIcon className="h-5 w-5 text-blue-600" />;
      case 'quarterly': return <PresentationChartLineIcon className="h-5 w-5 text-green-600" />;
      case 'monthly': return <CalendarIcon className="h-5 w-5 text-purple-600" />;
      case 'project': return <CogIcon className="h-5 w-5 text-orange-600" />;
      default: return <BanknotesIcon className="h-5 w-5 text-gray-600" />;
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

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-amber-600';
    if (percentage >= 50) return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Management</h1>
              <p className="text-gray-600">Plan, track, and control organizational spending with comprehensive budgeting tools</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 lg:mt-0">
              <button
                onClick={() => setShowTemplate(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <BeakerIcon className="h-5 w-5 mr-2 text-purple-600" />
                Templates
              </button>
              <button
                onClick={() => setShowApproval(true)}
                className="flex items-center px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                Approvals
                {stats.pendingApprovals > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded-full">
                    {stats.pendingApprovals}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowAddBudget(true)}
                className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Budget
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Allocated</p>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAllocated)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BanknotesIcon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{stats.totalBudgets}</span>
                  <span className="ml-1">budgets</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <ArrowTrendingUpIcon className="h-6 w-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className={`font-medium ${getUtilizationColor(stats.avgUtilization)}`}>
                    {formatPercentage(stats.avgUtilization)}
                  </span>
                  <span className="ml-1">utilization</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining</p>
                  <p className="text-2xl font-bold text-amber-600">{formatCurrency(stats.totalRemaining)}</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <ArrowTrendingDownIcon className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-amber-600">{stats.activeBudgets}</span>
                  <span className="ml-1">active</span>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departments</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.departmentsCount}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm text-gray-600">
                  <span className="text-purple-600">{stats.pendingApprovals}</span>
                  <span className="ml-1">pending</span>
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
                  placeholder="Search budgets..."
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
                <option value="annual">Annual</option>
                <option value="quarterly">Quarterly</option>
                <option value="monthly">Monthly</option>
                <option value="project">Project</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                {Array.from(new Set(budgets.map(b => b.department))).map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
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
              {/* Department Budget Distribution */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget by Department</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                    <Bar dataKey="allocated" fill="#3B82F6" name="Allocated" />
                    <Bar dataKey="spent" fill="#10B981" name="Spent" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution */}
              <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Monthly Budget vs Actual */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Monthly Budget vs Actual Spending</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={monthlySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar yAxisId="left" dataKey="budget" fill="#3B82F6" name="Budget" />
                  <Bar yAxisId="left" dataKey="actual" fill="#10B981" name="Actual" />
                  <Line yAxisId="right" type="monotone" dataKey="variance" stroke="#EF4444" name="Variance" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="allocated" fill="#E5E7EB" name="Allocated" />
                  <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
                  <Bar dataKey="remaining" fill="#10B981" name="Remaining" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : selectedView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBudgets.map((budget) => {
              const utilization = (budget.totalSpent / budget.totalAllocated) * 100;
              
              return (
                <div key={budget._id} className="bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{budget.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{budget.department} • {budget.fiscalYear}</p>
                      <p className="text-lg font-bold text-gray-900">{formatCurrency(budget.totalAllocated)}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(budget.status)}`}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(budget.status)}
                        <span className="capitalize">{budget.status}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Spent:</span>
                      <span className="font-medium">{formatCurrency(budget.totalSpent)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Remaining:</span>
                      <span className="font-medium">{formatCurrency(budget.totalRemaining)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Utilization:</span>
                      <span className={`font-medium ${getUtilizationColor(utilization)}`}>
                        {formatPercentage(utilization)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Line Items:</span>
                      <span className="font-medium">{budget.lineItems.length}</span>
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div 
                      className={`h-2 rounded-full ${
                        utilization >= 90 ? 'bg-red-500' :
                        utilization >= 75 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(utilization, 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedBudget(budget)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowApproval(true)}
                        className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <CheckCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-gray-500">{budget.type}</p>
                      <p className="text-xs text-gray-500">{budget.category}</p>
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
                      Budget Details
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Financial
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilization
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Line Items
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {filteredBudgets.map((budget) => {
                    const utilization = (budget.totalSpent / budget.totalAllocated) * 100;
                    
                    return (
                      <tr key={budget._id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{budget.name}</div>
                            <div className="text-sm text-gray-600">{budget.department} • {budget.fiscalYear}</div>
                            <div className="text-xs text-gray-500">{budget.description}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(budget.totalAllocated)}
                            </div>
                            <div className="text-xs text-gray-600">
                              Spent: {formatCurrency(budget.totalSpent)}
                            </div>
                            <div className="text-xs text-gray-600">
                              Remaining: {formatCurrency(budget.totalRemaining)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Progress:</span>
                              <span className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
                                {formatPercentage(utilization)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  utilization >= 90 ? 'bg-red-500' :
                                  utilization >= 75 ? 'bg-amber-500' :
                                  'bg-green-500'
                                }`}
                                style={{ width: `${Math.min(utilization, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(budget.status)}`}>
                            {getStatusIcon(budget.status)}
                            <span className="ml-1 capitalize">{budget.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{budget.lineItems.length}</div>
                          <div className="text-xs text-gray-600">categories</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedBudget(budget)}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="p-1 text-gray-600 hover:text-green-600 transition-colors">
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setShowApproval(true)}
                              className="p-1 text-gray-600 hover:text-purple-600 transition-colors"
                            >
                              <CheckCircleIcon className="h-4 w-4" />
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
        {filteredBudgets.length === 0 && (
          <div className="text-center py-12">
            <BanknotesIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No budgets found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType !== 'all' || selectedStatus !== 'all' || selectedDepartment !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : 'Get started by creating your first budget.'}
            </p>
            {!searchTerm && selectedType === 'all' && selectedStatus === 'all' && selectedDepartment === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddBudget(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                  Create Budget
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals would go here */}
      {showAddBudget && (
        <AddBudgetModal
          onClose={() => setShowAddBudget(false)}
          onSubmit={(budgetData) => {
            const newBudget: Budget = {
              _id: Date.now().toString(),
              ...budgetData,
              status: 'draft',
              totalSpent: 0,
              totalRemaining: budgetData.totalAllocated,
              lineItems: [],
              approvals: [],
              attachments: [],
              metadata: {
                version: 1,
                createdBy: 'Current User'
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setBudgets(prev => [newBudget, ...prev]);
            setShowAddBudget(false);
          }}
          templates={templates}
        />
      )}

      {selectedBudget && (
        <BudgetDetailModal
          budget={selectedBudget}
          onClose={() => setSelectedBudget(null)}
          onUpdate={(updatedBudget) => {
            setBudgets(prev => prev.map(budget => 
              budget._id === updatedBudget._id ? updatedBudget : budget
            ));
          }}
        />
      )}

      {showTemplate && (
        <TemplateModal
          templates={templates}
          onClose={() => setShowTemplate(false)}
        />
      )}

      {showApproval && (
        <ApprovalModal
          budgets={budgets}
          onClose={() => setShowApproval(false)}
        />
      )}
    </div>
  );
}

// Add Budget Modal Component
interface AddBudgetModalProps {
  onClose: () => void;
  onSubmit: (data: Partial<Budget>) => void;
  templates: BudgetTemplate[];
}

function AddBudgetModal({ onClose, onSubmit, templates }: AddBudgetModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'annual' as Budget['type'],
    fiscalYear: '2025',
    department: '',
    category: 'Departmental',
    totalAllocated: '0'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      totalAllocated: parseFloat(formData.totalAllocated),
      totalRemaining: parseFloat(formData.totalAllocated)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Create New Budget</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter budget name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the budget purpose and scope"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Budget['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="annual">Annual</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="monthly">Monthly</option>
                  <option value="project">Project</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fiscal Year *</label>
                <input
                  type="text"
                  required
                  value={formData.fiscalYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, fiscalYear: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="2025"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Departmental">Departmental</option>
                  <option value="Operational">Operational</option>
                  <option value="Capital">Capital</option>
                  <option value="Project">Project</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Allocated (₹) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.totalAllocated}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalAllocated: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
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
                Create Budget
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Budget Detail Modal Component
interface BudgetDetailModalProps {
  budget: Budget;
  onClose: () => void;
  onUpdate: (budget: Budget) => void;
}

function BudgetDetailModal({ budget, onClose, onUpdate }: BudgetDetailModalProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'approved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'submitted': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'closed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-amber-600';
    if (percentage >= 50) return 'text-blue-600';
    return 'text-green-600';
  };

  const utilization = (budget.totalSpent / budget.totalAllocated) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Budget Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{budget.name}</h3>
                <p className="text-gray-600 mt-1">{budget.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-600">{budget.department}</span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600">{budget.fiscalYear}</span>
                  <span className="text-sm text-gray-600">•</span>
                  <span className="text-sm text-gray-600 capitalize">{budget.type}</span>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(budget.status)}`}>
                <span className="capitalize">{budget.status}</span>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Total Allocated</h4>
                <p className="text-2xl font-bold text-blue-600">{formatCurrency(budget.totalAllocated)}</p>
                <p className="text-sm text-gray-600">Budget amount</p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Total Spent</h4>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(budget.totalSpent)}</p>
                <p className="text-sm text-gray-600">
                  {formatPercentage(utilization)} utilized
                </p>
              </div>

              <div className="bg-amber-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Remaining</h4>
                <p className="text-2xl font-bold text-amber-600">{formatCurrency(budget.totalRemaining)}</p>
                <p className="text-sm text-gray-600">Available balance</p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">Line Items</h4>
                <p className="text-2xl font-bold text-purple-600">{budget.lineItems.length}</p>
                <p className="text-sm text-gray-600">Budget categories</p>
              </div>
            </div>

            {/* Utilization Progress */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-4">Budget Utilization</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span className={getUtilizationColor(utilization)}>{formatPercentage(utilization)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      utilization >= 90 ? 'bg-red-500' :
                      utilization >= 75 ? 'bg-amber-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(utilization, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Line Items */}
            {budget.lineItems.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Budget Line Items</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3">Category</th>
                        <th className="text-left py-3">Description</th>
                        <th className="text-right py-3">Allocated</th>
                        <th className="text-right py-3">Spent</th>
                        <th className="text-right py-3">Remaining</th>
                        <th className="text-right py-3">Variance</th>
                        <th className="text-left py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budget.lineItems.map((item) => (
                        <tr key={item._id} className="border-b border-gray-100">
                          <td className="py-3">
                            <div>
                              <div className="font-medium text-gray-900">{item.category}</div>
                              <div className="text-xs text-gray-600">{item.subcategory}</div>
                            </div>
                          </td>
                          <td className="py-3">{item.description}</td>
                          <td className="py-3 text-right font-medium">{formatCurrency(item.allocated)}</td>
                          <td className="py-3 text-right">{formatCurrency(item.spent)}</td>
                          <td className="py-3 text-right">{formatCurrency(item.remaining)}</td>
                          <td className={`py-3 text-right font-medium ${
                            item.variance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {item.variance >= 0 ? '+' : ''}{formatCurrency(item.variance)}
                          </td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.approvals.status === 'approved' ? 'bg-green-100 text-green-800' :
                              item.approvals.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {item.approvals.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Approvals */}
            {budget.approvals.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Approval History</h3>
                <div className="space-y-3">
                  {budget.approvals.map((approval) => (
                    <div key={approval._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{approval.approverName}</div>
                        <div className="text-sm text-gray-600">{approval.approverRole}</div>
                        {approval.comments && (
                          <div className="text-sm text-gray-500 mt-1">"{approval.comments}"</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          approval.status === 'approved' ? 'bg-green-100 text-green-800' :
                          approval.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {approval.status}
                        </div>
                        {approval.date && (
                          <div className="text-xs text-gray-500 mt-1">{formatDate(approval.date)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Attachments */}
            {budget.attachments.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {budget.attachments.map((attachment) => (
                    <div key={attachment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium text-gray-900">{attachment.name}</div>
                        <div className="text-sm text-gray-600 capitalize">{attachment.type}</div>
                      </div>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Download
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

// Template Modal Component
interface TemplateModalProps {
  templates: BudgetTemplate[];
  onClose: () => void;
}

function TemplateModal({ templates, onClose }: TemplateModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Budget Templates</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {templates.map((template) => (
              <div key={template._id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <div className="flex items-center space-x-2">
                    {template.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Default
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full capitalize">
                      {template.type}
                    </span>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{template.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Categories:</span>
                    <span className="ml-2 font-medium">{template.categories.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Line Items:</span>
                    <span className="ml-2 font-medium">{template.lineItems.length}</span>
                  </div>
                </div>
                <div className="flex space-x-2 mt-3">
                  <button className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded hover:bg-blue-200 transition-colors">
                    Use Template
                  </button>
                  <button className="px-3 py-1 text-xs bg-gray-100 text-gray-800 rounded hover:bg-gray-200 transition-colors">
                    Preview
                  </button>
                </div>
              </div>
            ))}

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

// Approval Modal Component
interface ApprovalModalProps {
  budgets: Budget[];
  onClose: () => void;
}

function ApprovalModal({ budgets, onClose }: ApprovalModalProps) {
  const pendingBudgets = budgets.filter(b => b.status === 'submitted');
  
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
            <h2 className="text-xl font-semibold text-gray-900">Budget Approvals</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <XCircleIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-4">
            {pendingBudgets.length > 0 ? (
              pendingBudgets.map((budget) => (
                <div key={budget._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{budget.name}</h3>
                      <p className="text-gray-600 text-sm">{budget.department} • {budget.fiscalYear}</p>
                      <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">Allocated:</span>
                          <p className="font-medium">{formatCurrency(budget.totalAllocated)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Submitted:</span>
                          <p className="font-medium">{formatDate(budget.updatedAt)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Line Items:</span>
                          <p className="font-medium">{budget.lineItems.length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                        Approve
                      </button>
                      <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm">
                        Reject
                      </button>
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending approvals</h3>
                <p className="mt-1 text-sm text-gray-500">All budgets are up to date.</p>
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