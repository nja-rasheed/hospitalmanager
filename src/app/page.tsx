'use client';

import Link from 'next/link';
import { DashboardLayout } from '../components/DashboardLayout';
import { DashboardCard } from '../components/DashboardCard';
import RoleGuard from '../components/RoleGuard';
import { useAppointments, useBeds, useAdmissions, useInventory, usePatients } from '../hooks/useHospitalData';

const quickActions = [
  {
    title: 'OPD Queue',
    description: 'Manage patient appointments and queue system',
    href: '/opd',
    icon: '👥',
    color: 'blue' as const,
    roles: ['admin', 'staff', 'patient'] as const,
  },
  {
    title: 'Bed Management',
    description: 'Monitor bed availability and patient admissions',
    href: '/beds',
    icon: '🛏️',
    color: 'green' as const,
    roles: ['admin', 'staff'] as const,
  },
  {
    title: 'Admissions',
    description: 'Handle patient admissions and discharges',
    href: '/admissions',
    icon: '📋',
    color: 'purple' as const,
    roles: ['admin', 'staff'] as const,
  },
  {
    title: 'Inventory',
    description: 'Track medicines and medical supplies',
    href: '/inventory',
    icon: '📦',
    color: 'yellow' as const,
    roles: ['admin', 'staff'] as const,
  },
];

export default function HomePage() {
  // Get real data from database
  const { appointments } = useAppointments();
  const { beds, availableBeds, occupiedBeds } = useBeds();
  const { admissions } = useAdmissions();
  const { inventory } = useInventory();
  const { patients } = usePatients();

  // Calculate real statistics
  const todayAppointments = appointments.filter(apt => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.appointment_time).toDateString();
    return aptDate === today;
  });

  const waitingAppointments = appointments.filter(apt => apt.status === 'waiting');
  const currentAdmissions = admissions.filter(adm => adm.status === 'admitted');
  const lowStockItems = inventory.filter(item => item.stock < 10);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-xl p-8 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                Welcome to Hospital Management System
              </h1>
              <p className="text-blue-100 text-lg max-w-2xl">
                Streamline your hospital operations with our comprehensive management platform
              </p>
            </div>
            <div className="hidden lg:block text-6xl opacity-20">
              🏥
            </div>
          </div>
        </div>

        {/* Real-time Statistics */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Overview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DashboardCard
              title="Total Patients"
              value={patients.length}
              icon="👤"
              color="blue"
              subtitle="Registered in system"
            />
            <DashboardCard
              title="Available Beds"
              value={`${availableBeds.length}/${beds.length}`}
              icon="🛏️"
              color="green"
              subtitle="Ready for patients"
            />
            <DashboardCard
              title="Today&apos;s Queue"
              value={todayAppointments.length}
              icon="📅"
              color="purple"
              subtitle={`${waitingAppointments.length} waiting`}
            />
            <DashboardCard
              title="Current Admissions"
              value={currentAdmissions.length}
              icon="🏥"
              color="yellow"
              subtitle="Active patients"
            />
          </div>
        </div>

        {/* Alerts Section */}
        <RoleGuard allowed={['admin', 'staff']}>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900">System Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lowStockItems.length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-red-400 text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Low Stock Alert</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>{lowStockItems.length} items are running low on stock</p>
                        <Link href="/inventory" className="font-medium underline hover:text-red-600">
                          View Inventory →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {occupiedBeds.length / beds.length > 0.8 && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-yellow-400 text-xl">🛏️</span>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">High Bed Occupancy</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Bed occupancy is above 80%</p>
                        <Link href="/beds" className="font-medium underline hover:text-yellow-600">
                          Manage Beds →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </RoleGuard>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <RoleGuard key={action.title} allowed={[...action.roles]}>
                <Link
                  href={action.href}
                  className="group bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-4 rounded-lg bg-${action.color}-100 group-hover:bg-${action.color}-200 transition-colors`}>
                      <span className="text-3xl">{action.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              </RoleGuard>
            ))}
          </div>
        </div>

        {/* Role-specific Information Cards */}
        <div className="space-y-4">
          <RoleGuard allowed={['patient']}>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👋</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome, Patient!</h3>
                  <p className="text-blue-800 mb-4">
                    You can book appointments, check queue status, and view your medical information.
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-blue-700">
                      📞 For emergencies: Call <strong>911</strong>
                    </p>
                    <p className="text-sm text-blue-700">
                      🏥 Front desk: <strong>(555) 123-4567</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </RoleGuard>

          <RoleGuard allowed={['staff']}>
            <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👩‍⚕️</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Staff Dashboard</h3>
                  <p className="text-green-800 mb-4">
                    Manage patient care, bed assignments, and inventory tracking efficiently.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Quick Stats:</span>
                      <ul className="mt-1 space-y-1 text-green-600">
                        <li>• {waitingAppointments.length} patients waiting</li>
                        <li>• {availableBeds.length} beds available</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Priority Tasks:</span>
                      <ul className="mt-1 space-y-1 text-green-600">
                        <li>• Process OPD queue</li>
                        <li>• Update bed status</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RoleGuard>

          <RoleGuard allowed={['admin']}>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <span className="text-3xl">👨‍💼</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">Administrator Panel</h3>
                  <p className="text-purple-800 mb-4">
                    Full system access with comprehensive management and analytics capabilities.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-purple-700">System Health:</span>
                      <ul className="mt-1 space-y-1 text-purple-600">
                        <li>• Database: Online</li>
                        <li>• Services: Active</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-purple-700">Today&apos;s Summary:</span>
                      <ul className="mt-1 space-y-1 text-purple-600">
                        <li>• {todayAppointments.length} appointments</li>
                        <li>• {currentAdmissions.length} admissions</li>
                      </ul>
                    </div>
                    <div>
                      <span className="font-medium text-purple-700">Actions:</span>
                      <ul className="mt-1 space-y-1 text-purple-600">
                        <li>• <Link href="/system-test" className="underline hover:text-purple-500">Run tests</Link></li>
                        <li>• View all reports</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </RoleGuard>
        </div>
      </div>
    </DashboardLayout>
  );
}
