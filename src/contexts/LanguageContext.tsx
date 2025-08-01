
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Comprehensive translations
const translations = {
  en: {
    // Navigation
    dashboard: "Dashboard",
    bookings: "Bookings",
    services: "Services",
    timeslots: "Time Slots",
    mechanics: "Mechanics",
    earnings: "Earnings",
    reviews: "Reviews",
    profile: "Garage Profile",
    notifications: "Notifications",
    revvy: "Revvy",
    settings: "Settings",
    
    // Common
    save: "Save",
    cancel: "Cancel",
    edit: "Edit",
    delete: "Delete",
    add: "Add",
    update: "Update",
    loading: "Loading...",
    search: "Search",
    filter: "Filter",
    sort: "Sort",
    status: "Status",
    message: "Message",
    
    // Bookings
    manageBookings: "Manage customer appointments and mechanic assignments",
    bookingDetails: "Booking Details",
    customerInfo: "Customer Information",
    selectServices: "Select Services",
    availableSlots: "Available Time Slots",
    totalAmount: "Total Amount",
    bookingStatus: "Booking Status",
    pending: "Pending",
    confirmed: "Confirmed",
    completed: "Completed",
    cancelled: "Cancelled",
    
    // Time Slots
    predefinedSlots: "Predefined Slots",
    customSlots: "Custom Slots",
    enableAll: "Enable All",
    disableAll: "Disable All",
    available: "Available",
    unavailable: "Unavailable",
    
    // Services
    serviceName: "Service Name",
    servicePrice: "Price",
    serviceDuration: "Duration",
    serviceCategory: "Category",
    addService: "Add Service",
    editService: "Edit Service",
    
    // Mechanics
    mechanicName: "Mechanic Name",
    mechanicPhone: "Phone",
    mechanicEmail: "Email",
    mechanicId: "Mechanic ID",
    assignMechanic: "Assign Mechanic",
    
    // Customer Form
    customerName: "Customer Name",
    customerPhone: "Phone Number",
    customerEmail: "Email Address",
    vehicleMake: "Vehicle Make",
    vehicleModel: "Vehicle Model",
    additionalNotes: "Additional Notes",
    selectDate: "Select Date",
    
    // Messages
    success: "Success",
    error: "Error",
    bookingCreated: "Booking created successfully",
    bookingUpdated: "Booking updated successfully",
    serviceAdded: "Service added successfully",
    mechanicAssigned: "Mechanic assigned successfully",
  },
  hi: {
    // Navigation
    dashboard: "डैशबोर्ड",
    bookings: "बुकिंग",
    services: "सेवाएं",
    timeslots: "समय स्लॉट",
    mechanics: "मैकेनिक",
    earnings: "आय",
    reviews: "समीक्षा",
    profile: "गैराज प्रोफ़ाइल",
    notifications: "सूचनाएं",
    revvy: "रेव्वी",
    settings: "सेटिंग्स",
    
    // Common
    save: "सेव करें",
    cancel: "रद्द करें",
    edit: "संपादित करें",
    delete: "हटाएं",
    add: "जोड़ें",
    update: "अपडेट करें",
    loading: "लोड हो रहा है...",
    search: "खोजें",
    filter: "फ़िल्टर",
    sort: "क्रमबद्ध करें",
    status: "स्थिति",
    message: "संदेश",
    
    // Bookings
    manageBookings: "ग्राहक अपॉइंटमेंट और मैकेनिक असाइनमेंट प्रबंधित करें",
    bookingDetails: "बुकिंग विवरण",
    customerInfo: "ग्राहक की जानकारी",
    selectServices: "सेवाएं चुनें",
    availableSlots: "उपलब्ध समय स्लॉट",
    totalAmount: "कुल राशि",
    bookingStatus: "बुकिंग स्थिति",
    pending: "लंबित",
    confirmed: "पुष्ट",
    completed: "पूर्ण",
    cancelled: "रद्द",
    
    // Time Slots
    predefinedSlots: "पूर्व निर्धारित स्लॉट",
    customSlots: "कस्टम स्लॉट",
    enableAll: "सभी सक्षम करें",
    disableAll: "सभी अक्षम करें",
    available: "उपलब्ध",
    unavailable: "अनुपलब्ध",
    
    // Services
    serviceName: "सेवा का नाम",
    servicePrice: "मूल्य",
    serviceDuration: "अवधि",
    serviceCategory: "श्रेणी",
    addService: "सेवा जोड़ें",
    editService: "सेवा संपादित करें",
    
    // Mechanics
    mechanicName: "मैकेनिक का नाम",
    mechanicPhone: "फोन",
    mechanicEmail: "ईमेल",
    mechanicId: "मैकेनिक आईडी",
    assignMechanic: "मैकेनिक असाइन करें",
    
    // Customer Form
    customerName: "ग्राहक का नाम",
    customerPhone: "फोन नंबर",
    customerEmail: "ईमेल पता",
    vehicleMake: "वाहन मेक",
    vehicleModel: "वाहन मॉडल",
    additionalNotes: "अतिरिक्त नोट्स",
    selectDate: "तारीख चुनें",
    
    // Messages
    success: "सफलता",
    error: "त्रुटि",
    bookingCreated: "बुकिंग सफलतापूर्वक बनाई गई",
    bookingUpdated: "बुकिंग सफलतापूर्वक अपडेट की गई",
    serviceAdded: "सेवा सफलतापूर्वक जोड़ी गई",
    mechanicAssigned: "मैकेनिक सफलतापूर्वक असाइन किया गया",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('preferred-language') || 'en';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem('preferred-language', lang);
  };

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations] || translations.en;
    return langTranslations[key as keyof typeof langTranslations] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
