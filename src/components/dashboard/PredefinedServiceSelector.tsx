
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PredefinedService {
  id: string;
  name: string;
  category: string;
  description: string;
  duration: number;
  vehicle_type: string;
}

interface PredefinedServiceSelectorProps {
  garageId: string;
  onServiceAdded: () => void;
  onClose: () => void;
}

const PredefinedServiceSelector = ({ garageId, onServiceAdded, onClose }: PredefinedServiceSelectorProps) => {
  const [predefinedServices, setPredefinedServices] = useState<PredefinedService[]>([]);
  const [filteredServices, setFilteredServices] = useState<PredefinedService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [vehicleType, setVehicleType] = useState<string>("both");
  const [selectedService, setSelectedService] = useState<PredefinedService | null>(null);
  const [price, setPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPredefinedServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [predefinedServices, searchTerm, selectedCategory, vehicleType]);

  const loadPredefinedServices = async () => {
    try {
      const { data, error } = await supabase
        .from("predefined_services")
        .select("*")
        .order("category", { ascending: true })
        .order("name", { ascending: true });

      if (error) throw error;
      setPredefinedServices(data || []);
    } catch (error) {
      console.error("Error loading predefined services:", error);
      toast({
        title: "Error",
        description: "Failed to load predefined services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = predefinedServices;

    // Filter by vehicle type
    if (vehicleType !== "both") {
      filtered = filtered.filter(service => 
        service.vehicle_type === vehicleType || service.vehicle_type === "both"
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredServices(filtered);
  };

  const getUniqueCategories = () => {
    const categories = new Set(predefinedServices.map(service => service.category));
    return Array.from(categories).sort();
  };

  const handleAddService = async () => {
    if (!selectedService || !price) {
      toast({
        title: "Validation Error",
        description: "Please select a service and enter a price",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("services")
        .insert([{
          garage_id: garageId,
          predefined_service_id: selectedService.id,
          name: selectedService.name,
          description: selectedService.description,
          category: selectedService.category,
          duration: selectedService.duration,
          price: parseFloat(price)
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service added successfully",
      });

      onServiceAdded();
      onClose();
    } catch (error) {
      console.error("Error adding service:", error);
      toast({
        title: "Error",
        description: "Failed to add service",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!selectedService ? (
        <>
          <div>
            <h3 className="text-lg font-semibold mb-2">Select a Service</h3>
            <p className="text-sm text-gray-600">Choose from our comprehensive list of predefined services</p>
          </div>

          {/* Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Tabs value={vehicleType} onValueChange={setVehicleType} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="both">All</TabsTrigger>
                  <TabsTrigger value="car">Car</TabsTrigger>
                  <TabsTrigger value="bike">Bike</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
              >
                All Categories
              </Button>
              {getUniqueCategories().map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>

          {/* Services Grid */}
          <div className="grid gap-3 max-h-96 overflow-y-auto">
            {filteredServices.map((service) => (
              <Card
                key={service.id}
                className="cursor-pointer hover:shadow-md transition-shadow border"
                onClick={() => setSelectedService(service)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {service.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {service.vehicle_type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {service.duration} min
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredServices.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No services found matching your filters</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Set Price for Selected Service</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedService(null)} className="mb-4">
              ← Back to service selection
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {selectedService.name}
                <Badge variant="secondary">{selectedService.category}</Badge>
                <Badge variant="outline">{selectedService.vehicle_type}</Badge>
              </CardTitle>
              <CardDescription>{selectedService.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-1 text-sm text-gray-500 mb-4">
                <Clock className="h-4 w-4" />
                Estimated duration: {selectedService.duration} minutes
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Set Your Price (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price in rupees"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAddService} disabled={saving || !price}>
              {saving ? "Adding..." : "Add Service"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredefinedServiceSelector;
