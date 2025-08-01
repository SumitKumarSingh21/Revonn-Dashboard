
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Calendar } from "lucide-react";

interface TimeSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const PredefinedTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", 
    "Thursday", "Friday", "Saturday"
  ];

  useEffect(() => {
    loadPredefinedTimeSlots();
  }, []);

  const loadPredefinedTimeSlots = async () => {
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
        .from("predefined_time_slots")
        .select("*")
        .eq("garage_id", garage.id)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (error) {
      console.error("Error loading predefined time slots:", error);
      toast({
        title: "Error",
        description: "Failed to load time slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleSlotAvailability = async (slotId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from("predefined_time_slots")
        .update({ is_available: isAvailable })
        .eq("id", slotId);

      if (error) throw error;

      setTimeSlots(prev =>
        prev.map(slot =>
          slot.id === slotId ? { ...slot, is_available: isAvailable } : slot
        )
      );

      toast({
        title: "Success",
        description: "Time slot updated successfully",
      });
    } catch (error) {
      console.error("Error updating time slot:", error);
      toast({
        title: "Error",
        description: "Failed to update time slot",
        variant: "destructive",
      });
    }
  };

  const toggleAllSlotsForDay = async (dayOfWeek: number, isAvailable: boolean) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (!garage) return;

      const { error } = await supabase
        .from("predefined_time_slots")
        .update({ is_available: isAvailable })
        .eq("garage_id", garage.id)
        .eq("day_of_week", dayOfWeek);

      if (error) throw error;

      setTimeSlots(prev =>
        prev.map(slot =>
          slot.day_of_week === dayOfWeek ? { ...slot, is_available: isAvailable } : slot
        )
      );

      toast({
        title: "Success",
        description: `All slots for ${dayNames[dayOfWeek]} ${isAvailable ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error("Error updating day slots:", error);
      toast({
        title: "Error",
        description: "Failed to update day slots",
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Predefined Time Slots</h2>
        <p className="text-gray-600">Manage your available booking time slots (9 AM - 9 PM)</p>
      </div>

      <div className="grid gap-4">
        {dayNames.map((dayName, dayIndex) => {
          const daySlots = timeSlots.filter(slot => slot.day_of_week === dayIndex);
          const availableCount = daySlots.filter(slot => slot.is_available).length;
          
          return (
            <Card key={dayIndex}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {dayName}
                    <span className="text-sm font-normal text-gray-500">
                      ({availableCount}/{daySlots.length} available)
                    </span>
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllSlotsForDay(dayIndex, true)}
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAllSlotsForDay(dayIndex, false)}
                    >
                      Disable All
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        slot.is_available 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-gray-500" />
                        <span className="text-xs font-medium">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <Switch
                        checked={slot.is_available}
                        onCheckedChange={(checked) => toggleSlotAvailability(slot.id, checked)}
                      />
                    </div>
                  ))}
                </div>
                
                {daySlots.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No time slots configured for this day</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default PredefinedTimeSlots;
