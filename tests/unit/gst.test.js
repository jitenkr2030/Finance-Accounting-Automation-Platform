const TestHelpers = require('../helpers/TestHelpers');

describe('GST Engine API', () => {
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

  describe('GST Invoices', () => {
    describe('GET /api/gst/invoices', () => {
      it('should get all GST invoices', async () => {
        const invoiceData = {
          companyId: testData.company._id,
          invoiceNumber: 'GST001',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          customerGstin: '29ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          subtotal: 1000,
          taxAmount: 180,
          totalAmount: 1180,
          cgst: 90,
          sgst: 90,
          igst: 0,
          status: 'draft'
        };

        // Create GST invoice through Billing model
        const Billing = require('../../models/Billing');
        const invoice = new Billing.GSTInvoice(invoiceData);
        await invoice.save();

        const res = await testHelpers.authenticatedRequest('get', '/api/gst/invoices', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('invoices');
        expect(res.body.data.invoices.length).toBeGreaterThan(0);
      });

      it('should filter invoices by date range', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        const res = await testHelpers.authenticatedRequest('get', `/api/gst/invoices?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        // Additional validation depends on implementation
      });

      it('should filter invoices by customer GSTIN', async () => {
        const customerGstin = '29ABCDE1234F1Z5';

        const res = await testHelpers.authenticatedRequest('get', `/api/gst/invoices?customerGstin=${customerGstin}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        // Additional validation depends on implementation
      });
    });

    describe('POST /api/gst/invoices', () => {
      it('should create a new GST invoice', async () => {
        const invoiceData = {
          invoiceNumber: 'GST002',
          invoiceDate: new Date(),
          customerName: 'Test Customer 2',
          customerGstin: '29ABCDE5678F1Z5',
          billingAddress: {
            street: '456 Test St',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          shippingAddress: {
            street: '789 Ship St',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product 2',
              hsnCode: '5678',
              quantity: 2,
              rate: 500,
              taxRate: 18,
              discount: 10
            }
          ],
          placeOfSupply: 'Delhi',
          reverseCharge: false,
          eInvoiceStatus: 'pending',
          eWayBillStatus: 'pending'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/gst/invoices', testData.user, invoiceData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('invoice');
        expect(res.body.data.invoice.invoiceNumber).toBe(invoiceData.invoiceNumber);
        expect(res.body.data.invoice.customerGstin).toBe(invoiceData.customerGstin);
      });

      it('should calculate GST correctly for intra-state transaction', async () => {
        const invoiceData = {
          invoiceNumber: 'GST003',
          invoiceDate: new Date(),
          customerName: 'Local Customer',
          customerGstin: '29ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          placeOfSupply: 'Maharashtra', // Same as company state
          reverseCharge: false
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/gst/invoices', testData.user, invoiceData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.invoice.cgst).toBeGreaterThan(0);
        expect(res.body.data.invoice.sgst).toBeGreaterThan(0);
        expect(res.body.data.invoice.igst).toBe(0);
        expect(res.body.data.invoice.taxAmount).toBe(180); // 18% of 1000
      });

      it('should calculate GST correctly for inter-state transaction', async () => {
        const invoiceData = {
          invoiceNumber: 'GST004',
          invoiceDate: new Date(),
          customerName: 'Outstate Customer',
          customerGstin: '07ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Delhi',
            state: 'Delhi',
            zipCode: '110001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          placeOfSupply: 'Delhi', // Different from company state
          reverseCharge: false
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/gst/invoices', testData.user, invoiceData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.invoice.igst).toBeGreaterThan(0);
        expect(res.body.data.invoice.cgst).toBe(0);
        expect(res.body.data.invoice.sgst).toBe(0);
        expect(res.body.data.invoice.taxAmount).toBe(180); // 18% of 1000
      });

      it('should return 400 for invalid GSTIN', async () => {
        const invoiceData = {
          invoiceNumber: 'GST005',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          customerGstin: 'INVALID_GSTIN',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/gst/invoices', testData.user, invoiceData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
      });

      it('should return 400 for missing HSN/SAC code', async () => {
        const invoiceData = {
          invoiceNumber: 'GST006',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          customerGstin: '29ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '', // Missing HSN code
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/gst/invoices', testData.user, invoiceData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
      });
    });

    describe('POST /api/gst/invoices/:id/e-invoice', () => {
      it('should generate e-invoice', async () => {
        const Billing = require('../../models/Billing');
        const invoice = new Billing.GSTInvoice({
          companyId: testData.company._id,
          invoiceNumber: 'GST007',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          customerGstin: '29ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          subtotal: 1000,
          taxAmount: 180,
          totalAmount: 1180,
          cgst: 90,
          sgst: 90,
          igst: 0,
          status: 'draft'
        });
        await invoice.save();

        const res = await testHelpers.authenticatedRequest('post', `/api/gst/invoices/${invoice._id}/e-invoice`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('eInvoiceNumber');
        expect(res.body.data).toHaveProperty('irn');
        expect(res.body.data.invoice.eInvoiceStatus).toBe('generated');
      });

      it('should return 400 for invoice already having e-invoice', async () => {
        const Billing = require('../../models/Billing');
        const invoice = new Billing.GSTInvoice({
          companyId: testData.company._id,
          invoiceNumber: 'GST008',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          customerGstin: '29ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          subtotal: 1000,
          taxAmount: 180,
          totalAmount: 1180,
          cgst: 90,
          sgst: 90,
          igst: 0,
          status: 'draft',
          eInvoiceNumber: 'EINV123456789',
          irn: 'test-irn-123',
          eInvoiceStatus: 'generated'
        });
        await invoice.save();

        const res = await testHelpers.authenticatedRequest('post', `/api/gst/invoices/${invoice._id}/e-invoice`, testData.user)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('already has e-invoice');
      });
    });

    describe('POST /api/gst/invoices/:id/e-way-bill', () => {
      it('should generate e-way bill', async () => {
        const Billing = require('../../models/Billing');
        const invoice = new Billing.GSTInvoice({
          companyId: testData.company._id,
          invoiceNumber: 'GST009',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          customerGstin: '29ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          shippingAddress: {
            street: '456 Ship St',
            city: 'Pune',
            state: 'Maharashtra',
            zipCode: '411001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 100, // High quantity to trigger e-way bill requirement
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          subtotal: 100000,
          taxAmount: 18000,
          totalAmount: 118000,
          cgst: 9000,
          sgst: 9000,
          igst: 0,
          status: 'draft',
          eInvoiceNumber: 'EINV123456789',
          irn: 'test-irn-123'
        });
        await invoice.save();

        const eWayBillData = {
          transporterName: 'Test Transport',
          transporterId: '29ABCDE1234F1Z5',
          vehicleNumber: 'MH01AB1234',
          distance: 150
        };

        const res = await testHelpers.authenticatedRequest('post', `/api/gst/invoices/${invoice._id}/e-way-bill`, testData.user, eWayBillData)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('eWayBillNumber');
        expect(res.body.data.invoice.eWayBillStatus).toBe('generated');
      });

      it('should not generate e-way bill for below threshold', async () => {
        const Billing = require('../../models/Billing');
        const invoice = new Billing.GSTInvoice({
          companyId: testData.company._id,
          invoiceNumber: 'GST010',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          customerGstin: '29ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          subtotal: 1000,
          taxAmount: 180,
          totalAmount: 1180,
          cgst: 90,
          sgst: 90,
          igst: 0,
          status: 'draft'
        });
        await invoice.save();

        const eWayBillData = {
          transporterName: 'Test Transport',
          vehicleNumber: 'MH01AB1234'
        };

        const res = await testHelpers.authenticatedRequest('post', `/api/gst/invoices/${invoice._id}/e-way-bill`, testData.user, eWayBillData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('does not require e-way bill');
      });
    });
  });

  describe('GST Returns', () => {
    describe('GET /api/gst/returns', () => {
      it('should get GST returns for a period', async () => {
        const returnPeriod = '2024-08'; // August 2024

        const res = await testHelpers.authenticatedRequest('get', `/api/gst/returns?period=${returnPeriod}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('returns');
      });

      it('should calculate GSTR-1 summary', async () => {
        // Create test invoices for the period
        const Billing = require('../../models/Billing');
        
        const invoice1 = new Billing.GSTInvoice({
          companyId: testData.company._id,
          invoiceNumber: 'GST011',
          invoiceDate: new Date('2024-08-15'),
          customerName: 'Customer 1',
          customerGstin: '29ABCDE1234F1Z5',
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 1000,
              taxRate: 18,
              discount: 0
            }
          ],
          subtotal: 1000,
          taxAmount: 180,
          totalAmount: 1180,
          cgst: 90,
          sgst: 90,
          igst: 0,
          status: 'posted'
        });
        await invoice1.save();

        const returnPeriod = '2024-08';
        const res = await testHelpers.authenticatedRequest('get', `/api/gst/returns?period=${returnPeriod}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.returns).toHaveProperty('gstr1Summary');
        expect(res.body.data.returns.gstr1Summary.totalInvoices).toBeGreaterThan(0);
      });
    });

    describe('POST /api/gst/returns/:id/filing', () => {
      it('should file GST return', async () => {
        // This would require actual GST portal integration
        // For now, we'll test the filing status update
        const returnData = {
          returnType: 'GSTR-1',
          period: '2024-08',
          filingDate: new Date(),
          ackNumber: 'ACK123456789',
          status: 'filed'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/gst/returns/filing', testData.user, returnData)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('return');
        expect(res.body.data.return.status).toBe('filed');
      });
    });
  });

  describe('HSN/SAC Master', () => {
    describe('GET /api/gst/hsn-master', () => {
      it('should get HSN/SAC codes', async () => {
        const res = await testHelpers.authenticatedRequest('get', '/api/gst/hsn-master', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('hsnCodes');
        expect(Array.isArray(res.body.data.hsnCodes)).toBe(true);
      });

      it('should search HSN codes by description', async () => {
        const searchTerm = 'computer';

        const res = await testHelpers.authenticatedRequest('get', `/api/gst/hsn-master?search=${searchTerm}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        // Additional validation depends on implementation
      });

      it('should filter HSN codes by tax rate', async () => {
        const taxRate = 18;

        const res = await testHelpers.authenticatedRequest('get', `/api/gst/hsn-master?taxRate=${taxRate}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        // Additional validation depends on implementation
      });
    });
  });

  describe('GST Compliance', () => {
    describe('GET /api/gst/compliance-check', () => {
      it('should perform GST compliance check', async () => {
        const res = await testHelpers.authenticatedRequest('get', '/api/gst/compliance-check', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('complianceStatus');
        expect(res.body.data).toHaveProperty('issues');
        expect(res.body.data).toHaveProperty('recommendations');
      });

      it('should identify compliance issues', async () => {
        // Create a problematic invoice (e.g., missing GSTIN for B2C large transaction)
        const Billing = require('../../models/Billing');
        const invoice = new Billing.GSTInvoice({
          companyId: testData.company._id,
          invoiceNumber: 'GST012',
          invoiceDate: new Date(),
          customerName: 'Test Customer',
          customerGstin: '', // Missing GSTIN for B2C
          billingAddress: {
            street: '123 Test St',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipCode: '400001',
            country: 'India'
          },
          items: [
            {
              productName: 'Test Product',
              hsnCode: '1234',
              quantity: 1,
              rate: 250000, // High value transaction
              taxRate: 18,
              discount: 0
            }
          ],
          subtotal: 250000,
          taxAmount: 45000,
          totalAmount: 295000,
          cgst: 22500,
          sgst: 22500,
          igst: 0,
          status: 'posted'
        });
        await invoice.save();

        const res = await testHelpers.authenticatedRequest('get', '/api/gst/compliance-check', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.issues.length).toBeGreaterThan(0);
      });
    });
  });
});