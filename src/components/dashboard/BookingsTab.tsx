import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Car, Phone, Mail, User, MessageSquare, Wrench, Package, MapPin, FileText, CreditCard } from "lucide-react";
import MechanicAssignmentSelect from "./MechanicAssignmentSelect";
import { useLanguage } from "@/contexts/LanguageContext";

interface BookingService {
  id: string;
  name: string;
  price: number;
}

interface Booking {
  id: string;
  booking_date: string;
  booking_time: string;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  vehicle_make: string | null;
  vehicle_model: string | null;
  total_amount: number | null;
  notes: string | null;
  assigned_mechanic_id: string | null;
  assigned_mechanic_name: string | null;
  assigned_at: string | null;
  services: BookingService[];
  vehicle_type: string | null;
  payment_method: string | null;
}

const BookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    loadBookings();

    // Set up real-time subscription for bookings
    const channel = supabase
      .channel("bookings-realtime-updates")
      .on(
        "postgres_changes", 
        { 
          event: "*", 
          schema: "public", 
          table: "bookings" 
        }, 
        (payload) => {
          console.log("Booking updated:", payload);
          loadBookings();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up bookings subscription...");
      supabase.removeChannel(channel);
    };
  }, []);

  const loadBookings = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (!garage) return;

      // Get bookings with their services
      const { data: bookingsData, error } = await supabase
        .from("bookings")
        .select("*")
        .eq("garage_id", garage.id)
        .order("booking_date", { ascending: false });

      if (error) throw error;

      // For each booking, get all associated services
      const bookingsWithServices = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: bookingServices, error: servicesError } = await supabase
            .from("booking_services")
            .select(`
              service_id,
              services!inner(name, price)
            `)
            .eq("booking_id", booking.id);

          if (servicesError) {
            console.error("Error loading booking services:", servicesError);
          }

          const services = bookingServices?.map(bs => ({
            id: bs.service_id,
            name: (bs.services as any)?.name || "Unknown Service",
            price: (bs.services as any)?.price || 0
          })) || [];

          return {
            ...booking,
            services
          };
        })
      );

      setBookings(bookingsWithServices);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: t('error'),
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .update({ status })
        .eq("id", bookingId);

      if (error) throw error;

      toast({
        title: t('success'),
        description: "Booking status updated",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: t('error'),
        description: "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const handleAssignmentChange = (bookingId: string) => (mechanicId: string | null, mechanicName: string | null) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === bookingId 
          ? { 
              ...booking, 
              assigned_mechanic_id: mechanicId,
              assigned_mechanic_name: mechanicName,
              assigned_at: mechanicId ? new Date().toISOString() : null
            }
          : booking
      )
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('bookings')}</h2>
          <p className="text-gray-600 mt-1">{t('manageBookings')}</p>
        </div>
      </div>

      <div className="space-y-6">
        {bookings.map((booking) => (
          <Card key={booking.id} className="shadow-sm border-0 bg-white">
            <CardContent className="p-6">
              {/* Header Section */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <Badge className={getStatusColor(booking.status)} variant="secondary">
                    {t(booking.status)}
                  </Badge>
                  <span className="text-sm text-gray-500 font-mono">
                    #{booking.id.slice(0, 8)}
                  </span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select onValueChange={(value) => updateBookingStatus(booking.id, value)}>
                    <SelectTrigger className="w-full sm:w-32 h-9">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="pending">{t('pending')}</SelectItem>
                      <SelectItem value="confirmed">{t('confirmed')}</SelectItem>
                      <SelectItem value="completed">{t('completed')}</SelectItem>
                      <SelectItem value="cancelled">{t('cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm" className="h-9">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </div>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                
                {/* Date & Time */}
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Date & Time</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-3 w-3 text-gray-400" />
                      <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span>{booking.booking_time}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-green-900">Customer</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{booking.customer_name || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{booking.customer_phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{booking.customer_email || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <Car className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-purple-900">Vehicle</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Car className="h-3 w-3 text-gray-400" />
                      <span className="truncate">{booking.vehicle_make} {booking.vehicle_model}</span>
                    </div>
                    <div>
                      <Badge variant="outline" className="text-xs bg-white">
                        {booking.vehicle_type || 'Car'}
                      </Badge>
                    </div>
                  </div>
                </div>

              </div>

              {/* Services and Payment Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                
                {/* Services */}
                <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-indigo-900">Services</h3>
                  </div>
                  <div className="space-y-2">
                    {booking.services.length > 0 ? (
                      booking.services.map((service, index) => (
                        <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                          <span className="text-sm font-medium truncate mr-2">{service.name}</span>
                          <Badge variant="outline" className="text-xs">${service.price}</Badge>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <Package className="h-6 w-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-500">No services found</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Information */}
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="h-4 w-4 text-white" />
                    </div>
                    <h3 className="font-semibold text-orange-900">Payment</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Method:</span>
                      <Badge variant="outline" className="text-xs bg-white">
                        {booking.payment_method || 'Cash'}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-sm font-medium text-gray-900">Total:</span>
                      <span className="text-lg font-bold text-gray-900">${booking.total_amount || 0}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Additional Notes */}
              {booking.notes && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-gray-500 rounded-lg flex items-center justify-center">
                      <FileText className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900">Notes</h3>
                  </div>
                  <div className="bg-white p-3 rounded border text-sm text-gray-600">
                    {booking.notes}
                  </div>
                </div>
              )}

              {/* Mechanic Assignment */}
              {booking.status === 'confirmed' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Wrench className="h-3 w-3 text-white" />
                    </div>
                    <h3 className="font-semibold text-blue-900">Mechanic Assignment</h3>
                  </div>
                  <MechanicAssignmentSelect
                    bookingId={booking.id}
                    currentMechanicId={booking.assigned_mechanic_id}
                    onAssignmentChange={handleAssignmentChange(booking.id)}
                  />
                  {booking.assigned_at && (
                    <div className="text-xs text-blue-600 mt-2">
                      Assigned on {new Date(booking.assigned_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

              {/* Show assigned mechanic for other statuses */}
              {booking.assigned_mechanic_name && booking.status !== 'confirmed' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Assigned Mechanic:</span>
                    <Badge variant="outline" className="text-xs">{booking.assigned_mechanic_name}</Badge>
                  </div>
                  {booking.assigned_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      Assigned on {new Date(booking.assigned_at).toLocaleString()}
                    </div>
                  )}
                </div>
              )}

            </CardContent>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <Card className="shadow-sm">
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500">Your customer bookings will appear here</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BookingsTab;
