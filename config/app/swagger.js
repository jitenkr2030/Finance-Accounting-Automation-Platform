const swaggerJSDoc = require('swagger-jsdoc');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Finance & Accounting Automation Platform API',
    version: '1.0.0',
    description: `
# Finance & Accounting Automation Platform

A comprehensive enterprise-grade finance and accounting automation platform with 23 integrated engines for complete financial management.

## Features

### Core Financial Engines
- **General Ledger**: Complete double-entry bookkeeping system
- **GST Management**: Indian GST compliance and filing
- **Billing & Invoicing**: Professional invoice generation and management
- **Payroll Management**: Complete employee payroll processing
- **Expense Management**: Employee expense tracking and reimbursement

### Asset & Inventory Management
- **Inventory Management**: Stock tracking and management
- **Asset Management**: Fixed asset tracking and depreciation
- **Purchase & Procurement**: Purchase order management

### Financial Planning & Analysis
- **Financial Forecasting**: AI-powered financial predictions
- **Budget Management**: Budget planning and variance tracking
- **Cash Flow Management**: Cash flow analysis and forecasting
- **Financial Reporting**: Automated financial statements

### Tax & Compliance
- **Tax Filing**: Tax calculation and filing automation
- **Compliance & Audit Trail**: Regulatory compliance monitoring

### Banking & Reconciliation
- **Bank Reconciliation**: Automated bank statement matching
- **Treasury & Investment Management**: Investment portfolio management

### Accounts Management
- **Accounts Payable**: Vendor bill management
- **Accounts Receivable**: Customer invoice management
- **Document Intelligence**: AI-powered document processing

### Specialized Management
- **Multi-Entity Consolidation**: Multi-company consolidation
- **Contract Management**: Contract lifecycle management
- **Credit & Loan Management**: Loan portfolio management
- **Fixed Deposit & Investment Tracker**: Investment tracking

## Authentication

All API endpoints require authentication using JWT Bearer tokens.

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

## Error Handling

All endpoints return standardized error responses:

\`\`\`json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
\`\`\`

## Rate Limiting

API requests are limited to:
- 1000 requests per hour for authenticated users
- 100 requests per hour for unauthenticated users

## Support

For technical support, contact: support@financeplatform.com
    `,
    contact: {
      name: 'API Support',
      email: 'support@financeplatform.com',
      url: 'https://financeplatform.com/support'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'https://api.financeplatform.com/v1',
      description: 'Production Server'
    },
    {
      url: 'https://staging-api.financeplatform.com/v1',
      description: 'Staging Server'
    },
    {
      url: 'http://localhost:3001/v1',
      description: 'Development Server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      // Authentication Schemas
      User: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique user identifier'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          firstName: {
            type: 'string',
            description: 'User first name'
          },
          lastName: {
            type: 'string',
            description: 'User last name'
          },
          role: {
            type: 'string',
            enum: ['admin', 'accountant', 'manager', 'user'],
            description: 'User role'
          },
          company: {
            $ref: '#/components/schemas/Company'
          },
          isActive: {
            type: 'boolean',
            description: 'User account status'
          },
          lastLogin: {
            type: 'string',
            format: 'date-time',
            description: 'Last login timestamp'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        },
        required: ['email', 'firstName', 'lastName', 'role']
      },
      
      Company: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique company identifier'
          },
          name: {
            type: 'string',
            description: 'Company name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Company email'
          },
          phone: {
            type: 'string',
            description: 'Company phone number'
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              zipCode: { type: 'string' }
            }
          },
          gstNumber: {
            type: 'string',
            description: 'GST registration number'
          },
          panNumber: {
            type: 'string',
            description: 'PAN number'
          },
          cin: {
            type: 'string',
            description: 'Company Identification Number'
          },
          financialYearStart: {
            type: 'string',
            format: 'date',
            description: 'Financial year start date'
          },
          baseCurrency: {
            type: 'string',
            description: 'Base currency code'
          },
          timezone: {
            type: 'string',
            description: 'Company timezone'
          },
          isActive: {
            type: 'boolean',
            description: 'Company status'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        },
        required: ['name', 'email', 'baseCurrency']
      },

      // General Ledger Schemas
      JournalEntry: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique journal entry identifier'
          },
          entryNumber: {
            type: 'string',
            description: 'Auto-generated entry number'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Entry date'
          },
          reference: {
            type: 'string',
            description: 'Reference number or description'
          },
          description: {
            type: 'string',
            description: 'Entry description'
          },
          entries: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                account: {
                  $ref: '#/components/schemas/Account'
                },
                debit: {
                  type: 'number',
                  minimum: 0,
                  description: 'Debit amount'
                },
                credit: {
                  type: 'number',
                  minimum: 0,
                  description: 'Credit amount'
                },
                description: {
                  type: 'string',
                  description: 'Line item description'
                }
              },
              required: ['account', 'debit', 'credit']
            }
          },
          totalDebit: {
            type: 'number',
            description: 'Total debit amount'
          },
          totalCredit: {
            type: 'number',
            description: 'Total credit amount'
          },
          status: {
            type: 'string',
            enum: ['draft', 'posted', 'reversed'],
            description: 'Entry status'
          },
          postedBy: {
            type: 'string',
            description: 'User ID who posted the entry'
          },
          postedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Posting timestamp'
          },
          attachments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                filename: { type: 'string' },
                url: { type: 'string' },
                size: { type: 'number' }
              }
            }
          }
        },
        required: ['date', 'entries', 'totalDebit', 'totalCredit']
      },

      Account: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique account identifier'
          },
          code: {
            type: 'string',
            description: 'Account code'
          },
          name: {
            type: 'string',
            description: 'Account name'
          },
          type: {
            type: 'string',
            enum: ['asset', 'liability', 'equity', 'revenue', 'expense'],
            description: 'Account type'
          },
          subType: {
            type: 'string',
            description: 'Account subtype'
          },
          parent: {
            type: 'string',
            description: 'Parent account ID'
          },
          level: {
            type: 'number',
            description: 'Account hierarchy level'
          },
          isActive: {
            type: 'boolean',
            description: 'Account status'
          },
          currentBalance: {
            type: 'number',
            description: 'Current account balance'
          },
          openingBalance: {
            type: 'number',
            description: 'Opening balance'
          },
          currency: {
            type: 'string',
            description: 'Account currency'
          }
        },
        required: ['code', 'name', 'type']
      },

      // Billing & Invoicing Schemas
      Invoice: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique invoice identifier'
          },
          invoiceNumber: {
            type: 'string',
            description: 'Auto-generated invoice number'
          },
          customer: {
            $ref: '#/components/schemas/Customer'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Invoice date'
          },
          dueDate: {
            type: 'string',
            format: 'date',
            description: 'Due date'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  description: 'Item description'
                },
                quantity: {
                  type: 'number',
                  minimum: 0,
                  description: 'Quantity'
                },
                rate: {
                  type: 'number',
                  minimum: 0,
                  description: 'Unit rate'
                },
                amount: {
                  type: 'number',
                  description: 'Total amount'
                },
                taxRate: {
                  type: 'number',
                  description: 'Tax rate percentage'
                },
                taxAmount: {
                  type: 'number',
                  description: 'Tax amount'
                },
                discount: {
                  type: 'number',
                  default: 0,
                  description: 'Discount amount'
                }
              },
              required: ['description', 'quantity', 'rate', 'amount']
            }
          },
          subtotal: {
            type: 'number',
            description: 'Subtotal before tax'
          },
          taxAmount: {
            type: 'number',
            description: 'Total tax amount'
          },
          discount: {
            type: 'number',
            default: 0,
            description: 'Total discount'
          },
          total: {
            type: 'number',
            description: 'Final total'
          },
          status: {
            type: 'string',
            enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'],
            description: 'Invoice status'
          },
          paymentTerms: {
            type: 'string',
            description: 'Payment terms'
          },
          notes: {
            type: 'string',
            description: 'Additional notes'
          },
          attachments: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                filename: { type: 'string' },
                url: { type: 'string' }
              }
            }
          }
        },
        required: ['customer', 'date', 'items', 'total']
      },

      Customer: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique customer identifier'
          },
          name: {
            type: 'string',
            description: 'Customer name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Customer email'
          },
          phone: {
            type: 'string',
            description: 'Customer phone'
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              zipCode: { type: 'string' }
            }
          },
          gstNumber: {
            type: 'string',
            description: 'Customer GST number'
          },
          taxExempt: {
            type: 'boolean',
            default: false,
            description: 'Tax exemption status'
          },
          creditLimit: {
            type: 'number',
            description: 'Credit limit'
          },
          paymentTerms: {
            type: 'number',
            default: 30,
            description: 'Payment terms in days'
          },
          isActive: {
            type: 'boolean',
            description: 'Customer status'
          }
        },
        required: ['name', 'email']
      },

      // Payroll Management Schemas
      Employee: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique employee identifier'
          },
          employeeId: {
            type: 'string',
            description: 'Employee ID'
          },
          firstName: {
            type: 'string',
            description: 'First name'
          },
          lastName: {
            type: 'string',
            description: 'Last name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address'
          },
          phone: {
            type: 'string',
            description: 'Phone number'
          },
          dateOfBirth: {
            type: 'string',
            format: 'date',
            description: 'Date of birth'
          },
          joiningDate: {
            type: 'string',
            format: 'date',
            description: 'Joining date'
          },
          department: {
            type: 'string',
            description: 'Department'
          },
          designation: {
            type: 'string',
            description: 'Job designation'
          },
          salary: {
            type: 'object',
            properties: {
              basic: {
                type: 'number',
                description: 'Basic salary'
              },
              hra: {
                type: 'number',
                description: 'House Rent Allowance'
              },
              specialAllowance: {
                type: 'number',
                description: 'Special allowance'
              },
              pf: {
                type: 'number',
                description: 'PF contribution'
              },
              esi: {
                type: 'number',
                description: 'ESI contribution'
              }
            },
            required: ['basic']
          },
          bankDetails: {
            type: 'object',
            properties: {
              accountNumber: { type: 'string' },
              ifscCode: { type: 'string' },
              bankName: { type: 'string' }
            }
          },
          taxDetails: {
            type: 'object',
            properties: {
              panNumber: { type: 'string' },
              aadharNumber: { type: 'string' },
              taxSlab: { type: 'string' }
            }
          },
          isActive: {
            type: 'boolean',
            description: 'Employment status'
          }
        },
        required: ['employeeId', 'firstName', 'lastName', 'email', 'salary']
      },

      // GST Management Schemas
      GSTReturn: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique return identifier'
          },
          returnType: {
            type: 'string',
            enum: ['GSTR-1', 'GSTR-3B', 'GSTR-4', 'GSTR-5', 'GSTR-6', 'GSTR-7', 'GSTR-8', 'GSTR-9', 'GSTR-10'],
            description: 'GST return type'
          },
          period: {
            type: 'string',
            description: 'Return period (MMYYYY)'
          },
          filingDate: {
            type: 'string',
            format: 'date',
            description: 'Filing date'
          },
          dueDate: {
            type: 'string',
            format: 'date',
            description: 'Due date'
          },
          status: {
            type: 'string',
            enum: ['draft', 'filed', 'pending', 'accepted', 'rejected'],
            description: 'Return status'
          },
          totalSales: {
            type: 'number',
            description: 'Total sales amount'
          },
          totalPurchases: {
            type: 'number',
            description: 'Total purchase amount'
          },
          totalTax: {
            type: 'number',
            description: 'Total tax amount'
          },
          taxPayable: {
            type: 'number',
            description: 'Tax payable'
          },
          taxRefund: {
            type: 'number',
            description: 'Tax refund'
          },
          summary: {
            type: 'object',
            description: 'Return summary data'
          },
          filedBy: {
            type: 'string',
            description: 'Filed by user ID'
          },
          ARN: {
            type: 'string',
            description: 'Acknowledgment Receipt Number'
          }
        },
        required: ['returnType', 'period', 'status']
      },

      // Expense Management Schemas
      Expense: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique expense identifier'
          },
          expenseNumber: {
            type: 'string',
            description: 'Auto-generated expense number'
          },
          employee: {
            type: 'string',
            description: 'Employee ID'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Expense date'
          },
          category: {
            type: 'string',
            description: 'Expense category'
          },
          description: {
            type: 'string',
            description: 'Expense description'
          },
          amount: {
            type: 'number',
            description: 'Expense amount'
          },
          currency: {
            type: 'string',
            description: 'Currency code'
          },
          vendor: {
            type: 'string',
            description: 'Vendor name'
          },
          paymentMethod: {
            type: 'string',
            enum: ['cash', 'credit_card', 'debit_card', 'bank_transfer', 'cheque'],
            description: 'Payment method'
          },
          receipt: {
            type: 'object',
            properties: {
              filename: { type: 'string' },
              url: { type: 'string' }
            }
          },
          status: {
            type: 'string',
            enum: ['draft', 'submitted', 'approved', 'rejected', 'reimbursed'],
            description: 'Expense status'
          },
          approvedBy: {
            type: 'string',
            description: 'Approved by user ID'
          },
          approvedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Approval timestamp'
          },
          reimbursable: {
            type: 'boolean',
            default: true,
            description: 'Reimbursable status'
          }
        },
        required: ['employee', 'date', 'category', 'amount']
      },

      // Inventory Management Schemas
      InventoryItem: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique item identifier'
          },
          sku: {
            type: 'string',
            description: 'Stock Keeping Unit'
          },
          name: {
            type: 'string',
            description: 'Item name'
          },
          description: {
            type: 'string',
            description: 'Item description'
          },
          category: {
            type: 'string',
            description: 'Item category'
          },
          unit: {
            type: 'string',
            description: 'Unit of measurement'
          },
          unitPrice: {
            type: 'number',
            description: 'Unit price'
          },
          costPrice: {
            type: 'number',
            description: 'Cost price'
          },
          quantity: {
            type: 'number',
            description: 'Current quantity'
          },
          minStock: {
            type: 'number',
            description: 'Minimum stock level'
          },
          maxStock: {
            type: 'number',
            description: 'Maximum stock level'
          },
          location: {
            type: 'string',
            description: 'Storage location'
          },
          supplier: {
            type: 'string',
            description: 'Supplier information'
          },
          isActive: {
            type: 'boolean',
            description: 'Item status'
          }
        },
        required: ['sku', 'name', 'quantity', 'unitPrice']
      },

      // Asset Management Schemas
      Asset: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique asset identifier'
          },
          assetCode: {
            type: 'string',
            description: 'Asset code'
          },
          name: {
            type: 'string',
            description: 'Asset name'
          },
          category: {
            type: 'string',
            enum: ['building', 'machinery', 'furniture', 'vehicle', 'equipment', 'computer', 'software', 'other'],
            description: 'Asset category'
          },
          purchaseDate: {
            type: 'string',
            format: 'date',
            description: 'Purchase date'
          },
          purchaseCost: {
            type: 'number',
            description: 'Purchase cost'
          },
          currentValue: {
            type: 'number',
            description: 'Current book value'
          },
          depreciationMethod: {
            type: 'string',
            enum: ['straight_line', 'declining_balance', 'sum_of_years'],
            description: 'Depreciation method'
          },
          usefulLife: {
            type: 'number',
            description: 'Useful life in years'
          },
          salvageValue: {
            type: 'number',
            description: 'Salvage value'
          },
          location: {
            type: 'string',
            description: 'Asset location'
          },
          assignedTo: {
            type: 'string',
            description: 'Assigned employee ID'
          },
          status: {
            type: 'string',
            enum: ['active', 'disposed', 'under_maintenance', 'retired'],
            description: 'Asset status'
          }
        },
        required: ['assetCode', 'name', 'category', 'purchaseDate', 'purchaseCost']
      },

      // Financial Forecasting Schemas
      Forecast: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique forecast identifier'
          },
          name: {
            type: 'string',
            description: 'Forecast name'
          },
          type: {
            type: 'string',
            enum: ['revenue', 'expense', 'cash_flow', 'profit', 'balance_sheet'],
            description: 'Forecast type'
          },
          period: {
            type: 'string',
            description: 'Forecast period'
          },
          startDate: {
            type: 'string',
            format: 'date',
            description: 'Start date'
          },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'End date'
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                period: { type: 'string' },
                predicted: { type: 'number' },
                actual: { type: 'number' },
                variance: { type: 'number' }
              }
            }
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Forecast confidence percentage'
          },
          model: {
            type: 'string',
            description: 'AI model used'
          },
          status: {
            type: 'string',
            enum: ['draft', 'active', 'archived'],
            description: 'Forecast status'
          }
        },
        required: ['name', 'type', 'period', 'startDate', 'endDate']
      },

      // Budget Management Schemas
      Budget: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique budget identifier'
          },
          name: {
            type: 'string',
            description: 'Budget name'
          },
          fiscalYear: {
            type: 'string',
            description: 'Fiscal year'
          },
          department: {
            type: 'string',
            description: 'Department'
          },
          category: {
            type: 'string',
            description: 'Budget category'
          },
          period: {
            type: 'string',
            enum: ['monthly', 'quarterly', 'annually'],
            description: 'Budget period'
          },
          plannedAmount: {
            type: 'number',
            description: 'Planned budget amount'
          },
          actualAmount: {
            type: 'number',
            description: 'Actual spent amount'
          },
          variance: {
            type: 'number',
            description: 'Budget variance'
          },
          variancePercentage: {
            type: 'number',
            description: 'Variance percentage'
          },
          status: {
            type: 'string',
            enum: ['draft', 'approved', 'active', 'completed'],
            description: 'Budget status'
          },
          createdBy: {
            type: 'string',
            description: 'Created by user ID'
          }
        },
        required: ['name', 'fiscalYear', 'plannedAmount']
      },

      // Cash Flow Management Schemas
      CashFlow: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique cash flow identifier'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Transaction date'
          },
          type: {
            type: 'string',
            enum: ['inflow', 'outflow'],
            description: 'Cash flow type'
          },
          category: {
            type: 'string',
            enum: ['operating', 'investing', 'financing'],
            description: 'Cash flow category'
          },
          description: {
            type: 'string',
            description: 'Transaction description'
          },
          amount: {
            type: 'number',
            description: 'Transaction amount'
          },
          reference: {
            type: 'string',
            description: 'Reference number'
          },
          account: {
            type: 'string',
            description: 'Account ID'
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'reversed'],
            description: 'Transaction status'
          }
        },
        required: ['date', 'type', 'category', 'amount']
      },

      // Tax Filing Schemas
      TaxReturn: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique tax return identifier'
          },
          taxYear: {
            type: 'string',
            description: 'Tax year'
          },
          returnType: {
            type: 'string',
            enum: ['income_tax', 'corporate_tax', 'gst', 'tds', 'other'],
            description: 'Tax return type'
          },
          filingDate: {
            type: 'string',
            format: 'date',
            description: 'Filing date'
          },
          dueDate: {
            type: 'string',
            format: 'date',
            description: 'Due date'
          },
          totalIncome: {
            type: 'number',
            description: 'Total income'
          },
          totalDeductions: {
            type: 'number',
            description: 'Total deductions'
          },
          taxLiability: {
            type: 'number',
            description: 'Tax liability'
          },
          taxPaid: {
            type: 'number',
            description: 'Tax already paid'
          },
          refundDue: {
            type: 'number',
            description: 'Refund due'
          },
          status: {
            type: 'string',
            enum: ['draft', 'filed', 'processed', 'accepted', 'rejected'],
            description: 'Return status'
          },
          acknowledgmentNumber: {
            type: 'string',
            description: 'Acknowledgment number'
          }
        },
        required: ['taxYear', 'returnType', 'totalIncome', 'taxLiability']
      },

      // Financial Reporting Schemas
      FinancialReport: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique report identifier'
          },
          name: {
            type: 'string',
            description: 'Report name'
          },
          type: {
            type: 'string',
            enum: ['balance_sheet', 'profit_loss', 'cash_flow', 'trial_balance', 'general_ledger', 'accounts_receivable', 'accounts_payable'],
            description: 'Report type'
          },
          period: {
            type: 'object',
            properties: {
              startDate: { type: 'string', format: 'date' },
              endDate: { type: 'string', format: 'date' }
            }
          },
          data: {
            type: 'object',
            description: 'Report data'
          },
          format: {
            type: 'string',
            enum: ['pdf', 'excel', 'csv'],
            description: 'Export format'
          },
          status: {
            type: 'string',
            enum: ['generating', 'completed', 'failed'],
            description: 'Report status'
          },
          generatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Generation timestamp'
          },
          generatedBy: {
            type: 'string',
            description: 'Generated by user ID'
          }
        },
        required: ['name', 'type', 'period']
      },

      // Bank Reconciliation Schemas
      BankTransaction: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique transaction identifier'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Transaction date'
          },
          description: {
            type: 'string',
            description: 'Transaction description'
          },
          reference: {
            type: 'string',
            description: 'Reference number'
          },
          amount: {
            type: 'number',
            description: 'Transaction amount'
          },
          type: {
            type: 'string',
            enum: ['debit', 'credit'],
            description: 'Transaction type'
          },
          balance: {
            type: 'number',
            description: 'Running balance'
          },
          matched: {
            type: 'boolean',
            default: false,
            description: 'Matching status'
          },
          matchedEntry: {
            type: 'string',
            description: 'Matched journal entry ID'
          },
          bankAccount: {
            type: 'string',
            description: 'Bank account ID'
          }
        },
        required: ['date', 'description', 'amount', 'type']
      },

      // Document Intelligence Schemas
      Document: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique document identifier'
          },
          filename: {
            type: 'string',
            description: 'Original filename'
          },
          mimeType: {
            type: 'string',
            description: 'MIME type'
          },
          size: {
            type: 'number',
            description: 'File size in bytes'
          },
          url: {
            type: 'string',
            description: 'Document URL'
          },
          type: {
            type: 'string',
            enum: ['invoice', 'receipt', 'bank_statement', 'tax_document', 'contract', 'other'],
            description: 'Document type'
          },
          extractedData: {
            type: 'object',
            description: 'AI extracted data'
          },
          confidence: {
            type: 'number',
            minimum: 0,
            maximum: 100,
            description: 'Extraction confidence'
          },
          processed: {
            type: 'boolean',
            default: false,
            description: 'Processing status'
          },
          uploadedBy: {
            type: 'string',
            description: 'Uploaded by user ID'
          },
          uploadedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Upload timestamp'
          }
        },
        required: ['filename', 'type', 'url']
      },

      // Purchase & Procurement Schemas
      PurchaseOrder: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique purchase order identifier'
          },
          poNumber: {
            type: 'string',
            description: 'Purchase order number'
          },
          supplier: {
            $ref: '#/components/schemas/Supplier'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'PO date'
          },
          deliveryDate: {
            type: 'string',
            format: 'date',
            description: 'Expected delivery date'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                item: {
                  $ref: '#/components/schemas/InventoryItem'
                },
                quantity: {
                  type: 'number',
                  description: 'Ordered quantity'
                },
                rate: {
                  type: 'number',
                  description: 'Unit rate'
                },
                amount: {
                  type: 'number',
                  description: 'Total amount'
                }
              },
              required: ['quantity', 'rate', 'amount']
            }
          },
          subtotal: {
            type: 'number',
            description: 'Subtotal'
          },
          taxAmount: {
            type: 'number',
            description: 'Tax amount'
          },
          total: {
            type: 'number',
            description: 'Total amount'
          },
          status: {
            type: 'string',
            enum: ['draft', 'sent', 'acknowledged', 'partially_received', 'received', 'cancelled'],
            description: 'PO status'
          },
          terms: {
            type: 'string',
            description: 'Terms and conditions'
          }
        },
        required: ['supplier', 'date', 'items', 'total']
      },

      Supplier: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique supplier identifier'
          },
          name: {
            type: 'string',
            description: 'Supplier name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address'
          },
          phone: {
            type: 'string',
            description: 'Phone number'
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              zipCode: { type: 'string' }
            }
          },
          gstNumber: {
            type: 'string',
            description: 'GST number'
          },
          paymentTerms: {
            type: 'number',
            default: 30,
            description: 'Payment terms in days'
          },
          creditLimit: {
            type: 'number',
            description: 'Credit limit'
          },
          isActive: {
            type: 'boolean',
            description: 'Supplier status'
          }
        },
        required: ['name', 'email']
      },

      // Accounts Payable Schemas
      Bill: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique bill identifier'
          },
          billNumber: {
            type: 'string',
            description: 'Bill number'
          },
          supplier: {
            $ref: '#/components/schemas/Supplier'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Bill date'
          },
          dueDate: {
            type: 'string',
            format: 'date',
            description: 'Due date'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string' },
                quantity: { type: 'number' },
                rate: { type: 'number' },
                amount: { type: 'number' }
              },
              required: ['description', 'quantity', 'rate', 'amount']
            }
          },
          subtotal: {
            type: 'number',
            description: 'Subtotal'
          },
          taxAmount: {
            type: 'number',
            description: 'Tax amount'
          },
          total: {
            type: 'number',
            description: 'Total amount'
          },
          paidAmount: {
            type: 'number',
            default: 0,
            description: 'Paid amount'
          },
          balanceAmount: {
            type: 'number',
            description: 'Balance amount'
          },
          status: {
            type: 'string',
            enum: ['draft', 'approved', 'paid', 'partially_paid', 'overdue'],
            description: 'Bill status'
          }
        },
        required: ['supplier', 'date', 'total']
      },

      // Accounts Receivable Schemas
      Payment: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique payment identifier'
          },
          paymentNumber: {
            type: 'string',
            description: 'Payment number'
          },
          customer: {
            $ref: '#/components/schemas/Customer'
          },
          invoice: {
            $ref: '#/components/schemas/Invoice'
          },
          date: {
            type: 'string',
            format: 'date',
            description: 'Payment date'
          },
          amount: {
            type: 'number',
            description: 'Payment amount'
          },
          method: {
            type: 'string',
            enum: ['cash', 'cheque', 'bank_transfer', 'credit_card', 'online'],
            description: 'Payment method'
          },
          reference: {
            type: 'string',
            description: 'Payment reference'
          },
          notes: {
            type: 'string',
            description: 'Payment notes'
          },
          status: {
            type: 'string',
            enum: ['pending', 'completed', 'failed', 'refunded'],
            description: 'Payment status'
          }
        },
        required: ['customer', 'date', 'amount', 'method']
      },

      // Compliance & Audit Trail Schemas
      AuditLog: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique audit log identifier'
          },
          user: {
            type: 'string',
            description: 'User ID'
          },
          action: {
            type: 'string',
            description: 'Action performed'
          },
          resource: {
            type: 'string',
            description: 'Resource affected'
          },
          resourceId: {
            type: 'string',
            description: 'Resource ID'
          },
          changes: {
            type: 'object',
            description: 'Changes made'
          },
          ipAddress: {
            type: 'string',
            description: 'IP address'
          },
          userAgent: {
            type: 'string',
            description: 'User agent'
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            description: 'Timestamp'
          }
        },
        required: ['user', 'action', 'resource', 'timestamp']
      },

      // Multi-Entity Consolidation Schemas
      Entity: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique entity identifier'
          },
          name: {
            type: 'string',
            description: 'Entity name'
          },
          type: {
            type: 'string',
            enum: ['company', 'branch', 'subsidiary', 'division'],
            description: 'Entity type'
          },
          parentEntity: {
            type: 'string',
            description: 'Parent entity ID'
          },
          currency: {
            type: 'string',
            description: 'Entity currency'
          },
          country: {
            type: 'string',
            description: 'Entity country'
          },
          consolidationPercentage: {
            type: 'number',
            description: 'Consolidation percentage'
          },
          isActive: {
            type: 'boolean',
            description: 'Entity status'
          }
        },
        required: ['name', 'type', 'currency']
      },

      // Contract Management Schemas
      Contract: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique contract identifier'
          },
          contractNumber: {
            type: 'string',
            description: 'Contract number'
          },
          title: {
            type: 'string',
            description: 'Contract title'
          },
          type: {
            type: 'string',
            enum: ['service', 'purchase', 'lease', 'employment', 'nda', 'other'],
            description: 'Contract type'
          },
          parties: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                type: { type: 'string', enum: ['customer', 'supplier', 'employee', 'partner'] },
                contact: { type: 'string' }
              }
            }
          },
          startDate: {
            type: 'string',
            format: 'date',
            description: 'Start date'
          },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'End date'
          },
          value: {
            type: 'number',
            description: 'Contract value'
          },
          currency: {
            type: 'string',
            description: 'Contract currency'
          },
          status: {
            type: 'string',
            enum: ['draft', 'active', 'expired', 'terminated', 'renewed'],
            description: 'Contract status'
          },
          terms: {
            type: 'string',
            description: 'Contract terms'
          },
          renewalTerms: {
            type: 'object',
            properties: {
              autoRenew: { type: 'boolean' },
              noticePeriod: { type: 'number' },
              renewalPeriod: { type: 'number' }
            }
          }
        },
        required: ['title', 'type', 'parties', 'startDate', 'value']
      },

      // Treasury & Investment Management Schemas
      Investment: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique investment identifier'
          },
          name: {
            type: 'string',
            description: 'Investment name'
          },
          type: {
            type: 'string',
            enum: ['equity', 'debt', 'mutual_fund', 'bond', 'fixed_deposit', 'gold', 'real_estate', 'other'],
            description: 'Investment type'
          },
          purchaseDate: {
            type: 'string',
            format: 'date',
            description: 'Purchase date'
          },
          purchasePrice: {
            type: 'number',
            description: 'Purchase price'
          },
          quantity: {
            type: 'number',
            description: 'Investment quantity'
          },
          currentPrice: {
            type: 'number',
            description: 'Current market price'
          },
          currentValue: {
            type: 'number',
            description: 'Current market value'
          },
          totalInvestment: {
            type: 'number',
            description: 'Total investment amount'
          },
          gainLoss: {
            type: 'number',
            description: 'Gain or loss amount'
          },
          gainLossPercentage: {
            type: 'number',
            description: 'Gain or loss percentage'
          },
          dividendIncome: {
            type: 'number',
            default: 0,
            description: 'Total dividend income'
          },
          broker: {
            type: 'string',
            description: 'Broker name'
          },
          account: {
            type: 'string',
            description: 'Investment account ID'
          },
          status: {
            type: 'string',
            enum: ['active', 'sold', 'transferred'],
            description: 'Investment status'
          }
        },
        required: ['name', 'type', 'purchaseDate', 'purchasePrice', 'quantity']
      },

      // Credit & Loan Management Schemas
      Loan: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique loan identifier'
          },
          loanNumber: {
            type: 'string',
            description: 'Loan number'
          },
          borrower: {
            $ref: '#/components/schemas/Borrower'
          },
          type: {
            type: 'string',
            enum: ['personal', 'business', 'home', 'auto', 'education', 'other'],
            description: 'Loan type'
          },
          principal: {
            type: 'number',
            description: 'Loan principal amount'
          },
          interestRate: {
            type: 'number',
            description: 'Interest rate percentage'
          },
          tenure: {
            type: 'number',
            description: 'Loan tenure in months'
          },
          emi: {
            type: 'number',
            description: 'EMI amount'
          },
          totalInterest: {
            type: 'number',
            description: 'Total interest amount'
          },
          totalAmount: {
            type: 'number',
            description: 'Total payable amount'
          },
          startDate: {
            type: 'string',
            format: 'date',
            description: 'Loan start date'
          },
          endDate: {
            type: 'string',
            format: 'date',
            description: 'Loan end date'
          },
          outstanding: {
            type: 'number',
            description: 'Outstanding amount'
          },
          status: {
            type: 'string',
            enum: ['active', 'closed', 'default', 'restructured'],
            description: 'Loan status'
          },
          collateral: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              value: { type: 'number' },
              description: { type: 'string' }
            }
          },
          guarantor: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              relationship: { type: 'string' },
              contact: { type: 'string' }
            }
          }
        },
        required: ['loanNumber', 'borrower', 'type', 'principal', 'interestRate', 'tenure']
      },

      Borrower: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique borrower identifier'
          },
          name: {
            type: 'string',
            description: 'Borrower name'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'Email address'
          },
          phone: {
            type: 'string',
            description: 'Phone number'
          },
          address: {
            type: 'object',
            properties: {
              street: { type: 'string' },
              city: { type: 'string' },
              state: { type: 'string' },
              country: { type: 'string' },
              zipCode: { type: 'string' }
            }
          },
          panNumber: {
            type: 'string',
            description: 'PAN number'
          },
          aadharNumber: {
            type: 'string',
            description: 'Aadhar number'
          },
          creditScore: {
            type: 'number',
            description: 'Credit score'
          },
          monthlyIncome: {
            type: 'number',
            description: 'Monthly income'
          },
          employmentType: {
            type: 'string',
            enum: ['salaried', 'self_employed', 'business', 'retired', 'other'],
            description: 'Employment type'
          },
          employer: {
            type: 'string',
            description: 'Employer name'
          },
          existingLoans: {
            type: 'number',
            description: 'Number of existing loans'
          },
          isActive: {
            type: 'boolean',
            description: 'Borrower status'
          }
        },
        required: ['name', 'email', 'creditScore']
      },

      // Fixed Deposit & Investment Tracker Schemas
      FixedDeposit: {
        type: 'object',
        properties: {
          _id: {
            type: 'string',
            description: 'Unique FD identifier'
          },
          fdNumber: {
            type: 'string',
            description: 'FD number'
          },
          bank: {
            type: 'string',
            description: 'Bank name'
          },
          principal: {
            type: 'number',
            description: 'Principal amount'
          },
          interestRate: {
            type: 'number',
            description: 'Interest rate percentage'
          },
          tenure: {
            type: 'number',
            description: 'Tenure in months'
          },
          maturityAmount: {
            type: 'number',
            description: 'Maturity amount'
          },
          startDate: {
            type: 'string',
            format: 'date',
            description: 'FD start date'
          },
          maturityDate: {
            type: 'string',
            format: 'date',
            description: 'Maturity date'
          },
          compounding: {
            type: 'string',
            enum: ['monthly', 'quarterly', 'half_yearly', 'annually'],
            description: 'Compounding frequency'
          },
          autoRenewal: {
            type: 'boolean',
            default: false,
            description: 'Auto renewal status'
          },
          status: {
            type: 'string',
            enum: ['active', 'matured', 'prematurely_closed', 'renewed'],
            description: 'FD status'
          },
          nominee: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              relationship: { type: 'string' },
              contact: { type: 'string' }
            }
          }
        },
        required: ['fdNumber', 'bank', 'principal', 'interestRate', 'tenure', 'startDate']
      },

      // Common Schemas
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Operation success status'
          },
          message: {
            type: 'string',
            description: 'Response message'
          },
          data: {
            type: 'object',
            description: 'Response data'
          },
          pagination: {
            type: 'object',
            properties: {
              page: { type: 'number' },
              limit: { type: 'number' },
              total: { type: 'number' },
              pages: { type: 'number' }
            }
          }
        },
        required: ['success', 'message']
      },

      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: 'Error message'
          },
          error: {
            type: 'object',
            properties: {
              code: {
                type: 'string',
                description: 'Error code'
              },
              details: {
                type: 'string',
                description: 'Error details'
              },
              stack: {
                type: 'string',
                description: 'Error stack trace'
              }
            }
          }
        },
        required: ['success', 'message', 'error']
      },

      PaginationQuery: {
        type: 'object',
        properties: {
          page: {
            type: 'number',
            minimum: 1,
            default: 1,
            description: 'Page number'
          },
          limit: {
            type: 'number',
            minimum: 1,
            maximum: 100,
            default: 10,
            description: 'Items per page'
          },
          sort: {
            type: 'string',
            description: 'Sort field'
          },
          order: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc',
            description: 'Sort order'
          },
          search: {
            type: 'string',
            description: 'Search query'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Users',
      description: 'User management operations'
    },
    {
      name: 'Companies',
      description: 'Company management operations'
    },
    {
      name: 'General Ledger',
      description: 'Double-entry bookkeeping system'
    },
    {
      name: 'GST Management',
      description: 'GST compliance and filing'
    },
    {
      name: 'Billing & Invoicing',
      description: 'Invoice generation and management'
    },
    {
      name: 'Payroll Management',
      description: 'Employee payroll processing'
    },
    {
      name: 'Expense Management',
      description: 'Expense tracking and reimbursement'
    },
    {
      name: 'Inventory Management',
      description: 'Stock tracking and management'
    },
    {
      name: 'Asset Management',
      description: 'Fixed asset tracking and depreciation'
    },
    {
      name: 'Financial Forecasting',
      description: 'AI-powered financial predictions'
    },
    {
      name: 'Budget Management',
      description: 'Budget planning and variance tracking'
    },
    {
      name: 'Cash Flow Management',
      description: 'Cash flow analysis and forecasting'
    },
    {
      name: 'Tax Filing',
      description: 'Tax calculation and filing automation'
    },
    {
      name: 'Financial Reporting',
      description: 'Automated financial statements'
    },
    {
      name: 'Bank Reconciliation',
      description: 'Automated bank statement matching'
    },
    {
      name: 'Document Intelligence',
      description: 'AI-powered document processing'
    },
    {
      name: 'Purchase & Procurement',
      description: 'Purchase order management'
    },
    {
      name: 'Accounts Payable',
      description: 'Vendor bill management'
    },
    {
      name: 'Accounts Receivable',
      description: 'Customer invoice management'
    },
    {
      name: 'Compliance & Audit Trail',
      description: 'Regulatory compliance monitoring'
    },
    {
      name: 'Multi-Entity Consolidation',
      description: 'Multi-company consolidation'
    },
    {
      name: 'Contract Management',
      description: 'Contract lifecycle management'
    },
    {
      name: 'Treasury & Investment Management',
      description: 'Investment portfolio management'
    },
    {
      name: 'Credit & Loan Management',
      description: 'Loan portfolio management'
    },
    {
      name: 'Fixed Deposit & Investment Tracker',
      description: 'Investment tracking'
    }
  ]
};

// Options for the swagger JSDoc
const options = {
  definition: swaggerDefinition,
  apis: ['./routes/*.js', './models/*.js'] // Paths to files containing OpenAPI definitions
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;