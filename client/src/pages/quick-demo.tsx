import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function QuickDemoPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Auto-login with demo credentials
    const loginWithDemo = async () => {
      try {
        setIsLoading(true);
        
        // Login with demo credentials
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'demo@example.com',
            password: 'password123'
          }),
          credentials: 'include'
        });
        
        if (response.ok) {
          toast({
            title: "Demo login successful",
            description: "Redirecting to dashboard...",
          });
          
          // Simple redirect to dashboard
          window.location.href = '/dashboard';
        } else {
          toast({
            variant: "destructive",
            title: "Demo login failed",
            description: "Could not access demo account."
          });
          // Redirect to regular login
          window.location.href = '/login';
        }
      } catch (error) {
        console.error("Demo login error:", error);
        toast({
          variant: "destructive",
          title: "Demo login failed",
          description: "An error occurred. Please try again."
        });
        // Redirect to regular login
        window.location.href = '/login';
      } finally {
        setIsLoading(false);
      }
    };
    
    // Execute auto-login
    loginWithDemo();
  }, [toast]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <div className="flex justify-center items-end mb-4">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="70"
            height="56"
            viewBox="0 0 24 24" 
            fill="none"
            className="text-[#16a1bd]"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="7" height="9" x="3" y="3" rx="1" />
            <rect width="7" height="5" x="14" y="3" rx="1" />
            <rect width="7" height="9" x="14" y="12" rx="1" />
            <rect width="7" height="5" x="3" y="16" rx="1" />
          </svg>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#16a1bd] to-[#0d8a9e] bg-clip-text text-transparent">
            HomeCue
          </h1>
        </div>
        <p className="text-xl text-gray-700 font-medium mb-8">Accessing Demo Account</p>
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#16a1bd] mb-4"></div>
          <p className="text-gray-600">
            Preparing your demo experience...
          </p>
        </div>
      </div>
    </div>
  );
}