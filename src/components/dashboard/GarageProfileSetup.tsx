
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Upload, User } from "lucide-react";

interface GarageProfileSetupProps {
  userId: string;
  onProfileComplete: () => void;
}

const GarageProfileSetup = ({ userId, onProfileComplete }: GarageProfileSetupProps) => {
  const [loading, setLoading] = useState(false);
  const [garageName, setGarageName] = useState("");
  const [garageAddress, setGarageAddress] = useState("");
  const [garageImage, setGarageImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setGarageImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadGarageImage = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `garage-images/${fileName}`;

    const { error } = await supabase.storage
      .from('garages')
      .upload(filePath, file);

    if (error) {
      console.error('Error uploading image:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('garages')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload garage image if provided
      let imageUrl = null;
      if (garageImage) {
        imageUrl = await uploadGarageImage(garageImage);
      }

      // Create garage profile
      const { error } = await supabase
        .from('garages')
        .insert({
          owner_id: userId,
          name: garageName,
          location: garageAddress,
          image_url: imageUrl,
        });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to create garage profile. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: "Garage profile created successfully!",
      });

      onProfileComplete();
    } catch (error) {
      console.error("Error creating garage profile:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Complete Your Garage Profile</CardTitle>
          <CardDescription className="text-lg text-gray-600 mt-2">
            Let's set up your garage to start receiving bookings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="garageName" className="text-sm font-medium">Garage Name *</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="garageName"
                  type="text"
                  placeholder="Enter your garage name"
                  value={garageName}
                  onChange={(e) => setGarageName(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="garageAddress" className="text-sm font-medium">Garage Address *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="garageAddress"
                  type="text"
                  placeholder="Enter complete garage address"
                  value={garageAddress}
                  onChange={(e) => setGarageAddress(e.target.value)}
                  className="pl-10 h-11"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="garageImage" className="text-sm font-medium">Garage Image (Optional)</Label>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="relative">
                    <Upload className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="garageImage"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="pl-10 h-11"
                    />
                  </div>
                </div>
                {imagePreview && (
                  <div className="w-20 h-20 border-2 border-gray-200 rounded-lg overflow-hidden">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
              {loading ? "Creating Profile..." : "Complete Setup"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default GarageProfileSetup;
