'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RoleSwitcher } from './RoleSwitcher';
import RoleGuard from './RoleGuard';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: '🏠', roles: ['admin', 'staff', 'patient'] },
  { name: 'OPD Queue', href: '/opd', icon: '👥', roles: ['admin', 'staff', 'patient'] },
  { name: 'Beds', href: '/beds', icon: '🛏️', roles: ['admin', 'staff'] },
  { name: 'Admissions', href: '/admissions', icon: '📋', roles: ['admin', 'staff'] },
  { name: 'Inventory', href: '/inventory', icon: '📦', roles: ['admin', 'staff'] },
  { name: 'System Test', href: '/system-test', icon: '🧪', roles: ['admin'] },
];

export function DashboardLayout({ children, title }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <span className="text-white text-xl">🏥</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Hospital Manager
                  </h1>
                  <p className="text-xs text-gray-500">Healthcare Solutions</p>
                </div>
              </Link>
            </div>
            <div className="hidden md:block">
              <RoleSwitcher />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="md:hidden mb-6">
          <RoleSwitcher />
        </div>

        {/* Navigation */}
        <nav className="mb-8">
          <div className="bg-white rounded-xl shadow-sm p-2 border border-gray-200">
            <div className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <RoleGuard key={item.name} allowed={item.roles as ('admin' | 'staff' | 'patient')[]}>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      pathname === item.href
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.name}
                  </Link>
                </RoleGuard>
              ))}
            </div>
          </div>
        </nav>

        {/* Page Title */}
        {title && (
          <div className="mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
              <div className="mt-2 h-1 w-20 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full"></div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="pb-8">{children}</main>
      </div>
    </div>
  );
}
