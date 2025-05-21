import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function LoginDirectPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Automatically attempt login on component mount
  useEffect(() => {
    const autoLogin = async () => {
      try {
        // Demo credentials hardcoded for automatic login
        const response = await fetch('/api/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'demo@example.com',
            password: 'password123',
            remember: true
          }),
          credentials: 'include',
        });
        
        if (response.ok) {
          // Force immediate redirect to dashboard
          window.location.replace('/dashboard');
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }
      } catch (error: any) {
        console.error("Auto login error:", error);
        setError(error.message || "Login failed");
        setIsLoading(false);
        
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message || "Please check your credentials and try again"
        });
      }
    };

    autoLogin();
  }, [toast]);

  const handleManualLogin = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          password: 'password123',
          remember: true
        }),
        credentials: 'include',
      });
      
      if (response.ok) {
        window.location.replace('/dashboard');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
    } catch (error: any) {
      console.error("Manual login error:", error);
      setError(error.message || "Login failed");
      setIsLoading(false);
      
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Please check your credentials and try again"
      });
    }
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
              {isLoading ? "Logging you in automatically..." : "Demo login failed. Try again."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            {isLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            ) : (
              <div className="space-y-4 text-center">
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {!isLoading && (
              <Button 
                onClick={handleManualLogin}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600"
              >
                Try Again
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}