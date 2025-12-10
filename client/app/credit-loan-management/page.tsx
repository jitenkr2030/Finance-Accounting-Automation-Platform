'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCardIcon,
  BanknotesIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
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
  StarIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  CogIcon,
  ChartPieIcon,
  PresentationChartBarIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  HomeIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
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
  ShieldCheckIcon,
  LockClosedIcon,
  UserPlusIcon,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  FingerPrintIcon,
  EyeSlashIcon,
  LockOpenIcon,
  KeySquareIcon,
  UserLockIcon,
  ShieldExclamationIcon,
  ClockIcon as ClockIconOutline,
  CheckBadgeIcon,
  ExclamationTriangleIcon as ExclamationTriangleIconOutline,
  InformationCircleIcon,
  ArchiveBoxIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  SpeakerXMarkIcon,
  DocumentTextIcon as DocumentTextIconFinal,
  BanknotesIcon as BanknotesIconFinal,
  CurrencyDollarIcon as CurrencyDollarIconFinal,
  ChartBarIcon as ChartBarIconFinal,
  CurrencyDollarIconOutline as CurrencyDollarIconOutlineFinal,
  DocumentTextIconFinal as DocumentTextIconFinal,
  UserGroupIcon as UserGroupIconFinal,
} from '@heroicons/react/24/outline';

interface LoanApplication {
  id: string;
  applicationNumber: string;
  borrowerName: string;
  borrowerType: 'Individual' | 'Business' | 'Corporate' | 'SME' | 'Government' | 'Non-Profit';
  loanType: 'Personal' | 'Home' | 'Auto' | 'Business' | 'Commercial' | 'Agricultural' | 'Education' | 'Medical' | 'Working Capital' | 'Equipment' | 'Real Estate' | 'Bridge' | 'Construction' | 'Revolving Credit' | 'Term Loan' | 'Line of Credit' | 'Overdraft';
  purpose: string;
  requestedAmount: number;
  currency: string;
  status: 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected' | 'Cancelled' | 'Disbursed' | 'Declined';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  riskCategory: 'Prime' | 'Near Prime' | 'Subprime' | 'High Risk';
  
  // Borrower information
  borrowerDetails: {
    personalInfo: {
      name: string;
      dateOfBirth: string;
      gender: 'Male' | 'Female' | 'Other';
      nationality: string;
      residence: string;
      maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
      dependents: number;
    };
    contactInfo: {
      email: string;
      phone: string;
      alternatePhone?: string;
      address: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        yearsAtAddress: number;
      };
      employment: {
        employer: string;
        position: string;
        yearsOfService: number;
        monthlyIncome: number;
        employmentType: 'Salaried' | 'Self-Employed' | 'Business Owner' | 'Retired' | 'Unemployed';
      };
    };
    financialInfo: {
      monthlyIncome: number;
      monthlyExpenses: number;
      existingLiabilities: number;
      assets: Array<{
        type: 'Real Estate' | 'Vehicle' | 'Investments' | 'Savings' | 'Other';
        description: string;
        value: number;
        ownership: number;
      }>;
      creditScore: number;
      creditHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'No History';
      bankruptcyHistory: boolean;
      foreclosureHistory: boolean;
    };
  };

  // Loan details
  loanDetails: {
    requestedAmount: number;
    purpose: string;
    term: number; // in months
    repaymentFrequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Bullet';
    interestRate: number;
    interestType: 'Fixed' | 'Variable' | 'Floating' | 'Hybrid';
    collateralRequired: boolean;
    collateral: Array<{
      type: 'Real Estate' | 'Vehicle' | 'Inventory' | 'Equipment' | 'Securities' | 'Other';
      description: string;
      value: number;
      lienPosition: number;
      ownership: string;
    }>;
    guarantor: {
      required: boolean;
      details?: {
        name: string;
        relationship: string;
        financialInfo: any;
        consent: boolean;
      };
    };
  };

  // Assessment and scoring
  assessment: {
    creditScore: number;
    riskScore: number;
    debtToIncomeRatio: number;
    loanToValueRatio: number;
    capacityScore: number;
    characterScore: number;
    capitalScore: number;
    collateralScore: number;
    conditionsScore: number;
    overallScore: number;
    recommendation: 'Approve' | 'Approve with Conditions' | 'Decline' | 'Require Additional Information';
    rationale: string;
    redFlags: string[];
    positiveFactors: string[];
  };

  // Documentation
  documents: Array<{
    id: string;
    name: string;
    type: 'Identity' | 'Income Proof' | 'Bank Statement' | 'Asset Proof' | 'Collateral Document' | 'Business Document' | 'Credit Report' | 'Other';
    url: string;
    uploadedAt: string;
    status: 'Pending' | 'Received' | 'Verified' | 'Rejected';
    verifiedBy?: string;
    verifiedAt?: string;
  }>;

  // Workflow and approvals
  workflow: {
    stages: Array<{
      id: string;
      name: string;
      status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped' | 'Rejected';
      assignedTo: string;
      startedAt?: string;
      completedAt?: string;
      dueDate: string;
      comments?: string;
      documentsRequired: string[];
    }>;
    currentStage: string;
    progress: number;
  };

  // Approval details
  approval: {
    finalAmount: number;
    approvedRate: number;
    approvedTerm: number;
    conditions: string[];
    approvedBy: string;
    approvedAt: string;
    expiryDate: string;
    reservation: {
      reserved: boolean;
      reservedAt?: string;
      reservedBy?: string;
      expiryDate?: string;
    };
  };

  // AI insights
  aiInsights: {
    approvalProbability: number;
    riskFactors: string[];
    recommendedRate: number;
    recommendedTerm: number;
    marketComparison: string;
    defaultProbability: number;
    earlyWarningIndicators: string[];
    optimizationSuggestions: string[];
  };

  // Metadata
  submittedBy: string;
  submittedAt: string;
  lastModified: string;
  expectedDecision: string;
  notes: string;
  tags: string[];
}

interface Loan {
  id: string;
  loanNumber: string;
  borrowerName: string;
  borrowerId: string;
  applicationId?: string;
  loanType: string;
  status: 'Active' | 'Fully Paid' | 'Partially Paid' | 'Delinquent' | 'Non-Performing' | 'Restructured' | 'Charged Off' | 'Settled' | 'Foreclosed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  riskCategory: 'Prime' | 'Near Prime' | 'Subprime' | 'High Risk';
  
  // Basic loan details
  details: {
    principal: number;
    interestRate: number;
    term: number; // in months
    startDate: string;
    maturityDate: string;
    purpose: string;
    currency: string;
    branch: string;
    officer: string;
  };

  // Repayment structure
  repayment: {
    frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Bullet';
    nextPaymentDate: string;
    nextPaymentAmount: number;
    remainingPayments: number;
    totalPayments: number;
    amortizationType: 'Equal Installments' | 'Interest Only' | 'Bullet' | 'Balloon' | 'Grace Period';
    gracePeriod?: number;
    moratorium?: {
      principal: number;
      interest: number;
      startDate: string;
      endDate: string;
    };
  };

  // Current status
  status: {
    outstandingPrincipal: number;
    outstandingInterest: number;
    totalOutstanding: number;
    paidToDate: number;
    remainingPrincipal: number;
    remainingInterest: number;
    daysPastDue: number;
    lastPaymentDate?: string;
    lastPaymentAmount?: number;
  };

  // Collateral and security
  collateral: Array<{
    type: 'Real Estate' | 'Vehicle' | 'Inventory' | 'Equipment' | 'Securities' | 'Cash' | 'Other';
    description: string;
    value: number;
    lienPosition: number;
    ownership: string;
    verification: {
      verified: boolean;
      verifiedBy?: string;
      verifiedAt?: string;
      method: string;
    };
  }>;

  // Guarantees
  guarantees: Array<{
    guarantor: string;
    type: 'Personal' | 'Corporate' | 'Bank' | 'Government' | 'Insurance';
    amount: number;
    percentage: number;
    status: 'Active' | 'Invoked' | 'Released' | 'Expired';
    documents: string[];
  }>;

  // Payment schedule
  payments: Array<{
    id: string;
    dueDate: string;
    installmentNumber: number;
    principalAmount: number;
    interestAmount: number;
    totalAmount: number;
    paidAmount: number;
    paidDate?: string;
    status: 'Scheduled' | 'Paid' | 'Partial' | 'Overdue' | 'Waived' | 'Rescheduled';
    penalty: number;
    notes: string;
  }>;

  // Collections and delinquency
  collections: {
    status: 'Current' | '1-30 DPD' | '31-60 DPD' | '61-90 DPD' | '91-120 DPD' | '120+ DPD';
    bucket: 'Standard' | 'Substandard' | 'Doubtful' | 'Loss';
    provisionRequired: number;
    provisionRate: number;
    writtenOffAmount: number;
    recoveryAmount: number;
    legalStatus: 'No Action' | 'Notice Sent' | 'Legal Notice' | 'Court Case' | 'Settlement' | 'Recovery';
  };

  // Performance metrics
  performance: {
    delinquencyRate: number;
    prepaymentRate: number;
    defaultRate: number;
    recoveryRate: number;
    yield: number;
    riskWeightedAssets: number;
    expectedLoss: number;
    unexpectedLoss: number;
  };

  // Insurance and protection
  insurance: Array<{
    type: 'Life' | 'Disability' | 'Property' | 'Credit' | 'Other';
    provider: string;
    coverage: number;
    premium: number;
    startDate: string;
    endDate: string;
    status: 'Active' | 'Lapsed' | 'Claimed' | 'Cancelled';
  }>;

  // Restructuring history
  restructuring: Array<{
    id: string;
    date: string;
    type: 'Rate Reduction' | 'Term Extension' | 'Principal Reduction' | 'Payment Holiday' | 'Combination';
    description: string;
    approvedBy: string;
    impact: {
      principalAdjustment: number;
      rateAdjustment: number;
      termAdjustment: number;
    };
  }>;

  // AI insights
  aiInsights: {
    defaultProbability: number;
    prepaymentProbability: number;
    recoveryProbability: number;
    optimalStrategy: string;
    riskFactors: string[];
    earlyWarningSignals: string[];
    recommendedActions: string[];
    marketComparison: string;
  };

  // Compliance and audit
  compliance: {
    regulatory: string;
    reportingRequirements: string[];
    auditTrail: Array<{
      id: string;
      action: string;
      performedBy: string;
      timestamp: string;
      details: string;
    }>;
    lastReview: string;
    nextReview: string;
  };

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CreditFacility {
  id: string;
  facilityNumber: string;
  borrowerName: string;
  borrowerId: string;
  type: 'Revolving Credit' | 'Line of Credit' | 'Overdraft' | 'Letter of Credit' | 'Bank Guarantee' | 'Working Capital' | 'Trade Finance' | 'Syndicated Loan' | 'Club Deal';
  status: 'Active' | 'Suspended' | 'Cancelled' | 'Expired' | 'Fully Utilized' | 'Partially Utilized';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Facility details
  details: {
    limit: number;
    currency: string;
    purpose: string;
    startDate: string;
    expiryDate: string;
    renewalDate?: string;
    interestRate: number;
    interestType: 'Fixed' | 'Variable' | 'Floating' | 'Benchmark Plus';
    spread: number;
    benchmark: string;
    commitmentFee: number;
    utilizationFee: number;
  };

  // Utilization
  utilization: {
    currentUtilization: number;
    availableLimit: number;
    reservedAmount: number;
    averageUtilization: number;
    peakUtilization: number;
    utilizationTrend: 'Increasing' | 'Stable' | 'Decreasing';
    lastUtilizationDate?: string;
  };

  // Security and collateral
  security: {
    secured: boolean;
    collateral: Array<{
      type: string;
      description: string;
      value: number;
      coverage: number;
      lienPosition: number;
    }>;
    guarantees: Array<{
      provider: string;
      type: string;
      amount: number;
      coverage: number;
    }>;
    securityCoverage: number;
  };

  // Covenants
  covenants: Array<{
    id: string;
    name: string;
    type: 'Financial' | 'Operational' | 'Reporting' | 'Negative';
    description: string;
    threshold: number;
    current: number;
    status: 'Compliant' | 'Breach' | 'Waiver Requested' | 'Waiver Granted';
    lastTested: string;
    nextTest: string;
    variance: number;
  }>;

  // Transactions
  transactions: Array<{
    id: string;
    date: string;
    type: 'Drawdown' | 'Repayment' | 'Fee' | 'Interest' | 'Charge';
    amount: number;
    balance: number;
    reference: string;
    description: string;
    approvedBy: string;
  }>;

  // Performance
  performance: {
    utilizationRate: number;
    yield: number;
    spread: number;
    riskWeight: number;
    riskAdjustedReturn: number;
    economicCapital: number;
   RAROC: number;
  };

  // AI insights
  aiInsights: {
    utilizationForecast: Array<{
      period: string;
      predictedUtilization: number;
      confidence: number;
    }>;
    riskScore: number;
    earlyWarning: string[];
    optimizationSuggestions: string[];
    renewalRecommendation: string;
  };

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CreditScore {
  id: string;
  entityId: string;
  entityName: string;
  entityType: 'Individual' | 'Business' | 'Corporate';
  scoreType: 'FICO' | 'VantageScore' | 'Internal Score' | 'Industry Score' | 'Custom Score';
  score: number;
  grade: string;
  rating: string;
  
  // Score components
  components: {
    paymentHistory: {
      weight: number;
      score: number;
      factors: string[];
    };
    creditUtilization: {
      weight: number;
      score: number;
      factors: string[];
    };
    lengthOfCreditHistory: {
      weight: number;
      score: number;
      factors: string[];
    };
    creditMix: {
      weight: number;
      score: number;
      factors: string[];
    };
    newCredit: {
      weight: number;
      score: number;
      factors: string[];
    };
    financialRatios: {
      weight: number;
      score: number;
      factors: string[];
    };
    industrySpecific: {
      weight: number;
      score: number;
      factors: string[];
    };
  };

  // Risk assessment
  riskAssessment: {
    probabilityOfDefault: number;
    lossGivenDefault: number;
    exposureAtDefault: number;
    expectedLoss: number;
    riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
    riskFactors: string[];
    mitigatingFactors: string[];
  };

  // Credit behavior
  behavior: {
    paymentConsistency: number;
    utilizationPattern: string;
    creditGrowth: number;
    delinquencyHistory: number;
    recentActivity: string;
    trend: 'Improving' | 'Stable' | 'Declining';
  };

  // Benchmarking
  benchmarking: {
    industryAverage: number;
    peerGroupAverage: number;
    percentile: number;
    ranking: string;
  };

  // Recommendations
  recommendations: Array<{
    category: 'Improvement' | 'Monitoring' | 'Action Required';
    priority: 'High' | 'Medium' | 'Low';
    description: string;
    expectedImpact: string;
    timeline: string;
  }>;

  // Historical scores
  history: Array<{
    date: string;
    score: number;
    change: number;
    reason: string;
  }>;

  dataProvider: string;
  reportDate: string;
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

interface CollectionAction {
  id: string;
  loanId: string;
  loanNumber: string;
  borrowerName: string;
  actionType: 'Phone Call' | 'Email' | 'SMS' | 'Letter' | 'Visit' | 'Legal Notice' | 'Court Action' | 'Settlement Offer' | 'Restructuring' | 'Charge Off' | 'Recovery';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled' | 'Failed';
  
  // Action details
  details: {
    scheduledDate: string;
    completedDate?: string;
    assignedTo: string;
    outcome: 'Successful' | 'Partial' | 'Unsuccessful' | 'No Response' | 'Follow-up Required';
    amountCollected?: number;
    promiseToPay?: {
      amount: number;
      date: string;
      fulfilled: boolean;
    };
    notes: string;
    nextAction?: string;
    nextActionDate?: string;
  };

  // Communication
  communication: {
    method: 'Phone' | 'Email' | 'SMS' | 'In-Person' | 'Letter' | 'Legal';
    participants: string[];
    duration?: number;
    recording?: boolean;
    transcript?: string;
    attachments: string[];
  };

  // Results and follow-up
  results: {
    amountRecovered: number;
    paymentPlan: boolean;
    settlementOffer: boolean;
    legalAction: boolean;
    accountStatus: 'Current' | 'Delinquent' | 'Restructured' | 'Charged Off';
    nextSteps: string[];
    escalationRequired: boolean;
  };

  // Performance tracking
  performance: {
    successRate: number;
    averageRecoveryTime: number;
    costPerRecovery: number;
    borrowerSatisfaction: number;
  };

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

const CreditLoanManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('borrowerName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for different data types
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [creditFacilities, setCreditFacilities] = useState<CreditFacility[]>([]);
  const [creditScores, setCreditScores] = useState<CreditScore[]>([]);
  const [collectionActions, setCollectionActions] = useState<CollectionAction[]>([]);

  // Modal states
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Edit states
  const [editingApplication, setEditingApplication] = useState<LoanApplication | null>(null);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);
  const [editingFacility, setEditingFacility] = useState<CreditFacility | null>(null);
  const [editingScore, setEditingScore] = useState<CreditScore | null>(null);
  const [editingCollection, setEditingCollection] = useState<CollectionAction | null>(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [amountRange, setAmountRange] = useState({ min: '', max: '' });
  const [borrowerTypeFilter, setBorrowerTypeFilter] = useState<string>('');
  const [daysPastDueFilter, setDaysPastDueFilter] = useState<string>('');

  // Statistics
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    totalLoans: 0,
    activeLoans: 0,
    totalDisbursed: 0,
    outstandingAmount: 0,
    collectionRate: 0,
    nplRatio: 0,
    applicationMetrics: {
      approvalRate: 0,
      averageProcessingTime: 0,
      rejectionRate: 0,
      conversionRate: 0
    },
    loanMetrics: {
      delinquencyRate: 0,
      defaultRate: 0,
      recoveryRate: 0,
      averageLoanSize: 0
    },
    portfolioAnalysis: {
      byProduct: [] as { product: string; amount: number; count: number }[],
      byRisk: [] as { risk: string; amount: number; percentage: number }[],
      byBorrower: [] as { type: string; amount: number; count: number }[],
      byBranch: [] as { branch: string; amount: number; count: number }[]
    },
    performanceMetrics: {
      yield: 0,
      costOfRisk: 0,
      netInterestMargin: 0,
      returnOnAssets: 0,
      returnOnEquity: 0
    },
    aiMetrics: {
      predictionAccuracy: 0,
      riskDetection: 0,
      automationLevel: 0,
      optimizationScore: 0
    }
  });

  // Initialize data
  useEffect(() => {
    initializeData();
    loadStatistics();
  }, []);

  const initializeData = () => {
    // Mock loan applications data
    const mockApplications: LoanApplication[] = [
      {
        id: '1',
        applicationNumber: 'APP-2024-001',
        borrowerName: 'John Smith',
        borrowerType: 'Individual',
        loanType: 'Personal',
        purpose: 'Home renovation',
        requestedAmount: 50000,
        currency: 'USD',
        status: 'Under Review',
        priority: 'Medium',
        riskCategory: 'Prime',
        borrowerDetails: {
          personalInfo: {
            name: 'John Smith',
            dateOfBirth: '1985-05-15',
            gender: 'Male',
            nationality: 'American',
            residence: 'California',
            maritalStatus: 'Married',
            dependents: 2
          },
          contactInfo: {
            email: 'john.smith@email.com',
            phone: '+1-555-0123',
            address: {
              line1: '123 Main Street',
              city: 'San Francisco',
              state: 'California',
              postalCode: '94102',
              country: 'USA',
              yearsAtAddress: 5
            },
            employment: {
              employer: 'Tech Corp Inc.',
              position: 'Software Engineer',
              yearsOfService: 7,
              monthlyIncome: 8000,
              employmentType: 'Salaried'
            }
          },
          financialInfo: {
            monthlyIncome: 8000,
            monthlyExpenses: 5000,
            existingLiabilities: 1200,
            assets: [
              {
                type: 'Real Estate',
                description: 'Primary Residence',
                value: 400000,
                ownership: 100
              },
              {
                type: 'Vehicle',
                description: '2020 Honda Civic',
                value: 25000,
                ownership: 100
              }
            ],
            creditScore: 750,
            creditHistory: 'Excellent',
            bankruptcyHistory: false,
            foreclosureHistory: false
          }
        },
        loanDetails: {
          requestedAmount: 50000,
          purpose: 'Home renovation',
          term: 60,
          repaymentFrequency: 'Monthly',
          interestRate: 7.5,
          interestType: 'Fixed',
          collateralRequired: false,
          collateral: [],
          guarantor: {
            required: false
          }
        },
        assessment: {
          creditScore: 750,
          riskScore: 85,
          debtToIncomeRatio: 15,
          loanToValueRatio: 0,
          capacityScore: 90,
          characterScore: 95,
          capitalScore: 88,
          collateralScore: 75,
          conditionsScore: 85,
          overallScore: 87,
          recommendation: 'Approve',
          rationale: 'Strong credit profile with stable income and manageable debt-to-income ratio',
          redFlags: [],
          positiveFactors: ['Excellent credit score', 'Stable employment', 'Low debt-to-income ratio', 'Asset ownership']
        },
        documents: [
          {
            id: 'doc1',
            name: 'Pay Stubs',
            type: 'Income Proof',
            url: '/documents/app-001-paystubs.pdf',
            uploadedAt: '2024-11-15T10:00:00Z',
            status: 'Verified',
            verifiedBy: 'admin@bank.com',
            verifiedAt: '2024-11-16T14:00:00Z'
          },
          {
            id: 'doc2',
            name: 'Bank Statements',
            type: 'Bank Statement',
            url: '/documents/app-001-bankstatements.pdf',
            uploadedAt: '2024-11-15T10:30:00Z',
            status: 'Verified',
            verifiedBy: 'admin@bank.com',
            verifiedAt: '2024-11-16T14:00:00Z'
          }
        ],
        workflow: {
          stages: [
            {
              id: 'stage1',
              name: 'Document Verification',
              status: 'Completed',
              assignedTo: 'document.officer@bank.com',
              startedAt: '2024-11-15T09:00:00Z',
              completedAt: '2024-11-16T14:00:00Z',
              dueDate: '2024-11-16T17:00:00Z',
              comments: 'All required documents verified successfully',
              documentsRequired: ['Identity Proof', 'Income Proof', 'Bank Statements']
            },
            {
              id: 'stage2',
              name: 'Credit Assessment',
              status: 'In Progress',
              assignedTo: 'credit.officer@bank.com',
              startedAt: '2024-11-16T14:00:00Z',
              dueDate: '2024-11-18T17:00:00Z',
              comments: 'Credit assessment in progress',
              documentsRequired: ['Credit Report', 'Financial Analysis']
            },
            {
              id: 'stage3',
              name: 'Final Approval',
              status: 'Pending',
              assignedTo: 'manager@bank.com',
              dueDate: '2024-11-20T17:00:00Z',
              documentsRequired: ['Approval Recommendation']
            }
          ],
          currentStage: 'stage2',
          progress: 60
        },
        approval: {
          finalAmount: 0,
          approvedRate: 0,
          approvedTerm: 0,
          conditions: [],
          approvedBy: '',
          approvedAt: '',
          expiryDate: '',
          reservation: {
            reserved: false
          }
        },
        aiInsights: {
          approvalProbability: 85,
          riskFactors: [],
          recommendedRate: 7.25,
          recommendedTerm: 60,
          marketComparison: 'Below market rate for prime borrowers',
          defaultProbability: 2.5,
          earlyWarningIndicators: [],
          optimizationSuggestions: ['Consider automated approval for similar profiles']
        },
        submittedBy: 'john.smith@email.com',
        submittedAt: '2024-11-15T09:00:00Z',
        lastModified: '2024-11-16T14:00:00Z',
        expectedDecision: '2024-11-20',
        notes: 'Applicant has strong financial profile',
        tags: ['Prime', 'Personal Loan', 'Home Improvement']
      }
    ];

    // Mock loans data
    const mockLoans: Loan[] = [
      {
        id: '1',
        loanNumber: 'LOAN-2024-001',
        borrowerName: 'Jane Doe',
        borrowerId: 'BOR-001',
        applicationId: '1',
        loanType: 'Home Loan',
        status: 'Active',
        priority: 'Medium',
        riskCategory: 'Prime',
        details: {
          principal: 200000,
          interestRate: 6.5,
          term: 360,
          startDate: '2024-01-15',
          maturityDate: '2054-01-15',
          purpose: 'Primary Residence Purchase',
          currency: 'USD',
          branch: 'Main Branch',
          officer: 'loan.officer@bank.com'
        },
        repayment: {
          frequency: 'Monthly',
          nextPaymentDate: '2024-12-15',
          nextPaymentAmount: 1264,
          remainingPayments: 359,
          totalPayments: 360,
          amortizationType: 'Equal Installments',
          gracePeriod: 0
        },
        status: {
          outstandingPrincipal: 198500,
          outstandingInterest: 2500,
          totalOutstanding: 201000,
          paidToDate: 2500,
          remainingPrincipal: 198500,
          remainingInterest: 0,
          daysPastDue: 0,
          lastPaymentDate: '2024-11-15',
          lastPaymentAmount: 1264
        },
        collateral: [
          {
            type: 'Real Estate',
            description: '123 Oak Street, San Francisco, CA',
            value: 350000,
            lienPosition: 1,
            ownership: 'Jane Doe',
            verification: {
              verified: true,
              verifiedBy: 'appraisal@bank.com',
              verifiedAt: '2024-01-10T00:00:00Z',
              method: 'Professional Appraisal'
            }
          }
        ],
        guarantees: [],
        payments: [
          {
            id: 'pay1',
            dueDate: '2024-02-15',
            installmentNumber: 1,
            principalAmount: 217,
            interestAmount: 1083,
            totalAmount: 1300,
            paidAmount: 1300,
            paidDate: '2024-02-15T00:00:00Z',
            status: 'Paid',
            penalty: 0,
            notes: 'First payment'
          }
        ],
        collections: {
          status: 'Current',
          bucket: 'Standard',
          provisionRequired: 0,
          provisionRate: 0,
          writtenOffAmount: 0,
          recoveryAmount: 0,
          legalStatus: 'No Action'
        },
        performance: {
          delinquencyRate: 0,
          prepaymentRate: 0,
          defaultRate: 0,
          recoveryRate: 0,
          yield: 6.5,
          riskWeightedAssets: 198500,
          expectedLoss: 198.5,
          unexpectedLoss: 1191
        },
        insurance: [
          {
            type: 'Property',
            provider: 'ABC Insurance',
            coverage: 350000,
            premium: 1200,
            startDate: '2024-01-15',
            endDate: '2025-01-15',
            status: 'Active'
          }
        ],
        restructuring: [],
        aiInsights: {
          defaultProbability: 1.2,
          prepaymentProbability: 15.8,
          recoveryProbability: 95.0,
          optimalStrategy: 'Monitor for prepayment opportunities',
          riskFactors: [],
          earlyWarningSignals: [],
          recommendedActions: ['Offer refinancing at competitive rates'],
          marketComparison: 'Performing above market average'
        },
        compliance: {
          regulatory: 'Banking Regulation XYZ',
          reportingRequirements: ['Monthly Portfolio Report', 'Risk Assessment Report'],
          auditTrail: [
            {
              id: 'audit1',
              action: 'Loan Origination',
              performedBy: 'loan.officer@bank.com',
              timestamp: '2024-01-15T10:00:00Z',
              details: 'Loan approved and disbursed'
            }
          ],
          lastReview: '2024-11-01',
          nextReview: '2025-02-01'
        },
        createdBy: 'loan.officer@bank.com',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-11-15T10:00:00Z'
      }
    ];

    setLoanApplications(mockApplications);
    setLoans(mockLoans);
    setCreditFacilities([]);
    setCreditScores([]);
    setCollectionActions([]);
  };

  const loadStatistics = () => {
    const totalApplications = loanApplications.length;
    const pendingApplications = loanApplications.filter(app => 
      ['Submitted', 'Under Review'].includes(app.status)
    ).length;
    const totalLoans = loans.length;
    const activeLoans = loans.filter(loan => loan.status === 'Active').length;
    const totalDisbursed = loans.reduce((sum, loan) => sum + loan.details.principal, 0);
    const outstandingAmount = loans.reduce((sum, loan) => sum + loan.status.outstandingPrincipal, 0);
    
    const collectionRate = 95.5;
    const nplRatio = 2.1;

    const byProduct = [
      { product: 'Home Loans', amount: 1500000, count: 25 },
      { product: 'Personal Loans', amount: 500000, count: 45 },
      { product: 'Auto Loans', amount: 300000, count: 30 },
      { product: 'Business Loans', amount: 800000, count: 15 }
    ];

    const byRisk = [
      { risk: 'Prime', amount: 2000000, percentage: 65 },
      { risk: 'Near Prime', amount: 800000, percentage: 26 },
      { risk: 'Subprime', amount: 250000, percentage: 8 },
      { risk: 'High Risk', amount: 50000, percentage: 1 }
    ];

    const byBorrower = [
      { type: 'Individual', amount: 1800000, count: 80 },
      { type: 'Business', amount: 1000000, count: 20 },
      { type: 'Corporate', amount: 300000, count: 5 }
    ];

    setStats({
      totalApplications,
      pendingApplications,
      totalLoans,
      activeLoans,
      totalDisbursed,
      outstandingAmount,
      collectionRate,
      nplRatio,
      applicationMetrics: {
        approvalRate: 78.5,
        averageProcessingTime: 5.2,
        rejectionRate: 15.2,
        conversionRate: 68.3
      },
      loanMetrics: {
        delinquencyRate: 3.2,
        defaultRate: 1.8,
        recoveryRate: 45.6,
        averageLoanSize: 78500
      },
      portfolioAnalysis: {
        byProduct,
        byRisk,
        byBorrower,
        byBranch: [
          { branch: 'Main Branch', amount: 1200000, count: 35 },
          { branch: 'North Branch', amount: 800000, count: 25 },
          { branch: 'South Branch', amount: 600000, count: 20 },
          { branch: 'East Branch', amount: 500000, count: 25 }
        ]
      },
      performanceMetrics: {
        yield: 7.2,
        costOfRisk: 1.5,
        netInterestMargin: 5.8,
        returnOnAssets: 1.2,
        returnOnEquity: 12.5
      },
      aiMetrics: {
        predictionAccuracy: 89.3,
        riskDetection: 92.1,
        automationLevel: 76.8,
        optimizationScore: 84.2
      }
    });
  };

  // Filter and search logic
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = loan.borrowerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loan.loanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         loan.details.purpose.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || loan.loanType === typeFilter;
    const matchesStatus = !statusFilter || loan.status === statusFilter;
    const matchesRisk = !riskFilter || loan.riskCategory === riskFilter;
    const matchesBorrowerType = !borrowerTypeFilter || loan.borrowerType === borrowerTypeFilter;
    const matchesAmountRange = (!amountRange.min || loan.details.principal >= parseFloat(amountRange.min)) &&
                              (!amountRange.max || loan.details.principal <= parseFloat(amountRange.max));
    const matchesDaysPastDue = !daysPastDueFilter || 
                              (daysPastDueFilter === 'current' && loan.status.daysPastDue === 0) ||
                              (daysPastDueFilter === '1-30' && loan.status.daysPastDue >= 1 && loan.status.daysPastDue <= 30) ||
                              (daysPastDueFilter === '31-60' && loan.status.daysPastDue >= 31 && loan.status.daysPastDue <= 60) ||
                              (daysPastDueFilter === '60+' && loan.status.daysPastDue > 60);

    return matchesSearch && matchesType && matchesStatus && matchesRisk && 
           matchesBorrowerType && matchesAmountRange && matchesDaysPastDue;
  });

  const sortedLoans = [...filteredLoans].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'borrowerName':
        aValue = a.borrowerName;
        bValue = b.borrowerName;
        break;
      case 'details.principal':
        aValue = a.details.principal;
        bValue = b.details.principal;
        break;
      case 'status.outstandingPrincipal':
        aValue = a.status.outstandingPrincipal;
        bValue = b.status.outstandingPrincipal;
        break;
      case 'details.interestRate':
        aValue = a.details.interestRate;
        bValue = b.details.interestRate;
        break;
      case 'status.daysPastDue':
        aValue = a.status.daysPastDue;
        bValue = b.status.daysPastDue;
        break;
      default:
        aValue = a.borrowerName;
        bValue = b.borrowerName;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedLoans.length / itemsPerPage);
  const paginatedLoans = sortedLoans.slice(
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
    if (selectedItems.length === paginatedLoans.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedLoans.map(loan => loan.id));
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
      case 'Fully Paid': return 'bg-blue-100 text-blue-800';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800';
      case 'Delinquent': return 'bg-orange-100 text-orange-800';
      case 'Non-Performing': return 'bg-red-100 text-red-800';
      case 'Restructured': return 'bg-purple-100 text-purple-800';
      case 'Charged Off': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (category: string) => {
    switch (category) {
      case 'Prime': return 'bg-green-100 text-green-800';
      case 'Near Prime': return 'bg-blue-100 text-blue-800';
      case 'Subprime': return 'bg-yellow-100 text-yellow-800';
      case 'High Risk': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCardIcon className="h-8 w-8 text-blue-600" />
              Credit & Loan Management
            </h1>
            <p className="text-gray-600 mt-1">Manage loan applications, credit facilities, and collections</p>
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
              onClick={() => setShowApplicationModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Applications
            </button>
            <button
              onClick={() => setShowFacilityModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <BanknotesIcon className="h-4 w-4 mr-2" />
              Credit Facilities
            </button>
            <button
              onClick={() => setShowLoanModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Loan
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
            { id: 'applications', name: 'Applications', icon: DocumentTextIcon },
            { id: 'loans', name: 'Loans', icon: CreditCardIcon },
            { id: 'credit-facilities', name: 'Credit Facilities', icon: BanknotesIcon },
            { id: 'credit-scores', name: 'Credit Scores', icon: StarIcon },
            { id: 'collections', name: 'Collections', icon: UserGroupIcon },
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
              <p className="text-sm font-medium text-gray-600">Outstanding Amount</p>
              <p className="text-2xl font-bold text-blue-600">${(stats.outstandingAmount / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +5.2% from last month
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
              <p className="text-sm font-medium text-gray-600">Active Loans</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeLoans}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                {stats.collectionRate}% collection rate
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CreditCardIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Applications</p>
              <p className="text-2xl font-bold text-orange-600">{stats.pendingApplications}</p>
              <p className="text-sm text-orange-600 flex items-center mt-1">
                <ClockIcon className="h-4 w-4 mr-1" />
                Avg {stats.applicationMetrics.averageProcessingTime} days
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">NPL Ratio</p>
              <p className="text-2xl font-bold text-red-600">{stats.nplRatio}%</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                Below target
              </p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio by Product */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Portfolio by Product</h3>
          <div className="space-y-3">
            {stats.portfolioAnalysis.byProduct.map((product, index) => (
              <div key={product.product} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{product.product}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(product.amount / 3100000) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    ${(product.amount / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Distribution</h3>
          <div className="space-y-3">
            {stats.portfolioAnalysis.byRisk.map((risk, index) => (
              <div key={risk.risk} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{risk.risk}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        risk.risk === 'Prime' ? 'bg-green-500' :
                        risk.risk === 'Near Prime' ? 'bg-blue-500' :
                        risk.risk === 'Subprime' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${risk.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {risk.percentage}%
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
              <p className="text-xs text-gray-500">Yield</p>
              <p className="text-sm font-medium text-green-600">{stats.performanceMetrics.yield}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cost of Risk</p>
              <p className="text-sm font-medium text-red-600">{stats.performanceMetrics.costOfRisk}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Net Interest Margin</p>
              <p className="text-sm font-medium text-blue-600">{stats.performanceMetrics.netInterestMargin}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">ROA</p>
              <p className="text-sm font-medium text-purple-600">{stats.performanceMetrics.returnOnAssets}%</p>
            </div>
          </div>
        </div>

        {/* Application Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approval Rate</span>
              <span className="text-sm font-medium text-green-600">{stats.applicationMetrics.approvalRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Conversion Rate</span>
              <span className="text-sm font-medium text-blue-600">{stats.applicationMetrics.conversionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rejection Rate</span>
              <span className="text-sm font-medium text-red-600">{stats.applicationMetrics.rejectionRate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Avg Processing Time</span>
              <span className="text-sm font-medium text-gray-900">{stats.applicationMetrics.averageProcessingTime} days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance</h3>
          <div className="space-y-3">
            {stats.portfolioAnalysis.byBranch.map((branch) => (
              <div key={branch.branch} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{branch.branch}</p>
                  <p className="text-xs text-gray-500">{branch.count} loans</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">${(branch.amount / 1000).toFixed(0)}K</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Prediction Accuracy</span>
              <span className="text-sm font-medium text-green-600">{stats.aiMetrics.predictionAccuracy}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Risk Detection</span>
              <span className="text-sm font-medium text-blue-600">{stats.aiMetrics.riskDetection}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Automation Level</span>
              <span className="text-sm font-medium text-purple-600">{stats.aiMetrics.automationLevel}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Optimization Score</span>
              <span className="text-sm font-medium text-orange-600">{stats.aiMetrics.optimizationScore}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoans = () => (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search loans..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Loan Type</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="Home Loan">Home Loan</option>
                  <option value="Personal Loan">Personal Loan</option>
                  <option value="Auto Loan">Auto Loan</option>
                  <option value="Business Loan">Business Loan</option>
                  <option value="Education Loan">Education Loan</option>
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
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Delinquent">Delinquent</option>
                  <option value="Non-Performing">Non-Performing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Category</label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Risk Levels</option>
                  <option value="Prime">Prime</option>
                  <option value="Near Prime">Near Prime</option>
                  <option value="Subprime">Subprime</option>
                  <option value="High Risk">High Risk</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Days Past Due</label>
                <select
                  value={daysPastDueFilter}
                  onChange={(e) => setDaysPastDueFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All</option>
                  <option value="current">Current</option>
                  <option value="1-30">1-30 DPD</option>
                  <option value="31-60">31-60 DPD</option>
                  <option value="60+">60+ DPD</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Loans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedLoans.map((loan) => (
          <div key={loan.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{loan.borrowerName}</h3>
                <p className="text-sm text-gray-500">{loan.loanNumber}</p>
                <p className="text-xs text-gray-400">{loan.loanType}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(loan.riskCategory)}`}>
                {loan.riskCategory}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                ${loan.status.outstandingPrincipal.toLocaleString()} outstanding
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <ChartBarIcon className="h-4 w-4 mr-2" />
                {loan.details.interestRate}% rate
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {loan.details.term} months term
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Next Payment</p>
                <p className="text-sm font-medium text-gray-900">
                  ${loan.repayment.nextPaymentAmount.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">DPD</p>
                <p className={`text-sm font-medium ${
                  loan.status.daysPastDue === 0 ? 'text-green-600' : 
                  loan.status.daysPastDue <= 30 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {loan.status.daysPastDue} days
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                {loan.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingLoan(loan);
                    setShowLoanModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingLoan(loan);
                    setShowLoanModal(true);
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
                  {Math.min(currentPage * itemsPerPage, sortedLoans.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{sortedLoans.length}</span>
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
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'loans':
        return renderLoans();
      case 'applications':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Loan Applications</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Application Management</h3>
              <p className="text-gray-600">Manage loan applications, credit assessments, and approvals.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                New Application
              </button>
            </div>
          </div>
        );
      case 'credit-facilities':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit Facilities</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Credit Facility Management</h3>
              <p className="text-gray-600">Manage revolving credit lines, overdrafts, and credit guarantees.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Create Facility
              </button>
            </div>
          </div>
        );
      case 'credit-scores':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit Scores</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Credit Score Management</h3>
              <p className="text-gray-600">Track and analyze credit scores and risk assessments.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Generate Score
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Collections & Recovery</h3>
              <p className="text-gray-600">Manage collections activities and loan recovery processes.</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Start Collection
              </button>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Credit Reports</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <ChartPieIcon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Report</h3>
                <p className="text-gray-600 text-sm mb-4">Comprehensive loan portfolio analysis and performance.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <DocumentTextIcon className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Application Report</h3>
                <p className="text-gray-600 text-sm mb-4">Loan application processing and approval analysis.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <UserGroupIcon className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Collections Report</h3>
                <p className="text-gray-600 text-sm mb-4">Collections performance and recovery analysis.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Generate Report →
                </button>
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Advanced Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <ChartPieIcon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Comprehensive portfolio performance and risk analysis.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <StarIcon className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Credit Risk Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Advanced credit risk modeling and prediction.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <UserGroupIcon className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Collections Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Collections optimization and performance tracking.</p>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Credit & Loan Settings</h3>
              <p className="text-gray-600">Configure credit policies, risk parameters, and automation rules.</p>
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

      {/* Loan Modal */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingLoan ? 'Edit Loan' : 'Create New Loan'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loan creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowLoanModal(false);
                    setEditingLoan(null);
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

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingApplication ? 'Edit Application' : 'New Loan Application'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loan application interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowApplicationModal(false);
                    setEditingApplication(null);
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
                <p className="text-gray-600">Advanced credit and loan analytics dashboard would be implemented here</p>
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

export default CreditLoanManagement;