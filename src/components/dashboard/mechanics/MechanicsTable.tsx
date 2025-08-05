
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import MechanicCard from "./MechanicCard";

interface Mechanic {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  mechanic_id: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  garage_id: string;
}

interface MechanicsTableProps {
  mechanics: Mechanic[];
  onMechanicChange: () => void;
}

const MechanicsTable = ({ mechanics, onMechanicChange }: MechanicsTableProps) => {
  const [garage, setGarage] = useState<{ name: string; location?: string } | null>(null);

  useEffect(() => {
    loadGarageInfo();
  }, []);

  const loadGarageInfo = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: garageData, error } = await supabase
        .from("garages")
        .select("name, location")
        .eq("owner_id", user.user.id)
        .single();

      if (error) {
        console.error("Error loading garage info:", error);
        return;
      }

      setGarage(garageData);
    } catch (error) {
      console.error("Error loading garage info:", error);
    }
  };

  if (mechanics.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No mechanics added yet</h3>
          <p className="text-gray-600 max-w-sm mx-auto">
            Start by adding your first mechanic with their photo to generate an official ID card.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!garage) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {mechanics.map((mechanic) => (
        <MechanicCard
          key={mechanic.id}
          mechanic={mechanic}
          garage={garage}
          onMechanicChange={onMechanicChange}
        />
      ))}
    </div>
  );
};

export default MechanicsTable;
