import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThingsboardClient } from '../ThingsboardClient';
import { AuthUser } from '../model';

interface ThingsboardContextProps {
  client: ThingsboardClient;
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
}

const ThingsboardContext = createContext<ThingsboardContextProps | undefined>(undefined);

interface ThingsboardProviderProps {
  children: ReactNode;
  client?: ThingsboardClient;
  apiEndpoint?: string;
}

export const ThingsboardProvider: React.FC<ThingsboardProviderProps> = ({ children, client, apiEndpoint }) => {
  const [tbClient] = useState<ThingsboardClient>(() => {
    if (client) return client;
    if (apiEndpoint !== undefined) return new ThingsboardClient(apiEndpoint);
    throw new Error('ThingsboardProvider requires either "client" or "apiEndpoint" prop');
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const onUserLoaded = () => {
      setIsAuthenticated(true);
      setUser(tbClient.getAuthUser());
      setIsLoading(false);
    };

    const onUserLoggedOut = () => {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
    };

    tbClient.onUserLoaded(onUserLoaded);
    tbClient.onUserLoggedOut(onUserLoggedOut);

    // Initial check
    tbClient.init().finally(() => {
       // If init is successful and user is logged in, onUserLoaded will be called.
       // If not, we need to set loading to false.
       if (!tbClient.getToken()) {
           setIsLoading(false);
       }
    });

    return () => {
       // Cleanup logic if we implemented removeListener in ThingsboardClient
       // For now, simplistic approach
    };
  }, [tbClient]);

  return (
    <ThingsboardContext.Provider value={{ client: tbClient, isAuthenticated, isLoading, user }}>
      {children}
    </ThingsboardContext.Provider>
  );
};

export const useThingsboard = (): ThingsboardClient => {
  const context = useContext(ThingsboardContext);
  if (!context) {
    throw new Error('useThingsboard must be used within a ThingsboardProvider');
  }
  return context.client;
};

export const useAuth = () => {
    const context = useContext(ThingsboardContext);
    if (!context) {
        throw new Error('useAuth must be used within a ThingsboardProvider');
    }
    return {
        user: context.user,
        isAuthenticated: context.isAuthenticated,
        isLoading: context.isLoading,
        login: context.client.login.bind(context.client),
        logout: context.client.logout.bind(context.client),
    };
};

