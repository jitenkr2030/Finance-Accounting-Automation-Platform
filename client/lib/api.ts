import axios from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// API endpoints organized by module
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  profile: () => api.get('/auth/profile'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    api.put('/auth/change-password', data),
}

export const ledgerAPI = {
  getAccounts: (params?: any) => api.get('/ledger/accounts', { params }),
  createAccount: (data: any) => api.post('/ledger/accounts', data),
  getAccount: (id: string) => api.get(`/ledger/accounts/${id}`),
  updateAccount: (id: string, data: any) => api.put(`/ledger/accounts/${id}`, data),
  deleteAccount: (id: string) => api.delete(`/ledger/accounts/${id}`),
  getJournalEntries: (params?: any) => api.get('/ledger/journal-entries', { params }),
  createJournalEntry: (data: any) => api.post('/ledger/journal-entries', data),
  getJournalEntry: (id: string) => api.get(`/ledger/journal-entries/${id}`),
  postJournalEntry: (id: string) => api.put(`/ledger/journal-entries/${id}/post`),
  getTrialBalance: (params?: any) => api.get('/ledger/trial-balance', { params }),
}

export const gstAPI = {
  getInvoices: (params?: any) => api.get('/gst/invoices', { params }),
  createInvoice: (data: any) => api.post('/gst/invoices', data),
  getInvoice: (id: string) => api.get(`/gst/invoices/${id}`),
  updateInvoice: (id: string, data: any) => api.put(`/gst/invoices/${id}`, data),
  deleteInvoice: (id: string) => api.delete(`/gst/invoices/${id}`),
  generateEInvoice: (id: string) => api.post(`/gst/invoices/${id}/e-invoice`),
  generateEWayBill: (id: string, data: any) => api.post(`/gst/invoices/${id}/e-way-bill`, data),
  getReturns: (params?: any) => api.get('/gst/returns', { params }),
  createReturn: (data: any) => api.post('/gst/returns', data),
  getHSNMaster: (params?: any) => api.get('/gst/hsn-master', { params }),
  searchHSN: (code: string) => api.get(`/gst/hsn-search/${code}`),
}

export const billingAPI = {
  getInvoices: (params?: any) => api.get('/billing/invoices', { params }),
  createInvoice: (data: any) => api.post('/billing/invoices', data),
  getInvoice: (id: string) => api.get(`/billing/invoices/${id}`),
  updateInvoice: (id: string, data: any) => api.put(`/billing/invoices/${id}`, data),
  sendInvoice: (id: string) => api.put(`/billing/invoices/${id}/send`),
  recordPayment: (invoiceId: string, data: any) => 
    api.post(`/billing/invoices/${invoiceId}/payments`, data),
  getEstimates: (params?: any) => api.get('/billing/estimates', { params }),
  createEstimate: (data: any) => api.post('/billing/estimates', data),
  convertEstimate: (id: string) => api.post(`/billing/estimates/${id}/convert-to-invoice`),
  getRecurringInvoices: (params?: any) => api.get('/billing/recurring', { params }),
  createRecurringInvoice: (data: any) => api.post('/billing/recurring', data),
  getDashboard: () => api.get('/billing/dashboard'),
}

export const customerAPI = {
  getCustomers: (params?: any) => api.get('/vendor/customers', { params }),
  createCustomer: (data: any) => api.post('/vendor/customers', data),
  getCustomer: (id: string) => api.get(`/vendor/customers/${id}`),
  updateCustomer: (id: string, data: any) => api.put(`/vendor/customers/${id}`, data),
  deleteCustomer: (id: string) => api.delete(`/vendor/customers/${id}`),
}

export const vendorAPI = {
  getVendors: (params?: any) => api.get('/vendor/vendors', { params }),
  createVendor: (data: any) => api.post('/vendor/vendors', data),
  getVendor: (id: string) => api.get(`/vendor/vendors/${id}`),
  updateVendor: (id: string, data: any) => api.put(`/vendor/vendors/${id}`, data),
  deleteVendor: (id: string) => api.delete(`/vendor/vendors/${id}`),
  getPurchaseOrders: (params?: any) => api.get('/vendor/purchase-orders', { params }),
  createPurchaseOrder: (data: any) => api.post('/vendor/purchase-orders', data),
  getGRNs: (params?: any) => api.get('/vendor/grn', { params }),
  createGRN: (data: any) => api.post('/vendor/grn', data),
}

export const inventoryAPI = {
  getProducts: (params?: any) => api.get('/inventory/products', { params }),
  createProduct: (data: any) => api.post('/inventory/products', data),
  getProduct: (id: string) => api.get(`/inventory/products/${id}`),
  updateProduct: (id: string, data: any) => api.put(`/inventory/products/${id}`, data),
  deleteProduct: (id: string) => api.delete(`/inventory/products/${id}`),
  getWarehouses: (params?: any) => api.get('/inventory/warehouses', { params }),
  createWarehouse: (data: any) => api.post('/inventory/warehouses', data),
  getStockLedger: (params?: any) => api.get('/inventory/stock-ledger', { params }),
  getAdjustments: (params?: any) => api.get('/inventory/adjustments', { params }),
  createAdjustment: (data: any) => api.post('/inventory/adjustments', data),
  getTransfers: (params?: any) => api.get('/inventory/transfers', { params }),
  createTransfer: (data: any) => api.post('/inventory/transfers', data),
  getDashboard: () => api.get('/inventory/dashboard'),
}

export const payrollAPI = {
  getEmployees: (params?: any) => api.get('/payroll/employees', { params }),
  createEmployee: (data: any) => api.post('/payroll/employees', data),
  getEmployee: (id: string) => api.get(`/payroll/employees/${id}`),
  updateEmployee: (id: string, data: any) => api.put(`/payroll/employees/${id}`, data),
  getAttendance: (params?: any) => api.get('/payroll/attendance', { params }),
  recordAttendance: (data: any) => api.post('/payroll/attendance', data),
  getPayrollRuns: (params?: any) => api.get('/payroll/payroll-runs', { params }),
  createPayrollRun: (data: any) => api.post('/payroll/payroll-runs', data),
  calculatePayroll: (id: string) => api.put(`/payroll/payroll-runs/${id}/calculate`),
  generatePayslips: (id: string) => api.post(`/payroll/payroll-runs/${id}/generate-payslips`),
  getDashboard: () => api.get('/payroll/dashboard'),
}

export const expenseAPI = {
  getExpenses: (params?: any) => api.get('/expense/expenses', { params }),
  createExpense: (data: any) => api.post('/expense/expenses', data),
  getExpense: (id: string) => api.get(`/expense/expenses/${id}`),
  updateExpense: (id: string, data: any) => api.put(`/expense/expenses/${id}`, data),
  submitExpense: (id: string) => api.put(`/expense/expenses/${id}/submit`),
  approveExpense: (id: string, data: any) => api.put(`/expense/expenses/${id}/approve`, data),
  getReports: (params?: any) => api.get('/expense/reports', { params }),
  createReport: (data: any) => api.post('/expense/reports', data),
  submitReport: (id: string) => api.put(`/expense/reports/${id}/submit`),
  getDashboard: () => api.get('/expense/dashboard'),
}

export const reportingAPI = {
  getTrialBalance: (params?: any) => api.get('/reporting/trial-balance', { params }),
  getBalanceSheet: (params?: any) => api.get('/reporting/balance-sheet', { params }),
  getProfitLoss: (params?: any) => api.get('/reporting/profit-loss', { params }),
  getCashFlow: (params?: any) => api.get('/reporting/cash-flow', { params }),
  getAgingReceivable: (params?: any) => api.get('/reporting/aging-receivable', { params }),
}

export const analyticsAPI = {
  getKPIDefinitions: () => api.get('/analytics/kpi-definitions'),
  getKPIData: (params?: any) => api.get('/analytics/kpi-data', { params }),
  getFinancialDashboard: () => api.get('/analytics/financial-dashboard'),
}

export const documentAPI = {
  uploadDocument: (formData: FormData) => api.post('/document/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  processDocument: (id: string) => api.post(`/document/${id}/process`),
  getDocuments: (params?: any) => api.get('/document', { params }),
  getDocument: (id: string) => api.get(`/document/${id}`),
}

export const aiAPI = {
  chatWithAccountant: (message: string) => api.post('/ai/accountant/chat', { message }),
  classifyTransaction: (data: any) => api.post('/ai/classify-transaction', data),
  getAnomalies: () => api.get('/ai/anomaly-detection'),
}

export const bankAPI = {
  getAccounts: () => api.get('/bank/accounts'),
  createAccount: (data: any) => api.post('/bank/accounts', data),
  uploadStatement: (formData: FormData) => api.post('/bank/statements/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getReconciliation: (accountId: string, params?: any) => 
    api.get(`/bank/reconciliation/${accountId}`, { params }),
}

export const tdsAPI = {
  getDeductions: (params?: any) => api.get('/tds/deductions', { params }),
  createDeduction: (data: any) => api.post('/tds/deductions', data),
  getDeduction: (id: string) => api.get(`/tds/deductions/${id}`),
  updateDeduction: (id: string, data: any) => api.put(`/tds/deductions/${id}`, data),
}

export const assetsAPI = {
  getAssets: (params?: any) => api.get('/assets/assets', { params }),
  createAsset: (data: any) => api.post('/assets/assets', data),
  getAsset: (id: string) => api.get(`/assets/assets/${id}`),
  updateAsset: (id: string, data: any) => api.put(`/assets/assets/${id}`, data),
  deleteAsset: (id: string) => api.delete(`/assets/assets/${id}`),
}

export const budgetAPI = {
  getBudgets: (params?: any) => api.get('/budgeting', { params }),
  createBudget: (data: any) => api.post('/budgeting', data),
  getBudget: (id: string) => api.get(`/budgeting/${id}`),
  updateBudget: (id: string, data: any) => api.put(`/budgeting/${id}`, data),
}

export const auditAPI = {
  runAudit: () => api.post('/audit/run'),
  findErrors: (params?: any) => api.get('/audit/find-errors', { params }),
  getReport: (params?: any) => api.get('/audit/report', { params }),
}

export const integrationAPI = {
  getAvailable: () => api.get('/integration/available'),
  connect: (integrationName: string, data: any) => 
    api.post(`/integration/connect/${integrationName}`, data),
  sync: (integrationName: string, data: any) => 
    api.post(`/integration/sync/${integrationName}`, data),
  getStatus: (integrationName: string) => 
    api.get(`/integration/status/${integrationName}`),
}

export const complianceAPI = {
  getTasks: (params?: any) => api.get('/compliance/tasks', { params }),
  createTask: (data: any) => api.post('/compliance/tasks', data),
  updateTask: (id: string, data: any) => api.put(`/compliance/tasks/${id}`, data),
}

export const auditTrailAPI = {
  getLogs: (params?: any) => api.get('/audit-trail/logs', { params }),
  getLog: (id: string) => api.get(`/audit-trail/logs/${id}`),
}

export default api