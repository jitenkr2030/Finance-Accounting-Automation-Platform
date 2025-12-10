'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
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
  ShareIcon,
  PrinterIcon,
  ChartBarIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CogIcon,
  ArchiveBoxIcon,
  StarIcon,
  WrenchIcon
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

interface Invoice {
  id: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  vendorCode: string;
  poNumber?: string;
  invoiceDate: string;
  dueDate: string;
  receivedDate: string;
  status: 'received' | 'pending_approval' | 'approved' | 'pending_payment' | 'paid' | 'overdue' | 'disputed' | 'cancelled';
  category: 'office_supplies' | 'equipment' | 'software' | 'services' | 'maintenance' | 'travel' | 'utilities' | 'professional_fees' | 'other';
  totalAmount: number;
  taxAmount: number;
  discountAmount: number;
  netAmount: number;
  currency: string;
  paymentTerms: string;
  paymentMethod?: string;
  paidDate?: string;
  approvedBy?: string;
  approvedDate?: string;
  description: string;
  lineItems: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    accountCode: string;
    costCenter?: string;
    projectCode?: string;
  }[];
  attachments: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  approvalWorkflow: {
    level: number;
    approver: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    date?: string;
  }[];
  threeWayMatching: {
    poMatch: boolean;
    goodsReceiptMatch: boolean;
    priceMatch: boolean;
    quantityMatch: boolean;
    matchScore: number;
    discrepancies: string[];
  };
  taxDetails: {
    gstRate: number;
    gstAmount: number;
    tdsRate?: number;
    tdsAmount?: number;
    hsnCode?: string;
  };
  auditTrail: {
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }[];
  notes: string;
  tags: string[];
  recurring?: {
    isRecurring: boolean;
    frequency: 'monthly' | 'quarterly' | 'annually';
    nextInvoiceDate: string;
    endDate?: string;
  };
}

interface Vendor {
  id: string;
  vendorName: string;
  vendorCode: string;
  category: string[];
  contactPerson: {
    name: string;
    designation: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  taxDetails: {
    gstNumber?: string;
    panNumber?: string;
    tinNumber?: string;
    vatNumber?: string;
    tdsRate?: number;
  };
  bankDetails: {
    accountNumber: string;
    accountName: string;
    bankName: string;
    ifscCode: string;
    swiftCode?: string;
  };
  paymentTerms: string;
  creditLimit: number;
  rating: number;
  status: 'active' | 'inactive' | 'blacklisted';
  registrationDate: string;
  lastTransactionDate?: string;
  performance: {
    onTimePayment: number;
    qualityRating: number;
    disputeRate: number;
    complianceScore: number;
  };
  taxSettings: {
    tdsApplicable: boolean;
    tdsRate: number;
    gstExempt: boolean;
    gstRate: number;
  };
}

interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  vendorId: string;
  vendorName: string;
  paymentDate: string;
  amount: number;
  currency: string;
  paymentMethod: 'bank_transfer' | 'check' | 'credit_card' | 'digital_wallet' | 'cash';
  paymentStatus: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  referenceNumber?: string;
  bankReference?: string;
  fees: number;
  exchangeRate?: number;
  convertedAmount?: number;
  approvedBy?: string;
  approvedDate?: string;
  scheduledDate?: string;
  batchNumber?: string;
  notes: string;
  attachments: {
    name: string;
    type: string;
    url: string;
  }[];
  auditTrail: {
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }[];
}

interface PaymentBatch {
  id: string;
  batchNumber: string;
  batchDate: string;
  totalAmount: number;
  currency: string;
  status: 'draft' | 'approved' | 'processing' | 'completed' | 'cancelled';
  paymentMethod: string;
  bankAccount: string;
  approvals: {
    level: number;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: string;
  }[];
  payments: {
    invoiceId: string;
    invoiceNumber: string;
    vendorName: string;
    amount: number;
    status: 'pending' | 'included' | 'excluded' | 'paid';
  }[];
  createdBy: string;
  createdDate: string;
  processedDate?: string;
}

const AccountsPayablePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'invoices' | 'payments' | 'vendors' | 'reports' | 'settings'>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentBatches, setPaymentBatches] = useState<PaymentBatch[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVendor, setFilterVendor] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('last_30_days');
  const [sortBy, setSortBy] = useState<'invoiceDate' | 'dueDate' | 'totalAmount' | 'status'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showBatchPaymentModal, setShowBatchPaymentModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);

  // Sample data
  useEffect(() => {
    const sampleInvoices: Invoice[] = [
      {
        id: 'INV001',
        invoiceNumber: 'INV-2024-001',
        vendorId: 'V001',
        vendorName: 'ABC Office Solutions Pvt Ltd',
        vendorCode: 'ABC-OFF-001',
        poNumber: 'PO-2024-001',
        invoiceDate: '2024-10-20',
        dueDate: '2024-11-19',
        receivedDate: '2024-10-20',
        status: 'pending_approval',
        category: 'office_supplies',
        totalAmount: 125000,
        taxAmount: 22500,
        discountAmount: 0,
        netAmount: 147500,
        currency: 'INR',
        paymentTerms: 'Net 30',
        description: 'Office furniture - ergonomic chairs and standing desks',
        lineItems: [
          {
            id: 'LI001',
            description: 'Ergonomic Office Chair',
            quantity: 10,
            unitPrice: 8000,
            totalPrice: 80000,
            accountCode: 'FURN-001',
            costCenter: 'CC-HR',
            projectCode: 'PROJ-OFFICE-2024'
          },
          {
            id: 'LI002',
            description: 'Standing Desk',
            quantity: 10,
            unitPrice: 4500,
            totalPrice: 45000,
            accountCode: 'FURN-001',
            costCenter: 'CC-HR',
            projectCode: 'PROJ-OFFICE-2024'
          }
        ],
        attachments: [
          {
            name: 'Invoice_INV-2024-001.pdf',
            type: 'pdf',
            size: 256000,
            url: '/documents/Invoice_INV-2024-001.pdf'
          }
        ],
        approvalWorkflow: [
          {
            level: 1,
            approver: 'Procurement Manager',
            role: 'Procurement',
            status: 'pending',
            date: '2024-10-20'
          }
        ],
        threeWayMatching: {
          poMatch: true,
          goodsReceiptMatch: true,
          priceMatch: true,
          quantityMatch: true,
          matchScore: 100,
          discrepancies: []
        },
        taxDetails: {
          gstRate: 18,
          gstAmount: 22500,
          tdsRate: 10,
          tdsAmount: 12500
        },
        auditTrail: [
          {
            action: 'Invoice Received',
            performedBy: 'AP System',
            timestamp: '2024-10-20T10:30:00Z',
            details: 'Invoice received via email and auto-processed'
          }
        ],
        notes: 'PO reference: PO-2024-001, delivery completed on 2024-10-15',
        tags: ['furniture', 'office', 'ergonomic']
      },
      {
        id: 'INV002',
        invoiceNumber: 'INV-2024-002',
        vendorId: 'V002',
        vendorName: 'TechSoft Solutions Ltd',
        vendorCode: 'TECH-SOL-002',
        poNumber: 'PO-2024-002',
        invoiceDate: '2024-10-18',
        dueDate: '2024-12-02',
        receivedDate: '2024-10-18',
        status: 'approved',
        category: 'software',
        totalAmount: 285000,
        taxAmount: 51300,
        discountAmount: 0,
        netAmount: 336300,
        currency: 'INR',
        paymentTerms: 'Net 45',
        description: 'Annual software license renewals - Microsoft Office 365 and Adobe Creative Cloud',
        lineItems: [
          {
            id: 'LI003',
            description: 'Microsoft Office 365 Business Premium',
            quantity: 50,
            unitPrice: 3200,
            totalPrice: 160000,
            accountCode: 'SOFT-001',
            costCenter: 'CC-IT'
          },
          {
            id: 'LI004',
            description: 'Adobe Creative Cloud for Teams',
            quantity: 15,
            unitPrice: 8333,
            totalPrice: 125000,
            accountCode: 'SOFT-002',
            costCenter: 'CC-IT'
          }
        ],
        attachments: [
          {
            name: 'Invoice_INV-2024-002.pdf',
            type: 'pdf',
            size: 384000,
            url: '/documents/Invoice_INV-2024-002.pdf'
          }
        ],
        approvalWorkflow: [
          {
            level: 1,
            approver: 'IT Director',
            role: 'Technical',
            status: 'approved',
            comments: 'Licenses verified and required',
            date: '2024-10-19'
          },
          {
            level: 2,
            approver: 'Finance Manager',
            role: 'Financial',
            status: 'approved',
            comments: 'Budget approved',
            date: '2024-10-19'
          }
        ],
        threeWayMatching: {
          poMatch: true,
          goodsReceiptMatch: true,
          priceMatch: true,
          quantityMatch: true,
          matchScore: 100,
          discrepancies: []
        },
        taxDetails: {
          gstRate: 18,
          gstAmount: 51300,
          tdsRate: 10,
          tdsAmount: 28500
        },
        auditTrail: [
          {
            action: 'Invoice Received',
            performedBy: 'AP System',
            timestamp: '2024-10-18T14:15:00Z',
            details: 'Invoice received and three-way matched successfully'
          },
          {
            action: 'Approved',
            performedBy: 'IT Director',
            timestamp: '2024-10-19T09:30:00Z',
            details: 'Technical approval completed'
          }
        ],
        notes: 'Critical for operations - licenses expiring soon',
        tags: ['software', 'licenses', 'renewal', 'microsoft', 'adobe']
      },
      {
        id: 'INV003',
        invoiceNumber: 'INV-2024-003',
        vendorId: 'V003',
        vendorName: 'Premier Events Management',
        vendorCode: 'PREM-EVT-003',
        invoiceDate: '2024-10-15',
        dueDate: '2024-10-30',
        receivedDate: '2024-10-15',
        status: 'pending_payment',
        category: 'services',
        totalAmount: 450000,
        taxAmount: 81000,
        discountAmount: 0,
        netAmount: 531000,
        currency: 'INR',
        paymentTerms: 'Net 15',
        description: 'Product launch event setup and catering services',
        lineItems: [
          {
            id: 'LI005',
            description: 'Event Setup Services',
            quantity: 1,
            unitPrice: 200000,
            totalPrice: 200000,
            accountCode: 'SERV-001',
            costCenter: 'CC-Marketing'
          },
          {
            id: 'LI006',
            description: 'Catering Services',
            quantity: 500,
            unitPrice: 500,
            totalPrice: 250000,
            accountCode: 'SERV-002',
            costCenter: 'CC-Marketing'
          }
        ],
        attachments: [
          {
            name: 'Invoice_INV-2024-003.pdf',
            type: 'pdf',
            size: 512000,
            url: '/documents/Invoice_INV-2024-003.pdf'
          },
          {
            name: 'Event_Photos.zip',
            type: 'zip',
            size: 2048000,
            url: '/documents/Event_Photos.zip'
          }
        ],
        approvalWorkflow: [
          {
            level: 1,
            approver: 'Marketing Director',
            role: 'Department Head',
            status: 'approved',
            comments: 'Event completed successfully',
            date: '2024-10-16'
          },
          {
            level: 2,
            approver: 'Finance Manager',
            role: 'Financial',
            status: 'approved',
            comments: 'Approved for payment',
            date: '2024-10-16'
          }
        ],
        threeWayMatching: {
          poMatch: true,
          goodsReceiptMatch: true,
          priceMatch: true,
          quantityMatch: true,
          matchScore: 100,
          discrepancies: []
        },
        taxDetails: {
          gstRate: 18,
          gstAmount: 81000,
          tdsRate: 10,
          tdsAmount: 45000
        },
        auditTrail: [
          {
            action: 'Invoice Received',
            performedBy: 'AP System',
            timestamp: '2024-10-15T16:45:00Z',
            details: 'Invoice received for completed event'
          },
          {
            action: 'Approved',
            performedBy: 'Marketing Director',
            timestamp: '2024-10-16T11:20:00Z',
            details: 'Event services verified and approved'
          },
          {
            action: 'Financial Approval',
            performedBy: 'Finance Manager',
            timestamp: '2024-10-16T15:30:00Z',
            details: 'Payment approved pending due date'
          }
        ],
        notes: 'Event completed on 2024-10-10, excellent service quality',
        tags: ['event', 'catering', 'marketing', 'launch']
      },
      {
        id: 'INV004',
        invoiceNumber: 'INV-2024-004',
        vendorId: 'V004',
        vendorName: 'Metro Utilities Ltd',
        vendorCode: 'METRO-UTL-004',
        invoiceDate: '2024-10-01',
        dueDate: '2024-10-31',
        receivedDate: '2024-10-01',
        status: 'overdue',
        category: 'utilities',
        totalAmount: 45000,
        taxAmount: 8100,
        discountAmount: 0,
        netAmount: 53100,
        currency: 'INR',
        paymentTerms: 'Net 30',
        description: 'Electricity bill for October 2024',
        lineItems: [
          {
            id: 'LI007',
            description: 'Electricity Charges',
            quantity: 1,
            unitPrice: 45000,
            totalPrice: 45000,
            accountCode: 'UTIL-001',
            costCenter: 'CC-Facilities'
          }
        ],
        attachments: [
          {
            name: 'Invoice_INV-2024-004.pdf',
            type: 'pdf',
            size: 128000,
            url: '/documents/Invoice_INV-2024-004.pdf'
          }
        ],
        approvalWorkflow: [
          {
            level: 1,
            approver: 'Facilities Manager',
            role: 'Department',
            status: 'approved',
            date: '2024-10-02'
          }
        ],
        threeWayMatching: {
          poMatch: true,
          goodsReceiptMatch: true,
          priceMatch: true,
          quantityMatch: true,
          matchScore: 100,
          discrepancies: []
        },
        taxDetails: {
          gstRate: 18,
          gstAmount: 8100
        },
        auditTrail: [
          {
            action: 'Invoice Received',
            performedBy: 'AP System',
            timestamp: '2024-10-01T08:00:00Z',
            details: 'Utility bill received automatically'
          }
        ],
        notes: 'Recurring monthly utility bill',
        tags: ['utilities', 'electricity', 'recurring'],
        recurring: {
          isRecurring: true,
          frequency: 'monthly',
          nextInvoiceDate: '2024-11-01',
          endDate: '2024-12-31'
        }
      }
    ];

    const sampleVendors: Vendor[] = [
      {
        id: 'V001',
        vendorName: 'ABC Office Solutions Pvt Ltd',
        vendorCode: 'ABC-OFF-001',
        category: ['Office Supplies', 'Furniture'],
        contactPerson: {
          name: 'Rajesh Sharma',
          designation: 'Sales Manager',
          email: 'rajesh@abcoffice.com',
          phone: '+91-80-22345678'
        },
        address: {
          street: '123, MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          postalCode: '560001'
        },
        taxDetails: {
          gstNumber: '29ABCDE1234F1Z5',
          panNumber: 'ABCDE1234F',
          tdsRate: 10
        },
        bankDetails: {
          accountNumber: '1234567890',
          accountName: 'ABC Office Solutions Pvt Ltd',
          bankName: 'State Bank of India',
          ifscCode: 'SBIN0001234'
        },
        paymentTerms: 'Net 30',
        creditLimit: 500000,
        rating: 4.5,
        status: 'active',
        registrationDate: '2020-03-15',
        lastTransactionDate: '2024-10-20',
        performance: {
          onTimePayment: 92,
          qualityRating: 4.3,
          disputeRate: 5,
          complianceScore: 95
        },
        taxSettings: {
          tdsApplicable: true,
          tdsRate: 10,
          gstExempt: false,
          gstRate: 18
        }
      },
      {
        id: 'V002',
        vendorName: 'TechSoft Solutions Ltd',
        vendorCode: 'TECH-SOL-002',
        category: ['Software', 'IT Services'],
        contactPerson: {
          name: 'Priya Patel',
          designation: 'Account Manager',
          email: 'priya@techsoft.com',
          phone: '+91-80-33445566'
        },
        address: {
          street: '456, Electronic City',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          postalCode: '560100'
        },
        taxDetails: {
          gstNumber: '29FGHIJ5678K1L2',
          panNumber: 'FGHIJ5678K',
          tdsRate: 10
        },
        bankDetails: {
          accountNumber: '9876543210',
          accountName: 'TechSoft Solutions Ltd',
          bankName: 'HDFC Bank',
          ifscCode: 'HDFC0001234'
        },
        paymentTerms: 'Net 45',
        creditLimit: 1000000,
        rating: 4.8,
        status: 'active',
        registrationDate: '2018-07-20',
        lastTransactionDate: '2024-10-18',
        performance: {
          onTimePayment: 98,
          qualityRating: 4.7,
          disputeRate: 2,
          complianceScore: 98
        },
        taxSettings: {
          tdsApplicable: true,
          tdsRate: 10,
          gstExempt: false,
          gstRate: 18
        }
      }
    ];

    const samplePayments: Payment[] = [
      {
        id: 'PAY001',
        paymentNumber: 'PAY-2024-001',
        invoiceId: 'INV003',
        invoiceNumber: 'INV-2024-003',
        vendorId: 'V003',
        vendorName: 'Premier Events Management',
        paymentDate: '2024-10-25',
        amount: 531000,
        currency: 'INR',
        paymentMethod: 'bank_transfer',
        paymentStatus: 'completed',
        referenceNumber: 'REF20241025001',
        bankReference: 'TXN123456789',
        fees: 50,
        approvedBy: 'Finance Manager',
        approvedDate: '2024-10-24',
        scheduledDate: '2024-10-25',
        notes: 'Payment for product launch event services',
        attachments: [
          {
            name: 'Payment_Advice_PAY001.pdf',
            type: 'pdf',
            url: '/payments/Payment_Advice_PAY001.pdf'
          }
        ],
        auditTrail: [
          {
            action: 'Payment Initiated',
            performedBy: 'AP System',
            timestamp: '2024-10-24T10:00:00Z',
            details: 'Payment scheduled for vendor'
          },
          {
            action: 'Payment Completed',
            performedBy: 'Bank System',
            timestamp: '2024-10-25T09:30:00Z',
            details: 'Bank transfer completed successfully'
          }
        ]
      }
    ];

    const samplePaymentBatches: PaymentBatch[] = [
      {
        id: 'PB001',
        batchNumber: 'BATCH-2024-001',
        batchDate: '2024-10-25',
        totalAmount: 1062000,
        currency: 'INR',
        status: 'approved',
        paymentMethod: 'Bank Transfer',
        bankAccount: 'Current Account - SBI',
        approvals: [
          {
            level: 1,
            approver: 'Finance Manager',
            status: 'approved',
            date: '2024-10-24'
          },
          {
            level: 2,
            approver: 'CFO',
            status: 'approved',
            date: '2024-10-25'
          }
        ],
        payments: [
          {
            invoiceId: 'INV002',
            invoiceNumber: 'INV-2024-002',
            vendorName: 'TechSoft Solutions Ltd',
            amount: 336300,
            status: 'included'
          },
          {
            invoiceId: 'INV003',
            invoiceNumber: 'INV-2024-003',
            vendorName: 'Premier Events Management',
            amount: 531000,
            status: 'included'
          }
        ],
        createdBy: 'AP Team',
        createdDate: '2024-10-24',
        processedDate: '2024-10-25'
      }
    ];

    setTimeout(() => {
      setInvoices(sampleInvoices);
      setVendors(sampleVendors);
      setPayments(samplePayments);
      setPaymentBatches(samplePaymentBatches);
      setFilteredInvoices(sampleInvoices);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...invoices];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.poNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Vendor filter
    if (filterVendor !== 'all') {
      filtered = filtered.filter(item => item.vendorId === filterVendor);
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(item => item.category === filterCategory);
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
      
      filtered = filtered.filter(item => new Date(item.invoiceDate) >= filterDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'invoiceDate':
          aValue = new Date(a.invoiceDate);
          bValue = new Date(b.invoiceDate);
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
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

    setFilteredInvoices(filtered);
  }, [invoices, searchTerm, filterStatus, filterVendor, filterCategory, filterDateRange, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'pending_approval':
      case 'pending_payment':
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'overdue':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'disputed':
      case 'cancelled':
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'received':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
      case 'completed':
      case 'approved':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'pending_approval':
      case 'pending_payment':
      case 'processing':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'overdue':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'disputed':
      case 'cancelled':
      case 'failed':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'received':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'office_supplies':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'equipment':
        return <CogIcon className="h-5 w-5" />;
      case 'software':
        return <CogIcon className="h-5 w-5" />;
      case 'services':
        return <UserIcon className="h-5 w-5" />;
      case 'maintenance':
        return <WrenchIcon className="h-5 w-5" />;
      case 'travel':
        return <TruckIcon className="h-5 w-5" />;
      case 'utilities':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'professional_fees':
        return <UserIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
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

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  // Dashboard analytics
  const dashboardAnalytics = {
    invoiceStatus: {
      labels: ['Pending Approval', 'Approved', 'Pending Payment', 'Paid', 'Overdue'],
      datasets: [{
        data: [1, 1, 1, 1, 1],
        backgroundColor: ['#F59E0B', '#3B82F6', '#8B5CF6', '#10B981', '#EF4444'],
        borderWidth: 0
      }]
    },
    monthlySpending: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Total Invoices',
          data: [450000, 520000, 480000, 550000, 490000, 610000, 580000, 630000, 570000, 905000],
          backgroundColor: '#3B82F6'
        },
        {
          label: 'Paid Amount',
          data: [420000, 480000, 450000, 520000, 470000, 580000, 550000, 600000, 540000, 850000],
          backgroundColor: '#10B981'
        }
      ]
    },
    vendorDistribution: {
      labels: ['ABC Office', 'TechSoft', 'Premier Events', 'Metro Utilities', 'Others'],
      datasets: [{
        data: [125000, 285000, 450000, 45000, 0],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'],
        borderWidth: 0
      }]
    },
    paymentMethod: {
      labels: ['Bank Transfer', 'Check', 'Credit Card', 'Digital Wallet', 'Cash'],
      datasets: [{
        data: [85, 10, 3, 2, 0],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#6B7280'],
        borderWidth: 0
      }]
    }
  };

  const totalInvoices = invoices.length;
  const pendingApprovals = invoices.filter(i => i.status === 'pending_approval').length;
  const pendingPayments = invoices.filter(i => i.status === 'pending_payment').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.netAmount, 0);
  const totalPaid = invoices.filter(i => i.status === 'paid').reduce((sum, inv) => sum + inv.netAmount, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading accounts payable data...</p>
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
                <DocumentTextIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Accounts Payable</h1>
                <p className="text-gray-600 mt-1">Comprehensive invoice processing and payment management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBatchPaymentModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <BanknotesIcon className="h-5 w-5" />
                <span>Batch Payment</span>
              </button>
              <button
                onClick={() => setShowAddPaymentModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CreditCardIcon className="h-5 w-5" />
                <span>Record Payment</span>
              </button>
              <button
                onClick={() => setShowVendorModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Manage Vendors</span>
              </button>
              <button
                onClick={() => setShowAddInvoiceModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Add Invoice</span>
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
              { key: 'invoices', label: 'Invoices', icon: DocumentTextIcon },
              { key: 'payments', label: 'Payments', icon: CreditCardIcon },
              { key: 'vendors', label: 'Vendors', icon: BuildingOfficeIcon },
              { key: 'reports', label: 'Reports', icon: ChartBarIcon },
              { key: 'settings', label: 'Settings', icon: CogIcon }
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
                    <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalInvoices)}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+15.2%</span>
                  <span className="text-gray-600 ml-2">vs last month</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(pendingApprovals)}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <ClockIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-orange-600 font-medium">Needs attention</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAmount)}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+22.8%</span>
                  <span className="text-gray-600 ml-2">vs last month</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(overdueInvoices)}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-xl">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-red-600 font-medium">Urgent action required</span>
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Invoice Status */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Distribution</h3>
                <div className="h-80">
                  <Doughnut 
                    data={dashboardAnalytics.invoiceStatus}
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

              {/* Monthly Spending */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h3>
                <div className="h-80">
                  <Bar 
                    data={dashboardAnalytics.monthlySpending}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + (value / 1000).toFixed(0) + 'K';
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

              {/* Vendor Distribution */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Vendor</h3>
                <div className="h-80">
                  <Pie 
                    data={dashboardAnalytics.vendorDistribution}
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

              {/* Payment Methods */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                <div className="h-80">
                  <Doughnut 
                    data={dashboardAnalytics.paymentMethod}
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

            {/* Recent Invoices */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Invoices</h3>
              <div className="space-y-4">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/20">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg mr-3">
                        {getCategoryIcon(invoice.category)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber} - {invoice.vendorName}</div>
                        <div className="text-sm text-gray-500">{formatCurrency(invoice.netAmount)} • Due: {formatDate(invoice.dueDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{formatDate(invoice.invoiceDate)}</div>
                        <div className="text-sm text-gray-500">Amount: {formatCurrency(invoice.totalAmount)}</div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                        {getStatusIcon(invoice.status)}
                        <span className="ml-1 capitalize">{invoice.status.replace('_', ' ')}</span>
                      </span>
                      {isOverdue(invoice.dueDate) && invoice.status !== 'paid' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-red-700 bg-red-100 border border-red-200">
                          Overdue
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Invoices View */}
        {viewMode === 'invoices' && (
          <>
            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm w-full lg:w-80"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="received">Received</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="approved">Approved</option>
                    <option value="pending_payment">Pending Payment</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="disputed">Disputed</option>
                  </select>
                  <select
                    value={filterVendor}
                    onChange={(e) => setFilterVendor(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Vendors</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>{vendor.vendorName}</option>
                    ))}
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="office_supplies">Office Supplies</option>
                    <option value="equipment">Equipment</option>
                    <option value="software">Software</option>
                    <option value="services">Services</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="travel">Travel</option>
                    <option value="utilities">Utilities</option>
                    <option value="professional_fees">Professional Fees</option>
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

            {/* Invoices Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vendor
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Match Score
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-white/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg mr-3">
                              {getCategoryIcon(invoice.category)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                              <div className="text-sm text-gray-500">{formatDate(invoice.invoiceDate)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{invoice.vendorName}</div>
                          <div className="text-sm text-gray-500">{invoice.vendorCode}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(invoice.netAmount)}</div>
                          <div className="text-sm text-gray-500">Tax: {formatCurrency(invoice.taxAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(invoice.dueDate)}</div>
                          {isOverdue(invoice.dueDate) && invoice.status !== 'paid' && (
                            <div className="text-sm text-red-600 font-medium">Overdue</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(invoice.status)}`}>
                            {getStatusIcon(invoice.status)}
                            <span className="ml-1 capitalize">{invoice.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  invoice.threeWayMatching.matchScore >= 90 ? 'bg-green-500' :
                                  invoice.threeWayMatching.matchScore >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${invoice.threeWayMatching.matchScore}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{invoice.threeWayMatching.matchScore}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedInvoice(invoice);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {invoice.status === 'pending_approval' && (
                              <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-100 transition-all duration-200">
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                            )}
                            {invoice.status === 'approved' && (
                              <button className="text-purple-600 hover:text-purple-900 p-1 rounded-lg hover:bg-purple-100 transition-all duration-200">
                                <BanknotesIcon className="h-4 w-4" />
                              </button>
                            )}
                            <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100 transition-all duration-200">
                              <DocumentArrowDownIcon className="h-4 w-4" />
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

        {/* Other views would be implemented similarly */}
        {viewMode !== 'dashboard' && viewMode !== 'invoices' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View</h3>
              <p className="text-gray-600">This section is ready for development with comprehensive {viewMode} management features.</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {viewMode === 'invoices' && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredInvoices.length}</span> of{' '}
              <span className="font-medium">{invoices.length}</span> invoices
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

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl mr-4">
                    {getCategoryIcon(selectedInvoice.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedInvoice.invoiceNumber}</h2>
                    <p className="text-gray-600">{selectedInvoice.vendorName}</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Invoice Number:</span>
                      <span className="text-sm text-gray-900">{selectedInvoice.invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Vendor:</span>
                      <span className="text-sm text-gray-900">{selectedInvoice.vendorName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Invoice Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedInvoice.invoiceDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Due Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedInvoice.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Payment Terms:</span>
                      <span className="text-sm text-gray-900">{selectedInvoice.paymentTerms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedInvoice.status)}`}>
                        {getStatusIcon(selectedInvoice.status)}
                        <span className="ml-1 capitalize">{selectedInvoice.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                      <span className="text-sm font-bold text-gray-900">{formatCurrency(selectedInvoice.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tax Amount:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedInvoice.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Discount:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedInvoice.discountAmount)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-2">
                      <span className="text-sm font-medium text-gray-600">Net Amount:</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedInvoice.netAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Currency:</span>
                      <span className="text-sm text-gray-900">{selectedInvoice.currency}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Three-Way Matching */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Three-Way Matching</h3>
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        selectedInvoice.threeWayMatching.poMatch ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {selectedInvoice.threeWayMatching.poMatch ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">PO Match</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        selectedInvoice.threeWayMatching.goodsReceiptMatch ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {selectedInvoice.threeWayMatching.goodsReceiptMatch ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">GRN Match</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        selectedInvoice.threeWayMatching.priceMatch ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {selectedInvoice.threeWayMatching.priceMatch ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">Price Match</div>
                    </div>
                    <div className="text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                        selectedInvoice.threeWayMatching.quantityMatch ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {selectedInvoice.threeWayMatching.quantityMatch ? (
                          <CheckCircleIcon className="h-6 w-6 text-green-600" />
                        ) : (
                          <XCircleIcon className="h-6 w-6 text-red-600" />
                        )}
                      </div>
                      <div className="text-sm font-medium text-gray-900">Quantity Match</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center">
                    <div className="text-2xl font-bold text-gray-900">Match Score: {selectedInvoice.threeWayMatching.matchScore}%</div>
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-sm font-medium text-gray-600 pb-3">Description</th>
                          <th className="text-right text-sm font-medium text-gray-600 pb-3">Quantity</th>
                          <th className="text-right text-sm font-medium text-gray-600 pb-3">Unit Price</th>
                          <th className="text-right text-sm font-medium text-gray-600 pb-3">Total</th>
                          <th className="text-left text-sm font-medium text-gray-600 pb-3">Account</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.lineItems.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-3 text-sm font-medium text-gray-900">{item.description}</td>
                            <td className="py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.totalPrice)}</td>
                            <td className="py-3 text-sm text-gray-600">{item.accountCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Approval Workflow */}
              {selectedInvoice.approvalWorkflow.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Workflow</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="space-y-4">
                      {selectedInvoice.approvalWorkflow.map((approval, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-lg mr-3 ${
                              approval.status === 'approved' ? 'bg-green-100' :
                              approval.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
                            }`}>
                              <CheckCircleIcon className={`h-5 w-5 ${
                                approval.status === 'approved' ? 'text-green-600' :
                                approval.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                              }`} />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">Level {approval.level}</div>
                              <div className="text-sm text-gray-600">{approval.approver} - {approval.role}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-sm font-medium ${
                              approval.status === 'approved' ? 'text-green-600' :
                              approval.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                            </div>
                            {approval.date && (
                              <div className="text-sm text-gray-500">{formatDate(approval.date)}</div>
                            )}
                            {approval.comments && (
                              <div className="text-sm text-gray-600 mt-1">{approval.comments}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tax Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Information</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">GST Rate:</span>
                      <span className="text-sm text-gray-900">{selectedInvoice.taxDetails.gstRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">GST Amount:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedInvoice.taxDetails.gstAmount)}</span>
                    </div>
                    {selectedInvoice.taxDetails.tdsRate && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">TDS Rate:</span>
                          <span className="text-sm text-gray-900">{selectedInvoice.taxDetails.tdsRate}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">TDS Amount:</span>
                          <span className="text-sm text-gray-900">{formatCurrency(selectedInvoice.taxDetails.tdsAmount!)}</span>
                        </div>
                      </>
                    )}
                    {selectedInvoice.taxDetails.hsnCode && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">HSN Code:</span>
                        <span className="text-sm text-gray-900">{selectedInvoice.taxDetails.hsnCode}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
                  </div>
                </div>
              )}

              {/* Tags */}
              {selectedInvoice.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedInvoice.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {tag}
                      </span>
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
                {selectedInvoice.status === 'pending_approval' && (
                  <button className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                )}
                {selectedInvoice.status === 'approved' && (
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 flex items-center space-x-2">
                    <BanknotesIcon className="h-4 w-4" />
                    <span>Process Payment</span>
                  </button>
                )}
                <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2">
                  <DocumentArrowDownIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPayablePage;