import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import { LoginFormData, loginSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form with validation
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false
    }
  });
  
  // Handle login form submission
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // For both regular and demo accounts, use the same approach
      return await login(data.email, data.password, data.remember);
    },
    onSuccess: () => {
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      
      // Use direct window.location.href approach for all accounts
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid email or password",
      });
    }
  });

  function onSubmit(data: LoginFormData) {
    // Prevent multiple submissions
    if (isLoading || loginMutation.isPending || authLoading) return;
    
    // For either demo or regular accounts, use the same mutation
    loginMutation.mutate(data);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center items-end mb-2">
            <div className="relative mr-2">
              {/* House icon - matching dashboard style */}
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
              HomeCue
            </h1>
          </div>
          <p className="text-sm text-gray-600 font-medium tracking-wide">Simplify Homeownership</p>
        </div>

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
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
                          placeholder="name@example.com" 
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
                      <div className="flex justify-between items-center">
                        <FormLabel>Password</FormLabel>
                        <Link href="/forgot-password">
                          <span className="text-xs text-primary hover:underline cursor-pointer">
                            Forgot password?
                          </span>
                        </Link>
                      </div>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
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
                  disabled={loginMutation.isPending || isLoading}
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign in"}
                </Button>
                
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <Separator />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-2 text-xs text-gray-500">OR CONTINUE WITH</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isLoading}
                    onClick={() => {
                      setIsLoading(true);
                      window.location.href = "/api/auth/google";
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    disabled={isLoading}
                    onClick={() => {
                      setIsLoading(true);
                      window.location.href = "/api/auth/apple";
                    }}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M16.3 5.1c-1.2 0-2.1.6-2.8 1.1-.6.5-1.1.9-1.8.9-.7 0-1.3-.4-1.9-.9-.6-.5-1.5-1.1-2.8-1.1-2.2 0-4.3 1.7-4.3 4.5 0 2.8 2.1 6.9 3.8 6.9.7 0 1.2-.4 1.8-.9.5-.4 1.2-.9 2-.9s1.5.5 2 .9c.6.5 1.1.9 1.8.9 1.7 0 3.8-4.1 3.8-6.9 0-2.8-2.1-4.5-4.3-4.5"
                        fill="black"
                      />
                    </svg>
                    Apple
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>

          <CardFooter className="flex flex-col items-center">
            <p className="text-sm text-center">
              Don't have an account?{" "}
              <Link href="/register">
                <span className="text-primary hover:underline font-medium cursor-pointer">
                  Sign up
                </span>
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}