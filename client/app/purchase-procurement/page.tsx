'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCartIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserIcon,
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
  ClipboardDocumentListIcon,
  TruckIcon,
  CurrencyEuroIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  BanknotesIcon,
  ChartPieIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CogIcon,
  ArchiveBoxIcon,
  StarIcon
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

interface PurchaseRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  requestedBy: string;
  department: string;
  category: 'office_supplies' | 'equipment' | 'software' | 'services' | 'maintenance' | 'travel' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted_to_po' | 'cancelled';
  totalAmount: number;
  currency: string;
  requestedDate: string;
  requiredDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectionReason?: string;
  items: {
    id: string;
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    specifications?: string;
    vendorPreference?: string;
  }[];
  approvalWorkflow: {
    level: number;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    comments?: string;
    date?: string;
  }[];
  attachments: {
    name: string;
    type: string;
    size: number;
    url: string;
  }[];
  notes: string;
  tags: string[];
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
    onTimeDelivery: number;
    qualityRating: number;
    responseTime: number;
    complianceScore: number;
  };
  certifications: string[];
  documents: {
    name: string;
    type: string;
    url: string;
    expiryDate?: string;
  }[];
  preferences: {
    communicationMethod: 'email' | 'phone' | 'portal';
    invoiceFormat: string;
    deliveryPreferences: string;
  };
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId: string;
  vendorName: string;
  purchaseRequestId?: string;
  orderDate: string;
  deliveryDate: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'partially_received' | 'completed' | 'cancelled';
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  items: {
    id: string;
    itemName: string;
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity: number;
    specifications?: string;
  }[];
  terms: {
    deliveryTerms: string;
    paymentTerms: string;
    warrantyTerms?: string;
    penaltyClause?: string;
  };
  approvalWorkflow: {
    level: number;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: string;
  }[];
  attachments: {
    name: string;
    type: string;
    url: string;
  }[];
  tracking: {
    status: string;
    lastUpdate: string;
    updates: {
      date: string;
      status: string;
      notes: string;
      location?: string;
    }[];
  };
  invoiceDetails?: {
    invoiceNumber: string;
    invoiceDate: string;
    invoiceAmount: number;
    receivedDate: string;
  }[];
}

interface Contract {
  id: string;
  contractNumber: string;
  title: string;
  vendorId: string;
  vendorName: string;
  contractType: 'master_service' | 'framework' | 'specific_purchase' | 'maintenance' | 'license';
  startDate: string;
  endDate: string;
  value: number;
  currency: string;
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'renewed';
  description: string;
  scope: string;
  terms: {
    paymentTerms: string;
    deliveryTerms: string;
    warrantyTerms?: string;
    penaltyClause?: string;
    renewalTerms?: string;
  };
  approvals: {
    approver: string;
    role: string;
    status: 'pending' | 'approved' | 'rejected';
    date?: string;
  }[];
  documents: {
    name: string;
    type: string;
    url: string;
    version: string;
  }[];
  milestones: {
    id: string;
    description: string;
    dueDate: string;
    status: 'pending' | 'completed' | 'overdue';
    paymentAmount?: number;
  }[];
  renewals: {
    renewalDate: string;
    newEndDate: string;
    terms?: string;
  }[];
  compliance: {
    insuranceRequired: boolean;
    insuranceDetails?: string;
    certifications: string[];
    auditRequirements: string[];
  };
}

const PurchaseProcurementPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'requests' | 'vendors' | 'orders' | 'contracts' | 'analytics'>('dashboard');
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PurchaseRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'requestedDate' | 'totalAmount' | 'status' | 'priority'>('requestedDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAddRequestModal, setShowAddRequestModal] = useState(false);
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [showAddOrderModal, setShowAddOrderModal] = useState(false);
  const [showAddContractModal, setShowAddContractModal] = useState(false);

  // Sample data
  useEffect(() => {
    const samplePurchaseRequests: PurchaseRequest[] = [
      {
        id: 'PR001',
        requestNumber: 'PR-2024-001',
        title: 'Office Furniture Purchase',
        description: 'Purchase of ergonomic office chairs and desks for new employee onboarding',
        requestedBy: 'John Smith',
        department: 'Human Resources',
        category: 'office_supplies',
        priority: 'medium',
        status: 'approved',
        totalAmount: 125000,
        currency: 'INR',
        requestedDate: '2024-10-20',
        requiredDate: '2024-11-15',
        approvedBy: 'Sarah Johnson',
        approvedDate: '2024-10-22',
        items: [
          {
            id: 'ITEM001',
            itemName: 'Ergonomic Office Chair',
            description: 'High-back ergonomic chair with lumbar support',
            quantity: 10,
            unitPrice: 8000,
            totalPrice: 80000,
            specifications: 'Adjustable height, armrests, mesh back'
          },
          {
            id: 'ITEM002',
            itemName: 'Standing Desk',
            description: 'Electric height-adjustable standing desk',
            quantity: 10,
            unitPrice: 4500,
            totalPrice: 45000,
            specifications: '120cm x 60cm, memory presets, cable management'
          }
        ],
        approvalWorkflow: [
          {
            level: 1,
            approver: 'Department Head',
            status: 'approved',
            comments: 'Approved for Q4 hiring needs',
            date: '2024-10-21'
          },
          {
            level: 2,
            approver: 'Finance Manager',
            status: 'approved',
            comments: 'Budget approved',
            date: '2024-10-22'
          }
        ],
        attachments: [
          {
            name: 'Requirements_Specification.pdf',
            type: 'pdf',
            size: 512000,
            url: '/documents/PR001_Requirements.pdf'
          }
        ],
        notes: 'Priority for new hire onboarding scheduled for November',
        tags: ['furniture', 'office', 'ergonomic', 'new_hires']
      },
      {
        id: 'PR002',
        requestNumber: 'PR-2024-002',
        title: 'Software License Renewal',
        description: 'Annual renewal of Microsoft Office 365 and Adobe Creative Suite licenses',
        requestedBy: 'Mike Chen',
        department: 'IT',
        category: 'software',
        priority: 'high',
        status: 'converted_to_po',
        totalAmount: 285000,
        currency: 'INR',
        requestedDate: '2024-10-18',
        requiredDate: '2024-11-01',
        approvedBy: 'David Wilson',
        approvedDate: '2024-10-19',
        items: [
          {
            id: 'ITEM003',
            itemName: 'Microsoft Office 365 Business Premium',
            description: 'Annual subscription for 50 users',
            quantity: 50,
            unitPrice: 3200,
            totalPrice: 160000,
            specifications: 'Business Premium plan, annual billing'
          },
          {
            id: 'ITEM004',
            itemName: 'Adobe Creative Cloud for Teams',
            description: 'Annual subscription for design team',
            quantity: 15,
            unitPrice: 8333,
            totalPrice: 125000,
            specifications: 'All apps plan, annual commitment'
          }
        ],
        approvalWorkflow: [
          {
            level: 1,
            approver: 'IT Director',
            status: 'approved',
            comments: 'Critical for operations',
            date: '2024-10-19'
          },
          {
            level: 2,
            approver: 'Finance Manager',
            status: 'approved',
            comments: 'Approved with budget allocation',
            date: '2024-10-19'
          },
          {
            level: 3,
            approver: 'CFO',
            status: 'approved',
            comments: 'Strategic investment approved',
            date: '2024-10-19'
          }
        ],
        attachments: [
          {
            name: 'License_Quote_Adobe.pdf',
            type: 'pdf',
            size: 256000,
            url: '/documents/PR002_Adobe_Quote.pdf'
          },
          {
            name: 'License_Quote_Microsoft.pdf',
            type: 'pdf',
            size: 384000,
            url: '/documents/PR002_Microsoft_Quote.pdf'
          }
        ],
        notes: 'Must renew before expiration to avoid service disruption',
        tags: ['software', 'licenses', 'microsoft', 'adobe', 'renewal']
      },
      {
        id: 'PR003',
        requestNumber: 'PR-2024-003',
        title: 'Marketing Event Setup',
        description: 'Setup and equipment for annual product launch event',
        requestedBy: 'Lisa Rodriguez',
        department: 'Marketing',
        category: 'services',
        priority: 'urgent',
        status: 'submitted',
        totalAmount: 450000,
        currency: 'INR',
        requestedDate: '2024-10-21',
        requiredDate: '2024-11-10',
        items: [
          {
            id: 'ITEM005',
            itemName: 'Event Setup Services',
            description: 'Complete event setup including stage, lighting, and AV equipment',
            quantity: 1,
            unitPrice: 200000,
            totalPrice: 200000,
            specifications: 'Professional setup for 500 attendees'
          },
          {
            id: 'ITEM006',
            itemName: 'Catering Services',
            description: 'Lunch and refreshments for event',
            quantity: 500,
            unitPrice: 500,
            totalPrice: 250000,
            specifications: 'Multi-cuisine lunch, coffee breaks, networking snacks'
          }
        ],
        approvalWorkflow: [
          {
            level: 1,
            approver: 'Marketing Director',
            status: 'approved',
            comments: 'Approved for product launch event',
            date: '2024-10-21'
          }
        ],
        attachments: [
          {
            name: 'Event_Proposal.pdf',
            type: 'pdf',
            size: 1024000,
            url: '/documents/PR003_Event_Proposal.pdf'
          }
        ],
        notes: 'Critical for Q4 product launch, event date is November 10th',
        tags: ['marketing', 'event', 'launch', 'catering', 'av_equipment']
      },
      {
        id: 'PR004',
        requestNumber: 'PR-2024-004',
        title: 'IT Infrastructure Upgrade',
        description: 'Server upgrade and network equipment for improved performance',
        requestedBy: 'Alex Kumar',
        department: 'IT',
        category: 'equipment',
        priority: 'high',
        status: 'approved',
        totalAmount: 750000,
        currency: 'INR',
        requestedDate: '2024-10-15',
        requiredDate: '2024-12-31',
        approvedBy: 'David Wilson',
        approvedDate: '2024-10-17',
        items: [
          {
            id: 'ITEM007',
            itemName: 'Dell PowerEdge R750 Server',
            description: 'High-performance server for data center',
            quantity: 2,
            unitPrice: 150000,
            totalPrice: 300000,
            specifications: '2x Intel Xeon, 128GB RAM, 2TB SSD'
          },
          {
            id: 'ITEM008',
            itemName: 'Cisco Catalyst 9300 Switch',
            description: 'Enterprise network switch',
            quantity: 4,
            unitPrice: 85000,
            totalPrice: 340000,
            specifications: '48-port Gigabit Ethernet, PoE+'
          },
          {
            id: 'ITEM009',
            itemName: 'UPS System',
            description: 'Uninterruptible power supply',
            quantity: 2,
            unitPrice: 55000,
            totalPrice: 110000,
            specifications: '10kVA online UPS with battery backup'
          }
        ],
        approvalWorkflow: [
          {
            level: 1,
            approver: 'IT Director',
            status: 'approved',
            comments: 'Infrastructure upgrade approved',
            date: '2024-10-16'
          },
          {
            level: 2,
            approver: 'Finance Manager',
            status: 'approved',
            comments: 'Capital expenditure approved',
            date: '2024-10-17'
          },
          {
            level: 3,
            approver: 'CFO',
            status: 'approved',
            comments: 'Strategic infrastructure investment',
            date: '2024-10-17'
          }
        ],
        attachments: [
          {
            name: 'Technical_Specifications.pdf',
            type: 'pdf',
            size: 768000,
            url: '/documents/PR004_Tech_Specs.pdf'
          },
          {
            name: 'Vendor_Quotes.zip',
            type: 'zip',
            size: 2048000,
            url: '/documents/PR004_Vendor_Quotes.zip'
          }
        ],
        notes: 'Part of FY25 infrastructure modernization plan',
        tags: ['infrastructure', 'server', 'network', 'equipment', 'upgrade']
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
          panNumber: 'ABCDE1234F'
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
          onTimeDelivery: 92,
          qualityRating: 4.3,
          responseTime: 4.5,
          complianceScore: 95
        },
        certifications: ['ISO 9001', 'ISO 14001'],
        documents: [
          {
            name: 'GST Certificate',
            type: 'pdf',
            url: '/documents/Vendor_GST_ABC.pdf'
          },
          {
            name: 'ISO Certification',
            type: 'pdf',
            url: '/documents/Vendor_ISO_ABC.pdf'
          }
        ],
        preferences: {
          communicationMethod: 'email',
          invoiceFormat: 'Digital PDF',
          deliveryPreferences: 'Standard delivery within 7 days'
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
          panNumber: 'FGHIJ5678K'
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
          onTimeDelivery: 98,
          qualityRating: 4.7,
          responseTime: 4.8,
          complianceScore: 98
        },
        certifications: ['Microsoft Partner', 'ISO 27001', 'CMMI Level 5'],
        documents: [
          {
            name: 'Microsoft Partner Certificate',
            type: 'pdf',
            url: '/documents/Vendor_MS_Partner.pdf'
          }
        ],
        preferences: {
          communicationMethod: 'portal',
          invoiceFormat: 'E-invoice via portal',
          deliveryPreferences: 'Instant digital delivery'
        }
      },
      {
        id: 'V003',
        vendorName: 'Premier Events Management',
        vendorCode: 'PREM-EVT-003',
        category: ['Event Management', 'Catering'],
        contactPerson: {
          name: 'Vikram Singh',
          designation: 'Business Development Manager',
          email: 'vikram@premierevents.com',
          phone: '+91-80-44556677'
        },
        address: {
          street: '789, Koramangala',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          postalCode: '560034'
        },
        taxDetails: {
          gstNumber: '29KLMNO9012P3Q4',
          panNumber: 'KLMNO9012P'
        },
        bankDetails: {
          accountNumber: '5555666677',
          accountName: 'Premier Events Management',
          bankName: 'ICICI Bank',
          ifscCode: 'ICIC0001234'
        },
        paymentTerms: 'Net 15',
        creditLimit: 300000,
        rating: 4.2,
        status: 'active',
        registrationDate: '2019-11-10',
        lastTransactionDate: '2024-09-15',
        performance: {
          onTimeDelivery: 88,
          qualityRating: 4.1,
          responseTime: 4.0,
          complianceScore: 90
        },
        certifications: ['FSSAI License', 'Food Safety Certification'],
        documents: [
          {
            name: 'FSSAI License',
            type: 'pdf',
            url: '/documents/Vendor_FSSAI.pdf'
          }
        ],
        preferences: {
          communicationMethod: 'phone',
          invoiceFormat: 'Digital PDF with photos',
          deliveryPreferences: 'Setup 2 hours before event'
        }
      }
    ];

    const samplePurchaseOrders: PurchaseOrder[] = [
      {
        id: 'PO001',
        poNumber: 'PO-2024-001',
        vendorId: 'V001',
        vendorName: 'ABC Office Solutions Pvt Ltd',
        purchaseRequestId: 'PR001',
        orderDate: '2024-10-23',
        deliveryDate: '2024-11-15',
        status: 'sent',
        totalAmount: 125000,
        currency: 'INR',
        paymentTerms: 'Net 30',
        deliveryAddress: {
          street: 'Company HQ, 1st Floor',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          postalCode: '560001'
        },
        items: [
          {
            id: 'POI001',
            itemName: 'Ergonomic Office Chair',
            description: 'High-back ergonomic chair with lumbar support',
            quantity: 10,
            unitPrice: 8000,
            totalPrice: 80000,
            receivedQuantity: 0
          },
          {
            id: 'POI002',
            itemName: 'Standing Desk',
            description: 'Electric height-adjustable standing desk',
            quantity: 10,
            unitPrice: 4500,
            totalPrice: 45000,
            receivedQuantity: 0
          }
        ],
        terms: {
          deliveryTerms: 'Delivered to site',
          paymentTerms: 'Net 30 from delivery',
          warrantyTerms: '2 years comprehensive warranty'
        },
        approvalWorkflow: [
          {
            level: 1,
            approver: 'Procurement Manager',
            status: 'approved',
            date: '2024-10-23'
          },
          {
            level: 2,
            approver: 'Finance Manager',
            status: 'approved',
            date: '2024-10-23'
          }
        ],
        attachments: [
          {
            name: 'Purchase_Order_PO001.pdf',
            type: 'pdf',
            url: '/documents/PO001.pdf'
          }
        ],
        tracking: {
          status: 'Order Sent to Vendor',
          lastUpdate: '2024-10-23',
          updates: [
            {
              date: '2024-10-23',
              status: 'Order Created',
              notes: 'Purchase order generated and sent to vendor'
            },
            {
              date: '2024-10-23',
              status: 'Order Sent to Vendor',
              notes: 'PO sent via email to vendor'
            }
          ]
        }
      },
      {
        id: 'PO002',
        poNumber: 'PO-2024-002',
        vendorId: 'V002',
        vendorName: 'TechSoft Solutions Ltd',
        purchaseRequestId: 'PR002',
        orderDate: '2024-10-20',
        deliveryDate: '2024-11-01',
        status: 'acknowledged',
        totalAmount: 285000,
        currency: 'INR',
        paymentTerms: 'Net 45',
        deliveryAddress: {
          street: 'IT Department, 3rd Floor',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          postalCode: '560001'
        },
        items: [
          {
            id: 'POI003',
            itemName: 'Microsoft Office 365 Business Premium',
            description: 'Annual subscription for 50 users',
            quantity: 50,
            unitPrice: 3200,
            totalPrice: 160000,
            receivedQuantity: 50
          },
          {
            id: 'POI004',
            itemName: 'Adobe Creative Cloud for Teams',
            description: 'Annual subscription for design team',
            quantity: 15,
            unitPrice: 8333,
            totalPrice: 125000,
            receivedQuantity: 15
          }
        ],
        terms: {
          deliveryTerms: 'Digital delivery via vendor portal',
          paymentTerms: 'Net 45 from invoice date',
          warrantyTerms: 'Full refund if licenses not activated'
        },
        approvalWorkflow: [
          {
            level: 1,
            approver: 'IT Director',
            status: 'approved',
            date: '2024-10-19'
          },
          {
            level: 2,
            approver: 'Finance Manager',
            status: 'approved',
            date: '2024-10-19'
          },
          {
            level: 3,
            approver: 'CFO',
            status: 'approved',
            date: '2024-10-19'
          }
        ],
        attachments: [
          {
            name: 'Purchase_Order_PO002.pdf',
            type: 'pdf',
            url: '/documents/PO002.pdf'
          }
        ],
        tracking: {
          status: 'Order Acknowledged',
          lastUpdate: '2024-10-21',
          updates: [
            {
              date: '2024-10-20',
              status: 'Order Created',
              notes: 'Purchase order generated'
            },
            {
              date: '2024-10-20',
              status: 'Order Sent to Vendor',
              notes: 'PO sent via vendor portal'
            },
            {
              date: '2024-10-21',
              status: 'Order Acknowledged',
              notes: 'Vendor acknowledged and confirmed delivery date'
            }
          ]
        },
        invoiceDetails: [
          {
            invoiceNumber: 'INV-2024-156',
            invoiceDate: '2024-10-21',
            invoiceAmount: 285000,
            receivedDate: '2024-10-21'
          }
        ]
      }
    ];

    const sampleContracts: Contract[] = [
      {
        id: 'C001',
        contractNumber: 'CONT-2024-001',
        title: 'Master Service Agreement - IT Support',
        vendorId: 'V002',
        vendorName: 'TechSoft Solutions Ltd',
        contractType: 'master_service',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        value: 1200000,
        currency: 'INR',
        status: 'active',
        description: 'Comprehensive IT support and maintenance services',
        scope: '24/7 IT helpdesk, system maintenance, software support, hardware support',
        terms: {
          paymentTerms: 'Monthly billing, Net 30',
          deliveryTerms: 'As per SLA terms',
          warrantyTerms: 'Service level guarantees',
          penaltyClause: 'Penalty for SLA breaches',
          renewalTerms: 'Auto-renewal unless terminated 60 days prior'
        },
        approvals: [
          {
            approver: 'IT Director',
            role: 'Technical Approver',
            status: 'approved',
            date: '2023-12-15'
          },
          {
            approver: 'Finance Manager',
            role: 'Financial Approver',
            status: 'approved',
            date: '2023-12-18'
          },
          {
            approver: 'CFO',
            role: 'Executive Approver',
            status: 'approved',
            date: '2023-12-20'
          }
        ],
        documents: [
          {
            name: 'Master_Service_Agreement.pdf',
            type: 'pdf',
            url: '/contracts/CONT-2024-001.pdf',
            version: '1.0'
          },
          {
            name: 'SLA_Document.pdf',
            type: 'pdf',
            url: '/contracts/C001_SLA.pdf',
            version: '1.0'
          }
        ],
        milestones: [
          {
            id: 'M001',
            description: 'Q1 IT Support Services',
            dueDate: '2024-03-31',
            status: 'completed',
            paymentAmount: 300000
          },
          {
            id: 'M002',
            description: 'Q2 IT Support Services',
            dueDate: '2024-06-30',
            status: 'completed',
            paymentAmount: 300000
          },
          {
            id: 'M003',
            description: 'Q3 IT Support Services',
            dueDate: '2024-09-30',
            status: 'completed',
            paymentAmount: 300000
          },
          {
            id: 'M004',
            description: 'Q4 IT Support Services',
            dueDate: '2024-12-31',
            status: 'pending',
            paymentAmount: 300000
          }
        ],
        renewals: [],
        compliance: {
          insuranceRequired: true,
          insuranceDetails: 'Professional indemnity insurance - ₹1 crore coverage',
          certifications: ['ISO 27001', 'CMMI Level 5'],
          auditRequirements: 'Quarterly compliance audit'
        }
      },
      {
        id: 'C002',
        contractNumber: 'CONT-2024-002',
        title: 'Office Supplies Framework Agreement',
        vendorId: 'V001',
        vendorName: 'ABC Office Solutions Pvt Ltd',
        contractType: 'framework',
        startDate: '2024-04-01',
        endDate: '2025-03-31',
        value: 2000000,
        currency: 'INR',
        status: 'active',
        description: 'Framework agreement for office supplies and furniture',
        scope: 'Supply of office furniture, stationery, and equipment as per requirements',
        terms: {
          paymentTerms: 'Net 30 from invoice',
          deliveryTerms: 'Delivery within 7 days of order',
          warrantyTerms: '1 year warranty on furniture',
          penaltyClause: 'Late delivery penalty 1% per week',
          renewalTerms: 'Mutual agreement for renewal'
        },
        approvals: [
          {
            approver: 'Procurement Manager',
            role: 'Procurement Approver',
            status: 'approved',
            date: '2024-03-25'
          },
          {
            approver: 'Finance Manager',
            role: 'Financial Approver',
            status: 'approved',
            date: '2024-03-28'
          },
          {
            approver: 'CFO',
            role: 'Executive Approver',
            status: 'approved',
            date: '2024-03-30'
          }
        ],
        documents: [
          {
            name: 'Framework_Agreement.pdf',
            type: 'pdf',
            url: '/contracts/CONT-2024-002.pdf',
            version: '1.0'
          }
        ],
        milestones: [],
        renewals: [],
        compliance: {
          insuranceRequired: false,
          certifications: ['ISO 9001'],
          auditRequirements: 'Annual vendor audit'
        }
      }
    ];

    setTimeout(() => {
      setPurchaseRequests(samplePurchaseRequests);
      setVendors(sampleVendors);
      setPurchaseOrders(samplePurchaseOrders);
      setContracts(sampleContracts);
      setFilteredRequests(samplePurchaseRequests);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...purchaseRequests];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.requestedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    // Department filter
    if (filterDepartment !== 'all') {
      filtered = filtered.filter(item => item.department === filterDepartment);
    }

    // Priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(item => item.priority === filterPriority);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'requestedDate':
          aValue = new Date(a.requestedDate);
          bValue = new Date(b.requestedDate);
          break;
        case 'totalAmount':
          aValue = a.totalAmount;
          bValue = b.totalAmount;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3, urgent: 4 };
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder];
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder];
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

    setFilteredRequests(filtered);
  }, [purchaseRequests, searchTerm, filterStatus, filterDepartment, filterPriority, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'active':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'submitted':
      case 'sent':
      case 'acknowledged':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'rejected':
      case 'cancelled':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'draft':
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'completed':
      case 'active':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'submitted':
      case 'sent':
      case 'acknowledged':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'rejected':
      case 'cancelled':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'draft':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'converted_to_po':
        return 'text-purple-700 bg-purple-100 border-purple-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'high':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'medium':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'low':
        return 'text-green-700 bg-green-100 border-green-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'office_supplies':
        return <ClipboardDocumentListIcon className="h-5 w-5" />;
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
      default:
        return <ShoppingCartIcon className="h-5 w-5" />;
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

  // Dashboard analytics
  const dashboardAnalytics = {
    requestStatus: {
      labels: ['Approved', 'Submitted', 'Draft', 'Converted to PO'],
      datasets: [{
        data: [2, 1, 0, 1],
        backgroundColor: ['#10B981', '#3B82F6', '#6B7280', '#8B5CF6'],
        borderWidth: 0
      }]
    },
    departmentSpending: {
      labels: ['IT', 'Human Resources', 'Marketing', 'Finance', 'Operations'],
      datasets: [{
        label: 'Spending (₹)',
        data: [1035000, 125000, 450000, 75000, 250000],
        backgroundColor: '#3B82F6'
      }]
    },
    monthlyRequests: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Requests',
          data: [8, 12, 15, 10, 18, 22, 16, 20, 14, 25],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    vendorPerformance: {
      labels: ['ABC Office', 'TechSoft', 'Premier Events', 'Others'],
      datasets: [{
        data: [35, 40, 15, 10],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#6B7280'],
        borderWidth: 0
      }]
    }
  };

  const totalRequests = purchaseRequests.length;
  const approvedRequests = purchaseRequests.filter(r => r.status === 'approved' || r.status === 'converted_to_po').length;
  const totalValue = purchaseRequests.reduce((sum, req) => sum + req.totalAmount, 0);
  const pendingApprovals = purchaseRequests.filter(r => r.status === 'submitted').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading purchase & procurement data...</p>
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
                <ShoppingCartIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Purchase & Procurement</h1>
                <p className="text-gray-600 mt-1">Streamlined procurement workflow and vendor management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAddContractModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <DocumentTextIcon className="h-5 w-5" />
                <span>New Contract</span>
              </button>
              <button
                onClick={() => setShowAddOrderModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <ClipboardDocumentListIcon className="h-5 w-5" />
                <span>Create PO</span>
              </button>
              <button
                onClick={() => setShowAddVendorModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Add Vendor</span>
              </button>
              <button
                onClick={() => setShowAddRequestModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5" />
                <span>New Request</span>
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
              { key: 'requests', label: 'Purchase Requests', icon: ClipboardDocumentListIcon },
              { key: 'vendors', label: 'Vendors', icon: BuildingOfficeIcon },
              { key: 'orders', label: 'Purchase Orders', icon: DocumentTextIcon },
              { key: 'contracts', label: 'Contracts', icon: DocumentTextIcon },
              { key: 'analytics', label: 'Analytics', icon: ChartBarIcon }
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
                    <p className="text-sm font-medium text-gray-600">Total Requests</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalRequests)}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <ClipboardDocumentListIcon className="h-8 w-8 text-blue-600" />
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
                    <p className="text-sm font-medium text-gray-600">Approved</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(approvedRequests)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">{((approvedRequests / totalRequests) * 100).toFixed(1)}%</span>
                  <span className="text-gray-600 ml-2">approval rate</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalValue)}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <CurrencyDollarIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+18.3%</span>
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
                  <span className="text-red-600 font-medium">Needs attention</span>
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Request Status */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Status Distribution</h3>
                <div className="h-80">
                  <Doughnut 
                    data={dashboardAnalytics.requestStatus}
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

              {/* Department Spending */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Spending by Department</h3>
                <div className="h-80">
                  <Bar 
                    data={dashboardAnalytics.departmentSpending}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          ticks: {
                            callback: function(value) {
                              return '₹' + (value / 100000).toFixed(0) + 'L';
                            }
                          }
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

              {/* Monthly Requests */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Request Trends</h3>
                <div className="h-80">
                  <Line 
                    data={dashboardAnalytics.monthlyRequests}
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

              {/* Vendor Performance */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Vendor Distribution</h3>
                <div className="h-80">
                  <Pie 
                    data={dashboardAnalytics.vendorPerformance}
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

            {/* Recent Requests */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Purchase Requests</h3>
              <div className="space-y-4">
                {purchaseRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/20">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg mr-3">
                        {getCategoryIcon(request.category)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{request.requestNumber} - {request.title}</div>
                        <div className="text-sm text-gray-500">{request.department} • {formatCurrency(request.totalAmount)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{formatDate(request.requestedDate)}</div>
                        <div className="text-sm text-gray-500">by {request.requestedBy}</div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                        {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Requests View */}
        {viewMode === 'requests' && (
          <>
            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
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
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="converted_to_po">Converted to PO</option>
                  </select>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Departments</option>
                    <option value="IT">IT</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Operations">Operations</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Request
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-white/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg mr-3">
                              {getCategoryIcon(request.category)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{request.requestNumber}</div>
                              <div className="text-sm text-gray-500">{request.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{request.category.replace('_', ' ')}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.department}</div>
                          <div className="text-sm text-gray-500">by {request.requestedBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(request.totalAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(request.priority)}`}>
                            {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                            {getStatusIcon(request.status)}
                            <span className="ml-1 capitalize">{request.status.replace('_', ' ')}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(request.requestedDate)}</div>
                          <div className="text-sm text-gray-500">Required: {formatDate(request.requiredDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            {request.status === 'draft' && (
                              <button className="text-indigo-600 hover:text-indigo-900 p-1 rounded-lg hover:bg-indigo-100 transition-all duration-200">
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                            {request.status === 'approved' && (
                              <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-100 transition-all duration-200">
                                <ClipboardDocumentListIcon className="h-4 w-4" />
                              </button>
                            )}
                            {request.status === 'submitted' && (
                              <button className="text-orange-600 hover:text-orange-900 p-1 rounded-lg hover:bg-orange-100 transition-all duration-200">
                                <CheckCircleIcon className="h-4 w-4" />
                              </button>
                            )}
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
        {viewMode !== 'dashboard' && viewMode !== 'requests' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="text-center py-12">
              <ShoppingCartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View</h3>
              <p className="text-gray-600">This section is ready for development with comprehensive {viewMode} management features.</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {viewMode === 'requests' && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredRequests.length}</span> of{' '}
              <span className="font-medium">{purchaseRequests.length}</span> requests
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

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl mr-4">
                    {getCategoryIcon(selectedRequest.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.requestNumber}</h2>
                    <p className="text-gray-600">{selectedRequest.title}</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Requested By:</span>
                      <span className="text-sm text-gray-900">{selectedRequest.requestedBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Department:</span>
                      <span className="text-sm text-gray-900">{selectedRequest.department}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Category:</span>
                      <span className="text-sm text-gray-900 capitalize">{selectedRequest.category.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Priority:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(selectedRequest.priority)}`}>
                        {selectedRequest.priority.charAt(0).toUpperCase() + selectedRequest.priority.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedRequest.status)}`}>
                        {getStatusIcon(selectedRequest.status)}
                        <span className="ml-1 capitalize">{selectedRequest.status.replace('_', ' ')}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                      <span className="text-lg font-bold text-gray-900">{formatCurrency(selectedRequest.totalAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Currency:</span>
                      <span className="text-sm text-gray-900">{selectedRequest.currency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Requested Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedRequest.requestedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Required Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedRequest.requiredDate)}</span>
                    </div>
                    {selectedRequest.approvedBy && (
                      <div className="flex justify-between">
                        <span className="text-sm font-medium text-gray-600">Approved By:</span>
                        <span className="text-sm text-gray-900">{selectedRequest.approvedBy}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedRequest.description}</p>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Items</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left text-sm font-medium text-gray-600 pb-3">Item</th>
                          <th className="text-left text-sm font-medium text-gray-600 pb-3">Description</th>
                          <th className="text-right text-sm font-medium text-gray-600 pb-3">Quantity</th>
                          <th className="text-right text-sm font-medium text-gray-600 pb-3">Unit Price</th>
                          <th className="text-right text-sm font-medium text-gray-600 pb-3">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedRequest.items.map((item, index) => (
                          <tr key={item.id} className="border-b border-gray-100">
                            <td className="py-3 text-sm font-medium text-gray-900">{item.itemName}</td>
                            <td className="py-3 text-sm text-gray-600">{item.description}</td>
                            <td className="py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                            <td className="py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                            <td className="py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Approval Workflow */}
              {selectedRequest.approvalWorkflow.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Approval Workflow</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="space-y-4">
                      {selectedRequest.approvalWorkflow.map((approval, index) => (
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
                              <div className="text-sm text-gray-600">{approval.approver}</div>
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

              {/* Tags */}
              {selectedRequest.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRequest.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedRequest.notes && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <p className="text-sm text-gray-700">{selectedRequest.notes}</p>
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
                {selectedRequest.status === 'approved' && (
                  <button className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2">
                    <ClipboardDocumentListIcon className="h-4 w-4" />
                    <span>Create PO</span>
                  </button>
                )}
                {selectedRequest.status === 'draft' && (
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center space-x-2">
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>Submit for Approval</span>
                  </button>
                )}
                {selectedRequest.status === 'submitted' && selectedRequest.approvalWorkflow.every(a => a.status === 'approved') && (
                  <button className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 flex items-center space-x-2">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseProcurementPage;