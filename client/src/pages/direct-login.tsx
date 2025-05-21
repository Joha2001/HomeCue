import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { LoginFormData, loginSchema } from "@shared/schema";
import { zodResolver } from "@hookform/resolvers/zod";

export default function DirectLoginPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with validation
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@example.com",
      password: "password123",
      remember: true
    }
  });
  
  async function onSubmit(data: LoginFormData) {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Direct fetch API call to login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      
      if (response.ok) {
        // Show success toast
        toast({
          title: "Login successful",
          description: "Redirecting to dashboard...",
        });
        
        // Short delay then redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        setIsLoading(false);
        
        // Show error toast
        const errorData = await response.json();
        toast({
          variant: "destructive",
          title: "Login failed",
          description: errorData.message || "Invalid email or password",
        });
      }
    } catch (error) {
      setIsLoading(false);
      
      // Show error toast
      toast({
        variant: "destructive",
        title: "Login failed",
        description: "An error occurred during login",
      });
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-end mb-2">
            <div className="relative mr-2">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="50"
                height="40"
                viewBox="0 0 24 24" 
                fill="none"
                className="text-[#16a1bd]"
              >
                <rect width="7" height="9" x="3" y="3" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect width="7" height="5" x="14" y="3" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect width="7" height="9" x="14" y="12" rx="1" stroke="currentColor" strokeWidth="2" />
                <rect width="7" height="5" x="3" y="16" rx="1" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#16a1bd] to-[#0d8a9e] bg-clip-text text-transparent">
              Homecue
            </h1>
          </div>
          <p className="text-sm text-gray-600 font-medium tracking-wide">Simplify Homeownership</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Demo Login</CardTitle>
            <CardDescription className="text-center">
              Sign in with our demo account to access Homecue
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="demo@example.com" 
                          type="email" 
                          autoComplete="email"
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="password123" 
                          type="password" 
                          autoComplete="current-password"
                          disabled={isLoading}
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="remember"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#16a1bd] hover:bg-[#1390a9]"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in with Demo Account"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}