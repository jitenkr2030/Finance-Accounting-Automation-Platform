'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, MagnifyingGlassIcon, PencilIcon, TrashIcon, ArrowUpDownIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';

interface Account {
  _id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  parentCode?: string;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  description?: string;
}

interface JournalEntry {
  _id: string;
  entryNumber: string;
  date: string;
  description: string;
  entries: Array<{
    account: Account;
    debit: number;
    credit: number;
    description: string;
  }>;
  totalDebit: number;
  totalCredit: number;
  status: 'draft' | 'posted' | 'reversed';
  createdAt: string;
}

export default function LedgerEngine() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'accounts' | 'journal' | 'reconciliation'>('accounts');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateAccount, setShowCreateAccount] = useState(false);
  const [showCreateJournal, setShowCreateJournal] = useState(false);

  // Account Form State
  const [accountForm, setAccountForm] = useState({
    code: '',
    name: '',
    type: 'asset' as Account['type'],
    parentCode: '',
    openingBalance: 0,
    description: ''
  });

  // Journal Entry Form State
  const [journalForm, setJournalForm] = useState({
    entryNumber: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    entries: [
      { account: '', debit: 0, credit: 0, description: '' }
    ]
  });

  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchJournalEntries();
    }
  }, [user]);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await api.ledger.getAccounts();
      setAccounts(response.data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJournalEntries = async () => {
    try {
      const response = await api.ledger.getJournalEntries();
      setJournalEntries(response.data);
    } catch (error) {
      console.error('Error fetching journal entries:', error);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.ledger.createAccount(accountForm);
      setAccountForm({
        code: '',
        name: '',
        type: 'asset',
        parentCode: '',
        openingBalance: 0,
        description: ''
      });
      setShowCreateAccount(false);
      fetchAccounts();
    } catch (error) {
      console.error('Error creating account:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJournalEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.ledger.createJournalEntry(journalForm);
      setJournalForm({
        entryNumber: '',
        date: new Date().toISOString().split('T')[0],
        description: '',
        entries: [
          { account: '', debit: 0, credit: 0, description: '' }
        ]
      });
      setShowCreateJournal(false);
      fetchJournalEntries();
    } catch (error) {
      console.error('Error creating journal entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const addJournalEntry = () => {
    setJournalForm(prev => ({
      ...prev,
      entries: [...prev.entries, { account: '', debit: 0, credit: 0, description: '' }]
    }));
  };

  const updateJournalEntry = (index: number, field: string, value: any) => {
    setJournalForm(prev => ({
      ...prev,
      entries: prev.entries.map((entry, i) => 
        i === index ? { ...entry, [field]: value } : entry
      )
    }));
  };

  const removeJournalEntry = (index: number) => {
    setJournalForm(prev => ({
      ...prev,
      entries: prev.entries.filter((_, i) => i !== index)
    }));
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || account.type === filterType;
    return matchesSearch && matchesType;
  });

  const accountTypeColors = {
    asset: 'bg-blue-100 text-blue-800',
    liability: 'bg-red-100 text-red-800',
    equity: 'bg-purple-100 text-purple-800',
    revenue: 'bg-green-100 text-green-800',
    expense: 'bg-orange-100 text-orange-800'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Ledger Engine</h1>
              <p className="text-gray-600 text-lg">Comprehensive chart of accounts and double-entry bookkeeping</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowCreateAccount(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                New Account
              </button>
              <button
                onClick={() => setShowCreateJournal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                Journal Entry
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-8">
          <div className="flex border-b border-gray-200">
            {[
              { id: 'accounts', label: 'Chart of Accounts', count: filteredAccounts.length },
              { id: 'journal', label: 'Journal Entries', count: journalEntries.length },
              { id: 'reconciliation', label: 'Bank Reconciliation', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 font-semibold text-lg transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Accounts Tab */}
            {activeTab === 'accounts' && (
              <div>
                {/* Filters */}
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search accounts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Types</option>
                    <option value="asset">Assets</option>
                    <option value="liability">Liabilities</option>
                    <option value="equity">Equity</option>
                    <option value="revenue">Revenue</option>
                    <option value="expense">Expenses</option>
                  </select>
                </div>

                {/* Accounts Table */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Code</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Account Name</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Type</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Opening Balance</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Current Balance</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredAccounts.map((account) => (
                        <tr key={account._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">{account.code}</td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{account.name}</div>
                              {account.description && (
                                <div className="text-sm text-gray-500">{account.description}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${accountTypeColors[account.type]}`}>
                              {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono">
                            ₹{account.openingBalance.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold">
                            ₹{account.currentBalance.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className600 hover:text-blue="text-blue--800 p-1">
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800 p-1">
                                <TrashIcon className="w-4 h-4" />
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

            {/* Journal Entries Tab */}
            {activeTab === 'journal' && (
              <div>
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Entry #</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total Debit</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Total Credit</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Status</th>
                        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {journalEntries.map((entry) => (
                        <tr key={entry._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">
                            {entry.entryNumber}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {new Date(entry.date).toLocaleDateString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">{entry.description}</td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold text-red-600">
                            ₹{entry.totalDebit.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-right text-sm font-mono font-semibold text-green-600">
                            ₹{entry.totalCredit.toLocaleString('en-IN')}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              entry.status === 'posted' ? 'bg-green-100 text-green-800' :
                              entry.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button className="text-blue-600 hover:text-blue-800 p-1">
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button className="text-red-600 hover:text-red-800 p-1">
                                <TrashIcon className="w-4 h-4" />
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

            {/* Reconciliation Tab */}
            {activeTab === 'reconciliation' && (
              <div className="text-center py-12">
                <ArrowUpDownIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Bank Reconciliation</h3>
                <p className="text-gray-600">Connect your bank accounts for automatic reconciliation</p>
                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold">
                  Connect Bank Account
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Create Account Modal */}
        {showCreateAccount && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Account</h2>
              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Code</label>
                    <input
                      type="text"
                      value={accountForm.code}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, code: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                    <select
                      value={accountForm.type}
                      onChange={(e) => setAccountForm(prev => ({ ...prev, type: e.target.value as Account['type'] }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="asset">Asset</option>
                      <option value="liability">Liability</option>
                      <option value="equity">Equity</option>
                      <option value="revenue">Revenue</option>
                      <option value="expense">Expense</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Name</label>
                  <input
                    type="text"
                    value={accountForm.name}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Parent Account (Optional)</label>
                  <input
                    type="text"
                    value={accountForm.parentCode}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, parentCode: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Balance</label>
                  <input
                    type="number"
                    value={accountForm.openingBalance}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, openingBalance: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={accountForm.description}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateAccount(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Journal Entry Modal */}
        {showCreateJournal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Journal Entry</h2>
              <form onSubmit={handleCreateJournalEntry} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Entry Number</label>
                    <input
                      type="text"
                      value={journalForm.entryNumber}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, entryNumber: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={journalForm.date}
                      onChange={(e) => setJournalForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <input
                    type="text"
                    value={journalForm.description}
                    onChange={(e) => setJournalForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Journal Entry Lines */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Entry Details</h3>
                    <button
                      type="button"
                      onClick={addJournalEntry}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold text-sm"
                    >
                      Add Line
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {journalForm.entries.map((entry, index) => (
                      <div key={index} className="grid grid-cols-6 gap-3 p-4 border border-gray-200 rounded-xl">
                        <div className="col-span-2">
                          <select
                            value={entry.account}
                            onChange={(e) => updateJournalEntry(index, 'account', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            required
                          >
                            <option value="">Select Account</option>
                            {accounts.map((account) => (
                              <option key={account._id} value={account._id}>
                                {account.code} - {account.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Debit"
                            value={entry.debit || ''}
                            onChange={(e) => updateJournalEntry(index, 'debit', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <input
                            type="number"
                            placeholder="Credit"
                            value={entry.credit || ''}
                            onChange={(e) => updateJournalEntry(index, 'credit', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            step="0.01"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Description"
                            value={entry.description}
                            onChange={(e) => updateJournalEntry(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="flex items-center justify-center">
                          {journalForm.entries.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeJournalEntry(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Balance Check */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Debit:</span>
                      <span className="font-mono text-red-600">
                        ₹{journalForm.entries.reduce((sum, entry) => sum + entry.debit, 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="font-semibold">Total Credit:</span>
                      <span className="font-mono text-green-600">
                        ₹{journalForm.entries.reduce((sum, entry) => sum + entry.credit, 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-300">
                      <span className="font-semibold">Difference:</span>
                      <span className={`font-mono font-bold ${
                        journalForm.entries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0) === 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}>
                        ₹{Math.abs(journalForm.entries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateJournal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || journalForm.entries.reduce((sum, entry) => sum + entry.debit - entry.credit, 0) !== 0}
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Journal Entry'}
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