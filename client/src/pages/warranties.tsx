import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { PlusCircle, AlertCircle, Clock, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import WarrantyModal from "@/components/warranty-modal";
import type { Warranty } from "@shared/schema";

export default function WarrantiesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarranty, setSelectedWarranty] = useState<Warranty | undefined>(undefined);
  const { toast } = useToast();

  // Fetch all warranties
  const { data: warranties = [], isLoading, refetch } = useQuery({
    queryKey: ['/api/warranties'],
  });

  // Fetch warranties expiring soon (in 90 days)
  const { data: expiringWarranties = [] } = useQuery({
    queryKey: ['/api/warranties/expiring'],
  });

  const handleAddWarranty = () => {
    setSelectedWarranty(undefined);
    setIsModalOpen(true);
  };

  const handleEditWarranty = (warranty: Warranty) => {
    setSelectedWarranty(warranty);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    refetch();
  };

  const getApplianceTypeName = (type: string) => {
    const applianceTypes: Record<string, string> = {
      refrigerator: "Refrigerator",
      dishwasher: "Dishwasher",
      washer: "Washer",
      dryer: "Dryer",
      water_heater: "Water Heater",
      hvac: "HVAC System",
      furnace: "Furnace",
      air_conditioner: "Air Conditioner",
      microwave: "Microwave",
      oven: "Oven",
      range: "Range",
      disposal: "Disposal",
      other: "Other Appliance"
    };
    return applianceTypes[type] || type.replace('_', ' ');
  };

  const getExpirationStatus = (expirationDate: string) => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.floor((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiration < 0) {
      return { status: "expired", text: "Expired", color: "destructive" };
    } else if (daysUntilExpiration <= 30) {
      return { status: "expiring-soon", text: `Expires in ${daysUntilExpiration} days`, color: "destructive" };
    } else if (daysUntilExpiration <= 90) {
      return { status: "expiring-soon", text: `Expires in ${daysUntilExpiration} days`, color: "warning" };
    } else {
      return { status: "active", text: "Active", color: "success" };
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Appliance Warranties</h1>
          <p className="text-gray-500 mt-1">
            Track and manage your appliance warranties and documents
          </p>
        </div>
        <Button onClick={handleAddWarranty} className="flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Warranty
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Warranties</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {isLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : warranties.length === 0 ? (
            <div className="bg-muted p-8 rounded-lg text-center">
              <h3 className="text-xl font-medium mb-2">No Warranties Added Yet</h3>
              <p className="text-gray-500 mb-4">
                Start tracking your appliance warranties to get notified before they expire.
              </p>
              <Button onClick={handleAddWarranty}>Add Your First Warranty</Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {warranties.map((warranty: Warranty) => {
                const expirationStatus = getExpirationStatus(warranty.warrantyExpirationDate as unknown as string);
                
                return (
                  <Card key={warranty.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{getApplianceTypeName(warranty.applianceType)}</CardTitle>
                        <Badge variant={expirationStatus.color as any}>{expirationStatus.text}</Badge>
                      </div>
                      <CardDescription>{warranty.brand} {warranty.model}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="grid gap-1">
                        {warranty.serialNumber && (
                          <div className="flex items-center text-sm">
                            <span className="font-medium mr-2">Serial:</span> 
                            {warranty.serialNumber}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-gray-500" />
                          <div>
                            <span className="font-medium">Purchased:</span>
                            {" "}
                            {format(new Date(warranty.purchaseDate as unknown as string), "MMM d, yyyy")}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <AlertCircle className="mr-2 h-4 w-4 text-gray-500" />
                          <div>
                            <span className="font-medium">Expires:</span>
                            {" "}
                            {format(new Date(warranty.warrantyExpirationDate as unknown as string), "MMM d, yyyy")}
                          </div>
                        </div>
                        
                        {warranty.documentUrl && (
                          <div className="flex items-center text-sm mt-1">
                            <FileText className="mr-2 h-4 w-4 text-gray-500" />
                            <a 
                              href={warranty.documentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              View Warranty Document
                            </a>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    
                    <Separator />
                    
                    <CardFooter className="pt-3 flex justify-center">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditWarranty(warranty)}
                      >
                        Manage Warranty
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="expiring">
          {expiringWarranties.length === 0 ? (
            <div className="bg-muted p-8 rounded-lg text-center">
              <h3 className="text-xl font-medium mb-2">No Warranties Expiring Soon</h3>
              <p className="text-gray-500">
                Great! None of your warranties are expiring in the next 90 days.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {expiringWarranties.map((warranty: Warranty) => {
                const expirationStatus = getExpirationStatus(warranty.warrantyExpirationDate as unknown as string);
                
                return (
                  <Card key={warranty.id} className="overflow-hidden hover:shadow-md transition-shadow border-warning">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle>{getApplianceTypeName(warranty.applianceType)}</CardTitle>
                        <Badge variant={expirationStatus.color as any}>{expirationStatus.text}</Badge>
                      </div>
                      <CardDescription>{warranty.brand} {warranty.model}</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pb-2">
                      <div className="grid gap-1">
                        {warranty.serialNumber && (
                          <div className="flex items-center text-sm">
                            <span className="font-medium mr-2">Serial:</span> 
                            {warranty.serialNumber}
                          </div>
                        )}
                        
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-gray-500" />
                          <div>
                            <span className="font-medium">Purchased:</span>
                            {" "}
                            {format(new Date(warranty.purchaseDate as unknown as string), "MMM d, yyyy")}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-sm">
                          <AlertCircle className="mr-2 h-4 w-4 text-gray-500" />
                          <div>
                            <span className="font-medium">Expires:</span>
                            {" "}
                            {format(new Date(warranty.warrantyExpirationDate as unknown as string), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    
                    <Separator />
                    
                    <CardFooter className="pt-3 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditWarranty(warranty)}
                      >
                        Manage Warranty
                      </Button>
                      
                      {warranty.vendorId && (
                        <Button 
                          variant="secondary" 
                          size="sm"
                        >
                          Contact Vendor
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <WarrantyModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        warranty={selectedWarranty} 
      />
    </div>
  );
}