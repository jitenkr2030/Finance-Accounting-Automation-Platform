'use client';

import React, { useState, useEffect } from 'react';
import {
  DocumentTextIcon,
  PhotoIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  PrinterIcon,
  CloudArrowUpIcon,
  DocumentMagnifyingGlassIcon,
  SparklesIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon,
  ChartPieIcon,
  CogIcon,
  ShieldCheckIcon,
  DocumentDuplicateIcon,
  ArchiveBoxIcon,
  FolderIcon,
  TagIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  LockClosedIcon
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

interface Document {
  id: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  processedDate?: string;
  category: 'invoice' | 'receipt' | 'bank_statement' | 'tax_document' | 'contract' | 'report' | 'other';
  subcategory?: string;
  status: 'uploaded' | 'processing' | 'processed' | 'verified' | 'archived' | 'error';
  confidence: number;
  ocrData: {
    extractedText: string;
    keyValuePairs: { [key: string]: string };
    tables: any[];
    signatures: { detected: boolean; confidence: number; locations: any[] }[];
    stamps: { detected: boolean; confidence: number; locations: any[] }[];
    barcodes: { type: string; value: string; confidence: number }[];
    language: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
  };
  metadata: {
    pageCount: number;
    dimensions: { width: number; height: number };
    colorMode: 'color' | 'grayscale' | 'black_white';
    dpi: number;
    hasText: boolean;
    hasImages: boolean;
    hasTables: boolean;
  };
  tags: string[];
  folderId?: string;
  permissions: {
    view: string[];
    edit: string[];
    delete: string[];
  };
  version: number;
  isFavorite: boolean;
  isArchived: boolean;
  thumbnailUrl: string;
  previewUrl: string;
  downloadUrl: string;
  processedBy: string;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'needs_review';
  verificationNotes?: string;
  verificationDate?: string;
  verifiedBy?: string;
  relatedDocuments: string[];
  extractedData: {
    [key: string]: any;
  };
  processingTime: number;
  aiInsights: {
    summary: string;
    entities: { name: string; type: string; confidence: number }[];
    sentiments: { positive: number; negative: number; neutral: number };
    topics: string[];
    recommendations: string[];
  };
}

interface DocumentFolder {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  color: string;
  icon: string;
  documentCount: number;
  createdDate: string;
  permissions: {
    view: string[];
    edit: string[];
  };
}

interface ProcessingTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  inputFields: {
    name: string;
    type: 'text' | 'number' | 'date' | 'email' | 'phone' | 'currency';
    required: boolean;
    validation?: string;
  }[];
  outputMapping: {
    source: string;
    target: string;
    transformation?: string;
  }[];
  confidence: number;
  isActive: boolean;
  createdDate: string;
  usageCount: number;
}

interface OCREngine {
  id: string;
  name: string;
  type: 'tesseract' | 'google_vision' | 'azure_cognitive' | 'aws_textract' | 'custom';
  status: 'active' | 'inactive' | 'error' | 'maintenance';
  accuracy: number;
  speed: number;
  supportedLanguages: string[];
  cost: number;
  lastUsed: string;
  configuration: {
    [key: string]: any;
  };
}

const DocumentIntelligencePage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'dashboard' | 'documents' | 'folders' | 'processing' | 'engines' | 'analytics'>('dashboard');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [documentFolders, setDocumentFolders] = useState<DocumentFolder[]>([]);
  const [processingTemplates, setProcessingTemplates] = useState<ProcessingTemplate[]>([]);
  const [ocrEngines, setOcrEngines] = useState<OCREngine[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDateRange, setFilterDateRange] = useState<string>('last_30_days');
  const [sortBy, setSortBy] = useState<'uploadDate' | 'fileName' | 'confidence' | 'status'>('uploadDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showEngineModal, setShowEngineModal] = useState(false);

  // Sample data
  useEffect(() => {
    const sampleDocuments: Document[] = [
      {
        id: 'DOC001',
        fileName: 'invoice_abc_corp_2024_156.pdf',
        originalName: 'Invoice_ABC_Corp_2024_156.pdf',
        fileType: 'pdf',
        fileSize: 2048576,
        uploadDate: '2024-10-22T10:30:00Z',
        processedDate: '2024-10-22T10:32:15Z',
        category: 'invoice',
        subcategory: 'vendor_invoice',
        status: 'processed',
        confidence: 96,
        ocrData: {
          extractedText: 'INVOICE ABC Corporation Invoice #: INV-2024-156 Date: October 15, 2024 Bill To: XYZ Company Amount: ₹2,85,000',
          keyValuePairs: {
            'Invoice Number': 'INV-2024-156',
            'Date': '2024-10-15',
            'Vendor': 'ABC Corporation',
            'Amount': '₹2,85,000',
            'Due Date': '2024-11-14',
            'GST Number': '29ABCDE1234F1Z5'
          },
          tables: [
            {
              headers: ['Item', 'Quantity', 'Rate', 'Amount'],
              rows: [
                ['Software License', '1', '₹2,00,000', '₹2,00,000'],
                ['Support Service', '1', '₹85,000', '₹85,000']
              ]
            }
          ],
          signatures: {
            detected: true,
            confidence: 92,
            locations: [{ x: 450, y: 600, width: 120, height: 40 }]
          },
          stamps: {
            detected: true,
            confidence: 88,
            locations: [{ x: 350, y: 580, width: 80, height: 80 }]
          },
          barcodes: [
            { type: 'QR', value: 'INV-2024-156-ABC-CORP', confidence: 95 }
          ],
          language: 'en',
          quality: 'excellent'
        },
        metadata: {
          pageCount: 2,
          dimensions: { width: 595, height: 842 },
          colorMode: 'color',
          dpi: 300,
          hasText: true,
          hasImages: true,
          hasTables: true
        },
        tags: ['invoice', 'vendor', 'software', 'license'],
        permissions: {
          view: ['finance_team', 'accounting'],
          edit: ['finance_manager'],
          delete: ['finance_manager']
        },
        version: 1,
        isFavorite: true,
        isArchived: false,
        thumbnailUrl: '/thumbnails/DOC001_thumb.jpg',
        previewUrl: '/previews/DOC001_preview.pdf',
        downloadUrl: '/downloads/DOC001.pdf',
        processedBy: 'OCR Engine v2.1',
        verificationStatus: 'approved',
        verificationDate: '2024-10-22T11:15:00Z',
        verifiedBy: 'Finance Manager',
        relatedDocuments: ['DOC002', 'DOC005'],
        extractedData: {
          vendor_name: 'ABC Corporation',
          invoice_number: 'INV-2024-156',
          invoice_date: '2024-10-15',
          total_amount: 285000,
          currency: 'INR',
          tax_amount: 51300,
          line_items: [
            { description: 'Software License', quantity: 1, rate: 200000, amount: 200000 },
            { description: 'Support Service', quantity: 1, rate: 85000, amount: 85000 }
          ]
        },
        processingTime: 135,
        aiInsights: {
          summary: 'Invoice from ABC Corporation for software license and support services totaling ₹2,85,000',
          entities: [
            { name: 'ABC Corporation', type: 'ORGANIZATION', confidence: 98 },
            { name: 'INV-2024-156', type: 'IDENTIFIER', confidence: 100 },
            { name: '₹2,85,000', type: 'MONEY', confidence: 95 }
          ],
          sentiments: { positive: 0.1, negative: 0.0, neutral: 0.9 },
          topics: ['software licensing', 'professional services', 'B2B transaction'],
          recommendations: ['Verify vendor details against master data', 'Check GST calculation accuracy', 'Review approval workflow']
        }
      },
      {
        id: 'DOC002',
        fileName: 'receipt_restaurant_lunch_2024_10_20.jpg',
        originalName: 'Receipt_Restaurant_Lunch_2024_10_20.jpg',
        fileType: 'jpg',
        fileSize: 1536000,
        uploadDate: '2024-10-20T14:22:00Z',
        processedDate: '2024-10-20T14:23:45Z',
        category: 'receipt',
        subcategory: 'food_beverage',
        status: 'verified',
        confidence: 89,
        ocrData: {
          extractedText: 'RESTAURANT ABC Grand Hotel Bill No: 1234 Date: 20/10/2024 Time: 13:45 Items: 1. Pasta Carbonara ₹450 2. Caesar Salad ₹380 3. Soft Drink ₹120 Subtotal: ₹950 Tax: ₹95 Total: ₹1045 Payment: Cash',
          keyValuePairs: {
            'Restaurant': 'ABC Grand Hotel',
            'Bill Number': '1234',
            'Date': '2024-10-20',
            'Time': '13:45',
            'Subtotal': '₹950',
            'Tax': '₹95',
            'Total': '₹1,045',
            'Payment Method': 'Cash'
          },
          tables: [],
          signatures: {
            detected: false,
            confidence: 0,
            locations: []
          },
          stamps: {
            detected: false,
            confidence: 0,
            locations: []
          },
          barcodes: [],
          language: 'en',
          quality: 'good'
        },
        metadata: {
          pageCount: 1,
          dimensions: { width: 1080, height: 1920 },
          colorMode: 'color',
          dpi: 300,
          hasText: true,
          hasImages: true,
          hasTables: false
        },
        tags: ['receipt', 'restaurant', 'meal', 'client'],
        permissions: {
          view: ['employee', 'finance_team'],
          edit: ['employee'],
          delete: ['finance_manager']
        },
        version: 1,
        isFavorite: false,
        isArchived: false,
        thumbnailUrl: '/thumbnails/DOC002_thumb.jpg',
        previewUrl: '/previews/DOC002_preview.jpg',
        downloadUrl: '/downloads/DOC002.jpg',
        processedBy: 'OCR Engine v2.1',
        verificationStatus: 'approved',
        verificationDate: '2024-10-20T15:00:00Z',
        verifiedBy: 'Employee',
        relatedDocuments: [],
        extractedData: {
          merchant_name: 'ABC Grand Hotel',
          transaction_date: '2024-10-20',
          transaction_time: '13:45',
          subtotal: 950,
          tax_amount: 95,
          total_amount: 1045,
          payment_method: 'Cash',
          line_items: [
            { description: 'Pasta Carbonara', quantity: 1, unit_price: 450, amount: 450 },
            { description: 'Caesar Salad', quantity: 1, unit_price: 380, amount: 380 },
            { description: 'Soft Drink', quantity: 1, unit_price: 120, amount: 120 }
          ]
        },
        processingTime: 105,
        aiInsights: {
          summary: 'Restaurant receipt from ABC Grand Hotel for business lunch totaling ₹1,045',
          entities: [
            { name: 'ABC Grand Hotel', type: 'ORGANIZATION', confidence: 95 },
            { name: '₹1,045', type: 'MONEY', confidence: 98 },
            { name: '20/10/2024', type: 'DATE', confidence: 100 }
          ],
          sentiments: { positive: 0.3, negative: 0.0, neutral: 0.7 },
          topics: ['business dining', 'client entertainment', 'meal expense'],
          recommendations: ['Eligible for business expense claim', 'Check per diem limits', 'Categorize under client entertainment']
        }
      },
      {
        id: 'DOC003',
        fileName: 'bank_statement_october_2024.pdf',
        originalName: 'Bank_Statement_October_2024.pdf',
        fileType: 'pdf',
        fileSize: 3072000,
        uploadDate: '2024-10-18T09:15:00Z',
        processedDate: '2024-10-18T09:18:30Z',
        category: 'bank_statement',
        subcategory: 'monthly_statement',
        status: 'processed',
        confidence: 94,
        ocrData: {
          extractedText: 'BANK STATEMENT Period: October 2024 Account: Current Account 1234567890 Bank: State Bank of India Opening Balance: ₹45,25,000 Closing Balance: ₹52,15,000',
          keyValuePairs: {
            'Bank': 'State Bank of India',
            'Account Number': '1234567890',
            'Statement Period': 'October 2024',
            'Opening Balance': '₹45,25,000',
            'Closing Balance': '₹52,15,000',
            'Account Type': 'Current Account'
          },
          tables: [
            {
              headers: ['Date', 'Description', 'Cheque No.', 'Debit', 'Credit', 'Balance'],
              rows: [
                ['01/10/2024', 'Opening Balance', '', '', '', '₹45,25,000'],
                ['05/10/2024', 'Client Payment ABC Corp', '', '', '₹28,50,000', '₹73,75,000'],
                ['10/10/2024', 'Salary Payment', '12345', '₹8,50,000', '', '₹65,25,000']
              ]
            }
          ],
          signatures: {
            detected: true,
            confidence: 85,
            locations: [{ x: 400, y: 700, width: 100, height: 30 }]
          },
          stamps: {
            detected: true,
            confidence: 90,
            locations: [{ x: 450, y: 650, width: 60, height: 60 }]
          },
          barcodes: [],
          language: 'en',
          quality: 'excellent'
        },
        metadata: {
          pageCount: 4,
          dimensions: { width: 595, height: 842 },
          colorMode: 'grayscale',
          dpi: 300,
          hasText: true,
          hasImages: false,
          hasTables: true
        },
        tags: ['bank', 'statement', 'october', 'sbi'],
        permissions: {
          view: ['finance_team', 'finance_manager', 'cfo'],
          edit: ['finance_manager'],
          delete: ['cfo']
        },
        version: 1,
        isFavorite: false,
        isArchived: false,
        thumbnailUrl: '/thumbnails/DOC003_thumb.jpg',
        previewUrl: '/previews/DOC003_preview.pdf',
        downloadUrl: '/downloads/DOC003.pdf',
        processedBy: 'OCR Engine v2.1',
        verificationStatus: 'needs_review',
        verificationNotes: 'Please verify opening balance calculation',
        relatedDocuments: [],
        extractedData: {
          bank_name: 'State Bank of India',
          account_number: '1234567890',
          statement_period: 'October 2024',
          opening_balance: 4525000,
          closing_balance: 5215000,
          transaction_count: 45,
          total_credits: 18500000,
          total_debits: 16800000
        },
        processingTime: 210,
        aiInsights: {
          summary: 'Monthly bank statement from SBI showing net credit of ₹6,90,000',
          entities: [
            { name: 'State Bank of India', type: 'ORGANIZATION', confidence: 100 },
            { name: '1234567890', type: 'ACCOUNT', confidence: 100 },
            { name: '₹52,15,000', type: 'MONEY', confidence: 98 }
          ],
          sentiments: { positive: 0.4, negative: 0.1, neutral: 0.5 },
          topics: ['banking', 'cash flow', 'transaction monitoring'],
          recommendations: ['Review large transactions', 'Verify opening balance', 'Check for unusual patterns']
        }
      },
      {
        id: 'DOC004',
        fileName: 'contract_service_agreement_2024.pdf',
        originalName: 'Service_Agreement_2024.pdf',
        fileType: 'pdf',
        fileSize: 1536000,
        uploadDate: '2024-10-15T16:45:00Z',
        processedDate: '2024-10-15T16:47:20Z',
        category: 'contract',
        subcategory: 'service_agreement',
        status: 'processed',
        confidence: 91,
        ocrData: {
          extractedText: 'SERVICE AGREEMENT This Service Agreement is entered into on October 15, 2024 between ABC Services Ltd. and XYZ Company. Term: 12 months Renewal: Auto-renewal Payment Terms: Net 30',
          keyValuePairs: {
            'Contract Date': '2024-10-15',
            'Party 1': 'ABC Services Ltd.',
            'Party 2': 'XYZ Company',
            'Term': '12 months',
            'Renewal': 'Auto-renewal',
            'Payment Terms': 'Net 30'
          },
          tables: [],
          signatures: {
            detected: true,
            confidence: 88,
            locations: [
              { x: 100, y: 650, width: 120, height: 40 },
              { x: 350, y: 650, width: 120, height: 40 }
            ]
          },
          stamps: {
            detected: false,
            confidence: 0,
            locations: []
          },
          barcodes: [],
          language: 'en',
          quality: 'good'
        },
        metadata: {
          pageCount: 8,
          dimensions: { width: 595, height: 842 },
          colorMode: 'color',
          dpi: 300,
          hasText: true,
          hasImages: false,
          hasTables: false
        },
        tags: ['contract', 'service', 'agreement', '2024'],
        permissions: {
          view: ['legal_team', 'finance_manager', 'cfo'],
          edit: ['legal_team'],
          delete: ['cfo']
        },
        version: 1,
        isFavorite: false,
        isArchived: false,
        thumbnailUrl: '/thumbnails/DOC004_thumb.jpg',
        previewUrl: '/previews/DOC004_preview.pdf',
        downloadUrl: '/downloads/DOC004.pdf',
        processedBy: 'OCR Engine v2.1',
        verificationStatus: 'pending',
        relatedDocuments: [],
        extractedData: {
          contract_date: '2024-10-15',
          party_1: 'ABC Services Ltd.',
          party_2: 'XYZ Company',
          contract_term: '12 months',
          renewal_terms: 'Auto-renewal',
          payment_terms: 'Net 30',
          contract_value: 0,
          signatures_count: 2
        },
        processingTime: 140,
        aiInsights: {
          summary: '12-month service agreement between ABC Services Ltd. and XYZ Company with auto-renewal',
          entities: [
            { name: 'ABC Services Ltd.', type: 'ORGANIZATION', confidence: 98 },
            { name: 'XYZ Company', type: 'ORGANIZATION', confidence: 96 },
            { name: '2024-10-15', type: 'DATE', confidence: 100 }
          ],
          sentiments: { positive: 0.6, negative: 0.0, neutral: 0.4 },
          topics: ['service contract', 'business agreement', 'renewable contract'],
          recommendations: ['Set renewal reminder', 'Review contract terms', 'Monitor performance metrics']
        }
      },
      {
        id: 'DOC005',
        fileName: 'tax_document_tds_certificate_q3_2024.pdf',
        originalName: 'TDS_Certificate_Q3_2024.pdf',
        fileType: 'pdf',
        fileSize: 768000,
        uploadDate: '2024-10-12T11:30:00Z',
        processedDate: '2024-10-12T11:31:45Z',
        category: 'tax_document',
        subcategory: 'tds_certificate',
        status: 'verified',
        confidence: 97,
        ocrData: {
          extractedText: 'TDS CERTIFICATE Quarter: Q3 2024 PAN: ABCDE1234F Assessment Year: 2024-25 Total TDS: ₹2,85,000 Certificate No: TDS2024Q3001',
          keyValuePairs: {
            'Quarter': 'Q3 2024',
            'PAN': 'ABCDE1234F',
            'Assessment Year': '2024-25',
            'Total TDS': '₹2,85,000',
            'Certificate Number': 'TDS2024Q3001',
            'Issue Date': '2024-10-12'
          },
          tables: [],
          signatures: {
            detected: true,
            confidence: 94,
            locations: [{ x: 400, y: 550, width: 100, height: 35 }]
          },
          stamps: {
            detected: true,
            confidence: 92,
            locations: [{ x: 450, y: 500, width: 70, height: 70 }]
          },
          barcodes: [],
          language: 'en',
          quality: 'excellent'
        },
        metadata: {
          pageCount: 1,
          dimensions: { width: 595, height: 842 },
          colorMode: 'color',
          dpi: 300,
          hasText: true,
          hasImages: false,
          hasTables: false
        },
        tags: ['tds', 'tax', 'certificate', 'q3', '2024'],
        permissions: {
          view: ['finance_team', 'tax_consultant', 'cfo'],
          edit: ['finance_manager'],
          delete: ['cfo']
        },
        version: 1,
        isFavorite: true,
        isArchived: false,
        thumbnailUrl: '/thumbnails/DOC005_thumb.jpg',
        previewUrl: '/previews/DOC005_preview.pdf',
        downloadUrl: '/downloads/DOC005.pdf',
        processedBy: 'OCR Engine v2.1',
        verificationStatus: 'approved',
        verificationDate: '2024-10-12T14:00:00Z',
        verifiedBy: 'Tax Consultant',
        relatedDocuments: ['DOC001'],
        extractedData: {
          quarter: 'Q3 2024',
          pan_number: 'ABCDE1234F',
          assessment_year: '2024-25',
          total_tds: 285000,
          certificate_number: 'TDS2024Q3001',
          issue_date: '2024-10-12'
        },
        processingTime: 105,
        aiInsights: {
          summary: 'TDS certificate for Q3 2024 showing total TDS of ₹2,85,000',
          entities: [
            { name: 'ABCDE1234F', type: 'TAX_ID', confidence: 100 },
            { name: '₹2,85,000', type: 'MONEY', confidence: 98 },
            { name: 'Q3 2024', type: 'PERIOD', confidence: 100 }
          ],
          sentiments: { positive: 0.2, negative: 0.0, neutral: 0.8 },
          topics: ['tax compliance', 'TDS', 'quarterly filing'],
          recommendations: ['Update tax records', 'Prepare for annual filing', 'Verify with bank records']
        }
      }
    ];

    const sampleDocumentFolders: DocumentFolder[] = [
      {
        id: 'FOLDER001',
        name: 'Invoices',
        description: 'All vendor and client invoices',
        parentId: undefined,
        color: '#3B82F6',
        icon: 'document-text',
        documentCount: 45,
        createdDate: '2024-01-15',
        permissions: {
          view: ['finance_team', 'accounting'],
          edit: ['finance_manager']
        }
      },
      {
        id: 'FOLDER002',
        name: 'Bank Documents',
        description: 'Bank statements and reconciliation documents',
        parentId: undefined,
        color: '#10B981',
        icon: 'bank',
        documentCount: 28,
        createdDate: '2024-01-20',
        permissions: {
          view: ['finance_team', 'cfo'],
          edit: ['finance_manager']
        }
      },
      {
        id: 'FOLDER003',
        name: 'Tax Documents',
        description: 'Tax filings, TDS certificates, and compliance documents',
        parentId: undefined,
        color: '#F59E0B',
        icon: 'tax',
        documentCount: 32,
        createdDate: '2024-02-01',
        permissions: {
          view: ['finance_team', 'tax_consultant', 'cfo'],
          edit: ['finance_manager']
        }
      },
      {
        id: 'FOLDER004',
        name: 'Contracts',
        description: 'Service agreements and legal contracts',
        parentId: undefined,
        color: '#8B5CF6',
        icon: 'contract',
        documentCount: 18,
        createdDate: '2024-02-10',
        permissions: {
          view: ['legal_team', 'finance_manager', 'cfo'],
          edit: ['legal_team']
        }
      }
    ];

    const sampleProcessingTemplates: ProcessingTemplate[] = [
      {
        id: 'TEMPLATE001',
        name: 'Standard Invoice Processing',
        description: 'Extract key information from vendor invoices',
        category: 'invoice',
        inputFields: [
          { name: 'vendor_name', type: 'text', required: true },
          { name: 'invoice_number', type: 'text', required: true },
          { name: 'invoice_date', type: 'date', required: true },
          { name: 'total_amount', type: 'currency', required: true },
          { name: 'due_date', type: 'date', required: false }
        ],
        outputMapping: [
          { source: 'extracted_text', target: 'invoice_data', transformation: 'parse_invoice' },
          { source: 'tables', target: 'line_items', transformation: 'extract_line_items' }
        ],
        confidence: 94,
        isActive: true,
        createdDate: '2024-01-10',
        usageCount: 156
      },
      {
        id: 'TEMPLATE002',
        name: 'Receipt Processing',
        description: 'Extract transaction details from expense receipts',
        category: 'receipt',
        inputFields: [
          { name: 'merchant_name', type: 'text', required: true },
          { name: 'transaction_date', type: 'date', required: true },
          { name: 'total_amount', type: 'currency', required: true },
          { name: 'payment_method', type: 'text', required: false }
        ],
        outputMapping: [
          { source: 'extracted_text', target: 'receipt_data', transformation: 'parse_receipt' },
          { source: 'key_value_pairs', target: 'transaction_details', transformation: 'extract_details' }
        ],
        confidence: 89,
        isActive: true,
        createdDate: '2024-01-15',
        usageCount: 234
      },
      {
        id: 'TEMPLATE003',
        name: 'Bank Statement Processing',
        description: 'Extract transaction data from bank statements',
        category: 'bank_statement',
        inputFields: [
          { name: 'account_number', type: 'text', required: true },
          { name: 'statement_period', type: 'text', required: true },
          { name: 'opening_balance', type: 'currency', required: true },
          { name: 'closing_balance', type: 'currency', required: true }
        ],
        outputMapping: [
          { source: 'tables', target: 'transactions', transformation: 'extract_transactions' },
          { source: 'extracted_text', target: 'account_info', transformation: 'parse_account' }
        ],
        confidence: 91,
        isActive: true,
        createdDate: '2024-01-20',
        usageCount: 89
      }
    ];

    const sampleOCREngines: OCREngine[] = [
      {
        id: 'ENGINE001',
        name: 'Google Cloud Vision',
        type: 'google_vision',
        status: 'active',
        accuracy: 96,
        speed: 85,
        supportedLanguages: ['en', 'hi', 'es', 'fr', 'de', 'zh', 'ja'],
        cost: 0.0015,
        lastUsed: '2024-10-22T10:32:15Z',
        configuration: {
          languageHints: ['en'],
          detectOrientation: true,
          detectLabels: true,
          detectText: true
        }
      },
      {
        id: 'ENGINE002',
        name: 'Azure Cognitive Services',
        type: 'azure_cognitive',
        status: 'active',
        accuracy: 94,
        speed: 78,
        supportedLanguages: ['en', 'hi', 'es', 'fr', 'de'],
        cost: 0.001,
        lastUsed: '2024-10-21T15:45:30Z',
        configuration: {
          language: 'en',
          detectOrientation: true,
          readingOrder: 'basic',
          pages: '1'
        }
      },
      {
        id: 'ENGINE003',
        name: 'AWS Textract',
        type: 'aws_textract',
        status: 'active',
        accuracy: 93,
        speed: 72,
        supportedLanguages: ['en', 'es', 'fr', 'de'],
        cost: 0.0012,
        lastUsed: '2024-10-20T09:15:00Z',
        configuration: {
          featureTypes: ['TABLES', 'FORMS'],
          languageCode: 'en'
        }
      },
      {
        id: 'ENGINE004',
        name: 'Tesseract OCR',
        type: 'tesseract',
        status: 'active',
        accuracy: 88,
        speed: 65,
        supportedLanguages: ['en', 'hi'],
        cost: 0,
        lastUsed: '2024-10-19T14:20:00Z',
        configuration: {
          lang: 'eng',
          oem: 3,
          psm: 6
        }
      }
    ];

    setTimeout(() => {
      setDocuments(sampleDocuments);
      setDocumentFolders(sampleDocumentFolders);
      setProcessingTemplates(sampleProcessingTemplates);
      setOcrEngines(sampleOCREngines);
      setFilteredDocuments(sampleDocuments);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...documents];

    // Folder filter
    if (selectedFolder !== 'all') {
      filtered = filtered.filter(doc => doc.folderId === selectedFolder);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.ocrData.extractedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(doc => doc.category === filterCategory);
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(doc => doc.status === filterStatus);
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
      
      filtered = filtered.filter(doc => new Date(doc.uploadDate) >= filterDate);
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'uploadDate':
          aValue = new Date(a.uploadDate);
          bValue = new Date(b.uploadDate);
          break;
        case 'fileName':
          aValue = a.fileName.toLowerCase();
          bValue = b.fileName.toLowerCase();
          break;
        case 'confidence':
          aValue = a.confidence;
          bValue = b.confidence;
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

    setFilteredDocuments(filtered);
  }, [documents, selectedFolder, searchTerm, filterCategory, filterStatus, filterDateRange, sortBy, sortOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <ClockIcon className="h-5 w-5 text-blue-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'uploaded':
        return <CloudArrowUpIcon className="h-5 w-5 text-gray-500" />;
      case 'archived':
        return <ArchiveBoxIcon className="h-5 w-5 text-orange-500" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processed':
      case 'verified':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'processing':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'error':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'uploaded':
        return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'archived':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'invoice':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'receipt':
        return <PhotoIcon className="h-5 w-5" />;
      case 'bank_statement':
        return <DocumentMagnifyingGlassIcon className="h-5 w-5" />;
      case 'tax_document':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'contract':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'report':
        return <ChartPieIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'needs_review':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (number: number) => {
    return new Intl.NumberFormat('en-IN').format(number);
  };

  // Dashboard analytics
  const dashboardAnalytics = {
    documentStatus: {
      labels: ['Processed', 'Processing', 'Verified', 'Error', 'Archived'],
      datasets: [{
        data: [125, 8, 45, 3, 12],
        backgroundColor: ['#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#F59E0B'],
        borderWidth: 0
      }]
    },
    categoryDistribution: {
      labels: ['Invoice', 'Receipt', 'Bank Statement', 'Tax Document', 'Contract', 'Other'],
      datasets: [{
        data: [45, 32, 28, 32, 18, 38],
        backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'],
        borderWidth: 0
      }]
    },
    processingTrends: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Documents Processed',
          data: [45, 52, 48, 61, 55, 73, 68, 85, 78, 92],
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Average Confidence',
          data: [89, 91, 88, 93, 92, 94, 91, 95, 93, 96],
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    ocrEnginePerformance: {
      labels: ['Google Vision', 'Azure Cognitive', 'AWS Textract', 'Tesseract'],
      datasets: [
        {
          label: 'Accuracy %',
          data: [96, 94, 93, 88],
          backgroundColor: '#3B82F6'
        },
        {
          label: 'Speed %',
          data: [85, 78, 72, 65],
          backgroundColor: '#10B981'
        }
      ]
    }
  };

  const totalDocuments = documents.length;
  const processedDocuments = documents.filter(d => d.status === 'processed' || d.status === 'verified').length;
  const averageConfidence = documents.reduce((sum, doc) => sum + doc.confidence, 0) / documents.length;
  const totalStorage = documents.reduce((sum, doc) => sum + doc.fileSize, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading document intelligence platform...</p>
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
                <DocumentMagnifyingGlassIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Document Intelligence & OCR</h1>
                <p className="text-gray-600 mt-1">AI-powered document processing and intelligent data extraction</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowProcessingModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <SparklesIcon className="h-5 w-5" />
                <span>AI Processing</span>
              </button>
              <button
                onClick={() => setShowEngineModal(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <CogIcon className="h-5 w-5" />
                <span>OCR Engines</span>
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <PlusIcon className="h-5 w-5" />
                <span>Upload Document</span>
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
              { key: 'documents', label: 'Documents', icon: DocumentTextIcon },
              { key: 'folders', label: 'Folders', icon: FolderIcon },
              { key: 'processing', label: 'Processing', icon: SparklesIcon },
              { key: 'engines', label: 'OCR Engines', icon: CogIcon },
              { key: 'analytics', label: 'Analytics', icon: ChartPieIcon }
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
                    <p className="text-sm font-medium text-gray-600">Total Documents</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(totalDocuments)}</p>
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
                    <p className="text-sm font-medium text-gray-600">Processed</p>
                    <p className="text-2xl font-bold text-gray-900">{formatNumber(processedDocuments)}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">{((processedDocuments / totalDocuments) * 100).toFixed(1)}%</span>
                  <span className="text-gray-600 ml-2">completion rate</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Confidence</p>
                    <p className="text-2xl font-bold text-gray-900">{averageConfidence.toFixed(1)}%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <SparklesIcon className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-green-600 font-medium">+2.3%</span>
                  <span className="text-gray-600 ml-2">improvement</span>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg hover:shadow-xl transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Storage Used</p>
                    <p className="text-2xl font-bold text-gray-900">{formatFileSize(totalStorage)}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-xl">
                    <ArchiveBoxIcon className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
                <div className="mt-4 flex items-center text-sm">
                  <span className="text-orange-600 font-medium">85%</span>
                  <span className="text-gray-600 ml-2">of quota</span>
                </div>
              </div>
            </div>

            {/* Analytics Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Document Status */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Status Distribution</h3>
                <div className="h-80">
                  <Doughnut 
                    data={dashboardAnalytics.documentStatus}
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

              {/* Category Distribution */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Categories</h3>
                <div className="h-80">
                  <Pie 
                    data={dashboardAnalytics.categoryDistribution}
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

              {/* Processing Trends */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Trends</h3>
                <div className="h-80">
                  <Line 
                    data={dashboardAnalytics.processingTrends}
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
                          position: 'top'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* OCR Engine Performance */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">OCR Engine Performance</h3>
                <div className="h-80">
                  <Bar 
                    data={dashboardAnalytics.ocrEnginePerformance}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100
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
            </div>

            {/* Recent Documents */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Recently Processed Documents</h3>
              <div className="space-y-4">
                {documents.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/20">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-4 ${
                        doc.status === 'processed' ? 'bg-green-100' :
                        doc.status === 'processing' ? 'bg-blue-100' :
                        doc.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                      }`}>
                        {getCategoryIcon(doc.category)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.fileName}</div>
                        <div className="text-sm text-gray-500 capitalize">{doc.category} • {formatFileSize(doc.fileSize)}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{doc.confidence}% confidence</div>
                        <div className="text-sm text-gray-500">{formatDate(doc.processedDate || doc.uploadDate)}</div>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(doc.status)}`}>
                        {getStatusIcon(doc.status)}
                        <span className="ml-1 capitalize">{doc.status}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Documents View */}
        {viewMode === 'documents' && (
          <>
            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20 shadow-lg">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm w-full lg:w-80"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <select
                    value={selectedFolder}
                    onChange={(e) => setSelectedFolder(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Folders</option>
                    {documentFolders.map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Categories</option>
                    <option value="invoice">Invoice</option>
                    <option value="receipt">Receipt</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="tax_document">Tax Document</option>
                    <option value="contract">Contract</option>
                    <option value="report">Report</option>
                  </select>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="uploaded">Uploaded</option>
                    <option value="processing">Processing</option>
                    <option value="processed">Processed</option>
                    <option value="verified">Verified</option>
                    <option value="error">Error</option>
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

            {/* Documents Table */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Document
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Upload Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Confidence
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Verification
                      </th>
                      <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/30 divide-y divide-gray-200">
                    {filteredDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-white/50 transition-all duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg mr-3">
                              {getCategoryIcon(document.category)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{document.fileName}</div>
                              <div className="text-sm text-gray-500">{document.originalName}</div>
                            </div>
                            {document.isFavorite && (
                              <StarIcon className="h-4 w-4 text-yellow-500 ml-2" />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 capitalize">{document.category.replace('_', ' ')}</div>
                          {document.subcategory && (
                            <div className="text-sm text-gray-500">{document.subcategory.replace('_', ' ')}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatDate(document.uploadDate)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  document.confidence >= 90 ? 'bg-green-500' :
                                  document.confidence >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                                }`}
                                style={{ width: `${document.confidence}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-gray-900">{document.confidence}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(document.status)}`}>
                            {getStatusIcon(document.status)}
                            <span className="ml-1 capitalize">{document.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getVerificationStatusColor(document.verificationStatus)}`}>
                            {document.verificationStatus.replace('_', ' ').charAt(0).toUpperCase() + document.verificationStatus.slice(1).replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => {
                                setSelectedDocument(document);
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-lg hover:bg-blue-100 transition-all duration-200"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900 p-1 rounded-lg hover:bg-green-100 transition-all duration-200">
                              <ArrowDownTrayIcon className="h-4 w-4" />
                            </button>
                            <button className="text-purple-600 hover:text-purple-900 p-1 rounded-lg hover:bg-purple-100 transition-all duration-200">
                              <ShareIcon className="h-4 w-4" />
                            </button>
                            {document.isFavorite ? (
                              <button className="text-yellow-500 hover:text-yellow-600 p-1 rounded-lg hover:bg-yellow-100 transition-all duration-200">
                                <StarIcon className="h-4 w-4" />
                              </button>
                            ) : (
                              <button className="text-gray-400 hover:text-yellow-500 p-1 rounded-lg hover:bg-yellow-100 transition-all duration-200">
                                <StarIcon className="h-4 w-4" />
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
        {viewMode !== 'dashboard' && viewMode !== 'documents' && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
            <div className="text-center py-12">
              <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">{viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View</h3>
              <p className="text-gray-600">This section is ready for development with comprehensive {viewMode} management features.</p>
            </div>
          </div>
        )}

        {/* Pagination */}
        {viewMode === 'documents' && (
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">{filteredDocuments.length}</span> of{' '}
              <span className="font-medium">{documents.length}</span> documents
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

      {/* Document Detail Modal */}
      {showDetailModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl mr-4">
                    {getCategoryIcon(selectedDocument.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedDocument.fileName}</h2>
                    <p className="text-gray-600">{selectedDocument.category} • {formatFileSize(selectedDocument.fileSize)}</p>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Document Information</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Original Name:</span>
                      <span className="text-sm text-gray-900">{selectedDocument.originalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Upload Date:</span>
                      <span className="text-sm text-gray-900">{formatDate(selectedDocument.uploadDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Processed Date:</span>
                      <span className="text-sm text-gray-900">{selectedDocument.processedDate ? formatDate(selectedDocument.processedDate) : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">File Type:</span>
                      <span className="text-sm text-gray-900 uppercase">{selectedDocument.fileType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">File Size:</span>
                      <span className="text-sm text-gray-900">{formatFileSize(selectedDocument.fileSize)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Pages:</span>
                      <span className="text-sm text-gray-900">{selectedDocument.metadata.pageCount}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(selectedDocument.status)}`}>
                        {getStatusIcon(selectedDocument.status)}
                        <span className="ml-1 capitalize">{selectedDocument.status}</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Confidence Score:</span>
                      <span className="text-sm text-gray-900">{selectedDocument.confidence}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Processing Time:</span>
                      <span className="text-sm text-gray-900">{selectedDocument.processingTime}ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Verification Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getVerificationStatusColor(selectedDocument.verificationStatus)}`}>
                        {selectedDocument.verificationStatus.replace('_', ' ').charAt(0).toUpperCase() + selectedDocument.verificationStatus.slice(1).replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Processed By:</span>
                      <span className="text-sm text-gray-900">{selectedDocument.processedBy}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Text */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Text</h3>
                <div className="bg-gray-50 rounded-xl p-6">
                  <p className="text-sm text-gray-700 leading-relaxed">{selectedDocument.ocrData.extractedText}</p>
                </div>
              </div>

              {/* Key Value Pairs */}
              {Object.keys(selectedDocument.ocrData.keyValuePairs).length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Extracted Data</h3>
                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(selectedDocument.ocrData.keyValuePairs).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">{key}:</span>
                          <span className="text-sm text-gray-900">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insights */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Insights</h3>
                <div className="bg-blue-50 rounded-xl p-6">
                  <p className="text-sm text-gray-700 mb-4">{selectedDocument.aiInsights.summary}</p>
                  
                  {selectedDocument.aiInsights.entities.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Detected Entities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedDocument.aiInsights.entities.map((entity, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                            {entity.name} ({entity.type}) - {entity.confidence}%
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDocument.aiInsights.recommendations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Recommendations:</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        {selectedDocument.aiInsights.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              {selectedDocument.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDocument.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
                        <TagIcon className="h-3 w-3 mr-1" />
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
                <button className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center space-x-2">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <button className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all duration-200 flex items-center space-x-2">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Re-process</span>
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

export default DocumentIntelligencePage;