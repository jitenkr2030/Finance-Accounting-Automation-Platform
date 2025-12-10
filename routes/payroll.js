const express = require('express');
const { body, validationResult } = require('express-validator');
const { Employee, PayrollRun, PayrollDetail, Payslip, Attendance } = require('../models/Payroll');
const { authMiddleware } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Employee routes
router.get('/employees', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, department, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (search) {
      whereClause[Op.or] = [
        { employeeNumber: { [Op.iLike]: `%${search}%` } },
        { fullName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (department) {
      whereClause.department = department;
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: employees } = await Employee.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['fullName', 'ASC']],
    });

    res.json({
      employees,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/employees', authMiddleware, [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('fullName').notEmpty().trim(),
  body('email').isEmail(),
  body('department').notEmpty().trim(),
  body('designation').notEmpty().trim(),
  body('dateOfJoining').isISO8601(),
  body('basicSalary').isFloat({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const employeeData = {
      ...req.body,
      companyId: req.user.companyId,
      grossSalary: req.body.basicSalary + (req.body.hra || 0) + (req.body.specialAllowance || 0) + (req.body.otherAllowances || 0),
      createdBy: req.user.userId,
    };

    const employee = await Employee.create(employeeData);
    res.status(201).json({ message: 'Employee created successfully', employee });
  } catch (error) {
    console.error('Create employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Attendance routes
router.get('/attendance', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 50, employeeId, startDate, endDate, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (employeeId) {
      whereClause.employeeId = employeeId;
    }

    if (startDate && endDate) {
      whereClause.attendanceDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: attendanceRecords } = await Attendance.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'employee',
          attributes: ['id', 'fullName', 'employeeNumber', 'department'],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['attendanceDate', 'DESC']],
    });

    res.json({
      attendanceRecords,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/attendance', authMiddleware, [
  body('employeeId').notEmpty(),
  body('attendanceDate').isISO8601(),
  body('status').isIn(['present', 'absent', 'half_day', 'leave', 'holiday', 'weekend', 'compensatory']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { employeeId, attendanceDate, checkInTime, checkOutTime, breakStartTime, breakEndTime, status, leaveType, leaveReason, notes } = req.body;

    // Check if attendance already exists for this employee and date
    const existingAttendance = await Attendance.findOne({
      where: {
        employeeId,
        attendanceDate,
      },
    });

    if (existingAttendance) {
      return res.status(400).json({ error: 'Attendance record already exists for this date' });
    }

    // Calculate hours
    let totalHours = 0;
    let breakHours = 0;

    if (checkInTime && checkOutTime) {
      const checkIn = new Date(`2000-01-01T${checkInTime}`);
      const checkOut = new Date(`2000-01-01T${checkOutTime}`);
      totalHours = (checkOut - checkIn) / (1000 * 60 * 60); // Convert to hours

      if (breakStartTime && breakEndTime) {
        const breakStart = new Date(`2000-01-01T${breakStartTime}`);
        const breakEnd = new Date(`2000-01-01T${breakEndTime}`);
        breakHours = (breakEnd - breakStart) / (1000 * 60 * 60);
      }
    }

    const attendance = await Attendance.create({
      companyId: req.user.companyId,
      employeeId,
      attendanceDate,
      checkInTime,
      checkOutTime,
      breakStartTime,
      breakEndTime,
      status,
      leaveType,
      leaveReason,
      totalHours,
      breakHours,
      notes,
      approvedBy: req.user.userId,
    });

    res.status(201).json({ message: 'Attendance recorded successfully', attendance });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payroll run routes
router.get('/payroll-runs', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      companyId: req.user.companyId,
    };

    if (status) {
      whereClause.status = status;
    }

    const { count, rows: payrollRuns } = await PayrollRun.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: PayrollDetail,
          as: 'payrollDetails',
          attributes: ['id', 'employeeId', 'employee.fullName', 'grossSalary', 'netSalary'],
          include: [
            {
              model: Employee,
              as: 'employee',
              attributes: ['id', 'fullName', 'employeeNumber'],
            },
          ],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['payPeriodStart', 'DESC']],
    });

    res.json({
      payrollRuns,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit),
      },
    });
  } catch (error) {
    console.error('Get payroll runs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/payroll-runs', authMiddleware, [
  body('payrollPeriod').matches(/^\d{4}-\d{2}$/), // YYYY-MM format
  body('payPeriodStart').isISO8601(),
  body('payPeriodEnd').isISO8601(),
  body('payDate').isISO8601(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { payrollPeriod, payPeriodStart, payPeriodEnd, payDate } = req.body;

    // Check if payroll run already exists for this period
    const existingPayrollRun = await PayrollRun.findOne({
      where: { payrollPeriod, companyId: req.user.companyId }
    });

    if (existingPayrollRun) {
      return res.status(400).json({ error: 'Payroll run already exists for this period' });
    }

    // Get all active employees
    const employees = await Employee.findAll({
      where: {
        companyId: req.user.companyId,
        status: 'active',
      },
    });

    // Create payroll run
    const payrollRun = await PayrollRun.create({
      companyId: req.user.companyId,
      payrollPeriod,
      payPeriodStart,
      payPeriodEnd,
      payDate,
      totalEmployees: employees.length,
      status: 'draft',
      createdBy: req.user.userId,
    });

    // Create payroll details for each employee
    for (const employee of employees) {
      await PayrollDetail.create({
        payrollRunId: payrollRun.id,
        employeeId: employee.id,
        basicSalary: employee.basicSalary,
        hra: employee.hra,
        specialAllowance: employee.specialAllowance,
        otherAllowances: employee.otherAllowances,
        grossSalary: employee.grossSalary,
        totalEarnings: employee.grossSalary,
        totalDeductions: 0,
        netSalary: employee.grossSalary,
        status: 'draft',
      });
    }

    const completePayrollRun = await PayrollRun.findByPk(payrollRun.id, {
      include: [
        {
          model: PayrollDetail,
          as: 'payrollDetails',
          include: [
            {
              model: Employee,
              as: 'employee',
              attributes: ['id', 'fullName', 'employeeNumber'],
            },
          ],
        },
      ],
    });

    res.status(201).json({ message: 'Payroll run created successfully', payrollRun: completePayrollRun });
  } catch (error) {
    console.error('Create payroll run error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Calculate payroll
router.put('/payroll-runs/:id/calculate', authMiddleware, async (req, res) => {
  try {
    const payrollRun = await PayrollRun.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
      },
      include: [
        {
          model: PayrollDetail,
          as: 'payrollDetails',
          include: [
            {
              model: Employee,
              as: 'employee',
            },
          ],
        },
      ],
    });

    if (!payrollRun) {
      return res.status(404).json({ error: 'Payroll run not found' });
    }

    if (payrollRun.status !== 'draft') {
      return res.status(400).json({ error: 'Only draft payroll runs can be calculated' });
    }

    let totalGross = 0;
    let totalDeductions = 0;
    let totalNet = 0;
    let totalTax = 0;
    let totalPF = 0;
    let totalESI = 0;

    // Calculate payroll for each employee
    for (const payrollDetail of payrollRun.payrollDetails) {
      const employee = payrollDetail.employee;
      const grossSalary = parseFloat(employee.grossSalary);
      const basicSalary = parseFloat(employee.basicSalary);

      // Calculate PF (12% of basic salary, max 15000)
      const pfBase = Math.min(basicSalary, 15000);
      const employeePF = pfBase * 0.12;
      const employerPF = pfBase * 0.12;

      // Calculate ESI (0.75% of gross salary, max 25000)
      const esiBase = Math.min(grossSalary, 25000);
      const employeeESI = esiBase * 0.0075;
      const employerESI = esiBase * 0.0325;

      // Calculate professional tax (state dependent, using 200 as default)
      const professionalTax = 200;

      // Calculate TDS (simplified calculation)
      const annualIncome = grossSalary * 12;
      let tds = 0;
      if (annualIncome > 500000) {
        tds = (annualIncome - 500000) * 0.1 / 12; // 10% on income above 5 lakhs
      }

      const totalDeductionsForEmployee = employeePF + employeeESI + professionalTax + tds;
      const netSalary = grossSalary - totalDeductionsForEmployee;

      // Update payroll detail
      await payrollDetail.update({
        providentFund: employeePF,
        employeeStateInsurance: employeeESI,
        professionalTax: professionalTax,
        tds: tds,
        totalDeductions: totalDeductionsForEmployee,
        netSalary: netSalary,
        employerPF: employerPF,
        employerESI: employerESI,
        totalCostToCompany: grossSalary + employerPF + employerESI,
        status: 'calculated',
      });

      totalGross += grossSalary;
      totalDeductions += totalDeductionsForEmployee;
      totalNet += netSalary;
      totalTax += tds;
      totalPF += employeePF;
      totalESI += employeeESI;
    }

    // Update payroll run totals
    await payrollRun.update({
      totalGrossAmount: totalGross,
      totalDeductions: totalDeductions,
      totalNetAmount: totalNet,
      totalTax: totalTax,
      totalPF: totalPF,
      totalESI: totalESI,
      status: 'calculated',
    });

    res.json({ message: 'Payroll calculated successfully' });
  } catch (error) {
    console.error('Calculate payroll error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate payslips
router.post('/payroll-runs/:id/generate-payslips', authMiddleware, async (req, res) => {
  try {
    const payrollRun = await PayrollRun.findOne({
      where: {
        id: req.params.id,
        companyId: req.user.companyId,
        status: 'calculated',
      },
      include: [
        {
          model: PayrollDetail,
          as: 'payrollDetails',
          where: { status: 'calculated' },
        },
      ],
    });

    if (!payrollRun) {
      return res.status(404).json({ error: 'Calculated payroll run not found' });
    }

    const payslips = [];

    // Generate payslip for each employee
    for (const payrollDetail of payrollRun.payrollDetails) {
      const payslipCount = await Payslip.count({
        where: { companyId: req.user.companyId }
      });
      const payslipNumber = `PS-${String(payslipCount + 1).padStart(6, '0')}`;

      const payslip = await Payslip.create({
        companyId: req.user.companyId,
        payrollRunId: payrollRun.id,
        payrollDetailId: payrollDetail.id,
        employeeId: payrollDetail.employeeId,
        payslipNumber,
        payPeriod: payrollRun.payrollPeriod,
        payDate: payrollRun.payDate,
        generated: true,
        generatedAt: new Date(),
      });

      payslips.push(payslip);
    }

    res.status(201).json({ 
      message: 'Payslips generated successfully',
      payslipsCount: payslips.length,
    });
  } catch (error) {
    console.error('Generate payslips error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Payroll dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const whereClause = { companyId: req.user.companyId };

    const totalEmployees = await Employee.count({ where: { ...whereClause, status: 'active' } });
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const currentPayrollRun = await PayrollRun.findOne({
      where: { ...whereClause, payrollPeriod: currentMonth },
    });

    let currentMonthPayroll = 0;
    if (currentPayrollRun && currentPayrollRun.status === 'calculated') {
      currentMonthPayroll = parseFloat(currentPayrollRun.totalNetAmount);
    }

    // Recent attendance summary
    const today = new Date().toISOString().split('T')[0];
    const attendanceSummary = await Attendance.findAll({
      where: {
        ...whereClause,
        attendanceDate: today,
      },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status'],
    });

    res.json({
      summary: {
        totalEmployees,
        currentMonthPayroll,
        currentPayrollPeriod: currentMonth,
        currentPayrollStatus: currentPayrollRun ? currentPayrollRun.status : 'not_started',
      },
      attendanceSummary,
    });
  } catch (error) {
    console.error('Get payroll dashboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;