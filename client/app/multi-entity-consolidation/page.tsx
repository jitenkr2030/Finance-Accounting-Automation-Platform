'use client';

import React, { useState, useEffect } from 'react';
import {
  BuildingOfficeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ClockIcon,
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
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarIcon,
  ShareIcon,
  PrinterIcon,
  DocumentArrowDownIcon,
  CogIcon,
  StarIcon,
  ShieldCheckIcon,
  ChartPieIcon,
  PresentationChartBarIcon,
  UsersIcon,
  BriefcaseIcon,
  HomeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon as GlobeAltIconOutline,
  ComputerDesktopIcon,
  DeviceTabletIcon,
  CloudIcon,
  ServerIcon,
  DatabaseIcon,
  CircleStackIcon,
  CodeBracketSquareIcon,
  CommandLineIcon,
  BoltIcon,
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
  PuzzlePieceIcon,
  WrenchScrewdriverIcon,
  PresentationChartBarIcon as PresentationChartBarIconOutline,
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
  DeviceTabletIcon as DeviceTabletIconOutline,
  ComputerDesktopIcon as ComputerDesktopIconOutline,
  CloudIcon as CloudIconOutline,
  ServerIcon as ServerIconOutline,
  DatabaseIcon as DatabaseIconOutline,
  CircleStackIcon as CircleStackIconOutline,
  CodeBracketSquareIcon as CodeBracketSquareIconOutline,
  CommandLineIcon as CommandLineIconOutline,
  WrenchScrewdriverIcon as WrenchScrewdriverIconOutline,
  PresentationChartBarIconOutline as PresentationChartBarIconOutline,
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
  DeviceTabletIconOutline as DeviceTabletIconOutline,
  CloudIconOutline as CloudIconOutline,
  ServerIconOutline as ServerIconOutline,
  DatabaseIconOutline as DatabaseIconOutline,
  CircleStackIconOutline as CircleStackIconOutline,
  CodeBracketSquareIconOutline as CodeBracketSquareIconOutline,
  CommandLineIconOutline as CommandLineIconOutline,
} from '@heroicons/react/24/outline';

interface Entity {
  id: string;
  entityCode: string;
  name: string;
  legalName: string;
  type: 'Parent' | 'Subsidiary' | 'Associate' | 'Joint Venture' | 'Branch' | 'Division' | 'Unit';
  status: 'Active' | 'Inactive' | 'Under Liquidation' | 'Dissolved' | 'Dormant';
  industry: string;
  country: string;
  jurisdiction: string;
  registrationNumber: string;
  taxNumber: string;
  incorporationDate: string;
  financialYearEnd: string;
  reportingCurrency: string;
  functionalCurrency: string;
  ownershipPercentage: number;
  parentEntityId?: string;
  ultimateParentId?: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
    fax?: string;
  };
  management: {
    ceo: string;
    cfo: string;
    boardOfDirectors: string[];
    keyManagement: Array<{
      name: string;
      position: string;
      email: string;
      phone: string;
    }>;
  };
  financials: {
    totalAssets: number;
    totalLiabilities: number;
    equity: number;
    revenue: number;
    netIncome: number;
    cashFlow: number;
    lastAuditDate: string;
    auditor: string;
    auditStatus: 'Clean' | 'Qualified' | 'Adverse' | 'Disclaimer';
  };
  compliance: {
    regulatoryStatus: 'Compliant' | 'Non-Compliant' | 'Under Review' | 'Exempt';
    lastComplianceCheck: string;
    complianceIssues: number;
    riskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  };
  relationships: Array<{
    entityId: string;
    relationshipType: 'Subsidiary' | 'Associate' | 'Joint Venture' | 'Investment' | 'Debt' | 'Guarantee';
    percentage?: number;
    amount?: number;
    terms?: string;
  }>;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
    category: 'Legal' | 'Financial' | 'Regulatory' | 'Operational';
  }>;
  tags: string[];
  notes: string;
  aiInsights: {
    riskScore: number;
    financialHealth: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    growthPotential: 'High' | 'Medium' | 'Low';
    recommendedActions: string[];
    benchmarking: {
      industry: string;
      performance: string;
      rank: number;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface ConsolidationRule {
  id: string;
  name: string;
  description: string;
  scope: 'Full' | 'Proportional' | 'Equity Method' | 'Fair Value';
  consolidationType: 'Line-by-Line' | 'Aggregation' | 'Elimination';
  ruleType: 'Ownership' | 'Control' | 'Significant Influence' | 'Contractual' | 'Regulatory';
  conditions: Array<{
    field: string;
    operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
    value: string | number | string[];
    logicalOperator?: 'AND' | 'OR';
  }>;
  calculationMethod: 'Direct' | 'Step-by-Step' | 'Hybrid';
  eliminationEntries: Array<{
    account: string;
    description: string;
    calculation: string;
    impact: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  }>;
  currencyHandling: 'Keep Original' | 'Convert All' | 'Mixed Approach';
  fxRates: {
    spot: number;
    average: number;
    closing: number;
    historical: number;
  };
  intercompanyElimination: {
    enabled: boolean;
    method: 'Simple' | 'Complex' | 'Advanced';
    accounts: string[];
    autoDetect: boolean;
  };
  minorityInterest: {
    calculate: boolean;
    method: 'Ownership %' | 'Fair Value' | 'Book Value';
    presentation: 'Equity' | 'Liability' | 'Separate Line';
  };
  businessCombination: {
    method: 'Purchase' | 'Pooling of Interests' | 'Common Control';
    goodwillCalculation: 'Impairment Only' | 'Amortization' | 'Fair Value';
    fairValueAdjustment: boolean;
  };
  reportingRequirements: {
    ifrs: boolean;
    usGaap: boolean;
    localGaap: boolean;
    custom: string[];
  };
  automation: {
    autoRun: boolean;
    schedule: string;
    validation: boolean;
    alerts: boolean;
  };
  status: 'Active' | 'Inactive' | 'Draft' | 'Under Review';
  createdBy: string;
  approvedBy?: string;
  effectiveDate: string;
  expiryDate?: string;
  lastRunDate?: string;
  performance: {
    executionTime: number;
    recordsProcessed: number;
    errors: number;
    warnings: number;
  };
}

interface ConsolidationWorkbook {
  id: string;
  workbookNumber: string;
  title: string;
  description: string;
  period: {
    startDate: string;
    endDate: string;
    year: number;
    quarter: number;
    month: number;
  };
  status: 'Draft' | 'In Progress' | 'Review' | 'Approved' | 'Published' | 'Archived';
  entities: string[];
  parentEntity: string;
  consolidationRule: string;
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  currency: string;
  exchangeRate: number;
  exchangeRateDate: string;
  reportingDate: string;
  sheets: Array<{
    id: string;
    name: string;
    type: 'Balance Sheet' | 'Income Statement' | 'Cash Flow' | 'Statement of Equity' | 'Notes' | 'Working Papers';
    status: 'Pending' | 'In Progress' | 'Completed' | 'Reviewed' | 'Approved';
    data: any[];
    formulas: Record<string, string>;
    validations: Array<{
      cell: string;
      rule: string;
      message: string;
    }>;
    comments: Array<{
      id: string;
      cell: string;
      author: string;
      comment: string;
      timestamp: string;
      resolved: boolean;
    }>;
  }>;
  validation: {
    checks: Array<{
      id: string;
      name: string;
      type: 'Arithmetic' | 'Cross-Reference' | 'Trend' | 'Ratio' | 'Regulatory';
      formula: string;
      expected: string;
      actual: string;
      status: 'Pass' | 'Fail' | 'Warning';
      severity: 'Error' | 'Warning' | 'Info';
    }>;
    summary: {
      total: number;
      passed: number;
      failed: number;
      warnings: number;
    };
  };
  eliminationEntries: Array<{
    id: string;
    description: string;
    debitAccount: string;
    creditAccount: string;
    amount: number;
    currency: string;
    rationale: string;
    status: 'Pending' | 'Approved' | 'Reversed';
    preparedBy: string;
    reviewedBy?: string;
    approvedBy?: string;
  }>;
  minorityInterest: {
    calculate: boolean;
    total: number;
    breakdown: Array<{
      entity: string;
      percentage: number;
      amount: number;
    }>;
  };
  adjustments: Array<{
    id: string;
    description: string;
    account: string;
    amount: number;
    debitCredit: 'Debit' | 'Credit';
    rationale: string;
    type: 'Accrual' | 'Deferral' | 'Reclassification' | 'Estimate' | 'Other';
    status: 'Pending' | 'Approved' | 'Rejected';
    preparedBy: string;
    reviewedBy?: string;
    approvedBy?: string;
  }];
  auditTrail: Array<{
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
    ipAddress: string;
  }>;
  aiInsights: {
    dataQuality: number;
    completeness: number;
    accuracy: number;
    anomalies: string[];
    recommendations: string[];
    riskFlags: string[];
  };
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
    category: 'Source Data' | 'Working Papers' | 'Supporting' | 'Reports' | 'Correspondence';
  }>;
  workflow: {
    stages: Array<{
      id: string;
      name: string;
      status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
      assignedTo: string;
      startedAt?: string;
      completedAt?: string;
      dueDate: string;
      dependencies: string[];
    }>;
    currentStage: string;
    progress: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface IntercompanyTransaction {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  valueDate: string;
  type: 'Sale' | 'Purchase' | 'Service' | 'Loan' | 'Investment' | 'Dividend' | 'Management Fee' | 'Royalty' | 'Transfer Pricing';
  description: string;
  fromEntity: string;
  toEntity: string;
  amount: number;
  currency: string;
  exchangeRate: number;
  amountInReportingCurrency: number;
  account: string;
  costCenter?: string;
  projectCode?: string;
  approvalStatus: 'Pending' | 'Approved' | 'Rejected' | 'Reversed';
  approvedBy?: string;
  approvedAt?: string;
  reversalOf?: string;
  reversalReason?: string;
  taxImplications: {
    withholdingTax: number;
    vat: number;
    transferPricingAdjustment: number;
    documentationRequired: boolean;
  };
  compliance: {
    armLengthPrinciple: boolean;
    contemporaneousDocumentation: boolean;
    functionalAnalysis: string;
    benchmarking: {
      method: string;
      range: string;
      median: number;
      position: string;
    };
  };
  supportingDocuments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  auditTrail: Array<{
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }>;
  aiAnalysis: {
    armLengthAnalysis: number;
    riskAssessment: 'Low' | 'Medium' | 'High';
    flaggedForReview: boolean;
    reasons: string[];
    recommendations: string[];
  };
  status: 'Active' | 'Reversed' | 'Disputed' | 'Under Review';
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface ConsolidationReport {
  id: string;
  reportNumber: string;
  title: string;
  type: 'Annual' | 'Quarterly' | 'Monthly' | 'Interim' | 'Special Purpose';
  period: {
    startDate: string;
    endDate: string;
    year: number;
    quarter?: number;
    month?: number;
  };
  entities: string[];
  parentEntity: string;
  reportDate: string;
  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  currency: string;
  exchangeRatePolicy: string;
  status: 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived';
  sections: Array<{
    id: string;
    name: string;
    type: 'Financial Statements' | 'Management Discussion' | 'Notes' | 'Schedules' | 'Supplementary';
    content: string;
    pages: number;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Reviewed';
  }>;
  financialStatements: {
    consolidatedBalanceSheet: any;
    consolidatedIncomeStatement: any;
    consolidatedCashFlowStatement: any;
    consolidatedStatementOfEquity: any;
    statementOfComprehensiveIncome: any;
  };
  disclosures: Array<{
    id: string;
    name: string;
    category: 'Significant Accounting Policies' | 'Related Party Disclosures' | 'Segment Information' | 'Fair Value' | 'Commitments' | 'Contingencies' | 'Subsequent Events';
    content: string;
    references: string[];
    status: 'Draft' | 'Review' | 'Approved';
  }>;
  managementCommentary: {
    overview: string;
    financialPerformance: string;
    liquidity: string;
    capitalResources: string;
    risks: string;
    outlook: string;
  };
  auditor: {
    name: string;
    opinion: 'Unqualified' | 'Qualified' | 'Adverse' | 'Disclaimer';
    emphasisOfMatter: string[];
    keyAuditMatters: string[];
    reportDate: string;
  };
  compliance: {
    frameworks: string[];
    regulatoryRequirements: string[];
    exceptions: string[];
    certifications: string[];
  };
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
  distributionList: Array<{
    userId: string;
    userName: string;
    email: string;
    accessLevel: 'Read' | 'Comment' | 'Edit' | 'Full';
    notified: boolean;
  }>;
  aiInsights: {
    completenessScore: number;
    consistencyScore: number;
    accuracyScore: number;
    complianceScore: number;
    recommendations: string[];
    anomalies: string[];
    benchmarking: {
      industry: string;
      metrics: Record<string, number>;
      peerComparison: string;
    };
  };
  workflow: {
    stages: Array<{
      id: string;
      name: string;
      status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
      assignedTo: string;
      startedAt?: string;
      completedAt?: string;
      dueDate: string;
    }>;
    currentStage: string;
  };
  createdAt: string;
  updatedAt: string;
}

const MultiEntityConsolidation: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for different data types
  const [entities, setEntities] = useState<Entity[]>([]);
  const [consolidationRules, setConsolidationRules] = useState<ConsolidationRule[]>([]);
  const [workbooks, setWorkbooks] = useState<ConsolidationWorkbook[]>([]);
  const [transactions, setTransactions] = useState<IntercompanyTransaction[]>([]);
  const [reports, setReports] = useState<ConsolidationReport[]>([]);

  // Modal states
  const [showEntityModal, setShowEntityModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showWorkbookModal, setShowWorkbookModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Edit states
  const [editingEntity, setEditingEntity] = useState<Entity | null>(null);
  const [editingRule, setEditingRule] = useState<ConsolidationRule | null>(null);
  const [editingWorkbook, setEditingWorkbook] = useState<ConsolidationWorkbook | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<IntercompanyTransaction | null>(null);
  const [editingReport, setEditingReport] = useState<ConsolidationReport | null>(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [industryFilter, setIndustryFilter] = useState<string>('');
  const [ownershipFilter, setOwnershipFilter] = useState<string>('');
  const [periodFilter, setPeriodFilter] = useState<string>('');

  // Statistics
  const [stats, setStats] = useState({
    totalEntities: 0,
    activeEntities: 0,
    totalRevenue: 0,
    totalAssets: 0,
    consolidationRate: 0,
    intercompanyTransactions: 0,
    pendingApprovals: 0,
    complianceScore: 0,
    entityTypes: [] as { type: string; count: number; revenue: number }[],
    geographicDistribution: [] as { country: string; entities: number; revenue: number }[],
    ownershipStructure: [] as { level: string; entities: number; percentage: number }[],
    performanceMetrics: {
      consolidationTime: 0,
      dataAccuracy: 0,
      reportAccuracy: 0,
      automationLevel: 0
    },
    riskAnalysis: {
      financial: number;
      operational: number;
      regulatory: number;
      overall: number;
    },
    aiMetrics: {
      dataQuality: 0;
      anomalyDetection: 0;
      predictionAccuracy: 0;
      optimizationSuggestions: 0;
    }
  });

  // Initialize data
  useEffect(() => {
    initializeData();
    loadStatistics();
  }, []);

  const initializeData = () => {
    // Mock entities data
    const mockEntities: Entity[] = [
      {
        id: '1',
        entityCode: 'HQ',
        name: 'TechCorp Holdings Ltd.',
        legalName: 'TechCorp Holdings Limited',
        type: 'Parent',
        status: 'Active',
        industry: 'Technology',
        country: 'United States',
        jurisdiction: 'Delaware',
        registrationNumber: 'DEL-123456',
        taxNumber: '98-7654321',
        incorporationDate: '2010-01-15',
        financialYearEnd: '12-31',
        reportingCurrency: 'USD',
        functionalCurrency: 'USD',
        ownershipPercentage: 100,
        address: {
          line1: '123 Technology Boulevard',
          city: 'San Francisco',
          state: 'California',
          postalCode: '94105',
          country: 'United States'
        },
        contactInfo: {
          phone: '+1-415-555-0123',
          email: 'info@techcorp.com',
          website: 'https://techcorp.com'
        },
        management: {
          ceo: 'John Smith',
          cfo: 'Sarah Johnson',
          boardOfDirectors: ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Lisa Davis'],
          keyManagement: [
            {
              name: 'David Wilson',
              position: 'CTO',
              email: 'david.wilson@techcorp.com',
              phone: '+1-415-555-0124'
            }
          ]
        },
        financials: {
          totalAssets: 500000000,
          totalLiabilities: 200000000,
          equity: 300000000,
          revenue: 150000000,
          netIncome: 25000000,
          cashFlow: 30000000,
          lastAuditDate: '2024-03-31',
          auditor: 'Big 4 Accounting Firm',
          auditStatus: 'Clean'
        },
        compliance: {
          regulatoryStatus: 'Compliant',
          lastComplianceCheck: '2024-11-01',
          complianceIssues: 0,
          riskRating: 'Low'
        },
        relationships: [],
        documents: [],
        tags: ['Public', 'Technology', 'Listed'],
        notes: 'Main holding company for the group',
        aiInsights: {
          riskScore: 15,
          financialHealth: 'Excellent',
          growthPotential: 'High',
          recommendedActions: ['Expand international presence', 'Increase R&D investment'],
          benchmarking: {
            industry: 'Technology',
            performance: 'Above Average',
            rank: 85
          }
        },
        createdAt: '2010-01-15T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z'
      },
      {
        id: '2',
        entityCode: 'SUB01',
        name: 'TechCorp Europe B.V.',
        legalName: 'TechCorp Europe B.V.',
        type: 'Subsidiary',
        status: 'Active',
        industry: 'Technology',
        country: 'Netherlands',
        jurisdiction: 'Dutch',
        registrationNumber: 'NL-789012',
        taxNumber: 'NL123456789B01',
        incorporationDate: '2015-06-20',
        financialYearEnd: '12-31',
        reportingCurrency: 'EUR',
        functionalCurrency: 'EUR',
        ownershipPercentage: 100,
        parentEntityId: '1',
        ultimateParentId: '1',
        address: {
          line1: '456 Innovation Street',
          city: 'Amsterdam',
          postalCode: '1012 AB',
          country: 'Netherlands'
        },
        contactInfo: {
          phone: '+31-20-555-0123',
          email: 'info.europe@techcorp.com',
          website: 'https://techcorp.eu'
        },
        management: {
          ceo: 'Maria van der Berg',
          cfo: 'Hans Mueller',
          boardOfDirectors: ['Maria van der Berg', 'Hans Mueller', 'John Smith'],
          keyManagement: []
        },
        financials: {
          totalAssets: 80000000,
          totalLiabilities: 40000000,
          equity: 40000000,
          revenue: 45000000,
          netIncome: 6000000,
          cashFlow: 8000000,
          lastAuditDate: '2024-03-31',
          auditor: 'European Audit Firm',
          auditStatus: 'Clean'
        },
        compliance: {
          regulatoryStatus: 'Compliant',
          lastComplianceCheck: '2024-10-15',
          complianceIssues: 0,
          riskRating: 'Low'
        },
        relationships: [],
        documents: [],
        tags: ['European', 'Technology', 'R&D'],
        notes: 'European subsidiary focused on R&D',
        aiInsights: {
          riskScore: 20,
          financialHealth: 'Good',
          growthPotential: 'Medium',
          recommendedActions: ['Optimize cost structure', 'Increase market share'],
          benchmarking: {
            industry: 'Technology',
            performance: 'Average',
            rank: 72
          }
        },
        createdAt: '2015-06-20T00:00:00Z',
        updatedAt: '2024-12-01T00:00:00Z'
      }
    ];

    // Mock consolidation rules data
    const mockRules: ConsolidationRule[] = [
      {
        id: '1',
        name: 'Full Consolidation Rule',
        description: 'Standard full consolidation for wholly-owned subsidiaries',
        scope: 'Full',
        consolidationType: 'Line-by-Line',
        ruleType: 'Ownership',
        conditions: [
          {
            field: 'ownershipPercentage',
            operator: 'greater_than',
            value: 50,
            logicalOperator: 'AND'
          },
          {
            field: 'status',
            operator: 'equals',
            value: 'Active'
          }
        ],
        calculationMethod: 'Direct',
        eliminationEntries: [
          {
            account: 'Investment in Subsidiary',
            description: 'Eliminate investment balance',
            calculation: 'Subsidiary Equity',
            impact: 'Asset'
          },
          {
            account: 'Minority Interest',
            description: 'Recognize minority interest',
            calculation: 'Subsidiary Equity * Minority %',
            impact: 'Equity'
          }
        ],
        currencyHandling: 'Convert All',
        fxRates: {
          spot: 1.1,
          average: 1.08,
          closing: 1.12,
          historical: 1.09
        },
        intercompanyElimination: {
          enabled: true,
          method: 'Simple',
          accounts: ['Accounts Receivable', 'Accounts Payable', 'Sales', 'Cost of Goods Sold'],
          autoDetect: true
        },
        minorityInterest: {
          calculate: true,
          method: 'Ownership %',
          presentation: 'Equity'
        },
        businessCombination: {
          method: 'Purchase',
          goodwillCalculation: 'Impairment Only',
          fairValueAdjustment: true
        },
        reportingRequirements: {
          ifrs: true,
          usGaap: false,
          localGaap: true,
          custom: []
        },
        automation: {
          autoRun: true,
          schedule: 'Monthly',
          validation: true,
          alerts: true
        },
        status: 'Active',
        createdBy: 'admin@techcorp.com',
        effectiveDate: '2024-01-01',
        performance: {
          executionTime: 300,
          recordsProcessed: 15000,
          errors: 0,
          warnings: 2
        }
      }
    ];

    setEntities(mockEntities);
    setConsolidationRules(mockRules);
    setWorkbooks([]);
    setTransactions([]);
    setReports([]);
  };

  const loadStatistics = () => {
    const totalEntities = entities.length;
    const activeEntities = entities.filter(entity => entity.status === 'Active').length;
    const totalRevenue = entities.reduce((sum, entity) => sum + entity.financials.revenue, 0);
    const totalAssets = entities.reduce((sum, entity) => sum + entity.financials.totalAssets, 0);

    const entityTypes = [
      { type: 'Parent', count: 1, revenue: 150000000 },
      { type: 'Subsidiary', count: 1, revenue: 45000000 },
      { type: 'Associate', count: 0, revenue: 0 },
      { type: 'Joint Venture', count: 0, revenue: 0 }
    ];

    const geographicDistribution = [
      { country: 'United States', entities: 1, revenue: 150000000 },
      { country: 'Netherlands', entities: 1, revenue: 45000000 },
      { country: 'Germany', entities: 0, revenue: 0 }
    ];

    setStats({
      totalEntities,
      activeEntities,
      totalRevenue,
      totalAssets,
      consolidationRate: 95.5,
      intercompanyTransactions: 245,
      pendingApprovals: 12,
      complianceScore: 98.2,
      entityTypes,
      geographicDistribution,
      ownershipStructure: [
        { level: 'Parent', entities: 1, percentage: 100 },
        { level: 'First Tier', entities: 1, percentage: 100 },
        { level: 'Second Tier', entities: 0, percentage: 0 }
      ],
      performanceMetrics: {
        consolidationTime: 2.5,
        dataAccuracy: 99.1,
        reportAccuracy: 98.7,
        automationLevel: 85.2
      },
      riskAnalysis: {
        financial: 15,
        operational: 22,
        regulatory: 8,
        overall: 18
      },
      aiMetrics: {
        dataQuality: 96.5,
        anomalyDetection: 92.3,
        predictionAccuracy: 89.7,
        optimizationSuggestions: 45
      }
    });
  };

  // Filter and search logic
  const filteredEntities = entities.filter(entity => {
    const matchesSearch = entity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entity.legalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         entity.entityCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || entity.type === typeFilter;
    const matchesStatus = !statusFilter || entity.status === statusFilter;
    const matchesCountry = !countryFilter || entity.country === countryFilter;
    const matchesIndustry = !industryFilter || entity.industry === industryFilter;
    const matchesOwnership = !ownershipFilter || 
                            (ownershipFilter === '100' && entity.ownershipPercentage === 100) ||
                            (ownershipFilter === '50-99' && entity.ownershipPercentage >= 50 && entity.ownershipPercentage < 100) ||
                            (ownershipFilter === 'below-50' && entity.ownershipPercentage < 50);

    return matchesSearch && matchesType && matchesStatus && matchesCountry && 
           matchesIndustry && matchesOwnership;
  });

  const sortedEntities = [...filteredEntities].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      case 'country':
        aValue = a.country;
        bValue = b.country;
        break;
      case 'financials.revenue':
        aValue = a.financials.revenue;
        bValue = b.financials.revenue;
        break;
      case 'ownershipPercentage':
        aValue = a.ownershipPercentage;
        bValue = b.ownershipPercentage;
        break;
      default:
        aValue = a.name;
        bValue = b.name;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedEntities.length / itemsPerPage);
  const paginatedEntities = sortedEntities.slice(
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
    if (selectedItems.length === paginatedEntities.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedEntities.map(entity => entity.id));
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
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Under Liquidation': return 'bg-yellow-100 text-yellow-800';
      case 'Dissolved': return 'bg-red-100 text-red-800';
      case 'Dormant': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Parent': return 'bg-blue-100 text-blue-800';
      case 'Subsidiary': return 'bg-green-100 text-green-800';
      case 'Associate': return 'bg-purple-100 text-purple-800';
      case 'Joint Venture': return 'bg-orange-100 text-orange-800';
      case 'Branch': return 'bg-yellow-100 text-yellow-800';
      case 'Division': return 'bg-gray-100 text-gray-800';
      case 'Unit': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (rating: string) => {
    switch (rating) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BuildingOfficeIcon className="h-8 w-8 text-purple-600" />
              Multi-Entity Consolidation
            </h1>
            <p className="text-gray-600 mt-1">Manage organizational structures and financial consolidation</p>
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
              onClick={() => setShowWorkbookModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Workbooks
            </button>
            <button
              onClick={() => setShowTransactionModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ShareIcon className="h-4 w-4 mr-2" />
              Transactions
            </button>
            <button
              onClick={() => setShowEntityModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Entity
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
            { id: 'entities', name: 'Entities', icon: BuildingOfficeIcon },
            { id: 'consolidation-rules', name: 'Rules', icon: CogIcon },
            { id: 'workbooks', name: 'Workbooks', icon: DocumentTextIcon },
            { id: 'transactions', name: 'Intercompany', icon: ShareIcon },
            { id: 'reports', name: 'Reports', icon: ChartPieIcon },
            { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
            { id: 'settings', name: 'Settings', icon: CogIcon }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-600'
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
              <p className="text-sm font-medium text-gray-600">Total Entities</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEntities}</p>
              <p className="text-sm text-purple-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +2 this quarter
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalRevenue / 1000000).toFixed(0)}M</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +15.2% YoY
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Consolidation Rate</p>
              <p className="text-2xl font-bold text-purple-600">{stats.consolidationRate}%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +2.1% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ChartBarIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Compliance Score</p>
              <p className="text-2xl font-bold text-green-600">{stats.complianceScore}%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Excellent
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entity Types Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Entity Types Distribution</h3>
          <div className="space-y-3">
            {stats.entityTypes.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{type.type}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{ width: `${(type.count / 2) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {type.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {stats.geographicDistribution.map((geo, index) => (
              <div key={geo.country} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{geo.country}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 w-12 text-right">{geo.entities}</span>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    ${(geo.revenue / 1000000).toFixed(0)}M
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ownership Structure */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ownership Structure</h3>
          <div className="space-y-3">
            {stats.ownershipStructure.map((level, index) => (
              <div key={level.level} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{level.level}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${level.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {level.entities}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Consolidation Time</p>
              <p className="text-sm font-medium text-gray-900">{stats.performanceMetrics.consolidationTime} hrs</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Data Accuracy</p>
              <p className="text-sm font-medium text-gray-900">{stats.performanceMetrics.dataAccuracy}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Report Accuracy</p>
              <p className="text-sm font-medium text-gray-900">{stats.performanceMetrics.reportAccuracy}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Automation</p>
              <p className="text-sm font-medium text-gray-900">{stats.performanceMetrics.automationLevel}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Financial Risk</span>
              <span className="text-sm font-medium text-gray-900">{stats.riskAnalysis.financial}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Operational Risk</span>
              <span className="text-sm font-medium text-gray-900">{stats.riskAnalysis.operational}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Regulatory Risk</span>
              <span className="text-sm font-medium text-gray-900">{stats.riskAnalysis.regulatory}%</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">Overall Risk</span>
              <span className="text-sm font-medium text-purple-600">{stats.riskAnalysis.overall}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Data Quality</span>
              <span className="text-sm font-medium text-green-600">{stats.aiMetrics.dataQuality}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Anomaly Detection</span>
              <span className="text-sm font-medium text-blue-600">{stats.aiMetrics.anomalyDetection}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prediction Accuracy</span>
              <span className="text-sm font-medium text-purple-600">{stats.aiMetrics.predictionAccuracy}%</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">Suggestions</span>
              <span className="text-sm font-medium text-gray-900">{stats.aiMetrics.optimizationSuggestions}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEntities = () => (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                className={`p-2 ${viewMode === 'list' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600' : 'text-gray-400 hover:text-gray-600'}`}
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
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Parent">Parent</option>
                  <option value="Subsidiary">Subsidiary</option>
                  <option value="Associate">Associate</option>
                  <option value="Joint Venture">Joint Venture</option>
                  <option value="Branch">Branch</option>
                  <option value="Division">Division</option>
                  <option value="Unit">Unit</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Under Liquidation">Under Liquidation</option>
                  <option value="Dissolved">Dissolved</option>
                  <option value="Dormant">Dormant</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Countries</option>
                  <option value="United States">United States</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="Germany">Germany</option>
                  <option value="United Kingdom">United Kingdom</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ownership</label>
                <select
                  value={ownershipFilter}
                  onChange={(e) => setOwnershipFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Ownership</option>
                  <option value="100">100%</option>
                  <option value="50-99">50-99%</option>
                  <option value="below-50">Below 50%</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedEntities.map((entity) => (
          <div key={entity.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{entity.name}</h3>
                <p className="text-sm text-gray-500">{entity.legalName}</p>
                <p className="text-xs text-gray-400">{entity.entityCode}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(entity.type)}`}>
                {entity.type}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="h-4 w-4 mr-2" />
                {entity.country}, {entity.jurisdiction}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                {entity.industry}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                {entity.reportingCurrency}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Revenue</p>
                <p className="text-sm font-medium text-gray-900">
                  ${(entity.financials.revenue / 1000000).toFixed(1)}M
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ownership</p>
                <p className="text-sm font-medium text-gray-900">{entity.ownershipPercentage}%</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(entity.status)}`}>
                {entity.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingEntity(entity);
                    setShowEntityModal(true);
                  }}
                  className="text-purple-600 hover:text-purple-900"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingEntity(entity);
                    setShowEntityModal(true);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6 mt-6">
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
                  {Math.min(currentPage * itemsPerPage, sortedEntities.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{sortedEntities.length}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
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
                          ? 'z-10 bg-purple-50 border-purple-500 text-purple-600'
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
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'entities':
        return renderEntities();
      case 'consolidation-rules':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Consolidation Rules</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Consolidation Rules Management</h3>
              <p className="text-gray-600">Define and manage consolidation rules for different entity types and scenarios.</p>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Create Rule
              </button>
            </div>
          </div>
        );
      case 'workbooks':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Consolidation Workbooks</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Workbook Management</h3>
              <p className="text-gray-600">Create and manage consolidation workbooks with automated calculations.</p>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Create Workbook
              </button>
            </div>
          </div>
        );
      case 'transactions':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Intercompany Transactions</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <ShareIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Intercompany Management</h3>
              <p className="text-gray-600">Track and manage intercompany transactions with transfer pricing compliance.</p>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                New Transaction
              </button>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Consolidation Reports</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <ChartPieIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Consolidated Reporting</h3>
              <p className="text-gray-600">Generate consolidated financial statements and management reports.</p>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Generate Report
              </button>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <ChartPieIcon className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Consolidation Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Comprehensive consolidation performance analysis.</p>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <BuildingOfficeIcon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Entity Performance</h3>
                <p className="text-gray-600 text-sm mb-4">Individual entity performance tracking and analysis.</p>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <ShareIcon className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Transaction Analysis</h3>
                <p className="text-gray-600 text-sm mb-4">Intercompany transaction analysis and optimization.</p>
                <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                  View Analytics →
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Consolidation Settings</h3>
              <p className="text-gray-600">Configure consolidation parameters, currencies, and automation settings.</p>
              <button className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
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

      {/* Entity Modal */}
      {showEntityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingEntity ? 'Edit Entity' : 'Create New Entity'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Entity creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowEntityModal(false);
                    setEditingEntity(null);
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

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRule ? 'Edit Consolidation Rule' : 'Create New Consolidation Rule'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <CogIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Consolidation rule creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowRuleModal(false);
                    setEditingRule(null);
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
                <p className="text-gray-600">Advanced consolidation analytics dashboard would be implemented here</p>
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

export default MultiEntityConsolidation;