import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Calendar from "@/pages/calendar";
import Maintenance from "@/pages/maintenance";
import Vendors from "@/pages/vendors";
import SmartAssistant from "@/pages/smart-assistant";
import Warranties from "@/pages/warranties";
import Login from "@/pages/login";
import Register from "@/pages/register";
import DirectLogin from "@/pages/direct-login";
import LoginDirectPage from "@/pages/login-direct";
import DemoLoginPage from "@/pages/demo-login";
import DirectDemoPage from "@/pages/direct-demo";
import QuickDemoPage from "@/pages/quick-demo";
import Sidebar from "@/components/sidebar";
import MobileNav from "@/components/mobile-nav";
import IOSInstallPrompt from "@/components/ios-install-prompt";
import LoginRedirect from "@/components/login-redirect";
import MobileLoginPage from "@/pages/mobile-login";
import MobilePage from "@/pages/mobile";
import ILogin from "@/pages/i-login";
import FixedLogin from "@/pages/fixed-login";
import SimpleDashboard from "@/pages/simple-dashboard";
import { useEffect, useState } from "react";

// Protected route component
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: 3, // Increase retry attempts
    retryDelay: 1000 // 1 second between retries
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      <p className="ml-3 text-lg text-gray-600">Loading your dashboard...</p>
    </div>;
  }

  // Always allow access for testing on mobile
  // This will let you test the app on your iPhone without login issues
  const allowBypass = true; // Set to true for testing
  
  if (!user && !allowBypass) {
    return <Redirect to="/login" />;
  }

  // No need to check for login flags during testing

  return <Component {...rest} />;
}

// Main App
function App() {
  const [location] = useLocation();
  const [pageTitle, setPageTitle] = useState("Dashboard");
  
  // Check if the current page is a public page (login/register)
  const isPublicPage = location === "/login" || location === "/register" || location === "/demo" || location === "/login-success" || location === "/mobile-login" || location === "/mobile" || location === "/direct-demo" || location === "/i-login" || location === "/fixed-login" || location === "/quick-demo";
  
  // Update page title based on location
  useEffect(() => {
    const path = location.startsWith('/') ? location.substring(1) : location;
    if (path === '') {
      setPageTitle("Dashboard");
    } else if (path) {
      setPageTitle(path.charAt(0).toUpperCase() + path.slice(1));
    }
  }, [location]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {isPublicPage ? (
          // Public routes (login/register) - full screen, no sidebar
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/login-success" component={LoginRedirect} />
            <Route path="/register" component={Register} />
            <Route path="/demo" component={DemoLoginPage} />
            <Route path="/quick-demo" component={QuickDemoPage} />
            <Route path="/mobile-login" component={MobileLoginPage} />
            <Route path="/login-direct" component={LoginDirectPage} />
            <Route path="/mobile" component={MobilePage} />
            <Route path="/direct-demo" component={DirectDemoPage} />
            <Route path="/i-login" component={ILogin} />
            <Route path="/fixed-login" component={FixedLogin} />
            <Route path="/simple-dashboard" component={SimpleDashboard} />
          </Switch>
        ) : (
          // Protected routes with sidebar and header
          <div className="flex h-screen bg-gray-50">
            {/* Desktop sidebar - hidden on mobile */}
            <div className="hidden md:block">
              <Sidebar />
            </div>
            
            <div className="main-content flex-1 overflow-x-hidden overflow-y-auto pb-16 md:pb-0">
              <header className="bg-white shadow-sm">
                <div className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4">
                  <div className="flex items-center">
                    <h1 className="text-lg md:text-xl font-bold text-gray-800">{pageTitle}</h1>
                  </div>
                  
                  <div className="flex items-center">
                    <button type="button" className="ml-3 md:ml-4 text-gray-500 relative">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-5 w-5 md:h-6 md:w-6"
                      >
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path>
                      </svg>
                      <span className="absolute top-0 right-0 w-1.5 h-1.5 md:w-2 md:h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button type="button" className="ml-3 md:ml-4 text-gray-500">
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="h-5 w-5 md:h-6 md:w-6"
                      >
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                        <path d="M12 17h.01"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              </header>

              <Switch>
                <Route path="/" component={() => {
                  console.log("Root path accessed, redirecting to dashboard");
                  return <ProtectedRoute component={Dashboard} />;
                }} />
                <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
                <Route path="/calendar" component={() => <ProtectedRoute component={Calendar} />} />
                <Route path="/maintenance" component={() => <ProtectedRoute component={Maintenance} />} />
                <Route path="/vendors" component={() => <ProtectedRoute component={Vendors} />} />
                <Route path="/warranties" component={() => <ProtectedRoute component={Warranties} />} />
                <Route path="/smart-assistant" component={() => <ProtectedRoute component={SmartAssistant} />} />
                <Route component={NotFound} />
              </Switch>
            </div>

            {/* Mobile navigation bar - only visible on mobile */}
            <MobileNav />
          </div>
        )}
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
