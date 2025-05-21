import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { stateNames, ClimateRegion, stateToClimateRegion, getClimateRegionName } from "@shared/climate-regions";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LocationSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentState?: string;
}

export default function LocationSelector({ isOpen, onClose, currentState }: LocationSelectorProps) {
  const { toast } = useToast();
  const [selectedState, setSelectedState] = useState<string>(currentState || "");
  const [climateRegion, setClimateRegion] = useState<string>("");
  
  // When selected state changes, update climate region
  useEffect(() => {
    if (selectedState && stateToClimateRegion[selectedState]) {
      const region = stateToClimateRegion[selectedState];
      setClimateRegion(getClimateRegionName(region));
    } else {
      setClimateRegion("");
    }
  }, [selectedState]);
  
  // Save location to user profile
  const updateLocationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedState) {
        throw new Error("Please select a state");
      }
      
      const response = await apiRequest('PATCH', '/api/user/location', { 
        state: selectedState,
        climateRegion: stateToClimateRegion[selectedState] 
      });
      
      if (!response.ok) {
        throw new Error("Failed to update location");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location updated",
        description: "Your location has been saved successfully.",
      });
      
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      
      // Close dialog
      onClose();
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update location",
        description: error.message,
      });
    }
  });
  
  const handleSave = () => {
    updateLocationMutation.mutate();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set Your Location</DialogTitle>
          <DialogDescription>
            Adding your location helps us provide season-specific maintenance recommendations
            that match your local climate conditions.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="state" className="text-right">
              State
            </Label>
            <Select
              value={selectedState}
              onValueChange={setSelectedState}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select your state" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(stateNames).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {climateRegion && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                Climate Zone
              </Label>
              <div className="col-span-3 text-muted-foreground">
                {climateRegion}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            type="submit" 
            onClick={handleSave}
            disabled={!selectedState || updateLocationMutation.isPending}
          >
            {updateLocationMutation.isPending ? "Saving..." : "Save location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}