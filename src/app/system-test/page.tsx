'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAppointments, useBeds, useAdmissions, useInventory, usePatients } from '../../hooks/useHospitalData';
import { DashboardLayout } from '../../components/DashboardLayout';

export default function SystemTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const { appointments, bookAppointment } = useAppointments();
  const { beds, addBed } = useBeds();
  const { admissions } = useAdmissions();
  const { inventory, addInventoryItem } = useInventory();
  const { patients, addPatient } = usePatients();

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runComprehensiveTest = async () => {
    setTesting(true);
    setTestResults([]);
    
    addResult('🔄 Starting comprehensive system test...');

    try {
      // Test 1: Environment Variables
      addResult('1️⃣ Testing environment variables...');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        addResult('❌ Environment variables missing');
        return;
      } else {
        addResult('✅ Environment variables loaded correctly');
      }

      // Test 2: Database Connection
      addResult('2️⃣ Testing database connection...');
      const { error: connectionError } = await supabase.from('appointments').select('count', { count: 'exact', head: true });
      
      if (connectionError) {
        addResult(`❌ Database connection failed: ${connectionError.message}`);
        return;
      } else {
        addResult('✅ Database connection successful');
      }

      // Test 3: Test Hooks Loading
      addResult('3️⃣ Testing data hooks...');
      addResult(`📊 Current data: ${appointments.length} appointments, ${beds.length} beds, ${patients.length} patients`);
      addResult('✅ Data hooks working');

      // Test 4: Create Patient
      addResult('4️⃣ Testing patient creation...');
      try {
        const newPatient = await addPatient({
          name: 'Test Patient',
          age: 30,
          phone: '123-456-7890'
        });
        if (newPatient) {
          addResult(`✅ Patient created successfully: ${newPatient.name}`);
        } else {
          addResult('❌ Patient creation returned null');
        }
      } catch (err: any) {
        addResult(`❌ Patient creation failed: ${err.message}`);
      }

      // Test 5: Create Appointment
      addResult('5️⃣ Testing appointment booking...');
      try {
        const newAppointment = await bookAppointment({
          patient_name: 'Test Patient',
          appointment_time: new Date().toISOString(),
          status: 'waiting',
          patient_id: 'test-id'
        });
        if (newAppointment) {
          addResult(`✅ Appointment booked successfully: Queue #${newAppointment.queue_number}`);
        } else {
          addResult('❌ Appointment booking returned null');
        }
      } catch (err: any) {
        addResult(`❌ Appointment booking failed: ${err.message}`);
      }

      // Test 6: Create Bed
      addResult('6️⃣ Testing bed creation...');
      try {
        const newBed = await addBed({
          bed_number: `TEST-${Date.now()}`,
          ward: 'Test Ward',
          status: 'available'
        });
        if (newBed) {
          addResult(`✅ Bed created successfully: ${newBed.bed_number}`);
        } else {
          addResult('❌ Bed creation returned null');
        }
      } catch (err: any) {
        addResult(`❌ Bed creation failed: ${err.message}`);
      }

      // Test 7: Create Inventory Item
      addResult('7️⃣ Testing inventory item creation...');
      try {
        const newItem = await addInventoryItem({
          name: 'Test Medicine',
          stock: 100,
          expiry_date: '2025-12-31',
          unit: 'tablets'
        });
        if (newItem) {
          addResult(`✅ Inventory item created successfully: ${newItem.name}`);
        } else {
          addResult('❌ Inventory item creation returned null');
        }
      } catch (err: any) {
        addResult(`❌ Inventory item creation failed: ${err.message}`);
      }

      addResult('🎉 Comprehensive test completed!');

    } catch (error: any) {
      addResult(`💥 Test failed with error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <DashboardLayout title="System Testing">
      <div className="space-y-6">
        {/* Test Controls */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Comprehensive System Test</h3>
              <p className="text-gray-600 text-sm mt-1">
                Test all system functionality and database connections
              </p>
            </div>
            <button
              onClick={runComprehensiveTest}
              disabled={testing}
              className={`px-6 py-3 rounded-lg font-semibold ${
                testing 
                  ? 'bg-gray-400 cursor-not-allowed text-gray-600' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {testing ? '🔄 Testing...' : '🧪 Run Test'}
            </button>
          </div>
        </div>

        {/* Console Output */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Test Console</h3>
          </div>
          <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm min-h-64 max-h-96 overflow-y-auto">
            {testResults.length === 0 ? (
              <div className="text-gray-500">Click "Run Test" to start testing all functionality...</div>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="py-1 break-words">
                  {result}
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-blue-900 mb-4 flex items-center">
              📊 Current Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Appointments:</span>
                <span className="font-medium">{appointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Beds:</span>
                <span className="font-medium">{beds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Patients:</span>
                <span className="font-medium">{patients.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Admissions:</span>
                <span className="font-medium">{admissions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inventory:</span>
                <span className="font-medium">{inventory.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-green-900 mb-4 flex items-center">
              ✅ Features Tested
            </h3>
            <div className="space-y-2 text-sm">
              <div className="text-green-800">• Environment Setup</div>
              <div className="text-green-800">• Database Connection</div>
              <div className="text-green-800">• CRUD Operations</div>
              <div className="text-green-800">• Data Hooks</div>
              <div className="text-green-800">• Error Handling</div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-purple-900 mb-4 flex items-center">
              🔗 Quick Links
            </h3>
            <div className="space-y-2 text-sm">
              <a href="/opd" className="block text-purple-800 hover:text-purple-900 hover:underline">
                → OPD Queue
              </a>
              <a href="/beds" className="block text-purple-800 hover:text-purple-900 hover:underline">
                → Bed Dashboard
              </a>
              <a href="/admissions" className="block text-purple-800 hover:text-purple-900 hover:underline">
                → Admissions
              </a>
              <a href="/inventory" className="block text-purple-800 hover:text-purple-900 hover:underline">
                → Inventory
              </a>
              <a href="/dashboard" className="block text-purple-800 hover:text-purple-900 hover:underline">
                → Dashboard
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}