const TestHelpers = require('../helpers/TestHelpers');

describe('Billing Engine API', () => {
  let testHelpers;
  let app;
  let testData;

  beforeAll(() => {
    app = require('../../server');
    testHelpers = new TestHelpers(app);
  });

  beforeEach(async () => {
    testData = await testHelpers.createTestData();
  });

  describe('Invoices', () => {
    describe('GET /api/billing/invoices', () => {
      it('should get all invoices', async () => {
        // Create test invoices
        await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          customerName: 'Test Customer 1'
        });

        await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          customerName: 'Test Customer 2'
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/billing/invoices', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('invoices');
        expect(res.body.data.invoices.length).toBeGreaterThanOrEqual(2);
      });

      it('should filter invoices by status', async () => {
        await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          status: 'draft',
          customerName: 'Draft Customer'
        });

        await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          status: 'sent',
          customerName: 'Sent Customer'
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/billing/invoices?status=sent', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.invoices.every(inv => inv.status === 'sent')).toBe(true);
      });

      it('should filter invoices by date range', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const res = await testHelpers.authenticatedRequest('get', `/api/billing/invoices?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
      });

      it('should search invoices by customer name', async () => {
        await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          customerName: 'John Doe'
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/billing/invoices?search=John', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        // Additional validation depends on implementation
      });
    });

    describe('POST /api/billing/invoices', () => {
      it('should create a new invoice', async () => {
        const invoiceData = {
          invoiceNumber: 'INV001',
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          customerName: 'Test Customer',
          customerEmail: 'test@customer.com',
          customerPhone: '+91-9876543210',
          billingAddress: {
            street: '123 Customer St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productId: 'test-product-1',
              productName: 'Professional Service',
              description: 'Consulting services',
              quantity: 10,
              rate: 500,
              taxRate: 18,
              discount: 5
            },
            {
              productId: 'test-product-2',
              productName: 'Software License',
              description: 'Annual license',
              quantity: 1,
              rate: 2000,
              taxRate: 18,
              discount: 0
            }
          ],
          notes: 'Thank you for your business!',
          termsAndConditions: 'Payment due within 30 days'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/invoices', testData.user, invoiceData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('invoice');
        expect(res.body.data.invoice.invoiceNumber).toBe(invoiceData.invoiceNumber);
        expect(res.body.data.invoice.customerName).toBe(invoiceData.customerName);
        expect(res.body.data.invoice.totalAmount).toBeGreaterThan(0);
      });

      it('should calculate totals correctly with discounts and taxes', async () => {
        const invoiceData = {
          invoiceNumber: 'INV002',
          invoiceDate: new Date(),
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          customerName: 'Test Customer',
          customerEmail: 'test@customer.com',
          billingAddress: {
            street: '123 Customer St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Product A',
              quantity: 2,
              rate: 1000,
              taxRate: 18,
              discount: 10 // 10% discount
            }
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/invoices', testData.user, invoiceData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        const invoice = res.body.data.invoice;
        
        // Calculate expected values
        const subtotal = 2 * 1000; // 2000
        const discountAmount = subtotal * 0.10; // 200
        const taxableAmount = subtotal - discountAmount; // 1800
        const taxAmount = taxableAmount * 0.18; // 324
        const totalAmount = taxableAmount + taxAmount; // 2124

        expect(invoice.subtotal).toBe(subtotal);
        expect(invoice.discountAmount).toBe(discountAmount);
        expect(invoice.taxAmount).toBe(taxAmount);
        expect(invoice.totalAmount).toBe(totalAmount);
      });

      it('should return 400 for invoice without items', async () => {
        const invoiceData = {
          invoiceNumber: 'INV003',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          items: [] // Empty items array
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/invoices', testData.user, invoiceData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('at least one item');
      });

      it('should return 400 for duplicate invoice number', async () => {
        // Create first invoice
        await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          invoiceNumber: 'DUPLICATE'
        });

        // Try to create second invoice with same number
        const invoiceData = {
          invoiceNumber: 'DUPLICATE',
          invoiceDate: new Date(),
          customerName: 'Another Customer',
          items: [
            {
              productName: 'Test Product',
              quantity: 1,
              rate: 100,
              taxRate: 18,
              discount: 0
            }
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/invoices', testData.user, invoiceData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('Invoice number already exists');
      });
    });

    describe('GET /api/billing/invoices/:id', () => {
      it('should get invoice by ID', async () => {
        const invoice = await testHelpers.createTestInvoice({
          companyId: testData.company._id
        });

        const res = await testHelpers.authenticatedRequest('get', `/api/billing/invoices/${invoice._id}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.invoice._id).toBe(invoice._id.toString());
      });

      it('should return 404 for non-existent invoice', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        
        const res = await testHelpers.authenticatedRequest('get', `/api/billing/invoices/${fakeId}`, testData.user)
          .expect(404);

        expect(res.body).toHaveProperty('success', false);
      });
    });

    describe('PUT /api/billing/invoices/:id/send', () => {
      it('should send invoice via email', async () => {
        const invoice = await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          customerEmail: 'test@customer.com',
          status: 'draft'
        });

        const sendData = {
          email: 'test@customer.com',
          subject: 'Invoice from Test Company',
          message: 'Please find attached invoice for your review.'
        };

        const res = await testHelpers.authenticatedRequest('put', `/api/billing/invoices/${invoice._id}/send`, testData.user, sendData)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('message');
        expect(res.body.data.invoice.status).toBe('sent');
      });

      it('should return 400 for invoice without email', async () => {
        const invoice = await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          customerEmail: '', // No email
          status: 'draft'
        });

        const sendData = {
          email: '',
          subject: 'Test Subject',
          message: 'Test message'
        };

        const res = await testHelpers.authenticatedRequest('put', `/api/billing/invoices/${invoice._id}/send`, testData.user, sendData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
      });
    });

    describe('POST /api/billing/invoices/:id/payments', () => {
      it('should record invoice payment', async () => {
        const invoice = await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          totalAmount: 1180,
          status: 'sent'
        });

        const paymentData = {
          amount: 1180,
          paymentDate: new Date(),
          paymentMethod: 'bank_transfer',
          referenceNumber: 'TXN123456789',
          notes: 'Full payment received'
        };

        const res = await testHelpers.authenticatedRequest('post', `/api/billing/invoices/${invoice._id}/payments`, testData.user, paymentData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('payment');
        expect(res.body.data.invoice.status).toBe('paid');
      });

      it('should handle partial payments', async () => {
        const invoice = await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          totalAmount: 1180,
          status: 'sent'
        });

        const paymentData = {
          amount: 590, // Half payment
          paymentDate: new Date(),
          paymentMethod: 'cheque',
          referenceNumber: 'CHQ123456'
        };

        const res = await testHelpers.authenticatedRequest('post', `/api/billing/invoices/${invoice._id}/payments`, testData.user, paymentData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.invoice.status).toBe('partially_paid');
      });

      it('should return 400 for payment exceeding invoice amount', async () => {
        const invoice = await testHelpers.createTestInvoice({
          companyId: testData.company._id,
          totalAmount: 1180,
          status: 'sent'
        });

        const paymentData = {
          amount: 2000, // Exceeds invoice amount
          paymentDate: new Date(),
          paymentMethod: 'cash'
        };

        const res = await testHelpers.authenticatedRequest('post', `/api/billing/invoices/${invoice._id}/payments`, testData.user, paymentData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('exceeds invoice amount');
      });
    });
  });

  describe('Estimates', () => {
    describe('GET /api/billing/estimates', () => {
      it('should get all estimates', async () => {
        const Billing = require('../../models/Billing');
        
        const estimate1 = new Billing.Estimate({
          companyId: testData.company._id,
          estimateNumber: 'EST001',
          estimateDate: new Date(),
          customerName: 'Test Customer 1',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: [
            {
              productName: 'Service A',
              quantity: 1,
              rate: 1000,
              taxRate: 18
            }
          ],
          subtotal: 1000,
          taxAmount: 180,
          totalAmount: 1180,
          status: 'draft'
        });
        await estimate1.save();

        const estimate2 = new Billing.Estimate({
          companyId: testData.company._id,
          estimateNumber: 'EST002',
          estimateDate: new Date(),
          customerName: 'Test Customer 2',
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: [
            {
              productName: 'Service B',
              quantity: 2,
              rate: 500,
              taxRate: 18
            }
          ],
          subtotal: 1000,
          taxAmount: 180,
          totalAmount: 1180,
          status: 'sent'
        });
        await estimate2.save();

        const res = await testHelpers.authenticatedRequest('get', '/api/billing/estimates', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('estimates');
        expect(res.body.data.estimates.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('POST /api/billing/estimates', () => {
      it('should create a new estimate', async () => {
        const estimateData = {
          estimateNumber: 'EST003',
          estimateDate: new Date(),
          customerName: 'Test Customer',
          customerEmail: 'test@customer.com',
          billingAddress: {
            street: '123 Customer St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: [
            {
              productName: 'Consulting Service',
              description: 'Professional consulting',
              quantity: 5,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          notes: 'This estimate is valid for 30 days.',
          termsAndConditions: 'Payment terms: Net 30'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/estimates', testData.user, estimateData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('estimate');
        expect(res.body.data.estimate.estimateNumber).toBe(estimateData.estimateNumber);
        expect(res.body.data.estimate.customerName).toBe(estimateData.customerName);
      });

      it('should return 400 for expired validity date', async () => {
        const estimateData = {
          estimateNumber: 'EST004',
          estimateDate: new Date(),
          customerName: 'Test Customer',
          validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          items: [
            {
              productName: 'Service',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/estimates', testData.user, estimateData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('validity date');
      });
    });

    describe('POST /api/billing/estimates/:id/convert-to-invoice', () => {
      it('should convert estimate to invoice', async () => {
        const Billing = require('../../models/Billing');
        
        const estimate = new Billing.Estimate({
          companyId: testData.company._id,
          estimateNumber: 'EST005',
          estimateDate: new Date(),
          customerName: 'Test Customer',
          customerEmail: 'test@customer.com',
          billingAddress: {
            street: '123 Customer St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          items: [
            {
              productName: 'Service',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          subtotal: 1000,
          taxAmount: 180,
          totalAmount: 1180,
          status: 'approved'
        });
        await estimate.save();

        const res = await testHelpers.authenticatedRequest('post', `/api/billing/estimates/${estimate._id}/convert-to-invoice`, testData.user)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('invoice');
        expect(res.body.data.invoice.invoiceNumber).toBeDefined();
        expect(res.body.data.estimate.status).toBe('converted');
      });

      it('should return 400 for expired estimate', async () => {
        const Billing = require('../../models/Billing');
        
        const estimate = new Billing.Estimate({
          companyId: testData.company._id,
          estimateNumber: 'EST006',
          estimateDate: new Date(),
          customerName: 'Test Customer',
          validUntil: new Date(Date.now() - 24 * 60 * 60 * 1000), // Expired
          items: [
            {
              productName: 'Service',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          status: 'draft'
        });
        await estimate.save();

        const res = await testHelpers.authenticatedRequest('post', `/api/billing/estimates/${estimate._id}/convert-to-invoice`, testData.user)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('expired');
      });
    });
  });

  describe('Customers', () => {
    describe('GET /api/billing/customers', () => {
      it('should get all customers', async () => {
        const CustomerVendor = require('../../models/CustomerVendor');
        
        const customer1 = new CustomerVendor.Customer({
          companyId: testData.company._id,
          name: 'Test Customer 1',
          email: 'customer1@test.com',
          phone: '+91-9876543210',
          type: 'customer',
          billingAddress: {
            street: '123 Customer St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          gstin: '29ABCDE1234F1Z5',
          isActive: true
        });
        await customer1.save();

        const customer2 = new CustomerVendor.Customer({
          companyId: testData.company._id,
          name: 'Test Customer 2',
          email: 'customer2@test.com',
          phone: '+91-9876543211',
          type: 'customer',
          billingAddress: {
            street: '456 Customer St',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          isActive: true
        });
        await customer2.save();

        const res = await testHelpers.authenticatedRequest('get', '/api/billing/customers', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('customers');
        expect(res.body.data.customers.length).toBeGreaterThanOrEqual(2);
      });
    });

    describe('POST /api/billing/customers', () => {
      it('should create a new customer', async () => {
        const customerData = {
          name: 'New Test Customer',
          email: 'new@customer.com',
          phone: '+91-9876543222',
          type: 'customer',
          billingAddress: {
            street: '789 Customer St',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India'
          },
          shippingAddress: {
            street: '789 Ship St',
            city: 'Bangalore',
            state: 'Karnataka',
            zipCode: '560001',
            country: 'India'
          },
          gstin: '29ABCDE5678F1Z5',
          creditLimit: 50000,
          paymentTerms: 30,
          notes: 'Preferred customer'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/customers', testData.user, customerData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('customer');
        expect(res.body.data.customer.name).toBe(customerData.name);
        expect(res.body.data.customer.email).toBe(customerData.email);
        expect(res.body.data.customer.type).toBe('customer');
      });

      it('should validate GSTIN format', async () => {
        const customerData = {
          name: 'Test Customer',
          email: 'test@customer.com',
          phone: '+91-9876543210',
          type: 'customer',
          gstin: 'INVALID_GSTIN'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/customers', testData.user, customerData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('GSTIN');
      });
    });
  });

  describe('Recurring Invoices', () => {
    describe('GET /api/billing/recurring', () => {
      it('should get recurring invoices', async () => {
        // This test depends on the recurring invoice implementation
        const res = await testHelpers.authenticatedRequest('get', '/api/billing/recurring', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('recurringInvoices');
      });
    });

    describe('POST /api/billing/recurring', () => {
      it('should create recurring invoice template', async () => {
        const recurringData = {
          templateName: 'Monthly Service Invoice',
          frequency: 'monthly',
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
          customerName: 'Test Customer',
          customerEmail: 'test@customer.com',
          items: [
            {
              productName: 'Monthly Service',
              quantity: 1,
              rate: 2000,
              taxRate: 18,
              discount: 0
            }
          ],
          notes: 'Automated monthly billing'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/recurring', testData.user, recurringData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('recurringInvoice');
        expect(res.body.data.recurringInvoice.templateName).toBe(recurringData.templateName);
        expect(res.body.data.recurringInvoice.frequency).toBe(recurringData.frequency);
      });

      it('should validate frequency options', async () => {
        const recurringData = {
          templateName: 'Test Template',
          frequency: 'invalid_frequency', // Invalid frequency
          startDate: new Date(),
          customerName: 'Test Customer',
          items: [
            {
              productName: 'Service',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/billing/recurring', testData.user, recurringData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
      });
    });
  });
});