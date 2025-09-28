'use client';

import React, { useState } from 'react';
import { usePatients, useAdmissions, useBeds } from '../../hooks/useHospitalData';
import { Button, Input, Card, Select } from '../../components/UI';
import { Table } from '../../components/Table';
import { Alert } from '../../components/Modal';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardCard } from '../../components/DashboardCard';
import RoleGuard from '../../components/RoleGuard';

export default function AdmissionsPage() {
  const { patients, addPatient } = usePatients();
  const { admissions, loading: admissionsLoading, admitPatient, dischargePatient } = useAdmissions();
  const { availableBeds, updateBedStatus } = useBeds();
  
  // Form states
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [opdReference, setOpdReference] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAdmitPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName || !patientAge || !selectedBedId) {
      setAlert({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    // First, add the patient if new
    const newPatient = await addPatient({
      name: patientName,
      age: parseInt(patientAge),
      phone: patientPhone
    });

    if (!newPatient) {
      setAlert({ type: 'error', message: 'Failed to create patient record' });
      return;
    }

    // Then, create admission record
    const admission = await admitPatient({
      patient_id: newPatient.id,
      patient_name: patientName,
      bed_id: selectedBedId,
      admission_date: new Date().toISOString(),
      opd_reference: opdReference
    });

    if (!admission) {
      setAlert({ type: 'error', message: 'Failed to admit patient' });
      return;
    }

    // Finally, update bed status
    await updateBedStatus(selectedBedId, 'occupied', newPatient.id);

    setAlert({ type: 'success', message: 'Patient admitted successfully' });
    
    // Reset form
    setPatientName('');
    setPatientAge('');
    setPatientPhone('');
    setOpdReference('');
    setSelectedBedId('');
  };

  const handleDischarge = async (admissionId: string, bedId: string) => {
    await dischargePatient(admissionId);
    await updateBedStatus(bedId, 'available');
    setAlert({ type: 'success', message: 'Patient discharged successfully' });
  };

  const currentAdmissions = admissions.filter(adm => adm.status === 'admitted');
  const recentDischarges = admissions.filter(adm => adm.status === 'discharged').slice(0, 10);

  const admissionColumns = [
    { key: 'patient_name', header: 'Patient Name' },
    { key: 'bed_id', header: 'Bed ID' },
    { key: 'admission_date', header: 'Admission Date', render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'opd_reference', header: 'OPD Reference', render: (value: string) => value || '-' },
    { key: 'status', header: 'Status', render: (value: string) => (
      <span className={`px-2 py-1 rounded text-sm ${
        value === 'admitted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'actions', header: 'Actions', render: (value: any, row: any) => (
      <RoleGuard allowed={['admin', 'staff']}>
        <div className="flex gap-2">
          {row.status === 'admitted' && (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => handleDischarge(row.id, row.bed_id)}
            >
              Discharge
            </Button>
          )}
        </div>
      </RoleGuard>
    )}
  ];

  const dischargeColumns = [
    { key: 'patient_name', header: 'Patient Name' },
    { key: 'admission_date', header: 'Admission Date', render: (value: string) => new Date(value).toLocaleDateString() },
    { key: 'discharge_date', header: 'Discharge Date', render: (value: string) => value ? new Date(value).toLocaleDateString() : '-' },
    { key: 'opd_reference', header: 'OPD Reference', render: (value: string) => value || '-' }
  ];

  return (
    <DashboardLayout title="Patient Admissions">
      <div className="space-y-8">
        {alert && (
          <Alert 
            type={alert.type} 
            message={alert.message} 
            onClose={() => setAlert(null)} 
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard
            title="Current Admissions"
            value={currentAdmissions.length}
            icon="🏥"
            color="blue"
          />
          <DashboardCard
            title="Available Beds"
            value={availableBeds.length}
            icon="🛏️"
            color="green"
          />
          <DashboardCard
            title="Recent Discharges"
            value={recentDischarges.length}
            icon="✅"
            color="gray"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Admission Form */}
          <RoleGuard allowed={['admin', 'staff']}>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Admit New Patient</h3>
                  <p className="text-sm text-gray-600 mt-1">Register a new patient admission</p>
                </div>
                <div className="p-6">
                  <form onSubmit={handleAdmitPatient} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Patient Name *
                        </label>
                        <input
                          type="text"
                          value={patientName}
                          onChange={(e) => setPatientName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter patient name"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Age *
                        </label>
                        <input
                          type="number"
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter age"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Enter phone number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          OPD Reference
                        </label>
                        <input
                          type="text"
                          value={opdReference}
                          onChange={(e) => setOpdReference(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder="Optional reference"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Assign Bed *
                      </label>
                      <select
                        value={selectedBedId}
                        onChange={(e) => setSelectedBedId(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        required
                      >
                        <option value="">Select Available Bed</option>
                        {availableBeds.map(bed => (
                          <option key={bed.id} value={bed.id}>
                            {bed.bed_number} ({bed.ward})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                      >
                        Admit Patient
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </RoleGuard>

          <RoleGuard 
            allowed={['patient']}
            fallback={
              <div className="space-y-4">
                {/* Quick info cards for staff/admin */}
              </div>
            }
          >
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Patient Access</h3>
              <p className="text-blue-800 text-sm">
                For admission-related inquiries, please contact our staff at the front desk or call the hospital main line.
              </p>
            </div>
          </RoleGuard>
        </div>

        {/* Current Admissions Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Current Admissions</h3>
          </div>
          <div className="overflow-x-auto">
            <Table data={currentAdmissions} columns={admissionColumns} loading={admissionsLoading} />
          </div>
        </div>

        {/* Recent Discharges Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Discharges</h3>
          </div>
          <div className="overflow-x-auto">
            <Table data={recentDischarges} columns={dischargeColumns} loading={admissionsLoading} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
