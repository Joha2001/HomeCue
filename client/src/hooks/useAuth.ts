import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  username?: string;
  profileImageUrl?: string;
};

export function useAuth() {
  const { 
    data: user, 
    isLoading,
    refetch 
  } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const login = async (email: string, password: string, remember: boolean = false) => {
    const response = await apiRequest('POST', '/api/auth/login', { email, password, remember });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    await refetch();
    return response.json();
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await apiRequest('POST', '/api/auth/register', { name, email, password });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }
    
    await refetch();
    return response.json();
  };

  const logout = async () => {
    await apiRequest('GET', '/api/auth/logout');
    queryClient.setQueryData(['/api/auth/user'], null);
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    return true;
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout
  };
}