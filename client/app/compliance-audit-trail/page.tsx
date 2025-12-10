'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheckIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChartBarIcon,
  UserIcon,
  CalendarIcon,
  BellIcon,
  LockClosedIcon,
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  StarIcon,
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
  ComputerDesktopIcon,
  CloudIcon,
  ServerIcon,
  DatabaseIcon,
  CircleStackIcon,
  CodeBracketSquareIcon,
  CommandLineIcon,
  ArchiveBoxIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  LightBulbIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  SpeakerXMarkIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartPieIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  ShareIcon,
  UserPlusIcon,
  CogIcon,
  KeyIcon as KeyIconOutline,
  DocumentArrowUpIcon,
  MagnifyingGlassIcon as MagnifyingGlassIconOutline,
  ShieldExclamationIcon,
  ClockIcon as ClockIconOutline,
  CheckBadgeIcon,
  ExclamationTriangleIcon as ExclamationTriangleIconOutline,
  InformationCircleIcon as InformationCircleIconOutline,
  ClipboardDocumentCheckIcon,
  DocumentMagnifyingGlassIcon,
  FingerPrintIcon,
  EyeSlashIcon,
  LockOpenIcon,
  KeySquareIcon,
  UserLockIcon,
  ShieldCheckIcon as ShieldCheckIconOutline,
  DocumentShieldIcon,
  LockKeyholeIcon,
  KeyIcon as KeyIconFinal,
  ShieldIcon,
  LockClosedIcon as LockClosedIconFinal,
  EyeIcon as EyeIconOutline,
  DocumentTextIcon as DocumentTextIconOutline,
  ClipboardDocumentListIcon as ClipboardDocumentListIconOutline,
  ChartBarIcon as ChartBarIconOutline,
  UserIcon as UserIconOutline,
  CalendarIcon as CalendarIconOutline,
  BellIcon as BellIconOutline,
  GlobeAltIcon as GlobeAltIconOutline,
  PhoneIcon as PhoneIconOutline,
  EnvelopeIcon as EnvelopeIconOutline,
  MapPinIcon as MapPinIconOutline,
  StarIcon as StarIconOutline,
  InformationCircleIconFinal as InformationCircleIconFinal,
  SparklesIconFinal as SparklesIconFinal,
  TrophyIconFinal as TrophyIconFinal,
  RocketLaunchIconFinal as RocketLaunchIconFinal,
  HeartIconFinal as HeartIconFinal,
  BeakerIconFinal as BeakerIconFinal,
  CubeIconFinal as CubeIconFinal,
  CodeBracketIconFinal as CodeBracketIconFinal,
  ClipboardDocumentListIconFinal as ClipboardDocumentListIconFinal,
  DocumentDuplicateIconFinal as DocumentDuplicateIconFinal,
  ArrowPathIconFinal as ArrowPathIconFinal,
  AdjustmentsHorizontalIconFinal as AdjustmentsHorizontalIconFinal,
  TagIconFinal as TagIconFinal,
  CurrencyRupeeIconFinal as CurrencyRupeeIconFinal,
  CurrencyEuroIconFinal as CurrencyEuroIconFinal,
  CurrencyYenIconFinal as CurrencyYenIconFinal,
  CurrencyDollarIconOutlineFinal as CurrencyDollarIconOutlineFinal,
  IdentificationIconFinal as IdentificationIconFinal,
  ClipboardDocumentIconFinal as ClipboardDocumentIconFinal,
  ChartLineIconFinal as ChartLineIconFinal,
  ScaleIconFinal as ScaleIconFinal,
  BoltIconFinal as BoltIconFinal,
  SparklesIconOutlineFinal as SparklesIconOutlineFinal,
  PuzzlePieceIconFinal as PuzzlePieceIconFinal,
  WrenchScrewdriverIconFinal as WrenchScrewdriverIconFinal,
  PresentationChartBarIconFinal as PresentationChartBarIconFinal,
  UserCircleIconFinal as UserCircleIconFinal,
  KeyIconOutlineFinal as KeyIconOutlineFinal,
  PencilSquareIconFinal as PencilSquareIconFinal,
  DocumentIconFinal as DocumentIconFinal,
  FileTextIconFinal as FileTextIconFinal,
  InboxIconFinal as InboxIconFinal,
  BookmarkIconFinal as BookmarkIconFinal,
  FlagIconFinal as FlagIconFinal,
  NoSymbolIconFinal as NoSymbolIconFinal,
  HandRaisedIconFinal as HandRaisedIconFinal,
  SpeakerWaveIconFinal as SpeakerWaveIconFinal,
  DeviceTabletIconFinal as DeviceTabletIconFinal,
  ComputerDesktopIconFinal as ComputerDesktopIconFinal,
  CloudIconFinal as CloudIconFinal,
  ServerIconFinal as ServerIconFinal,
  DatabaseIconFinal as DatabaseIconFinal,
  CircleStackIconFinal as CircleStackIconFinal,
  CodeBracketSquareIconFinal as CodeBracketSquareIconFinal,
  CommandLineIconFinal as CommandLineIconFinal,
} from '@heroicons/react/24/outline';

interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: 'Financial' | 'Tax' | 'Data Privacy' | 'Security' | 'Regulatory' | 'Internal' | 'Audit' | 'Documentation';
  severity: 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';
  status: 'Active' | 'Inactive' | 'Draft' | 'Under Review' | 'Deprecated';
  jurisdiction: string;
  effectiveDate: string;
  expiryDate?: string;
  lastReviewDate: string;
  nextReviewDate: string;
  owner: string;
  approver?: string;
  department: string;
  tags: string[];
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  automationLevel: 'Manual' | 'Semi-Automated' | 'Fully Automated';
  frequency: 'Real-time' | 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Annually' | 'As Needed';
  complianceRate: number;
  violationCount: number;
  lastViolationDate?: string;
  documents: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }>;
  relatedRules: string[];
  exceptions: Array<{
    id: string;
    entity: string;
    reason: string;
    approvedBy: string;
    validFrom: string;
    validTo: string;
    status: 'Active' | 'Expired' | 'Revoked';
  }>;
  implementation: {
    steps: string[];
    resources: string[];
    timeline: string;
    budget?: number;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  };
  monitoring: {
    kpis: Array<{
      name: string;
      target: number;
      current: number;
      unit: string;
    }>;
    alerts: Array<{
      id: string;
      type: 'Threshold Breach' | 'Anomaly' | 'Scheduled' | 'Manual';
      severity: 'Critical' | 'High' | 'Medium' | 'Low';
      message: string;
      triggeredAt: string;
      status: 'Active' | 'Acknowledged' | 'Resolved';
      assignedTo: string;
    }>;
  };
  auditTrail: {
    createdBy: string;
    createdAt: string;
    updatedBy: string;
    updatedAt: string;
    version: string;
    changeLog: Array<{
      version: string;
      changedBy: string;
      changedAt: string;
      changes: string;
      reason: string;
    }>;
  };
  aiInsights: {
    riskScore: number;
    complianceTrend: 'Improving' | 'Stable' | 'Declining';
    recommendedActions: string[];
    similarRules: string[];
    implementationDifficulty: 'Easy' | 'Medium' | 'Hard';
    estimatedEffort: string;
  };
}

interface AuditLog {
  id: string;
  logNumber: string;
  entityType: 'User' | 'Document' | 'Transaction' | 'System' | 'Configuration' | 'Rule' | 'Exception' | 'Report';
  entityId: string;
  entityName: string;
  action: 'Create' | 'Read' | 'Update' | 'Delete' | 'Login' | 'Logout' | 'Download' | 'Upload' | 'Approve' | 'Reject' | 'Execute' | 'Configure' | 'Export' | 'Import';
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
  details: string;
  changes?: Array<{
    field: string;
    oldValue: string;
    newValue: string;
  }>;
  result: 'Success' | 'Failure' | 'Warning' | 'Blocked';
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  complianceRelevant: boolean;
  retentionPeriod: number;
  tags: string[];
  metadata: {
    source: string;
    category: string;
    subsystem: string;
    version: string;
  };
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
  }>;
  relatedLogs: string[];
  alerts: Array<{
    id: string;
    type: 'Security' | 'Compliance' | 'Performance' | 'Error' | 'Anomaly';
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    message: string;
    createdAt: string;
    status: 'Open' | 'Acknowledged' | 'Resolved' | 'Dismissed';
    assignedTo: string;
  }>;
  aiAnalysis: {
    anomalyScore: number;
    suspicious: boolean;
    patternMatch: boolean;
    riskAssessment: string;
    recommendations: string[];
    similarIncidents: string[];
  };
  exportStatus: {
    exported: boolean;
    exportedAt?: string;
    exportedBy?: string;
    format: 'PDF' | 'CSV' | 'JSON' | 'XML';
  };
}

interface ComplianceReport {
  id: string;
  reportNumber: string;
  title: string;
  type: 'Internal Audit' | 'External Audit' | 'Regulatory Filing' | 'Management Report' | 'Risk Assessment' | 'Compliance Dashboard';
  status: 'Draft' | 'In Progress' | 'Under Review' | 'Approved' | 'Published' | 'Archived';
  period: {
    startDate: string;
    endDate: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly' | 'Semi-Annual' | 'Annual' | 'Ad-hoc';
  };
  department: string;
  owner: string;
  reviewer?: string;
  approver?: string;
  dueDate: string;
  submittedDate?: string;
  complianceScore: number;
  totalRules: number;
  compliantRules: number;
  nonCompliantRules: number;
  criticalIssues: number;
  recommendations: string[];
  executiveSummary: string;
  findings: Array<{
    id: string;
    ruleId: string;
    ruleName: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    status: 'Open' | 'In Progress' | 'Resolved' | 'Accepted Risk' | 'Waiver Requested';
    description: string;
    impact: string;
    recommendation: string;
    assignedTo: string;
    dueDate: string;
    evidence: string[];
    comments: Array<{
      id: string;
      author: string;
      comment: string;
      timestamp: string;
    }>;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>;
  distributionList: Array<{
    userId: string;
    userName: string;
    email: string;
    role: string;
    accessLevel: 'Read' | 'Read-Comment' | 'Edit' | 'Full';
  }>;
  templates: Array<{
    id: string;
    name: string;
    type: string;
    content: string;
  }>;
  workflow: {
    stages: Array<{
      id: string;
      name: string;
      status: 'Pending' | 'In Progress' | 'Completed' | 'Skipped';
      assignedTo: string;
      startedAt?: string;
      completedAt?: string;
      comments?: string;
    }>;
    currentStage: string;
  };
  aiInsights: {
    riskTrend: 'Increasing' | 'Stable' | 'Decreasing';
    keyRisks: string[];
    complianceGaps: string[];
    improvementOpportunities: string[];
    benchmarking: {
      industryAverage: number;
      bestInClass: number;
      position: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

interface RiskAssessment {
  id: string;
  assessmentNumber: string;
  title: string;
  type: 'Initial' | 'Periodic' | 'Ad-hoc' | 'Post-Incident' | 'Regulatory';
  status: 'Planning' | 'In Progress' | 'Under Review' | 'Approved' | 'Implemented' | 'Archived';
  scope: string;
  methodology: string;
  assessor: string;
  reviewDate: string;
  approvalDate?: string;
  riskAppetite: 'Conservative' | 'Moderate' | 'Aggressive';
  riskTolerance: number;
  overallRiskScore: number;
  riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High' | 'Critical';
  risks: Array<{
    id: string;
    category: 'Strategic' | 'Operational' | 'Financial' | 'Compliance' | 'Reputational' | 'Technology' | 'Market' | 'Credit';
    description: string;
    likelihood: 1 | 2 | 3 | 4 | 5;
    impact: 1 | 2 | 3 | 4 | 5;
    riskScore: number;
    riskLevel: 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High' | 'Critical';
    existingControls: string[];
    residualRisk: number;
    mitigationStrategy: string;
    owner: string;
    dueDate: string;
    status: 'Identified' | 'Assessed' | 'Mitigation Planned' | 'Mitigation In Progress' | 'Mitigated' | 'Accepted' | 'Transferred';
    evidence: string[];
    lastReviewDate: string;
    nextReviewDate: string;
  }>;
  actionPlans: Array<{
    id: string;
    riskId: string;
    title: string;
    description: string;
    priority: 'Critical' | 'High' | 'Medium' | 'Low';
    assignedTo: string;
    startDate: string;
    targetDate: string;
    actualDate?: string;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
    budget: number;
    resources: string[];
    milestones: Array<{
      id: string;
      name: string;
      description: string;
      targetDate: string;
      status: 'Pending' | 'Completed' | 'Overdue';
      evidence: string;
    }>;
    kpis: Array<{
      name: string;
      target: number;
      current: number;
      unit: string;
      status: 'On Track' | 'At Risk' | 'Off Track';
    }>;
  }>;
  monitoring: {
    frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
    nextReview: string;
    escalationRules: string[];
    reportingSchedule: string[];
  };
  aiAnalysis: {
    emergingRisks: string[];
    trendAnalysis: string;
    predictiveInsights: string[];
    recommendedActions: string[];
    benchmarking: string[];
  };
  createdAt: string;
  updatedAt: string;
}

interface Policy {
  id: string;
  policyNumber: string;
  title: string;
  category: 'Data Privacy' | 'Information Security' | 'Financial Controls' | 'HR' | 'Operations' | 'Compliance' | 'Risk Management' | 'Ethics';
  version: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Published' | 'Under Revision' | 'Archived';
  effectiveDate: string;
  expiryDate?: string;
  reviewDate: string;
  owner: string;
  approver: string;
  department: string;
  audience: string[];
  confidentiality: 'Public' | 'Internal' | 'Confidential' | 'Restricted';
  documentType: 'Policy' | 'Procedure' | 'Guideline' | 'Standard' | 'Framework';
  description: string;
  objectives: string[];
  scope: string;
  definitions: Record<string, string>;
  content: string;
  responsibilities: Array<{
    role: string;
    responsibilities: string[];
  }>;
  procedures: Array<{
    step: number;
    title: string;
    description: string;
    responsible: string;
    timeline: string;
    evidence: string[];
  }>;
  complianceRequirements: string[];
  relatedDocuments: string[];
  trainingRequirements: Array<{
    type: 'Initial' | 'Refresher' | 'Annual';
    audience: string;
    frequency: string;
    duration: string;
    format: string;
  }>;
  exceptions: Array<{
    id: string;
    requestor: string;
    reason: string;
    validFrom: string;
    validTo: string;
    approver: string;
    status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  }>;
  acknowledgments: Array<{
    userId: string;
    userName: string;
    acknowledgedAt: string;
    version: string;
  }>;
  auditLog: Array<{
    id: string;
    action: string;
    performedBy: string;
    timestamp: string;
    details: string;
  }>;
  aiInsights: {
    complexity: 'Simple' | 'Moderate' | 'Complex';
    complianceAlignment: number;
    implementationDifficulty: 'Easy' | 'Medium' | 'Hard';
    recommendedUpdates: string[];
    similarPolicies: string[];
  };
  createdAt: string;
  updatedAt: string;
}

const ComplianceAuditTrail: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for different data types
  const [complianceRules, setComplianceRules] = useState<ComplianceRule[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [complianceReports, setComplianceReports] = useState<ComplianceReport[]>([]);
  const [riskAssessments, setRiskAssessments] = useState<RiskAssessment[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);

  // Modal states
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showBulkActionModal, setShowBulkActionModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Edit states
  const [editingRule, setEditingRule] = useState<ComplianceRule | null>(null);
  const [editingLog, setEditingLog] = useState<AuditLog | null>(null);
  const [editingReport, setEditingReport] = useState<ComplianceReport | null>(null);
  const [editingRisk, setEditingRisk] = useState<RiskAssessment | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [riskLevelFilter, setRiskLevelFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>('');

  // Statistics
  const [stats, setStats] = useState({
    totalRules: 0,
    activeRules: 0,
    complianceScore: 0,
    criticalIssues: 0,
    auditLogsCount: 0,
    recentViolations: 0,
    overdueReviews: 0,
    riskLevelDistribution: { critical: 0, high: 0, medium: 0, low: 0 },
    complianceTrend: [] as { month: string; score: number; issues: number }[],
    ruleCategories: [] as { category: string; count: number; compliant: number }[],
    topRisks: [] as { risk: string; score: number; level: string }[],
    auditActivity: [] as { day: string; logs: number; critical: number }[],
    departmentCompliance: [] as { department: string; score: number; issues: number }[],
    automationMetrics: {
      automatedRules: 0,
      automatedMonitoring: 0,
      automatedAlerts: 0,
      automatedReporting: 0
    }
  });

  // Initialize data
  useEffect(() => {
    initializeData();
    loadStatistics();
  }, []);

  const initializeData = () => {
    // Mock compliance rules data
    const mockRules: ComplianceRule[] = [
      {
        id: '1',
        name: 'Data Privacy Compliance (GDPR)',
        description: 'Ensure compliance with GDPR data protection requirements',
        category: 'Data Privacy',
        severity: 'Critical',
        status: 'Active',
        jurisdiction: 'EU',
        effectiveDate: '2024-01-01',
        lastReviewDate: '2024-10-01',
        nextReviewDate: '2025-01-01',
        owner: 'Data Protection Officer',
        approver: 'Chief Compliance Officer',
        department: 'Legal',
        tags: ['GDPR', 'Data Protection', 'Privacy'],
        priority: 'Critical',
        automationLevel: 'Semi-Automated',
        frequency: 'Real-time',
        complianceRate: 95,
        violationCount: 2,
        lastViolationDate: '2024-11-15',
        documents: [],
        relatedRules: ['2', '3'],
        exceptions: [],
        implementation: {
          steps: [
            'Implement data mapping',
            'Establish consent mechanisms',
            'Create data breach response plan',
            'Train staff on GDPR requirements'
          ],
          resources: ['Legal Team', 'IT Team', 'Training Materials'],
          timeline: '6 months',
          budget: 150000,
          status: 'Completed'
        },
        monitoring: {
          kpis: [
            { name: 'Data Breach Response Time', target: 24, current: 18, unit: 'hours' },
            { name: 'Consent Rate', target: 95, current: 97, unit: 'percentage' },
            { name: 'Data Subject Requests', target: 30, current: 25, unit: 'days' }
          ],
          alerts: []
        },
        auditTrail: {
          createdBy: 'admin@company.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedBy: 'compliance@company.com',
          updatedAt: '2024-10-01T00:00:00Z',
          version: '2.1',
          changeLog: []
        },
        aiInsights: {
          riskScore: 15,
          complianceTrend: 'Improving',
          recommendedActions: ['Enhanced staff training', 'Automated consent tracking'],
          similarRules: ['2', '3'],
          implementationDifficulty: 'Medium',
          estimatedEffort: '3-4 months'
        }
      },
      {
        id: '2',
        name: 'Financial Controls (SOX)',
        description: 'Maintain SOX compliance for financial reporting',
        category: 'Financial',
        severity: 'High',
        status: 'Active',
        jurisdiction: 'US',
        effectiveDate: '2024-01-01',
        lastReviewDate: '2024-09-15',
        nextReviewDate: '2024-12-15',
        owner: 'CFO',
        approver: 'Audit Committee',
        department: 'Finance',
        tags: ['SOX', 'Financial Controls', 'Internal Audit'],
        priority: 'High',
        automationLevel: 'Fully Automated',
        frequency: 'Daily',
        complianceRate: 98,
        violationCount: 1,
        lastViolationDate: '2024-10-20',
        documents: [],
        relatedRules: ['1', '4'],
        exceptions: [],
        implementation: {
          steps: [
            'Implement segregation of duties',
            'Establish approval workflows',
            'Create audit trails',
            'Regular internal audits'
          ],
          resources: ['Finance Team', 'Internal Audit', 'System Administrator'],
          timeline: '4 months',
          budget: 200000,
          status: 'Completed'
        },
        monitoring: {
          kpis: [
            { name: 'Control Effectiveness', target: 95, current: 98, unit: 'percentage' },
            { name: 'Audit Findings', target: 5, current: 2, unit: 'count' },
            { name: 'Remediation Time', target: 30, current: 25, unit: 'days' }
          ],
          alerts: []
        },
        auditTrail: {
          createdBy: 'admin@company.com',
          createdAt: '2024-01-01T00:00:00Z',
          updatedBy: 'cfo@company.com',
          updatedAt: '2024-09-15T00:00:00Z',
          version: '1.5',
          changeLog: []
        },
        aiInsights: {
          riskScore: 25,
          complianceTrend: 'Stable',
          recommendedActions: ['Enhanced monitoring', 'Quarterly reviews'],
          similarRules: ['1', '4'],
          implementationDifficulty: 'Hard',
          estimatedEffort: '4-6 months'
        }
      }
    ];

    // Mock audit logs data
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        logNumber: 'LOG-2024-001',
        entityType: 'User',
        entityId: 'user123',
        entityName: 'John Doe',
        action: 'Login',
        timestamp: '2024-12-09T10:30:00Z',
        userId: 'user123',
        userName: 'John Doe',
        userRole: 'Manager',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_abc123',
        details: 'User logged in successfully',
        result: 'Success',
        riskLevel: 'Low',
        complianceRelevant: false,
        retentionPeriod: 2555,
        tags: ['authentication', 'login'],
        metadata: {
          source: 'web_application',
          category: 'authentication',
          subsystem: 'user_management',
          version: '1.2.3'
        },
        attachments: [],
        relatedLogs: [],
        alerts: [],
        aiAnalysis: {
          anomalyScore: 0.1,
          suspicious: false,
          patternMatch: true,
          riskAssessment: 'Normal login pattern detected',
          recommendations: [],
          similarIncidents: []
        },
        exportStatus: {
          exported: false
        }
      },
      {
        id: '2',
        logNumber: 'LOG-2024-002',
        entityType: 'Document',
        entityId: 'doc456',
        entityName: 'Financial_Report_Q4_2024.pdf',
        action: 'Download',
        timestamp: '2024-12-09T11:15:00Z',
        userId: 'user456',
        userName: 'Jane Smith',
        userRole: 'Finance Analyst',
        ipAddress: '192.168.1.105',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        sessionId: 'sess_def456',
        details: 'Downloaded confidential financial document',
        result: 'Success',
        riskLevel: 'Medium',
        complianceRelevant: true,
        retentionPeriod: 2555,
        tags: ['document', 'download', 'confidential'],
        metadata: {
          source: 'document_management',
          category: 'file_access',
          subsystem: 'document_library',
          version: '1.2.3'
        },
        attachments: [],
        relatedLogs: [],
        alerts: [],
        aiAnalysis: {
          anomalyScore: 0.3,
          suspicious: false,
          patternMatch: true,
          riskAssessment: 'Authorized access to financial document',
          recommendations: ['Monitor document access patterns'],
          similarIncidents: []
        },
        exportStatus: {
          exported: true,
          exportedAt: '2024-12-09T12:00:00Z',
          exportedBy: 'admin@company.com',
          format: 'PDF'
        }
      }
    ];

    setComplianceRules(mockRules);
    setAuditLogs(mockLogs);
    setComplianceReports([]);
    setRiskAssessments([]);
    setPolicies([]);
  };

  const loadStatistics = () => {
    const totalRules = complianceRules.length;
    const activeRules = complianceRules.filter(rule => rule.status === 'Active').length;
    const avgComplianceRate = complianceRules.reduce((sum, rule) => sum + rule.complianceRate, 0) / totalRules;
    const criticalIssues = complianceRules.filter(rule => rule.violationCount > 0 && rule.severity === 'Critical').length;

    const complianceTrend = [
      { month: 'Jan', score: 85, issues: 12 },
      { month: 'Feb', score: 87, issues: 10 },
      { month: 'Mar', score: 89, issues: 8 },
      { month: 'Apr', score: 91, issues: 7 },
      { month: 'May', score: 93, issues: 6 },
      { month: 'Jun', score: 94, issues: 5 },
      { month: 'Jul', score: 95, issues: 4 },
      { month: 'Aug', score: 96, issues: 3 },
      { month: 'Sep', score: 97, issues: 2 },
      { month: 'Oct', score: 96, issues: 3 },
      { month: 'Nov', score: 97, issues: 2 },
      { month: 'Dec', score: 98, issues: 1 }
    ];

    const ruleCategories = [
      { category: 'Data Privacy', count: 8, compliant: 7 },
      { category: 'Financial', count: 6, compliant: 6 },
      { category: 'Security', count: 10, compliant: 9 },
      { category: 'Regulatory', count: 5, compliant: 4 },
      { category: 'Internal', count: 7, compliant: 6 }
    ];

    setStats({
      totalRules,
      activeRules,
      complianceScore: avgComplianceRate,
      criticalIssues,
      auditLogsCount: auditLogs.length,
      recentViolations: complianceRules.reduce((sum, rule) => sum + rule.violationCount, 0),
      overdueReviews: complianceRules.filter(rule => new Date(rule.nextReviewDate) < new Date()).length,
      riskLevelDistribution: {
        critical: 2,
        high: 5,
        medium: 8,
        low: 12
      },
      complianceTrend,
      ruleCategories,
      topRisks: [
        { risk: 'Data Breach Risk', score: 85, level: 'High' },
        { risk: 'Regulatory Non-compliance', score: 75, level: 'Medium' },
        { risk: 'Financial Control Failure', score: 65, level: 'Medium' }
      ],
      auditActivity: [
        { day: 'Mon', logs: 120, critical: 2 },
        { day: 'Tue', logs: 135, critical: 1 },
        { day: 'Wed', logs: 110, critical: 3 },
        { day: 'Thu', logs: 145, critical: 1 },
        { day: 'Fri', logs: 130, critical: 2 },
        { day: 'Sat', logs: 80, critical: 0 },
        { day: 'Sun', logs: 60, critical: 0 }
      ],
      departmentCompliance: [
        { department: 'Finance', score: 98, issues: 1 },
        { department: 'Legal', score: 95, issues: 2 },
        { department: 'IT', score: 92, issues: 3 },
        { department: 'HR', score: 96, issues: 1 },
        { department: 'Operations', score: 89, issues: 4 }
      ],
      automationMetrics: {
        automatedRules: 65,
        automatedMonitoring: 78,
        automatedAlerts: 85,
        automatedReporting: 72
      }
    });
  };

  // Filter and search logic
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchesSearch = log.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || log.result === statusFilter;
    const matchesRiskLevel = !riskLevelFilter || log.riskLevel === riskLevelFilter;
    const matchesEntityType = !categoryFilter || log.entityType === categoryFilter;
    const matchesDateRange = !dateRange.start || 
                            (log.timestamp >= dateRange.start && log.timestamp <= dateRange.end);
    const matchesDepartment = !departmentFilter || log.userRole === departmentFilter;

    return matchesSearch && matchesStatus && matchesRiskLevel && 
           matchesEntityType && matchesDateRange && matchesDepartment;
  });

  const sortedLogs = [...filteredAuditLogs].sort((a, b) => {
    let aValue, bValue;
    switch (sortBy) {
      case 'timestamp':
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
        break;
      case 'userName':
        aValue = a.userName;
        bValue = b.userName;
        break;
      case 'entityName':
        aValue = a.entityName;
        bValue = b.entityName;
        break;
      case 'action':
        aValue = a.action;
        bValue = b.action;
        break;
      case 'result':
        aValue = a.result;
        bValue = b.result;
        break;
      default:
        aValue = new Date(a.timestamp);
        bValue = new Date(b.timestamp);
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage);
  const paginatedLogs = sortedLogs.slice(
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
    if (selectedItems.length === paginatedLogs.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(paginatedLogs.map(log => log.id));
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
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Under Review': return 'bg-blue-100 text-blue-800';
      case 'Deprecated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-blue-100 text-blue-800';
      case 'Info': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'Success': return 'bg-green-100 text-green-800';
      case 'Failure': return 'bg-red-100 text-red-800';
      case 'Warning': return 'bg-yellow-100 text-yellow-800';
      case 'Blocked': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
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
              <ShieldCheckIcon className="h-8 w-8 text-green-600" />
              Compliance & Audit Trail
            </h1>
            <p className="text-gray-600 mt-1">Manage compliance rules, audit logs, and regulatory requirements</p>
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
              onClick={() => setShowRiskModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
              Risk Assessment
            </button>
            <button
              onClick={() => setShowReportModal(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              Reports
            </button>
            <button
              onClick={() => setShowRuleModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Rule
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
            { id: 'compliance-rules', name: 'Compliance Rules', icon: ShieldCheckIcon },
            { id: 'audit-logs', name: 'Audit Logs', icon: ClipboardDocumentListIcon },
            { id: 'reports', name: 'Reports', icon: DocumentTextIcon },
            { id: 'risk-assessment', name: 'Risk Assessment', icon: ExclamationTriangleIcon },
            { id: 'policies', name: 'Policies', icon: DocumentIcon },
            { id: 'alerts', name: 'Alerts', icon: BellIcon },
            { id: 'analytics', name: 'Analytics', icon: ChartPieIcon },
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
              <p className="text-sm font-medium text-gray-600">Compliance Score</p>
              <p className="text-2xl font-bold text-green-600">{stats.complianceScore.toFixed(1)}%</p>
              <p className="text-sm text-green-600 flex items-center mt-1">
                <ArrowUpIcon className="h-4 w-4 mr-1" />
                +2.3% from last month
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckBadgeIcon className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Rules</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRules}</p>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                Total: {stats.totalRules} rules
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShieldCheckIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{stats.criticalIssues}</p>
              <p className="text-sm text-red-600 flex items-center mt-1">
                Requires immediate attention
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
              <p className="text-sm font-medium text-gray-600">Audit Logs</p>
              <p className="text-2xl font-bold text-gray-900">{stats.auditLogsCount.toLocaleString()}</p>
              <p className="text-sm text-gray-600 flex items-center mt-1">
                Last 30 days
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClipboardDocumentListIcon className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Trend */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Trend</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {stats.complianceTrend.map((data, index) => (
              <div key={data.month} className="flex flex-col items-center flex-1">
                <div
                  className="bg-green-500 rounded-t w-full"
                  style={{ height: `${(data.score / 100) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                <span className="text-xs text-gray-500">{data.score}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Level Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Risk Level Distribution</h3>
          <div className="space-y-3">
            {Object.entries(stats.riskLevelDistribution).map(([level, count]) => (
              <div key={level} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{level}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        level === 'critical' ? 'bg-red-500' :
                        level === 'high' ? 'bg-orange-500' :
                        level === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${(count / 27) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rule Categories */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance by Category</h3>
          <div className="space-y-3">
            {stats.ruleCategories.map((category, index) => (
              <div key={category.category} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{category.category}</span>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${(category.compliant / category.count) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-16 text-right">
                    {category.compliant}/{category.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Department Compliance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Compliance</h3>
          <div className="space-y-3">
            {stats.departmentCompliance.map((dept, index) => (
              <div key={dept.department} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{dept.department}</span>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {dept.score}%
                  </span>
                  <span className="text-xs text-gray-500 w-8 text-right">
                    {dept.issues} issues
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Risks</h3>
          <div className="space-y-3">
            {stats.topRisks.map((risk) => (
              <div key={risk.risk} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{risk.risk}</p>
                  <p className="text-xs text-gray-500">{risk.level} Risk</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{risk.score}</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(risk.level)}`}>
                    {risk.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Audit Activity (7 days)</h3>
          <div className="h-32 flex items-end justify-between space-x-2">
            {stats.auditActivity.map((day) => (
              <div key={day.day} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 rounded-t w-full"
                  style={{ height: `${(day.logs / 150) * 100}px` }}
                ></div>
                <span className="text-xs text-gray-600 mt-2">{day.day}</span>
                <span className="text-xs text-gray-500">{day.logs}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderComplianceRules = () => (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Compliance Rules</h2>
        <button
          onClick={() => {
            setEditingRule(null);
            setShowRuleModal(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          New Rule
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {complianceRules.map((rule) => (
          <div key={rule.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{rule.name}</h3>
                <p className="text-sm text-gray-500">{rule.category}</p>
              </div>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(rule.severity)}`}>
                {rule.severity}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-4 line-clamp-3">{rule.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs text-gray-500">Compliance Rate</p>
                <p className="text-sm font-medium text-green-600">{rule.complianceRate}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Violations</p>
                <p className="text-sm font-medium text-gray-900">{rule.violationCount}</p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(rule.status)}`}>
                {rule.status}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingRule(rule);
                    setShowRuleModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <EyeIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingRule(rule);
                    setShowRuleModal(true);
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
    </div>
  );

  const renderAuditLogs = () => (
    <div className="p-6">
      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search audit logs..."
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Types</option>
                  <option value="User">User</option>
                  <option value="Document">Document</option>
                  <option value="Transaction">Transaction</option>
                  <option value="System">System</option>
                  <option value="Configuration">Configuration</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Result</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Results</option>
                  <option value="Success">Success</option>
                  <option value="Failure">Failure</option>
                  <option value="Warning">Warning</option>
                  <option value="Blocked">Blocked</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
                <select
                  value={riskLevelFilter}
                  onChange={(e) => setRiskLevelFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Levels</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">All Roles</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="User">User</option>
                  <option value="Finance Analyst">Finance Analyst</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === paginatedLogs.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('timestamp')}
                >
                  <div className="flex items-center gap-1">
                    Timestamp
                    {sortBy === 'timestamp' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('userName')}
                >
                  <div className="flex items-center gap-1">
                    User
                    {sortBy === 'userName' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('entityName')}
                >
                  <div className="flex items-center gap-1">
                    Entity
                    {sortBy === 'entityName' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('action')}
                >
                  <div className="flex items-center gap-1">
                    Action
                    {sortBy === 'action' && (
                      sortOrder === 'asc' ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Result
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk Level
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(log.id)}
                      onChange={() => handleSelectItem(log.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(log.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-sm text-gray-500">{log.userRole}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.entityName}</div>
                      <div className="text-sm text-gray-500">{log.entityType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{log.action}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(log.result)}`}>
                      {log.result}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(log.riskLevel)}`}>
                      {log.riskLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setEditingLog(log);
                          setShowLogModal(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingLog(log);
                          setShowLogModal(true);
                        }}
                        className="text-gray-600 hover:text-gray-900"
                        title="Export"
                      >
                        <DocumentArrowDownIcon className="h-4 w-4" />
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
                    {Math.min(currentPage * itemsPerPage, sortedLogs.length)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium">{sortedLogs.length}</span>
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
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'compliance-rules':
        return renderComplianceRules();
      case 'audit-logs':
        return renderAuditLogs();
      case 'reports':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Compliance Reports</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Reporting</h3>
              <p className="text-gray-600">Generate comprehensive compliance reports and audit documentation.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Report
              </button>
            </div>
          </div>
        );
      case 'risk-assessment':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Risk Assessment</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Management</h3>
              <p className="text-gray-600">Assess and manage organizational risks and compliance gaps.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                New Assessment
              </button>
            </div>
          </div>
        );
      case 'policies':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Policy Management</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <DocumentIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Corporate Policies</h3>
              <p className="text-gray-600">Manage company policies, procedures, and compliance guidelines.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Create Policy
              </button>
            </div>
          </div>
        );
      case 'alerts':
        return (
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Alerts & Notifications</h2>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Alerts</h3>
              <p className="text-gray-600">Monitor compliance alerts and violation notifications.</p>
              <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Configure Alerts
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Comprehensive compliance performance analysis.</p>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <ChartBarIcon className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Risk Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Risk assessment and trend analysis.</p>
                <button className="text-green-600 hover:text-green-800 text-sm font-medium">
                  View Analytics →
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <ClipboardDocumentListIcon className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Audit Analytics</h3>
                <p className="text-gray-600 text-sm mb-4">Audit trail analysis and security monitoring.</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Compliance Settings</h3>
              <p className="text-gray-600">Configure compliance rules, audit settings, and automation.</p>
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

      {/* Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingRule ? 'Edit Compliance Rule' : 'Create New Compliance Rule'}
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <ShieldCheckIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Compliance rule creation/editing interface would be implemented here</p>
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

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Audit Log Details
              </h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8">
                <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Audit log details view would be implemented here</p>
                <button
                  onClick={() => {
                    setShowLogModal(false);
                    setEditingLog(null);
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
                <p className="text-gray-600">Advanced compliance analytics dashboard would be implemented here</p>
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

export default ComplianceAuditTrail;