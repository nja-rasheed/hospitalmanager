# Hospital Management System

A prototype hospital management system built with Next.js, TypeScript, Tailwind CSS, and Supabase.

## Features

1. **OPD Queuing System**
   - Patients can book appointments
   - Live queue with estimated waiting times
   - Staff can update appointment status

2. **Bed Availability Dashboard**
   - Real-time bed status (available/occupied)
   - Admit/discharge patient functionality
   - Ward-wise bed management

3. **Patient Admission**
   - Patient registration form
   - Bed assignment
   - Discharge management

4. **Inventory Management**
   - Medicine and consumables tracking
   - Stock level monitoring
   - Expiry date alerts

5. **Role-based Dashboards**
   - Admin: Full system overview
   - Staff: Operational tasks
   - Patient: Appointment booking and status

## Database Schema

### Required Supabase Tables

```sql
-- Patients table
CREATE TABLE patients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    age INTEGER NOT NULL,
    phone VARCHAR,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    patient_name VARCHAR NOT NULL,
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed')),
    queue_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Beds table
CREATE TABLE beds (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bed_number VARCHAR UNIQUE NOT NULL,
    ward VARCHAR NOT NULL,
    status VARCHAR DEFAULT 'available' CHECK (status IN ('available', 'occupied')),
    patient_id UUID REFERENCES patients(id),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Admissions table
CREATE TABLE admissions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID REFERENCES patients(id),
    patient_name VARCHAR NOT NULL,
    bed_id UUID REFERENCES beds(id),
    admission_date TIMESTAMP NOT NULL,
    discharge_date TIMESTAMP,
    opd_reference VARCHAR,
    status VARCHAR DEFAULT 'admitted' CHECK (status IN ('admitted', 'discharged'))
);

-- Inventory table
CREATE TABLE inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR NOT NULL,
    stock INTEGER NOT NULL,
    expiry_date DATE NOT NULL,
    unit VARCHAR NOT NULL,
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## Setup Instructions

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Supabase Setup**
   - Create a new Supabase project at https://supabase.com
   - Run the SQL commands above in the Supabase SQL editor
   - Copy `.env.example` to `.env.local`
   - Fill in your Supabase URL and anon key

3. **Run Development Server**
   ```bash
   npm run dev
   ```

4. **Access the Application**
   - Open http://localhost:3000
   - Navigate through different modules
   - Use the role switcher on the dashboard to see different views

## Demo Data

You can add some sample data through the UI or run these SQL commands in Supabase:

```sql
-- Sample beds
INSERT INTO beds (bed_number, ward, status) VALUES
('B001', 'General Ward', 'available'),
('B002', 'General Ward', 'available'),
('ICU001', 'ICU', 'available'),
('ICU002', 'ICU', 'available');

-- Sample inventory
INSERT INTO inventory (name, stock, expiry_date, unit) VALUES
('Paracetamol', 150, '2025-12-31', 'tablets'),
('Bandages', 50, '2026-06-30', 'pieces'),
('Syringes', 200, '2025-08-15', 'pieces');
```

## Technology Stack

- **Frontend**: Next.js 13+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── opd/               # OPD queuing system
│   ├── beds/              # Bed management
│   ├── admissions/        # Patient admission
│   ├── inventory/         # Inventory management
│   └── dashboard/         # Role-based dashboard
├── components/            # Reusable UI components
├── hooks/                 # Custom React hooks for data
└── lib/                   # Supabase client and utilities
```

## Contributing

This is a prototype for hackathon purposes. Feel free to extend and modify as needed.
