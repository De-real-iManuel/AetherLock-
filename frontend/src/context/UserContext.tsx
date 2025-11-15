import * as React from 'react';

interface User {
  address: string;
  name?: string;
  role: 'client' | 'freelancer' | null;
  trustScore: number;
  kycStatus: 'pending' | 'verified' | 'rejected';
  skills?: string[];
  completedJobs: number;
  successRate: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

const UserContext = React.createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const updateProfile = async (data: Partial<User>) => {
    setIsLoading(true);
    try {
      setUser(prev => prev ? { ...prev, ...data } : null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, updateProfile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) throw new Error('useUser must be used within UserProvider');
  return context;
};