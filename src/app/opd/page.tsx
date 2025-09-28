'use client';

import React, { useState } from 'react';
import { useAppointments, usePatients } from '../../hooks/useHospitalData';
import { DashboardLayout } from '../../components/DashboardLayout';
import { DashboardCard } from '../../components/DashboardCard';
import RoleGuard from '../../components/RoleGuard';

export default function OPDPage() {
  const { appointments, bookAppointment, updateAppointmentStatus } = useAppointments();
  const { addPatient } = usePatients();
  
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientName || !patientAge) {
      setAlert({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    try {
      // Create patient first
      const newPatient = await addPatient({
        name: patientName,
        age: parseInt(patientAge),
        phone: patientPhone
      });

      if (!newPatient) {
        setAlert({ type: 'error', message: 'Failed to create patient record' });
        return;
      }

      // Book appointment
      const appointment = await bookAppointment({
        patient_name: patientName,
        appointment_time: new Date().toISOString(),
        status: 'waiting',
        patient_id: newPatient.id
      });

      if (appointment) {
        setAlert({ type: 'success', message: `Appointment booked! Queue number: ${appointment.queue_number}` });
        setPatientName('');
        setPatientAge('');
        setPatientPhone('');
        setShowBookingForm(false);
      } else {
        setAlert({ type: 'error', message: 'Failed to book appointment' });
      }
    } catch (error) {
      setAlert({ type: 'error', message: 'An error occurred while booking appointment' });
    }
  };

  const waitingAppointments = appointments.filter(apt => apt.status === 'waiting');
  const inProgressAppointments = appointments.filter(apt => apt.status === 'in-progress');
  const completedToday = appointments.filter(apt => {
    const today = new Date().toDateString();
    const aptDate = new Date(apt.appointment_time).toDateString();
    return apt.status === 'completed' && aptDate === today;
  });

  return (
    <DashboardLayout title="OPD Queue Management">
      <div className="space-y-8">
        {/* Alert */}
        {alert && (
          <div className={`p-4 rounded-lg border-l-4 ${
            alert.type === 'success' 
              ? 'bg-green-50 border-green-400 text-green-700' 
              : 'bg-red-50 border-red-400 text-red-700'
          }`}>
            <div className="flex justify-between items-center">
              <span>{alert.message}</span>
              <button 
                onClick={() => setAlert(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="In Queue"
            value={waitingAppointments.length}
            icon="⏳"
            color="yellow"
            subtitle="Waiting patients"
          />
          <DashboardCard
            title="In Progress"
            value={inProgressAppointments.length}
            icon="👨‍⚕️"
            color="blue"
            subtitle="Currently consulting"
          />
          <DashboardCard
            title="Completed Today"
            value={completedToday.length}
            icon="✅"
            color="green"
            subtitle="Finished appointments"
          />
          <DashboardCard
            title="Total Today"
            value={appointments.filter(apt => {
              const today = new Date().toDateString();
              const aptDate = new Date(apt.appointment_time).toDateString();
              return aptDate === today;
            }).length}
            icon="📊"
            color="purple"
            subtitle="All appointments"
          />
        </div>

        {/* Book Appointment Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Book New Appointment</h3>
                <p className="text-sm text-gray-600 mt-1">Add a new patient to the OPD queue</p>
              </div>
              <button
                onClick={() => setShowBookingForm(!showBookingForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                {showBookingForm ? 'Cancel' : '+ Book Appointment'}
              </button>
            </div>
          </div>

          {showBookingForm && (
            <div className="p-6">
              <form onSubmit={handleBookAppointment} className="space-y-6">
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter phone number (optional)"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Book Appointment
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Queue Display */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {waitingAppointments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <span className="text-4xl mb-4 block">📋</span>
                <p className="text-lg font-medium">No patients in queue</p>
              </div>
            ) : (
              waitingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-100 text-blue-800 font-bold rounded-full w-12 h-12 flex items-center justify-center text-lg">
                        #{appointment.queue_number}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{appointment.patient_name}</h4>
                        <p className="text-sm text-gray-600">
                          Booked: {new Date(appointment.appointment_time).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <RoleGuard allowed={['admin', 'staff']}>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'in-progress')}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Start Consultation
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                        >
                          Complete
                        </button>
                      </div>
                    </RoleGuard>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* In Progress Section */}
        {inProgressAppointments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Currently Consulting</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {inProgressAppointments.map((appointment) => (
                <div key={appointment.id} className="p-6 bg-blue-50/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-600 text-white font-bold rounded-full w-12 h-12 flex items-center justify-center text-lg">
                        #{appointment.queue_number}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{appointment.patient_name}</h4>
                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          In Progress
                        </span>
                      </div>
                    </div>
                    <RoleGuard allowed={['admin', 'staff']}>
                      <button
                        onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                      >
                        Complete Consultation
                      </button>
                    </RoleGuard>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

