'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAppointments, useBeds, useAdmissions, useInventory, usePatients } from '../../hooks/useHospitalData';
import { Button, Input, Card, Select } from '../../components/UI';
import { StatsCard } from '../../components/Table';
import { Modal, Alert } from '../../components/Modal';
import RoleGuard from '../../components/RoleGuard';

export default function DashboardPage() {
  const { appointments } = useAppointments();
  const { availableBeds } = useBeds();
  const { admissions } = useAdmissions();
  const { inventory } = useInventory();
  const { patients } = usePatients();

  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'patient'>('admin');

  // Calculate stats
  const waitingAppointments = appointments.filter(apt => apt.status === 'waiting');
  const currentAdmissions = admissions.filter(adm => adm.status === 'admitted');
  const lowStockItems = inventory.filter(item => item.stock < 10);

  // In case you want to show patient queue length (OPD)
  const waitingPatients = waitingAppointments.length;

  // Admin dashboard
  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Hospital Management Dashboard</h1>
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Patients" value={patients.length} color="blue" />
        <StatsCard title="Available Beds" value={availableBeds.length} color="green" />
        <StatsCard title="Waiting Queue" value={waitingAppointments.length} color="yellow" />
        <StatsCard title="Current Admissions" value={currentAdmissions.length} color="purple" />
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* OPD Queue - Available to all */}
        <Link href="/opd" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">OPD Queue</h3>
              <p className="text-gray-600">Manage patient appointments and queue</p>
            </div>
          </Card>
        </Link>

        {/* Bed Management - Admin & Staff only */}
        <RoleGuard allowed={['admin', 'staff']}>
          <Link href="/beds" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Bed Management</h3>
                <p className="text-gray-600">Monitor bed availability and assignments</p>
              </div>
            </Card>
          </Link>
        </RoleGuard>

        {/* Admissions - Admin & Staff only */}
        <RoleGuard allowed={['admin', 'staff']}>
          <Link href="/admissions" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Admissions</h3>
                <p className="text-gray-600">Handle patient admissions and discharges</p>
              </div>
            </Card>
          </Link>
        </RoleGuard>

        {/* Inventory - Admin & Staff only */}
        <RoleGuard allowed={['admin', 'staff']}>
          <Link href="/inventory" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Inventory</h3>
                <p className="text-gray-600">Track medicines and medical supplies</p>
              </div>
            </Card>
          </Link>
        </RoleGuard>
      </div>

      {/* Alerts */}
      {lowStockItems.length > 0 && (
        <Alert
          type="error"
          message={`${lowStockItems.length} items are running low on stock`}
          onClose={() => {}}
        />
      )}
    </div>
  );

  // Staff dashboard (same as admin, but could be more limited)
  const renderStaffDashboard = () => (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Hospital Staff Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Patients" value={patients.length} color="blue" />
        <StatsCard title="Available Beds" value={availableBeds.length} color="green" />
        <StatsCard title="Waiting Queue" value={waitingAppointments.length} color="yellow" />
        <StatsCard title="Current Admissions" value={currentAdmissions.length} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/opd" className="block">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2">OPD Queue</h3>
              <p className="text-gray-600">Manage patient appointments and queue</p>
            </div>
          </Card>
        </Link>
        <RoleGuard allowed={['admin', 'staff']}>
          <Link href="/beds" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Bed Management</h3>
                <p className="text-gray-600">Monitor bed availability and assignments</p>
              </div>
            </Card>
          </Link>
        </RoleGuard>
        <RoleGuard allowed={['admin', 'staff']}>
          <Link href="/admissions" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Admissions</h3>
                <p className="text-gray-600">Handle patient admissions and discharges</p>
              </div>
            </Card>
          </Link>
        </RoleGuard>
        <RoleGuard allowed={['admin', 'staff']}>
          <Link href="/inventory" className="block">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">Inventory</h3>
                <p className="text-gray-600">Track medicines and medical supplies</p>
              </div>
            </Card>
          </Link>
        </RoleGuard>
      </div>
      {lowStockItems.length > 0 && (
        <Alert
          type="error"
          message={`${lowStockItems.length} items are running low on stock`}
          onClose={() => {}}
        />
      )}
    </div>
  );

  // Patient dashboard
  const renderPatientDashboard = () => (
    <div className="space-y-6">
      <Card title="Patient Portal">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold mb-4">Welcome to Patient Portal</h3>
          <p className="text-gray-600 mb-6">Book appointments and view your medical records</p>
          <Link href="/opd" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Book Appointment
          </Link>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Your Appointments">
          <div className="space-y-2">
            {appointments.slice(0, 3).map((apt, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded">
                <div className="font-medium">Queue #{apt.queue_number}</div>
                <div className="text-sm text-gray-600">{new Date(apt.appointment_time).toLocaleString()}</div>
                <div className="text-sm">Status: {apt.status}</div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Hospital Information">
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded">
              <div className="text-green-700 font-medium">Available Beds: {availableBeds.length}</div>
            </div>
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-blue-700 font-medium">Patients in Queue: {waitingPatients}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        {/* Demo Role Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Demo Role:</span>
          <select
            value={userRole}
            onChange={(e) => setUserRole(e.target.value as 'admin' | 'staff' | 'patient')}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="patient">Patient</option>
          </select>
        </div>
      </div>
      {userRole === 'admin' && renderAdminDashboard()}
      {userRole === 'staff' && renderStaffDashboard()}
      {userRole === 'patient' && renderPatientDashboard()}
    </div>
  );
}
