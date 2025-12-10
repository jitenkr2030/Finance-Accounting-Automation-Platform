'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  CalculatorIcon,
  ClipboardDocumentListIcon,
  BanknotesIcon,
  UserGroupIcon,
  CubeIcon,
  UserIcon,
  ReceiptPercentIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CogIcon,
  MagnifyingGlassIcon,
  BellIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'
import { clsx } from 'clsx'

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Ledger', href: '/ledger', icon: DocumentTextIcon },
  { name: 'GST', href: '/gst', icon: CurrencyDollarIcon },
  { name: 'Billing', href: '/billing', icon: ClipboardDocumentListIcon },
  { name: 'Customers', href: '/customers', icon: UserGroupIcon },
  { name: 'Vendors', href: '/vendors', icon: BuildingOfficeIcon },
  { name: 'Inventory', href: '/inventory', icon: CubeIcon },
  { name: 'Payroll', href: '/payroll', icon: UserIcon },
  { name: 'Expenses', href: '/expenses', icon: ReceiptPercentIcon },
  { name: 'Bank', href: '/bank', icon: BanknotesIcon },
  { name: 'Reports', href: '/reports', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="sidebar">
      {/* Logo and Company */}
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
            <CalculatorIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-neutral-900">
              Finance Platform
            </h1>
            <p className="text-sm text-neutral-600">Enterprise Edition</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-6">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search modules..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 pb-6">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={clsx(
                    'nav-item',
                    isActive && 'active'
                  )}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-neutral-100">
        <div className="flex items-center space-x-3">
          <UserCircleIcon className="w-10 h-10 text-neutral-400" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              John Doe
            </p>
            <p className="text-sm text-neutral-600 truncate">
              john@company.com
            </p>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-neutral-400 hover:text-neutral-600">
              <BellIcon className="w-5 h-5" />
            </button>
            <button className="p-2 text-neutral-400 hover:text-neutral-600">
              <CogIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}