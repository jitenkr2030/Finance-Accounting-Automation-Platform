'use client';

import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  DocumentTextIcon,
  CalculatorIcon,
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
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  ChartPieIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
  TruckIcon,
  GlobeAltIcon,
  DocumentArrowDownIcon
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

interface TaxComputation {
  id: string;
  taxType: 'income_tax' | 'corporate_tax' | 'gst' | 'vat' | 'customs_duty' | 'excise_duty' | 'service_tax' | 'professional_tax';
  taxYear: string;
  assessmentYear: string;
  taxableIncome: number;
  taxLiability: number;
  taxPaid: number;
  taxRefund: number;
  status: 'draft' | 'calculated' | 'filed' | 'under_review' | 'approved' | 'rejected' | 'completed';
  filingDate?: string;
  dueDate: string;
  jurisdiction: string;
  taxRate: number;
  deductions: number;
  credits: number;
  interestPenalty: number;
  adjustments: number;
  effectiveTaxRate: number;
  lastUpdated: string;
  notes?: string;
  documents: {
    name: string;
    type: string;
    size: number;
    url: string;
    uploadedDate: string;
  }[];
  auditTrail: {
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }[];
  complianceFlags: {
    field: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    resolved: boolean;
  }[];
  calculations: {
    baseAmount: number;
    taxableAmount: number;
    taxAmount: number;
    surcharge: number;
    cess: number;
    totalTax: number;
    inputTaxCredit: number;
    netTax: number;
  };
}

interface TaxRate {
  id: string;
  jurisdiction: string;
  taxType: string;
  rate: number;
  effectiveFrom: string;
  effectiveTo?: string;
  description: string;
  conditions?: string;
  applicableEntities: string[];
}

interface TaxReturn {
  id: string;
  taxComputationId: string;
  formType: string;
  returnType: 'original' | 'revised' | 'belated';
  filingDate: string;
  acknowledgmentNumber: string;
  status: 'draft' | 'submitted' | 'acknowledged' | 'processed' | 'assessment_order' | 'demand_raised';
  xmlFile?: string;
  jsonData?: object;
  responseFile?: string;
  refundAmount?: number;
  demandAmount?: number;
}

const TaxFilingPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'analytics'>('list');
  const [taxComputations, setTaxComputations] = useState<TaxComputation[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([]);
  const [filteredComputations, setFilteredComputations] = useState<TaxComputation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTaxType, setFilterTaxType] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'taxYear' | 'taxLiability' | 'status' | 'dueDate'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedComputation, setSelectedComputation] = useState<TaxComputation | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCalculateModal, setShowCalculateModal] = useState(false);
  const [showComplianceModal, setShowComplianceModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);

  // Sample data
  useEffect(() => {
    const sampleTaxComputations: TaxComputation[] = [
      {
        id: 'TC001',
        taxType: 'income_tax',
        taxYear: '2023-24',
        assessmentYear: '2024-25',
        taxableIncome: 15000000,
        taxLiability: 4160000,
        taxPaid: 3500000,
        taxRefund: 660000,
        status: 'filed',
        filingDate: '2024-07-15',
        dueDate: '2024-07-31',
        jurisdiction: 'India',
        taxRate: 30,
        deductions: 2400000,
        credits: 400000,
        interestPenalty: 15000,
        adjustments: 0,
        effectiveTaxRate: 27.7,
        lastUpdated: '2024-07-16',
        notes: 'Annual income tax return filed with all deductions claimed',
        documents: [
          {
            name: 'ITR_V_Form_2024-25.pdf',
            type: 'pdf',
            size: 2048576,
            url: '/documents/ITR_V_Form_2024-25.pdf',
            uploadedDate: '2024-07-15'
          },
          {
            name: 'Tax_Computation_Sheet.xlsx',
            type: 'excel',
            size: 512000,
            url: '/documents/Tax_Computation_Sheet.xlsx',
            uploadedDate: '2024-07-14'
          }
        ],
        auditTrail: [
          {
            action: 'created',
            performedBy: 'Finance Team',
            timestamp: '2024-07-10 09:30:00',
            details: 'Initial tax computation created for FY 2023-24'
          },
          {
            action: 'calculated',
            performedBy: 'Tax Calculator',
            timestamp: '2024-07-14 14:22:00',
            details: 'Tax liability calculated as ₹41,60,000'
          },
          {
            action: 'filed',
            performedBy: 'CA Team',
            timestamp: '2024-07-15 16:45:00',
            details: 'Tax return filed electronically'
          }
        ],
        complianceFlags: [],
        calculations: {
          baseAmount: 17400000,
          taxableAmount: 15000000,
          taxAmount: 4160000,
          surcharge: 416000,
          cess: 183040,
          totalTax: 4758040,
          inputTaxCredit: 400000,
          netTax: 4358040
        }
      },
      {
        id: 'TC002',
        taxType: 'gst',
        taxYear: '2024-25',
        assessmentYear: '2024-25',
        taxableIncome: 85000000,
        taxLiability: 15300000,
        taxPaid: 14200000,
        taxRefund: 1100000,
        status: 'calculated',
        dueDate: '2024-12-31',
        jurisdiction: 'India',
        taxRate: 18,
        deductions: 0,
        credits: 14500000,
        interestPenalty: 25000,
        adjustments: 500000,
        effectiveTaxRate: 18,
        lastUpdated: '2024-11-20',
        notes: 'GST return for Q2 2024-25',
        documents: [
          {
            name: 'GSTR_3B_Return_Q2.xlsx',
            type: 'excel',
            size: 1024000,
            url: '/documents/GSTR_3B_Return_Q2.xlsx',
            uploadedDate: '2024-11-20'
          }
        ],
        auditTrail: [
          {
            action: 'created',
            performedBy: 'GST Team',
            timestamp: '2024-11-19 11:15:00',
            details: 'Q2 GST return initiated'
          },
          {
            action: 'calculated',
            performedBy: 'GST Calculator',
            timestamp: '2024-11-20 09:30:00',
            details: 'Tax liability calculated as ₹1,53,00,000'
          }
        ],
        complianceFlags: [
          {
            field: 'input_tax_credit',
            severity: 'medium',
            message: 'Input tax credit claimed exceeds 85% of output tax liability',
            resolved: false
          }
        ],
        calculations: {
          baseAmount: 85000000,
          taxableAmount: 85000000,
          taxAmount: 15300000,
          surcharge: 0,
          cess: 0,
          totalTax: 15300000,
          inputTaxCredit: 14500000,
          netTax: 800000
        }
      },
      {
        id: 'TC003',
        taxType: 'corporate_tax',
        taxYear: '2023-24',
        assessmentYear: '2024-25',
        taxableIncome: 45000000,
        taxLiability: 9450000,
        taxPaid: 8000000,
        taxRefund: 1450000,
        status: 'completed',
        filingDate: '2024-08-30',
        dueDate: '2024-09-30',
        jurisdiction: 'India',
        taxRate: 25,
        deductions: 12000000,
        credits: 800000,
        interestPenalty: 35000,
        adjustments: 200000,
        effectiveTaxRate: 21,
        lastUpdated: '2024-09-15',
        notes: 'Corporate tax return processed successfully',
        documents: [
          {
            name: 'ITR_6_Form_2024-25.pdf',
            type: 'pdf',
            size: 3072000,
            url: '/documents/ITR_6_Form_2024-25.pdf',
            uploadedDate: '2024-08-30'
          }
        ],
        auditTrail: [
          {
            action: 'created',
            performedBy: 'Corporate Tax Team',
            timestamp: '2024-08-25 10:00:00',
            details: 'Corporate tax computation initiated'
          },
          {
            action: 'calculated',
            performedBy: 'Tax Calculator',
            timestamp: '2024-08-28 15:45:00',
            details: 'Tax liability calculated as ₹94,50,000'
          },
          {
            action: 'filed',
            performedBy: 'CA Team',
            timestamp: '2024-08-30 14:20:00',
            details: 'Corporate tax return filed'
          },
          {
            action: 'completed',
            performedBy: 'Tax Authority',
            timestamp: '2024-09-15 16:00:00',
            details: 'Return processed and refund issued'
          }
        ],
        complianceFlags: [],
        calculations: {
          baseAmount: 57000000,
          taxableAmount: 45000000,
          taxAmount: 9450000,
          surcharge: 945000,
          cess: 415800,
          totalTax: 10810800,
          inputTaxCredit: 800000,
          netTax: 10010800
        }
      },
      {
        id: 'TC004',
        taxType: 'service_tax',
        taxYear: '2024-25',
        assessmentYear: '2024-25',
        taxableIncome: 12000000,
        taxLiability: 1680000,
        taxPaid: 1500000,
        taxRefund: 180000,
        status: 'under_review',
        dueDate: '2024-12-15',
        jurisdiction: 'India',
        taxRate: 14,
        deductions: 0,
        credits: 200000,
        interestPenalty: 5000,
        adjustments: 0,
        effectiveTaxRate: 12.3,
        lastUpdated: '2024-11-25',
        notes: 'Service tax under review for compliance verification',
        documents: [
          {
            name: 'Service_Tax_Return_Q2.pdf',
            type: 'pdf',
            size: 1536000,
            url: '/documents/Service_Tax_Return_Q2.pdf',
            uploadedDate: '2024-11-25'
          }
        ],
        auditTrail: [
          {
            action: 'created',
            performedBy: 'Service Tax Team',
            timestamp: '2024-11-22 08:30:00',
            details: 'Service tax return created'
          },
          {
            action: 'calculated',
            performedBy: 'Tax Calculator',
            timestamp: '2024-11-24 13:45:00',
            details: 'Tax liability calculated as ₹16,80,000'
          },
          {
            action: 'submitted',
            performedBy: 'Compliance Team',
            timestamp: '2024-11-25 10:15:00',
            details: 'Return submitted for review'
          }
        ],
        complianceFlags: [
          {
            field: 'service_classification',
            severity: 'high',
            message: 'Service classification requires verification for accuracy',
            resolved: false
          },
          {
            field: 'exemption_threshold',
            severity: 'low',
            message: 'Check if service tax exemption threshold is applicable',
            resolved: false
          }
        ],
        calculations: {
          baseAmount: 12000000,
          taxableAmount: 12000000,
          taxAmount: 1680000,
          surcharge: 168000,
          cess: 73920,
          totalTax: 1921920,
          inputTaxCredit: 200000,
          netTax: 1721920
        }
      },
      {
        id: 'TC005',
        taxType: 'professional_tax',
        taxYear: '2024-25',
        assessmentYear: '2024-25',
        taxableIncome: 8500000,
        taxLiability: 255000,
        taxPaid: 255000,
        taxRefund: 0,
        status: 'completed',
        filingDate: '2024-09-30',
        dueDate: '2024-10-31',
        jurisdiction: 'Karnataka',
        taxRate: 3,
        deductions: 0,
        credits: 0,
        interestPenalty: 0,
        adjustments: 0,
        effectiveTaxRate: 3,
        lastUpdated: '2024-10-01',
        notes: 'Professional tax payment completed for all employees',
        documents: [
          {
            name: 'Professional_Tax_Payment_Receipt.pdf',
            type: 'pdf',
            size: 512000,
            url: '/documents/Professional_Tax_Payment_Receipt.pdf',
            uploadedDate: '2024-09-30'
          }
        ],
        auditTrail: [
          {
            action: 'created',
            performedBy: 'HR Team',
            timestamp: '2024-09-25 12:00:00',
            details: 'Professional tax computation initiated'
          },
          {
            action: 'calculated',
            performedBy: 'Tax Calculator',
            timestamp: '2024-09-28 16:30:00',
            details: 'Tax liability calculated as ₹2,55,000'
          },
          {
            action: 'paid',
            performedBy: 'Finance Team',
            timestamp: '2024-09-30 11:45:00',
            details: 'Professional tax amount paid online'
          }
        ],
        complianceFlags: [],
        calculations: {
          baseAmount: 8500000,
          taxableAmount: 8500000,
          taxAmount: 255000,
          surcharge: 0,
          cess: 0,
          totalTax: 255000,
          inputTaxCredit: 0,
          netTax: 255000
        }
      }
    ];

    const sampleTaxRates: TaxRate[] = [
      {
        id: 'TR001',
        jurisdiction: 'India',
        taxType: 'income_tax',
        rate: 30,
        effectiveFrom: '2024-04-01',
        effectiveTo: '2025-03-31',
        description: 'Income tax rate for corporate entities',
        applicableEntities: ['corporate', 'llp', 'company']
      },
      {
        id: 'TR002',
        jurisdiction: 'India',
        taxType: 'gst',
        rate: 18,
        effectiveFrom: '2017-07-01',
        description: 'Standard GST rate for goods and services',
        applicableEntities: ['registered_dealer', 'business']
      },
      {
        id: 'TR003',
        jurisdiction: 'Karnataka',
        taxType: 'professional_tax',
        rate: 3,
        effectiveFrom: '2024-01-01',
        description: 'Professional tax rate for businesses',
        applicableEntities: ['employer', 'professional']
      },
      {
        id: 'TR004',
        jurisdiction: 'India',
        taxType: 'service_tax',
        rate: 14,
        effectiveFrom: '2024-04-01',
        effectiveTo: '2025-03-31',
        description: 'Service tax rate for specified services',
        applicableEntities: ['service_provider']
      }
    ];

    const sampleTaxReturns: TaxReturn[] = [
      {
        id: 'TRT001',
        taxComputationId: 'TC001',
        formType: 'ITR-6',
        returnType: 'original',
        filingDate: '2024-07-15',
        acknowledgmentNumber: 'ITR202420245678901234',
        status: 'processed',
        refundAmount: 660000,
        responseFile: '/documents/ITR_Processing_Response.json'
      },
      {
        id: 'TRT002',
        taxComputationId: 'TC002',
        formType: 'GSTR-3B',
        returnType: 'original',
        filingDate: '2024-11-20',
        acknowledgmentNumber: 'GST202421115678901234',
        status: 'submitted',
        refundAmount: 1100000
      },
      {
        id: 'TRT003',
        taxComputationId: 'TC003',
        formType: 'ITR-6',
        returnType: 'original',
        filingDate: '2024-08-30',
        acknowledgmentNumber: 'ITR202423045678901234',
        status: 'assessment_order',
        refundAmount: 1450000,
        demandAmount: 0
      }
    ];

    setTimeout(() => {
      setTaxComputations(sampleTaxComputations);
      setTaxRates(sampleTaxRates);
      setTaxReturns(sampleTaxReturns);
      setFilteredComputations(sampleTaxComputations);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...taxComputations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.taxType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.taxYear.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Tax type filter
    if (filterTaxType !== 'all') {
      filtered = filtered.filter(item => item.taxType === filterTaxType);
    }

    // Year filter
    if (filterYear !== 'all') {
      filtered = filtered.filter(item => item.taxYear === filterYear);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'taxYear':
          aValue = a.taxYear;
          bValue = b.taxYear;
          break;
        case 'taxLiability':
          aValue = a.taxLiability;
          bValue = b.taxLiability;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate);
          bValue = new Date(b.dueDate);
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

    setFilteredComputations(filtered);
  }, [taxComputations, searchTerm, filterStatus, filterTaxType, filterYear, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'filed':
        return <DocumentTextIcon className="h-5 w-5 text-blue-500" />;
      case 'calculated':
        return <CalculatorIcon className="h-5 w-5 text-orange-500" />;
      case 'under_review':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'approved':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'filed':
      case 'submitted':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'calculated':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'under_review':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getTaxTypeIcon = (taxType: string) => {
    switch (taxType) {
      case 'income_tax':
        return <CurrencyDollarIcon className="h-5 w-5" />;
      case 'corporate_tax':
        return <BanknotesIcon className="h-5 w-5" />;
      case 'gst':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'service_tax':
        return <TruckIcon className="h-5 w-5" />;
      default:
        return <CalculatorIcon className="h-5 w-5" />;
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

  // Analytics data
  const analyticsData = {
    taxTypeDistribution: {
      labels: ['Income Tax', 'GST', 'Corporate Tax', 'Service Tax', 'Professional Tax'],
      datasets: [{
        data: [1, 1, 1, 1, 1],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
        borderWidth: 0
      }]
    },
    taxLiabilityComparison: {
      labels: ['Income Tax', 'Corporate Tax', 'GST', 'Service Tax', 'Professional Tax'],
      datasets: [
        {
          label: 'Tax Liability',
          data: [4160000, 9450000, 15300000, 1680000, 255000],
          backgroundColor: '#3B82F6',
          borderRadius: 6
        },
        {
          label: 'Tax Paid',
          data: [3500000, 8000000, 14200000, 1500000, 255000],
          backgroundColor: '#10B981',
          borderRadius: 6
        }
      ]
    },
    monthlyTaxTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [
        {
          label: 'Tax Liability',
          data: [0, 0, 0, 2000000, 3000000, 2500000, 4160000, 9450000, 255000, 0, 15300000, 1680000],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Tax Paid',
          data: [0, 0, 0, 1800000, 2800000, 2200000, 3500000, 8000000, 255000, 0, 14200000, 1500000],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    statusOverview: {
      labels: ['Completed', 'Filed', 'Calculated', 'Under Review'],
      datasets: [{
        data: [2, 1, 1, 1],
        backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#F59E0B'],
        borderWidth: 0
      }]
    }
  };

  const totalTaxLiability = taxComputations.reduce((sum, item) => sum + item.taxLiability, 0);
  const totalTaxPaid = taxComputations.reduce((sum, item) => sum + item.taxPaid, 0);
  const totalRefund = taxComputations.reduce((sum, item) => sum + item.taxRefund, 0);
  const pendingCompliance = taxComputations.reduce((sum, item) => sum + item.complianceFlags.filter(flag => !flag.resolved).length, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading tax computations...</p>
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
                <CalculatorIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Tax Filing & Computation</h1>
                <p className="text-gray-600 mt-1">Comprehensive tax calculation and filing automation</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCalculateModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CalculatorIcon className="h-5 w-5" />
                <span>Calculate Tax</span>
              </button>
              <button
                onClick={() => setShowReturnModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>File Return</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5" />
                <span>New Computation</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tax Liability</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTaxLiability)}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+12.5%</span>
              <span className="text-gray-600 ml-2">vs last year</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tax Paid</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalTaxPaid)}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <BanknotesIcon className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+8.3%</span>
              <span className="text-gray-600 ml-2">vs last year</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tax Refund</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalRefund)}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-xl">
                <DocumentArrowDownIcon className="h-8 w-8 text-emerald-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+15.7%</span>
              <span className="text-gray-600 ml-2">vs last year</span>
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Issues</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCompliance}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <ExclamationTriangleIcon className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-red-600 font-medium">+2</span>
              <span className="text-gray-600 ml-2">new issues</span>
            </div>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl">
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'list'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>List</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'grid'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ChartPieIcon className="h-4 w-4" />
                  <span>Grid</span>
                </div>
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  viewMode === 'analytics'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-4 w-4" />
                  <span>Analytics</span>
                </div>
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tax computations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="calculated">Calculated</option>
                <option value="filed">Filed</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={filterTaxType}
                onChange={(e) => setFilterTaxType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
              >
                <option value="all">All Tax Types</option>
                <option value="income_tax">Income Tax</option>
                <option value="corporate_tax">Corporate Tax</option>
                <option value="gst">GST</option>
                <option value="service_tax">Service Tax</option>
                <option value="professional_tax">Professional Tax</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Tax Type Distribution */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Type Distribution</h3>
              <div className="h-80">
                <Pie 
                  data={analyticsData.taxTypeDistribution}
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

            {/* Tax Liability Comparison */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Liability vs Tax Paid</h3>
              <div className="h-80">
                <Bar 
                  data={analyticsData.taxLiabilityComparison}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₹' + (value / 1000000).toFixed(1) + 'M';
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

            {/* Monthly Tax Trends */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Tax Trends</h3>
              <div className="h-80">
                <Line 
                  data={analyticsData.monthlyTaxTrends}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return '₹' + (value / 1000000).toFixed(1) + 'M';
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

            {/* Status Overview */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Return Status Overview</h3>
              <div className="h-80">
                <Doughnut 
                  data={analyticsData.statusOverview}
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
        )}

        {/* List/Grid View */}
        {(viewMode === 'list' || viewMode === 'grid') && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
            {viewMode === 'list' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Computation
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Year
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tax Liability
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-gray-200">
                    {filteredComputations.map((computation) => (
                      <tr key={computation.id} className="hover:bg-white/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg mr-3">
                              {getTaxTypeIcon(computation.taxType)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{computation.id}</div>
                              <div className="text-sm text-gray-500">{computation.jurisdiction}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{computation.taxType.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{computation.taxYear}</div>
                          <div className="text-sm text-gray-500">AY: {computation.assessmentYear}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(computation.taxLiability)}</div>
                          <div className="text-sm text-gray-500">Paid: {formatCurrency(computation.taxPaid)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(computation.status)}`}>
                            {getStatusIcon(computation.status)}
                            <span className="ml-1 capitalize">{computation.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(computation.dueDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedComputation(computation);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedComputation(computation);
                                setShowEditModal(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100 transition-all duration-200"
                            >
                              <PencilIcon className="h-4 w-4" />
                            </button>
                            {computation.complianceFlags.filter(flag => !flag.resolved).length > 0 && (
                              <button
                                onClick={() => {
                                  setSelectedComputation(computation);
                                  setShowComplianceModal(true);
                                }}
                                className="text-orange-600 hover:text-orange-900 p-1 rounded-lg hover:bg-orange-100 transition-all duration-200"
                              >
                                <ExclamationTriangleIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredComputations.map((computation) => (
                    <div key={computation.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg mr-3">
                            {getTaxTypeIcon(computation.taxType)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{computation.id}</div>
                            <div className="text-sm text-gray-500">{computation.jurisdiction}</div>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(computation.status)}`}>
                          {getStatusIcon(computation.status)}
                          <span className="ml-1 capitalize">{computation.status.replace('_', ' ')}</span>
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tax Type:</span>
                          <span className="text-sm font-medium text-gray-900 capitalize">{computation.taxType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tax Year:</span>
                          <span className="text-sm font-medium text-gray-900">{computation.taxYear}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Tax Liability:</span>
                          <span className="text-sm font-medium text-gray-900">{formatCurrency(computation.taxLiability)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Due Date:</span>
                          <span className="text-sm font-medium text-gray-900">{formatDate(computation.dueDate)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {computation.complianceFlags.filter(flag => !flag.resolved).length > 0 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                              <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                              {computation.complianceFlags.filter(flag => !flag.resolved).length} Issues
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => {
                              setSelectedComputation(computation);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedComputation(computation);
                              setShowEditModal(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100 transition-all duration-200"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredComputations.length}</span> of{' '}
            <span className="font-medium">{taxComputations.length}</span> tax computations
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
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedComputation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl mr-4">
                    {getTaxTypeIcon(selectedComputation.taxType)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedComputation.id}</h2>
                    <p className="text-gray-600">Tax Computation Details</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tax Type:</span>
                      <span className="text-sm text-gray-900 capitalize">{selectedComputation.taxType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tax Year:</span>
                      <span className="text-sm text-gray-900">{selectedComputation.taxYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Assessment Year:</span>
                      <span className="text-sm text-gray-900">{selectedComputation.assessmentYear}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Jurisdiction:</span>
                      <span className="text-sm text-gray-900">{selectedComputation.jurisdiction}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedComputation.status)}`}>
                        {getStatusIcon(selectedComputation.status)}
                        <span className="ml-1 capitalize">{selectedComputation.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Calculations</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Taxable Income:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedComputation.taxableIncome)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tax Rate:</span>
                      <span className="text-sm text-gray-900">{selectedComputation.taxRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tax Liability:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(selectedComputation.taxLiability)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tax Paid:</span>
                      <span className="text-sm text-gray-900">{formatCurrency(selectedComputation.taxPaid)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Tax Refund:</span>
                      <span className="text-sm text-green-600">{formatCurrency(selectedComputation.taxRefund)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Calculations */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Tax Calculations</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedComputation.calculations.baseAmount)}</div>
                    <div className="text-sm text-gray-600">Base Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedComputation.calculations.taxableAmount)}</div>
                    <div className="text-sm text-gray-600">Taxable Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{formatCurrency(selectedComputation.calculations.taxAmount)}</div>
                    <div className="text-sm text-gray-600">Tax Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(selectedComputation.calculations.surcharge)}</div>
                    <div className="text-sm text-gray-600">Surcharge</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{formatCurrency(selectedComputation.calculations.cess)}</div>
                    <div className="text-sm text-gray-600">Cess</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{formatCurrency(selectedComputation.calculations.totalTax)}</div>
                    <div className="text-sm text-gray-600">Total Tax</div>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Documents</h3>
                <div className="space-y-3">
                  {selectedComputation.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <DocumentTextIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                          <div className="text-sm text-gray-500">{doc.type.toUpperCase()} • {(doc.size / 1024 / 1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">{formatDate(doc.uploadedDate)}</span>
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200">
                          <DocumentArrowDownIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Audit Trail */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Trail</h3>
                <div className="space-y-3">
                  {selectedComputation.auditTrail.map((entry, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-xl">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <ClockIcon className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 capitalize">{entry.action}</span>
                          <span className="text-sm text-gray-500">{formatDate(entry.timestamp)}</span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">{entry.details}</div>
                        <div className="text-sm text-gray-500 mt-1">by {entry.performedBy}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowEditModal(true);
                  }}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">New Tax Computation</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Type</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Tax Type</option>
                    <option value="income_tax">Income Tax</option>
                    <option value="corporate_tax">Corporate Tax</option>
                    <option value="gst">GST</option>
                    <option value="service_tax">Service Tax</option>
                    <option value="professional_tax">Professional Tax</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jurisdiction</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., India, Karnataka"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Year</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2024-25"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Year</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 2025-26"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Taxable Income</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter taxable income"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter tax rate"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deductions</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter deductions"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
                >
                  Create Computation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calculate Tax Modal */}
      {showCalculateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Tax Calculator</h2>
                <button
                  onClick={() => setShowCalculateModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Computation ID</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select computation to calculate</option>
                    {taxComputations.map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.id} - {comp.taxType}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Calculation Method</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="standard">Standard Calculation</option>
                    <option value="simplified">Simplified Method</option>
                    <option value="detailed">Detailed Breakdown</option>
                    <option value="comparison">Compare Methods</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Year</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                    <option value="2022-23">2022-23</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Year</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="2025-26">2025-26</option>
                    <option value="2024-25">2024-25</option>
                    <option value="2023-24">2023-24</option>
                  </select>
                </div>
              </div>

              {/* Calculation Results Preview */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Calculation Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">₹15,00,000</div>
                    <div className="text-sm text-gray-600">Taxable Income</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">30%</div>
                    <div className="text-sm text-gray-600">Tax Rate</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-red-600">₹4,16,000</div>
                    <div className="text-sm text-gray-600">Tax Liability</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Parameters</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="number"
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Deductions"
                  />
                  <input
                    type="number"
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tax Credits"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowCalculateModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowCalculateModal(false);
                    // Add calculation logic here
                  }}
                  className="px-6 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <CalculatorIcon className="h-4 w-4" />
                  <span>Calculate Tax</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Compliance Modal */}
      {showComplianceModal && selectedComputation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-orange-100 p-3 rounded-xl mr-4">
                    <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Compliance Issues</h2>
                    <p className="text-gray-600">{selectedComputation.id} - Tax Computation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowComplianceModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                {selectedComputation.complianceFlags.filter(flag => !flag.resolved).map((flag, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          flag.severity === 'critical' ? 'text-red-700 bg-red-100 border-red-200' :
                          flag.severity === 'high' ? 'text-orange-700 bg-orange-100 border-orange-200' :
                          flag.severity === 'medium' ? 'text-yellow-700 bg-yellow-100 border-yellow-200' :
                          'text-blue-700 bg-blue-100 border-blue-200'
                        }`}>
                          {flag.severity.toUpperCase()}
                        </span>
                        <span className="ml-3 text-sm font-medium text-gray-900">{flag.field}</span>
                      </div>
                      <button className="text-green-600 hover:text-green-900 px-3 py-1 bg-green-100 rounded-lg text-sm font-medium transition-all duration-200">
                        Mark Resolved
                      </button>
                    </div>
                    <p className="text-gray-700">{flag.message}</p>
                  </div>
                ))}
              </div>

              {selectedComputation.complianceFlags.filter(flag => !flag.resolved).length === 0 && (
                <div className="text-center py-12">
                  <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Compliance Issues</h3>
                  <p className="text-gray-600">This tax computation is compliant with all regulations.</p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowComplianceModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowComplianceModal(false);
                    // Add bulk resolve logic
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200"
                >
                  Resolve All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-3 rounded-xl mr-4">
                    <DocumentTextIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">File Tax Return</h2>
                    <p className="text-gray-600">Submit tax computation for processing</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Computation</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select computation</option>
                    {taxComputations.filter(comp => comp.status === 'calculated').map(comp => (
                      <option key={comp.id} value={comp.id}>{comp.id} - {comp.taxType}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Form Type</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="ITR-1">ITR-1 (Sahaj)</option>
                    <option value="ITR-2">ITR-2</option>
                    <option value="ITR-3">ITR-3</option>
                    <option value="ITR-4">ITR-4 (Sugam)</option>
                    <option value="ITR-5">ITR-5</option>
                    <option value="ITR-6">ITR-6</option>
                    <option value="GSTR-3B">GSTR-3B</option>
                    <option value="GSTR-1">GSTR-1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Type</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="original">Original Return</option>
                    <option value="revised">Revised Return</option>
                    <option value="belated">Belated Return</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filing Date</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Required Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Documents</h3>
                <div className="space-y-3">
                  {[
                    'Tax Computation Sheet',
                    'Balance Sheet',
                    'Profit & Loss Account',
                    'Bank Statements',
                    'TDS Certificates',
                    'Investment Proofs'
                  ].map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{doc}</span>
                      <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                        Upload
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Filing Checklist */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filing Checklist</h3>
                <div className="space-y-3">
                  {[
                    'All income details verified',
                    'Deductions properly claimed',
                    'Tax calculations cross-checked',
                    'Supporting documents attached',
                    'Digital signature ready',
                    'Payment gateway configured'
                  ].map((item, index) => (
                    <label key={index} className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                      <span className="ml-3 text-sm text-gray-900">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => setShowReturnModal(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowReturnModal(false);
                    // Add filing logic here
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2"
                >
                  <DocumentTextIcon className="h-4 w-4" />
                  <span>File Return</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaxFilingPage;