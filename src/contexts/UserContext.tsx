'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type UserRole = 'admin' | 'staff' | 'patient';

interface UserContextType {
  role: UserRole | null;
  setRole: (role: UserRole) => void;
  username: string | null;
  setUsername: (username: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole | null>('admin'); // Default to admin for demo
  const [username, setUsername] = useState<string | null>('Demo User');

  return (
    <UserContext.Provider value={{ role, setRole, username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
}
