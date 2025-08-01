
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PredefinedTimeSlots from "./PredefinedTimeSlots";
import CustomTimeSlots from "./CustomTimeSlots";
import { useLanguage } from "@/contexts/LanguageContext";

const TimeSlotManagement = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('timeslots')}</h2>
        <p className="text-gray-600">Manage your available booking time slots</p>
      </div>

      <Tabs defaultValue="predefined" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="predefined">{t('predefinedSlots')}</TabsTrigger>
          <TabsTrigger value="custom">{t('customSlots')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="predefined" className="space-y-4">
          <PredefinedTimeSlots />
        </TabsContent>
        
        <TabsContent value="custom" className="space-y-4">
          <CustomTimeSlots />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeSlotManagement;
