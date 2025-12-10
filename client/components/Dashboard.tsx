'use client'

import { useState, useEffect } from 'react'
import {
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts'

const MetricCard = ({ title, value, change, changeType, icon: Icon, trend }: any) => {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="w-6 h-6 text-primary-700" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${changeType === 'positive' ? 'text-success-500' : 'text-error-500'}`}>
            {changeType === 'positive' ? (
              <TrendingUpIcon className="w-4 h-4 mr-1" />
            ) : (
              <TrendingDownIcon className="w-4 h-4 mr-1" />
            )}
            {change}
          </div>
        )}
      </div>
      <div>
        <h3 className="small text-neutral-600 mb-1">{title}</h3>
        <p className="metric-value">{value}</p>
      </div>
    </div>
  )
}

const ChartCard = ({ title, children }: any) => {
  return (
    <div className="card">
      <h3 className="h3 mb-6">{title}</h3>
      {children}
    </div>
  )
}

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalRevenue: { value: '₹12,45,000', change: '+12.5%', changeType: 'positive' },
      totalExpenses: { value: '₹8,23,000', change: '-5.2%', changeType: 'negative' },
      netProfit: { value: '₹4,22,000', change: '+18.7%', changeType: 'positive' },
      cashFlow: { value: '₹6,78,000', change: '+8.3%', changeType: 'positive' },
      totalCustomers: { value: '1,234', change: '+5.2%', changeType: 'positive' },
      totalVendors: { value: '567', change: '+2.1%', changeType: 'positive' },
      pendingInvoices: { value: '12', change: '+3', changeType: 'positive' },
      overdueInvoices: { value: '3', change: '-2', changeType: 'negative' },
      gstLiability: { value: '₹1,25,000', change: '+8.7%', changeType: 'positive' },
      monthlyPayroll: { value: '₹24,50,000', change: '+2.1%', changeType: 'positive' },
      activeEmployees: { value: '28', change: '+2', changeType: 'positive' },
      bankReconciliation: { value: '85%', change: '+5%', changeType: 'positive' },
    },
    revenueData: [
      { month: 'Jan', revenue: 850000, expenses: 620000 },
      { month: 'Feb', revenue: 920000, expenses: 680000 },
      { month: 'Mar', revenue: 1100000, expenses: 750000 },
      { month: 'Apr', revenue: 980000, expenses: 710000 },
      { month: 'May', revenue: 1245000, expenses: 823000 },
      { month: 'Jun', revenue: 1350000, expenses: 890000 },
    ],
    categoryData: [
      { name: 'Revenue', value: 1245000, color: '#4A89F7' },
      { name: 'Expenses', value: 823000, color: '#EF4444' },
      { name: 'Profit', value: 422000, color: '#10B981' },
    ],
    monthlyComparison: [
      { month: 'Jan', current: 850000, previous: 780000 },
      { month: 'Feb', current: 920000, previous: 850000 },
      { month: 'Mar', current: 1100000, previous: 920000 },
      { month: 'Apr', current: 980000, previous: 1100000 },
      { month: 'May', current: 1245000, previous: 980000 },
      { month: 'Jun', current: 1350000, previous: 1245000 },
    ],
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-neutral-900 mb-2">Dashboard</h1>
        <p className="body-large text-neutral-600">
          Welcome back! Here's what's happening with your finances today.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={dashboardData.metrics.totalRevenue.value}
          change={dashboardData.metrics.totalRevenue.change}
          changeType={dashboardData.metrics.totalRevenue.changeType}
          icon={CurrencyDollarIcon}
          trend={true}
        />
        <MetricCard
          title="Total Expenses"
          value={dashboardData.metrics.totalExpenses.value}
          change={dashboardData.metrics.totalExpenses.change}
          changeType={dashboardData.metrics.totalExpenses.changeType}
          icon={TrendingDownIcon}
          trend={true}
        />
        <MetricCard
          title="Net Profit"
          value={dashboardData.metrics.netProfit.value}
          change={dashboardData.metrics.netProfit.change}
          changeType={dashboardData.metrics.netProfit.changeType}
          icon={TrendingUpIcon}
          trend={true}
        />
        <MetricCard
          title="Cash Flow"
          value={dashboardData.metrics.cashFlow.value}
          change={dashboardData.metrics.cashFlow.change}
          changeType={dashboardData.metrics.cashFlow.changeType}
          icon={ChartBarIcon}
          trend={true}
        />
        <MetricCard
          title="Pending Invoices"
          value={dashboardData.metrics.pendingInvoices.value}
          change={dashboardData.metrics.pendingInvoices.change}
          changeType={dashboardData.metrics.pendingInvoices.changeType}
          icon={DocumentTextIcon}
          trend={true}
        />
        <MetricCard
          title="Active Employees"
          value={dashboardData.metrics.activeEmployees.value}
          change={dashboardData.metrics.activeEmployees.change}
          changeType={dashboardData.metrics.activeEmployees.changeType}
          icon={UserGroupIcon}
          trend={true}
        />
        <MetricCard
          title="GST Liability"
          value={dashboardData.metrics.gstLiability.value}
          change={dashboardData.metrics.gstLiability.change}
          changeType={dashboardData.metrics.gstLiability.changeType}
          icon={BuildingOfficeIcon}
          trend={true}
        />
        <MetricCard
          title="Bank Reconciliation"
          value={dashboardData.metrics.bankReconciliation.value}
          change={dashboardData.metrics.bankReconciliation.change}
          changeType={dashboardData.metrics.bankReconciliation.changeType}
          icon={ClockIcon}
          trend={true}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue vs Expenses Trend */}
        <ChartCard title="Revenue vs Expenses Trend">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A89F7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4A89F7" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" tickFormatter={(value) => `₹${(value / 1000)}K`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                  labelStyle={{ color: '#111827' }}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#4A89F7" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="expenses" 
                  stroke="#EF4444" 
                  fillOpacity={1} 
                  fill="url(#colorExpenses)" 
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Financial Breakdown */}
        <ChartCard title="Financial Breakdown">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dashboardData.categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center space-x-6 mt-4">
              {dashboardData.categoryData.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="small text-neutral-600">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Monthly Comparison */}
      <ChartCard title="Monthly Revenue Comparison">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dashboardData.monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6B7280" />
              <YAxis stroke="#6B7280" tickFormatter={(value) => `₹${(value / 1000)}K`} />
              <Tooltip 
                formatter={(value: any) => [`₹${value.toLocaleString()}`, '']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Bar dataKey="current" fill="#4A89F7" name="Current Year" />
              <Bar dataKey="previous" fill="#A0AEC0" name="Previous Year" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="h3 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { type: 'gst', description: 'GST Invoice #GST-001 generated for ₹1,18,000', time: '2 hours ago', icon: BuildingOfficeIcon },
            { type: 'billing', description: 'Invoice INV-001 sent to ABC Company', time: '3 hours ago', icon: DocumentTextIcon },
            { type: 'payment', description: 'Payment received from XYZ Corp - ₹75,000', time: '4 hours ago', icon: CurrencyDollarIcon },
            { type: 'payroll', description: 'Payslip generated for 28 employees', time: '6 hours ago', icon: UserGroupIcon },
            { type: 'ledger', description: 'Journal entry posted for opening balance', time: '8 hours ago', icon: ChartBarIcon },
            { type: 'expense', description: 'Expense report submitted by Marketing team', time: '1 day ago', icon: TrendingDownIcon },
            { type: 'gst', description: 'GST return GSTR-1 filed for November 2023', time: '2 days ago', icon: ClockIcon },
            { type: 'bank', description: 'Bank reconciliation completed for SBI account', time: '3 days ago', icon: BuildingOfficeIcon },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors">
              <div className="p-2 bg-primary-100 rounded-lg">
                <activity.icon className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1">
                <p className="body text-neutral-900">{activity.description}</p>
                <p className="small text-neutral-600">{activity.time}</p>
              </div>
              <div className="text-xs text-neutral-500 px-2 py-1 bg-neutral-200 rounded-full">
                {activity.type.toUpperCase()}
              </div>
            </div>
          ))}
        </div>
        
        {/* Platform Status */}
        <div className="mt-6 pt-6 border-t border-neutral-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="h4 text-neutral-900">Platform Status</h4>
              <p className="body text-neutral-600">All systems operational</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-success-500 rounded-full animate-pulse"></div>
              <span className="body text-success-600 font-semibold">All 23 Engines Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}