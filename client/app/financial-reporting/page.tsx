'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalculatorIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BanknotesIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface FinancialReport {
  id: string;
  reportName: string;
  reportType: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'trial_balance' | 'ratio_analysis' | 'variance_analysis' | 'budget_vs_actual' | 'profit_loss' | 'custom';
  reportingPeriod: string;
  fiscalYear: string;
  department: string;
  currency: string;
  status: 'draft' | 'generated' | 'reviewed' | 'approved' | 'published';
  generatedDate: string;
  reviewedBy?: string;
  reviewedDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  publishDate?: string;
  format: 'pdf' | 'excel' | 'csv' | 'json' | 'html';
  size: number;
  fileUrl: string;
  thumbnailUrl?: string;
  keyMetrics: {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
    currentRatio: number;
    debtToEquity: number;
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
  };
  comparatives: {
    previousPeriod: number;
    percentageChange: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  visualizations: {
    type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
    title: string;
    data: any;
  }[];
  filters: {
    dateRange: string;
    departments: string[];
    costCenters: string[];
    accountTypes: string[];
    currency: string;
  };
  drillDowns: {
    level1: { account: string; amount: number; subAccounts: any[] }[];
    level2: { account: string; amount: number; details: any[] }[];
  };
  lastModified: string;
  modifiedBy: string;
}

interface ReportTemplate {
  id: string;
  templateName: string;
  reportType: string;
  description: string;
  layout: string;
  sections: {
    name: string;
    type: 'header' | 'table' | 'chart' | 'metrics' | 'text';
    data: any;
    position: number;
  }[];
  defaultFilters: any;
  isActive: boolean;
  createdBy: string;
  createdDate: string;
}

interface KPI {
  id: string;
  name: string;
  category: 'profitability' | 'liquidity' | 'efficiency' | 'leverage' | 'growth';
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentageChange: number;
  status: 'excellent' | 'good' | 'average' | 'poor' | 'critical';
  lastUpdated: string;
}

const FinancialReportingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'reports' | 'templates' | 'analytics'>('dashboard');
  const [financialReports, setFinancialReports] = useState<FinancialReport[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [filteredReports, setFilteredReports] = useState<FinancialReport[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'generatedDate' | 'reportName' | 'status'>('generatedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<FinancialReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);

  // Sample data
  useEffect(() => {
    const sampleFinancialReports: FinancialReport[] = [
      {
        id: 'FR001',
        reportName: 'Q3 2024 Balance Sheet',
        reportType: 'balance_sheet',
        reportingPeriod: 'Q3 2024',
        fiscalYear: '2024-25',
        department: 'Finance',
        currency: 'INR',
        status: 'approved',
        generatedDate: '2024-10-15',
        reviewedBy: 'CFO',
        reviewedDate: '2024-10-16',
        approvedBy: 'CEO',
        approvedDate: '2024-10-17',
        publishDate: '2024-10-18',
        format: 'pdf',
        size: 2048576,
        fileUrl: '/reports/FR001_Balance_Sheet_Q3_2024.pdf',
        thumbnailUrl: '/reports/thumbnails/FR001_thumb.jpg',
        keyMetrics: {
          totalRevenue: 125000000,
          totalExpenses: 89000000,
          netIncome: 36000000,
          totalAssets: 285000000,
          totalLiabilities: 145000000,
          equity: 140000000,
          currentRatio: 2.1,
          debtToEquity: 0.8,
          grossMargin: 42.5,
          operatingMargin: 28.8,
          netMargin: 28.8
        },
        comparatives: [
          {
            previousPeriod: 98000000,
            percentageChange: 27.6,
            trend: 'up'
          }
        ],
        visualizations: [
          {
            type: 'bar',
            title: 'Assets vs Liabilities',
            data: {
              labels: ['Current Assets', 'Non-Current Assets', 'Current Liabilities', 'Non-Current Liabilities', 'Equity'],
              datasets: [{
                data: [85000000, 200000000, 45000000, 100000000, 140000000],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
              }]
            }
          }
        ],
        filters: {
          dateRange: '2024-07-01 to 2024-09-30',
          departments: ['Finance', 'Operations', 'Sales'],
          costCenters: ['CC001', 'CC002', 'CC003'],
          accountTypes: ['Assets', 'Liabilities', 'Equity'],
          currency: 'INR'
        },
        drillDowns: {
          level1: [
            { account: 'Cash and Cash Equivalents', amount: 25000000, subAccounts: [] },
            { account: 'Accounts Receivable', amount: 35000000, subAccounts: [] },
            { account: 'Inventory', amount: 15000000, subAccounts: [] },
            { account: 'Property, Plant & Equipment', amount: 180000000, subAccounts: [] }
          ],
          level2: []
        },
        lastModified: '2024-10-18',
        modifiedBy: 'Finance Team'
      },
      {
        id: 'FR002',
        reportName: 'September 2024 Income Statement',
        reportType: 'income_statement',
        reportingPeriod: 'September 2024',
        fiscalYear: '2024-25',
        department: 'Finance',
        currency: 'INR',
        status: 'generated',
        generatedDate: '2024-10-05',
        format: 'excel',
        size: 1024000,
        fileUrl: '/reports/FR002_Income_Statement_Sep_2024.xlsx',
        thumbnailUrl: '/reports/thumbnails/FR002_thumb.jpg',
        keyMetrics: {
          totalRevenue: 42000000,
          totalExpenses: 29800000,
          netIncome: 12200000,
          totalAssets: 285000000,
          totalLiabilities: 145000000,
          equity: 140000000,
          currentRatio: 2.1,
          debtToEquity: 0.8,
          grossMargin: 45.2,
          operatingMargin: 31.4,
          netMargin: 29.0
        },
        comparatives: [
          {
            previousPeriod: 38500000,
            percentageChange: 9.1,
            trend: 'up'
          }
        ],
        visualizations: [
          {
            type: 'pie',
            title: 'Revenue Breakdown',
            data: {
              labels: ['Product Sales', 'Service Revenue', 'Consulting', 'Maintenance'],
              datasets: [{
                data: [25000000, 12000000, 3500000, 1500000],
                backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
              }]
            }
          }
        ],
        filters: {
          dateRange: '2024-09-01 to 2024-09-30',
          departments: ['Sales', 'Services', 'Consulting'],
          costCenters: ['CC001', 'CC002'],
          accountTypes: ['Revenue', 'Expenses'],
          currency: 'INR'
        },
        drillDowns: {
          level1: [
            { account: 'Product Sales', amount: 25000000, subAccounts: [] },
            { account: 'Service Revenue', amount: 12000000, subAccounts: [] },
            { account: 'Operating Expenses', amount: 29800000, subAccounts: [] }
          ],
          level2: []
        },
        lastModified: '2024-10-05',
        modifiedBy: 'Finance Team'
      },
      {
        id: 'FR003',
        reportName: 'Q2 2024 Cash Flow Statement',
        reportType: 'cash_flow',
        reportingPeriod: 'Q2 2024',
        fiscalYear: '2024-25',
        department: 'Finance',
        currency: 'INR',
        status: 'reviewed',
        generatedDate: '2024-07-15',
        reviewedBy: 'Finance Manager',
        reviewedDate: '2024-07-16',
        format: 'pdf',
        size: 1536000,
        fileUrl: '/reports/FR003_Cash_Flow_Q2_2024.pdf',
        thumbnailUrl: '/reports/thumbnails/FR003_thumb.jpg',
        keyMetrics: {
          totalRevenue: 118000000,
          totalExpenses: 85000000,
          netIncome: 33000000,
          totalAssets: 270000000,
          totalLiabilities: 140000000,
          equity: 130000000,
          currentRatio: 1.95,
          debtToEquity: 0.85,
          grossMargin: 41.8,
          operatingMargin: 27.1,
          netMargin: 28.0
        },
        comparatives: [
          {
            previousPeriod: 105000000,
            percentageChange: 12.4,
            trend: 'up'
          }
        ],
        visualizations: [
          {
            type: 'line',
            title: 'Cash Flow Trends',
            data: {
              labels: ['Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Operating Cash Flow',
                  data: [8500000, 9200000, 11500000],
                  borderColor: '#10B981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Investing Cash Flow',
                  data: [-3200000, -2800000, -4500000],
                  borderColor: '#F59E0B',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  tension: 0.4,
                  fill: true
                },
                {
                  label: 'Financing Cash Flow',
                  data: [-1500000, -1800000, -2200000],
                  borderColor: '#EF4444',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  tension: 0.4,
                  fill: true
                }
              ]
            }
          }
        ],
        filters: {
          dateRange: '2024-04-01 to 2024-06-30',
          departments: ['Finance', 'Operations'],
          costCenters: ['CC001', 'CC002', 'CC003'],
          accountTypes: ['Cash Flows'],
          currency: 'INR'
        },
        drillDowns: {
          level1: [
            { account: 'Operating Activities', amount: 29200000, subAccounts: [] },
            { account: 'Investing Activities', amount: -10500000, subAccounts: [] },
            { account: 'Financing Activities', amount: -5500000, subAccounts: [] }
          ],
          level2: []
        },
        lastModified: '2024-07-16',
        modifiedBy: 'Finance Manager'
      },
      {
        id: 'FR004',
        reportName: 'Financial Ratio Analysis Q3 2024',
        reportType: 'ratio_analysis',
        reportingPeriod: 'Q3 2024',
        fiscalYear: '2024-25',
        department: 'Finance',
        currency: 'INR',
        status: 'approved',
        generatedDate: '2024-10-20',
        reviewedBy: 'CFO',
        reviewedDate: '2024-10-21',
        approvedBy: 'CEO',
        approvedDate: '2024-10-22',
        publishDate: '2024-10-22',
        format: 'html',
        size: 512000,
        fileUrl: '/reports/FR004_Ratio_Analysis_Q3_2024.html',
        keyMetrics: {
          totalRevenue: 125000000,
          totalExpenses: 89000000,
          netIncome: 36000000,
          totalAssets: 285000000,
          totalLiabilities: 145000000,
          equity: 140000000,
          currentRatio: 2.1,
          debtToEquity: 0.8,
          grossMargin: 42.5,
          operatingMargin: 28.8,
          netMargin: 28.8
        },
        comparatives: [
          {
            previousPeriod: 0,
            percentageChange: 8.5,
            trend: 'up'
          }
        ],
        visualizations: [
          {
            type: 'radar',
            title: 'Financial Health Dashboard',
            data: {
              labels: ['Liquidity', 'Leverage', 'Efficiency', 'Profitability', 'Growth'],
              datasets: [{
                data: [85, 75, 90, 88, 82],
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                borderColor: '#3B82F6',
                pointBackgroundColor: '#3B82F6'
              }]
            }
          }
        ],
        filters: {
          dateRange: '2024-07-01 to 2024-09-30',
          departments: ['Finance'],
          costCenters: ['CC001'],
          accountTypes: ['Ratios'],
          currency: 'INR'
        },
        drillDowns: {
          level1: [
            { account: 'Current Ratio', amount: 2.1, subAccounts: [] },
            { account: 'Quick Ratio', amount: 1.8, subAccounts: [] },
            { account: 'Debt to Equity', amount: 0.8, subAccounts: [] },
            { account: 'ROE', amount: 25.7, subAccounts: [] },
            { account: 'ROA', amount: 12.6, subAccounts: [] }
          ],
          level2: []
        },
        lastModified: '2024-10-22',
        modifiedBy: 'CFO'
      },
      {
        id: 'FR005',
        reportName: 'Budget vs Actual Q3 2024',
        reportType: 'budget_vs_actual',
        reportingPeriod: 'Q3 2024',
        fiscalYear: '2024-25',
        department: 'Finance',
        currency: 'INR',
        status: 'generated',
        generatedDate: '2024-10-10',
        format: 'excel',
        size: 2048000,
        fileUrl: '/reports/FR005_Budget_vs_Actual_Q3_2024.xlsx',
        keyMetrics: {
          totalRevenue: 125000000,
          totalExpenses: 89000000,
          netIncome: 36000000,
          totalAssets: 285000000,
          totalLiabilities: 145000000,
          equity: 140000000,
          currentRatio: 2.1,
          debtToEquity: 0.8,
          grossMargin: 42.5,
          operatingMargin: 28.8,
          netMargin: 28.8
        },
        comparatives: [
          {
            previousPeriod: 115000000,
            percentageChange: 8.7,
            trend: 'up'
          }
        ],
        visualizations: [
          {
            type: 'bar',
            title: 'Budget vs Actual Performance',
            data: {
              labels: ['Revenue', 'COGS', 'Operating Expenses', 'EBITDA', 'Net Income'],
              datasets: [
                {
                  label: 'Budget',
                  data: [120000000, 70000000, 25000000, 25000000, 20000000],
                  backgroundColor: '#94A3B8'
                },
                {
                  label: 'Actual',
                  data: [125000000, 72000000, 24500000, 28000000, 36000000],
                  backgroundColor: '#3B82F6'
                }
              ]
            }
          }
        ],
        filters: {
          dateRange: '2024-07-01 to 2024-09-30',
          departments: ['All'],
          costCenters: ['CC001', 'CC002', 'CC003'],
          accountTypes: ['Budget', 'Actual'],
          currency: 'INR'
        },
        drillDowns: {
          level1: [
            { account: 'Revenue Budget', amount: 120000000, subAccounts: [] },
            { account: 'Revenue Actual', amount: 125000000, subAccounts: [] },
            { account: 'Expense Budget', amount: 95000000, subAccounts: [] },
            { account: 'Expense Actual', amount: 96500000, subAccounts: [] }
          ],
          level2: []
        },
        lastModified: '2024-10-10',
        modifiedBy: 'Finance Team'
      }
    ];

    const sampleReportTemplates: ReportTemplate[] = [
      {
        id: 'T001',
        templateName: 'Standard Balance Sheet',
        reportType: 'balance_sheet',
        description: 'Complete balance sheet with current and non-current sections',
        layout: 'standard',
        sections: [
          { name: 'Header', type: 'header', data: {}, position: 1 },
          { name: 'Assets Summary', type: 'metrics', data: {}, position: 2 },
          { name: 'Assets Details', type: 'table', data: {}, position: 3 },
          { name: 'Liabilities Summary', type: 'metrics', data: {}, position: 4 },
          { name: 'Liabilities Details', type: 'table', data: {}, position: 5 },
          { name: 'Equity Summary', type: 'metrics', data: {}, position: 6 },
          { name: 'Equity Details', type: 'table', data: {}, position: 7 },
          { name: 'Charts', type: 'chart', data: {}, position: 8 }
        ],
        defaultFilters: {
          dateRange: 'current_quarter',
          departments: ['Finance'],
          currency: 'INR'
        },
        isActive: true,
        createdBy: 'Finance Team',
        createdDate: '2024-01-15'
      },
      {
        id: 'T002',
        templateName: 'Monthly P&L Statement',
        reportType: 'income_statement',
        description: 'Monthly profit and loss statement with variance analysis',
        layout: 'detailed',
        sections: [
          { name: 'Header', type: 'header', data: {}, position: 1 },
          { name: 'Revenue Analysis', type: 'chart', data: {}, position: 2 },
          { name: 'Revenue Details', type: 'table', data: {}, position: 3 },
          { name: 'Expense Analysis', type: 'chart', data: {}, position: 4 },
          { name: 'Expense Details', type: 'table', data: {}, position: 5 },
          { name: 'Net Income Summary', type: 'metrics', data: {}, position: 6 }
        ],
        defaultFilters: {
          dateRange: 'current_month',
          departments: ['Sales', 'Operations'],
          currency: 'INR'
        },
        isActive: true,
        createdBy: 'Finance Manager',
        createdDate: '2024-02-01'
      }
    ];

    const sampleKPIs: KPI[] = [
      {
        id: 'KPI001',
        name: 'Current Ratio',
        category: 'liquidity',
        value: 2.1,
        target: 2.0,
        unit: 'ratio',
        trend: 'up',
        percentageChange: 5.2,
        status: 'excellent',
        lastUpdated: '2024-10-22'
      },
      {
        id: 'KPI002',
        name: 'Gross Margin',
        category: 'profitability',
        value: 42.5,
        target: 40.0,
        unit: '%',
        trend: 'up',
        percentageChange: 2.8,
        status: 'excellent',
        lastUpdated: '2024-10-22'
      },
      {
        id: 'KPI003',
        name: 'Debt to Equity',
        category: 'leverage',
        value: 0.8,
        target: 1.0,
        unit: 'ratio',
        trend: 'down',
        percentageChange: -8.5,
        status: 'good',
        lastUpdated: '2024-10-22'
      },
      {
        id: 'KPI004',
        name: 'Asset Turnover',
        category: 'efficiency',
        value: 1.45,
        target: 1.5,
        unit: 'times',
        trend: 'stable',
        percentageChange: 0.8,
        status: 'good',
        lastUpdated: '2024-10-22'
      },
      {
        id: 'KPI005',
        name: 'Revenue Growth',
        category: 'growth',
        value: 15.8,
        target: 12.0,
        unit: '%',
        trend: 'up',
        percentageChange: 3.2,
        status: 'excellent',
        lastUpdated: '2024-10-22'
      },
      {
        id: 'KPI006',
        name: 'Operating Margin',
        category: 'profitability',
        value: 28.8,
        target: 25.0,
        unit: '%',
        trend: 'up',
        percentageChange: 4.1,
        status: 'excellent',
        lastUpdated: '2024-10-22'
      }
    ];

    setTimeout(() => {
      setFinancialReports(sampleFinancialReports);
      setReportTemplates(sampleReportTemplates);
      setKpis(sampleKPIs);
      setFilteredReports(sampleFinancialReports);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...financialReports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.reportName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reportType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reportingPeriod.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.reportType === filterType);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Period filter
    if (filterPeriod !== 'all') {
      filtered = filtered.filter(item => item.reportingPeriod.includes(filterPeriod));
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'generatedDate':
          aValue = new Date(a.generatedDate);
          bValue = new Date(b.generatedDate);
          break;
        case 'reportName':
          aValue = a.reportName;
          bValue = b.reportName;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredReports(filtered);
  }, [financialReports, searchTerm, filterType, filterStatus, filterPeriod, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'reviewed':
        return <EyeIcon className="h-5 w-5 text-blue-500" />;
      case 'generated':
        return <DocumentTextIcon className="h-5 w-5 text-orange-500" />;
      case 'draft':
        return <PencilIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'published':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'reviewed':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'generated':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'draft':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getReportTypeIcon = (reportType: string) => {
    switch (reportType) {
      case 'balance_sheet':
        return <DocumentChartBarIcon className="h-5 w-5" />;
      case 'income_statement':
        return <TrendingUpIcon className="h-5 w-5" />;
      case 'cash_flow':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'ratio_analysis':
        return <ChartPieIcon className="h-5 w-5" />;
      case 'budget_vs_actual':
        return <CalculatorIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const getKPIStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'good':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'average':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'poor':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'critical':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatNumber = (number: number, decimals: number = 2) => {
    return number.toFixed(decimals);
  };

  // Analytics data for dashboard
  const dashboardAnalytics = {
    reportTypeDistribution: {
      labels: ['Balance Sheet', 'Income Statement', 'Cash Flow', 'Ratio Analysis', 'Budget vs Actual'],
      datasets: [{
        data: [1, 1, 1, 1, 1],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 0
      }]
    },
    monthlyReportGeneration: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [{
        label: 'Reports Generated',
        data: [8, 12, 15, 10, 18, 22, 16, 20, 14, 25],
        backgroundColor: '#3B82F6',
        borderRadius: 6
      }]
    },
    kpiTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Current Ratio',
          data: [1.8, 1.85, 1.9, 1.95, 2.0, 2.05, 2.08, 2.1, 2.12, 2.1],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Gross Margin %',
          data: [38, 39, 40, 41, 41.5, 42, 42.2, 42.5, 42.3, 42.5],
          borderColor: '#F59E0B',
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    departmentReportCount: {
      labels: ['Finance', 'Operations', 'Sales', 'Marketing', 'HR'],
      datasets: [{
        data: [15, 8, 12, 6, 4],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 0
      }]
    }
  };

  const totalReports = financialReports.length;
  const approvedReports = financialReports.filter(r => r.status === 'approved' || r.status === 'published').length;
  const averageReportSize = financialReports.reduce((sum, r) => sum + r.size, 0) / financialReports.length / 1024 / 1024;
  const excellentKPIs = kpis.filter(k => k.status === 'excellent').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading financial reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl mr-4">
                <ChartBarIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Financial Reporting & Analytics</h1>
                <p className="text-gray-600 mt-1">Comprehensive financial insights and automated report generation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAnalyticsModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ChartBarIcon className="h-5 w-5" />
                <span>Advanced Analytics</span>
              </button>
              <button
                onClick={() => setShowTemplateModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>Manage Templates</span>
              </button>
              <button
                onClick={() => setShowGenerateModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 mb-8 border border-white/20 shadow-lg">
          <div className="flex space-x-1">
            {[
              { key: 'dashboard', label: 'Dashboard', icon: ChartBarIcon },
              { key: 'reports', label: 'Reports', icon: DocumentTextIcon },
              { key: 'templates', label: 'Templates', icon: DocumentTextIcon },
              { key: 'analytics', label: 'Analytics', icon: ChartPieIcon }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setViewMode(tab.key as any)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all duration-200 ${
                  viewMode === tab.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <tab.icon className="h-5 w-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard View */}
        {viewMode === 'dashboard' && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{totalReports}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <span className="text-gray-600 ml-2">vs last month</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Reports</p>
                    <p className="text-2xl font-bold text-gray-900">{approvedReports}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+8.3%</span>
                  <span className="text-gray-600 ml-2">approval rate</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Report Size</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(averageReportSize, 1)} MB</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <ArrowDownTrayIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-600 font-medium">+5.2%</span>
                  <span className="text-gray-600 ml-2">vs last month</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Excellent KPIs</p>
                    <p className="text-2xl font-bold text-gray-900">{excellentKPIs}/{kpis.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <TrendingUpIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">Excellent</span>
                  <span className="text-gray-600 ml-2">performance</span>
                </div>
              </div>
            </div>

            {/* KPI Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Performance Indicators</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {kpis.map(kpi => (
                  <div key={kpi.id} className="bg-white/60 rounded-xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">{kpi.name}</h4>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getKPIStatusColor(kpi.status)}`}>
                        {kpi.status.charAt(0).toUpperCase() + kpi.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {kpi.unit === '%' ? formatNumber(kpi.value, 1) + '%' : formatNumber(kpi.value, 2)}
                      </span>
                      <span className="text-sm text-gray-500">of {kpi.target}</span>
                    </div>
                    <div className="mt-3 flex items-center space-x-2">
                      {kpi.trend === 'up' && <TrendingUpIcon className="h-4 w-4 text-green-500" />}
                      {kpi.trend === 'down' && <TrendingDownIcon className="h-4 w-4 text-red-500" />}
                      {kpi.trend === 'stable' && <div className="h-4 w-4 bg-gray-400 rounded-full" />}
                      <span className={`text-sm font-medium ${
                        kpi.trend === 'up' ? 'text-green-600' : 
                        kpi.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {kpi.percentageChange > 0 ? '+' : ''}{formatNumber(kpi.percentageChange, 1)}%
                      </span>
                      <span className="text-sm text-gray-500">vs last period</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Report Type Distribution */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Type Distribution</h3>
                <div className="h-80">
                  <Doughnut 
                    data={dashboardAnalytics.reportTypeDistribution}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Monthly Report Generation */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Report Generation</h3>
                <div className="h-80">
                  <Bar 
                    data={dashboardAnalytics.monthlyReportGeneration}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      },
                      plugins: {
                        legend: {
                          display: false
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* KPI Trends */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">KPI Trends</h3>
                <div className="h-80">
                  <Line 
                    data={dashboardAnalytics.kpiTrends}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true
                        }
                      },
                      plugins: {
                        legend: {
                          position: 'top'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Department Report Count */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Department</h3>
                <div className="h-80">
                  <Pie 
                    data={dashboardAnalytics.departmentReportCount}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom',
                          labels: {
                            padding: 20,
                            usePointStyle: true
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Reports View */}
        {viewMode === 'reports' && (
          <>
            {/* Filters and Search */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm w-full lg:w-80"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="balance_sheet">Balance Sheet</option>
                    <option value="income_statement">Income Statement</option>
                    <option value="cash_flow">Cash Flow</option>
                    <option value="ratio_analysis">Ratio Analysis</option>
                    <option value="budget_vs_actual">Budget vs Actual</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="generated">Generated</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="approved">Approved</option>
                    <option value="published">Published</option>
                  </select>
                  <select
                    value={filterPeriod}
                    onChange={(e) => setFilterPeriod(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Periods</option>
                    <option value="2024">2024</option>
                    <option value="Q3">Q3</option>
                    <option value="Q2">Q2</option>
                    <option value="Sep">September</option>
                    <option value="Aug">August</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Report
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Key Metrics
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Generated
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-gray-200">
                    {filteredReports.map((report) => (
                      <tr key={report.id} className="hover:bg-white/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg mr-3">
                              {getReportTypeIcon(report.reportType)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{report.reportName}</div>
                              <div className="text-sm text-gray-500">{report.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{report.reportType.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.reportingPeriod}</div>
                          <div className="text-sm text-gray-500">{report.fiscalYear}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{report.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(report.keyMetrics.netIncome)}</div>
                          <div className="text-sm text-gray-500">Net Income</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                            {getStatusIcon(report.status)}
                            <span className="ml-1 capitalize">{report.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(report.generatedDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-100 transition-all duration-200">
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button className="text-purple-600 hover:text-purple-900 p-1 rounded-lg hover:bg-purple-100 transition-all duration-200">
                              <ShareIcon className="h-4 w-4" />
                            </button>
                            <button className="text-orange-600 hover:text-orange-900 p-1 rounded-lg hover:bg-orange-100 transition-all duration-200">
                              <PrinterIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Templates View */}
        {viewMode === 'templates' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportTemplates.map((template) => (
                  <div key={template.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-xl">
                        <DocumentTextIcon className="h-6 w-6 text-white" />
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-green-700 bg-green-100 border border-green-200">
                        Active
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.templateName}</h3>
                    <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Type:</span>
                        <span className="text-gray-900 capitalize">{template.reportType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sections:</span>
                        <span className="text-gray-900">{template.sections.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Created:</span>
                        <span className="text-gray-900">{formatDate(template.createdDate)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">by {template.createdBy}</span>
                      <div className="flex items-center space-x-1">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200">
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100 transition-all duration-200">
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-900 p-1 rounded-lg hover:bg-red-100 transition-all duration-200">
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Pagination */}
        {viewMode === 'reports' && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredReports.length}</span> of{' '}
              <span className="font-medium">{financialReports.length}</span> reports
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all duration-200">
                Previous
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 transition-all duration-200">
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl mr-4">
                    {getReportTypeIcon(selectedReport.reportType)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedReport.reportName}</h2>
                    <p className="text-gray-600">{selectedReport.id} • {selectedReport.reportingPeriod}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Report Type:</span>
                      <span className="text-sm text-gray-900 capitalize">{selectedReport.reportType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Reporting Period:</span>
                      <span className="text-sm text-gray-900">{selectedReport.reportingPeriod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Fiscal Year:</span>
                      <span className="text-sm text-gray-900">{selectedReport.fiscalYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Department:</span>
                      <span className="text-sm text-gray-900">{selectedReport.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Currency:</span>
                      <span className="text-sm text-gray-900">{selectedReport.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Format:</span>
                      <span className="text-sm text-gray-900 uppercase">{selectedReport.format}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Revenue:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedReport.keyMetrics.totalRevenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Expenses:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedReport.keyMetrics.totalExpenses)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Net Income:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedReport.keyMetrics.netIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Assets:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedReport.keyMetrics.totalAssets)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Liabilities:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedReport.keyMetrics.totalLiabilities)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Equity:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedReport.keyMetrics.equity)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Ratios */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Ratios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{formatNumber(selectedReport.keyMetrics.currentRatio, 2)}</div>
                    <div className="text-sm text-gray-600">Current Ratio</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{formatNumber(selectedReport.keyMetrics.debtToEquity, 2)}</div>
                    <div className="text-sm text-gray-600">Debt to Equity</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{formatNumber(selectedReport.keyMetrics.grossMargin, 1)}%</div>
                    <div className="text-sm text-gray-600">Gross Margin</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{formatNumber(selectedReport.keyMetrics.operatingMargin, 1)}%</div>
                    <div className="text-sm text-gray-600">Operating Margin</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{formatNumber(selectedReport.keyMetrics.netMargin, 1)}%</div>
                    <div className="text-sm text-gray-600">Net Margin</div>
                  </div>
                </div>
              </div>

              {/* Comparative Analysis */}
              {selectedReport.comparatives.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Comparative Analysis</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    {selectedReport.comparatives.map((comp, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">vs Previous Period:</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{formatCurrency(comp.previousPeriod)}</span>
                          <span className={`text-sm font-medium ${
                            comp.trend === 'up' ? 'text-green-600' : 
                            comp.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            ({comp.percentageChange > 0 ? '+' : ''}{formatNumber(comp.percentageChange, 1)}%)
                          </span>
                          {comp.trend === 'up' && <TrendingUpIcon className="h-4 w-4 text-green-500" />}
                          {comp.trend === 'down' && <TrendingDownIcon className="h-4 w-4 text-red-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Visualizations */}
              {selectedReport.visualizations.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Visualizations</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {selectedReport.visualizations.map((viz, index) => (
                      <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
                        <h4 className="text-md font-medium text-gray-900 mb-4">{viz.title}</h4>
                        <div className="h-64">
                          {viz.type === 'bar' && <Bar data={viz.data} options={{ responsive: true, maintainAspectRatio: false }} />}
                          {viz.type === 'line' && <Line data={viz.data} options={{ responsive: true, maintainAspectRatio: false }} />}
                          {viz.type === 'pie' && <Pie data={viz.data} options={{ responsive: true, maintainAspectRatio: false }} />}
                          {viz.type === 'doughnut' && <Doughnut data={viz.data} options={{ responsive: true, maintainAspectRatio: false }} />}
                          {viz.type === 'radar' && <Radar data={viz.data} options={{ responsive: true, maintainAspectRatio: false }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workflow Status */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Workflow Status</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Generated:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedReport.generatedDate)} by {selectedReport.modifiedBy}</span>
                    </div>
                    {selectedReport.reviewedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Reviewed:</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedReport.reviewedDate!)} by {selectedReport.reviewedBy}</span>
                      </div>
                    )}
                    {selectedReport.approvedBy && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Approved:</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedReport.approvedDate!)} by {selectedReport.approvedBy}</span>
                      </div>
                    )}
                    {selectedReport.publishDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-600">Published:</span>
                        <span className="text-sm text-gray-900">{formatDate(selectedReport.publishDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2">
                  <ShareIcon className="h-4 w-4" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Generate Financial Report</h2>
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Report Type</option>
                    <option value="balance_sheet">Balance Sheet</option>
                    <option value="income_statement">Income Statement</option>
                    <option value="cash_flow">Cash Flow Statement</option>
                    <option value="trial_balance">Trial Balance</option>
                    <option value="ratio_analysis">Ratio Analysis</option>
                    <option value="variance_analysis">Variance Analysis</option>
                    <option value="budget_vs_actual">Budget vs Actual</option>
                    <option value="custom">Custom Report</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Template</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Template</option>
                    {reportTemplates.map(template => (
                      <option key={template.id} value={template.id}>{template.templateName}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Period</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="current_month">Current Month</option>
                    <option value="previous_month">Previous Month</option>
                    <option value="current_quarter">Current Quarter</option>
                    <option value="previous_quarter">Previous Quarter</option>
                    <option value="current_year">Current Year</option>
                    <option value="previous_year">Previous Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="all">All Departments</option>
                    <option value="finance">Finance</option>
                    <option value="operations">Operations</option>
                    <option value="sales">Sales</option>
                    <option value="marketing">Marketing</option>
                    <option value="hr">Human Resources</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Output Format</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="html">HTML</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              {/* Additional Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">Additional Options</label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-3 text-sm text-gray-900">Include comparative analysis</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-3 text-sm text-gray-900">Include charts and visualizations</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-3 text-sm text-gray-900">Include executive summary</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-3 text-sm text-gray-900">Include drill-down capabilities</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                    <span className="ml-3 text-sm text-gray-900">Auto-schedule generation</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowGenerateModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowGenerateModal(false);
                    // Add generation logic here
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Advanced Financial Analytics</h2>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Trend Analysis */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Trends Analysis</h3>
                  <div className="h-80">
                    <Line 
                      data={dashboardAnalytics.kpiTrends}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'top'
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Performance Dashboard */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Dashboard</h3>
                  <div className="h-80">
                    <Radar 
                      data={{
                        labels: ['Liquidity', 'Leverage', 'Efficiency', 'Profitability', 'Growth', 'Stability'],
                        datasets: [
                          {
                            label: 'Current Quarter',
                            data: [85, 75, 90, 88, 82, 78],
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            borderColor: '#3B82F6',
                            pointBackgroundColor: '#3B82F6'
                          },
                          {
                            label: 'Previous Quarter',
                            data: [80, 78, 85, 82, 75, 75],
                            backgroundColor: 'rgba(16, 185, 129, 0.2)',
                            borderColor: '#10B981',
                            pointBackgroundColor: '#10B981'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          r: {
                            beginAtZero: true,
                            max: 100
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'top'
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Predictive Analytics */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Predictive Analytics</h3>
                  <div className="h-80">
                    <Line 
                      data={{
                        labels: ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'],
                        datasets: [
                          {
                            label: 'Projected Revenue',
                            data: [45000000, 48000000, 52000000, 55000000, 58000000, 62000000],
                            borderColor: '#10B981',
                            backgroundColor: 'rgba(16, 185, 129, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderDash: [5, 5]
                          },
                          {
                            label: 'Conservative Estimate',
                            data: [43000000, 45000000, 47000000, 49000000, 51000000, 53000000],
                            borderColor: '#F59E0B',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            tension: 0.4,
                            fill: true,
                            borderDash: [10, 5]
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              callback: function(value) {
                                return '₹' + (value / 1000000).toFixed(0) + 'M';
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'top'
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Variance Analysis */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Variance Analysis</h3>
                  <div className="h-80">
                    <Bar 
                      data={{
                        labels: ['Revenue', 'COGS', 'Operating Exp', 'Marketing', 'Admin', 'Net Income'],
                        datasets: [
                          {
                            label: 'Budget',
                            data: [120000000, 70000000, 25000000, 8000000, 5000000, 20000000],
                            backgroundColor: '#94A3B8'
                          },
                          {
                            label: 'Actual',
                            data: [125000000, 72000000, 24500000, 7500000, 4800000, 36000000],
                            backgroundColor: '#3B82F6'
                          },
                          {
                            label: 'Variance %',
                            data: [4.2, 2.9, -2.0, -6.3, -4.0, 80.0],
                            backgroundColor: '#10B981',
                            type: 'line',
                            yAxisID: 'y1'
                          }
                        ]
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            ticks: {
                              callback: function(value) {
                                return '₹' + (value / 1000000).toFixed(0) + 'M';
                              }
                            }
                          },
                          y1: {
                            type: 'linear',
                            display: true,
                            position: 'right',
                            grid: {
                              drawOnChartArea: false,
                            },
                            ticks: {
                              callback: function(value) {
                                return value + '%';
                              }
                            }
                          }
                        },
                        plugins: {
                          legend: {
                            position: 'top'
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Close
                </button>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 flex items-center space-x-2">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Export Analytics</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialReportingPage;