'use client';

import React, { useState, useEffect } from 'react';
import {
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
  ExclamationTriangleIcon,
  ClockIcon,
  StarIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  CogIcon,
  ChartBarIcon,
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
} from '@heroicons/react/24/outline';

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  description: string;
  type: 'Service Agreement' | 'Purchase Order' | 'Employment' | 'License' | 'Lease' | 'Non-Disclosure' | 'Vendor Agreement' | 'Partnership' | 'Consulting' | 'Maintenance' | 'Warranty' | 'Insurance' | 'Loan' | 'Investment' | 'Other';
  category: 'Commercial' | 'Legal' | 'HR' | 'IT' | 'Real Estate' | 'Financial' | 'Procurement' | 'Compliance' | 'Risk Management' | 'Operations';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Active' | 'Expired' | 'Terminated' | 'Renewed' | 'Suspended' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  confidentiality: 'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'Top Secret';
  
  // Parties involved
  parties: Array<{
    id: string;
    name: string;
    type: 'Company' | 'Individual' | 'Government' | 'NGO' | 'Partner' | 'Vendor' | 'Customer';
    role: 'Client' | 'Vendor' | 'Partner' | 'Supplier' | 'Employee' | 'Contractor' | 'Service Provider';
    contactInfo: {
      name: string;
      email: string;
      phone: string;
      address: string;
    };
    legalEntity: {
      name: string;
      registrationNumber: string;
      taxId: string;
      jurisdiction: string;
    };
    signingAuthority: {
      name: string;
      title: string;
      email: string;
      authority: string;
    };
  }>;

  // Financial terms
  financial: {
    contractValue: number;
    currency: string;
    paymentTerms: string;
    paymentSchedule: Array<{
      id: string;
      description: string;
      amount: number;
      dueDate: string;
      status: 'Pending' | 'Due' | 'Paid' | 'Overdue';
      paidDate?: string;
      reference?: string;
    }>;
    currencyExchange: {
      rate: number;
      rateDate: string;
      baseCurrency: string;
    };
    penalties: {
      latePayment: number;
      earlyTermination: number;
      performance: number;
      other: string;
    };
    taxes: {
      vat: number;
      withholding: number;
      other: number;
    };
  };

  // Key dates and milestones
  dates: {
    effectiveDate: string;
    startDate: string;
    endDate: string;
    renewalDate?: string;
    noticePeriod: number;
    terminationDate?: string;
    signingDate?: string;
    lastModifiedDate: string;
    nextReviewDate: string;
  };

  // Contract scope and terms
  scope: {
    objectives: string[];
    deliverables: Array<{
      id: string;
      description: string;
      quantity?: number;
      unit?: string;
      dueDate: string;
      status: 'Pending' | 'In Progress' | 'Completed' | 'Delayed' | 'Cancelled';
      acceptanceCriteria: string[];
      dependencies: string[];
    }>;
    serviceLevel: Array<{
      metric: string;
      target: number;
      unit: string;
      measurement: string;
      penalty: number;
    }>;
    exclusions: string[];
    assumptions: string[];
  };

  // Legal and compliance
  legal: {
    governingLaw: string;
    jurisdiction: string;
    disputeResolution: 'Negotiation' | 'Mediation' | 'Arbitration' | 'Litigation';
    arbitrationVenue?: string;
    forceMajeure: boolean;
    confidentiality: boolean;
    intellectualProperty: string;
    indemnification: string;
    limitationOfLiability: string;
    terminationClauses: string[];
    complianceRequirements: string[];
  };

  // Risk and insurance
  risk: {
    riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
    riskFactors: string[];
    insuranceRequired: boolean;
    insuranceDetails: {
      type: string;
      amount: number;
      provider: string;
      expiryDate: string;
    };
    securityRequirements: string[];
    backgroundCheckRequired: boolean;
  };

  // Approval workflow
  approval: {
    stages: Array<{
      id: string;
      name: string;
      status: 'Pending' | 'In Progress' | 'Approved' | 'Rejected' | 'Skipped';
      assignedTo: string;
      approvedBy?: string;
      approvedAt?: string;
      comments?: string;
      dueDate: string;
    }>;
    currentStage: number;
    isFullyApproved: boolean;
    approvers: Array<{
      userId: string;
      userName: string;
      role: string;
      level: number;
      status: 'Pending' | 'Approved' | 'Rejected';
      approvedAt?: string;
      comments?: string;
    }>;
  };

  // Performance tracking
  performance: {
    overallRating: number;
    onTimeDelivery: number;
    qualityScore: number;
    costPerformance: number;
    complianceScore: number;
    milestonesCompleted: number;
    totalMilestones: number;
    issuesReported: number;
    complaints: number;
    renewals: number;
  };

  // Documents and attachments
  documents: Array<{
    id: string;
    name: string;
    type: 'Contract' | 'Amendment' | 'Attachment' | 'Certificate' | 'Invoice' | 'Report' | 'Correspondence';
    url: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
    version: string;
    category: 'Legal' | 'Financial' | 'Technical' | 'Compliance' | 'Communication';
  }>;

  // Communications and notes
  communications: Array<{
    id: string;
    type: 'Email' | 'Phone' | 'Meeting' | 'Letter' | 'Notice';
    subject: string;
    content: string;
    participants: string[];
    timestamp: string;
    attachments: string[];
    confidentiality: 'Public' | 'Internal' | 'Confidential';
  }>;

  // Renewals and amendments
  renewals: Array<{
    id: string;
    renewalDate: string;
    newEndDate: string;
    changes: string;
    approvedBy: string;
    status: 'Proposed' | 'Approved' | 'Rejected' | 'Executed';
    newValue?: number;
  }>;

  amendments: Array<{
    id: string;
    amendmentNumber: string;
    description: string;
    effectiveDate: string;
    requestedBy: string;
    approvedBy?: string;
    changes: {
      field: string;
      oldValue: string;
      newValue: string;
    }[];
    status: 'Draft' | 'Under Review' | 'Approved' | 'Executed' | 'Rejected';
  }>;

  // AI insights and analytics
  aiInsights: {
    riskScore: number;
    completionProbability: number;
    renewalLikelihood: number;
    performancePrediction: string;
    recommendedActions: string[];
    similarContracts: string[];
    benchmarking: {
      industry: string;
      performance: string;
      rank: number;
    };
  };

  // Metadata
  tags: string[];
  customFields: Record<string, any>;
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

  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  legalName: string;
  type: 'Individual' | 'Sole Proprietorship' | 'Partnership' | 'Private Limited' | 'Public Limited' | 'Government' | 'NGO';
  category: 'Service Provider' | 'Supplier' | 'Consultant' | 'Contractor' | 'Technology' | 'Professional Services' | 'Manufacturing' | 'Distribution' | 'Maintenance' | 'Other';
  status: 'Active' | 'Inactive' | 'Suspended' | 'Blacklisted' | 'Under Review' | 'Pending Approval';
  
  // Contact information
  contactInfo: {
    primaryContact: {
      name: string;
      title: string;
      email: string;
      phone: string;
      mobile?: string;
    };
    billingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    shippingAddress: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    website?: string;
    fax?: string;
  };

  // Business information
  businessInfo: {
    registrationNumber: string;
    taxNumber: string;
    gstNumber?: string;
    panNumber?: string;
    incorporationDate: string;
    financialYearEnd: string;
    numberOfEmployees: number;
    annualTurnover: number;
    creditRating: string;
    bankingDetails: {
      bankName: string;
      accountNumber: string;
      ifscCode: string;
      branchName: string;
      accountType: 'Current' | 'Savings' | 'Overdraft';
    };
  };

  // Compliance and certifications
  compliance: {
    regulatoryStatus: 'Compliant' | 'Non-Compliant' | 'Under Review' | 'Exempt';
    certifications: Array<{
      name: string;
      issuingAuthority: string;
      issueDate: string;
      expiryDate: string;
      status: 'Valid' | 'Expired' | 'Under Renewal';
    }>;
    insurance: Array<{
      type: string;
      amount: number;
      provider: string;
      policyNumber: string;
      expiryDate: string;
    }>;
    licenses: Array<{
      type: string;
      number: string;
      issuingAuthority: string;
      issueDate: string;
      expiryDate: string;
    }>;
  };

  // Performance metrics
  performance: {
    overallRating: number;
    qualityScore: number;
    deliveryScore: number;
    complianceScore: number;
    costCompetitiveness: number;
    responsivenessScore: number;
    innovationScore: number;
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    terminatedContracts: number;
    totalValue: number;
    averageContractValue: number;
    onTimeDeliveryRate: number;
    defectRate: number;
    customerSatisfactionScore: number;
  };

  // Financial metrics
  financial: {
    paymentTerms: number;
    creditLimit: number;
    outstandingAmount: number;
    overdueAmount: number;
    lastPaymentDate: string;
    paymentHistory: 'Excellent' | 'Good' | 'Fair' | 'Poor';
    financialStability: 'High' | 'Medium' | 'Low';
    riskAssessment: 'Low' | 'Medium' | 'High' | 'Critical';
  };

  // Relationships and references
  relationships: Array<{
    entityName: string;
    relationshipType: 'Client' | 'Reference' | 'Partner' | 'Subsidiary' | 'Parent';
    contactPerson: string;
    contactDetails: string;
    duration: string;
  }>;

  // Documents
  documents: Array<{
    id: string;
    name: string;
    type: 'Certificate' | 'License' | 'Insurance' | 'Financial Statement' | 'Reference Letter' | 'Agreement';
    url: string;
    uploadedAt: string;
    expiryDate?: string;
  }>;

  // AI insights
  aiInsights: {
    riskScore: number;
    reliabilityScore: number;
    competitivenessScore: number;
    recommendedActions: string[];
    similarVendors: string[];
    benchmarking: {
      industry: string;
      performance: string;
      rank: number;
    };
  };

  createdAt: string;
  updatedAt: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: string;
  status: 'Draft' | 'Active' | 'Deprecated';
  version: string;
  isPublic: boolean;
  
  // Template structure
  structure: {
    sections: Array<{
      id: string;
      name: string;
      content: string;
      isRequired: boolean;
      order: number;
      variables: Array<{
        name: string;
        type: 'text' | 'number' | 'date' | 'boolean' | 'list';
        description: string;
        defaultValue?: string;
        validation?: string;
      }>;
    }>;
    clauses: Array<{
      id: string;
      name: string;
      content: string;
      category: string;
      isStandard: boolean;
      customizable: boolean;
    }>;
  };

  // Usage statistics
  usage: {
    timesUsed: number;
    lastUsed?: string;
    averageCompletionTime: number;
    successRate: number;
  };

  // Metadata
  createdBy: string;
  approvedBy?: string;
  effectiveDate: string;
  expiryDate?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface ContractAmendment {
  id: string;
  amendmentNumber: string;
  contractId: string;
  contractNumber: string;
  title: string;
  description: string;
  type: 'Extension' | 'Price Change' | 'Scope Change' | 'Term Modification' | 'Party Change' | 'Other';
  status: 'Draft' | 'Under Review' | 'Approved' | 'Executed' | 'Rejected' | 'Cancelled';
  
  changes: Array<{
    field: string;
    oldValue: string;
    newValue: string;
    impact: 'Financial' | 'Legal' | 'Operational' | 'Risk';
    justification: string;
  }>;

  financialImpact: {
    originalValue: number;
    newValue: number;
    changeAmount: number;
    changePercentage: number;
    currency: string;
  };

  timeline: {
    requestedDate: string;
    effectiveDate: string;
    expiryDate?: string;
  };

  approval: {
    requestedBy: string;
    requestedAt: string;
    approvedBy?: string;
    approvedAt?: string;
    comments?: string;
    rejectionReason?: string;
  };

  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

const ContractManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for different data types
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [amendments, setAmendments] = useState<ContractAmendment[]>([]);

  // Modal states
  const [showContractModal, setShowContractModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showAmendmentModal, setShowAmendmentModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Edit states
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);
  const [editingAmendment, setEditingAmendment] = useState<ContractAmendment | null>(null);

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [valueRange, setValueRange] = useState({ min: '', max: '' });
  const [vendorFilter, setVendorFilter] = useState<string>('');

  // Statistics
  const [stats, setStats] = useState({
    totalContracts: 0,
    activeContracts: 0,
    totalValue: 0,
    expiringContracts: 0,
    pendingApprovals: 0,
    completedContracts: 0,
    averageContractValue: 0,
    contractPerformance: 0,
    vendorCount: 0,
    topVendors: [] as Vendor[],
    contractTypes: [] as { type: string; count: number; value: number }[],
    statusDistribution: [] as { status: string; count: number; percentage: number }[],
    renewalPipeline: [] as { month: string; renewals: number; value: number }[],
    performanceMetrics: {
      onTimeDelivery: 0,
      qualityScore: 0,
      complianceRate: 0,
      costSavings: 0
    },
    riskAnalysis: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    },
    aiMetrics: {
      predictionAccuracy: 0;
      automationRate: 0;
      optimizationSuggestions: 0;
      riskDetection: 0;
    }
  });

  // Initialize data
  useEffect(() => {
    initializeData();
    loadStatistics();
  }, []);

  const initializeData = () => {
    // Mock contracts data
    const mockContracts: Contract[] = [
      {
        id: '1',
        contractNumber: 'CT-2024-001',
        title: 'IT Infrastructure Services Agreement',
        description: 'Comprehensive IT infrastructure management and support services',
        type: 'Service Agreement',
        category: 'IT',
        status: 'Active',
        priority: 'High',
        confidentiality: 'Confidential',
        parties: [
          {
            id: 'party1',
            name: 'TechCorp Solutions Ltd.',
            type: 'Company',
            role: 'Client',
            contactInfo: {
              name: 'John Smith',
              email: 'john.smith@techcorp.com',
              phone: '+1-555-0123',
              address: '123 Business Park, San Francisco, CA 94105'
            },
            legalEntity: {
              name: 'TechCorp Solutions Limited',
              registrationNumber: 'CA-123456',
              taxId: '98-7654321',
              jurisdiction: 'California, USA'
            },
            signingAuthority: {
              name: 'Jane Doe',
              title: 'CEO',
              email: 'jane.doe@techcorp.com',
              authority: 'Contract signing authority'
            }
          },
          {
            id: 'party2',
            name: 'Global IT Services Inc.',
            type: 'Company',
            role: 'Service Provider',
            contactInfo: {
              name: 'Mike Johnson',
              email: 'mike.johnson@globalit.com',
              phone: '+1-555-0124',
              address: '456 Tech Avenue, Austin, TX 78701'
            },
            legalEntity: {
              name: 'Global IT Services Inc.',
              registrationNumber: 'TX-789012',
              taxId: '12-3456789',
              jurisdiction: 'Texas, USA'
            },
            signingAuthority: {
              name: 'Sarah Wilson',
              title: 'VP Sales',
              email: 'sarah.wilson@globalit.com',
              authority: 'Contract negotiation and signing'
            }
          }
        ],
        financial: {
          contractValue: 500000,
          currency: 'USD',
          paymentTerms: 'Net 30 days',
          paymentSchedule: [
            {
              id: 'pay1',
              description: 'Initial setup and onboarding',
              amount: 50000,
              dueDate: '2024-01-15',
              status: 'Paid',
              paidDate: '2024-01-10',
              reference: 'INV-001'
            },
            {
              id: 'pay2',
              description: 'Monthly recurring services',
              amount: 37500,
              dueDate: '2024-12-01',
              status: 'Pending'
            }
          ],
          currencyExchange: {
            rate: 1,
            rateDate: '2024-01-01',
            baseCurrency: 'USD'
          },
          penalties: {
            latePayment: 2,
            earlyTermination: 10000,
            performance: 5000,
            other: 'Force majeure clause'
          },
          taxes: {
            vat: 8.25,
            withholding: 0,
            other: 0
          }
        },
        dates: {
          effectiveDate: '2024-01-01',
          startDate: '2024-01-15',
          endDate: '2024-12-31',
          renewalDate: '2024-11-01',
          noticePeriod: 60,
          signingDate: '2023-12-15',
          lastModifiedDate: '2024-06-15',
          nextReviewDate: '2024-10-01'
        },
        scope: {
          objectives: [
            'Provide 24/7 IT infrastructure monitoring',
            'Ensure 99.9% system uptime',
            'Implement security best practices',
            'Provide technical support and maintenance'
          ],
          deliverables: [
            {
              id: 'del1',
              description: 'System monitoring setup',
              quantity: 1,
              unit: 'System',
              dueDate: '2024-01-30',
              status: 'Completed',
              acceptanceCriteria: ['All systems monitored', 'Alerts configured', 'Documentation provided'],
              dependencies: []
            },
            {
              id: 'del2',
              description: 'Monthly support services',
              quantity: 12,
              unit: 'Month',
              dueDate: '2024-12-31',
              status: 'In Progress',
              acceptanceCriteria: ['SLA compliance', 'Monthly reports', 'Issue resolution'],
              dependencies: ['del1']
            }
          ],
          serviceLevel: [
            {
              metric: 'System Uptime',
              target: 99.9,
              unit: 'percentage',
              measurement: 'Monthly',
              penalty: 1000
            },
            {
              metric: 'Response Time',
              target: 4,
              unit: 'hours',
              measurement: 'For critical issues',
              penalty: 500
            }
          ],
          exclusions: [
            'Hardware replacement costs',
            'Software license costs',
            'Network infrastructure upgrades',
            'Force majeure events'
          ],
          assumptions: [
            'Client provides necessary system access',
            'Existing systems are documented',
            'Standard business hours are followed',
            'Change management processes are followed'
          ]
        },
        legal: {
          governingLaw: 'California State Law',
          jurisdiction: 'San Francisco County, California',
          disputeResolution: 'Arbitration',
          arbitrationVenue: 'San Francisco, CA',
          forceMajeure: true,
          confidentiality: true,
          intellectualProperty: 'Background IP remains with respective parties, Foreground IP belongs to client',
          indemnification: 'Mutual indemnification for breach of contract and IP infringement',
          limitationOfLiability: 'Liability limited to contract value',
          terminationClauses: [
            'Termination for convenience with 60 days notice',
            'Termination for cause with 30 days notice',
            'Termination for breach with immediate effect',
            'Force majeure termination rights'
          ],
          complianceRequirements: [
            'Data protection compliance (GDPR, CCPA)',
            'Industry standard security practices',
            'Regular security audits',
            'Insurance requirements'
          ]
        },
        risk: {
          riskLevel: 'Medium',
          riskFactors: ['Service dependency', 'Technology changes', 'Vendor concentration'],
          insuranceRequired: true,
          insuranceDetails: {
            type: 'Professional Indemnity',
            amount: 1000000,
            provider: 'ABC Insurance',
            expiryDate: '2024-12-31'
          },
          securityRequirements: [
            'Background checks for personnel',
            'Security clearances',
            'Confidentiality agreements',
            'Data encryption requirements'
          ],
          backgroundCheckRequired: true
        },
        approval: {
          stages: [
            {
              id: 'stage1',
              name: 'Business Review',
              status: 'Approved',
              assignedTo: 'business.manager@techcorp.com',
              approvedBy: 'business.manager@techcorp.com',
              approvedAt: '2023-12-01',
              comments: 'Approved for technical and commercial terms',
              dueDate: '2023-12-01'
            },
            {
              id: 'stage2',
              name: 'Legal Review',
              status: 'Approved',
              assignedTo: 'legal@techcorp.com',
              approvedBy: 'legal@techcorp.com',
              approvedAt: '2023-12-05',
              comments: 'Legal terms acceptable',
              dueDate: '2023-12-05'
            },
            {
              id: 'stage3',
              name: 'Executive Approval',
              status: 'Approved',
              assignedTo: 'ceo@techcorp.com',
              approvedBy: 'ceo@techcorp.com',
              approvedAt: '2023-12-10',
              comments: 'Approved for signing',
              dueDate: '2023-12-10'
            }
          ],
          currentStage: 3,
          isFullyApproved: true,
          approvers: [
            {
              userId: 'user1',
              userName: 'Business Manager',
              role: 'Business Owner',
              level: 1,
              status: 'Approved',
              approvedAt: '2023-12-01',
              comments: 'Commercial terms approved'
            },
            {
              userId: 'user2',
              userName: 'Legal Counsel',
              role: 'Legal',
              level: 2,
              status: 'Approved',
              approvedAt: '2023-12-05',
              comments: 'Legal review completed'
            },
            {
              userId: 'user3',
              userName: 'CEO',
              role: 'Executive',
              level: 3,
              status: 'Approved',
              approvedAt: '2023-12-10',
              comments: 'Final approval granted'
            }
          ]
        },
        performance: {
          overallRating: 4.2,
          onTimeDelivery: 95,
          qualityScore: 4.5,
          costPerformance: 4.0,
          complianceScore: 98,
          milestonesCompleted: 8,
          totalMilestones: 12,
          issuesReported: 2,
          complaints: 0,
          renewals: 0
        },
        documents: [
          {
            id: 'doc1',
            name: 'Master Service Agreement',
            type: 'Contract',
            url: '/documents/ct-2024-001-master-agreement.pdf',
            size: 2048000,
            uploadedAt: '2023-12-15T10:00:00Z',
            uploadedBy: 'admin@techcorp.com',
            version: '1.0',
            category: 'Legal'
          },
          {
            id: 'doc2',
            name: 'Statement of Work',
            type: 'Attachment',
            url: '/documents/ct-2024-001-sow.pdf',
            size: 1024000,
            uploadedAt: '2023-12-15T10:30:00Z',
            uploadedBy: 'admin@techcorp.com',
            version: '1.0',
            category: 'Technical'
          }
        ],
        communications: [
          {
            id: 'comm1',
            type: 'Email',
            subject: 'Contract Execution Confirmation',
            content: 'Contract has been executed by both parties. Services commence on January 15, 2024.',
            participants: ['john.smith@techcorp.com', 'mike.johnson@globalit.com'],
            timestamp: '2023-12-15T14:30:00Z',
            attachments: [],
            confidentiality: 'Confidential'
          }
        ],
        renewals: [],
        amendments: [],
        aiInsights: {
          riskScore: 25,
          completionProbability: 92,
          renewalLikelihood: 78,
          performancePrediction: 'Expected to meet all KPIs with minor issues',
          recommendedActions: ['Schedule quarterly review', 'Monitor SLA compliance', 'Prepare renewal discussions'],
          similarContracts: ['CT-2023-045', 'CT-2023-067'],
          benchmarking: {
            industry: 'IT Services',
            performance: 'Above Average',
            rank: 78
          }
        },
        tags: ['IT', 'Services', 'Technology', 'Infrastructure'],
        customFields: {
          projectCode: 'IT-2024-001',
          costCenter: 'IT-001',
          budgetOwner: 'CTO',
          contractClass: 'Standard'
        },
        workflow: {
          stages: [
            {
              id: 'wf1',
              name: 'Draft Creation',
              status: 'Completed',
              assignedTo: 'contract.manager@techcorp.com',
              startedAt: '2023-11-15T09:00:00Z',
              completedAt: '2023-11-20T17:00:00Z',
              dueDate: '2023-11-20T17:00:00Z',
              dependencies: []
            },
            {
              id: 'wf2',
              name: 'Review and Approval',
              status: 'Completed',
              assignedTo: 'legal@techcorp.com',
              startedAt: '2023-11-21T09:00:00Z',
              completedAt: '2023-12-10T17:00:00Z',
              dueDate: '2023-12-10T17:00:00Z',
              dependencies: ['wf1']
            },
            {
              id: 'wf3',
              name: 'Execution',
              status: 'Completed',
              assignedTo: 'contract.manager@techcorp.com',
              startedAt: '2023-12-11T09:00:00Z',
              completedAt: '2023-12-15T17:00:00Z',
              dueDate: '2023-12-15T17:00:00Z',
              dependencies: ['wf2']
            },
            {
              id: 'wf4',
              name: 'Performance Monitoring',
              status: 'In Progress',
              assignedTo: 'project.manager@techcorp.com',
              startedAt: '2024-01-15T09:00:00Z',
              dueDate: '2024-12-31T17:00:00Z',
              dependencies: ['wf3']
            }
          ],
          currentStage: 'wf4',
          progress: 75
        },
        createdBy: 'contract.manager@techcorp.com',
        createdAt: '2023-11-15T09:00:00Z',
        updatedAt: '2024-06-15T14:30:00Z'
      }
    ];

    // Mock vendors data
    const mockVendors: Vendor[] = [
      {
        id: '1',
        vendorCode: 'VND-001',
        name: 'Global IT Services Inc.',
        legalName: 'Global IT Services Inc.',
        type: 'Private Limited',
        category: 'Technology',
        status: 'Active',
        contactInfo: {
          primaryContact: {
            name: 'Mike Johnson',
            title: 'Sales Director',
            email: 'mike.johnson@globalit.com',
            phone: '+1-555-0124',
            mobile: '+1-555-0125'
          },
          billingAddress: {
            line1: '456 Tech Avenue',
            city: 'Austin',
            state: 'Texas',
            postalCode: '78701',
            country: 'USA'
          },
          shippingAddress: {
            line1: '456 Tech Avenue',
            city: 'Austin',
            state: 'Texas',
            postalCode: '78701',
            country: 'USA'
          },
          website: 'https://globalit.com',
          fax: '+1-555-0126'
        },
        businessInfo: {
          registrationNumber: 'TX-789012',
          taxNumber: '12-3456789',
          gstNumber: '',
          panNumber: '',
          incorporationDate: '2015-03-15',
          financialYearEnd: '12-31',
          numberOfEmployees: 250,
          annualTurnover: 50000000,
          creditRating: 'A',
          bankingDetails: {
            bankName: 'Bank of America',
            accountNumber: '1234567890',
            ifscCode: 'BOFA-000123',
            branchName: 'Austin Main Branch',
            accountType: 'Current'
          }
        },
        compliance: {
          regulatoryStatus: 'Compliant',
          certifications: [
            {
              name: 'ISO 27001',
              issuingAuthority: 'ISO',
              issueDate: '2023-01-15',
              expiryDate: '2026-01-15',
              status: 'Valid'
            },
            {
              name: 'SOC 2 Type II',
              issuingAuthority: 'AICPA',
              issueDate: '2023-06-01',
              expiryDate: '2024-06-01',
              status: 'Valid'
            }
          ],
          insurance: [
            {
              type: 'Professional Indemnity',
              amount: 2000000,
              provider: 'ABC Insurance',
              policyNumber: 'PI-2024-001',
              expiryDate: '2024-12-31'
            }
          ],
          licenses: [
            {
              type: 'Business License',
              number: 'BL-TX-789012',
              issuingAuthority: 'Texas Secretary of State',
              issueDate: '2015-03-15',
              expiryDate: '2025-03-15'
            }
          ]
        },
        performance: {
          overallRating: 4.3,
          qualityScore: 4.5,
          deliveryScore: 4.2,
          complianceScore: 4.4,
          costCompetitiveness: 4.0,
          responsivenessScore: 4.3,
          innovationScore: 4.1,
          totalContracts: 15,
          activeContracts: 3,
          completedContracts: 11,
          terminatedContracts: 1,
          totalValue: 2500000,
          averageContractValue: 166667,
          onTimeDeliveryRate: 94,
          defectRate: 2,
          customerSatisfactionScore: 4.3
        },
        financial: {
          paymentTerms: 30,
          creditLimit: 500000,
          outstandingAmount: 125000,
          overdueAmount: 0,
          lastPaymentDate: '2024-11-15',
          paymentHistory: 'Excellent',
          financialStability: 'High',
          riskAssessment: 'Low'
        },
        relationships: [
          {
            entityName: 'Tech Solutions Corp',
            relationshipType: 'Client',
            contactPerson: 'John Smith',
            contactDetails: 'john.smith@techsolutions.com',
            duration: '2 years'
          }
        ],
        documents: [
          {
            id: 'vdoc1',
            name: 'ISO 27001 Certificate',
            type: 'Certificate',
            url: '/vendors/vnd-001-iso-certificate.pdf',
            uploadedAt: '2024-01-15T10:00:00Z',
            expiryDate: '2026-01-15'
          }
        ],
        aiInsights: {
          riskScore: 15,
          reliabilityScore: 88,
          competitivenessScore: 82,
          recommendedActions: ['Increase contract volume', 'Explore strategic partnership', 'Monitor financial health'],
          similarVendors: ['VND-002', 'VND-005'],
          benchmarking: {
            industry: 'IT Services',
            performance: 'Above Average',
            rank: 75
          }
        },
        createdAt: '2023-06-15T10:00:00Z',
        updatedAt: '2024-11-20T14:30:00Z'
      }
    ];

    setContracts(mockContracts);
    setVendors(mockVendors);
    setTemplates([]);
    setAmendments([]);
  };

  const loadStatistics = () => {
    const totalContracts = contracts.length;
    const activeContracts = contracts.filter(contract => contract.status === 'Active').length;
    const totalValue = contracts.reduce((sum, contract) => sum + contract.financial.contractValue, 0);
    const expiringContracts = contracts.filter(contract => {
      const endDate = new Date(contract.dates.endDate);
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      return endDate <= thirtyDaysFromNow && contract.status === 'Active';
    }).length;

    const contractTypes = [
      { type: 'Service Agreement', count: 1, value: 500000 },
      { type: 'Purchase Order', count: 0, value: 0 },
      { type: 'License', count: 0, value: 0 },
      { type: 'Employment', count: 0, value: 0 },
      { type: 'Other', count: 0, value: 0 }
    ];

    const statusDistribution = [
      { status: 'Active', count: 1, percentage: 100 },
      { status: 'Draft', count: 0, percentage: 0 },
      { status: 'Expired', count: 0, percentage: 0 },
      { status: 'Terminated', count: 0, percentage: 0 }
    ];

    setStats({
      totalContracts,
      activeContracts,
      totalValue,
      expiringContracts,
      pendingApprovals: contracts.filter(c => c.approval.stages.some(s => s.status === 'Pending')).length,
      completedContracts: contracts.filter(c => c.status === 'Expired' || c.status === 'Terminated').length,
      averageContractValue: totalContracts > 0 ? totalValue / totalContracts : 0,
      contractPerformance: 85.2,
      vendorCount: vendors.length,
      topVendors: vendors.slice(0, 5),
      contractTypes,
      statusDistribution,
      renewalPipeline: [
        { month: 'Jan', renewals: 2, value: 100000 },
        { month: 'Feb', renewals: 1, value: 75000 },
        { month: 'Mar', renewals: 3, value: 200000 },
        { month: 'Apr', renewals: 2, value: 150000 },
        { month: 'May', renewals: 1, value: 50000 },
        { month: 'Jun', renewals: 2, value: 120000 }
      ],
      performanceMetrics: {
        onTimeDelivery: 94.5,
        qualityScore: 4.3,
        complianceRate: 97.8,
        costSavings: 12.5
      },
      riskAnalysis: {
        low: 15,
        medium: 8,
        high: 3,
        critical: 1
      },
      aiMetrics: {
        predictionAccuracy: 89.2,
        automationRate: 76.8,
        optimizationSuggestions: 24,
        riskDetection: 92.1
      }
    });
  };

  // Filter and search logic
  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.contractNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         contract.parties.some(party => party.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = !typeFilter || contract.type === typeFilter;
    const matchesStatus = !statusFilter || contract.status === statusFilter;
    const matchesCategory = !categoryFilter || contract.category === categoryFilter;
    const matchesPriority = !priorityFilter || contract.priority === priorityFilter;
    const matchesVendor = !vendorFilter || contract.parties.some(party => party.id === vendorFilter);
    const matchesDateRange = !dateRange.start || 
                            (contract.dates.effectiveDate >= dateRange.start && contract.dates.effectiveDate <= dateRange.end);
    const matchesValueRange = (!valueRange.min || contract.financial.contractValue >= parseFloat(valueRange.min)) &&
                              (!valueRange.max || contract.financial.contractValue <= parseFloat(valueRange.max));

    return matchesSearch && matchesType && matchesStatus && matchesCategory && 
           matchesPriority && matchesVendor && matchesDateRange && matchesValueRange;
  });

  const sortedContracts = [...filteredContracts].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'title':
        aValue = a.title;
        bValue = b.title;
        break;
      case 'contractNumber':
        aValue = a.contractNumber;
        bValue = b.contractNumber;
        break;
      case 'financial.contractValue':
        aValue = a.financial.contractValue;
        bValue = b.financial.contractValue;
        break;
      case 'dates.endDate':
        aValue = new Date(a.dates.endDate);
        bValue = new Date(b.dates.endDate);
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'type':
        aValue = a.type;
        bValue = b.type;
        break;
      default:
        aValue = a.title;
        bValue = b.title;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedContracts.length / itemsPerPage);
  const paginatedContracts = sortedContracts.slice(
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
    if (selectedItems.length === paginatedContracts.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedContracts.map(contract => contract.id));
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
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Under Review': return 'bg-yellow-100 text-yellow-800';
      case 'Approved': return 'bg-blue-100 text-blue-800';
      case 'Expired': return 'bg-red-100 text-red-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      case 'Renewed': return 'bg-purple-100 text-purple-800';
      case 'Suspended': return 'bg-orange-100 text-orange-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Service Agreement': return 'bg-blue-100 text-blue-800';
      case 'Purchase Order': return 'bg-green-100 text-green-800';
      case 'Employment': return 'bg-purple-100 text-purple-800';
      case 'License': return 'bg-orange-100 text-orange-800';
      case 'Lease': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderHeader = () => (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <DocumentTextIcon className="h-8 w-8 text-indigo-600" />
              Contract Management
            </h1>
            <p className="text-gray-600 mt-1">Manage contracts, vendors, and legal agreements</p>
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
              onClick={() => setShowVendorModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <UserGroupIcon className="h-4 w-4 mr-2" />
              Vendors
            </button>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentDuplicateIcon className="h-4 w-4 mr-2" />
              Templates
            </button>
            <button
              onClick={() => setShowContractModal(true)}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Contract
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
            { id: 'contracts', name: 'Contracts', icon: DocumentTextIcon },
            { id: 'vendors', name: 'Vendors', icon: UserGroupIcon },
            { id: 'templates', name: 'Templates', icon: DocumentDuplicateIcon },
            { id: 'amendments', name: 'Amendments', icon: PencilIcon },
            { id: 'approvals', name: 'Approvals', icon: CheckCircleIcon },
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
                    ? 'border-indigo-500 text-indigo-600'
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
              <p className="text-sm font-medium text-gray-600">Total Contracts</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalContracts}</p>
              <p className="text-sm text-indigo-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +3 this month
              </p>
            </div>
            <div className="h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Contracts</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeContracts}</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                {stats.contractPerformance}% performance
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
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${(stats.totalValue / 1000000).toFixed(1)}M</p>
              <p className="text-sm text-blue-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +8.5% from last quarter
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
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-orange-600">{stats.expiringContracts}</p>
              <p className="text-sm text-orange-600 flex items-center mt-1">
                <ClockIcon className="h-4 w-4 mr-1" />
                Next 30 days
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
        {/* Contract Types */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contract Types</h3>
          <div className="space-y-3">
            {stats.contractTypes.map((type, index) => (
              <div key={type.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{type.type}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-500 h-2 rounded-full"
                      style={{ width: `${type.count > 0 ? 100 : 0}%` }}
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

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Distribution</h3>
          <div className="space-y-3">
            {stats.statusDistribution.map((status, index) => (
              <div key={status.status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status.status}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        status.status === 'Active' ? 'bg-green-500' :
                        status.status === 'Draft' ? 'bg-gray-500' :
                        status.status === 'Expired' ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${status.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {status.count}
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
              <p className="text-xs text-gray-500">On-time Delivery</p>
              <p className="text-sm font-medium text-green-600">{stats.performanceMetrics.onTimeDelivery}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Quality Score</p>
              <p className="text-sm font-medium text-blue-600">{stats.performanceMetrics.qualityScore}/5</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Compliance Rate</p>
              <p className="text-sm font-medium text-purple-600">{stats.performanceMetrics.complianceRate}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Cost Savings</p>
              <p className="text-sm font-medium text-orange-600">{stats.performanceMetrics.costSavings}%</p>
            </div>
          </div>
        </div>

        {/* Renewal Pipeline */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Renewal Pipeline</h3>
          <div className="h-32 flex items-end justify-between space-x-2">
            {stats.renewalPipeline.map((data) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div
                  className="bg-purple-500 rounded-t w-full"
                  style={{ height: `${(data.renewals / 3) * 100}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                <span className="text-xs text-gray-500">{data.renewals}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Vendors</h3>
          <div className="space-y-3">
            {stats.topVendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                  <p className="text-xs text-gray-500">{vendor.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{vendor.performance.overallRating}/5</p>
                  <div className="flex items-center justify-end mt-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(vendor.performance.overallRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Analysis</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Low Risk</span>
              <span className="text-sm font-medium text-green-600">{stats.riskAnalysis.low}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Medium Risk</span>
              <span className="text-sm font-medium text-yellow-600">{stats.riskAnalysis.medium}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">High Risk</span>
              <span className="text-sm font-medium text-orange-600">{stats.riskAnalysis.high}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-900">Critical Risk</span>
              <span className="text-sm font-medium text-red-600">{stats.riskAnalysis.critical}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContracts = () => (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                className={`p-2 ${viewMode === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
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
                  className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
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
                  <option value="Service Agreement">Service Agreement</option>
                  <option value="Purchase Order">Purchase Order</option>
                  <option value="Employment">Employment</option>
                  <option value="License">License</option>
                  <option value="Lease">Lease</option>
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
                  <option value="Draft">Draft</option>
                  <option value="Expired">Expired</option>
                  <option value="Terminated">Terminated</option>
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
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
                <select
                  value={vendorFilter}
                  onChange={(e) => setVendorFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Vendors</option>
                  {vendors.map(vendor => (
                    <option key={vendor.id} value={vendor.id}>{vendor.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedContracts.map((contract) => (
          <div key={contract.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{contract.title}</h3>
                <p className="text-sm text-gray-500">{contract.contractNumber}</p>
                <p className="text-xs text-gray-400">{contract.category}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(contract.type)}`}>
                {contract.type}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <CurrencyDollarIcon className="h-4 w-4 mr-2" />
                ${contract.financial.contractValue.toLocaleString()} {contract.financial.currency}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {contract.dates.endDate}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <UserGroupIcon className="h-4 w-4 mr-2" />
                {contract.parties[1]?.name || 'N/A'}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Performance</p>
                <p className="text-sm font-medium text-gray-900">{contract.performance.overallRating}/5</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Milestones</p>
                <p className="text-sm font-medium text-gray-900">
                  {contract.performance.milestonesCompleted}/{contract.performance.totalMilestones}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                {contract.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingContract(contract);
                    setShowContractModal(true);
                  }}
                  className="text-indigo-600 hover:text-indigo-900"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingContract(contract);
                    setShowContractModal(true);
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
                  {Math.min(currentPage * itemsPerPage, sortedContracts.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{sortedContracts.length}</span>
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
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
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
      case 'contracts':
        return renderContracts();
      case 'vendors':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Vendor Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor Management</h3>
              <p className="text-gray-600">Manage vendor relationships, performance, and compliance.</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Add Vendor
              </button>
            </div>
          </div>
        );
      case 'templates':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contract Templates</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <DocumentDuplicateIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Template Management</h3>
              <p className="text-gray-600">Create and manage contract templates for faster contract creation.</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Template
              </button>
            </div>
          </div>
        );
      case 'amendments':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Contract Amendments</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <PencilIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Amendment Management</h3>
              <p className="text-gray-600">Track and manage contract amendments and modifications.</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Create Amendment
              </button>
            </div>
          </div>
        );
      case 'approvals':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Approval Workflow</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <CheckCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Approvals</h3>
              <p className="text-gray-600">Manage contract approval workflows and authorizations.</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                View Approvals
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
                <ChartPieIcon className="h-8 w-8 text-indigo-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Comprehensive contract performance analysis.</p>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View Report →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <UserGroupIcon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Vendor Report</h3>
                <p className="text-gray-600 text-sm mb-4">Vendor performance and relationship analysis.</p>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View Report →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <DocumentTextIcon className="h-8 w-8 text-green-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Report</h3>
                <p className="text-gray-600 text-sm mb-4">Contract compliance and risk assessment.</p>
                <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                  View Report →
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Contract Settings</h3>
              <p className="text-gray-600">Configure contract types, approval workflows, and automation.</p>
              <button className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
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

      {/* Contract Modal */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingContract ? 'Edit Contract' : 'Create New Contract'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Contract creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowContractModal(false);
                    setEditingContract(null);
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

      {/* Vendor Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <UserGroupIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Vendor creation/editing interface would be implemented here</p>
                <button
                  onClick={() => {
                    setShowVendorModal(false);
                    setEditingVendor(null);
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
                <p className="text-gray-600">Advanced contract analytics dashboard would be implemented here</p>
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

export default ContractManagement;