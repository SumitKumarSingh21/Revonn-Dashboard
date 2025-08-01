
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, User, Phone, Mail, Car, Loader2, Package } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface TimeSlot {
  id: string;
  start_time: string;
  end_time: string;
  source: 'predefined' | 'custom';
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  garageId: string;
  serviceName?: string;
}

const BookingModal = ({ isOpen, onClose, garageId, serviceName }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
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
  const { t } = useLanguage();

  useEffect(() => {
    if (isOpen) {
      loadServices();
    }
  }, [isOpen, garageId]);

  useEffect(() => {
    if (selectedDate && garageId) {
      loadAvailableTimeSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot("");
    }
  }, [selectedDate, garageId]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("garage_id", garageId);

      if (error) throw error;
      
      setServices(data || []);
      
      // If serviceName is provided, pre-select it
      if (serviceName && data) {
        const service = data.find(s => s.name === serviceName);
        if (service) {
          setSelectedServices([service.id]);
        }
      }
    } catch (error) {
      console.error("Error loading services:", error);
      toast({
        title: t('error'),
        description: "Failed to load services",
        variant: "destructive",
      });
    }
  };

  const loadAvailableTimeSlots = async () => {
    if (!selectedDate) return;

    setLoadingSlots(true);
    try {
      const dayOfWeek = selectedDate.getDay();
      const selectedDateStr = selectedDate.toISOString().split('T')[0];
      
      console.log('Loading time slots for:', { dayOfWeek, selectedDateStr, garageId });
      
      // Get predefined time slots
      const { data: predefinedSlots, error: predefinedError } = await supabase
        .from("predefined_time_slots")
        .select("id, start_time, end_time")
        .eq("garage_id", garageId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_available", true)
        .order("start_time");

      if (predefinedError) {
        console.error("Error loading predefined slots:", predefinedError);
      }

      // Get custom time slots
      const { data: customSlots, error: customError } = await supabase
        .from("garage_time_slots")
        .select("id, start_time, end_time")
        .eq("garage_id", garageId)
        .eq("day_of_week", dayOfWeek)
        .eq("is_available", true)
        .order("start_time");

      if (customError) {
        console.error("Error loading custom slots:", customError);
      }

      // Combine all slots
      const allSlots = [
        ...(predefinedSlots || []).map(slot => ({ ...slot, source: 'predefined' as const })),
        ...(customSlots || []).map(slot => ({ ...slot, source: 'custom' as const }))
      ];

      // Get already booked slots
      const { data: bookedSlots, error: bookingsError } = await supabase
        .from("bookings")
        .select("booking_time")
        .eq("garage_id", garageId)
        .eq("booking_date", selectedDateStr)
        .in("status", ["pending", "confirmed", "in_progress"]);

      if (bookingsError) {
        console.error("Error loading booked slots:", bookingsError);
      }

      // Filter out booked time slots
      const bookedTimes = bookedSlots?.map(booking => booking.booking_time) || [];
      const availableTimeSlots = allSlots.filter(slot => 
        !bookedTimes.includes(slot.start_time)
      );

      console.log('Available time slots:', availableTimeSlots);
      setAvailableSlots(availableTimeSlots);
    } catch (error) {
      console.error("Error loading time slots:", error);
      toast({
        title: t('error'),
        description: "Failed to load available time slots",
        variant: "destructive",
      });
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleServiceToggle = (serviceId: string, checked: boolean) => {
    setSelectedServices(prev => 
      checked 
        ? [...prev, serviceId]
        : prev.filter(id => id !== serviceId)
    );
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, serviceId) => {
      const service = services.find(s => s.id === serviceId);
      return total + (service?.price || 0);
    }, 0);
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !customerInfo.name || !customerInfo.phone || selectedServices.length === 0) {
      toast({
        title: t('error'),
        description: "Please fill in all required fields and select at least one service",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const selectedSlotData = availableSlots.find(slot => slot.id === selectedSlot);
      const totalAmount = calculateTotal();
      
      // Create the booking
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .insert({
          user_id: "00000000-0000-0000-0000-000000000000", // Anonymous booking
          garage_id: garageId,
          service_id: selectedServices[0], // Primary service for compatibility
          booking_date: selectedDate.toISOString().split('T')[0],
          booking_time: selectedSlotData?.start_time,
          customer_name: customerInfo.name,
          customer_phone: customerInfo.phone,
          customer_email: customerInfo.email,
          vehicle_make: customerInfo.vehicleMake,
          vehicle_model: customerInfo.vehicleModel,
          notes: customerInfo.notes,
          total_amount: totalAmount,
          status: "pending",
        })
        .select()
        .single();

      if (bookingError) throw bookingError;

      // Add all selected services to booking_services table
      const bookingServices = selectedServices.map(serviceId => ({
        booking_id: booking.id,
        service_id: serviceId
      }));

      const { error: servicesError } = await supabase
        .from("booking_services")
        .insert(bookingServices);

      if (servicesError) throw servicesError;

      toast({
        title: t('success'),
        description: t('bookingCreated'),
      });

      onClose();
      // Reset form
      setSelectedDate(undefined);
      setSelectedSlot("");
      setSelectedServices([]);
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
        title: t('error'),
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
          <DialogTitle className="text-xl font-semibold">{t('bookingDetails')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">{t('selectServices')}</Label>
            <div className="grid gap-3">
              {services.map((service) => (
                <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={service.id}
                    checked={selectedServices.includes(service.id)}
                    onCheckedChange={(checked) => handleServiceToggle(service.id, !!checked)}
                  />
                  <div className="flex-1 flex justify-between items-center">
                    <div>
                      <label htmlFor={service.id} className="font-medium cursor-pointer">
                        {service.name}
                      </label>
                      <p className="text-sm text-gray-500">{service.duration} {t('serviceDuration')}</p>
                    </div>
                    <Badge variant="outline">${service.price}</Badge>
                  </div>
                </div>
              ))}
            </div>
            
            {selectedServices.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">{t('selectServices')}</span>
                </div>
                <div className="text-sm space-y-1">
                  {selectedServices.map(serviceId => {
                    const service = services.find(s => s.id === serviceId);
                    return service ? (
                      <div key={serviceId} className="flex justify-between">
                        <span>{service.name}</span>
                        <span>${service.price}</span>
                      </div>
                    ) : null;
                  })}
                  <div className="border-t pt-1 flex justify-between font-semibold text-blue-900">
                    <span>{t('totalAmount')}:</span>
                    <span>${calculateTotal()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Selection */}
          {selectedServices.length > 0 && (
            <div className="space-y-3">
              <Label className="text-base font-medium">{t('selectDate') || 'Select Date'}</Label>
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
          )}

          {/* Time Slot Selection */}
          {selectedDate && (
            <div className="space-y-3">
              <Label className="text-base font-medium">{t('availableSlots')}</Label>
              <div className="min-h-[100px]">
                {loadingSlots ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span className="text-gray-600">{t('loading')}</span>
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
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {slot.source}
                        </Badge>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{t('unavailable') || 'No Available Slots'}</h3>
                    <p className="text-gray-500">No time slots are available for this date. Please try another date.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Customer Information */}
          {selectedSlot && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{t('customerInfo')}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {t('customerName')} *
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
                    {t('customerPhone')} *
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
                  {t('customerEmail')}
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
                    {t('vehicleMake')}
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
                  <Label htmlFor="model">{t('vehicleModel')}</Label>
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
                <Label htmlFor="notes">{t('additionalNotes')}</Label>
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
                  {t('cancel')}
                </Button>
                <Button onClick={handleBooking} disabled={loading} className="flex-1 h-11">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {t('loading')}...
                    </>
                  ) : (
                    `${t('save')} - $${calculateTotal()}`
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
