
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Car, Phone, Mail, User, MessageSquare, Wrench } from "lucide-react";
import MechanicAssignmentSelect from "./MechanicAssignmentSelect";

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
  services: { name: string } | null;
}

const BookingsTab = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("bookings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        loadBookings();
      })
      .subscribe();

    return () => {
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

      const { data, error } = await supabase
        .from("bookings")
        .select(`
          *,
          services (name)
        `)
        .eq("garage_id", garage.id)
        .order("booking_date", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: "Error",
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
        title: "Success",
        description: "Booking status updated",
      });
    } catch (error) {
      console.error("Error updating booking:", error);
      toast({
        title: "Error",
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Bookings</h2>
          <p className="text-gray-600">Manage customer appointments and mechanic assignments</p>
        </div>
      </div>

      <div className="grid gap-4">
        {bookings.map((booking) => (
          <Card key={booking.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      #{booking.id.slice(0, 8)}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>{new Date(booking.booking_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span>{booking.booking_time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Car className="h-4 w-4 text-gray-400" />
                      <span>{booking.vehicle_make} {booking.vehicle_model}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span>{booking.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{booking.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span>{booking.customer_email}</span>
                    </div>
                  </div>

                  {/* Mechanic Assignment Section */}
                  {booking.status === 'confirmed' && (
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <Wrench className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Mechanic Assignment</span>
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
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Assigned Mechanic:</span>
                        <Badge variant="outline">{booking.assigned_mechanic_name}</Badge>
                      </div>
                      {booking.assigned_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          Assigned on {new Date(booking.assigned_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}

                  {booking.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <strong>Notes:</strong> {booking.notes}
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 lg:min-w-[280px]">
                  <Select onValueChange={(value) => updateBookingStatus(booking.id, value)}>
                    <SelectTrigger className="w-full sm:w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white z-50">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Message
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {bookings.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
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
