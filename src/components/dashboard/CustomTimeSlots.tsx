import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Trash2 } from "lucide-react";

interface TimeSlot {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const CustomTimeSlots = () => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSlot, setNewSlot] = useState({
    day_of_week: 0,
    start_time: "09:00",
    end_time: "10:00",
  });
  const { toast } = useToast();

  const dayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", 
    "Thursday", "Friday", "Saturday"
  ];

  useEffect(() => {
    loadTimeSlots();
  }, []);

  const loadTimeSlots = async () => {
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
        .from("garage_time_slots")
        .select("*")
        .eq("garage_id", garage.id)
        .order("day_of_week")
        .order("start_time");

      if (error) throw error;
      setTimeSlots(data || []);
    } catch (error) {
      console.error("Error loading time slots:", error);
      toast({
        title: "Error",
        description: "Failed to load time slots",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTimeSlot = async () => {
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
        .from("garage_time_slots")
        .insert({
          garage_id: garage.id,
          day_of_week: newSlot.day_of_week,
          start_time: newSlot.start_time,
          end_time: newSlot.end_time,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Time slot added successfully",
      });

      loadTimeSlots();
    } catch (error) {
      console.error("Error adding time slot:", error);
      toast({
        title: "Error",
        description: "Failed to add time slot",
        variant: "destructive",
      });
    }
  };

  const toggleSlotAvailability = async (slotId: string, isAvailable: boolean) => {
    try {
      const { error } = await supabase
        .from("garage_time_slots")
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

  const deleteTimeSlot = async (slotId: string) => {
    try {
      const { error } = await supabase
        .from("garage_time_slots")
        .delete()
        .eq("id", slotId);

      if (error) throw error;

      setTimeSlots(prev => prev.filter(slot => slot.id !== slotId));

      toast({
        title: "Success",
        description: "Time slot deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting time slot:", error);
      toast({
        title: "Error",
        description: "Failed to delete time slot",
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
      {/* Add New Time Slot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Custom Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <Label htmlFor="day">Day of Week</Label>
              <select
                id="day"
                value={newSlot.day_of_week}
                onChange={(e) => setNewSlot({...newSlot, day_of_week: parseInt(e.target.value)})}
                className="w-full p-2 border rounded-md"
              >
                {dayNames.map((day, index) => (
                  <option key={index} value={index}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="start">Start Time</Label>
              <Input
                id="start"
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({...newSlot, start_time: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="end">End Time</Label>
              <Input
                id="end"
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot({...newSlot, end_time: e.target.value})}
              />
            </div>
            <Button onClick={addTimeSlot}>
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Existing Custom Time Slots */}
      <div className="grid gap-4">
        {dayNames.map((dayName, dayIndex) => {
          const daySlots = timeSlots.filter(slot => slot.day_of_week === dayIndex);
          
          if (daySlots.length === 0) return null;

          return (
            <Card key={dayIndex}>
              <CardHeader>
                <CardTitle className="text-lg">{dayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {daySlots.map((slot) => (
                    <div key={slot.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {slot.start_time} - {slot.end_time}
                        </span>
                        <Badge variant={slot.is_available ? "default" : "secondary"}>
                          {slot.is_available ? "Available" : "Unavailable"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={slot.is_available}
                          onCheckedChange={(checked) => toggleSlotAvailability(slot.id, checked)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteTimeSlot(slot.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {timeSlots.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No custom time slots configured</h3>
            <p className="text-gray-500">Add your first custom time slot to supplement the predefined ones</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CustomTimeSlots;
