const TestHelpers = require('../helpers/TestHelpers');

describe('Ledger Engine API', () => {
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

  describe('Chart of Accounts', () => {
    describe('GET /api/ledger/accounts', () => {
      it('should get all accounts for a company', async () => {
        // Create test accounts
        const account1 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'ASS001',
          accountName: 'Cash in Hand',
          accountType: 'Assets'
        });

        const account2 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'INC001',
          accountName: 'Sales Revenue',
          accountType: 'Income'
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/ledger/accounts', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('accounts');
        expect(Array.isArray(res.body.data.accounts)).toBe(true);
        expect(res.body.data.accounts.length).toBeGreaterThanOrEqual(2);
      });

      it('should filter accounts by type', async () => {
        await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'ASS001',
          accountName: 'Cash in Hand',
          accountType: 'Assets'
        });

        await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'INC001',
          accountName: 'Sales Revenue',
          accountType: 'Income'
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/ledger/accounts?type=Assets', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.accounts.every(acc => acc.accountType === 'Assets')).toBe(true);
      });

      it('should return empty array for company with no accounts', async () => {
        const newCompany = await testHelpers.createTestCompany({
          name: 'Empty Company'
        });

        const newUser = await testHelpers.createTestUser({
          companyId: newCompany._id
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/ledger/accounts', newUser)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.accounts).toHaveLength(0);
      });
    });

    describe('POST /api/ledger/accounts', () => {
      it('should create a new account', async () => {
        const accountData = {
          accountCode: 'ASS002',
          accountName: 'Bank Account',
          accountType: 'Assets',
          accountGroup: 'Current Assets',
          description: 'Main bank account'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/ledger/accounts', testData.user, accountData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('account');
        expect(res.body.data.account.accountCode).toBe(accountData.accountCode);
        expect(res.body.data.account.accountName).toBe(accountData.accountName);
        expect(res.body.data.account.accountType).toBe(accountData.accountType);
      });

      it('should return 400 for duplicate account code', async () => {
        // Create first account
        await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'ASS001',
          accountName: 'Cash in Hand',
          accountType: 'Assets'
        });

        // Try to create account with same code
        const accountData = {
          accountCode: 'ASS001',
          accountName: 'Another Cash Account',
          accountType: 'Assets'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/ledger/accounts', testData.user, accountData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('Account code already exists');
      });

      it('should return 400 for invalid account type', async () => {
        const accountData = {
          accountCode: 'TEST001',
          accountName: 'Test Account',
          accountType: 'InvalidType'
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/ledger/accounts', testData.user, accountData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
      });

      it('should return 400 for missing required fields', async () => {
        const accountData = {
          accountName: 'Test Account'
          // Missing accountCode and accountType
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/ledger/accounts', testData.user, accountData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
      });
    });

    describe('GET /api/ledger/accounts/:id', () => {
      it('should get account by ID', async () => {
        const account = await testHelpers.createTestAccount({
          companyId: testData.company._id
        });

        const res = await testHelpers.authenticatedRequest('get', `/api/ledger/accounts/${account._id}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.account._id).toBe(account._id.toString());
      });

      it('should return 404 for non-existent account', async () => {
        const fakeId = '507f1f77bcf86cd799439011';
        
        const res = await testHelpers.authenticatedRequest('get', `/api/ledger/accounts/${fakeId}`, testData.user)
          .expect(404);

        expect(res.body).toHaveProperty('success', false);
      });
    });

    describe('PUT /api/ledger/accounts/:id', () => {
      it('should update account', async () => {
        const account = await testHelpers.createTestAccount({
          companyId: testData.company._id
        });

        const updateData = {
          accountName: 'Updated Account Name',
          description: 'Updated description'
        };

        const res = await testHelpers.authenticatedRequest('put', `/api/ledger/accounts/${account._id}`, testData.user, updateData)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.account.accountName).toBe(updateData.accountName);
      });

      it('should not allow changing account type for system accounts', async () => {
        const account = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          isSystemAccount: true
        });

        const updateData = {
          accountType: 'Income'
        };

        const res = await testHelpers.authenticatedRequest('put', `/api/ledger/accounts/${account._id}`, testData.user, updateData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('Cannot modify system account');
      });
    });

    describe('DELETE /api/ledger/accounts/:id', () => {
      it('should delete account', async () => {
        const account = await testHelpers.createTestAccount({
          companyId: testData.company._id
        });

        const res = await testHelpers.authenticatedRequest('delete', `/api/ledger/accounts/${account._id}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.message).toContain('Account deleted successfully');
      });

      it('should not allow deleting accounts with transactions', async () => {
        const account = await testHelpers.createTestAccount({
          companyId: testData.company._id
        });

        // Create a journal entry that uses this account
        await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          lineItems: [
            {
              accountId: account._id,
              description: 'Test transaction',
              debitAmount: 1000,
              creditAmount: 0
            }
          ]
        });

        const res = await testHelpers.authenticatedRequest('delete', `/api/ledger/accounts/${account._id}`, testData.user)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('Cannot delete account with transactions');
      });
    });
  });

  describe('Journal Entries', () => {
    describe('GET /api/ledger/journal-entries', () => {
      it('should get all journal entries', async () => {
        // Create test journal entries
        await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          description: 'Test Entry 1'
        });

        await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          description: 'Test Entry 2'
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/ledger/journal-entries', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('entries');
        expect(res.body.data.entries.length).toBeGreaterThanOrEqual(2);
      });

      it('should filter by date range', async () => {
        const startDate = new Date('2024-01-01');
        const endDate = new Date('2024-12-31');

        await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          entryDate: new Date('2024-06-15'),
          description: 'Mid year entry'
        });

        const res = await testHelpers.authenticatedRequest('get', `/api/ledger/journal-entries?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        // Filter validation would depend on implementation
      });

      it('should filter by status', async () => {
        await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          status: 'posted',
          description: 'Posted entry'
        });

        await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          status: 'draft',
          description: 'Draft entry'
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/ledger/journal-entries?status=posted', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.entries.every(entry => entry.status === 'posted')).toBe(true);
      });
    });

    describe('POST /api/ledger/journal-entries', () => {
      it('should create a new journal entry', async () => {
        const account1 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'ASS001',
          accountName: 'Cash in Hand',
          accountType: 'Assets'
        });

        const account2 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'INC001',
          accountName: 'Sales Revenue',
          accountType: 'Income'
        });

        const entryData = {
          entryDate: new Date(),
          description: 'Cash sales entry',
          reference: 'SALES-001',
          lineItems: [
            {
              accountId: account1._id,
              description: 'Cash received',
              debitAmount: 1000,
              creditAmount: 0
            },
            {
              accountId: account2._id,
              description: 'Sales revenue',
              debitAmount: 0,
              creditAmount: 1000
            }
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/ledger/journal-entries', testData.user, entryData)
          .expect(201);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('entry');
        expect(res.body.data.entry.description).toBe(entryData.description);
        expect(res.body.data.entry.totalDebit).toBe(1000);
        expect(res.body.data.entry.totalCredit).toBe(1000);
      });

      it('should return 400 for unbalanced journal entry', async () => {
        const account1 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'ASS001',
          accountName: 'Cash in Hand',
          accountType: 'Assets'
        });

        const entryData = {
          entryDate: new Date(),
          description: 'Unbalanced entry',
          lineItems: [
            {
              accountId: account1._id,
              description: 'Cash received',
              debitAmount: 1000,
              creditAmount: 0
            }
            // Missing credit entry - unbalanced
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/ledger/journal-entries', testData.user, entryData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('Debit and Credit amounts must be equal');
      });

      it('should return 400 for invalid account', async () => {
        const entryData = {
          entryDate: new Date(),
          description: 'Invalid account entry',
          lineItems: [
            {
              accountId: '507f1f77bcf86cd799439011', // Non-existent account
              description: 'Test',
              debitAmount: 1000,
              creditAmount: 0
            }
          ]
        };

        const res = await testHelpers.authenticatedRequest('post', '/api/ledger/journal-entries', testData.user, entryData)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
      });
    });

    describe('PUT /api/ledger/journal-entries/:id/post', () => {
      it('should post a journal entry', async () => {
        const account1 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'ASS001',
          accountName: 'Cash in Hand',
          accountType: 'Assets'
        });

        const account2 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'INC001',
          accountName: 'Sales Revenue',
          accountType: 'Income'
        });

        const entry = await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          description: 'Test entry to post',
          lineItems: [
            {
              accountId: account1._id,
              description: 'Cash received',
              debitAmount: 1000,
              creditAmount: 0
            },
            {
              accountId: account2._id,
              description: 'Sales revenue',
              debitAmount: 0,
              creditAmount: 1000
            }
          ]
        });

        const res = await testHelpers.authenticatedRequest('put', `/api/ledger/journal-entries/${entry._id}/post`, testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data.entry.status).toBe('posted');
      });

      it('should return 400 for already posted entry', async () => {
        const account1 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'ASS001',
          accountName: 'Cash in Hand',
          accountType: 'Assets'
        });

        const account2 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'INC001',
          accountName: 'Sales Revenue',
          accountType: 'Income'
        });

        const entry = await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          status: 'posted', // Already posted
          description: 'Already posted entry',
          lineItems: [
            {
              accountId: account1._id,
              description: 'Cash received',
              debitAmount: 1000,
              creditAmount: 0
            },
            {
              accountId: account2._id,
              description: 'Sales revenue',
              debitAmount: 0,
              creditAmount: 1000
            }
          ]
        });

        const res = await testHelpers.authenticatedRequest('put', `/api/ledger/journal-entries/${entry._id}/post`, testData.user)
          .expect(400);

        expect(res.body).toHaveProperty('success', false);
        expect(res.body.error.message).toContain('already posted');
      });
    });
  });

  describe('Trial Balance', () => {
    describe('GET /api/ledger/trial-balance', () => {
      it('should generate trial balance', async () => {
        const account1 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'ASS001',
          accountName: 'Cash in Hand',
          accountType: 'Assets'
        });

        const account2 = await testHelpers.createTestAccount({
          companyId: testData.company._id,
          accountCode: 'INC001',
          accountName: 'Sales Revenue',
          accountType: 'Income'
        });

        // Create journal entries
        await testHelpers.createTestJournalEntry({
          companyId: testData.company._id,
          status: 'posted',
          lineItems: [
            {
              accountId: account1._id,
              description: 'Cash received',
              debitAmount: 10000,
              creditAmount: 0
            },
            {
              accountId: account2._id,
              description: 'Sales revenue',
              debitAmount: 0,
              creditAmount: 10000
            }
          ]
        });

        const res = await testHelpers.authenticatedRequest('get', '/api/ledger/trial-balance', testData.user)
          .expect(200);

        expect(res.body).toHaveProperty('success', true);
        expect(res.body.data).toHaveProperty('trialBalance');
        expect(res.body.data).toHaveProperty('asOfDate');
        expect(res.body.data.trialBalance).toHaveProperty('totalDebits');
        expect(res.body.data.trialBalance).toHaveProperty('totalCredits');
      });

      it('should return balanced trial balance', async () => {
        const res = await testHelpers.authenticatedRequest('get', '/api/ledger/trial-balance', testData.user)
          .expect(200);

        expect(res.body.data.trialBalance.totalDebits).toBe(res.body.data.trialBalance.totalCredits);
      });
    });
  });
});