
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Clock, DollarSign, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Service {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  duration: number | null;
  category: string | null;
}

interface Garage {
  id: string;
  name: string;
}

const ServicesTab = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    loadGarageAndServices();
  }, []);

  const loadGarageAndServices = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to manage services",
          variant: "destructive",
        });
        return;
      }

      console.log("Loading garage for user:", user.user.id);

      // First, get the user's garage
      const { data: garageData, error: garageError } = await supabase
        .from("garages")
        .select("id, name")
        .eq("owner_id", user.user.id)
        .maybeSingle();

      if (garageError) {
        console.error("Error loading garage:", garageError);
        throw garageError;
      }

      if (!garageData) {
        console.log("No garage found for user");
        setGarage(null);
        setServices([]);
        return;
      }

      console.log("Garage found:", garageData);
      setGarage(garageData);

      // Now load services for this garage
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .eq("garage_id", garageData.id)
        .order("name");

      if (servicesError) {
        console.error("Error loading services:", servicesError);
        throw servicesError;
      }

      console.log("Services loaded:", servicesData);
      setServices(servicesData || []);
    } catch (error) {
      console.error("Error in loadGarageAndServices:", error);
      toast({
        title: "Error",
        description: "Failed to load garage and services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!garage) {
      toast({
        title: "No Garage Found",
        description: "Please create a garage profile first",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Service name is required",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    
    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
        category: formData.category.trim() || null,
        garage_id: garage.id,
      };

      console.log("Saving service data:", serviceData);

      let error;
      if (editingService) {
        const { error: updateError } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", editingService.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("services")
          .insert([serviceData]);
        error = insertError;
      }

      if (error) {
        console.error("Error saving service:", error);
        throw error;
      }

      toast({
        title: "Success",
        description: `Service ${editingService ? "updated" : "created"} successfully`,
      });

      setDialogOpen(false);
      setEditingService(null);
      setFormData({ name: "", description: "", price: "", duration: "", category: "" });
      loadGarageAndServices();
    } catch (error) {
      console.error("Error saving service:", error);
      toast({
        title: "Error",
        description: `Failed to ${editingService ? "update" : "create"} service`,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || "",
      price: service.price?.toString() || "",
      duration: service.duration?.toString() || "",
      category: service.category || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Service deleted successfully",
      });

      loadGarageAndServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show message if no garage exists
  if (!garage) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="text-gray-600">Manage your garage services and pricing</p>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need to create a garage profile first before you can add services. 
            Please go to the Garage Profile tab and complete your garage setup.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Services</h2>
          <p className="text-gray-600">Manage services for {garage.name}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingService(null);
              setFormData({ name: "", description: "", price: "", duration: "", category: "" });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
              <DialogDescription>
                {editingService ? "Update service details" : "Create a new service for your garage"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Service Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Oil Change, Brake Inspection"
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., Maintenance, Repair, Inspection"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the service..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="60"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : editingService ? "Update Service" : "Create Service"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => (
          <Card key={service.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  {service.category && (
                    <CardDescription className="text-sm text-blue-600 font-medium">
                      {service.category}
                    </CardDescription>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(service)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(service.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {service.description && (
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
              )}
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">
                    {service.price ? `$${service.price.toFixed(2)}` : "Price not set"}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>
                    {service.duration ? `${service.duration} min` : "Duration not set"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {services.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Plus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services yet</h3>
            <p className="text-gray-500 mb-4">Create your first service for {garage.name}</p>
            <Button onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Service
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ServicesTab;
