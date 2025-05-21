import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function LoginRedirect() {
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    console.log("Login redirect component mounted, navigating to dashboard");
    
    // Add a slight delay to ensure session is established
    const timer = setTimeout(() => {
      console.log("Redirecting to dashboard now");
      // Use direct window.location to ensure a full redirect
      window.location.href = "/dashboard";
    }, 200);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#16a1bd]"></div>
      <p className="ml-3 text-gray-600">Redirecting to dashboard...</p>
    </div>
  );
}