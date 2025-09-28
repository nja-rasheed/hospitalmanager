'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useUser } from '../../lib/UserContext';
import { useAppointments, useBeds, useAdmissions, useInventory, usePatients } from '../../hooks/useHospitalData';
import { Card } from '../../components/UI';
import { StatsCard, Table } from '../../components/Table';

export default function DashboardPage() {
  const { user } = useUser();
  const [userRole, setUserRole] = useState<'admin' | 'staff' | 'patient'>('admin'); // Demo role selector
  
  const { appointments } = useAppointments();
  const { beds, availableBeds, occupiedBeds } = useBeds();
  const { admissions } = useAdmissions();
  const { inventory } = useInventory();
  const { patients } = usePatients();

  // Calculate dashboard stats
  const waitingPatients = appointments.filter(apt => apt.status === 'waiting').length;
  const currentAdmissions = admissions.filter(adm => adm.status === 'admitted').length;
  const lowStockItems = inventory.filter(item => item.stock < 10).length;
  const recentPatients = patients.slice(0, 5);
  const recentAppointments = appointments.slice(0, 5);

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Patients" value={patients.length} color="blue" />
        <StatsCard title="Available Beds" value={availableBeds.length} color="green" />
        <StatsCard title="Current Admissions" value={currentAdmissions} color="yellow" />
        <StatsCard title="Low Stock Items" value={lowStockItems} color="red" />
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/opd" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
            <div className="text-blue-600 font-semibold">OPD Queue</div>
            <div className="text-sm text-gray-600">Manage appointments</div>
          </Link>
          <Link href="/beds" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
            <div className="text-green-600 font-semibold">Bed Management</div>
            <div className="text-sm text-gray-600">View bed status</div>
          </Link>
          <Link href="/admissions" className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
            <div className="text-yellow-600 font-semibold">Admissions</div>
            <div className="text-sm text-gray-600">Admit/discharge patients</div>
          </Link>
          <Link href="/inventory" className="p-4 bg-red-50 rounded-lg text-center hover:bg-red-100 transition-colors">
            <div className="text-red-600 font-semibold">Inventory</div>
            <div className="text-sm text-gray-600">Manage stock</div>
          </Link>
        </div>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Patients">
          <div className="space-y-2">
            {recentPatients.map((patient, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{patient.name}</span>
                <span className="text-sm text-gray-600">{patient.age} years</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card title="Today's Appointments">
          <div className="space-y-2">
            {recentAppointments.map((apt, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="font-medium">{apt.patient_name}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  apt.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
                  apt.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {apt.status}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );

  const renderStaffDashboard = () => (
    <div className="space-y-6">
      {/* Staff-specific stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Waiting Patients" value={waitingPatients} color="yellow" />
        <StatsCard title="Available Beds" value={availableBeds.length} color="green" />
        <StatsCard title="Current Admissions" value={currentAdmissions} color="blue" />
      </div>

      {/* Staff Quick Actions */}
      <Card title="Staff Actions">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link href="/opd" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
            <div className="text-blue-600 font-semibold">Manage Queue</div>
          </Link>
          <Link href="/admissions" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
            <div className="text-green-600 font-semibold">Patient Admission</div>
          </Link>
          <Link href="/beds" className="p-4 bg-yellow-50 rounded-lg text-center hover:bg-yellow-100 transition-colors">
            <div className="text-yellow-600 font-semibold">Bed Status</div>
          </Link>
        </div>
      </Card>

      {/* Current Queue */}
      <Card title="Current OPD Queue">
        <div className="space-y-2">
          {appointments.filter(apt => apt.status === 'waiting').slice(0, 10).map((apt, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <span className="font-medium">#{apt.queue_number} {apt.patient_name}</span>
              </div>
              <span className="text-sm text-gray-600">
                {new Date(apt.appointment_time).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );

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
            onChange={(e) => setUserRole(e.target.value as any)}
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
