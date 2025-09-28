'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function ConnectionTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');

    try {
      // Check environment variables
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      // Test basic connection
      const { data, error } = await supabase.from('appointments').select('count', { count: 'exact', head: true });
      
      if (error) {
        setResult(`❌ Connection failed: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
      } else {
        setResult(`✅ Connection successful!\n\nData: ${JSON.stringify(data, null, 2)}`);
      }
    } catch (err: any) {
      setResult(`❌ Exception: ${err.message}\n\nFull error: ${JSON.stringify(err, null, 2)}`);
    }
    
    setLoading(false);
  };

  const createTable = async () => {
    setLoading(true);
    setResult('Creating table...');

    try {
      // Try to create a simple appointments table
      const { error } = await supabase.rpc('exec_sql', {
        sql: `CREATE TABLE IF NOT EXISTS appointments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          patient_name VARCHAR NOT NULL,
          appointment_time TIMESTAMP NOT NULL,
          status VARCHAR DEFAULT 'waiting',
          queue_number INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        )`
      });

      if (error) {
        setResult(`❌ Table creation failed: ${error.message}`);
      } else {
        setResult('✅ Table created successfully!');
      }
    } catch (err: any) {
      setResult(`❌ Exception creating table: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Test Connection
          </button>
        </div>
        
        <pre className="p-4 bg-gray-100 rounded min-h-32 whitespace-pre-wrap text-sm">
          {result || 'Click "Test Connection" to check your Supabase setup'}
        </pre>

        <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
          <h3 className="font-semibold mb-2">If connection fails:</h3>
          <ol className="list-decimal ml-4 space-y-1 text-sm">
            <li>Check your <code>.env.local</code> file has the correct Supabase URL and key (no spaces)</li>
            <li>Restart the development server after changing environment variables</li>
            <li>Make sure your Supabase project is active</li>
            <li>Create the appointments table manually in Supabase SQL Editor</li>
          </ol>
        </div>

        <div className="p-4 bg-blue-50 rounded border border-blue-200">
          <h3 className="font-semibold mb-2">SQL to create appointments table:</h3>
          <pre className="text-sm bg-white p-2 rounded border">
{`CREATE TABLE appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_name VARCHAR NOT NULL,
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR DEFAULT 'waiting' CHECK (status IN ('waiting', 'in-progress', 'completed')),
    queue_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);`}
          </pre>
        </div>
      </div>
    </div>
  );
}