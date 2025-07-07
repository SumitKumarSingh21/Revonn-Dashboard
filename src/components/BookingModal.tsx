
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, Mail, Car, Loader2 } from "lucide-react";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  garageId: string;
  serviceName: string;
}

const BookingModal = ({ isOpen, onClose, garageId, serviceName }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    vehicleMake: "",
    vehicleModel: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDate && garageId) {
      loadAvailableTimeSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot("");
    }
  }, [selectedDate, garageId]);

  const loadAvailableTimeSlots = async () => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    try {
      const dayOfWeek = selectedDate.getDay();
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      
      console.log('Loading time slots for:', { dayOfWeek, selectedDateStr, garageId });
      
      // Get available time slots for the day
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from("garage_time_slots")
        .select("id, start_time, end_time")
        .eq("garage_id", garageId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_available", true)
        .order("start_time");

      if (timeSlotsError) {
        console.error('Error fetching time slots:', timeSlotsError);
        throw timeSlotsError;
      }

      console.log('Time slots fetched:', timeSlots);

      if (!timeSlots || timeSlots.length === 0) {
        setAvailableSlots([]);
        return;
      }

      // Get already booked slots for the selected date
      const { data: bookedSlots, error: bookingsError } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("garage_id", garageId)
        .eq("booking_date", selectedDateStr)
        .in("status", ["pending", "confirmed", "in_progress"]);

      if (bookingsError) {
        console.error('Error fetching booked slots:', bookingsError);
        throw bookingsError;
      }

      console.log('Booked slots:', bookedSlots);

      // Filter out booked time slots
      const bookedTimes = bookedSlots?.map(booking => booking.booking_time) || [];
      const availableTimeSlots = timeSlots.filter(slot => 
        !bookedTimes.includes(slot.start_time)
      );

      console.log('Available time slots:', availableTimeSlots);
      setAvailableSlots(availableTimeSlots);
    } catch (error) {
      console.error("Error loading time slots:", error);
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !customerInfo.name || !customerInfo.phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get service details
      const { data: service } = await supabase
        .from("services")
        .select("id, price")
        .eq("garage_id", garageId)
        .eq("name", serviceName)
        .single();

      if (!service) {
        throw new Error("Service not found");
      }

      const selectedSlotData = availableSlots.find(slot => slot.id === selectedSlot);
      
      const { error } = await supabase
        .from("bookings")
        .insert({
          user_id: "00000000-0000-0000-0000-000000000000", // Anonymous booking
          garage_id: garageId,
          service_id: service.id,
          booking_date: selectedDate.toISOString().split('T')[0],
          booking_time: selectedSlotData?.start_time,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          vehicle_make: customerInfo.vehicleMake,
          vehicle_model: customerInfo.vehicleModel,
          notes: customerInfo.notes,
          total_amount: service.price,
          status: "pending",
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking request submitted successfully! The garage will contact you soon.",
      });

      onClose();
      // Reset form
      setSelectedDate(undefined);
      setSelectedSlot("");
      setCustomerInfo({
        name: "",
        phone: "",
        email: "",
        vehicleMake: "",
        vehicleModel: "",
        notes: "",
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Book Service: {serviceName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Date</Label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border w-full max-w-sm"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <Label className="text-base font-medium">Available Time Slots</Label>
              <div className="min-h-[100px]">
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-gray-600">Loading available slots...</span>
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot === slot.id ? "default" : "outline"}
                        onClick={() => setSelectedSlot(slot.id)}
                        className="justify-center h-12 text-sm font-medium transition-all hover:scale-105"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.start_time} - {slot.end_time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No Available Slots</h3>
                    <p className="text-gray-500">No time slots are available for this date. Please try another date.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Information */}
          {selectedSlot && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Name *
                  </Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Your full name"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone *
                  </Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="Your phone number"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="Your email address"
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make" className="flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    Vehicle Make
                  </Label>
                  <Input
                    id="make"
                    value={customerInfo.vehicleMake}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, vehicleMake: e.target.value })}
                    placeholder="e.g., Toyota"
                    className="h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input
                    id="model"
                    value={customerInfo.vehicleModel}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, vehicleModel: e.target.value })}
                    placeholder="e.g., Camry"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Input
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="Any special requirements or notes"
                  className="h-10"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-6">
                <Button onClick={onClose} variant="outline" className="flex-1 h-11">
                  Cancel
                </Button>
                <Button onClick={handleBooking} disabled={loading} className="flex-1 h-11">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
