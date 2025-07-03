
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import MechanicForm from "./mechanics/MechanicForm";
import MechanicSearch from "./mechanics/MechanicSearch";
import MechanicsTable from "./mechanics/MechanicsTable";

interface Mechanic {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  mechanic_id: string;
  status: string;
  created_at: string;
  garage_id: string;
}

const MechanicsTab = () => {
  const [mechanics, setMechanics] = useState<Mechanic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadMechanics();
  }, []);

  useEffect(() => {
    console.log("Setting up real-time mechanics subscription...");
    const channel = supabase
      .channel("mechanics-realtime")
      .on(
        "postgres_changes",
        { 
          event: "*", 
          schema: "public", 
          table: "mechanics" 
        },
        (payload) => {
          console.log("Real-time mechanics change:", payload);
          loadMechanics();
        }
      )
      .subscribe();

    return () => {
      console.log("Cleaning up mechanics subscription...");
      supabase.removeChannel(channel);
    };
  }, []);

  const loadMechanics = async () => {
    try {
      console.log("Loading mechanics...");
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log("No authenticated user found");
        return;
      }

      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (!garage) {
        console.log("No garage found for user");
        setMechanics([]);
        return;
      }

      console.log("Found garage:", garage.id);

      const { data, error } = await supabase
        .from("mechanics")
        .select("*")
        .eq("garage_id", garage.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading mechanics:", error);
        throw error;
      }

      console.log("Loaded mechanics:", data);
      setMechanics(data || []);
    } catch (error) {
      console.error("Error loading mechanics:", error);
      toast({
        title: "Error",
        description: "Failed to load mechanics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMechanics = mechanics.filter(mechanic =>
    mechanic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mechanic.mechanic_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (mechanic.phone && mechanic.phone.includes(searchTerm)) ||
    (mechanic.email && mechanic.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Mechanics</h2>
            <p className="text-gray-600">Manage your garage mechanics and their assignments</p>
          </div>
          
          <MechanicForm onMechanicAdded={loadMechanics} />
        </div>

        <MechanicSearch
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalMechanics={mechanics.length}
          filteredCount={filteredMechanics.length}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <MechanicsTable
            mechanics={filteredMechanics}
            onMechanicChange={loadMechanics}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default MechanicsTab;
