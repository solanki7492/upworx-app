import { createContext, useContext } from 'react';

type AppContextType = {
  city: string | null;
  setCity: (city: string) => void;
};

export const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};