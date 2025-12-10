// MongoDB Initialization Script
// This script creates the initial database and sets up basic configuration

print('Starting MongoDB initialization...');

// Switch to the finance platform database
db = db.getSiblingDB('finance_platform');

// Create collections with validation
db.createCollection('users', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["email", "password", "firstName", "lastName", "role"],
         properties: {
            email: {
               bsonType: "string",
               pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
            },
            password: {
               bsonType: "string",
               minLength: 6
            },
            firstName: {
               bsonType: "string",
               minLength: 1,
               maxLength: 50
            },
            lastName: {
               bsonType: "string",
               minLength: 1,
               maxLength: 50
            },
            role: {
               enum: ["admin", "accountant", "user"]
            },
            isActive: {
               bsonType: "bool"
            },
            createdAt: {
               bsonType: "date"
            },
            updatedAt: {
               bsonType: "date"
            }
         }
      }
   }
});

db.createCollection('companies', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["name", "legalName", "settings"],
         properties: {
            name: {
               bsonType: "string",
               minLength: 1,
               maxLength: 100
            },
            legalName: {
               bsonType: "string",
               minLength: 1,
               maxLength: 200
            },
            gstNumber: {
               bsonType: "string",
               pattern: "^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
            },
            panNumber: {
               bsonType: "string",
               pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
            },
            settings: {
               bsonType: "object"
            }
         }
      }
   }
});

db.createCollection('ledgers', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["code", "name", "type"],
         properties: {
            code: {
               bsonType: "string",
               minLength: 1,
               maxLength: 20
            },
            name: {
               bsonType: "string",
               minLength: 1,
               maxLength: 100
            },
            type: {
               enum: ["asset", "liability", "equity", "revenue", "expense"]
            },
            parentCode: {
               bsonType: "string"
            },
            openingBalance: {
               bsonType: "number"
            },
            currentBalance: {
               bsonType: "number"
            }
         }
      }
   }
});

db.createCollection('invoices', {
   validator: {
      $jsonSchema: {
         bsonType: "object",
         required: ["invoiceNumber", "customer", "date", "items"],
         properties: {
            invoiceNumber: {
               bsonType: "string",
               minLength: 1,
               maxLength: 50
            },
            customer: {
               bsonType: "string"
            },
            date: {
               bsonType: "date"
            },
            dueDate: {
               bsonType: "date"
            },
            items: {
               bsonType: "array",
               items: {
                  bsonType: "object"
               }
            },
            subtotal: {
               bsonType: "number"
            },
            taxAmount: {
               bsonType: "number"
            },
            total: {
               bsonType: "number"
            },
            status: {
               enum: ["draft", "sent", "viewed", "paid", "overdue", "cancelled"]
            }
         }
      }
   }
});

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "company": 1 });
db.users.createIndex({ "role": 1 });

db.companies.createIndex({ "name": 1 }, { unique: true });
db.companies.createIndex({ "gstNumber": 1 }, { unique: true, sparse: true });
db.companies.createIndex({ "panNumber": 1 }, { unique: true, sparse: true });

db.ledgers.createIndex({ "code": 1 }, { unique: true });
db.ledgers.createIndex({ "type": 1 });
db.ledgers.createIndex({ "company": 1 });
db.ledgers.createIndex({ "parentCode": 1 });

db.invoices.createIndex({ "invoiceNumber": 1 }, { unique: true });
db.invoices.createIndex({ "customer": 1 });
db.invoices.createIndex({ "date": -1 });
db.invoices.createIndex({ "status": 1 });
db.invoices.createIndex({ "company": 1 });

// Create a default admin user (password will be hashed by the application)
db.users.insertOne({
   email: "admin@financeplatform.com",
   password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpQQk/O3R3yvy", // admin123
   firstName: "Admin",
   lastName: "User",
   role: "admin",
   isActive: true,
   company: null,
   createdAt: new Date(),
   updatedAt: new Date()
});

// Create a default company
const companyId = ObjectId();
db.companies.insertOne({
   _id: companyId,
   name: "Demo Company",
   legalName: "Demo Company Private Limited",
   gstNumber: "29ABCDE1234F1Z5",
   panNumber: "ABCDE1234F",
   address: {
      street: "123 Business Street",
      city: "Bangalore",
      state:",
      pincode "Karnataka: "560001",
      country: "India"
   },
   settings: {
      currency: "INR",
      dateFormat: "DD/MM/YYYY",
      timeZone: "Asia/Kolkata",
      financialYearStart: "04/01"
   },
   createdAt: new Date(),
   updatedAt: new Date()
});

// Update admin user with company reference
db.users.updateOne(
   { email: "admin@financeplatform.com" },
   { $set: { company: companyId } }
);

// Insert sample chart of accounts
const sampleAccounts = [
   // Assets
   { code: "1000", name: "ASSETS", type: "asset", parentCode: null, openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "1100", name: "Current Assets", type: "asset", parentCode: "1000", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "1110", name: "Cash and Bank Balances", type: "asset", parentCode: "1100", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "1111", name: "Cash in Hand", type: "asset", parentCode: "1110", openingBalance: 50000, currentBalance: 50000, company: companyId },
   { code: "1112", name: "Bank Accounts", type: "asset", parentCode: "1110", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "1112-001", name: "State Bank of India - Current Account", type: "asset", parentCode: "1112", openingBalance: 300000, currentBalance: 300000, company: companyId },
   { code: "1112-002", name: "HDFC Bank - Savings Account", type: "asset", parentCode: "1112", openingBalance: 150000, currentBalance: 150000, company: companyId },
   { code: "1120", name: "Trade Receivables", type: "asset", parentCode: "1100", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "1121", name: "Accounts Receivable", type: "asset", parentCode: "1120", openingBalance: 750000, currentBalance: 750000, company: companyId },
   
   // Liabilities
   { code: "2000", name: "LIABILITIES", type: "liability", parentCode: null, openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "2100", name: "Current Liabilities", type: "liability", parentCode: "2000", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "2110", name: "Trade Payables", type: "liability", parentCode: "2100", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "2111", name: "Accounts Payable", type: "liability", parentCode: "2110", openingBalance: 200000, currentBalance: 200000, company: companyId },
   { code: "2120", name: "GST Payable", type: "liability", parentCode: "2100", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "2121", name: "CGST Payable", type: "liability", parentCode: "2120", openingBalance: 25000, currentBalance: 25000, company: companyId },
   { code: "2122", name: "SGST Payable", type: "liability", parentCode: "2120", openingBalance: 25000, currentBalance: 25000, company: companyId },
   
   // Equity
   { code: "3000", name: "EQUITY", type: "equity", parentCode: null, openingBalance: 1000000, currentBalance: 1000000, company: companyId },
   { code: "3100", name: "Share Capital", type: "equity", parentCode: "3000", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "3101", name: "Equity Share Capital", type: "equity", parentCode: "3100", openingBalance: 1000000, currentBalance: 1000000, company: companyId },
   
   // Revenue
   { code: "4000", name: "REVENUE", type: "revenue", parentCode: null, openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "4100", name: "Sales Revenue", type: "revenue", parentCode: "4000", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "4101", name: "Product Sales", type: "revenue", parentCode: "4100", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "4102", name: "Service Revenue", type: "revenue", parentCode: "4100", openingBalance: 0, currentBalance: 0, company: companyId },
   
   // Expenses
   { code: "5000", name: "EXPENSES", type: "expense", parentCode: null, openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "5100", name: "Cost of Goods Sold", type: "expense", parentCode: "5000", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "5101", name: "Material Costs", type: "expense", parentCode: "5100", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "5200", name: "Operating Expenses", type: "expense", parentCode: "5000", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "5201", name: "Salaries and Wages", type: "expense", parentCode: "5200", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "5202", name: "Rent and Utilities", type: "expense", parentCode: "5200", openingBalance: 0, currentBalance: 0, company: companyId },
   { code: "5203", name: "Office Expenses", type: "expense", parentCode: "5200", openingBalance: 0, currentBalance: 0, company: companyId }
];

db.ledgers.insertMany(sampleAccounts);

print('MongoDB initialization completed successfully!');
print('Default admin user created: admin@financeplatform.com / admin123');
print('Default company created with sample chart of accounts');