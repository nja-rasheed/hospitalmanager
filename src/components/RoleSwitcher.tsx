'use client';

import React from 'react';
import { useUser } from '../hooks/useUser';

export function RoleSwitcher() {
  const { role, setRole } = useUser();

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-xs font-medium text-gray-600">Role:</span>
      <div className="flex gap-1">
        {(['admin', 'staff', 'patient'] as const).map((roleOption) => (
          <button
            key={roleOption}
            onClick={() => setRole(roleOption)}
            className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
              role === roleOption
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {roleOption}
          </button>
        ))}
      </div>
    </div>
  );
}
