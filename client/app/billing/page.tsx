'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PaperAirplaneIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    billingAddress: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  date: string;
  dueDate: string;
  items: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
    taxRate: number;
    taxAmount: number;
    totalAmount: number;
  }>;
  subtotal: number;
  taxAmount: number;
  discount: number;
  total: number;
  paidAmount: number;
  balance: number;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: number;
  notes: string;
  paymentLink?: string;
  recurring?: {
    isRecurring: boolean;
    frequency: 'monthly' | 'quarterly' | 'yearly';
    nextDate: string;
  };
}

interface Payment {
  _id: string;
  invoice: string;
  amount: number;
  paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'card' | 'upi' | 'razorpay' | 'stripe';
  transactionId: string;
  paymentDate: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  notes?: string;
}

export default function BillingEngine() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'recurring' | 'templates'>('invoices');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  // Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerCity: '',
    customerState: '',
    customerPincode: '',
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    paymentTerms: 30,
    notes: '',
    discount: 0,
    isRecurring: false,
    recurringFrequency: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    items: [
      {
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        taxRate: 18,
        taxAmount: 0,
        totalAmount: 0
      }
    ]
  });

  useEffect(() => {
    if (user) {
      fetchInvoices();
      fetchPayments();
    }
  }, [user]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.billing.getInvoices();
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await api.billing.getPayments();
      setPayments(response.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.billing.createInvoice(invoiceForm);
      setShowCreateInvoice(false);
      resetInvoiceForm();
      fetchInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      await api.billing.sendInvoice(invoiceId);
      fetchInvoices();
    } catch (error) {
      console.error('Error sending invoice:', error);
    }
  };

  const handleGeneratePaymentLink = async (invoiceId: string) => {
    try {
      const response = await api.billing.generatePaymentLink(invoiceId);
      fetchInvoices();
      // You can show the payment link in a modal or copy to clipboard
      navigator.clipboard.writeText(response.data.paymentLink);
      alert('Payment link copied to clipboard!');
    } catch (error) {
      console.error('Error generating payment link:', error);
    }
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      customerCity: '',
      customerState: '',
      customerPincode: '',
      invoiceNumber: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      paymentTerms: 30,
      notes: '',
      discount: 0,
      isRecurring: false,
      recurringFrequency: 'monthly',
      items: [
        {
          description: '',
          quantity: 1,
          rate: 0,
          amount: 0,
          taxRate: 18,
          taxAmount: 0,
          totalAmount: 0
        }
      ]
    });
  };

  const addInvoiceItem = () => {
    setInvoiceForm(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        taxRate: 18,
        taxAmount: 0,
        totalAmount: 0
      }]
    }));
  };

  const updateInvoiceItem = (index: number, field: string, value: any) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeInvoiceItem = (index: number) => {
    setInvoiceForm(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const calculateItemAmount = (index: number) => {
    const item = invoiceForm.items[index];
    const amount = item.quantity * item.rate;
    const taxAmount = (amount * item.taxRate) / 100;
    
    updateInvoiceItem(index, 'amount', amount);
    updateInvoiceItem(index, 'taxAmount', taxAmount);
    updateInvoiceItem(index, 'totalAmount', amount + taxAmount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
      case 'sent':
        return <PaperAirplaneIcon className="w-4 h-4 text-blue-500" />;
      case 'viewed':
        return <ClockIcon className="w-4 h-4 text-yellow-500" />;
      case 'paid':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'overdue':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <XCircleIcon className="w-4 h-4 text-gray-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      viewed: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const invoiceStats = {
    total: invoices.length,
    draft: invoices.filter(i => i.status === 'draft').length,
    sent: invoices.filter(i => i.status === 'sent').length,
    paid: invoices.filter(i => i.status === 'paid').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    totalAmount: invoices.reduce((sum, i) => sum + i.total, 0),
    paidAmount: invoices.reduce((sum, i) => sum + i.paidAmount, 0),
    outstandingAmount: invoices.reduce((sum, i) => sum + i.balance, 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Billing Engine</h1>
              <p className="text-gray-600 text-lg">Complete invoicing, payments, and customer management</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateInvoice(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                New Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-3xl font-bold text-gray-900">{invoiceStats.total}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <PaperAirplaneIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Amount</p>
                <p className="text-3xl font-bold text-gray-900">₹{invoiceStats.totalAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid Amount</p>
                <p className="text-3xl font-bold text-green-600">₹{invoiceStats.paidAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-full">
                <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-3xl font-bold text-red-600">₹{invoiceStats.outstandingAmount.toLocaleString('en-IN')}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <XCircleIcon className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'invoices', label: 'Invoices', count: filteredInvoices.length },
              { id: 'payments', label: 'Payments', count: payments.length },
              { id: 'recurring', label: 'Recurring', count: invoices.filter(i => i.recurring?.isRecurring).length },
              { id: 'templates', label: 'Templates', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 font-semibold text-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="viewed">Viewed</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Invoices Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Balance</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{invoice.customer.name}</div>
                              <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(invoice.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(invoice.dueDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold">
                            ₹{invoice.total.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold text-red-600">
                            ₹{invoice.balance.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {getStatusIcon(invoice.status)}
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.status)}`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {invoice.status === 'draft' && (
                                <button
                                  onClick={() => handleSendInvoice(invoice._id)}
                                  className="text-blue-600 hover:text-blue-800 p-1"
                                  title="Send Invoice"
                                >
                                  <PaperAirplaneIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => handleGeneratePaymentLink(invoice._id)}
                                className="text-green-600 hover:text-green-800 p-1"
                                title="Generate Payment Link"
                              >
                                💳
                              </button>
                              <button className="text-gray-600 hover:text-gray-800 p-1" title="View Invoice">
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

            {/* Payments Tab */}
            {activeTab === 'payments' && (
              <div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Transaction ID</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Method</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {payments.map((payment) => (
                        <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">
                            {payment.transactionId}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            Invoice #{payment.invoice}
                          </td>
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-green-600">
                            ₹{payment.amount.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(payment.paymentDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recurring Tab */}
            {activeTab === 'recurring' && (
              <div className="text-center py-12">
                <ClockIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Recurring Invoices</h3>
                <p className="text-gray-600 mb-6">Set up automated recurring billing for subscription services</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">45</div>
                    <div className="text-gray-600">Active Recurring</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">₹1.2L</div>
                    <div className="text-gray-600">MRR</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">12</div>
                    <div className="text-gray-600">Next Due This Week</div>
                  </div>
                </div>
                <button className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold">
                  Setup Recurring Invoice
                </button>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="text-center py-12">
                <PaperAirplaneIcon className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Invoice Templates</h3>
                <p className="text-gray-600 mb-6">Create and manage professional invoice templates</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Professional</div>
                    <div className="text-gray-600 text-sm">Clean and professional design</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Modern</div>
                    <div className="text-gray-600 text-sm">Contemporary layout with colors</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg cursor-pointer hover:shadow-xl transition-shadow">
                    <div className="text-lg font-semibold text-gray-900 mb-2">Minimal</div>
                    <div className="text-gray-600 text-sm">Simple and elegant design</div>
                  </div>
                </div>
                <button className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold">
                  Create Custom Template
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Invoice Modal */}
        {showCreateInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Invoice</h2>
              <form onSubmit={handleCreateInvoice} className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={invoiceForm.customerName}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Email</label>
                    <input
                      type="email"
                      value={invoiceForm.customerEmail}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={invoiceForm.customerPhone}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerPhone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={invoiceForm.customerCity}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerCity: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={invoiceForm.customerState}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerState: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={invoiceForm.customerAddress}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerAddress: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={2}
                  />
                </div>

                {/* Invoice Details */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceForm.invoiceNumber}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                    <input
                      type="date"
                      value={invoiceForm.date}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Invoice Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Invoice Items</h3>
                    <button
                      type="button"
                      onClick={addInvoiceItem}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {invoiceForm.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-8 gap-3 p-4 border border-gray-200 rounded-xl">
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => {
                              updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0);
                              calculateItemAmount(index);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            step="0.01"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Tax %"
                            value={item.taxRate}
                            onChange={(e) => {
                              updateInvoiceItem(index, 'taxRate', parseFloat(e.target.value) || 0);
                              calculateItemAmount(index);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Amount"
                            value={item.amount.toFixed(2)}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-semibold"
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          {invoiceForm.items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeInvoiceItem(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Invoice Summary */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Subtotal: </span>
                        <span className="font-mono">₹{invoiceForm.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Tax: </span>
                        <span className="font-mono">₹{invoiceForm.items.reduce((sum, item) => sum + item.taxAmount, 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Discount: </span>
                        <span className="font-mono">₹{invoiceForm.discount.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Total Amount:</span>
                        <span className="font-bold text-lg font-mono text-green-600">
                          ₹{(invoiceForm.items.reduce((sum, item) => sum + item.totalAmount, 0) - invoiceForm.discount).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recurring Options */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="isRecurring"
                      checked={invoiceForm.isRecurring}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, isRecurring: e.target.checked }))}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                      Make this a recurring invoice
                    </label>
                  </div>
                  {invoiceForm.isRecurring && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                        <select
                          value={invoiceForm.recurringFrequency}
                          onChange={(e) => setInvoiceForm(prev => ({ ...prev, recurringFrequency: e.target.value as any }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="quarterly">Quarterly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                  <textarea
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Additional notes or terms..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateInvoice(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Invoice'}
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