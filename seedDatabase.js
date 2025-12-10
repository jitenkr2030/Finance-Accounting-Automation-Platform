const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Company = require('./models/Company');
const Ledger = require('./models/Ledger');
const GST = require('./models/GST');
const Billing = require('./models/Billing');
const Payroll = require('./models/Payroll');
const CustomerVendor = require('./models/CustomerVendor');
const Inventory = require('./models/Inventory');

const seedData = {
  users: [
    {
      email: 'admin@financeplatform.com',
      password: 'admin123', // Will be hashed
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin'
    },
    {
      email: 'accountant@financeplatform.com',
      password: 'accountant123', // Will be hashed
      firstName: 'John',
      lastName: 'Accountant',
      role: 'accountant'
    },
    {
      email: 'user@financeplatform.com',
      password: 'user123', // Will be hashed
      firstName: 'Jane',
      lastName: 'User',
      role: 'user'
    }
  ],

  companies: [
    {
      name: 'TechCorp Solutions Pvt Ltd',
      legalName: 'TechCorp Solutions Private Limited',
      gstNumber: '29ABCDE1234F1Z5',
      panNumber: 'ABCDE1234F',
      address: {
        street: '123 Business Street',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India'
      },
      settings: {
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeZone: 'Asia/Kolkata',
        financialYearStart: '04/01'
      }
    }
  ],

  accounts: [
    // Assets
    { code: '1000', name: 'ASSETS', type: 'asset', parentCode: null, openingBalance: 0 },
    { code: '1100', name: 'Current Assets', type: 'asset', parentCode: '1000', openingBalance: 0 },
    { code: '1110', name: 'Cash and Bank Balances', type: 'asset', parentCode: '1100', openingBalance: 500000 },
    { code: '1111', name: 'Cash in Hand', type: 'asset', parentCode: '1110', openingBalance: 50000 },
    { code: '1112', name: 'Bank Accounts', type: 'asset', parentCode: '1110', openingBalance: 450000 },
    { code: '1112-001', name: 'State Bank of India - Current Account', type: 'asset', parentCode: '1112', openingBalance: 300000 },
    { code: '1112-002', name: 'HDFC Bank - Savings Account', type: 'asset', parentCode: '1112', openingBalance: 150000 },
    { code: '1120', name: 'Trade Receivables', type: 'asset', parentCode: '1100', openingBalance: 750000 },
    { code: '1121', name: 'Accounts Receivable', type: 'asset', parentCode: '1120', openingBalance: 750000 },
    { code: '1130', name: 'Inventory', type: 'asset', parentCode: '1100', openingBalance: 300000 },
    { code: '1131', name: 'Finished Goods', type: 'asset', parentCode: '1130', openingBalance: 200000 },
    { code: '1132', name: 'Raw Materials', type: 'asset', parentCode: '1130', openingBalance: 100000 },

    // Liabilities
    { code: '2000', name: 'LIABILITIES', type: 'liability', parentCode: null, openingBalance: 0 },
    { code: '2100', name: 'Current Liabilities', type: 'liability', parentCode: '2000', openingBalance: 0 },
    { code: '2110', name: 'Trade Payables', type: 'liability', parentCode: '2100', openingBalance: 200000 },
    { code: '2111', name: 'Accounts Payable', type: 'liability', parentCode: '2110', openingBalance: 200000 },
    { code: '2120', name: 'GST Payable', type: 'liability', parentCode: '2100', openingBalance: 50000 },
    { code: '2121', name: 'CGST Payable', type: 'liability', parentCode: '2120', openingBalance: 25000 },
    { code: '2122', name: 'SGST Payable', type: 'liability', parentCode: '2120', openingBalance: 25000 },

    // Equity
    { code: '3000', name: 'EQUITY', type: 'equity', parentCode: null, openingBalance: 1000000 },
    { code: '3100', name: 'Share Capital', type: 'equity', parentCode: '3000', openingBalance: 1000000 },
    { code: '3101', name: 'Equity Share Capital', type: 'equity', parentCode: '3100', openingBalance: 1000000 },
    { code: '3200', name: 'Retained Earnings', type: 'equity', parentCode: '3000', openingBalance: 0 },

    // Revenue
    { code: '4000', name: 'REVENUE', type: 'revenue', parentCode: null, openingBalance: 0 },
    { code: '4100', name: 'Sales Revenue', type: 'revenue', parentCode: '4000', openingBalance: 0 },
    { code: '4101', name: 'Product Sales', type: 'revenue', parentCode: '4100', openingBalance: 0 },
    { code: '4102', name: 'Service Revenue', type: 'revenue', parentCode: '4100', openingBalance: 0 },

    // Expenses
    { code: '5000', name: 'EXPENSES', type: 'expense', parentCode: null, openingBalance: 0 },
    { code: '5100', name: 'Cost of Goods Sold', type: 'expense', parentCode: '5000', openingBalance: 0 },
    { code: '5101', name: 'Material Costs', type: 'expense', parentCode: '5100', openingBalance: 0 },
    { code: '5200', name: 'Operating Expenses', type: 'expense', parentCode: '5000', openingBalance: 0 },
    { code: '5201', name: 'Salaries and Wages', type: 'expense', parentCode: '5200', openingBalance: 0 },
    { code: '5202', name: 'Rent and Utilities', type: 'expense', parentCode: '5200', openingBalance: 0 },
    { code: '5203', name: 'Office Expenses', type: 'expense', parentCode: '5200', openingBalance: 0 }
  ],

  customers: [
    {
      name: 'ABC Enterprises',
      type: 'customer',
      email: 'contact@abcenterprises.com',
      phone: '+91-9876543210',
      gstNumber: '29FGHIJ5678K1Z5',
      billingAddress: {
        street: '456 Customer Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      },
      paymentTerms: 30,
      creditLimit: 500000
    },
    {
      name: 'XYZ Corporation',
      type: 'customer',
      email: 'info@xyzcorp.com',
      phone: '+91-8765432109',
      gstNumber: '27KLMNO9012P3Z5',
      billingAddress: {
        street: '789 Business Ave',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411001',
        country: 'India'
      },
      paymentTerms: 15,
      creditLimit: 750000
    }
  ],

  vendors: [
    {
      name: 'Supplier Industries Ltd',
      type: 'vendor',
      email: 'sales@supplier.com',
      phone: '+91-7654321098',
      gstNumber: '29QRSTU3456V7Z5',
      billingAddress: {
        street: '321 Vendor Road',
        city: 'Chennai',
        state: 'Tamil Nadu',
        pincode: '600001',
        country: 'India'
      },
      paymentTerms: 45
    },
    {
      name: 'Services Provider',
      type: 'vendor',
      email: 'contact@services.com',
      phone: '+91-6543210987',
      gstNumber: '27WXYZ7890A1Z5',
      billingAddress: {
        street: '654 Service Lane',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        country: 'India'
      },
      paymentTerms: 30
    }
  ],

  products: [
    {
      name: 'Software License',
      type: 'product',
      sku: 'SOFT-001',
      unit: 'License',
      rate: 50000,
      hsnCode: '85234000',
      gstRate: 18,
      openingStock: 0,
      minStockLevel: 0,
      category: 'Software'
    },
    {
      name: 'Consulting Services',
      type: 'service',
      sku: 'CONS-001',
      unit: 'Hour',
      rate: 2000,
      hsnCode: '998314',
      gstRate: 18,
      openingStock: 0,
      minStockLevel: 0,
      category: 'Services'
    }
  ],

  employees: [
    {
      employeeId: 'EMP001',
      firstName: 'Rajesh',
      lastName: 'Sharma',
      email: 'rajesh.sharma@techcorp.com',
      phone: '+91-9876543211',
      department: 'Engineering',
      position: 'Senior Developer',
      salary: 80000,
      joinDate: new Date('2023-01-15'),
      bankDetails: {
        accountNumber: '12345678901',
        bankName: 'State Bank of India',
        ifscCode: 'SBIN0001234'
      },
      pfNumber: 'MH123456789012',
      esiNumber: '12345678901',
      panNumber: 'ABCDE1234F'
    },
    {
      employeeId: 'EMP002',
      firstName: 'Priya',
      lastName: 'Patel',
      email: 'priya.patel@techcorp.com',
      phone: '+91-9876543212',
      department: 'Marketing',
      position: 'Marketing Manager',
      salary: 65000,
      joinDate: new Date('2023-03-01'),
      bankDetails: {
        accountNumber: '98765432109',
        bankName: 'HDFC Bank',
        ifscCode: 'HDFC0001234'
      },
      pfNumber: 'MH987654321012',
      esiNumber: '98765432109',
      panNumber: 'GHIJK5678L9M'
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finance_platform');
    console.log('📡 Connected to MongoDB');

    // Clear existing data (optional - be careful in production)
    await User.deleteMany({});
    await Company.deleteMany({});
    await Ledger.deleteMany({});
    await CustomerVendor.deleteMany({});
    await Inventory.deleteMany({});
    await Payroll.deleteMany({});
    await GST.deleteMany({});
    await Billing.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create users with hashed passwords
    console.log('👥 Creating users...');
    const hashedUsers = await Promise.all(
      seedData.users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 12)
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Create companies
    console.log('🏢 Creating companies...');
    const companyIds = [];
    for (const companyData of seedData.companies) {
      const company = new Company(companyData);
      await company.save();
      companyIds.push(company._id);
      console.log(`✅ Created company: ${company.name}`);
    }

    // Assign company to users
    await User.updateMany(
      { email: { $in: seedData.users.map(u => u.email) } },
      { company: companyIds[0] }
    );

    // Create accounts/chart of accounts
    console.log('📊 Creating chart of accounts...');
    const accountIds = new Map();
    for (const accountData of seedData.accounts) {
      const account = new Ledger(accountData);
      await account.save();
      accountIds.set(accountData.code, account._id);
      console.log(`✅ Created account: ${accountData.name}`);
    }

    // Create customers and vendors
    console.log('🤝 Creating customers and vendors...');
    const customerVendorIds = [];

    // Create customers
    for (const customerData of seedData.customers) {
      const customer = new CustomerVendor(customerData);
      customer.company = companyIds[0];
      await customer.save();
      customerVendorIds.push(customer._id);
      console.log(`✅ Created customer: ${customerData.name}`);
    }

    // Create vendors
    for (const vendorData of seedData.vendors) {
      const vendor = new CustomerVendor(vendorData);
      vendor.company = companyIds[0];
      await vendor.save();
      customerVendorIds.push(vendor._id);
      console.log(`✅ Created vendor: ${vendorData.name}`);
    }

    // Create products and services
    console.log('📦 Creating products and services...');
    for (const productData of seedData.products) {
      const product = new Inventory(productData);
      product.company = companyIds[0];
      await product.save();
      console.log(`✅ Created product: ${productData.name}`);
    }

    // Create employees
    console.log('👨‍💼 Creating employees...');
    for (const employeeData of seedData.employees) {
      const employee = new Payroll(employeeData);
      employee.company = companyIds[0];
      await employee.save();
      console.log(`✅ Created employee: ${employeeData.firstName} ${employeeData.lastName}`);
    }

    // Create sample journal entries
    console.log('📝 Creating sample journal entries...');
    const sampleJournalEntries = [
      {
        entryNumber: 'JE-001',
        date: new Date('2024-01-01'),
        description: 'Opening Balance Entry',
        entries: [
          {
            account: accountIds.get('1111'),
            debit: 50000,
            credit: 0,
            description: 'Cash in Hand Opening'
          },
          {
            account: accountIds.get('1112-001'),
            debit: 300000,
            credit: 0,
            description: 'SBI Current Account Opening'
          },
          {
            account: accountIds.get('1112-002'),
            debit: 150000,
            credit: 0,
            description: 'HDFC Savings Account Opening'
          },
          {
            account: accountIds.get('3101'),
            debit: 0,
            credit: 500000,
            description: 'Share Capital'
          }
        ],
        totalDebit: 500000,
        totalCredit: 500000,
        status: 'posted'
      }
    ];

    for (const journalEntry of sampleJournalEntries) {
      const entry = new Ledger(journalEntry);
      entry.company = companyIds[0];
      await entry.save();
      console.log(`✅ Created journal entry: ${journalEntry.entryNumber}`);
    }

    // Create sample invoices
    console.log('🧾 Creating sample invoices...');
    const sampleInvoices = [
      {
        invoiceNumber: 'INV-001',
        customer: customerVendorIds[0], // ABC Enterprises
        date: new Date('2024-01-15'),
        dueDate: new Date('2024-02-14'),
        items: [
          {
            description: 'Software License - Annual',
            quantity: 2,
            rate: 50000,
            amount: 100000,
            taxRate: 18
          }
        ],
        subtotal: 100000,
        taxAmount: 18000,
        total: 118000,
        status: 'sent'
      }
    ];

    for (const invoice of sampleInvoices) {
      const invoiceDoc = new Billing(invoice);
      invoiceDoc.company = companyIds[0];
      await invoiceDoc.save();
      console.log(`✅ Created invoice: ${invoice.invoiceNumber}`);
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Users: ${createdUsers.length}`);
    console.log(`- Companies: ${companyIds.length}`);
    console.log(`- Accounts: ${seedData.accounts.length}`);
    console.log(`- Customers/Vendors: ${customerVendorIds.length}`);
    console.log(`- Products: ${seedData.products.length}`);
    console.log(`- Employees: ${seedData.employees.length}`);
    console.log(`- Journal Entries: ${sampleJournalEntries.length}`);
    console.log(`- Invoices: ${sampleInvoices.length}`);

    console.log('\n🔑 Default Login Credentials:');
    console.log('Admin: admin@financeplatform.com / admin123');
    console.log('Accountant: accountant@financeplatform.com / accountant123');
    console.log('User: user@financeplatform.com / user123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('📡 Disconnected from MongoDB');
  }
}

// Run seeding if called directly
if (require.main === module) {
  require('dotenv').config();
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase, seedData };