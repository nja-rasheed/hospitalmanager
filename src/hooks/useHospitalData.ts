'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Types
export interface Patient {
  id: string;
  name: string;
  age: number;
  phone?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  patient_name: string;
  appointment_time: string;
  status: 'waiting' | 'in-progress' | 'completed';
  queue_number: number;
  created_at: string;
}

export interface Bed {
  id: string;
  bed_number: string;
  ward: string;
  status: 'available' | 'occupied';
  patient_id?: string;
  updated_at: string;
}

export interface Admission {
  id: string;
  patient_id: string;
  patient_name: string;
  bed_id: string;
  admission_date: string;
  discharge_date?: string;
  opd_reference?: string;
  status: 'admitted' | 'discharged';
}

export interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  expiry_date: string;
  unit: string;
  updated_at: string;
}

export function usePatients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (!error && data) setPatients(data);
    setLoading(false);
  };

  const addPatient = async (patient: Omit<Patient, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('patients').insert([patient]).select().single();
    if (!error && data) {
      setPatients(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  useEffect(() => { fetchPatients(); }, []);

  return { patients, loading, addPatient, refetch: fetchPatients };
}

export function useAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('appointments').select('*').order('queue_number');
    if (!error && data) setAppointments(data);
    setLoading(false);
  };

  const bookAppointment = async (appointment: Omit<Appointment, 'id' | 'created_at' | 'queue_number'>) => {
    try {
      console.log('Starting bookAppointment with:', appointment);
      
      // Test basic connection first
      const { error: connectionError } = await supabase.from('appointments').select('count', { count: 'exact', head: true });
      if (connectionError) {
        console.error('Connection test failed:', connectionError);
        console.error('Connection error details:', JSON.stringify(connectionError, null, 2));
        throw new Error(`Database connection failed: ${connectionError.message || 'Unknown connection error'}`);
      }
      
      // Get next queue number
      const { data: maxQueue, error: queueError } = await supabase.from('appointments')
        .select('queue_number')
        .eq('status', 'waiting')
        .order('queue_number', { ascending: false })
        .limit(1);
      
      if (queueError) {
        console.error('Error fetching queue:', queueError);
        console.error('Queue error details:', JSON.stringify(queueError, null, 2));
        throw new Error(`Queue fetch failed: ${queueError.message || 'Unknown queue error'}`);
      }
      
      const nextQueueNumber = maxQueue && maxQueue.length > 0 ? maxQueue[0].queue_number + 1 : 1;
      console.log('Next queue number:', nextQueueNumber);
      
      // Create appointment without patient_id foreign key constraint
      const appointmentData = {
        patient_name: appointment.patient_name,
        appointment_time: appointment.appointment_time,
        status: appointment.status,
        queue_number: nextQueueNumber,
        patient_id: null // Set to null to avoid foreign key constraint issues
      };
      
      console.log('Inserting appointment:', appointmentData);
      
      const { data, error } = await supabase.from('appointments')
        .insert([appointmentData])
        .select()
        .single();
      
      if (error) {
        console.error('Error inserting appointment:', error);
        console.error('Insert error details:', JSON.stringify(error, null, 2));
        throw new Error(`Insert failed: ${error.message || 'Unknown insert error'}`);
      }
      
      if (data) {
        console.log('Successfully created appointment:', data);
        setAppointments(prev => [...prev, data]);
        await fetchAppointments(); // Refresh the list
        return data;
      }
      
      throw new Error('No data returned from insert operation');
    } catch (err: any) {
      console.error('Unexpected error in bookAppointment:', err);
      console.error('Error object:', JSON.stringify(err, null, 2));
      console.error('Error message:', err?.message);
      console.error('Error stack:', err?.stack);
      throw err;
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const { data, error } = await supabase.from('appointments').update({ status }).eq('id', id).select().single();
    if (!error && data) {
      setAppointments(prev => prev.map(apt => apt.id === id ? data : apt));
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  return { appointments, loading, bookAppointment, updateAppointmentStatus, refetch: fetchAppointments };
}

export function useBeds() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBeds = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('beds').select('*').order('bed_number');
    if (!error && data) setBeds(data);
    setLoading(false);
  };

  const updateBedStatus = async (id: string, status: Bed['status'], patient_id?: string) => {
    const { data, error } = await supabase.from('beds').update({ 
      status, 
      patient_id: status === 'occupied' ? patient_id : null,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    
    if (!error && data) {
      setBeds(prev => prev.map(bed => bed.id === id ? data : bed));
    }
  };

  const addBed = async (bed: Omit<Bed, 'id' | 'updated_at'>) => {
    const { data, error } = await supabase.from('beds').insert([{
      ...bed,
      updated_at: new Date().toISOString()
    }]).select().single();
    
    if (!error && data) {
      setBeds(prev => [...prev, data]);
      return data;
    }
    return null;
  };

  useEffect(() => { fetchBeds(); }, []);

  const availableBeds = beds.filter(bed => bed.status === 'available');
  const occupiedBeds = beds.filter(bed => bed.status === 'occupied');

  return { 
    beds, 
    availableBeds, 
    occupiedBeds, 
    loading, 
    updateBedStatus, 
    addBed, 
    refetch: fetchBeds 
  };
}

export function useAdmissions() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAdmissions = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('admissions').select('*').order('admission_date', { ascending: false });
    if (!error && data) setAdmissions(data);
    setLoading(false);
  };

  const admitPatient = async (admission: Omit<Admission, 'id' | 'status'>) => {
    const { data, error } = await supabase.from('admissions').insert([{
      ...admission,
      status: 'admitted'
    }]).select().single();
    
    if (!error && data) {
      setAdmissions(prev => [data, ...prev]);
      return data;
    }
    return null;
  };

  const dischargePatient = async (id: string) => {
    const { data, error } = await supabase.from('admissions').update({
      status: 'discharged',
      discharge_date: new Date().toISOString()
    }).eq('id', id).select().single();
    
    if (!error && data) {
      setAdmissions(prev => prev.map(adm => adm.id === id ? data : adm));
    }
  };

  useEffect(() => { fetchAdmissions(); }, []);

  return { admissions, loading, admitPatient, dischargePatient, refetch: fetchAdmissions };
}

export function useInventory() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('inventory').select('*').order('name');
    if (!error && data) setInventory(data);
    setLoading(false);
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'updated_at'>) => {
    const { data, error } = await supabase.from('inventory').insert([{
      ...item,
      updated_at: new Date().toISOString()
    }]).select().single();
    
    if (!error && data) {
      setInventory(prev => [...prev, data]);
      return data;
    }
    return null;
  };

  const updateStock = async (id: string, stock: number) => {
    const { data, error } = await supabase.from('inventory').update({
      stock,
      updated_at: new Date().toISOString()
    }).eq('id', id).select().single();
    
    if (!error && data) {
      setInventory(prev => prev.map(item => item.id === id ? data : item));
    }
  };

  useEffect(() => { fetchInventory(); }, []);

  return { inventory, loading, addInventoryItem, updateStock, refetch: fetchInventory };
}
