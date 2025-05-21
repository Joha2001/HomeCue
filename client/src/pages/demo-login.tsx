import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function DemoLoginPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const attemptLogin = async () => {
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: "demo@example.com",
            password: "password123",
            remember: true
          }),
          credentials: "include"
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        }

        // Get user data after login
        const userData = await response.json();
        console.log("Login successful, redirecting...");
        
        // Add delay to ensure session is established
        setTimeout(() => {
          // Navigate to dashboard - force hard navigation
          window.location.href = "/dashboard";
        }, 1500);
      } catch (error: any) {
        console.error("Login error:", error);
        setError(error.message || "Login failed");
        setIsLoading(false);
        
        toast({
          variant: "destructive",
          title: "Demo login failed",
          description: error.message || "Unable to log in with demo account"
        });
      }
    };

    attemptLogin();
  }, [toast]);

  const tryAgain = () => {
    setIsLoading(true);
    setError("");
    
    // Retry the login
    fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "demo@example.com",
        password: "password123",
        remember: true
      }),
      credentials: "include"
    })
    .then(response => {
      if (!response.ok) {
        return response.json().then(data => {
          throw new Error(data.message || "Login failed");
        });
      }
      return response.json();
    })
    .then(() => {
      console.log("Retry successful, redirecting...");
      window.location.href = "/dashboard";
    })
    .catch(error => {
      console.error("Retry error:", error);
      setError(error.message || "Login failed");
      setIsLoading(false);
      
      toast({
        variant: "destructive",
        title: "Demo login failed",
        description: error.message || "Unable to log in with demo account"
      });
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-muted">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-500 to-cyan-500 bg-clip-text text-transparent">
            homecue
          </h1>
          <p className="mt-2 text-muted-foreground">Simplify Homeownership</p>
        </div>
        
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Demo Login</CardTitle>
            <CardDescription className="text-center">
              {isLoading ? "Logging you in automatically..." : "Demo login failed"}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm text-red-500">{error}</p>
                <Button 
                  onClick={tryAgain}
                  className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
                >
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}