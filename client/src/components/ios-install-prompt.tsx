import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const IOSInstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    
    // Check if the app is already installed (in standalone mode)
    const isStandalone = (window.matchMedia('(display-mode: standalone)').matches) || 
                        ((window as any).navigator.standalone);
    
    // Show prompt only on iOS devices when not in standalone mode
    if (isIOS && !isStandalone) {
      // Check if the user has already dismissed the prompt
      const hasPromptBeenShown = localStorage.getItem('iosPromptShown');
      
      if (!hasPromptBeenShown) {
        // Wait a few seconds before showing the prompt
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const dismissPrompt = () => {
    setShowPrompt(false);
    localStorage.setItem('iosPromptShown', 'true');
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 z-50 px-4 pb-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mx-auto max-w-md relative">
        <button 
          onClick={dismissPrompt}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#16a1bd] to-[#0d8a9e] flex items-center justify-center mr-3">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              viewBox="0 0 24 24"
              className="w-6 h-6 text-white"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
            >
              <path d="M2 20V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2Z"></path>
              <path d="M2 8h20"></path>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Add HomeCue to Home Screen</h3>
            <p className="text-xs text-gray-600">For the best experience on your iPhone</p>
          </div>
        </div>
        
        <div className="space-y-2 mb-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs font-bold">1</span>
            </div>
            <p className="text-sm">Tap the share button <span className="font-medium">
              <svg className="w-4 h-4 inline-block" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                <polyline points="16 6 12 2 8 6"></polyline>
                <line x1="12" y1="2" x2="12" y2="15"></line>
              </svg>
            </span></p>
          </div>
          
          <div className="flex items-center">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center mr-2">
              <span className="text-xs font-bold">2</span>
            </div>
            <p className="text-sm">Scroll down and tap <span className="font-medium">Add to Home Screen</span></p>
          </div>
        </div>
        
        <div className="mt-4">
          <button 
            onClick={dismissPrompt}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-[#16a1bd] to-[#0d8a9e] text-white font-semibold rounded-lg shadow-sm hover:from-[#0d8a9e] hover:to-[#16a1bd]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default IOSInstallPrompt;