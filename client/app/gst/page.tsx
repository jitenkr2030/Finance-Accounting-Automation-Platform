'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, DocumentTextIcon, CreditCardIcon, TruckIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

interface GSTInvoice {
  _id: string;
  invoiceNumber: string;
  customer: {
    name: string;
    gstNumber: string;
    address: {
      city: string;
      state: string;
    };
  };
  date: string;
  dueDate: string;
  items: Array<{
    description: string;
    hsnCode: string;
    quantity: number;
    rate: number;
    amount: number;
    igstRate: number;
    cgstRate: number;
    sgstRate: number;
    igstAmount: number;
    cgstAmount: number;
    sgstAmount: number;
    totalAmount: number;
  }>;
  subtotal: number;
  totalTax: number;
  total: number;
  eInvoiceStatus: 'pending' | 'generated' | 'failed';
  eWayBillStatus: 'not_required' | 'pending' | 'generated' | 'cancelled';
  placeOfSupply: string;
  supplyType: 'b2b' | 'b2c' | 'b2cs' | 'sewp' | 'sezwp' | 'exp' | 'imp' | 'deemed_exp';
  igstOnIntra: boolean;
}

interface GSTReturn {
  _id: string;
  returnType: 'GSTR1' | 'GSTR3B' | 'GSTR4' | 'GSTR5' | 'GSTR6' | 'GSTR7' | 'GSTR9' | 'GSTR11';
  period: string;
  dueDate: string;
  status: 'pending' | 'filed' | 'revised' | 'default';
  filingDate?: string;
  liability: number;
  taxPaid: number;
  refund: number;
  summary: {
    taxableValue: number;
    igst: number;
    cgst: number;
    sgst: number;
    cess: number;
  };
}

export default function GSTEngine() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'invoices' | 'returns' | 'e-invoice' | 'e-waybill'>('invoices');
  const [gstInvoices, setGstInvoices] = useState<GSTInvoice[]>([]);
  const [gstReturns, setGstReturns] = useState<GSTReturn[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  // GST Invoice Form State
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceNumber: '',
    customerName: '',
    customerGST: '',
    customerAddress: '',
    customerCity: '',
    customerState: '',
    placeOfSupply: '',
    supplyType: 'b2b' as GSTInvoice['supplyType'],
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    items: [
      {
        description: '',
        hsnCode: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        igstRate: 0,
        cgstRate: 0,
        sgstRate: 0,
        igstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        totalAmount: 0
      }
    ]
  });

  useEffect(() => {
    if (user) {
      fetchGSTInvoices();
      fetchGSTReturns();
    }
  }, [user]);

  const fetchGSTInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.gst.getInvoices();
      setGstInvoices(response.data);
    } catch (error) {
      console.error('Error fetching GST invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGSTReturns = async () => {
    try {
      const response = await api.gst.getReturns();
      setGstReturns(response.data);
    } catch (error) {
      console.error('Error fetching GST returns:', error);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.gst.createInvoice(invoiceForm);
      setShowCreateInvoice(false);
      resetInvoiceForm();
      fetchGSTInvoices();
    } catch (error) {
      console.error('Error creating GST invoice:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetInvoiceForm = () => {
    setInvoiceForm({
      invoiceNumber: '',
      customerName: '',
      customerGST: '',
      customerAddress: '',
      customerCity: '',
      customerState: '',
      placeOfSupply: '',
      supplyType: 'b2b',
      date: new Date().toISOString().split('T')[0],
      dueDate: '',
      items: [
        {
          description: '',
          hsnCode: '',
          quantity: 1,
          rate: 0,
          amount: 0,
          igstRate: 0,
          cgstRate: 0,
          sgstRate: 0,
          igstAmount: 0,
          cgstAmount: 0,
          sgstAmount: 0,
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
        hsnCode: '',
        quantity: 1,
        rate: 0,
        amount: 0,
        igstRate: 0,
        cgstRate: 0,
        sgstRate: 0,
        igstAmount: 0,
        cgstAmount: 0,
        sgstAmount: 0,
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

  const calculateTax = (index: number) => {
    const item = invoiceForm.items[index];
    const amount = item.quantity * item.rate;
    
    // Auto-calculate tax based on supply type and place of supply
    if (invoiceForm.placeOfSupply !== invoiceForm.customerState) {
      // Interstate - IGST
      const igstAmount = (amount * item.igstRate) / 100;
      updateInvoiceItem(index, 'igstAmount', igstAmount);
      updateInvoiceItem(index, 'cgstAmount', 0);
      updateInvoiceItem(index, 'sgstAmount', 0);
    } else {
      // Intrastate - CGST + SGST
      const cgstAmount = (amount * item.cgstRate) / 100;
      const sgstAmount = (amount * item.sgstRate) / 100;
      updateInvoiceItem(index, 'igstAmount', 0);
      updateInvoiceItem(index, 'cgstAmount', cgstAmount);
      updateInvoiceItem(index, 'sgstAmount', sgstAmount);
    }
    
    updateInvoiceItem(index, 'amount', amount);
    updateInvoiceItem(index, 'totalAmount', amount + 
      (invoiceForm.placeOfSupply !== invoiceForm.customerState ? 
        (amount * item.igstRate) / 100 : 
        (amount * (item.cgstRate + item.sgstRate)) / 100
      )
    );
  };

  const filteredInvoices = gstInvoices.filter(invoice =>
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      generated: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      filed: 'bg-green-100 text-green-800',
      revised: 'bg-blue-100 text-blue-800',
      default: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSupplyTypeLabel = (type: string) => {
    const types = {
      b2b: 'B2B',
      b2c: 'B2C',
      b2cs: 'B2CS',
      sewp: 'SEWP',
      sezwp: 'SEZWP',
      exp: 'Export',
      imp: 'Import',
      deemed_exp: 'Deemed Export'
    };
    return types[type as keyof typeof types] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">GST Engine</h1>
              <p className="text-gray-600 text-lg">Complete GST compliance, e-invoicing, and tax filing automation</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateInvoice(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                New GST Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'invoices', label: 'GST Invoices', icon: DocumentTextIcon, count: filteredInvoices.length },
              { id: 'returns', label: 'GST Returns', icon: ClipboardDocumentCheckIcon, count: gstReturns.length },
              { id: 'e-invoice', label: 'E-Invoice', icon: CreditCardIcon, count: 0 },
              { id: 'e-waybill', label: 'E-Way Bill', icon: TruckIcon, count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-4 font-semibold text-lg transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* GST Invoices Tab */}
            {activeTab === 'invoices' && (
              <div>
                {/* Search */}
                <div className="mb-6">
                  <div className="relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search invoices by number or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Invoices Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Invoice #</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Customer</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">GST Number</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Supply Type</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">E-Invoice</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">E-Way Bill</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredInvoices.map((invoice) => (
                        <tr key={invoice._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">
                            {invoice.invoiceNumber}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900">{invoice.customer.name}</div>
                            <div className="text-sm text-gray-500">{invoice.customer.address}</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">{invoice.customer.gstNumber}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(invoice.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                              {getSupplyTypeLabel(invoice.supplyType)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold">
                            ₹{invoice.total.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.eInvoiceStatus)}`}>
                              {invoice.eInvoiceStatus.charAt(0).toUpperCase() + invoice.eInvoiceStatus.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(invoice.eWayBillStatus)}`}>
                              {invoice.eWayBillStatus.replace('_', ' ').charAt(0).toUpperCase() + invoice.eWayBillStatus.replace('_', ' ').slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* GST Returns Tab */}
            {activeTab === 'returns' && (
              <div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Return Type</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Period</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Due Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Taxable Value</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Tax Amount</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {gstReturns.map((gstReturn) => (
                        <tr key={gstReturn._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-orange-600">
                            {gstReturn.returnType}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{gstReturn.period}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(gstReturn.dueDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(gstReturn.status)}`}>
                              {gstReturn.status.charAt(0).toUpperCase() + gstReturn.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono">
                            ₹{gstReturn.summary.taxableValue.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold">
                            ₹{(gstReturn.summary.igst + gstReturn.summary.cgst + gstReturn.summary.sgst).toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded text-xs font-semibold">
                                {gstReturn.status === 'pending' ? 'File Return' : 'View Details'}
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

            {/* E-Invoice Tab */}
            {activeTab === 'e-invoice' && (
              <div className="text-center py-12">
                <CreditCardIcon className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">E-Invoice Generation</h3>
                <p className="text-gray-600 mb-6">Generate and submit e-invoices to GST portal automatically</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">1,250</div>
                    <div className="text-gray-600">Total E-Invoices</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">1,180</div>
                    <div className="text-gray-600">Successfully Filed</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">70</div>
                    <div className="text-gray-600">Pending Review</div>
                  </div>
                </div>
                <button className="mt-6 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-semibold">
                  Bulk E-Invoice Generation
                </button>
              </div>
            )}

            {/* E-Way Bill Tab */}
            {activeTab === 'e-waybill' && (
              <div className="text-center py-12">
                <TruckIcon className="w-16 h-16 text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">E-Way Bill Management</h3>
                <p className="text-gray-600 mb-6">Generate e-way bills for goods transportation over ₹50,000</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-orange-600 mb-2">850</div>
                    <div className="text-gray-600">E-Way Bills Generated</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">820</div>
                    <div className="text-gray-600">In Transit</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">30</div>
                    <div className="text-gray-600">Delivered</div>
                  </div>
                </div>
                <button className="mt-6 bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-xl font-semibold">
                  Generate E-Way Bill
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create GST Invoice Modal */}
        {showCreateInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create GST Invoice</h2>
              <form onSubmit={handleCreateInvoice} className="space-y-6">
                {/* Customer Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name</label>
                    <input
                      type="text"
                      value={invoiceForm.customerName}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer GST Number</label>
                    <input
                      type="text"
                      value={invoiceForm.customerGST}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerGST: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="29ABCDE1234F1Z5"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Customer State</label>
                    <select
                      value={invoiceForm.customerState}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, customerState: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select State</option>
                      <option value="29">Karnataka</option>
                      <option value="27">Maharashtra</option>
                      <option value="19">West Bengal</option>
                      <option value="07">Delhi</option>
                      <option value="33">Tamil Nadu</option>
                      {/* Add more states as needed */}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Place of Supply</label>
                    <input
                      type="text"
                      value={invoiceForm.placeOfSupply}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, placeOfSupply: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Supply Type</label>
                    <select
                      value={invoiceForm.supplyType}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, supplyType: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    >
                      <option value="b2b">B2B</option>
                      <option value="b2c">B2C</option>
                      <option value="b2cs">B2CS</option>
                      <option value="sewp">SEWP</option>
                      <option value="sezwp">SEZWP</option>
                      <option value="exp">Export</option>
                      <option value="imp">Import</option>
                      <option value="deemed_exp">Deemed Export</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                    <input
                      type="text"
                      value={invoiceForm.invoiceNumber}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                    <input
                      type="date"
                      value={invoiceForm.date}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                    <input
                      type="date"
                      value={invoiceForm.dueDate}
                      onChange={(e) => setInvoiceForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                      className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Add Item
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {invoiceForm.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 p-4 border border-gray-200 rounded-xl">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="HSN Code"
                            value={item.hsnCode}
                            onChange={(e) => updateInvoiceItem(index, 'hsnCode', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="text"
                            placeholder="Description"
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            required
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.rate}
                            onChange={(e) => updateInvoiceItem(index, 'rate', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            step="0.01"
                            required
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="CGST%"
                            value={item.cgstRate}
                            onChange={(e) => {
                              updateInvoiceItem(index, 'cgstRate', parseFloat(e.target.value) || 0);
                              calculateTax(index);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="SGST%"
                            value={item.sgstRate}
                            onChange={(e) => {
                              updateInvoiceItem(index, 'sgstRate', parseFloat(e.target.value) || 0);
                              calculateTax(index);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="IGST%"
                            value={item.igstRate}
                            onChange={(e) => {
                              updateInvoiceItem(index, 'igstRate', parseFloat(e.target.value) || 0);
                              calculateTax(index);
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="Total"
                            value={item.totalAmount.toFixed(2)}
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
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="font-semibold">Subtotal: </span>
                        <span className="font-mono">₹{invoiceForm.items.reduce((sum, item) => sum + item.amount, 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="font-semibold">CGST: </span>
                        <span className="font-mono">₹{invoiceForm.items.reduce((sum, item) => sum + item.cgstAmount, 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="font-semibold">SGST: </span>
                        <span className="font-mono">₹{invoiceForm.items.reduce((sum, item) => sum + item.sgstAmount, 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="font-semibold">IGST: </span>
                        <span className="font-mono">₹{invoiceForm.items.reduce((sum, item) => sum + item.igstAmount, 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-300">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-lg">Total Amount:</span>
                        <span className="font-bold text-lg font-mono text-orange-600">
                          ₹{invoiceForm.items.reduce((sum, item) => sum + item.totalAmount, 0).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
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
                    className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create GST Invoice'}
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