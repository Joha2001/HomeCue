import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  username?: string;
  profileImageUrl?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Fetch current user
  const { 
    data: user = null, 
    isLoading: isUserLoading,
    refetch: refetchUser
  } = useQuery({
    queryKey: ['/api/auth/user'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/auth/user');
        if (response.ok) {
          return await response.json() as AuthUser;
        }
        return null;
      } catch (error) {
        console.error("Auth error:", error);
        return null;
      }
    },
    retry: false,
    refetchOnWindowFocus: true,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async ({ email, password, remember }: { email: string, password: string, remember?: boolean }) => {
      const response = await apiRequest('POST', '/api/auth/login', { email, password, remember });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Welcome back to HomeCue!",
      });
      refetchUser();
      setIsRedirecting(true);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      });
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password }: { name: string, email: string, password: string }) => {
      const response = await apiRequest('POST', '/api/auth/register', { name, email, password });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful",
        description: "Your account has been created!",
      });
      refetchUser();
      setIsRedirecting(true);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message || "Failed to create account",
      });
    }
  });

  // We've updated the login page to handle redirects directly
  // This effect is still needed for registration flow
  useEffect(() => {
    if (isRedirecting && user) {
      // Use direct redirection instead of changing the location
      window.location.href = '/dashboard';
      setIsRedirecting(false);
    }
  }, [isRedirecting, user]);

  // Login function
  const login = async (email: string, password: string, remember: boolean = false) => {
    const userData = await loginMutation.mutateAsync({ email, password, remember });
    
    // After successful login, force immediate redirect to dashboard
    if (userData) {
      window.location.replace('/dashboard');
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    await registerMutation.mutateAsync({ name, email, password });
  };

  // Logout function
  const logout = async () => {
    try {
      await apiRequest('GET', '/api/auth/logout');
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      window.location.href = '/login';
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: "destructive",
        title: "Logout failed",
        description: "There was an error logging out",
      });
    }
  };

  const isLoading = isUserLoading || loginMutation.isPending || registerMutation.isPending;
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}