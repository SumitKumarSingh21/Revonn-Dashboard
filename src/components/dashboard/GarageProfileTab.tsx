
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, MapPin, Clock, Star } from "lucide-react";
import { User } from "@supabase/supabase-js";

interface WorkingHours {
  monday: { start: string; end: string; closed: boolean };
  tuesday: { start: string; end: string; closed: boolean };
  wednesday: { start: string; end: string; closed: boolean };
  thursday: { start: string; end: string; closed: boolean };
  friday: { start: string; end: string; closed: boolean };
  saturday: { start: string; end: string; closed: boolean };
  sunday: { start: string; end: string; closed: boolean };
}

interface GarageProfile {
  id: string;
  name: string;
  location: string;
  image_url: string | null;
  services: string[];
  rating: number;
  review_count: number;
  status: string;
  working_hours: any;
  owner_id: string;
}

interface GarageProfileTabProps {
  user: User;
}

const GarageProfileTab = ({ user }: GarageProfileTabProps) => {
  const [garage, setGarage] = useState<GarageProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const defaultWorkingHours: WorkingHours = {
    monday: { start: "09:00", end: "18:00", closed: false },
    tuesday: { start: "09:00", end: "18:00", closed: false },
    wednesday: { start: "09:00", end: "18:00", closed: false },
    thursday: { start: "09:00", end: "18:00", closed: false },
    friday: { start: "09:00", end: "18:00", closed: false },
    saturday: { start: "09:00", end: "18:00", closed: false },
    sunday: { start: "09:00", end: "18:00", closed: true }
  };

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    services: [] as string[],
    working_hours: defaultWorkingHours
  });
  const [newService, setNewService] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Helper function to safely parse working hours
  const parseWorkingHours = (data: any): WorkingHours => {
    if (!data || typeof data !== 'object') {
      return defaultWorkingHours;
    }
    
    // Check if it has the required structure
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const isValidWorkingHours = days.every(day => 
      data[day] && 
      typeof data[day] === 'object' &&
      typeof data[day].start === 'string' &&
      typeof data[day].end === 'string' &&
      typeof data[day].closed === 'boolean'
    );

    return isValidWorkingHours ? data as WorkingHours : defaultWorkingHours;
  };

  useEffect(() => {
    loadGarageProfile();
    
    // Set up real-time subscription for garage updates
    const channel = supabase
      .channel("garage-profile-updates")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "garages",
        filter: `owner_id=eq.${user.id}`
      }, (payload) => {
        console.log("Garage profile updated:", payload);
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          setGarage(payload.new as GarageProfile);
          setFormData({
            name: payload.new.name || "",
            location: payload.new.location || "",
            services: payload.new.services || [],
            working_hours: parseWorkingHours(payload.new.working_hours)
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user.id]);

  const loadGarageProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("garages")
        .select("*")
        .eq("owner_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setGarage(data);
        setFormData({
          name: data.name || "",
          location: data.location || "",
          services: data.services || [],
          working_hours: parseWorkingHours(data.working_hours)
        });
      }
    } catch (error) {
      console.error("Error loading garage profile:", error);
      toast({
        title: "Error",
        description: "Failed to load garage profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('garage-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('garage-images')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive"
      });
      return null;
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = garage?.image_url;
      
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      }

      const garageData = {
        name: formData.name,
        location: formData.location,
        services: formData.services,
        working_hours: formData.working_hours,
        image_url: imageUrl,
        owner_id: user.id,
        status: 'active',
        rating: garage?.rating || 0,
        review_count: garage?.review_count || 0
      };

      if (garage) {
        // Update existing garage
        const { error } = await supabase
          .from("garages")
          .update(garageData)
          .eq("id", garage.id);

        if (error) throw error;
      } else {
        // Create new garage
        const { data, error } = await supabase
          .from("garages")
          .insert([garageData])
          .select()
          .single();

        if (error) throw error;
        setGarage(data);
      }

      toast({
        title: "Success",
        description: "Garage profile saved successfully"
      });
      
      setImageFile(null);
    } catch (error) {
      console.error("Error saving garage profile:", error);
      toast({
        title: "Error",
        description: "Failed to save garage profile",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addService = () => {
    if (newService.trim() && !formData.services.includes(newService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, newService.trim()]
      }));
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-blue-600" />
            Garage Profile
          </CardTitle>
          <CardDescription>
            Manage your garage information that will be displayed to customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Garage Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter garage name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Enter garage location"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Garage Image</Label>
            <div className="flex items-center gap-4">
              {garage?.image_url && (
                <img 
                  src={garage.image_url} 
                  alt="Garage" 
                  className="w-20 h-20 object-cover rounded-lg border"
                />
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="max-w-xs"
              />
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <Label>Services Offered</Label>
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add a service"
                onKeyPress={(e) => e.key === 'Enter' && addService()}
              />
              <Button onClick={addService} variant="outline">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.services.map((service, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeService(service)}>
                  {service} ×
                </Badge>
              ))}
            </div>
          </div>

          {/* Current Stats */}
          {garage && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="font-semibold">{garage.rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600">Rating</p>
              </div>
              <div className="text-center">
                <div className="font-semibold">{garage.review_count}</div>
                <p className="text-sm text-gray-600">Reviews</p>
              </div>
              <div className="text-center">
                <Badge variant={garage.status === 'active' ? 'default' : 'secondary'}>
                  {garage.status}
                </Badge>
                <p className="text-sm text-gray-600">Status</p>
              </div>
            </div>
          )}

          <Button 
            onClick={handleSave} 
            disabled={saving || !formData.name || !formData.location}
            className="w-full"
          >
            {saving ? "Saving..." : garage ? "Update Profile" : "Create Profile"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default GarageProfileTab;
