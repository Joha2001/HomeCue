import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";

const Sidebar = () => {
  const [location] = useLocation();

  // Fetch user info
  const { data: user } = useQuery<User>({
    queryKey: ['/api/user'],
  });

  return (
    <div className="desktop-sidebar fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-10">
      <div className="flex flex-col h-full">
        <div className="px-6 py-4 border-b">
          <h1 className="text-2xl font-bold" style={{ color: "#16a1bd" }}>HomeCue</h1>
          <p className="text-sm text-gray-800 tracking-wide font-medium">HOMEOWNERSHIP SIMPLIFIED</p>
        </div>
        
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Main</h2>
            <ul>
              <li className="mb-2">
                <Link href="/">
                  <div className={`flex items-center px-4 py-2 rounded-md font-medium ${location === "/" ? "text-primary bg-indigo-50" : "text-gray-700 hover:bg-gray-100"}`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-3 h-5 w-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect width="7" height="9" x="3" y="3" rx="1"></rect>
                      <rect width="7" height="5" x="14" y="3" rx="1"></rect>
                      <rect width="7" height="9" x="14" y="12" rx="1"></rect>
                      <rect width="7" height="5" x="3" y="16" rx="1"></rect>
                    </svg>
                    Dashboard
                  </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/calendar">
                  <div className={`flex items-center px-4 py-2 rounded-md font-medium ${location === "/calendar" ? "text-primary bg-indigo-50" : "text-gray-700 hover:bg-gray-100"}`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-3 h-5 w-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
                      <line x1="16" x2="16" y1="2" y2="6"></line>
                      <line x1="8" x2="8" y1="2" y2="6"></line>
                      <line x1="3" x2="21" y1="10" y2="10"></line>
                    </svg>
                    Calendar
                  </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/maintenance">
                  <div className={`flex items-center px-4 py-2 rounded-md font-medium ${location === "/maintenance" ? "text-primary bg-indigo-50" : "text-gray-700 hover:bg-gray-100"}`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-3 h-5 w-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
                    </svg>
                    Maintenance
                  </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/vendors">
                  <div className={`flex items-center px-4 py-2 rounded-md font-medium ${location === "/vendors" ? "text-primary bg-indigo-50" : "text-gray-700 hover:bg-gray-100"}`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-3 h-5 w-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z"></path>
                      <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9"></path>
                      <path d="M12 3v6"></path>
                    </svg>
                    Vendors
                  </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/smart-assistant">
                  <div className={`flex items-center px-4 py-2 rounded-md font-medium ${location === "/smart-assistant" ? "text-primary bg-indigo-50" : "text-gray-700 hover:bg-gray-100"}`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-3 h-5 w-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M12 16v-4"></path>
                      <path d="M12 8h.01"></path>
                    </svg>
                    Smart Assistant
                  </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/warranties">
                  <div className={`flex items-center px-4 py-2 rounded-md font-medium ${location === "/warranties" ? "text-primary bg-indigo-50" : "text-gray-700 hover:bg-gray-100"}`}>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="mr-3 h-5 w-5" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect>
                      <path d="M7 7h.01"></path>
                      <path d="M7 12h.01"></path>
                      <path d="M7 17h.01"></path>
                      <path d="M11 7h6"></path>
                      <path d="M11 12h6"></path>
                      <path d="M11 17h6"></path>
                    </svg>
                    Warranties
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Categories</h2>
            <ul>
              <li className="mb-2">
                <Link href="/?frequency=daily">
                  <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    <span className="w-3 h-3 mr-3 bg-blue-500 rounded-full"></span>
                    Daily Tasks
                  </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/?frequency=weekly">
                  <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    <span className="w-3 h-3 mr-3 bg-green-500 rounded-full"></span>
                    Weekly Tasks
                  </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/?frequency=monthly">
                  <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    <span className="w-3 h-3 mr-3 bg-yellow-500 rounded-full"></span>
                    Monthly Tasks
                  </div>
                </Link>
              </li>
              <li className="mb-2">
                <Link href="/?frequency=annual">
                  <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                    <span className="w-3 h-3 mr-3 bg-red-500 rounded-full"></span>
                    Annual Tasks
                  </div>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Settings</h2>
            <ul>
              <li className="mb-2">
                <div className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mr-3 h-5 w-5 text-gray-500" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Profile
                </div>
              </li>
              <li className="mb-2">
                <a href="#" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mr-3 h-5 w-5 text-gray-500" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                  Settings
                </a>
              </li>
            </ul>
          </div>
        </nav>
        
        <div className="px-6 py-4 border-t">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
              {user && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800">{user && user.name ? user.name : 'User'}</p>
              <p className="text-xs text-gray-500">{user && user.email ? user.email : 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
