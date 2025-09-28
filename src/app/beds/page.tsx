'use client';

import React, { useState } from 'react';
import { useBeds, useAdmissions } from '../../hooks/useHospitalData';
import { Button, Input, Card, Select } from '../../components/UI';
import { Table } from '../../components/Table';
import { Modal, Alert } from '../../components/Modal';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardCard } from '../../components/DashboardCard';
import RoleGuard from '../../components/RoleGuard';

export default function BedsPage() {
  const { beds, availableBeds, occupiedBeds, loading: bedsLoading, updateBedStatus, addBed } = useBeds();
  const { admissions, dischargePatient } = useAdmissions();
  const [showAddBedForm, setShowAddBedForm] = useState(false);
  const [bedNumber, setBedNumber] = useState('');
  const [ward, setWard] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddBed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bedNumber || !ward) {
      setAlert({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    const result = await addBed({
      bed_number: bedNumber,
      ward,
      status: 'available'
    });

    if (result) {
      setAlert({ type: 'success', message: 'Bed added successfully' });
      setBedNumber('');
      setWard('');
      setShowAddBedForm(false);
    } else {
      setAlert({ type: 'error', message: 'Failed to add bed' });
    }
  };

  const handleDischarge = async (bedId: string, patientId?: string) => {
    // Find the admission record for this patient/bed
    const admission = admissions.find(adm => 
      adm.patient_id === patientId && adm.status === 'admitted'
    );
    
    if (admission) {
      await dischargePatient(admission.id);
    }
    
    // Free the bed
    await updateBedStatus(bedId, 'available');
    setAlert({ type: 'success', message: 'Patient discharged successfully' });
  };

  const bedColumns = [
    { key: 'bed_number', header: 'Bed Number' },
    { key: 'ward', header: 'Ward' },
    { key: 'status', header: 'Status', render: (value: string) => (
      <span className={`px-2 py-1 rounded text-sm ${
        value === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}>
        {value}
      </span>
    )},
    { key: 'patient_id', header: 'Patient ID', render: (value: string) => value || '-' },
    { key: 'actions', header: 'Actions', render: (value: any, row: any) => (
      <RoleGuard allowed={['admin', 'staff']}>
        <div className="flex gap-2">
          {row.status === 'occupied' && (
            <Button 
              size="sm" 
              variant="danger" 
              onClick={() => handleDischarge(row.id, row.patient_id)}
            >
              Discharge
            </Button>
          )}
        </div>
      </RoleGuard>
    )}
  ];

  const wards = ['General Ward', 'ICU', 'Emergency', 'Pediatric', 'Maternity'];

  return (
    <DashboardLayout title="Bed Management">
      <div className="space-y-8">
        {/* Action Button */}
        <div className="flex justify-end">
          <RoleGuard allowed={['admin', 'staff']}>
            <button
              onClick={() => setShowAddBedForm(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors shadow-sm"
            >
              + Add New Bed
            </button>
          </RoleGuard>
        </div>

        {alert && (
          <div className={`p-4 rounded-lg border-l-4 ${
            alert.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-700' 
              : 'bg-red-50 border-red-400 text-red-700'
          }`}>
            <div className="flex justify-between items-center">
              <span>{alert.message}</span>
              <button onClick={() => setAlert(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <DashboardCard
            title="Total Beds"
            value={beds.length}
            icon="🛏️"
            color="blue"
          />
          <DashboardCard
            title="Available"
            value={availableBeds.length}
            icon="✅"
            color="green"
          />
          <DashboardCard
            title="Occupied"
            value={occupiedBeds.length}
            icon="👤"
            color="red"
          />
        </div>

        {/* Bed Grid Visualization */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bed Status Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {beds.map((bed) => (
              <div
                key={bed.id}
                className={`p-4 rounded-lg border-2 text-center transition-colors ${
                  bed.status === 'available' 
                    ? 'border-green-300 bg-green-50 hover:bg-green-100' 
                    : 'border-red-300 bg-red-50 hover:bg-red-100'
                }`}
              >
                <div className="font-semibold text-sm">{bed.bed_number}</div>
                <div className="text-xs text-gray-600 mt-1">{bed.ward}</div>
                <div className={`text-xs font-medium mt-2 px-2 py-1 rounded ${
                  bed.status === 'available' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {bed.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bed Details Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Bed Details</h3>
          </div>
          <div className="overflow-x-auto">
            <Table data={beds} columns={bedColumns} loading={bedsLoading} />
          </div>
        </div>

        {/* Add Bed Modal */}
        <Modal 
          isOpen={showAddBedForm} 
          onClose={() => setShowAddBedForm(false)}
          title="Add New Bed"
        >
          <div className="p-6">
            <form onSubmit={handleAddBed} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bed Number *
                </label>
                <input
                  type="text"
                  value={bedNumber}
                  onChange={(e) => setBedNumber(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., B001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ward *
                </label>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                >
                  <option value="">Select Ward</option>
                  {wards.map(w => (
                    <option key={w} value={w}>{w}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddBedForm(false)}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                  Add Bed
                </button>
              </div>
            </form>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
