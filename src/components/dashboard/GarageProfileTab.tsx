
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Camera, Star, X } from "lucide-react";
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
    working_hours: defaultWorkingHours
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [generatingBanner, setGeneratingBanner] = useState(false);
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
          const updatedGarage = payload.new as GarageProfile;
          setGarage(updatedGarage);
          setFormData({
            name: updatedGarage.name || "",
            location: updatedGarage.location || "",
            working_hours: parseWorkingHours(updatedGarage.working_hours)
          });
        } else if (payload.eventType === 'DELETE') {
          setGarage(null);
          setFormData({
            name: "",
            location: "",
            working_hours: defaultWorkingHours
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
          working_hours: parseWorkingHours(data.working_hours)
        });
        // Don't show image upload if image already exists
        setShowImageUpload(!data.image_url);
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
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('garages')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('garages')
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

  const handleRemoveImage = async () => {
    if (!garage?.image_url) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from("garages")
        .update({ image_url: null })
        .eq("id", garage.id);

      if (error) throw error;

      setGarage(prev => prev ? { ...prev, image_url: null } : null);
      setShowImageUpload(true);
      
      toast({
        title: "Success",
        description: "Image removed successfully"
      });
    } catch (error) {
      console.error("Error removing image:", error);
      toast({
        title: "Error",
        description: "Failed to remove image",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const generateBanner = async () => {
    if (!formData.name || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in garage name and location first",
        variant: "destructive"
      });
      return;
    }

    setGeneratingBanner(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-garage-banner', {
        body: {
          garageName: formData.name,
          location: formData.location,
          services: garage?.services || [],
          rating: garage?.rating || 0,
          reviewCount: garage?.review_count || 0
        }
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate banner');
      }

      // Convert base64 to blob and upload to storage
      const base64Data = data.imageData;
      
      // Handle SVG format differently than binary formats
      let bannerBlob;
      let fileName;
      if (data.imageFormat === 'svg') {
        const svgContent = atob(base64Data);
        bannerBlob = new Blob([svgContent], { type: 'image/svg+xml' });
        fileName = `${user.id}/banner-${Date.now()}.svg`;
      } else {
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        bannerBlob = new Blob([byteArray], { type: `image/${data.imageFormat}` });
        fileName = `${user.id}/banner-${Date.now()}.${data.imageFormat}`;
      }
      const { error: uploadError } = await supabase.storage
        .from('garages')
        .upload(fileName, bannerBlob);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('garages')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Update garage with new banner
      if (garage) {
        const { error: updateError } = await supabase
          .from("garages")
          .update({ image_url: imageUrl })
          .eq("id", garage.id);

        if (updateError) throw updateError;
        setGarage(prev => prev ? { ...prev, image_url: imageUrl } : null);
      } else {
        // Store for later save if garage doesn't exist yet
        setImageFile(bannerBlob as any);
      }

      setShowImageUpload(false);
      toast({
        title: "Success",
        description: "Professional banner generated successfully!"
      });
    } catch (error) {
      console.error("Error generating banner:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate banner",
        variant: "destructive"
      });
    } finally {
      setGeneratingBanner(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let imageUrl = garage?.image_url;
      
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
        if (!imageUrl) {
          setSaving(false);
          return;
        }
      }

      const garageData = {
        name: formData.name,
        location: formData.location,
        services: garage?.services || [],
        working_hours: formData.working_hours as any,
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
          .insert(garageData)
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
      if (imageUrl) {
        setShowImageUpload(false);
      }
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

          {/* Image Section */}
          <div className="space-y-2">
            <Label>Garage Banner</Label>
            <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
              {garage?.image_url ? (
                <div className="space-y-4">
                  <div className="aspect-video w-full max-w-md mx-auto">
                    <img 
                      src={garage.image_url} 
                      alt="Garage Banner" 
                      className="w-full h-full object-cover rounded-lg border shadow-sm"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateBanner}
                      disabled={saving || generatingBanner || !formData.name || !formData.location}
                    >
                      {generatingBanner ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-1" />
                          Generate New Banner
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowImageUpload(true)}
                      disabled={saving || generatingBanner}
                    >
                      Upload Custom
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemoveImage}
                      disabled={saving || generatingBanner}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ) : showImageUpload ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="max-w-xs"
                    />
                    {imageFile && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setShowImageUpload(false);
                        }}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 py-8">
                  <Camera className="h-12 w-12 mx-auto text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Banner Yet</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Create a professional banner for your garage or upload your own image
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      type="button"
                      variant="default"
                      onClick={generateBanner}
                      disabled={saving || generatingBanner || !formData.name || !formData.location}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {generatingBanner ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating Banner...
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Generate AI Banner
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowImageUpload(true)}
                      disabled={saving || generatingBanner}
                    >
                      Upload Custom Image
                    </Button>
                  </div>
                  {(!formData.name || !formData.location) && (
                    <p className="text-xs text-gray-500 mt-2">
                      Please fill in garage name and location to generate a banner
                    </p>
                  )}
                </div>
              )}
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
            disabled={saving || generatingBanner || !formData.name || !formData.location}
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
