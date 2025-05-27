import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthConfig {
  domain: string;
  clientId: string;
  authorizationParams: {
    redirect_uri: string;
    audience: string;
  };
  cacheLocation: 'memory';
  useRefreshTokens: boolean;
}

interface AuthConfigContextType {
  config: AuthConfig | null;
  isLoading: boolean;
  error: string | null;
}

const AuthConfigContext = createContext<AuthConfigContextType>({
  config: null,
  isLoading: true,
  error: null,
});

export const useAuthConfig = () => {
  const context = useContext(AuthConfigContext);
  if (!context) {
    throw new Error('useAuthConfig must be used within AuthConfigProvider');
  }
  return context;
};

interface AuthConfigProviderProps {
  children: React.ReactNode;
}

export const AuthConfigProvider: React.FC<AuthConfigProviderProps> = ({ children }) => {
  const [config, setConfig] = useState<AuthConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAuthConfig = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/auth-config');
        
        if (!response.ok) {
          throw new Error(`Failed to load auth configuration: ${response.statusText}`);
        }
        
        const authConfig = await response.json();
        setConfig(authConfig);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load auth configuration';
        setError(errorMessage);
        console.error('Error loading auth configuration:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuthConfig();
  }, []);

  return (
    <AuthConfigContext.Provider value={{ config, isLoading, error }}>
      {children}
    </AuthConfigContext.Provider>
  );
}; 