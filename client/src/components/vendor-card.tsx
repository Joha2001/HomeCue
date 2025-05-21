import { Vendor } from "@shared/schema";

interface VendorCardProps {
  vendor: Vendor;
  onContactClick?: (vendor: Vendor) => void;
}

const VendorCard = ({ vendor, onContactClick }: VendorCardProps) => {
  const renderStars = (rating: number | undefined) => {
    if (!rating) return null;
    
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(
          <svg 
            key={i}
            xmlns="http://www.w3.org/2000/svg" 
            className="text-yellow-400 h-4 w-4" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <svg 
            key={i}
            xmlns="http://www.w3.org/2000/svg" 
            className="text-yellow-400 h-4 w-4" 
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L8.91 8.26L2 9.27L7 14.14L5.82 21.02L12 17.77L18.18 21.02L17 14.14L22 9.27L15.09 8.26L12 2Z" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill="url(#half-fill)" 
            />
            <defs>
              <linearGradient id="half-fill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="50%" stopColor="currentColor" stopOpacity="1" />
                <stop offset="50%" stopColor="transparent" stopOpacity="1" />
              </linearGradient>
            </defs>
          </svg>
        );
      } else {
        stars.push(
          <svg 
            key={i}
            xmlns="http://www.w3.org/2000/svg" 
            className="text-gray-300 h-4 w-4" 
            viewBox="0 0 24 24" 
            fill="currentColor"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      }
    }
    
    return stars;
  };

  // Use the first letter of vendor name for the avatar fallback
  const avatarText = vendor.name.charAt(0).toUpperCase();
  
  // Determine icon based on category
  let categoryIcon;
  switch (vendor.category?.toLowerCase()) {
    case 'plumbing':
      categoryIcon = (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-blue-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M11 17a5 5 0 0 0 10 0"></path>
          <line x1="2" x2="22" y1="5" y2="5"></line>
          <line x1="15" x2="15" y1="5" y2="12"></line>
          <line x1="9" x2="9" y1="5" y2="12"></line>
        </svg>
      );
      break;
    case 'electrical':
      categoryIcon = (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-yellow-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M18 16.8a7.14 7.14 0 0 0 2.24-3.22 8.42 8.42 0 0 0 .52-2.86 9.44 9.44 0 0 0-1.2-4.6A9.05 9.05 0 0 0 17.9 3a8.93 8.93 0 0 0-4.22-1 9.09 9.09 0 0 0-4.37 1.1 8.88 8.88 0 0 0-1.69 1.22 9.22 9.22 0 0 0-1.39 1.61 9.09 9.09 0 0 0-1.2 4.8 8.45 8.45 0 0 0 .52 2.94A7.17 7.17 0 0 0 7.69 17"></path>
          <path d="M15 19l-3-3-3 3"></path>
          <path d="M12 16V9"></path>
        </svg>
      );
      break;
    case 'landscaping':
      categoryIcon = (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-green-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 22a9 9 0 0 0 9-9 8.75 8.75 0 0 0-.66-3.24c-.5-1.26-1.29-2.4-2.34-3.39-.35-.33-.58-.66-.58-1.05a2.1 2.1 0 0 1 .47-1.4 2.18 2.18 0 0 0 .38-2.55c-.38-.74-1.2-1.19-2.06-1.33-.87-.15-1.71-.07-2.14.73-.43.79-.34 1.82 0 2.75.31.82-.11 1.54-.5 2.27-1.01 1.87-2.77 3.8-5.29 5.26-1 .57-2.07.95-3.13 1.08C2.79 11.97 2 10.14 2 8a8 8 0 0 1 8-8"></path>
        </svg>
      );
      break;
    case 'hvac':
      categoryIcon = (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-red-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"></path>
        </svg>
      );
      break;
    default:
      categoryIcon = (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-8 w-8 text-gray-500" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M14 6a2 2 0 1 0-4 0 4 4 0 0 0 4 6 4 4 0 0 0-4 6 2 2 0 1 0 4 0"></path>
          <path d="M18 20a2 2 0 1 0 0-4"></path>
          <path d="M6 20a2 2 0 1 0 0-4"></path>
          <path d="M16 12H4"></path>
          <path d="M20 12h-4"></path>
        </svg>
      );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0 flex items-center justify-center h-14 w-14 rounded-full bg-gray-200">
            {categoryIcon}
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-semibold text-gray-800">{vendor.name}</h3>
            <div className="flex items-center mt-1">
              <div className="flex">
                {renderStars(vendor.rating)}
              </div>
              <span className="ml-1 text-xs text-gray-600">
                {vendor.rating} ({vendor.reviewCount || 0})
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-2">{vendor.description}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <div className="text-gray-600 flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{vendor.distance}</span>
            </div>
            <button 
              onClick={() => onContactClick && onContactClick(vendor)}
              className="text-primary hover:text-indigo-700 font-medium"
            >
              Contact
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorCard;
