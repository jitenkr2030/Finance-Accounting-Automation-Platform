const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Employee = sequelize.define('Employee', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  employeeNumber: {
    type: DataTypes.STRING,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  middleName: {
    type: DataTypes.STRING,
  },
  fullName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  phoneNumber: {
    type: DataTypes.STRING,
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
  },
  maritalStatus: {
    type: DataTypes.ENUM('single', 'married', 'divorced', 'widowed'),
  },
  
  // Employment details
  employeeType: {
    type: DataTypes.ENUM('permanent', 'contract', 'temporary', 'intern', 'consultant'),
    defaultValue: 'permanent',
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  reportingManagerId: {
    type: DataTypes.UUID,
  },
  workLocation: {
    type: DataTypes.STRING,
  },
  
  // Dates
  dateOfJoining: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  confirmationDate: {
    type: DataTypes.DATEONLY,
  },
  resignationDate: {
    type: DataTypes.DATEONLY,
  },
  lastWorkingDay: {
    type: DataTypes.DATEONLY,
  },
  
  // Compensation
  basicSalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  hra: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  specialAllowance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  otherAllowances: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  grossSalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Bank details
  bankName: {
    type: DataTypes.STRING,
  },
  bankAccountNumber: {
    type: DataTypes.STRING,
  },
  bankAccountName: {
    type: DataTypes.STRING,
  },
  ifscCode: {
    type: DataTypes.STRING,
  },
  branchName: {
    type: DataTypes.STRING,
  },
  accountType: {
    type: DataTypes.ENUM('savings', 'current'),
    defaultValue: 'savings',
  },
  
  // Tax information
  panNumber: {
    type: DataTypes.STRING,
  },
  aadharNumber: {
    type: DataTypes.STRING,
  },
  uanNumber: {
    type: DataTypes.STRING,
  },
  
  // PF and ESI
  pfNumber: {
    type: DataTypes.STRING,
  },
  esiNumber: {
    type: DataTypes.STRING,
  },
  pfEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  esiEligible: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  
  // Leave details
  leaveBalance: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  leavePolicyId: {
    type: DataTypes.UUID,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'on_leave', 'terminated', 'resigned'),
    defaultValue: 'active',
  },
  
  // Personal information
  fatherName: {
    type: DataTypes.STRING,
  },
  motherName: {
    type: DataTypes.STRING,
  },
  spouseName: {
    type: DataTypes.STRING,
  },
  emergencyContact: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  permanentAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  currentAddress: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Documents
  profilePicture: {
    type: DataTypes.STRING,
  },
  documents: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  // Custom fields
  customFields: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
  
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'employees',
});

const PayrollRun = sequelize.define('PayrollRun', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  payrollPeriod: {
    type: DataTypes.STRING, // Format: YYYY-MM
    allowNull: false,
  },
  payPeriodStart: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  payPeriodEnd: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  payDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'calculated', 'approved', 'processed', 'paid'),
    defaultValue: 'draft',
  },
  processedBy: {
    type: DataTypes.UUID,
  },
  processedAt: {
    type: DataTypes.DATE,
  },
  approvedBy: {
    type: DataTypes.UUID,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
  
  // Summary
  totalEmployees: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  totalGrossAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalDeductions: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalNetAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalTax: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalPF: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalESI: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Processing details
  attendanceData: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  adjustments: {
    type: DataTypes.JSON,
    defaultValue: {},
  },
  
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'payroll_runs',
});

const PayrollDetail = sequelize.define('PayrollDetail', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  payrollRunId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  
  // Attendance
  workingDays: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  presentDays: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  absentDays: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  leaveDays: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 0,
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(8, 2),
    defaultValue: 0,
  },
  
  // Earnings
  basicSalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  hra: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  specialAllowance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  overtimeAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  bonus: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  commission: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  otherEarnings: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalEarnings: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Deductions
  providentFund: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  employeeStateInsurance: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  professionalTax: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  tds: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  loans: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  advances: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  otherDeductions: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalDeductions: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Net calculation
  grossSalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  netSalary: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
  },
  
  // Employer contributions
  employerPF: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  employerESI: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  totalCostToCompany: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('draft', 'calculated', 'approved', 'processed'),
    defaultValue: 'draft',
  },
  
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'payroll_details',
});

const Payslip = sequelize.define('Payslip', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  payrollRunId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  payrollDetailId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  
  // Payslip details
  payslipNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  payPeriod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  payDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  
  // Generation status
  generated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  generatedAt: {
    type: DataTypes.DATE,
  },
  sentToEmployee: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sentAt: {
    type: DataTypes.DATE,
  },
  
  // PDF generation
  pdfFile: {
    type: DataTypes.STRING,
  },
  
  // Digital signature
  digitallySigned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  signatureDate: {
    type: DataTypes.DATE,
  },
  
  // Acknowledgment
  acknowledged: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  acknowledgedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'payslips',
});

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  companyId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  employeeId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  attendanceDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  
  // Time tracking
  checkInTime: {
    type: DataTypes.TIME,
  },
  checkOutTime: {
    type: DataTypes.TIME,
  },
  breakStartTime: {
    type: DataTypes.TIME,
  },
  breakEndTime: {
    type: DataTypes.TIME,
  },
  
  // Status
  status: {
    type: DataTypes.ENUM('present', 'absent', 'half_day', 'leave', 'holiday', 'weekend', 'compensatory'),
    allowNull: false,
  },
  leaveType: {
    type: DataTypes.STRING,
  },
  leaveReason: {
    type: DataTypes.STRING,
  },
  
  // Duration calculations
  totalHours: {
    type: DataTypes.DECIMAL(4, 2),
  },
  overtimeHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },
  breakHours: {
    type: DataTypes.DECIMAL(4, 2),
    defaultValue: 0,
  },
  
  // Location and device
  checkInLocation: {
    type: DataTypes.JSON,
  },
  checkOutLocation: {
    type: DataTypes.JSON,
  },
  deviceInfo: {
    type: DataTypes.JSON,
  },
  
  notes: {
    type: DataTypes.TEXT,
  },
  approvedBy: {
    type: DataTypes.UUID,
  },
  approvedAt: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'attendance',
  indexes: [
    {
      unique: true,
      fields: ['employeeId', 'attendanceDate']
    }
  ]
});

module.exports = {
  Employee,
  PayrollRun,
  PayrollDetail,
  Payslip,
  Attendance,
};