import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";

const MobileNav = () => {
  const [location] = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Define primary color for active items
  const primaryColor = "#16a1bd";

  // Enhanced styles for nav items with better touch targets for iOS
  const navItemClass = "flex flex-col items-center justify-center w-full py-2 px-1";
  const activeClass = `text-[#16a1bd] font-medium`;
  const inactiveClass = "text-gray-500";
  const iconClass = "h-5 w-5 mb-1";
  const labelClass = "text-[10px] font-medium";

  // Handle scroll to hide/show navbar
  useEffect(() => {
    // For iOS - add appropriate viewport meta tag for height calculations
    const metaViewport = document.querySelector('meta[name=viewport]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1, viewport-fit=cover');
    }
    
    const handleScroll = () => {
      // If scrolled more than 20px down, hide the navbar
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(window.scrollY);
    };

    // Add touch event listeners for better iOS touch handling
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const diff = touchStartY - touchY;
      
      // Scrolling down (positive diff)
      if (diff > 30 && window.scrollY > 50) {
        setIsVisible(false);
      } 
      // Scrolling up (negative diff)
      else if (diff < -30) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [lastScrollY]);

  // Function to check if route is active
  const isActive = (path: string) => {
    // Handle nested routes like /maintenance/123
    if (path === '/') {
      return location === '/';
    }
    return location.startsWith(path);
  };

  return (
    <div className={`mobile-nav fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-30 shadow-lg pt-6 pb-7 md:hidden transition-transform duration-300 ${isVisible ? 'translate-y-0' : 'translate-y-full'}`} style={{paddingBottom: 'env(safe-area-inset-bottom, 24px)'}}>
      <div className="grid grid-cols-5 gap-0 h-full max-w-md mx-auto px-2">
        <a href="/dashboard" onClick={(e) => {
          e.preventDefault();
          window.location.href = "/dashboard";
        }} className="block min-h-[50px] flex items-center justify-center">
          <div className={`${navItemClass} ${isActive("/dashboard") ? activeClass : inactiveClass}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={iconClass}
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
            <span className={labelClass}>Home</span>
          </div>
        </a>
        
        <a href="/calendar" onClick={(e) => {
          e.preventDefault();
          window.location.href = "/calendar";
        }} className="block min-h-[50px] flex items-center justify-center">
          <div className={`${navItemClass} ${isActive("/calendar") ? activeClass : inactiveClass}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={iconClass}
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
            <span className={labelClass}>Calendar</span>
          </div>
        </a>
        
        <div 
          className={`${navItemClass} relative cursor-pointer min-h-[50px] flex items-center justify-center`}
          onClick={() => {
            // Trigger task modal open
            const taskModalEvent = new CustomEvent('opentaskmodal');
            document.dispatchEvent(taskModalEvent);
          }}
          style={{touchAction: 'manipulation'}}
        >
          {/* Center add button with improved touch area */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-r from-[#16a1bd] to-[#0d8a9e] flex items-center justify-center shadow-lg border-3 border-white" style={{touchAction: 'manipulation'}}>
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-white" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <span className={`${labelClass} mt-10 text-[#16a1bd]`}>Add</span>
        </div>
        
        <a href="/maintenance" onClick={(e) => {
          e.preventDefault();
          window.location.href = "/maintenance";
        }} className="block min-h-[50px] flex items-center justify-center">
          <div className={`${navItemClass} ${isActive("/maintenance") ? activeClass : inactiveClass}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={iconClass}
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
            <span className={labelClass}>Tasks</span>
          </div>
        </a>
        
        <a href="/vendors" onClick={(e) => {
          e.preventDefault();
          window.location.href = "/vendors";
        }} className="block min-h-[50px] flex items-center justify-center">
          <div className={`${navItemClass} ${isActive("/vendors") ? activeClass : inactiveClass}`}>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={iconClass}
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
            <span className={labelClass}>Vendors</span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default MobileNav;
