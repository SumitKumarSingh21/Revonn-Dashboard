
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Car, MapPin, Star, Clock, DollarSign, Search, Phone, Mail } from "lucide-react";
import BookingModal from "@/components/BookingModal";

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
  location: string | null;
  average_rating: number;
  total_reviews: number;
  services: Service[];
}

const Services = () => {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [bookingModal, setBookingModal] = useState({
    isOpen: false,
    garageId: "",
    serviceName: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadGaragesAndServices();
  }, []);

  const loadGaragesAndServices = async () => {
    try {
      // Load all active garages
      const { data: garagesData, error: garagesError } = await supabase
        .from("garages")
        .select("*")
        .eq("status", "active")
        .order("name");

      if (garagesError) throw garagesError;

      if (!garagesData) {
        setGarages([]);
        return;
      }

      // Load services for each garage
      const garagesWithServices: Garage[] = [];
      
      for (const garage of garagesData) {
        const { data: servicesData, error: servicesError } = await supabase
          .from("services")
          .select("*")
          .eq("garage_id", garage.id)
          .order("name");

        if (servicesError) {
          console.error("Error loading services for garage:", garage.id, servicesError);
        }

        garagesWithServices.push({
          ...garage,
          services: servicesData || []
        });
      }

      setGarages(garagesWithServices);
    } catch (error) {
      console.error("Error loading garages and services:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGarages = garages.filter(garage =>
    garage.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garage.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    garage.services.some(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.category?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleBookService = (garageId: string, serviceName: string) => {
    setBookingModal({
      isOpen: true,
      garageId,
      serviceName,
    });
  };

  const closeBookingModal = () => {
    setBookingModal({
      isOpen: false,
      garageId: "",
      serviceName: "",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-bold text-gray-900">Garage Services</h1>
            </div>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button onClick={() => navigate("/auth")}>
                Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Find Auto Services Near You
            </h1>
            <p className="text-lg text-gray-600">
              Browse trusted garages and book services for your vehicle
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search garages, services, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Garages Grid */}
        {filteredGarages.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredGarages.map((garage) => (
              <Card key={garage.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{garage.name}</CardTitle>
                      {garage.location && (
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <MapPin className="h-4 w-4" />
                          {garage.location}
                        </CardDescription>
                      )}
                    </div>
                    {garage.total_reviews > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">
                          {garage.average_rating?.toFixed(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({garage.total_reviews})
                        </span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Available Services ({garage.services.length})
                      </h4>
                      
                      {garage.services.length > 0 ? (
                        <div className="space-y-2">
                          {garage.services.slice(0, 3).map((service) => (
                            <div key={service.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-sm">{service.name}</span>
                                  {service.category && (
                                    <Badge variant="secondary" className="text-xs">
                                      {service.category}
                                    </Badge>
                                  )}
                                </div>
                                {service.description && (
                                  <p className="text-xs text-gray-600 mt-1">{service.description}</p>
                                )}
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                  {service.price && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3 w-3" />
                                      ₹{service.price}
                                    </div>
                                  )}
                                  {service.duration && (
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {service.duration} min
                                    </div>
                                  )}
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                onClick={() => handleBookService(garage.id, service.name)}
                                className="ml-2"
                              >
                                Book
                              </Button>
                            </div>
                          ))}
                          
                          {garage.services.length > 3 && (
                            <p className="text-sm text-gray-500 text-center">
                              +{garage.services.length - 3} more services
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No services available</p>
                      )}
                    </div>
                    
                    <div className="pt-2 border-t">
                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => navigate(`/garage/${garage.id}`)}
                      >
                        View Full Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? "No garages found" : "No garages available"}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? "Try adjusting your search terms or browse all available services"
                : "Check back later for available garage services"
              }
            </p>
          </div>
        )}
      </div>

      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={closeBookingModal}
        garageId={bookingModal.garageId}
        serviceName={bookingModal.serviceName}
      />
    </div>
  );
};

export default Services;
