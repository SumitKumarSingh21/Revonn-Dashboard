
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Phone, Mail, Car } from "lucide-react";

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
    }
  }, [selectedDate, garageId]);

  const loadAvailableTimeSlots = async () => {
    if (!selectedDate) return;

    try {
      const dayOfWeek = selectedDate.getDay();
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      
      // Get available time slots for the day
      const { data: timeSlots, error: timeSlotsError } = await supabase
        .from("garage_time_slots")
        .select("id, start_time, end_time")
        .eq("garage_id", garageId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_available", true)
        .order("start_time");

      if (timeSlotsError) throw timeSlotsError;

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

      if (bookingsError) throw bookingsError;

      // Filter out booked time slots
      const bookedTimes = bookedSlots?.map(booking => booking.booking_time) || [];
      const availableTimeSlots = timeSlots.filter(slot => 
        !bookedTimes.includes(slot.start_time)
      );

      setAvailableSlots(availableTimeSlots);
    } catch (error) {
      console.error("Error loading time slots:", error);
      toast({
        title: "Error",
        description: "Failed to load available time slots",
        variant: "destructive",
      });
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book Service: {serviceName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Date Selection */}
          <div>
            <Label className="text-base font-medium">Select Date</Label>
            <div className="mt-2">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                className="rounded-md border"
              />
            </div>
          </div>

          {/* Time Slot Selection */}
          {selectedDate && (
            <div>
              <Label className="text-base font-medium">Available Time Slots</Label>
              <div className="mt-2">
                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot.id}
                        variant={selectedSlot === slot.id ? "default" : "outline"}
                        onClick={() => setSelectedSlot(slot.id)}
                        className="justify-start"
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        {slot.start_time} - {slot.end_time}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    No available time slots for this date
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Information */}
          {selectedSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    placeholder="Your phone number"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={customerInfo.email}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                  placeholder="Your email address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="make">Vehicle Make</Label>
                  <Input
                    id="make"
                    value={customerInfo.vehicleMake}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, vehicleMake: e.target.value })}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Vehicle Model</Label>
                  <Input
                    id="model"
                    value={customerInfo.vehicleModel}
                    onChange={(e) => setCustomerInfo({ ...customerInfo, vehicleModel: e.target.value })}
                    placeholder="e.g., Camry"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Input
                  id="notes"
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  placeholder="Any special requirements or notes"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={onClose} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleBooking} disabled={loading} className="flex-1">
                  {loading ? "Booking..." : "Confirm Booking"}
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
