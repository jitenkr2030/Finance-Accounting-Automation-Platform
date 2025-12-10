const request = require('supertest');
const app = require('../server');
const { generateAuthToken } = require('./helpers/TestHelpers');
const Employee = require('../models/Employee');

describe('Payroll Management API Tests', () => {
  let authToken;
  let testEmployee;
  let adminToken;

  beforeAll(async () => {
    authToken = await generateAuthToken('accountant');
    adminToken = await generateAuthToken('admin');
    
    // Create test employee
    testEmployee = await Employee.create({
      employeeId: 'EMP001',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      dateOfBirth: '1990-01-15',
      joiningDate: '2020-01-01',
      department: 'Engineering',
      designation: 'Software Developer',
      salary: {
        basic: 50000,
        hra: 15000,
        specialAllowance: 10000,
        pf: 6000,
        esi: 375
      },
      bankDetails: {
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        bankName: 'HDFC Bank'
      },
      taxDetails: {
        panNumber: 'ABCDE1234F',
        aadharNumber: '123456789012',
        taxSlab: '5L-10L'
      }
    });
  });

  afterAll(async () => {
    if (testEmployee) {
      await Employee.findByIdAndDelete(testEmployee._id);
    }
  });

  describe('POST /api/payroll/employees', () => {
    test('should create a new employee', async () => {
      const employeeData = {
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        dateOfBirth: '1985-05-20',
        joiningDate: '2021-03-01',
        department: 'Marketing',
        designation: 'Marketing Manager',
        salary: {
          basic: 60000,
          hra: 18000,
          specialAllowance: 12000,
          pf: 7200,
          esi: 450
        },
        bankDetails: {
          accountNumber: '1234567891',
          ifscCode: 'SBI0001234',
          bankName: 'State Bank of India'
        },
        taxDetails: {
          panNumber: 'FGHIJ5678K',
          aadharNumber: '987654321098',
          taxSlab: '10L-15L'
        }
      };

      const response = await request(app)
        .post('/api/payroll/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(employeeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.employeeId).toBe(employeeData.employeeId);
      expect(response.body.data.email).toBe(employeeData.email);
      expect(response.body.data.firstName).toBe(employeeData.firstName);
    });

    test('should not create employee with duplicate employee ID', async () => {
      const employeeData = {
        employeeId: 'EMP001', // Existing employee ID
        firstName: 'Duplicate',
        lastName: 'Employee',
        email: 'duplicate@example.com',
        salary: { basic: 50000 }
      };

      const response = await request(app)
        .post('/api/payroll/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('duplicate');
    });

    test('should not create employee with invalid email', async () => {
      const employeeData = {
        employeeId: 'EMP003',
        firstName: 'Invalid',
        lastName: 'Email',
        email: 'invalid-email',
        salary: { basic: 50000 }
      };

      const response = await request(app)
        .post('/api/payroll/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(employeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    test('should require authentication', async () => {
      const employeeData = {
        employeeId: 'EMP004',
        firstName: 'No',
        lastName: 'Auth',
        email: 'noauth@example.com',
        salary: { basic: 50000 }
      };

      const response = await request(app)
        .post('/api/payroll/employees')
        .send(employeeData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payroll/employees', () => {
    test('should get all employees', async () => {
      const response = await request(app)
        .get('/api/payroll/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should filter employees by department', async () => {
      const response = await request(app)
        .get('/api/payroll/employees?department=Engineering')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should paginate employees', async () => {
      const response = await request(app)
        .get('/api/payroll/employees?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.limit).toBe(5);
    });

    test('should search employees by name', async () => {
      const response = await request(app)
        .get('/api/payroll/employees?search=John')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/payroll/employees/:id', () => {
    test('should get employee by ID', async () => {
      const response = await request(app)
        .get(`/api/payroll/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(testEmployee._id.toString());
      expect(response.body.data.employeeId).toBe(testEmployee.employeeId);
    });

    test('should return 404 for non-existent employee', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/payroll/employees/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('not found');
    });
  });

  describe('PUT /api/payroll/employees/:id', () => {
    test('should update employee details', async () => {
      const updateData = {
        department: 'Product Management',
        designation: 'Senior Product Manager',
        salary: {
          basic: 70000,
          hra: 21000,
          specialAllowance: 14000,
          pf: 8400,
          esi: 525
        }
      };

      const response = await request(app)
        .put(`/api/payroll/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.department).toBe(updateData.department);
      expect(response.body.data.designation).toBe(updateData.designation);
    });

    test('should not update employee with invalid employee ID', async () => {
      const updateData = {
        employeeId: 'EMP001', // Different from existing
        department: 'Updated Department'
      };

      const response = await request(app)
        .put(`/api/payroll/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/payroll/employees/:id', () => {
    test('should soft delete employee', async () => {
      const response = await request(app)
        .delete(`/api/payroll/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deactivated');
    });

    test('should not allow non-admin to delete employee', async () => {
      const response = await request(app)
        .delete(`/api/payroll/employees/${testEmployee._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/payroll/payslips', () => {
    test('should generate payslip for employee', async () => {
      const payslipData = {
        employeeId: testEmployee._id,
        month: '2024-01',
        year: 2024
      };

      const response = await request(app)
        .post('/api/payroll/payslips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payslipData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.employeeId).toBe(testEmployee._id.toString());
      expect(response.body.data.month).toBe(payslipData.month);
      expect(response.body.data.basicSalary).toBeDefined();
      expect(response.body.data.hra).toBeDefined();
      expect(response.body.data.totalDeductions).toBeDefined();
      expect(response.body.data.netPay).toBeDefined();
    });

    test('should not generate payslip for non-existent employee', async () => {
      const fakeEmployeeId = '507f1f77bcf86cd799439011';
      const payslipData = {
        employeeId: fakeEmployeeId,
        month: '2024-01',
        year: 2024
      };

      const response = await request(app)
        .post('/api/payroll/payslips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payslipData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/payroll/payslips', () => {
    test('should get all payslips with pagination', async () => {
      const response = await request(app)
        .get('/api/payroll/payslips?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should filter payslips by employee', async () => {
      const response = await request(app)
        .get(`/api/payroll/payslips?employeeId=${testEmployee._id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('POST /api/payroll/salary-disbursement', () => {
    test('should process salary disbursement', async () => {
      const disbursementData = {
        month: '2024-01',
        year: 2024,
        employeeIds: [testEmployee._id],
        paymentMethod: 'bank_transfer'
      };

      const response = await request(app)
        .post('/api/payroll/salary-disbursement')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(disbursementData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.processed).toBeGreaterThan(0);
      expect(response.body.data.totalAmount).toBeDefined();
    });

    test('should validate required fields for disbursement', async () => {
      const invalidData = {
        month: '2024-01'
        // Missing year and employeeIds
      };

      const response = await request(app)
        .post('/api/payroll/salary-disbursement')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });
  });

  describe('GET /api/payroll/reports/empoloyee-cost', () => {
    test('should get employee cost report', async () => {
      const response = await request(app)
        .get('/api/payroll/reports/employee-cost?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalCost).toBeDefined();
      expect(response.body.data.employeeBreakdown).toBeDefined();
    });

    test('should require date range for employee cost report', async () => {
      const response = await request(app)
        .get('/api/payroll/reports/employee-cost')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('date');
    });
  });

  describe('GET /api/payroll/reports/tax-summary', () => {
    test('should get tax summary report', async () => {
      const response = await request(app)
        .get('/api/payroll/reports/tax-summary?year=2024')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.totalTax).toBeDefined();
      expect(response.body.data.taxBreakdown).toBeDefined();
    });
  });

  describe('POST /api/payroll/tds-returns', () => {
    test('should generate TDS return', async () => {
      const tdsData = {
        quarter: 'Q1',
        year: 2024,
        financialYear: '2024-25'
      };

      const response = await request(app)
        .post('/api/payroll/tds-returns')
        .set('Authorization', `Bearer ${authToken}`)
        .send(tdsData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.quarter).toBe(tdsData.quarter);
      expect(response.body.data.year).toBe(tdsData.year);
      expect(response.body.data.totalTDS).toBeDefined();
      expect(response.body.data.employeeTDS).toBeDefined();
    });
  });

  describe('Error Handling Tests', () => {
    test('should handle database connection errors gracefully', async () => {
      // Simulate database error by closing connection
      await mongoose.connection.close();
      
      const response = await request(app)
        .get('/api/payroll/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DATABASE_ERROR');
      
      // Reconnect for remaining tests
      await mongoose.connect(process.env.MONGODB_URI_TEST);
    });

    test('should handle validation errors properly', async () => {
      const invalidEmployeeData = {
        employeeId: '', // Empty employee ID
        firstName: '', // Empty first name
        email: 'invalid-email',
        salary: {
          basic: -1000 // Negative basic salary
        }
      };

      const response = await request(app)
        .post('/api/payroll/employees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidEmployeeData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.details).toBeDefined();
    });

    test('should handle authorization errors', async () => {
      const response = await request(app)
        .get('/api/payroll/reports/employee-cost')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('Integration Tests', () => {
    test('should integrate payroll with general ledger', async () => {
      const payslipData = {
        employeeId: testEmployee._id,
        month: '2024-02',
        year: 2024
      };

      const payslipResponse = await request(app)
        .post('/api/payroll/payslips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payslipData)
        .expect(201);

      expect(payslipResponse.body.success).toBe(true);

      // Verify journal entries were created
      const journalResponse = await request(app)
        .get('/api/ledger/journal-entries')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(journalResponse.body.success).toBe(true);
      // Should contain salary expense entries
      const salaryEntries = journalResponse.body.data.filter(entry => 
        entry.description && entry.description.toLowerCase().includes('salary')
      );
      expect(salaryEntries.length).toBeGreaterThan(0);
    });

    test('should integrate payroll with expense management', async () => {
      // Create expense for employee
      const expenseData = {
        employee: testEmployee._id,
        date: '2024-01-15',
        category: 'Travel',
        description: 'Business travel expense',
        amount: 5000,
        paymentMethod: 'credit_card'
      };

      const expenseResponse = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${authToken}`)
        .send(expenseData)
        .expect(201);

      expect(expenseResponse.body.success).toBe(true);

      // Verify payroll calculation includes expense reimbursement
      const payslipData = {
        employeeId: testEmployee._id,
        month: '2024-01',
        year: 2024,
        includeExpenses: true
      };

      const payslipResponse = await request(app)
        .post('/api/payroll/payslips')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payslipData)
        .expect(201);

      expect(payslipResponse.body.success).toBe(true);
      expect(payslipResponse.body.data.expenseReimbursement).toBeDefined();
    });
  });
});