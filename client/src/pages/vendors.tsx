import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Vendor } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VendorCard from "@/components/vendor-card";
import VendorContactModal from "@/components/vendor-contact-modal";
import VendorForm from "@/components/vendor-form";

const Vendors = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [contactVendor, setContactVendor] = useState<Vendor | undefined>(undefined);
  const [isAddVendorModalOpen, setIsAddVendorModalOpen] = useState(false);

  // Fetch vendors
  const { data: vendors, isLoading } = useQuery({
    queryKey: ['/api/vendors'],
  });

  // Get unique categories for filter dropdown
  const getUniqueCategories = () => {
    if (!vendors) return [];
    
    const categories = new Set<string>();
    vendors.forEach(vendor => {
      if (vendor.category) {
        categories.add(vendor.category);
      }
    });
    
    return Array.from(categories);
  };

  // Filter vendors based on search term and category
  const getFilteredVendors = () => {
    if (!vendors) return [];
    
    return vendors.filter(vendor => {
      // Filter by search term
      const matchesSearch = 
        searchTerm === "" || 
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (vendor.description && vendor.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by category
      const matchesCategory = !categoryFilter || vendor.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  };

  const filteredVendors = getFilteredVendors();
  const uniqueCategories = getUniqueCategories();

  // Handle vendor contact
  const handleContactVendor = (vendor: Vendor) => {
    setContactVendor(vendor);
  };

  // Close contact modal
  const closeContactModal = () => {
    setContactVendor(undefined);
  };

  return (
    <main className="px-6 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Service Providers</h2>
          <Button onClick={() => setIsAddVendorModalOpen(true)} className="flex items-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add Vendor
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-2">
            <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1 block">
              Search Vendors
            </label>
            <div className="relative">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <Input
                id="search"
                placeholder="Search by name or description"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="category-filter" className="text-sm font-medium text-gray-700 mb-1 block">
              Filter by Category
            </label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger id="category-filter">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {uniqueCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Vendors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="animate-spin h-8 w-8 text-primary" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
            </svg>
          </div>
        ) : filteredVendors.length > 0 ? (
          filteredVendors.map(vendor => (
            <VendorCard 
              key={vendor.id} 
              vendor={vendor} 
              onContactClick={handleContactVendor} 
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">No vendors found matching your search criteria.</p>
            <Button
              onClick={() => {
                setSearchTerm("");
                setCategoryFilter(undefined);
              }}
              variant="outline"
              className="mt-4"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Contact Vendor Modal */}
      <VendorContactModal 
        isOpen={!!contactVendor} 
        onClose={closeContactModal}
        vendor={contactVendor}
      />

      {/* Add Vendor Modal */}
      <VendorForm
        isOpen={isAddVendorModalOpen}
        onClose={() => setIsAddVendorModalOpen(false)}
      />
    </main>
  );
};

export default Vendors;
