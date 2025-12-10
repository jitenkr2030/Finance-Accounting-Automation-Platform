'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CalendarIcon,
  BellIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CreditCardIcon,
  BanknotesIcon,
  ChartPieIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  LockClosedIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  CogIcon,
  UserIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  AcademicCapIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  InformationCircleIcon,
  SparklesIcon,
  TrophyIcon,
  RocketLaunchIcon,
  HeartIcon,
  BeakerIcon,
  CubeIcon,
  CodeBracketIcon,
  ClipboardDocumentListIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
  AdjustmentsHorizontalIcon,
  TagIcon,
  CurrencyRupeeIcon,
  CurrencyEuroIcon,
  CurrencyYenIcon,
  CurrencyDollarIcon as CurrencyDollarIconOutline,
  IdentificationIcon,
  ClipboardDocumentIcon,
  ChartLineIcon,
  ScaleIcon,
  BoltIcon,
  SparklesIcon as SparklesIconOutline,
  PuzzlePieceIcon,
  WrenchScrewdriverIcon,
  PresentationChartBarIcon,
  UserCircleIcon,
  KeyIcon,
  PencilSquareIcon,
  DocumentIcon,
  FileTextIcon,
  InboxIcon,
  BookmarkIcon,
  FlagIcon,
  NoSymbolIcon,
  HandRaisedIcon,
  SpeakerWaveIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon as ComputerDesktopIconOutline,
  CloudIcon,
  ServerIcon,
  DatabaseIcon,
  CircleStackIcon,
  CodeBracketSquareIcon,
  PuzzlePieceIcon as PuzzlePieceIconOutline,
  CommandLineIcon,
  WrenchScrewdriverIcon as WrenchScrewdriverIconOutline,
  PresentationChartBarIcon as PresentationChartBarIconOutline,
  UserCircleIcon as UserCircleIconOutline,
  KeyIcon as KeyIconOutline,
  PencilSquareIcon as PencilSquareIconOutline,
  DocumentIcon as DocumentIconOutline,
  FileTextIcon as FileTextIconOutline,
  InboxIcon as InboxIconOutline,
  BookmarkIcon as BookmarkIconOutline,
  FlagIcon as FlagIconOutline,
  NoSymbolIcon as NoSymbolIconOutline,
  HandRaisedIcon as HandRaisedIconOutline,
  SpeakerWaveIcon as SpeakerWaveIconOutline,
  DeviceTabletIcon as DeviceTabletIconOutline,
  CloudIcon as CloudIconOutline,
  ServerIcon as ServerIconOutline,
  DatabaseIcon as DatabaseIconOutline,
  CircleStackIcon as CircleStackIconOutline,
  CodeBracketSquareIcon as CodeBracketSquareIconOutline,
  CommandLineIcon as CommandLineIconOutline,
  WrenchScrewdriverIconOutline as WrenchScrewdriverIconOutline,
  PresentationChartBarIconOutline as PresentationChartBarIconOutline,
  UserCircleIconOutline as UserCircleIconOutline,
  KeyIconOutline as KeyIconOutline,
  PencilSquareIconOutline as PencilSquareIconOutline,
  DocumentIconOutline as DocumentIconOutline,
  FileTextIconOutline as FileTextIconOutline,
  InboxIconOutline as InboxIconOutline,
  BookmarkIconOutline as BookmarkIconOutline,
  FlagIconOutline as FlagIconOutline,
  NoSymbolIconOutline as NoSymbolIconOutline,
  HandRaisedIconOutline as HandRaisedIconOutline,
  SpeakerWaveIconOutline as SpeakerWaveIconOutline,
  DeviceTabletIconOutline as DeviceTabletIconOutline,
  CloudIconOutline as CloudIconOutline,
  ServerIconOutline as ServerIconOutline,
  DatabaseIconOutline as DatabaseIconOutline,
  CircleStackIconOutline as CircleStackIconOutline,
  CodeBracketSquareIconOutline as CodeBracketSquareIconOutline,
  CommandLineIconOutline as CommandLineIconOutline,
} from '@heroicons/react/24/outline';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  customerType: 'Individual' | 'Business' | 'Corporate' | 'Government';
  creditLimit: number;
  paymentTerms: number;
  rating: number;
  totalOutstanding: number;
  totalInvoiced: number;
  lastPaymentDate: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Blocked';
  createdAt: string;
  updatedAt: string;
  tags: string[];
  notes: string;
  contactPerson: string;
  taxNumber: string;
  currency: string;
  preferredPaymentMethod: 'Bank Transfer' | 'Cheque' | 'Credit Card' | 'UPI' | 'Cash' | 'Online';
  accountManager: string;
  customerSince: string;
  loyaltyProgram: string;
  industry: string;
  companySize: string;
  website: string;
  socialMedia: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  paymentHistory: Array<{
    id: string;
    amount: number;
    date: string;
    method: string;
    reference: string;
    status: 'Completed' | 'Pending' | 'Failed';
  }>;
  creditScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  segment: string;
  lifetimeValue: number;
  acquisitionChannel: string;
  lastInvoiceDate: string;
  averagePaymentTime: number;
  disputeCount: number;
  preferredContactMethod: 'Email' | 'Phone' | 'SMS' | 'Portal';
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
    portal: boolean;
  };
  customFields: Record<string, any>;
  integrations: {
    crm: string;
    erp: string;
    accounting: string;
    ecommerce: string;
  };
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: 'Draft' | 'Sent' | 'Viewed' | 'Paid' | 'Overdue' | 'Cancelled' | 'Partial';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  paymentTerms: number;
  currency: string;
  exchangeRate: number;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
    category: string;
    projectCode?: string;
    milestone?: string;
    deliveryDate?: string;
    warrantyPeriod?: number;
    serialNumbers?: string[];
    discountPercentage?: number;
    discountAmount?: number;
    notes?: string;
  }>;
  taxes: Array<{
    name: string;
    rate: number;
    amount: number;
    type: 'GST' | 'VAT' | 'Sales Tax' | 'Service Tax' | 'Custom';
  }>;
  discounts: Array<{
    name: string;
    type: 'Percentage' | 'Fixed';
    value: number;
    amount: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    date: string;
    method: 'Bank Transfer' | 'Cheque' | 'Credit Card' | 'UPI' | 'Cash' | 'Online' | 'Partial';
    reference: string;
    notes: string;
    processedBy: string;
    confirmationNumber: string;
    bankDetails?: string;
    chequeDetails?: {
      number: string;
      bank: string;
      date: string;
    };
    cardDetails?: {
      lastFour: string;
      type: string;
      authorizationCode: string;
    };
    fees: number;
    netAmount: number;
  }>;
  billingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  terms: string;
  notes: string;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>;
  reminders: Array<{
    id: string;
    type: 'Email' | 'SMS' | 'Portal' | 'Phone';
    sentAt: string;
    status: 'Sent' | 'Delivered' | 'Read' | 'Failed';
    template: string;
    recipient: string;
  }>;
  projectCode?: string;
  poNumber?: string;
  deliveryNote?: string;
 ewayBill?: string;
  gstNumber?: string;
  customFields: Record<string, any>;
  createdBy: string;
  approvedBy?: string;
  signedBy?: string;
  template: string;
  color: string;
  logo?: string;
  footerText: string;
  createdAt: string;
  updatedAt: string;
  history: Array<{
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
    ipAddress: string;
  }>;
  automationRules: Array<{
    id: string;
    name: string;
    trigger: string;
    condition: string;
    action: string;
    status: 'Active' | 'Inactive';
  }>;
  aiInsights: {
    paymentProbability: number;
    riskScore: number;
    recommendedActions: string[];
    sentiment: 'Positive' | 'Neutral' | 'Negative';
    similarCustomers: string[];
    expectedPaymentDate: string;
  };
}

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  fees: number;
  netAmount: number;
  date: string;
  method: 'Bank Transfer' | 'Cheque' | 'Credit Card' | 'UPI' | 'Cash' | 'Online' | 'Partial';
  reference: string;
  confirmationNumber: string;
  status: 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Refunded' | 'Cancelled';
  processedBy: string;
  approvedBy?: string;
  notes: string;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    branchName: string;
  };
  chequeDetails?: {
    number: string;
    bank: string;
    date: string;
    depositedOn?: string;
    clearedOn?: string;
  };
  cardDetails?: {
    lastFour: string;
    type: string;
    authorizationCode: string;
    transactionId: string;
  };
  gatewayDetails?: {
    gateway: string;
    transactionId: string;
    orderId: string;
    responseCode: string;
  };
  reversalDetails?: {
    reason: string;
    refundAmount: number;
    processedBy: string;
    processedAt: string;
  };
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
  reconciliation: {
    bankStatementDate?: string;
    matched: boolean;
    matchConfidence: number;
    matchedTransactionId?: string;
    reconciledBy?: string;
    reconciledAt?: string;
  };
}

interface CreditNote {
  id: string;
  creditNoteNumber: string;
  customerId: string;
  customerName: string;
  originalInvoiceId: string;
  originalInvoiceNumber: string;
  amount: number;
  reason: string;
  status: 'Draft' | 'Issued' | 'Applied' | 'Cancelled';
  date: string;
  expiryDate?: string;
  appliedAmount: number;
  remainingAmount: number;
  createdBy: string;
  approvedBy?: string;
  notes: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface Receipt {
  id: string;
  receiptNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  date: string;
  method: 'Bank Transfer' | 'Cheque' | 'Credit Card' | 'UPI' | 'Cash' | 'Online';
  reference: string;
  notes: string;
  status: 'Issued' | 'Cancelled';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CollectionAgent {
  id: string;
  name: string;
  email: string;
  phone: string;
  territory: string;
  targetAmount: number;
  collectedAmount: number;
  activeCustomers: number;
  performance: {
    collectionRate: number;
    averageTime: number;
    customerSatisfaction: number;
  };
  status: 'Active' | 'Inactive';
  createdAt: string;
  updatedAt: string;
}

interface DunningTemplate {
  id: string;
  name: string;
  type: 'Email' | 'SMS' | 'Portal' | 'Phone';
  subject?: string;
  message: string;
  delayDays: number;
  severity: 'Info' | 'Warning' | 'Critical';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AgingReport {
  range: string;
  count: number;
  amount: number;
  percentage: number;
}

const AccountsReceivable: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for different data types
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [creditNotes, setCreditNotes] = useState<CreditNote[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [collectionAgents, setCollectionAgents] = useState<CollectionAgent[]>([]);
  const [dunningTemplates, setDunningTemplates] = useState<DunningTemplate[]>([]);

  // Modal states
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showDunningModal, setShowDunningModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Edit states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [editingCreditNote, setEditingCreditNote] = useState<CreditNote | null>(null);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [customerFilter, setCustomerFilter] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [overdueFilter, setOverdueFilter] = useState(false);

  // Statistics
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    collectionRate: 0,
    averagePaymentTime: 0,
    topCustomers: [] as Customer[],
    recentPayments: [] as Payment[],
    agingAnalysis: [] as AgingReport[],
    monthlyTrend: [] as { month: string; amount: number; count: number }[],
    paymentMethods: [] as { method: string; amount: number; percentage: number }[],
    customerSegments: [] as { segment: string; count: number; value: number }[],
    riskAnalysis: { low: number; medium: number; high: number },
    automationMetrics: {
      invoicesAutomated: 0,
      paymentsAutomated: 0,
      remindersSent: 0,
      collectionSuccess: 0
    }
  });

  // Initialize data
  useEffect(() => {
    initializeData();
    loadStatistics();
  }, []);

  const initializeData = () => {
    // Mock customers data
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'Tech Solutions Inc.',
        email: 'accounts@techsolutions.com',
        phone: '+91-9876543210',
        address: '123 Business Park',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        zipCode: '400001',
        customerType: 'Business',
        creditLimit: 500000,
        paymentTerms: 30,
        rating: 4.8,
        totalOutstanding: 150000,
        totalInvoiced: 2000000,
        lastPaymentDate: '2024-11-15',
        status: 'Active',
        createdAt: '2024-01-15',
        updatedAt: '2024-12-01',
        tags: ['Enterprise', 'Technology', 'Priority'],
        notes: 'Preferred customer with excellent payment history',
        contactPerson: 'John Doe',
        taxNumber: '27ABCDE1234F1Z5',
        currency: 'INR',
        preferredPaymentMethod: 'Bank Transfer',
        accountManager: 'Sarah Wilson',
        customerSince: '2022-03-15',
        loyaltyProgram: 'Platinum',
        industry: 'Technology',
        companySize: '500-1000',
        website: 'https://techsolutions.com',
        socialMedia: {
          linkedin: 'https://linkedin.com/company/techsolutions',
          twitter: 'https://twitter.com/techsolutions'
        },
        documents: [],
        paymentHistory: [],
        creditScore: 850,
        riskLevel: 'Low',
        segment: 'Enterprise',
        lifetimeValue: 2500000,
        acquisitionChannel: 'Referral',
        lastInvoiceDate: '2024-11-20',
        averagePaymentTime: 25,
        disputeCount: 0,
        preferredContactMethod: 'Email',
        notificationPreferences: {
          email: true,
          sms: false,
          push: true,
          portal: true
        },
        customFields: {
          department: 'IT',
          budgetOwner: 'CTO',
          contractType: 'MSA'
        },
        integrations: {
          crm: 'Salesforce',
          erp: 'SAP',
          accounting: 'QuickBooks',
          ecommerce: 'Shopify'
        }
      },
      {
        id: '2',
        name: 'Global Manufacturing Ltd.',
        email: 'finance@globalmfg.com',
        phone: '+91-8765432109',
        address: '456 Industrial Area',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
        zipCode: '560001',
        customerType: 'Corporate',
        creditLimit: 1000000,
        paymentTerms: 45,
        rating: 4.5,
        totalOutstanding: 300000,
        totalInvoiced: 5000000,
        lastPaymentDate: '2024-11-10',
        status: 'Active',
        createdAt: '2023-06-20',
        updatedAt: '2024-12-01',
        tags: ['Manufacturing', 'Long-term', 'Bulk'],
        notes: 'Large volume customer with extended payment terms',
        contactPerson: 'Jane Smith',
        taxNumber: '29FGHIJ5678K1L9',
        currency: 'INR',
        preferredPaymentMethod: 'Cheque',
        accountManager: 'Mike Johnson',
        customerSince: '2023-06-20',
        loyaltyProgram: 'Gold',
        industry: 'Manufacturing',
        companySize: '1000+',
        website: 'https://globalmfg.com',
        socialMedia: {
          linkedin: 'https://linkedin.com/company/globalmfg'
        },
        documents: [],
        paymentHistory: [],
        creditScore: 780,
        riskLevel: 'Low',
        segment: 'Enterprise',
        lifetimeValue: 8000000,
        acquisitionChannel: 'Direct Sales',
        lastInvoiceDate: '2024-11-25',
        averagePaymentTime: 42,
        disputeCount: 1,
        preferredContactMethod: 'Phone',
        notificationPreferences: {
          email: true,
          sms: true,
          push: false,
          portal: true
        },
        customFields: {
          division: 'Operations',
          procurementCycle: 'Quarterly',
          volumeDiscount: '5%'
        },
        integrations: {
          crm: 'HubSpot',
          erp: 'Oracle',
          accounting: 'Tally',
          ecommerce: 'Magento'
        }
      }
    ];

    // Mock invoices data
    const mockInvoices: Invoice[] = [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customerName: 'Tech Solutions Inc.',
        customerEmail: 'accounts@techsolutions.com',
        issueDate: '2024-11-01',
        dueDate: '2024-12-01',
        subtotal: 100000,
        taxAmount: 18000,
        totalAmount: 118000,
        paidAmount: 0,
        remainingAmount: 118000,
        status: 'Sent',
        priority: 'High',
        paymentTerms: 30,
        currency: 'INR',
        exchangeRate: 1,
        items: [
          {
            id: '1',
            description: 'Software License - Enterprise Plan',
            quantity: 100,
            rate: 1000,
            amount: 100000,
            taxRate: 18,
            taxAmount: 18000,
            category: 'Software',
            projectCode: 'PROJ-2024-001',
            discountPercentage: 5,
            discountAmount: 5000
          }
        ],
        taxes: [
          {
            name: 'GST',
            rate: 18,
            amount: 18000,
            type: 'GST'
          }
        ],
        discounts: [
          {
            name: 'Early Payment Discount',
            type: 'Percentage',
            value: 5,
            amount: 5000
          }
        ],
        payments: [],
        billingAddress: {
          line1: '123 Business Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        shippingAddress: {
          line1: '123 Business Park',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400001',
          country: 'India'
        },
        terms: 'Payment due within 30 days of invoice date',
        notes: 'Thank you for your business',
        attachments: [],
        reminders: [],
        projectCode: 'PROJ-2024-001',
        customFields: {
          poNumber: 'PO-2024-001',
          deliveryDate: '2024-11-01'
        },
        createdBy: 'admin@company.com',
        template: 'standard',
        color: '#3B82F6',
        footerText: 'Thank you for your business',
        createdAt: '2024-11-01T10:00:00Z',
        updatedAt: '2024-11-01T10:00:00Z',
        history: [],
        automationRules: [],
        aiInsights: {
          paymentProbability: 85,
          riskScore: 15,
          recommendedActions: ['Send payment reminder', 'Offer early payment discount'],
          sentiment: 'Positive',
          similarCustomers: ['2', '3'],
          expectedPaymentDate: '2024-12-20',
          priority: 'High'
        }
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        customerId: '2',
        customerName: 'Global Manufacturing Ltd.',
        customerEmail: 'finance@globalmfg.com',
        issueDate: '2024-10-15',
        dueDate: '2024-11-29',
        subtotal: 200000,
        taxAmount: 36000,
        totalAmount: 236000,
        paidAmount: 0,
        remainingAmount: 236000,
        status: 'Overdue',
        priority: 'High',
        paymentTerms: 45,
        currency: 'INR',
        exchangeRate: 1,
        items: [
          {
            id: '2',
            description: 'Industrial Equipment - Manufacturing Unit',
            quantity: 2,
            rate: 100000,
            amount: 200000,
            taxRate: 18,
            taxAmount: 36000,
            category: 'Equipment',
            projectCode: 'PROJ-2024-002',
            warrantyPeriod: 24
          }
        ],
        taxes: [
          {
            name: 'GST',
            rate: 18,
            amount: 36000,
            type: 'GST'
          }
        ],
        discounts: [],
        payments: [],
        billingAddress: {
          line1: '456 Industrial Area',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        shippingAddress: {
          line1: '456 Industrial Area',
          city: 'Bangalore',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India'
        },
        terms: 'Payment due within 45 days of invoice date',
        notes: 'Equipment warranty included',
        attachments: [],
        reminders: [],
        projectCode: 'PROJ-2024-002',
        customFields: {
          deliveryDate: '2024-10-15',
          installationDate: '2024-10-20'
        },
        createdBy: 'admin@company.com',
        template: 'corporate',
        color: '#059669',
        footerText: 'Professional service guaranteed',
        createdAt: '2024-10-15T14:30:00Z',
        updatedAt: '2024-10-15T14:30:00Z',
        history: [],
        automationRules: [],
        aiInsights: {
          paymentProbability: 70,
          riskScore: 30,
          recommendedActions: ['Follow up with customer', 'Review credit terms'],
          sentiment: 'Neutral',
          similarCustomers: ['1', '4'],
          expectedPaymentDate: '2024-12-10',
          priority: 'Medium'
        }
      }
    ];

    // Mock payments data
    const mockPayments: Payment[] = [
      {
        id: '1',
        paymentNumber: 'PAY-2024-001',
        invoiceId: '1',
        invoiceNumber: 'INV-2024-001',
        customerId: '1',
        customerName: 'Tech Solutions Inc.',
        amount: 118000,
        fees: 0,
        netAmount: 118000,
        date: '2024-11-15',
        method: 'Bank Transfer',
        reference: 'TXN123456789',
        confirmationNumber: 'CONF001',
        status: 'Completed',
        processedBy: 'admin@company.com',
        notes: 'Payment received via NEFT',
        bankDetails: {
          bankName: 'State Bank of India',
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          branchName: 'Mumbai Main Branch'
        },
        attachments: [],
        createdAt: '2024-11-15T16:45:00Z',
        updatedAt: '2024-11-15T16:45:00Z',
        reconciliation: {
          matched: true,
          matchConfidence: 95,
          matchedTransactionId: 'BANK-TXN-001',
          reconciledBy: 'finance@company.com',
          reconciledAt: '2024-11-16T09:00:00Z'
        }
      }
    ];

    setCustomers(mockCustomers);
    setInvoices(mockInvoices);
    setPayments(mockPayments);
    setCreditNotes([]);
    setReceipts([]);
    setCollectionAgents([]);
    setDunningTemplates([]);
  };

  const loadStatistics = () => {
    const totalInvoices = invoices.length;
    const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.remainingAmount, 0);
    const overdueAmount = invoices
      .filter(inv => inv.status === 'Overdue')
      .reduce((sum, inv) => sum + inv.remainingAmount, 0);

    const agingData: AgingReport[] = [
      { range: '0-30 days', count: 5, amount: 500000, percentage: 40 },
      { range: '31-60 days', count: 3, amount: 300000, percentage: 25 },
      { range: '61-90 days', count: 2, amount: 250000, percentage: 20 },
      { range: '90+ days', count: 2, amount: 200000, percentage: 15 }
    ];

    const monthlyTrend = [
      { month: 'Jan', amount: 800000, count: 45 },
      { month: 'Feb', amount: 950000, count: 52 },
      { month: 'Mar', amount: 1100000, count: 58 },
      { month: 'Apr', amount: 900000, count: 48 },
      { month: 'May', amount: 1200000, count: 62 },
      { month: 'Jun', amount: 1050000, count: 55 },
      { month: 'Jul', amount: 1300000, count: 68 },
      { month: 'Aug', amount: 1150000, count: 60 },
      { month: 'Sep', amount: 1250000, count: 65 },
      { month: 'Oct', amount: 1400000, count: 72 },
      { month: 'Nov', amount: 1180000, count: 62 },
      { month: 'Dec', amount: 950000, count: 50 }
    ];

    const paymentMethods = [
      { method: 'Bank Transfer', amount: 2500000, percentage: 45 },
      { method: 'Credit Card', amount: 1500000, percentage: 27 },
      { method: 'Cheque', amount: 1000000, percentage: 18 },
      { method: 'UPI', amount: 500000, percentage: 9 },
      { method: 'Cash', amount: 100000, percentage: 1 }
    ];

    setStats({
      totalInvoices,
      totalOutstanding,
      overdueAmount,
      collectionRate: 85.5,
      averagePaymentTime: 28,
      topCustomers: customers.slice(0, 5),
      recentPayments: payments.slice(0, 5),
      agingAnalysis: agingData,
      monthlyTrend,
      paymentMethods,
      customerSegments: [
        { segment: 'Enterprise', count: 15, value: 5000000 },
        { segment: 'Mid-Market', count: 25, value: 3000000 },
        { segment: 'Small Business', count: 40, value: 1500000 },
        { segment: 'Individual', count: 20, value: 500000 }
      ],
      riskAnalysis: { low: 75, medium: 20, high: 5 },
      automationMetrics: {
        invoicesAutomated: 85,
        paymentsAutomated: 70,
        remindersSent: 1200,
        collectionSuccess: 78
      }
    });
  };

  // Filter and search logic
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    const matchesPriority = !priorityFilter || invoice.priority === priorityFilter;
    const matchesCustomer = !customerFilter || invoice.customerId === customerFilter;
    const matchesCurrency = !currencyFilter || invoice.currency === currencyFilter;
    const matchesDateRange = !dateRange.start || 
                            (invoice.issueDate >= dateRange.start && invoice.issueDate <= dateRange.end);
    const matchesAmountRange = (!amountRange.min || invoice.totalAmount >= parseFloat(amountRange.min)) &&
                              (!amountRange.max || invoice.totalAmount <= parseFloat(amountRange.max));
    const matchesOverdue = !overdueFilter || invoice.status === 'Overdue';

    return matchesSearch && matchesStatus && matchesPriority && matchesCustomer && 
           matchesCurrency && matchesDateRange && matchesAmountRange && matchesOverdue;
  });

  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'invoiceNumber':
        aValue = a.invoiceNumber;
        bValue = b.invoiceNumber;
        break;
      case 'customerName':
        aValue = a.customerName;
        bValue = b.customerName;
        break;
      case 'totalAmount':
        aValue = a.totalAmount;
        bValue = b.totalAmount;
        break;
      case 'dueDate':
        aValue = new Date(a.dueDate);
        bValue = new Date(b.dueDate);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = a.dueDate;
        bValue = b.dueDate;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Event handlers
  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === paginatedInvoices.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedInvoices.map(inv => inv.id));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} for items:`, selectedItems);
    setShowBulkActionModal(false);
    setSelectedItems([]);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Sent': return 'bg-blue-100 text-blue-800';
      case 'Viewed': return 'bg-yellow-100 text-yellow-800';
      case 'Paid': return 'bg-green-100 text-green-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      case 'Partial': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Low': return 'bg-gray-100 text-gray-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'Bank Transfer': return <BanknotesIcon className="h-4 w-4" />;
      case 'Credit Card': return <CreditCardIcon className="h-4 w-4" />;
      case 'Cheque': return <DocumentTextIcon className="h-4 w-4" />;
      case 'UPI': return <DevicePhoneMobileIcon className="h-4 w-4" />;
      case 'Cash': return <CurrencyRupeeIcon className="h-4 w-4" />;
      case 'Online': return <GlobeAltIcon className="h-4 w-4" />;
      default: return <CurrencyDollarIconOutline className="h-4 w-4" />;
    }
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="h-8 w-8 text-blue-600" />
              Accounts Receivable
            </h1>
            <p className="text-gray-600 mt-1">Manage customer invoices, payments, and collections</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAnalyticsModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => setShowDunningModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <BellIcon className="h-4 w-4 mr-2" />
              Dunning
            </button>
            <button
              onClick={() => setShowCollectionModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Collections
            </button>
            <button
              onClick={() => setShowInvoiceModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Invoice
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabs = () => (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6">
        <nav className="flex space-x-8">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: PresentationChartBarIcon },
            { id: 'invoices', name: 'Invoices', icon: DocumentTextIcon },
            { id: 'customers', name: 'Customers', icon: UserGroupIcon },
            { id: 'payments', name: 'Payments', icon: CurrencyDollarIcon },
            { id: 'credit-notes', name: 'Credit Notes', icon: DocumentArrowDownIcon },
            { id: 'receipts', name: 'Receipts', icon: ClipboardDocumentIcon },
            { id: 'collections', name: 'Collections', icon: UserIcon },
            { id: 'reports', name: 'Reports', icon: ChartPieIcon },
            { id: 'settings', name: 'Settings', icon: CogIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">₹{stats.totalOutstanding.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +12.5% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Amount</p>
              <p className="text-2xl font-bold text-red-600">₹{stats.overdueAmount.toLocaleString()}</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +5.2% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Collection Rate</p>
              <p className="text-2xl font-bold text-green-600">{stats.collectionRate}%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +2.1% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg. Payment Time</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averagePaymentTime} days</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowDownIcon className="h-4 w-4 mr-1" />
                -3 days from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <ClockIcon className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Collection Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {stats.monthlyTrend.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 rounded-t w-full"
                  style={{ height: `${(data.amount / 1400000) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                <span className="text-xs text-gray-500">₹{(data.amount / 100000).toFixed(0)}L</span>
              </div>
            ))}
          </div>
        </div>

        {/* Aging Analysis */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Aging Analysis</h3>
          <div className="space-y-3">
            {stats.agingAnalysis.map((aging, index) => (
              <div key={aging.range} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{aging.range}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${aging.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    ₹{aging.amount.toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {stats.paymentMethods.map((method, index) => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getPaymentMethodIcon(method.method)}
                  <span className="text-sm text-gray-600">{method.method}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {method.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Segments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Segments</h3>
          <div className="space-y-3">
            {stats.customerSegments.map((segment, index) => (
              <div key={segment.segment} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{segment.segment}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 w-12 text-right">{segment.count}</span>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    ₹{(segment.value / 100000).toFixed(0)}L
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
          <div className="space-y-3">
            {stats.recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{payment.customerName}</p>
                  <p className="text-xs text-gray-500">{payment.invoiceNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹{payment.amount.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">{payment.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
          <div className="space-y-3">
            {stats.topCustomers.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                  <p className="text-xs text-gray-500">{customer.customerType}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">₹{customer.totalOutstanding.toLocaleString()}</p>
                  <div className="flex items-center justify-end mt-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(customer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvoices = () => (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search invoices, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFilterOpen(!filterOpen)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <FunnelIcon className="h-4 w-4 mr-2" />
              Filters
            </button>
            
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {selectedItems.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">{selectedItems.length} selected</span>
                <button
                  onClick={() => setShowBulkActionModal(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Bulk Actions
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Filter Panel */}
        {filterOpen && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Viewed">Viewed</option>
                  <option value="Paid">Paid</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Partial">Partial</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Priorities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Customers</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  value={currencyFilter}
                  onChange={(e) => setCurrencyFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Currencies</option>
                  <option value="INR">INR</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={overdueFilter}
                  onChange={(e) => setOverdueFilter(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Show only overdue</span>
              </label>
              
              <button
                onClick={() => {
                  setStatusFilter('');
                  setPriorityFilter('');
                  setCustomerFilter('');
                  setCurrencyFilter('');
                  setDateRange({ start: '', end: '' });
                  setAmountRange({ min: '', max: '' });
                  setOverdueFilter(false);
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedInvoices.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('invoiceNumber')}
                >
                  <div className="flex items-center gap-1">
                    Invoice
                    {sortBy === 'invoiceNumber' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('customerName')}
                >
                  <div className="flex items-center gap-1">
                    Customer
                    {sortBy === 'customerName' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalAmount')}
                >
                  <div className="flex items-center gap-1">
                    Amount
                    {sortBy === 'totalAmount' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('dueDate')}
                >
                  <div className="flex items-center gap-1">
                    Due Date
                    {sortBy === 'dueDate' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(invoice.id)}
                      onChange={() => handleSelectItem(invoice.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">{invoice.issueDate}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ₹{invoice.totalAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Paid: ₹{invoice.paidAmount.toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{invoice.dueDate}</div>
                      {invoice.status === 'Overdue' && (
                        <div className="text-sm text-red-600">Overdue</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(invoice.priority)}`}>
                      {invoice.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingInvoice(invoice);
                          setShowInvoiceModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View/Edit"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingInvoice(invoice);
                          setShowInvoiceModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => console.log('Delete invoice:', invoice.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{' '}
                  <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                  {' '}to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * itemsPerPage, sortedInvoices.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{sortedInvoices.length}</span>
                  {' '}results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomers = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Customer Management</h2>
        <button
          onClick={() => {
            setEditingCustomer(null);
            setShowCustomerModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Customer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((customer) => (
          <div key={customer.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{customer.name}</h3>
                <p className="text-sm text-gray-500">{customer.customerType}</p>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-4 w-4 ${
                      i < Math.floor(customer.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2" />
                {customer.email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {customer.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {customer.city}, {customer.state}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Outstanding</p>
                <p className="text-sm font-medium text-gray-900">₹{customer.totalOutstanding.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Invoiced</p>
                <p className="text-sm font-medium text-gray-900">₹{customer.totalInvoiced.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                customer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {customer.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingCustomer(customer);
                    setShowCustomerModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => console.log('View customer:', customer.id)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'invoices':
        return renderInvoices();
      case 'customers':
        return renderCustomers();
      case 'payments':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Payment Management</h3>
              <p className="text-gray-600">Track and manage all customer payments, refunds, and reconciliation.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Add Payment
              </button>
            </div>
          </div>
        );
      case 'credit-notes':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit Notes</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <DocumentArrowDownIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Credit Note Management</h3>
              <p className="text-gray-600">Manage credit notes, refunds, and adjustments to customer accounts.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Credit Note
              </button>
            </div>
          </div>
        );
      case 'receipts':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Receipts</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <ClipboardDocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Receipt Management</h3>
              <p className="text-gray-600">Generate and manage payment receipts for customer transactions.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Generate Receipt
              </button>
            </div>
          </div>
        );
      case 'collections':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Collections Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Collections Team</h3>
              <p className="text-gray-600">Manage collection agents, assign cases, and track collection performance.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Assign Collection Case
              </button>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Reports & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <ChartPieIcon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aging Report</h3>
                <p className="text-gray-600 text-sm mb-4">Detailed aging analysis of outstanding receivables.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <ChartBarIcon className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Collection Report</h3>
                <p className="text-gray-600 text-sm mb-4">Track collection performance and trends.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <UserGroupIcon className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Report</h3>
                <p className="text-gray-600 text-sm mb-4">Customer analysis and segmentation report.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Settings</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Accounts Receivable Settings</h3>
              <p className="text-gray-600">Configure payment terms, credit policies, and automation rules.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Configure Settings
              </button>
            </div>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderHeader()}
      {renderTabs()}
      {renderContent()}

      {/* Modals would go here - Invoice, Customer, Payment, etc. */}
      {/* For brevity, I'm showing the structure but not implementing all modals */}
      
      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Invoice creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowInvoiceModal(false);
                    setEditingInvoice(null);
                  }}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Customer creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowCustomerModal(false);
                    setEditingCustomer(null);
                  }}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Modal */}
      {showAnalyticsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Advanced Analytics</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Advanced analytics dashboard would be implemented here</p>
                <button
                  onClick={() => setShowAnalyticsModal(false)}
                  className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Other modals would follow similar pattern */}
    </div>
  );
};

export default AccountsReceivable;