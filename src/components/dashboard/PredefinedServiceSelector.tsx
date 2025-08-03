
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Clock, X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface PredefinedService {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number;
  vehicle_type: string;
}

interface PredefinedServiceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceAdded: () => void;
}

const PredefinedServiceSelector = ({ isOpen, onClose, onServiceAdded }: PredefinedServiceSelectorProps) => {
  const [services, setServices] = useState<PredefinedService[]>([]);
  const [filteredServices, setFilteredServices] = useState<PredefinedService[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedVehicleType, setSelectedVehicleType] = useState("All");
  const [selectedService, setSelectedService] = useState<PredefinedService | null>(null);
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();

  const categories = [
    "All Categories",
    "AC & Cooling",
    "Body Work", 
    "Brakes",
    "Custom",
    "Diagnostic",
    "Electrical",
    "Fuel System",
    "General",
    "Suspension",
    "Transmission",
    "Tyre",
    "Wash"
  ];

  const vehicleTypes = ["All", "Car", "Bike"];

  useEffect(() => {
    if (isOpen) {
      loadPredefinedServices();
    }
  }, [isOpen]);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory, selectedVehicleType]);

  const loadPredefinedServices = async () => {
    try {
      const { data, error } = await supabase
        .from("predefined_services")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Error loading predefined services:", error);
      toast({
        title: t('error'),
        description: "Failed to load service catalog",
        variant: "destructive",
      });
    }
  };

  const filterServices = () => {
    let filtered = services;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by vehicle type
    if (selectedVehicleType !== "All") {
      const vehicleTypeFilter = selectedVehicleType.toLowerCase();
      filtered = filtered.filter(service => 
        service.vehicle_type === vehicleTypeFilter || service.vehicle_type === "both"
      );
    }

    setFilteredServices(filtered);
  };

  const handleAddService = async () => {
    if (!selectedService || !price) {
      toast({
        title: t('error'),
        description: "Please select a service and enter a price",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("User not authenticated");

      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (!garage) throw new Error("Garage not found");

      const { error } = await supabase
        .from("services")
        .insert({
          garage_id: garage.id,
          predefined_service_id: selectedService.id,
          name: selectedService.name,
          description: selectedService.description,
          price: parseFloat(price),
          duration: selectedService.duration,
          category: selectedService.category
        });

      if (error) throw error;

      toast({
        title: t('success'),
        description: `${selectedService.name} added successfully`,
      });

      onServiceAdded();
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: t('error'),
        description: "Failed to add service",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedService(null);
    setPrice("");
    setSearchTerm("");
    setSelectedCategory("All Categories");
    setSelectedVehicleType("All");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (selectedService) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {t('Add Service from Catalog')}
              <Button variant="ghost" size="sm" onClick={() => setSelectedService(null)}>
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg mb-2">{t(selectedService.name)}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{t(selectedService.category)}</Badge>
                  <Badge variant="secondary">{t(selectedService.vehicle_type)}</Badge>
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {selectedService.duration} {t('min')}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{selectedService.description}</p>
              </CardContent>
            </Card>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t('servicePrice')} (₹)
              </label>
              <Input
                type="number"
                placeholder="Enter price in rupees"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => setSelectedService(null)} variant="outline" className="flex-1">
                {t('cancel')}
              </Button>
              <Button onClick={handleAddService} disabled={loading} className="flex-1">
                {loading ? t('loading') : t('add')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('Add Service from Catalog')}</DialogTitle>
          <p className="text-sm text-gray-600">
            {t('Choose from our comprehensive list of predefined services')}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('Search services...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              {vehicleTypes.map((type) => (
                <Button
                  key={type}
                  variant={selectedVehicleType === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedVehicleType(type)}
                >
                  {t(type)}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Buttons */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {t(category)}
              </Button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="max-h-96 overflow-y-auto">
            <div className="grid gap-3">
              {filteredServices.map((service) => (
                <Card key={service.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{t(service.name)}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">{t(service.category)}</Badge>
                          <Badge variant="secondary" className="text-xs">{t(service.vehicle_type)}</Badge>
                          <div className="flex items-center text-xs text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {service.duration} {t('min')}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{service.description}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => setSelectedService(service)}
                        className="ml-4"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No services found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PredefinedServiceSelector;
