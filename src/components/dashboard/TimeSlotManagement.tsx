
import PredefinedTimeSlots from "./PredefinedTimeSlots";
import { useLanguage } from "@/contexts/LanguageContext";

const TimeSlotManagement = () => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t('timeslots')}</h2>
        <p className="text-gray-600">Manage your available booking time slots (9 AM - 9 PM)</p>
      </div>

      <PredefinedTimeSlots />
    </div>
  );
};

export default TimeSlotManagement;
