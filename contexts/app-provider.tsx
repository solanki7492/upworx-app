import { AuthProvider } from '@/contexts/auth-context';
import { StorageService } from '@/lib';
import { useEffect, useState } from 'react';
import { AppContext } from './app-context';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const storedCity = await StorageService.getSelectedCity();
      if (storedCity) setCityState(storedCity);
    })();
  }, []);

  const setCity = async (newCity: string) => {
    setCityState(newCity);
    await StorageService.setSelectedCity(newCity);
  };

  return (
    <AuthProvider>
      <AppContext.Provider value={{ city, setCity }}>
        {children}
      </AppContext.Provider>
    </AuthProvider>
  );
}