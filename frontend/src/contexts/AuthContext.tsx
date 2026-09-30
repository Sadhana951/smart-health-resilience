import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserRole } from '../types';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  jurisdiction: string;
  avatar: string;
}

interface AuthContextType {
  user: User;
  setRole: (role: UserRole) => void;
  canApproveTransfer: boolean;
  canStartSimulation: boolean;
  canEditInventory: boolean;
}

const roleProfiles: Record<UserRole, { name: string; jurisdiction: string; email: string }> = {
  ADMIN: {
    name: 'Dr. Debabrata Mohapatra',
    jurisdiction: 'National Health Mission / Apex Command',
    email: 'admin.nhm@gov.in'
  },
  STATE_OFFICER: {
    name: 'Dr. Anita Patnaik',
    jurisdiction: 'Odisha State Health Directorate',
    email: 'anita.patnaik@odisha.gov.in'
  },
  DISTRICT_OFFICER: {
    name: 'Dr. S. K. Behera',
    jurisdiction: 'Cuttack District Medical HQ',
    email: 'cmo.cuttack@odisha.gov.in'
  },
  PHC_WORKER: {
    name: 'Priyanka Das, Pharmacist',
    jurisdiction: 'PHC Cuttack Rural (Salipur)',
    email: 'salipur.phc@odisha.gov.in'
  }
};

const AuthContext = createContext<AuthContextType>({
  user: {
    id: 'usr-1',
    name: 'Dr. Anita Patnaik',
    email: 'anita.patnaik@odisha.gov.in',
    role: 'STATE_OFFICER',
    jurisdiction: 'Odisha State Health Directorate',
    avatar: 'AP'
  },
  setRole: () => {},
  canApproveTransfer: true,
  canStartSimulation: true,
  canEditInventory: true
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('STATE_OFFICER');

  const profile = roleProfiles[role];

  const user: User = {
    id: `usr-${role.toLowerCase()}`,
    name: profile.name,
    email: profile.email,
    role,
    jurisdiction: profile.jurisdiction,
    avatar: profile.name.split(' ').map(n => n[0]).join('').slice(0, 2)
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const canApproveTransfer = role === 'ADMIN' || role === 'STATE_OFFICER' || role === 'DISTRICT_OFFICER';
  const canStartSimulation = role === 'ADMIN' || role === 'STATE_OFFICER';
  const canEditInventory = role === 'ADMIN' || role === 'PHC_WORKER' || role === 'DISTRICT_OFFICER';

  return (
    <AuthContext.Provider value={{ user, setRole, canApproveTransfer, canStartSimulation, canEditInventory }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
