'use client';

import React, { useState, useEffect } from 'react';
import {
  BanknotesIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentArrowDownIcon,
  DocumentDuplicateIcon,
  CurrencyDollarIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  CalendarIcon,
  BanknotesStackIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon
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
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';

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

interface BankAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountType: 'current' | 'savings' | 'corporate' | 'loan' | 'investment';
  currency: string;
  balance: number;
  availableBalance: number;
  lastReconciled: string;
  status: 'active' | 'inactive' | 'closed';
  minimumBalance: number;
  overdraftLimit: number;
  ifscCode: string;
  micrCode: string;
  branchAddress: string;
  contactDetails: {
    phone: string;
    email: string;
    address: string;
  };
  reconciliationSettings: {
    autoReconcile: boolean;
    toleranceAmount: number;
    matchingRules: string[];
    notificationsEnabled: boolean;
  };
}

interface BankTransaction {
  id: string;
  accountId: string;
  transactionId: string;
  date: string;
  description: string;
  reference: string;
  type: 'credit' | 'debit';
  amount: number;
  balance: number;
  category: string;
  subcategory: string;
  status: 'pending' | 'cleared' | 'reconciled' | 'disputed' | 'reversed';
  source: 'bank_feed' | 'manual' | 'import' | 'api';
  isReconciled: boolean;
  reconciliationId?: string;
  matchedTransactionId?: string;
  confidenceScore: number;
  tags: string[];
  attachments: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

interface ReconciliationSession {
  id: string;
  accountId: string;
  sessionName: string;
  period: string;
  startDate: string;
  endDate: string;
  status: 'in_progress' | 'completed' | 'approved' | 'rejected';
  bookBalance: number;
  bankBalance: number;
  difference: number;
  reconciledTransactions: number;
  unmatchedTransactions: number;
  disputedTransactions: number;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  autoMatches: {
    bookTransactionId: string;
    bankTransactionId: string;
    confidence: number;
    amount: number;
    date: number;
    description: number;
    status: 'auto_approved' | 'pending_review' | 'rejected';
  }[];
  manualMatches: {
    bookTransactionId: string;
    bankTransactionId: string;
    matchedBy: string;
    matchedAt: string;
    notes: string;
  }[];
}

interface ReconciliationRule {
  id: string;
  ruleName: string;
  description: string;
  isActive: boolean;
  conditions: {
    field: string;
    operator: 'equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than';
    value: string | number;
  }[];
  actions: {
    type: 'auto_match' | 'flag' | 'categorize' | 'notify';
    parameters: any;
  }[];
  priority: number;
  createdBy: string;
  createdAt: string;
}

const BankReconciliationPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'accounts' | 'transactions' | 'reconciliation' | 'rules'>('dashboard');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>([]);
  const [reconciliationSessions, setReconciliationSessions] = useState<ReconciliationSession[]>([]);
  const [reconciliationRules, setReconciliationRules] = useState<ReconciliationRule[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<BankTransaction[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('last_30_days');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);

  // Sample data
  useEffect(() => {
    const sampleBankAccounts: BankAccount[] = [
      {
        id: 'BA001',
        accountNumber: '1234567890',
        accountName: 'Primary Operating Account',
        bankName: 'State Bank of India',
        accountType: 'current',
        currency: 'INR',
        balance: 45250000,
        availableBalance: 44500000,
        lastReconciled: '2024-10-20',
        status: 'active',
        minimumBalance: 5000000,
        overdraftLimit: 10000000,
        ifscCode: 'SBIN0001234',
        micrCode: '560002123',
        branchAddress: 'MG Road Branch, Bangalore - 560001',
        contactDetails: {
          phone: '+91-80-22345678',
          email: 'mgroad@sbi.co.in',
          address: 'MG Road, Bangalore - 560001'
        },
        reconciliationSettings: {
          autoReconcile: true,
          toleranceAmount: 100,
          matchingRules: ['exact_amount', 'date_tolerance_3_days', 'description_match_80'],
          notificationsEnabled: true
        }
      },
      {
        id: 'BA002',
        accountNumber: '9876543210',
        accountName: 'Corporate Savings Account',
        bankName: 'HDFC Bank',
        accountType: 'savings',
        currency: 'INR',
        balance: 28750000,
        availableBalance: 28750000,
        lastReconciled: '2024-10-18',
        status: 'active',
        minimumBalance: 1000000,
        overdraftLimit: 0,
        ifscCode: 'HDFC0001234',
        micrCode: '560002456',
        branchAddress: 'Corporate Branch, Bangalore - 560025',
        contactDetails: {
          phone: '+91-80-33445566',
          email: 'corporate@hdfcbank.com',
          address: 'Corporate Branch, Bangalore - 560025'
        },
        reconciliationSettings: {
          autoReconcile: false,
          toleranceAmount: 50,
          matchingRules: ['exact_amount', 'date_tolerance_1_day'],
          notificationsEnabled: true
        }
      },
      {
        id: 'BA003',
        accountNumber: '5555444433',
        accountName: 'USD Corporate Account',
        bankName: 'ICICI Bank',
        accountType: 'corporate',
        currency: 'USD',
        balance: 125000,
        availableBalance: 120000,
        lastReconciled: '2024-10-22',
        status: 'active',
        minimumBalance: 10000,
        overdraftLimit: 50000,
        ifscCode: 'ICIC0001234',
        micrCode: '560002789',
        branchAddress: 'International Branch, Bangalore - 560071',
        contactDetails: {
          phone: '+91-80-44556677',
          email: 'international@icicibank.com',
          address: 'International Branch, Bangalore - 560071'
        },
        reconciliationSettings: {
          autoReconcile: true,
          toleranceAmount: 10,
          matchingRules: ['exact_amount', 'date_tolerance_5_days', 'description_match_90'],
          notificationsEnabled: true
        }
      }
    ];

    const sampleBankTransactions: BankTransaction[] = [
      {
        id: 'BT001',
        accountId: 'BA001',
        transactionId: 'TXN2024102200001',
        date: '2024-10-22',
        description: 'Salary Payment - October 2024',
        reference: 'SAL2024OCT001',
        type: 'debit',
        amount: -8500000,
        balance: 45250000,
        category: 'Payroll',
        subcategory: 'Employee Salaries',
        status: 'cleared',
        source: 'bank_feed',
        isReconciled: true,
        reconciliationId: 'RC001',
        confidenceScore: 95,
        tags: ['salary', 'monthly', 'payroll'],
        attachments: [],
        createdAt: '2024-10-22',
        updatedAt: '2024-10-22'
      },
      {
        id: 'BT002',
        accountId: 'BA001',
        transactionId: 'TXN2024102100002',
        date: '2024-10-21',
        description: 'Client Payment - ABC Corp Invoice #INV-2024-156',
        reference: 'INV-2024-156',
        type: 'credit',
        amount: 2850000,
        balance: 53750000,
        category: 'Revenue',
        subcategory: 'Client Payments',
        status: 'reconciled',
        source: 'bank_feed',
        isReconciled: true,
        reconciliationId: 'RC001',
        confidenceScore: 98,
        tags: ['client_payment', 'invoice', 'revenue'],
        attachments: [
          {
            name: 'Invoice_INV-2024-156.pdf',
            type: 'pdf',
            size: 256000,
            url: '/documents/Invoice_INV-2024-156.pdf'
          }
        ],
        createdAt: '2024-10-21',
        updatedAt: '2024-10-22'
      },
      {
        id: 'BT003',
        accountId: 'BA001',
        transactionId: 'TXN2024102000003',
        date: '2024-10-20',
        description: 'Office Rent Payment',
        reference: 'RENT2024Q4',
        type: 'debit',
        amount: -750000,
        balance: 50900000,
        category: 'Expenses',
        subcategory: 'Rent & Utilities',
        status: 'pending',
        source: 'manual',
        isReconciled: false,
        confidenceScore: 100,
        tags: ['rent', 'office', 'quarterly'],
        attachments: [
          {
            name: 'Rent_Agreement_2024.pdf',
            type: 'pdf',
            size: 512000,
            url: '/documents/Rent_Agreement_2024.pdf'
          }
        ],
        createdAt: '2024-10-20',
        updatedAt: '2024-10-20'
      },
      {
        id: 'BT004',
        accountId: 'BA002',
        transactionId: 'TXN2024101900004',
        date: '2024-10-19',
        description: 'Interest Credit - Savings Account',
        reference: 'INT20241019',
        type: 'credit',
        amount: 125000,
        balance: 28750000,
        category: 'Income',
        subcategory: 'Interest Income',
        status: 'cleared',
        source: 'bank_feed',
        isReconciled: false,
        confidenceScore: 90,
        tags: ['interest', 'monthly', 'savings'],
        attachments: [],
        createdAt: '2024-10-19',
        updatedAt: '2024-10-19'
      },
      {
        id: 'BT005',
        accountId: 'BA003',
        transactionId: 'TXN2024101800005',
        date: '2024-10-18',
        description: 'USD Payment - Software License Fee',
        reference: 'USD-LIC-2024-10',
        type: 'debit',
        amount: -25000,
        balance: 125000,
        category: 'Expenses',
        subcategory: 'Software & Licenses',
        status: 'disputed',
        source: 'import',
        isReconciled: false,
        confidenceScore: 75,
        tags: ['software', 'license', 'usd', 'disputed'],
        attachments: [
          {
            name: 'Invoice_USD-LIC-2024-10.pdf',
            type: 'pdf',
            size: 128000,
            url: '/documents/Invoice_USD-LIC-2024-10.pdf'
          }
        ],
        createdAt: '2024-10-18',
        updatedAt: '2024-10-22'
      }
    ];

    const sampleReconciliationSessions: ReconciliationSession[] = [
      {
        id: 'RC001',
        accountId: 'BA001',
        sessionName: 'October 2024 Reconciliation',
        period: 'October 2024',
        startDate: '2024-10-01',
        endDate: '2024-10-31',
        status: 'completed',
        bookBalance: 45250000,
        bankBalance: 45250000,
        difference: 0,
        reconciledTransactions: 45,
        unmatchedTransactions: 3,
        disputedTransactions: 1,
        createdBy: 'Finance Team',
        createdAt: '2024-10-22',
        completedAt: '2024-10-22',
        approvedBy: 'Finance Manager',
        approvedAt: '2024-10-22',
        notes: 'Reconciliation completed successfully with zero variance',
        autoMatches: [
          {
            bookTransactionId: 'BT002',
            bankTransactionId: 'BT002',
            confidence: 98,
            amount: 100,
            date: 100,
            description: 95,
            status: 'auto_approved'
          }
        ],
        manualMatches: []
      },
      {
        id: 'RC002',
        accountId: 'BA001',
        sessionName: 'September 2024 Reconciliation',
        period: 'September 2024',
        startDate: '2024-09-01',
        endDate: '2024-09-30',
        status: 'approved',
        bookBalance: 48500000,
        bankBalance: 48480000,
        difference: 20000,
        reconciledTransactions: 52,
        unmatchedTransactions: 1,
        disputedTransactions: 0,
        createdBy: 'Finance Team',
        createdAt: '2024-09-30',
        completedAt: '2024-09-30',
        approvedBy: 'CFO',
        approvedAt: '2024-10-01',
        notes: 'Approved with minor variance of ₹20,000 due to bank charges',
        autoMatches: [],
        manualMatches: [
          {
            bookTransactionId: 'BT007',
            bankTransactionId: 'BT009',
            matchedBy: 'Finance Manager',
            matchedAt: '2024-09-30',
            notes: 'Manual match after investigation - bank charge adjustment'
          }
        ]
      }
    ];

    const sampleReconciliationRules: ReconciliationRule[] = [
      {
        id: 'RR001',
        ruleName: 'Salary Payment Auto-Match',
        description: 'Automatically match salary payments with corresponding payroll entries',
        isActive: true,
        conditions: [
          { field: 'description', operator: 'contains', value: 'Salary' },
          { field: 'amount', operator: 'greater_than', value: 1000000 }
        ],
        actions: [
          { type: 'auto_match', parameters: { confidence_threshold: 90 } },
          { type: 'categorize', parameters: { category: 'Payroll' } }
        ],
        priority: 1,
        createdBy: 'Finance Team',
        createdAt: '2024-01-15'
      },
      {
        id: 'RR002',
        ruleName: 'Client Payment Recognition',
        description: 'Match client payments with invoice references',
        isActive: true,
        conditions: [
          { field: 'description', operator: 'contains', value: 'Invoice' },
          { field: 'type', operator: 'equals', value: 'credit' }
        ],
        actions: [
          { type: 'auto_match', parameters: { confidence_threshold: 85 } },
          { type: 'categorize', parameters: { category: 'Revenue' } }
        ],
        priority: 2,
        createdBy: 'Finance Team',
        createdAt: '2024-01-20'
      },
      {
        id: 'RR003',
        ruleName: 'Bank Charges Flag',
        description: 'Flag bank charges for manual review',
        isActive: true,
        conditions: [
          { field: 'description', operator: 'contains', value: 'Bank Charge' }
        ],
        actions: [
          { type: 'flag', parameters: { severity: 'medium' } },
          { type: 'notify', parameters: { recipients: ['finance@company.com'] } }
        ],
        priority: 3,
        createdBy: 'Finance Manager',
        createdAt: '2024-02-01'
      }
    ];

    setTimeout(() => {
      setBankAccounts(sampleBankAccounts);
      setBankTransactions(sampleBankTransactions);
      setReconciliationSessions(sampleReconciliationSessions);
      setReconciliationRules(sampleReconciliationRules);
      setFilteredTransactions(sampleBankTransactions);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...bankTransactions];

    // Account filter
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(item => item.accountId === selectedAccount);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.transactionId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.type === filterType);
    }

    // Date range filter
    if (filterDateRange !== 'all') {
      const today = new Date();
      const filterDate = new Date();
      
      switch (filterDateRange) {
        case 'last_7_days':
          filterDate.setDate(today.getDate() - 7);
          break;
        case 'last_30_days':
          filterDate.setDate(today.getDate() - 30);
          break;
        case 'last_90_days':
          filterDate.setDate(today.getDate() - 90);
          break;
        case 'this_month':
          filterDate.setDate(1);
          break;
        case 'last_month':
          filterDate.setMonth(today.getMonth() - 1, 1);
          filterDate.setMonth(filterDate.getMonth() + 1, 0);
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.date) >= filterDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = Math.abs(a.amount);
          bValue = Math.abs(b.amount);
          break;
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
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

    setFilteredTransactions(filtered);
  }, [bankTransactions, selectedAccount, searchTerm, filterStatus, filterType, filterDateRange, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reconciled':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'cleared':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'disputed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reconciled':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'cleared':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'disputed':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'active':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'inactive':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'closed':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getAccountTypeIcon = (accountType: string) => {
    switch (accountType) {
      case 'current':
        return <BuildingLibraryIcon className="h-5 w-5" />;
      case 'savings':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'corporate':
        return <BuildingLibraryIcon className="h-5 w-5" />;
      case 'loan':
        return <CreditCardIcon className="h-5 w-5" />;
      default:
        return <BanknotesStackIcon className="h-5 w-5" />;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
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

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  };

  // Dashboard analytics
  const dashboardAnalytics = {
    transactionStatus: {
      labels: ['Reconciled', 'Cleared', 'Pending', 'Disputed'],
      datasets: [{
        data: [25, 45, 20, 10],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
        borderWidth: 0
      }]
    },
    monthlyTransactions: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Credits',
          data: [45000000, 52000000, 48000000, 55000000, 49000000, 61000000, 58000000, 63000000, 57000000, 65000000],
          backgroundColor: '#10B981'
        },
        {
          label: 'Debits',
          data: [-38000000, -45000000, -42000000, -48000000, -43000000, -52000000, -50000000, -55000000, -49000000, -57000000],
          backgroundColor: '#EF4444'
        }
      ]
    },
    accountBalances: {
      labels: ['Primary Operating', 'Corporate Savings', 'USD Corporate'],
      datasets: [{
        data: [45250000, 28750000, 125000],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B']
      }]
    },
    reconciliationProgress: {
      labels: ['Completed', 'In Progress', 'Pending'],
      datasets: [{
        data: [65, 25, 10],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0
      }]
    }
  };

  const totalBalance = bankAccounts.reduce((sum, account) => sum + account.balance, 0);
  const reconciledTransactions = bankTransactions.filter(t => t.isReconciled).length;
  const pendingReconciliation = bankTransactions.filter(t => !t.isReconciled && t.status !== 'disputed').length;
  const disputedTransactions = bankTransactions.filter(t => t.status === 'disputed').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading bank reconciliation data...</p>
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
                <BanknotesIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
                <p className="text-gray-600 mt-1">Automated bank statement reconciliation and transaction matching</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowReconciliationModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ArrowPathIcon className="h-5 w-5" />
                <span>Start Reconciliation</span>
              </button>
              <button
                onClick={() => setShowRulesModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PuzzlePieceIcon className="h-5 w-5" />
                <span>Auto-Match Rules</span>
              </button>
              <button
                onClick={() => setShowAddTransactionModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Transaction</span>
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
              { key: 'dashboard', label: 'Dashboard', icon: ChartPieIcon },
              { key: 'accounts', label: 'Accounts', icon: BanknotesStackIcon },
              { key: 'transactions', label: 'Transactions', icon: DocumentTextIcon },
              { key: 'reconciliation', label: 'Reconciliation', icon: ArrowPathIcon },
              { key: 'rules', label: 'Rules', icon: PuzzlePieceIcon }
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
                    <p className="text-sm font-medium text-gray-600">Total Balance</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalBalance)}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <BanknotesIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+5.2%</span>
                  <span className="text-gray-600 ml-2">vs last month</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Reconciled</p>
                    <p className="text-2xl font-bold text-gray-900">{reconciledTransactions}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+12.5%</span>
                  <span className="text-gray-600 ml-2">this month</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingReconciliation}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-xl">
                    <ClockIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-600 font-medium">+3</span>
                  <span className="text-gray-600 ml-2">new items</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Disputed</p>
                    <p className="text-2xl font-bold text-gray-900">{disputedTransactions}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-orange-600 font-medium">Needs attention</span>
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Transaction Status */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Status</h3>
                <div className="h-80">
                  <Doughnut 
                    data={dashboardAnalytics.transactionStatus}
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

              {/* Monthly Transactions */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Cash Flow</h3>
                <div className="h-80">
                  <Bar 
                    data={dashboardAnalytics.monthlyTransactions}
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

              {/* Account Balances */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Balances</h3>
                <div className="h-80">
                  <Pie 
                    data={dashboardAnalytics.accountBalances}
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

              {/* Reconciliation Progress */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reconciliation Progress</h3>
                <div className="h-80">
                  <Doughnut 
                    data={dashboardAnalytics.reconciliationProgress}
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

            {/* Recent Reconciliation Sessions */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Reconciliation Sessions</h3>
              <div className="space-y-4">
                {reconciliationSessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/20">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 ${
                        session.status === 'completed' ? 'bg-green-100' :
                        session.status === 'approved' ? 'bg-blue-100' :
                        'bg-yellow-100'
                      }`}>
                        <ArrowPathIcon className={`h-5 w-5 ${
                          session.status === 'completed' ? 'text-green-600' :
                          session.status === 'approved' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{session.sessionName}</div>
                        <div className="text-sm text-gray-500">{session.period} • {session.accountId}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">Difference: {formatCurrency(session.difference)}</div>
                        <div className="text-sm text-gray-500">{session.reconciledTransactions} reconciled</div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                        {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Accounts View */}
        {viewMode === 'accounts' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bankAccounts.map((account) => (
              <div key={account.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl mr-3">
                      {getAccountTypeIcon(account.accountType)}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{account.accountName}</div>
                      <div className="text-sm text-gray-500">{account.bankName}</div>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(account.status)}`}>
                    {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                  </span>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Account Number:</span>
                    <span className="text-sm font-medium text-gray-900">{account.accountNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Balance:</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(account.balance, account.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Available Balance:</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(account.availableBalance, account.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Last Reconciled:</span>
                    <span className="text-sm font-medium text-gray-900">{formatDate(account.lastReconciled)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {account.reconciliationSettings.autoReconcile && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        <ShieldCheckIcon className="h-3 w-3 mr-1" />
                        Auto
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100 transition-all duration-200">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                    <button className="text-purple-600 hover:text-purple-900 p-1 rounded-lg hover:bg-purple-100 transition-all duration-200">
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Transactions View */}
        {viewMode === 'transactions' && (
          <>
            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm w-full lg:w-80"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <select
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Accounts</option>
                    {bankAccounts.map(account => (
                      <option key={account.id} value={account.id}>{account.accountName}</option>
                    ))}
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="reconciled">Reconciled</option>
                    <option value="cleared">Cleared</option>
                    <option value="pending">Pending</option>
                    <option value="disputed">Disputed</option>
                  </select>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Types</option>
                    <option value="credit">Credit</option>
                    <option value="debit">Debit</option>
                  </select>
                  <select
                    value={filterDateRange}
                    onChange={(e) => setFilterDateRange(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="last_30_days">Last 30 Days</option>
                    <option value="last_7_days">Last 7 Days</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-gray-200">
                    {filteredTransactions.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-white/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${
                              transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              <CurrencyDollarIcon className={`h-5 w-5 ${
                                transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                              }`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                              <div className="text-sm text-gray-500">{transaction.transactionId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {bankAccounts.find(acc => acc.id === transaction.accountId)?.accountName || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(transaction.date)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-medium ${
                            transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'credit' ? '+' : ''}{formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{transaction.category}</div>
                          <div className="text-sm text-gray-500">{transaction.subcategory}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(transaction.status)}`}>
                            {getStatusIcon(transaction.status)}
                            <span className="ml-1 capitalize">{transaction.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  transaction.confidenceScore >= 90 ? 'bg-green-500' :
                                  transaction.confidenceScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${transaction.confidenceScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{transaction.confidenceScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {!transaction.isReconciled && transaction.status !== 'disputed' && (
                              <button
                                onClick={() => setShowMatchModal(true)}
                                className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-100 transition-all duration-200"
                              >
                                <ArrowPathIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100 transition-all duration-200">
                              <PencilIcon className="h-4 w-4" />
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

        {/* Reconciliation View */}
        {viewMode === 'reconciliation' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Reconciliation Sessions</h3>
            <div className="space-y-4">
              {reconciliationSessions.map((session) => (
                <div key={session.id} className="p-6 bg-white/60 rounded-xl border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl mr-4">
                        <ArrowPathIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{session.sessionName}</h4>
                        <p className="text-sm text-gray-600">{session.period} • {session.accountId}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(session.status)}`}>
                      {session.status.charAt(0).toUpperCase() + session.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-white/80 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(session.bookBalance)}</div>
                      <div className="text-sm text-gray-600">Book Balance</div>
                    </div>
                    <div className="text-center p-3 bg-white/80 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{formatCurrency(session.bankBalance)}</div>
                      <div className="text-sm text-gray-600">Bank Balance</div>
                    </div>
                    <div className="text-center p-3 bg-white/80 rounded-lg">
                      <div className={`text-lg font-bold ${session.difference === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(session.difference)}
                      </div>
                      <div className="text-sm text-gray-600">Difference</div>
                    </div>
                    <div className="text-center p-3 bg-white/80 rounded-lg">
                      <div className="text-lg font-bold text-gray-900">{session.reconciledTransactions}</div>
                      <div className="text-sm text-gray-600">Reconciled</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-600">
                        Created: {formatDate(session.createdAt)} by {session.createdBy}
                      </span>
                      {session.completedAt && (
                        <span className="text-sm text-gray-600">
                          Completed: {formatDate(session.completedAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900 px-3 py-1 bg-blue-100 rounded-lg text-sm font-medium transition-all duration-200">
                        View Details
                      </button>
                      {session.status === 'in_progress' && (
                        <button className="text-green-600 hover:text-green-900 px-3 py-1 bg-green-100 rounded-lg text-sm font-medium transition-all duration-200">
                          Continue
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Rules View */}
        {viewMode === 'rules' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reconciliationRules.map((rule) => (
              <div key={rule.id} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-xl mr-3">
                      <PuzzlePieceIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{rule.ruleName}</h3>
                      <p className="text-sm text-gray-600">{rule.description}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                    rule.isActive ? 'text-green-700 bg-green-100 border-green-200' : 'text-gray-700 bg-gray-100 border-gray-200'
                  }`}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Conditions:</h4>
                    <div className="space-y-1">
                      {rule.conditions.map((condition, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg">
                          {condition.field} {condition.operator} "{condition.value}"
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Actions:</h4>
                    <div className="space-y-1">
                      {rule.actions.map((action, index) => (
                        <div key={index} className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-lg">
                          {action.type.replace('_', ' ')} - {JSON.stringify(action.parameters)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    Priority: {rule.priority} • Created: {formatDate(rule.createdAt)}
                  </span>
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
        )}

        {/* Pagination */}
        {viewMode === 'transactions' && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredTransactions.length}</span> of{' '}
              <span className="font-medium">{bankTransactions.length}</span> transactions
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

      {/* Transaction Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`p-3 rounded-xl mr-4 ${
                    selectedTransaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <CurrencyDollarIcon className={`h-6 w-6 ${
                      selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedTransaction.description}</h2>
                    <p className="text-gray-600">{selectedTransaction.transactionId}</p>
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

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Transaction ID:</span>
                      <span className="text-sm text-gray-900">{selectedTransaction.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedTransaction.date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <span className={`text-sm font-medium capitalize ${
                        selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedTransaction.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Amount:</span>
                      <span className={`text-lg font-bold ${
                        selectedTransaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedTransaction.type === 'credit' ? '+' : ''}{formatCurrency(selectedTransaction.amount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Balance:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedTransaction.balance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Reference:</span>
                      <span className="text-sm text-gray-900">{selectedTransaction.reference}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorization</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Category:</span>
                      <span className="text-sm text-gray-900">{selectedTransaction.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Subcategory:</span>
                      <span className="text-sm text-gray-900">{selectedTransaction.subcategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Source:</span>
                      <span className="text-sm text-gray-900 capitalize">{selectedTransaction.source.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedTransaction.status)}`}>
                        {getStatusIcon(selectedTransaction.status)}
                        <span className="ml-1 capitalize">{selectedTransaction.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Confidence Score:</span>
                      <span className="text-sm text-gray-900">{selectedTransaction.confidenceScore}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTransaction.tags.map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Attachments */}
              {selectedTransaction.attachments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
                  <div className="space-y-3">
                    {selectedTransaction.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{attachment.name}</div>
                            <div className="text-sm text-gray-500">{attachment.type.toUpperCase()} • {(attachment.size / 1024).toFixed(1)} KB</div>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200">
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => setShowMatchModal(true)}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Match Transaction</span>
                </button>
                <button className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 flex items-center space-x-2">
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankReconciliationPage;