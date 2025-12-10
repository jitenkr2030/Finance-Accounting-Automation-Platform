const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Company = require('./Company');
const { ChartOfAccounts, JournalEntry, JournalLineItem } = require('./Ledger');
const { GSTInvoice, GSTLineItem, GSTReturn, HSNMaster } = require('./GST');
const { Invoice, InvoiceLineItem, RecurringInvoice, Payment, Estimate } = require('./Billing');
const { Customer, Vendor, PurchaseOrder, PurchaseOrderLineItem, GoodsReceiptNote, GRNLineItem } = require('./CustomerVendor');
const { Product, Warehouse, StockLedger, StockAdjustment, StockAdjustmentLineItem, StockTransfer, StockTransferLineItem } = require('./Inventory');
const { Employee, PayrollRun, PayrollDetail, Payslip, Attendance } = require('./Payroll');
const { Expense, ExpensePolicy, ExpenseReport, ExpenseReportItem } = require('./Expense');
const { BankAccount, BankStatement, BankTransaction, Asset, TDSRate, TDSDeduction } = require('./OtherEngines');
const { AuditLog, ComplianceTask, KPIDefinition, KPIData, Document, Budget, BudgetLineItem } = require('./AnalyticsAI');

// Define associations

// Company associations
Company.hasMany(User, { foreignKey: 'companyId' });
User.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(ChartOfAccounts, { foreignKey: 'companyId' });
ChartOfAccounts.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(JournalEntry, { foreignKey: 'companyId' });
JournalEntry.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(GSTInvoice, { foreignKey: 'companyId' });
GSTInvoice.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(GSTReturn, { foreignKey: 'companyId' });
GSTReturn.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Invoice, { foreignKey: 'companyId' });
Invoice.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Payment, { foreignKey: 'companyId' });
Payment.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Customer, { foreignKey: 'companyId' });
Customer.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Vendor, { foreignKey: 'companyId' });
Vendor.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(PurchaseOrder, { foreignKey: 'companyId' });
PurchaseOrder.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(GoodsReceiptNote, { foreignKey: 'companyId' });
GoodsReceiptNote.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Product, { foreignKey: 'companyId' });
Product.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Warehouse, { foreignKey: 'companyId' });
Warehouse.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(StockLedger, { foreignKey: 'companyId' });
StockLedger.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(StockAdjustment, { foreignKey: 'companyId' });
StockAdjustment.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(StockTransfer, { foreignKey: 'companyId' });
StockTransfer.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Employee, { foreignKey: 'companyId' });
Employee.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(PayrollRun, { foreignKey: 'companyId' });
PayrollRun.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Expense, { foreignKey: 'companyId' });
Expense.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(ExpenseReport, { foreignKey: 'companyId' });
ExpenseReport.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(BankAccount, { foreignKey: 'companyId' });
BankAccount.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(BankStatement, { foreignKey: 'companyId' });
BankStatement.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(BankTransaction, { foreignKey: 'companyId' });
BankTransaction.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Asset, { foreignKey: 'companyId' });
Asset.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(TDSDeduction, { foreignKey: 'companyId' });
TDSDeduction.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(AuditLog, { foreignKey: 'companyId' });
AuditLog.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(ComplianceTask, { foreignKey: 'companyId' });
ComplianceTask.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(KPIDefinition, { foreignKey: 'companyId' });
KPIDefinition.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Document, { foreignKey: 'companyId' });
Document.belongsTo(Company, { foreignKey: 'companyId' });

Company.hasMany(Budget, { foreignKey: 'companyId' });
Budget.belongsTo(Company, { foreignKey: 'companyId' });

// Journal Entry associations
JournalEntry.hasMany(JournalLineItem, { foreignKey: 'journalEntryId', as: 'lineItems' });
JournalLineItem.belongsTo(JournalEntry, { foreignKey: 'journalEntryId', as: 'journalEntry' });

ChartOfAccounts.hasMany(JournalLineItem, { foreignKey: 'accountId', as: 'journalEntries' });
JournalLineItem.belongsTo(ChartOfAccounts, { foreignKey: 'accountId', as: 'account' });

// GST Invoice associations
GSTInvoice.hasMany(GSTLineItem, { foreignKey: 'gstInvoiceId', as: 'lineItems' });
GSTLineItem.belongsTo(GSTInvoice, { foreignKey: 'gstInvoiceId' });

// Invoice associations
Invoice.hasMany(InvoiceLineItem, { foreignKey: 'invoiceId', as: 'lineItems' });
InvoiceLineItem.belongsTo(Invoice, { foreignKey: 'invoiceId' });

Invoice.hasMany(Payment, { foreignKey: 'invoiceId', as: 'payments' });
Payment.belongsTo(Invoice, { foreignKey: 'invoiceId' });

// Purchase Order associations
PurchaseOrder.hasMany(PurchaseOrderLineItem, { foreignKey: 'purchaseOrderId', as: 'lineItems' });
PurchaseOrderLineItem.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId' });

// Goods Receipt Note associations
GoodsReceiptNote.hasMany(GRNLineItem, { foreignKey: 'grnId', as: 'lineItems' });
GRNLineItem.belongsTo(GoodsReceiptNote, { foreignKey: 'grnId' });

// Stock Adjustment associations
StockAdjustment.hasMany(StockAdjustmentLineItem, { foreignKey: 'stockAdjustmentId', as: 'lineItems' });
StockAdjustmentLineItem.belongsTo(StockAdjustment, { foreignKey: 'stockAdjustmentId' });

// Stock Transfer associations
StockTransfer.hasMany(StockTransferLineItem, { foreignKey: 'stockTransferId', as: 'lineItems' });
StockTransferLineItem.belongsTo(StockTransfer, { foreignKey: 'stockTransferId' });

// Payroll associations
PayrollRun.hasMany(PayrollDetail, { foreignKey: 'payrollRunId', as: 'payrollDetails' });
PayrollDetail.belongsTo(PayrollRun, { foreignKey: 'payrollRunId' });

PayrollDetail.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });
Employee.hasMany(PayrollDetail, { foreignKey: 'employeeId' });

PayrollRun.hasMany(Payslip, { foreignKey: 'payrollRunId' });
Payslip.belongsTo(PayrollRun, { foreignKey: 'payrollRunId' });

Payslip.belongsTo(Employee, { foreignKey: 'employeeId' });
Employee.hasMany(Payslip, { foreignKey: 'employeeId' });

// Expense associations
ExpenseReport.hasMany(ExpenseReportItem, { foreignKey: 'expenseReportId', as: 'items' });
ExpenseReportItem.belongsTo(ExpenseReport, { foreignKey: 'expenseReportId' });

// KPI associations
KPIDefinition.hasMany(KPIData, { foreignKey: 'kpiDefinitionId' });
KPIData.belongsTo(KPIDefinition, { foreignKey: 'kpiDefinitionId' });

// Budget associations
Budget.hasMany(BudgetLineItem, { foreignKey: 'budgetId', as: 'lineItems' });
BudgetLineItem.belongsTo(Budget, { foreignKey: 'budgetId' });

// Bank associations
BankAccount.hasMany(BankStatement, { foreignKey: 'bankAccountId' });
BankStatement.belongsTo(BankAccount, { foreignKey: 'bankAccountId' });

BankStatement.hasMany(BankTransaction, { foreignKey: 'statementId' });
BankTransaction.belongsTo(BankStatement, { foreignKey: 'statementId' });

BankAccount.hasMany(BankTransaction, { foreignKey: 'bankAccountId' });
BankTransaction.belongsTo(BankAccount, { foreignKey: 'bankAccountId' });

// Product associations (for inventory)
Product.hasMany(StockLedger, { foreignKey: 'productId', as: 'stockEntries' });
StockLedger.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Warehouse.hasMany(StockLedger, { foreignKey: 'warehouseId', as: 'stockEntries' });
StockLedger.belongsTo(Warehouse, { foreignKey: 'warehouseId', as: 'warehouse' });

// Export all models
module.exports = {
  User,
  Company,
  ChartOfAccounts,
  JournalEntry,
  JournalLineItem,
  GSTInvoice,
  GSTLineItem,
  GSTReturn,
  HSNMaster,
  Invoice,
  InvoiceLineItem,
  RecurringInvoice,
  Payment,
  Estimate,
  Customer,
  Vendor,
  PurchaseOrder,
  PurchaseOrderLineItem,
  GoodsReceiptNote,
  GRNLineItem,
  Product,
  Warehouse,
  StockLedger,
  StockAdjustment,
  StockAdjustmentLineItem,
  StockTransfer,
  StockTransferLineItem,
  Employee,
  PayrollRun,
  PayrollDetail,
  Payslip,
  Attendance,
  Expense,
  ExpensePolicy,
  ExpenseReport,
  ExpenseReportItem,
  BankAccount,
  BankStatement,
  BankTransaction,
  Asset,
  TDSRate,
  TDSDeduction,
  AuditLog,
  ComplianceTask,
  KPIDefinition,
  KPIData,
  Document,
  Budget,
  BudgetLineItem,
  sequelize,
};