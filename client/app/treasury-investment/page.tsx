'use client';

import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BanknotesIcon,
  CreditCardIcon,
  GlobeAltIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
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
  DocumentTextIcon,
  BanknotesIcon as BanknotesIconOutline,
  CurrencyDollarIcon as CurrencyDollarIconFinal,
  ChartBarIcon as ChartBarIconFinal,
  CurrencyDollarIconOutline as CurrencyDollarIconOutlineFinal,
  DocumentTextIcon as DocumentTextIconFinal,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

interface Investment {
  id: string;
  investmentNumber: string;
  name: string;
  description: string;
  type: 'Equity' | 'Debt' | 'Fixed Income' | 'Real Estate' | 'Commodity' | 'Cryptocurrency' | 'Derivative' | 'Mutual Fund' | 'ETF' | 'Stock' | 'Bond' | 'Treasury Bill' | 'Commercial Paper' | 'Certificate of Deposit' | 'Other';
  category: 'Short-term' | 'Medium-term' | 'Long-term' | 'Speculative' | 'Conservative' | 'Growth' | 'Income' | 'Balanced';
  status: 'Active' | 'Matured' | 'Sold' | 'Impaired' | 'Restructured' | 'Defaulted' | 'Liquidated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Basic information
  issuer: string;
  tickerSymbol?: string;
  isin?: string;
  cusip?: string;
  currency: string;
  country: string;
  sector: string;
  industry: string;
  rating?: string;
  
  // Financial details
  financial: {
    purchasePrice: number;
    currentPrice: number;
    faceValue: number;
    quantity: number;
    marketValue: number;
    bookValue: number;
    unrealizedGainLoss: number;
    realizedGainLoss: number;
    totalReturn: number;
    annualizedReturn: number;
    yield: number;
    dividendYield?: number;
    couponRate?: number;
    maturityDate?: string;
    nextPaymentDate?: string;
  };

  // Dates
  dates: {
    purchaseDate: string;
    lastValuationDate: string;
    nextReviewDate: string;
    maturityDate?: string;
    lastPaymentDate?: string;
    nextPaymentDate?: string;
  };

  // Risk metrics
  risk: {
    riskLevel: 'Low' | 'Medium' | 'High' | 'Very High';
    volatility: number;
    beta: number;
    sharpeRatio: number;
    var95: number; // Value at Risk 95%
    maxDrawdown: number;
    creditRating?: string;
    liquidity: 'High' | 'Medium' | 'Low' | 'Illiquid';
    concentration: number; // % of portfolio
  };

  // Performance tracking
  performance: {
    totalReturn: number;
    annualizedReturn: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    benchmarkReturn: number;
    alpha: number;
    beta: number;
    informationRatio: number;
    trackingError: number;
  };

  // Holdings and positions
  holdings: Array<{
    id: string;
    quantity: number;
    averagePrice: number;
    currentPrice: number;
    marketValue: number;
    unrealizedGainLoss: number;
    purchaseDate: string;
    lotType: 'FIFO' | 'LIFO' | 'Specific Identification' | 'Weighted Average';
  }>;

  // Dividends and distributions
  income: Array<{
    id: string;
    type: 'Dividend' | 'Interest' | 'Distribution' | 'Rent' | 'Royalty' | 'Other';
    amount: number;
    exDate: string;
    paymentDate: string;
    recordDate: string;
    frequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'One-time';
    reinvested: boolean;
  }>;

  // Transactions
  transactions: Array<{
    id: string;
    type: 'Buy' | 'Sell' | 'Dividend' | 'Split' | 'Spin-off' | 'Rights Issue' | 'Bonus Issue';
    quantity: number;
    price: number;
    amount: number;
    fees: number;
    date: string;
    notes: string;
    reference: string;
  }>;

  // ESG metrics
  esg: {
    environmentalScore: number;
    socialScore: number;
    governanceScore: number;
    overallScore: number;
    esgRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
    controversies: Array<{
      type: string;
      severity: 'Low' | 'Medium' | 'High' | 'Critical';
      description: string;
      date: string;
      status: 'Open' | 'Resolved' | 'Under Investigation';
    }>;
  };

  // AI insights
  aiInsights: {
    sentimentScore: number;
    momentumScore: number;
    fundamentalScore: number;
    technicalScore: number;
    riskScore: number;
    expectedReturn: number;
    optimalWeight: number;
    rebalancingRecommendation: string;
    exitStrategy: string;
    similarInvestments: string[];
  };

  // Metadata
  tags: string[];
  notes: string;
  analystNotes: string;
  researchReports: Array<{
    id: string;
    title: string;
    author: string;
    date: string;
    rating: string;
    url: string;
  }>;
  
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Portfolio {
  id: string;
  portfolioNumber: string;
  name: string;
  description: string;
  type: 'Equity' | 'Fixed Income' | 'Balanced' | 'Growth' | 'Income' | 'Conservative' | 'Aggressive' | 'Thematic' | 'Index' | 'ESG';
  status: 'Active' | 'Inactive' | 'Closed' | 'Frozen';
  strategy: string;
  benchmark: string;
  
  // Financial summary
  financial: {
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalReturn: number;
    cash: number;
    reservedCash: number;
    availableCash: number;
    marginUsed: number;
    marginAvailable: number;
  };

  // Asset allocation
  allocation: {
    byAssetClass: Array<{
      class: string;
      value: number;
      percentage: number;
      target: number;
    }>;
    bySector: Array<{
      sector: string;
      value: number;
      percentage: number;
      target: number;
    }>;
    byGeography: Array<{
      region: string;
      value: number;
      percentage: number;
      target: number;
    }>;
    byCurrency: Array<{
      currency: string;
      value: number;
      percentage: number;
      target: number;
    }>;
  };

  // Performance
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    quarterly: number;
    yearly: number;
    inception: number;
    volatility: number;
    sharpeRatio: number;
    maxDrawdown: number;
    beta: number;
    alpha: number;
  };

  // Risk metrics
  risk: {
    portfolioBeta: number;
    valueAtRisk: number;
    expectedShortfall: number;
    concentrationRisk: number;
    liquidityRisk: number;
    currencyRisk: number;
    interestRateRisk: number;
    creditRisk: number;
  };

  // Constraints and limits
  constraints: {
    maxSinglePosition: number;
    maxSectorExposure: number;
    maxGeographicExposure: number;
    maxCurrencyExposure: number;
    minLiquidity: number;
    maxLeverage: number;
    esgMinScore: number;
  };

  // Investments in portfolio
  investments: Array<{
    investmentId: string;
    investmentName: string;
    quantity: number;
    marketValue: number;
    weight: number;
    costBasis: number;
    unrealizedGainLoss: number;
    lastUpdated: string;
  }>;

  // Rebalancing
  rebalancing: {
    lastRebalanced: string;
    nextRebalanced: string;
    threshold: number;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'As Needed';
    autoRebalance: boolean;
    drift: number;
  };

  // Cash flows
  cashFlows: Array<{
    id: string;
    date: string;
    type: 'Contribution' | 'Withdrawal' | 'Dividend' | 'Interest' | 'Fee' | 'Rebalancing';
    amount: number;
    description: string;
    reference: string;
  }>;

  // Compliance
  compliance: {
    isCompliant: boolean;
    violations: Array<{
      type: string;
      severity: 'Low' | 'Medium' | 'High' | 'Critical';
      description: string;
      threshold: number;
      actual: number;
      date: string;
    }>;
    lastReview: string;
    nextReview: string;
  };

  // AI insights
  aiInsights: {
    riskAdjustedReturn: number;
    efficiencyRatio: number;
    diversificationScore: number;
    momentumScore: number;
    meanReversionScore: number;
    recommendedActions: string[];
    optimizationSuggestions: string[];
    riskAlerts: string[];
  };

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface CashPosition {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  accountType: 'Checking' | 'Savings' | 'Money Market' | 'Certificate of Deposit' | 'Treasury' | 'Commercial Paper' | 'Sweep Account';
  currency: string;
  balance: number;
  availableBalance: number;
  reservedBalance: number;
  interestRate: number;
  maturityDate?: string;
  nextInterestPayment?: string;
  
  // Account details
  details: {
    routingNumber?: string;
    swiftCode?: string;
    iban?: string;
    branchCode?: string;
    accountClass: 'Operating' | 'Investment' | 'Tax' | 'Payroll' | 'Escrow' | 'Restricted';
    purpose: string;
    authorizedUsers: string[];
    signatoryAuthority: string;
  };

  // Cash management
  cashManagement: {
    minimumBalance: number;
    targetBalance: number;
    maximumBalance: number;
    autoSweep: boolean;
    sweepTarget?: string;
    sweepThreshold: number;
    sweepFrequency: 'Daily' | 'Weekly' | 'Monthly';
    excessCashInvestment: boolean;
    investmentAccount?: string;
  };

  // Interest and fees
  interest: {
    rate: number;
    rateType: 'Fixed' | 'Variable' | 'Tiered';
    calculationMethod: 'Simple' | 'Compound';
    compoundingFrequency: 'Daily' | 'Monthly' | 'Quarterly' | 'Annually';
    lastPayment: string;
    nextPayment: string;
    accruedInterest: number;
  };

  fees: {
    monthlyFee: number;
    transactionFee: number;
    minimumBalanceFee: number;
    overdraftFee: number;
    otherFees: number;
    totalFees: number;
  };

  // Forecast
  forecast: Array<{
    date: string;
    projectedBalance: number;
    confidence: number;
    assumptions: string;
  }>;

  // Alerts
  alerts: Array<{
    id: string;
    type: 'Low Balance' | 'High Balance' | 'Overdraft' | 'Maturity' | 'Interest Payment' | 'Fee';
    threshold: number;
    current: number;
    status: 'Active' | 'Acknowledged' | 'Resolved';
    triggeredAt?: string;
  }>;

  status: 'Active' | 'Inactive' | 'Closed' | 'Frozen' | 'Restricted';
  openedDate: string;
  lastReconciled: string;
  nextReconciliation: string;
  
  createdAt: string;
  updatedAt: string;
}

interface DebtInstrument {
  id: string;
  instrumentNumber: string;
  name: string;
  description: string;
  type: 'Term Loan' | 'Revolving Credit' | 'Bond' | 'Debenture' | 'Note' | 'Commercial Paper' | 'Bank Guarantee' | 'Letter of Credit' | 'Derivative' | 'Swap' | 'Future' | 'Option';
  status: 'Active' | 'Matured' | 'Refinanced' | 'Defaulted' | 'Restructured' | 'Cancelled';
  currency: string;
  
  // Basic details
  details: {
    issuer: string;
    borrower: string;
    lender: string;
    purpose: string;
    sector: string;
    geographic: string;
    rating?: string;
    secured: boolean;
    collateral?: string;
    guarantee?: string;
  };

  // Financial terms
  financial: {
    principal: number;
    outstanding: number;
    interestRate: number;
    rateType: 'Fixed' | 'Variable' | 'Floating';
    spread: number;
    baseRate: string;
    paymentFrequency: 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Bullet';
    nextPayment: string;
    maturityDate: string;
    amortization: 'Equal Installments' | 'Balloon' | 'Bullet' | 'Interest Only';
    gracePeriod?: string;
  };

  // Covenants
  covenants: Array<{
    id: string;
    name: string;
    type: 'Financial' | 'Operational' | 'Reporting' | 'Negative';
    description: string;
    threshold: number;
    current: number;
    status: 'Compliant' | 'Breach' | 'Waiver' | 'Under Review';
    lastTested: string;
    nextTest: string;
  }>;

  // Payments
  payments: Array<{
    id: string;
    dueDate: string;
    amount: number;
    principal: number;
    interest: number;
    fees: number;
    status: 'Scheduled' | 'Paid' | 'Overdue' | 'Partial' | 'Deferred';
    paidDate?: string;
    reference?: string;
  }>;

  // Security and guarantees
  security: {
    secured: boolean;
    collateral: Array<{
      type: string;
      description: string;
      value: number;
      lienPosition: number;
      custodian?: string;
    }>;
    guarantees: Array<{
      provider: string;
      type: string;
      amount: number;
      expiryDate?: string;
    }>;
  };

  // Risk metrics
  risk: {
    creditRating: string;
    probabilityOfDefault: number;
    lossGivenDefault: number;
    exposureAtDefault: number;
    riskWeight: number;
    capitalRequirement: number;
    concentrationRisk: number;
  };

  // Compliance
  compliance: {
    regulatory: string;
    reportingRequirements: string[];
    covenantCompliance: boolean;
    lastReview: string;
    nextReview: string;
  };

  // AI insights
  aiInsights: {
    defaultProbability: number;
    prepaymentRisk: number;
    refinancingRisk: number;
    recommendedActions: string[];
    riskFactors: string[];
    earlyWarningIndicators: string[];
  };

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface TreasuryReport {
  id: string;
  reportNumber: string;
  title: string;
  type: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual' | 'Ad-hoc' | 'Regulatory';
  period: {
    startDate: string;
    endDate: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annual';
  };
  status: 'Draft' | 'In Review' | 'Approved' | 'Published' | 'Archived';
  
  // Executive summary
  executiveSummary: {
    keyHighlights: string[];
    concerns: string[];
    recommendations: string[];
    riskAssessment: string;
    performanceOverview: string;
  };

  // Cash and liquidity
  cashManagement: {
    totalCash: number;
    restrictedCash: number;
    availableCash: number;
    cashForecast: Array<{
      period: string;
      inflows: number;
      outflows: number;
      netCashFlow: number;
      endingBalance: number;
    }>;
    liquidityMetrics: {
      currentRatio: number;
      quickRatio: number;
      cashRatio: number;
      operatingCashFlowRatio: number;
    };
  };

  // Investments
  investmentSummary: {
    totalInvestments: number;
    portfolioValue: number;
    totalReturn: number;
    unrealizedGains: number;
    realizedGains: number;
    topHoldings: Array<{
      name: string;
      value: number;
      return: number;
    }>;
    sectorAllocation: Array<{
      sector: string;
      value: number;
      percentage: number;
    }>;
  };

  // Debt management
  debtSummary: {
    totalDebt: number;
    outstanding: number;
    interestExpense: number;
    debtServiceCoverage: number;
    leverageRatio: number;
    upcomingMaturities: Array<{
      date: string;
      amount: number;
      type: string;
    }>;
  };

  // Risk management
  riskManagement: {
    valueAtRisk: number;
    concentrationRisk: number;
    liquidityRisk: number;
    creditRisk: number;
    currencyRisk: number;
    interestRateRisk: number;
    operationalRisk: number;
    riskLimits: Array<{
      metric: string;
      limit: number;
      current: number;
      utilization: number;
      status: 'Within Limit' | 'Approaching Limit' | 'Breached';
    }>;
  };

  // Performance metrics
  performance: {
    treasuryReturn: number;
    costOfFunds: number;
    netInterestMargin: number;
    efficiencyRatio: number;
    workingCapital: number;
    cashConversionCycle: number;
  };

  // Compliance
  compliance: {
    regulatoryCompliance: boolean;
    internalPolicyCompliance: boolean;
    covenantCompliance: boolean;
    auditFindings: Array<{
      finding: string;
      severity: 'Low' | 'Medium' | 'High' | 'Critical';
      status: 'Open' | 'In Progress' | 'Resolved';
      dueDate: string;
    }>;
  };

  // Forecasts and projections
  forecasts: {
    cashFlowForecast: Array<{
      month: string;
      projectedCash: number;
      confidence: number;
    }>;
    investmentForecast: Array<{
      scenario: string;
      expectedReturn: number;
      probability: number;
    }>;
    debtMaturity: Array<{
      year: string;
      amount: number;
      percentage: number;
    }>;
  };

  // AI insights
  aiInsights: {
    trends: string[];
    anomalies: string[];
    predictions: string[];
    recommendations: string[];
    riskFactors: string[];
    optimization: string[];
  };

  // Attachments
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;

  preparedBy: string;
  reviewedBy?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

const TreasuryInvestment: React.FC = () => {
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
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [cashPositions, setCashPositions] = useState<CashPosition[]>([]);
  const [debtInstruments, setDebtInstruments] = useState<DebtInstrument[]>([]);
  const [reports, setReports] = useState<TreasuryReport[]>([]);

  // Modal states
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showCashModal, setShowCashModal] useState(false);
  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Edit states
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  const [editingCash, setEditingCash] = useState<CashPosition | null>(null);
  const [editingDebt, setEditingDebt] = useState<DebtInstrument | null>(null);
  const [editingReport, setEditingReport] = useState<TreasuryReport | null>(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('');

  // Statistics
  const [stats, setStats] = useState({
    totalInvestments: 0,
    totalValue: 0,
    totalReturn: 0,
    cashAvailable: 0,
    debtOutstanding: 0,
    netWorth: 0,
    portfolioCount: 0,
    topPerformers: [] as Investment[],
    worstPerformers: [] as Investment[],
    assetAllocation: [] as { class: string; value: number; percentage: number }[],
    sectorAllocation: [] as { sector: string; value: number; percentage: number }[],
    geographicAllocation: [] as { region: string; value: number; percentage: number }[],
    riskMetrics: {
      portfolioRisk: number;
      valueAtRisk: number;
      sharpeRatio: number;
      maxDrawdown: number;
    },
    performanceMetrics: {
      dailyReturn: number;
      monthlyReturn: number;
      yearlyReturn: number;
      inceptionReturn: number;
    },
    cashFlows: {
      operating: number;
      investing: number;
      financing: number;
      net: number;
    },
    compliance: {
      compliantInvestments: number;
      totalInvestments: number;
      complianceRate: number;
    },
    aiMetrics: {
      predictionAccuracy: number;
      optimizationScore: number;
      riskDetection: number;
      automationLevel: number;
    }
  });

  // Initialize data
  useEffect(() => {
    initializeData();
    loadStatistics();
  }, []);

  const initializeData = () => {
    // Mock investments data
    const mockInvestments: Investment[] = [
      {
        id: '1',
        investmentNumber: 'INV-2024-001',
        name: 'Apple Inc. Common Stock',
        description: 'Common stock of Apple Inc., technology company',
        type: 'Stock',
        category: 'Growth',
        status: 'Active',
        priority: 'High',
        issuer: 'Apple Inc.',
        tickerSymbol: 'AAPL',
        isin: 'US0378331005',
        currency: 'USD',
        country: 'United States',
        sector: 'Technology',
        industry: 'Consumer Electronics',
        rating: 'AA+',
        financial: {
          purchasePrice: 150.00,
          currentPrice: 175.50,
          faceValue: 0,
          quantity: 1000,
          marketValue: 175500,
          bookValue: 150000,
          unrealizedGainLoss: 25500,
          realizedGainLoss: 0,
          totalReturn: 17.0,
          annualizedReturn: 15.2,
          yield: 0.5,
          dividendYield: 0.5,
          nextPaymentDate: '2024-11-15'
        },
        dates: {
          purchaseDate: '2024-01-15',
          lastValuationDate: '2024-12-09',
          nextReviewDate: '2025-01-15',
          maturityDate: undefined,
          lastPaymentDate: '2024-08-15',
          nextPaymentDate: '2024-11-15'
        },
        risk: {
          riskLevel: 'Medium',
          volatility: 25.5,
          beta: 1.25,
          sharpeRatio: 1.15,
          var95: 12500,
          maxDrawdown: 18.5,
          creditRating: 'AA+',
          liquidity: 'High',
          concentration: 8.5
        },
        performance: {
          totalReturn: 17.0,
          annualizedReturn: 15.2,
          volatility: 25.5,
          sharpeRatio: 1.15,
          maxDrawdown: 18.5,
          winRate: 65,
          profitFactor: 1.8,
          benchmarkReturn: 12.5,
          alpha: 2.7,
          beta: 1.25,
          informationRatio: 0.85,
          trackingError: 8.2
        },
        holdings: [
          {
            id: 'lot1',
            quantity: 1000,
            averagePrice: 150.00,
            currentPrice: 175.50,
            marketValue: 175500,
            unrealizedGainLoss: 25500,
            purchaseDate: '2024-01-15',
            lotType: 'FIFO'
          }
        ],
        income: [
          {
            id: 'div1',
            type: 'Dividend',
            amount: 500,
            exDate: '2024-08-10',
            paymentDate: '2024-08-15',
            recordDate: '2024-08-12',
            frequency: 'Quarterly',
            reinvested: false
          }
        ],
        transactions: [
          {
            id: 'txn1',
            type: 'Buy',
            quantity: 1000,
            price: 150.00,
            amount: 150000,
            fees: 25,
            date: '2024-01-15',
            notes: 'Initial purchase',
            reference: 'TRADE-001'
          }
        ],
        esg: {
          environmentalScore: 75,
          socialScore: 80,
          governanceScore: 85,
          overallScore: 80,
          esgRating: 'AA',
          controversies: []
        },
        aiInsights: {
          sentimentScore: 0.65,
          momentumScore: 0.72,
          fundamentalScore: 0.78,
          technicalScore: 0.68,
          riskScore: 0.35,
          expectedReturn: 12.5,
          optimalWeight: 8.0,
          rebalancingRecommendation: 'Hold current position',
          exitStrategy: 'Consider profit taking if price exceeds $180',
          similarInvestments: ['MSFT', 'GOOGL', 'NVDA']
        },
        tags: ['Technology', 'Growth', 'Large Cap', 'Dividend'],
        notes: 'Strong fundamentals and brand value',
        analystNotes: 'Buy rating with 12-month price target of $190',
        researchReports: [
          {
            id: 'rpt1',
            title: 'Q3 2024 Earnings Analysis',
            author: 'Goldman Sachs',
            date: '2024-10-28',
            rating: 'Buy',
            url: '/reports/aapl-q3-2024.pdf'
          }
        ],
        createdBy: 'portfolio.manager@company.com',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-12-09T14:30:00Z'
      },
      {
        id: '2',
        investmentNumber: 'INV-2024-002',
        name: 'US Treasury Bond 10Y',
        description: '10-year US Treasury Bond',
        type: 'Bond',
        category: 'Conservative',
        status: 'Active',
        priority: 'Medium',
        issuer: 'US Government',
        tickerSymbol: 'UST10Y',
        isin: 'US91282CFF72',
        currency: 'USD',
        country: 'United States',
        sector: 'Government',
        industry: 'Treasury Securities',
        rating: 'AAA',
        financial: {
          purchasePrice: 98.50,
          currentPrice: 99.25,
          faceValue: 100000,
          quantity: 100,
          marketValue: 99250,
          bookValue: 98500,
          unrealizedGainLoss: 750,
          realizedGainLoss: 0,
          totalReturn: 0.76,
          annualizedReturn: 4.2,
          yield: 4.15,
          couponRate: 4.0,
          nextPaymentDate: '2025-06-15',
          maturityDate: '2034-06-15'
        },
        dates: {
          purchaseDate: '2024-06-15',
          lastValuationDate: '2024-12-09',
          nextReviewDate: '2025-06-15',
          maturityDate: '2034-06-15',
          lastPaymentDate: '2024-06-15',
          nextPaymentDate: '2025-06-15'
        },
        risk: {
          riskLevel: 'Low',
          volatility: 3.2,
          beta: -0.15,
          sharpeRatio: 1.85,
          var95: 2500,
          maxDrawdown: 2.1,
          creditRating: 'AAA',
          liquidity: 'High',
          concentration: 5.0
        },
        performance: {
          totalReturn: 0.76,
          annualizedReturn: 4.2,
          volatility: 3.2,
          sharpeRatio: 1.85,
          maxDrawdown: 2.1,
          winRate: 85,
          profitFactor: 2.2,
          benchmarkReturn: 4.0,
          alpha: 0.2,
          beta: -0.15,
          informationRatio: 0.45,
          trackingError: 1.8
        },
        holdings: [
          {
            id: 'lot2',
            quantity: 100,
            averagePrice: 98.50,
            currentPrice: 99.25,
            marketValue: 99250,
            unrealizedGainLoss: 750,
            purchaseDate: '2024-06-15',
            lotType: 'Specific Identification'
          }
        ],
        income: [
          {
            id: 'int1',
            type: 'Interest',
            amount: 2000,
            exDate: '2024-12-15',
            paymentDate: '2024-12-15',
            recordDate: '2024-12-12',
            frequency: 'Semi-Annual',
            reinvested: false
          }
        ],
        transactions: [
          {
            id: 'txn2',
            type: 'Buy',
            quantity: 100,
            price: 98.50,
            amount: 98500,
            fees: 15,
            date: '2024-06-15',
            notes: 'Long-term government bond',
            reference: 'TRADE-002'
          }
        ],
        esg: {
          environmentalScore: 90,
          socialScore: 95,
          governanceScore: 95,
          overallScore: 93,
          esgRating: 'AAA',
          controversies: []
        },
        aiInsights: {
          sentimentScore: 0.55,
          momentumScore: 0.45,
          fundamentalScore: 0.85,
          technicalScore: 0.60,
          riskScore: 0.15,
          expectedReturn: 3.8,
          optimalWeight: 5.0,
          rebalancingRecommendation: 'Consider increasing allocation',
          exitStrategy: 'Hold to maturity for stable income',
          similarInvestments: ['UST5Y', 'UST30Y', 'TIP']
        },
        tags: ['Government', 'Fixed Income', 'Safe Haven', 'Interest Rate'],
        notes: 'Safe haven asset with stable returns',
        analystNotes: 'Hold rating, monitor interest rate environment',
        researchReports: [],
        createdBy: 'treasury.manager@company.com',
        createdAt: '2024-06-15T10:00:00Z',
        updatedAt: '2024-12-09T14:30:00Z'
      }
    ];

    // Mock portfolios data
    const mockPortfolios: Portfolio[] = [
      {
        id: '1',
        portfolioNumber: 'PF-2024-001',
        name: 'Growth Portfolio',
        description: 'Aggressive growth portfolio focused on technology and innovation',
        type: 'Growth',
        status: 'Active',
        strategy: 'Long-term capital appreciation through growth stocks',
        benchmark: 'NASDAQ-100',
        financial: {
          totalValue: 500000,
          totalCost: 450000,
          totalGainLoss: 50000,
          totalReturn: 11.11,
          cash: 25000,
          reservedCash: 5000,
          availableCash: 20000,
          marginUsed: 0,
          marginAvailable: 100000
        },
        allocation: {
          byAssetClass: [
            { class: 'Equity', value: 400000, percentage: 80, target: 85 },
            { class: 'Fixed Income', value: 75000, percentage: 15, target: 10 },
            { class: 'Cash', value: 25000, percentage: 5, target: 5 }
          ],
          bySector: [
            { sector: 'Technology', value: 200000, percentage: 40, target: 45 },
            { sector: 'Healthcare', value: 80000, percentage: 16, target: 15 },
            { sector: 'Consumer', value: 60000, percentage: 12, target: 10 },
            { sector: 'Financial', value: 40000, percentage: 8, target: 10 },
            { sector: 'Other', value: 20000, percentage: 4, target: 5 }
          ],
          byGeography: [
            { region: 'North America', value: 350000, percentage: 70, target: 75 },
            { region: 'Europe', value: 75000, percentage: 15, target: 15 },
            { region: 'Asia Pacific', value: 50000, percentage: 10, target: 10 }
          ],
          byCurrency: [
            { currency: 'USD', value: 400000, percentage: 80, target: 80 },
            { currency: 'EUR', value: 50000, percentage: 10, target: 10 },
            { currency: 'GBP', value: 25000, percentage: 5, target: 5 },
            { currency: 'Other', value: 25000, percentage: 5, target: 5 }
          ]
        },
        performance: {
          daily: 0.85,
          weekly: 2.15,
          monthly: 5.75,
          quarterly: 8.25,
          yearly: 11.11,
          inception: 15.25,
          volatility: 18.5,
          sharpeRatio: 0.85,
          maxDrawdown: 12.5,
          beta: 1.15,
          alpha: 2.25
        },
        risk: {
          portfolioBeta: 1.15,
          valueAtRisk: 25000,
          expectedShortfall: 35000,
          concentrationRisk: 25,
          liquidityRisk: 15,
          currencyRisk: 12,
          interestRateRisk: 8,
          creditRisk: 5
        },
        constraints: {
          maxSinglePosition: 10,
          maxSectorExposure: 50,
          maxGeographicExposure: 80,
          maxCurrencyExposure: 90,
          minLiquidity: 5,
          maxLeverage: 1.25,
          esgMinScore: 70
        },
        investments: [
          {
            investmentId: '1',
            investmentName: 'Apple Inc. Common Stock',
            quantity: 1000,
            marketValue: 175500,
            weight: 35.1,
            costBasis: 150000,
            unrealizedGainLoss: 25500,
            lastUpdated: '2024-12-09T14:30:00Z'
          }
        ],
        rebalancing: {
          lastRebalanced: '2024-11-01',
          nextRebalanced: '2025-02-01',
          threshold: 5,
          frequency: 'Quarterly',
          autoRebalance: false,
          drift: 2.3
        },
        cashFlows: [
          {
            id: 'cf1',
            date: '2024-01-15',
            type: 'Contribution',
            amount: 100000,
            description: 'Initial capital contribution',
            reference: 'INIT-001'
          }
        ],
        compliance: {
          isCompliant: true,
          violations: [],
          lastReview: '2024-12-01',
          nextReview: '2025-01-01'
        },
        aiInsights: {
          riskAdjustedReturn: 0.85,
          efficiencyRatio: 78,
          diversificationScore: 72,
          momentumScore: 0.68,
          meanReversionScore: 0.45,
          recommendedActions: ['Increase technology allocation', 'Review underperforming positions'],
          optimizationSuggestions: ['Add emerging market exposure', 'Consider ESG screening'],
          riskAlerts: ['Technology concentration risk', 'Market volatility elevated']
        },
        createdBy: 'portfolio.manager@company.com',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-12-09T14:30:00Z'
      }
    ];

    setInvestments(mockInvestments);
    setPortfolios(mockPortfolios);
    setCashPositions([]);
    setDebtInstruments([]);
    setReports([]);
  };

  const loadStatistics = () => {
    const totalInvestments = investments.length;
    const totalValue = investments.reduce((sum, inv) => sum + inv.financial.marketValue, 0);
    const totalReturn = investments.reduce((sum, inv) => sum + inv.financial.totalReturn, 0) / totalInvestments;
    
    const assetAllocation = [
      { class: 'Stocks', value: 175500, percentage: 64.0 },
      { class: 'Bonds', value: 99250, percentage: 36.0 }
    ];

    const sectorAllocation = [
      { sector: 'Technology', value: 175500, percentage: 64.0 },
      { sector: 'Government', value: 99250, percentage: 36.0 }
    ];

    const geographicAllocation = [
      { region: 'United States', value: 274750, percentage: 100.0 }
    ];

    setStats({
      totalInvestments,
      totalValue,
      totalReturn,
      cashAvailable: 125000,
      debtOutstanding: 0,
      netWorth: 625000,
      portfolioCount: portfolios.length,
      topPerformers: investments.sort((a, b) => b.financial.totalReturn - a.financial.totalReturn).slice(0, 5),
      worstPerformers: investments.sort((a, b) => a.financial.totalReturn - b.financial.totalReturn).slice(0, 5),
      assetAllocation,
      sectorAllocation,
      geographicAllocation,
      riskMetrics: {
        portfolioRisk: 18.5,
        valueAtRisk: 15000,
        sharpeRatio: 1.15,
        maxDrawdown: 12.5
      },
      performanceMetrics: {
        dailyReturn: 0.85,
        monthlyReturn: 5.75,
        yearlyReturn: 11.11,
        inceptionReturn: 15.25
      },
      cashFlows: {
        operating: 25000,
        investing: -50000,
        financing: 75000,
        net: 50000
      },
      compliance: {
        compliantInvestments: totalInvestments,
        totalInvestments,
        complianceRate: 100
      },
      aiMetrics: {
        predictionAccuracy: 87.5,
        optimizationScore: 82.3,
        riskDetection: 91.2,
        automationLevel: 78.9
      }
    });
  };

  // Filter and search logic
  const filteredInvestments = investments.filter(investment => {
    const matchesSearch = investment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         investment.investmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         investment.issuer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         investment.tickerSymbol?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !typeFilter || investment.type === typeFilter;
    const matchesStatus = !statusFilter || investment.status === statusFilter;
    const matchesCategory = !categoryFilter || investment.category === categoryFilter;
    const matchesRisk = !riskFilter || investment.risk.riskLevel === riskFilter;
    const matchesCurrency = !currencyFilter || investment.currency === currencyFilter;
    const matchesSector = !sectorFilter || investment.sector === sectorFilter;

    return matchesSearch && matchesType && matchesStatus && matchesCategory && 
           matchesRisk && matchesCurrency && matchesSector;
  });

  const sortedInvestments = [...filteredInvestments].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'financial.marketValue':
        aValue = a.financial.marketValue;
        bValue = b.financial.marketValue;
        break;
      case 'financial.totalReturn':
        aValue = a.financial.totalReturn;
        bValue = b.financial.totalReturn;
        break;
      case 'risk.riskLevel':
        aValue = a.risk.riskLevel;
        bValue = b.risk.riskLevel;
        break;
      case 'dates.lastValuationDate':
        aValue = new Date(a.dates.lastValuationDate);
        bValue = new Date(b.dates.lastValuationDate);
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
  const totalPages = Math.ceil(sortedInvestments.length / itemsPerPage);
  const paginatedInvestments = sortedInvestments.slice(
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
    if (selectedItems.length === paginatedInvestments.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedInvestments.map(inv => inv.id));
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
      case 'Matured': return 'bg-blue-100 text-blue-800';
      case 'Sold': return 'bg-gray-100 text-gray-800';
      case 'Impaired': return 'bg-red-100 text-red-800';
      case 'Defaulted': return 'bg-red-100 text-red-800';
      case 'Liquidated': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Very High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Stock': return 'bg-blue-100 text-blue-800';
      case 'Bond': return 'bg-green-100 text-green-800';
      case 'Mutual Fund': return 'bg-purple-100 text-purple-800';
      case 'ETF': return 'bg-orange-100 text-orange-800';
      case 'Real Estate': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
              Treasury & Investment Management
            </h1>
            <p className="text-gray-600 mt-1">Manage treasury operations and investment portfolios</p>
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
              onClick={() => setShowPortfolioModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <BriefcaseIcon className="h-4 w-4 mr-2" />
              Portfolios
            </button>
            <button
              onClick={() => setShowCashModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <BanknotesIcon className="h-4 w-4 mr-2" />
              Cash Management
            </button>
            <button
              onClick={() => setShowInvestmentModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Investment
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
            { id: 'investments', name: 'Investments', icon: CurrencyDollarIcon },
            { id: 'portfolios', name: 'Portfolios', icon: BriefcaseIcon },
            { id: 'cash-management', name: 'Cash', icon: BanknotesIcon },
            { id: 'debt', name: 'Debt', icon: CreditCardIcon },
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
                    ? 'border-green-500 text-green-600'
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
              <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
              <p className="text-2xl font-bold text-green-600">${(stats.totalValue / 1000).toFixed(0)}K</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +{stats.totalReturn.toFixed(1)}% total return
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
              <p className="text-sm font-medium text-gray-600">Available Cash</p>
              <p className="text-2xl font-bold text-blue-600">${(stats.cashAvailable / 1000).toFixed(0)}K</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <BanknotesIcon className="h-4 w-4 mr-1" />
                Liquidity buffer
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <p className="text-2xl font-bold text-purple-600">${(stats.netWorth / 1000).toFixed(0)}K</p>
              <p className="text-sm text-purple-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +12.3% growth
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
              <p className="text-sm font-medium text-gray-600">Risk Score</p>
              <p className="text-2xl font-bold text-orange-600">{stats.riskMetrics.portfolioRisk}</p>
              <p className="text-sm text-orange-600 flex items-center mt-1">
                <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                {stats.riskMetrics.sharpeRatio.toFixed(2)} Sharpe ratio
              </p>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Allocation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Asset Allocation</h3>
          <div className="space-y-3">
            {stats.assetAllocation.map((asset, index) => (
              <div key={asset.class} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{asset.class}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${asset.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    {asset.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sector Allocation */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sector Allocation</h3>
          <div className="space-y-3">
            {stats.sectorAllocation.map((sector, index) => (
              <div key={sector.sector} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{sector.sector}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${sector.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {sector.percentage.toFixed(0)}%
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
              <p className="text-xs text-gray-500">Daily Return</p>
              <p className="text-sm font-medium text-green-600">
                {stats.performanceMetrics.dailyReturn > 0 ? '+' : ''}{stats.performanceMetrics.dailyReturn}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Monthly Return</p>
              <p className="text-sm font-medium text-blue-600">
                {stats.performanceMetrics.monthlyReturn > 0 ? '+' : ''}{stats.performanceMetrics.monthlyReturn}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Yearly Return</p>
              <p className="text-sm font-medium text-purple-600">
                {stats.performanceMetrics.yearlyReturn > 0 ? '+' : ''}{stats.performanceMetrics.yearlyReturn}%
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Inception Return</p>
              <p className="text-sm font-medium text-orange-600">
                {stats.performanceMetrics.inceptionReturn > 0 ? '+' : ''}{stats.performanceMetrics.inceptionReturn}%
              </p>
            </div>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Portfolio Risk</span>
              <span className="text-sm font-medium text-gray-900">{stats.riskMetrics.portfolioRisk}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Value at Risk (95%)</span>
              <span className="text-sm font-medium text-red-600">${(stats.riskMetrics.valueAtRisk / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sharpe Ratio</span>
              <span className="text-sm font-medium text-green-600">{stats.riskMetrics.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Max Drawdown</span>
              <span className="text-sm font-medium text-orange-600">{stats.riskMetrics.maxDrawdown}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performers</h3>
          <div className="space-y-3">
            {stats.topPerformers.map((investment) => (
              <div key={investment.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{investment.name}</p>
                  <p className="text-xs text-gray-500">{investment.tickerSymbol}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    +{investment.financial.totalReturn.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500">
                    ${(investment.financial.marketValue / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cash Flow Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Operating Cash Flow</span>
              <span className="text-sm font-medium text-green-600">
                ${(stats.cashFlows.operating / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Investing Cash Flow</span>
              <span className="text-sm font-medium text-red-600">
                ${(stats.cashFlows.investing / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Financing Cash Flow</span>
              <span className="text-sm font-medium text-blue-600">
                ${(stats.cashFlows.financing / 1000).toFixed(0)}K
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">Net Cash Flow</span>
              <span className="text-sm font-medium text-purple-600">
                ${(stats.cashFlows.net / 1000).toFixed(0)}K
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInvestments = () => (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search investments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                className={`p-2 ${viewMode === 'list' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-green-50 text-green-600' : 'text-gray-400 hover:text-gray-600'}`}
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
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
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
                  <option value="Stock">Stock</option>
                  <option value="Bond">Bond</option>
                  <option value="Mutual Fund">Mutual Fund</option>
                  <option value="ETF">ETF</option>
                  <option value="Real Estate">Real Estate</option>
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
                  <option value="Matured">Matured</option>
                  <option value="Sold">Sold</option>
                  <option value="Impaired">Impaired</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Risk Levels</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Very High">Very High</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <select
                  value={sectorFilter}
                  onChange={(e) => setSectorFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Sectors</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Financial">Financial</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Government">Government</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Investments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedInvestments.map((investment) => (
          <div key={investment.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{investment.name}</h3>
                <p className="text-sm text-gray-500">{investment.tickerSymbol}</p>
                <p className="text-xs text-gray-400">{investment.investmentNumber}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(investment.type)}`}>
                {investment.type}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                ${investment.financial.marketValue.toLocaleString()}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <TrendingUpIcon className="h-4 w-4 mr-2" />
                {investment.financial.totalReturn > 0 ? '+' : ''}{investment.financial.totalReturn.toFixed(1)}% return
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BriefcaseIcon className="h-4 w-4 mr-2" />
                {investment.sector}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Unrealized P&L</p>
                <p className={`text-sm font-medium ${
                  investment.financial.unrealizedGainLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {investment.financial.unrealizedGainLoss >= 0 ? '+' : ''}${investment.financial.unrealizedGainLoss.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Risk Level</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskColor(investment.risk.riskLevel)}`}>
                  {investment.risk.riskLevel}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(investment.status)}`}>
                {investment.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingInvestment(investment);
                    setShowInvestmentModal(true);
                  }}
                  className="text-green-600 hover:text-green-900"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingInvestment(investment);
                    setShowInvestmentModal(true);
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
                  {Math.min(currentPage * itemsPerPage, sortedInvestments.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{sortedInvestments.length}</span>
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
                          ? 'z-10 bg-green-50 border-green-500 text-green-600'
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
      case 'investments':
        return renderInvestments();
      case 'portfolios':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Portfolio Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Management</h3>
              <p className="text-gray-600">Manage investment portfolios with rebalancing and optimization.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Portfolio
              </button>
            </div>
          </div>
        );
      case 'cash-management':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Cash Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cash & Liquidity Management</h3>
              <p className="text-gray-600">Optimize cash positions and manage liquidity across accounts.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Add Account
              </button>
            </div>
          </div>
        );
      case 'debt':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Debt Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CreditCardIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Debt Instruments</h3>
              <p className="text-gray-600">Manage loans, bonds, and other debt instruments.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Add Debt Instrument
              </button>
            </div>
          </div>
        );
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Treasury Reports</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <ChartPieIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Treasury Reporting</h3>
              <p className="text-gray-600">Generate comprehensive treasury and investment reports.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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
                <ChartPieIcon className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Comprehensive portfolio performance and risk analysis.</p>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <CurrencyDollarIcon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Investment Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Individual investment performance and risk metrics.</p>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <BanknotesIcon className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Cash Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Cash flow analysis and liquidity forecasting.</p>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Treasury Settings</h3>
              <p className="text-gray-600">Configure investment policies, risk limits, and automation settings.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
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

      {/* Investment Modal */}
      {showInvestmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingInvestment ? 'Edit Investment' : 'Create New Investment'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Investment creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowInvestmentModal(false);
                    setEditingInvestment(null);
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

      {/* Portfolio Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingPortfolio ? 'Edit Portfolio' : 'Create New Portfolio'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <BriefcaseIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Portfolio creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowPortfolioModal(false);
                    setEditingPortfolio(null);
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
                <p className="text-gray-600">Advanced treasury and investment analytics dashboard would be implemented here</p>
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

export default TreasuryInvestment;