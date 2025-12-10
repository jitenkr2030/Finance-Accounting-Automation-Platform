'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, UserGroupIcon, BanknotesIcon, DocumentTextIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

interface Employee {
  _id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  salary: number;
  joinDate: string;
  status: 'active' | 'inactive' | 'terminated';
  bankDetails: {
    accountNumber: string;
    bankName: string;
    ifscCode: string;
  };
  pfNumber?: string;
  esiNumber?: string;
  panNumber?: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
}

interface Payslip {
  _id: string;
  employee: string;
  month: string;
  year: number;
  basicSalary: number;
  hra: number;
  allowances: number;
  grossSalary: number;
  pfEmployee: number;
  pfEmployer: number;
  esiEmployee: number;
  esiEmployer: number;
  tds: number;
  deductions: number;
  netSalary: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  overtimeHours: number;
  overtimeAmount: number;
  status: 'draft' | 'generated' | 'paid' | 'cancelled';
  paymentDate?: string;
  bankTransactionId?: string;
}

interface Leave {
  _id: string;
  employee: string;
  leaveType: 'casual' | 'sick' | 'earned' | 'maternity' | 'paternity' | 'unpaid';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
}

export default function PayrollEngine() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'employees' | 'payslips' | 'attendance' | 'leaves'>('employees');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [showCreateEmployee, setShowCreateEmployee] = useState(false);
  const [showGeneratePayslip, setShowGeneratePayslip] = useState(false);

  // Employee Form State
  const [employeeForm, setEmployeeForm] = useState({
    employeeId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    salary: 0,
    joinDate: new Date().toISOString().split('T')[0],
    bankAccountNumber: '',
    bankName: '',
    ifscCode: '',
    panNumber: '',
    pfNumber: '',
    esiNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: ''
    }
  });

  // Payslip Generation Form State
  const [payslipForm, setPayslipForm] = useState({
    employeeId: '',
    month: new Date().toISOString().split('-')[1],
    year: new Date().getFullYear(),
    basicSalary: 0,
    hra: 0,
    allowances: 0,
    pfEmployee: 0,
    pfEmployer: 0,
    esiEmployee: 0,
    esiEmployer: 0,
    tds: 0,
    deductions: 0,
    workingDays: 30,
    presentDays: 30,
    absentDays: 0,
    leaveDays: 0,
    overtimeHours: 0,
    overtimeRate: 0
  });

  useEffect(() => {
    if (user) {
      fetchEmployees();
      fetchPayslips();
      fetchLeaves();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.payroll.getEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayslips = async () => {
    try {
      const response = await api.payroll.getPayslips();
      setPayslips(response.data);
    } catch (error) {
      console.error('Error fetching payslips:', error);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await api.payroll.getLeaves();
      setLeaves(response.data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.payroll.createEmployee(employeeForm);
      setShowCreateEmployee(false);
      resetEmployeeForm();
      fetchEmployees();
    } catch (error) {
      console.error('Error creating employee:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayslip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const overtimeAmount = payslipForm.overtimeHours * payslipForm.overtimeRate;
      const grossSalary = payslipForm.basicSalary + payslipForm.hra + payslipForm.allowances + overtimeAmount;
      const totalDeductions = payslipForm.pfEmployee + payslipForm.esiEmployee + payslipForm.tds + payslipForm.deductions;
      const netSalary = grossSalary - totalDeductions;

      const payslipData = {
        ...payslipForm,
        grossSalary,
        netSalary,
        overtimeAmount
      };

      await api.payroll.createPayslip(payslipData);
      setShowGeneratePayslip(false);
      resetPayslipForm();
      fetchPayslips();
    } catch (error) {
      console.error('Error generating payslip:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetEmployeeForm = () => {
    setEmployeeForm({
      employeeId: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      salary: 0,
      joinDate: new Date().toISOString().split('T')[0],
      bankAccountNumber: '',
      bankName: '',
      ifscCode: '',
      panNumber: '',
      pfNumber: '',
      esiNumber: '',
      address: {
        street: '',
        city: '',
        state: '',
        pincode: ''
      }
    });
  };

  const resetPayslipForm = () => {
    setPayslipForm({
      employeeId: '',
      month: new Date().toISOString().split('-')[1],
      year: new Date().getFullYear(),
      basicSalary: 0,
      hra: 0,
      allowances: 0,
      pfEmployee: 0,
      pfEmployer: 0,
      esiEmployee: 0,
      esiEmployer: 0,
      tds: 0,
      deductions: 0,
      workingDays: 30,
      presentDays: 30,
      absentDays: 0,
      leaveDays: 0,
      overtimeHours: 0,
      overtimeRate: 0
    });
  };

  const calculatePF = (basicSalary: number) => {
    const pfEmployee = Math.min(basicSalary * 0.12, 1800); // 12% of basic, max ₹1800
    const pfEmployer = Math.min(basicSalary * 0.12, 1800); // 12% of basic, max ₹1800
    return { pfEmployee, pfEmployer };
  };

  const calculateESI = (grossSalary: number) => {
    const esiEmployee = grossSalary * 0.0075; // 0.75% of gross
    const esiEmployer = grossSalary * 0.0325; // 3.25% of gross
    return { esiEmployee, esiEmployer };
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      terminated: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800',
      generated: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || employee.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const departments = [...new Set(employees.map(emp => emp.department))];

  const payrollStats = {
    totalEmployees: employees.filter(e => e.status === 'active').length,
    totalPayroll: employees.reduce((sum, emp) => sum + emp.salary, 0),
    pendingPayslips: payslips.filter(p => p.status === 'generated').length,
    monthlyPayroll: payslips.reduce((sum, p) => sum + p.netSalary, 0),
    pendingLeaves: leaves.filter(l => l.status === 'pending').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Payroll Engine</h1>
              <p className="text-gray-600 text-lg">Complete employee management, salary processing, and compliance</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateEmployee(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Add Employee
              </button>
              <button
                onClick={() => setShowGeneratePayslip(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                <BanknotesIcon className="w-5 h-5" />
                Generate Payslip
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Employees</p>
                <p className="text-3xl font-bold text-gray-900">{payrollStats.totalEmployees}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <UserGroupIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Payroll</p>
                <p className="text-2xl font-bold text-gray-900">₹{payrollStats.totalPayroll.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <BanknotesIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payslips</p>
                <p className="text-3xl font-bold text-yellow-600">{payrollStats.pendingPayslips}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <DocumentTextIcon className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processed Amount</p>
                <p className="text-2xl font-bold text-green-600">₹{payrollStats.monthlyPayroll.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <BanknotesIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Leaves</p>
                <p className="text-3xl font-bold text-orange-600">{payrollStats.pendingLeaves}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-full">
                <CalendarDaysIcon className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'employees', label: 'Employees', count: filteredEmployees.length },
              { id: 'payslips', label: 'Payslips', count: payslips.length },
              { id: 'attendance', label: 'Attendance', count: 0 },
              { id: 'leaves', label: 'Leaves', count: leaves.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 font-semibold text-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-600 hover:text-purple-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Employees Tab */}
            {activeTab === 'employees' && (
              <div>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {/* Employees Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Employee ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Department</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Position</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Join Date</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Salary</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEmployees.map((employee) => (
                        <tr key={employee._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">
                            {employee.employeeId}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{employee.firstName} {employee.lastName}</div>
                              <div className="text-sm text-gray-500">{employee.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{employee.department}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">{employee.position}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(employee.joinDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold">
                            ₹{employee.salary.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(employee.status)}`}>
                              {employee.status.charAt(0).toUpperCase() + employee.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="text-blue-600 hover:text-blue-800 p-1" title="View Details">
                                👁️
                              </button>
                              <button className="text-green-600 hover:text-green-800 p-1" title="Generate Payslip">
                                💳
                              </button>
                              <button className="text-purple-600 hover:text-purple-800 p-1" title="Edit Employee">
                                ✏️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payslips Tab */}
            {activeTab === 'payslips' && (
              <div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Employee</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Period</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Basic Salary</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Gross Salary</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Deductions</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Net Salary</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payslips.map((payslip) => (
                        <tr key={payslip._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Employee ID: {payslip.employee}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {payslip.month}/{payslip.year}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono">
                            ₹{payslip.basicSalary.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono">
                            ₹{payslip.grossSalary.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-red-600">
                            ₹{(payslip.pfEmployee + payslip.esiEmployee + payslip.tds + payslip.deductions).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold text-green-600">
                            ₹{payslip.netSalary.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payslip.status)}`}>
                              {payslip.status.charAt(0).toUpperCase() + payslip.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="text-blue-600 hover:text-blue-800 p-1" title="View Payslip">
                                👁️
                              </button>
                              <button className="text-green-600 hover:text-green-800 p-1" title="Download PDF">
                                📄
                              </button>
                              {payslip.status === 'generated' && (
                                <button className="text-purple-600 hover:text-purple-800 p-1" title="Mark as Paid">
                                  💳
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="text-center py-12">
                <CalendarDaysIcon className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Attendance Management</h3>
                <p className="text-gray-600 mb-6">Track employee attendance, working hours, and overtime</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">156</div>
                    <div className="text-gray-600">Present Today</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-red-600 mb-2">8</div>
                    <div className="text-gray-600">Absent Today</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">24</div>
                    <div className="text-gray-600">Overtime Hours</div>
                  </div>
                </div>
                <button className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold">
                  Mark Attendance
                </button>
              </div>
            )}

            {/* Leaves Tab */}
            {activeTab === 'leaves' && (
              <div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Employee</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Leave Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Start Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">End Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Total Days</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Reason</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {leaves.map((leave) => (
                        <tr key={leave._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Employee ID: {leave.employee}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {leave.leaveType.charAt(0).toUpperCase() + leave.leaveType.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(leave.startDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(leave.endDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold">
                            {leave.totalDays}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {leave.reason}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(leave.status)}`}>
                              {leave.status.charAt(0).toUpperCase() + leave.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {leave.status === 'pending' && (
                                <>
                                  <button className="text-green-600 hover:text-green-800 p-1" title="Approve">
                                    ✓
                                  </button>
                                  <button className="text-red-600 hover:text-red-800 p-1" title="Reject">
                                    ✗
                                  </button>
                                </>
                              )}
                              <button className="text-blue-600 hover:text-blue-800 p-1" title="View Details">
                                👁️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Create Employee Modal */}
        {showCreateEmployee && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Employee</h2>
              <form onSubmit={handleCreateEmployee} className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
                      <input
                        type="text"
                        value={employeeForm.employeeId}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, employeeId: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Join Date</label>
                      <input
                        type="date"
                        value={employeeForm.joinDate}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, joinDate: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <input
                        type="text"
                        value={employeeForm.firstName}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, firstName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <input
                        type="text"
                        value={employeeForm.lastName}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, lastName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <input
                        type="email"
                        value={employeeForm.email}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={employeeForm.phone}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, phone: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                      <input
                        type="text"
                        value={employeeForm.department}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                      <input
                        type="text"
                        value={employeeForm.position}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, position: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Salary</label>
                    <input
                      type="number"
                      value={employeeForm.salary}
                      onChange={(e) => setEmployeeForm(prev => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={employeeForm.bankAccountNumber}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
                      <input
                        type="text"
                        value={employeeForm.bankName}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, bankName: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
                      <input
                        type="text"
                        value={employeeForm.ifscCode}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, ifscCode: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Compliance Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance Details</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PAN Number</label>
                      <input
                        type="text"
                        value={employeeForm.panNumber}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, panNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PF Number</label>
                      <input
                        type="text"
                        value={employeeForm.pfNumber}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, pfNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ESI Number</label>
                      <input
                        type="text"
                        value={employeeForm.esiNumber}
                        onChange={(e) => setEmployeeForm(prev => ({ ...prev, esiNumber: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Address</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <textarea
                      value={employeeForm.address.street}
                      onChange={(e) => setEmployeeForm(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value }
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={employeeForm.address.city}
                        onChange={(e) => setEmployeeForm(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, city: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={employeeForm.address.state}
                        onChange={(e) => setEmployeeForm(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, state: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                      <input
                        type="text"
                        value={employeeForm.address.pincode}
                        onChange={(e) => setEmployeeForm(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, pincode: e.target.value }
                        }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateEmployee(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Employee'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Generate Payslip Modal */}
        {showGeneratePayslip && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Payslip</h2>
              <form onSubmit={handleGeneratePayslip} className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Employee</label>
                    <select
                      value={payslipForm.employeeId}
                      onChange={(e) => setPayslipForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.filter(e => e.status === 'active').map(emp => (
                        <option key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName} ({emp.employeeId})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      value={payslipForm.month}
                      onChange={(e) => setPayslipForm(prev => ({ ...prev, month: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <option key={month} value={month.toString().padStart(2, '0')}>
                          {new Date(2024, month - 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="number"
                      value={payslipForm.year}
                      onChange={(e) => setPayslipForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Earnings */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Earnings</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Basic Salary</label>
                      <input
                        type="number"
                        value={payslipForm.basicSalary}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">HRA</label>
                      <input
                        type="number"
                        value={payslipForm.hra}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, hra: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Allowances</label>
                      <input
                        type="number"
                        value={payslipForm.allowances}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, allowances: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Attendance */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                      <input
                        type="number"
                        value={payslipForm.workingDays}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, workingDays: parseInt(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Present Days</label>
                      <input
                        type="number"
                        value={payslipForm.presentDays}
                        onChange={(e) => {
                          const present = parseInt(e.target.value) || 0;
                          const absent = payslipForm.workingDays - present;
                          setPayslipForm(prev => ({ 
                            ...prev, 
                            presentDays: present,
                            absentDays: absent
                          }));
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Absent Days</label>
                      <input
                        type="number"
                        value={payslipForm.absentDays}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Leave Days</label>
                      <input
                        type="number"
                        value={payslipForm.leaveDays}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, leaveDays: parseInt(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Overtime */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Overtime</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Hours</label>
                      <input
                        type="number"
                        value={payslipForm.overtimeHours}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, overtimeHours: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Overtime Rate (per hour)</label>
                      <input
                        type="number"
                        value={payslipForm.overtimeRate}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, overtimeRate: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Deductions</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">PF Employee</label>
                      <input
                        type="number"
                        value={payslipForm.pfEmployee}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, pfEmployee: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ESI Employee</label>
                      <input
                        type="number"
                        value={payslipForm.esiEmployee}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, esiEmployee: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">TDS</label>
                      <input
                        type="number"
                        value={payslipForm.tds}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, tds: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Other Deductions</label>
                      <input
                        type="number"
                        value={payslipForm.deductions}
                        onChange={(e) => setPayslipForm(prev => ({ ...prev, deductions: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowGeneratePayslip(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Payslip'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}