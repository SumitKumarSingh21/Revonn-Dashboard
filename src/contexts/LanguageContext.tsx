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
    
    // Service Categories
    "AC & Cooling": "AC & Cooling",
    "Body Work": "Body Work",
    "Brakes": "Brakes",
    "Custom": "Custom",
    "Diagnostic": "Diagnostic",
    "Electrical": "Electrical",
    "Fuel System": "Fuel System",
    "General": "General",
    "Suspension": "Suspension",
    "Transmission": "Transmission",
    "Tyre": "Tyre",
    "Wash": "Wash",
    
    // Vehicle Types
    "car": "Car",
    "bike": "Bike",
    "both": "Both",
    
    // Service Names - Car Services
    "Engine Oil Change": "Engine Oil Change",
    "Oil Filter Change": "Oil Filter Change",
    "Air Filter Cleaning": "Air Filter Cleaning",
    "Fuel Filter Change": "Fuel Filter Change",
    "Spark Plug Change": "Spark Plug Change",
    "Coolant Top-up": "Coolant Top-up",
    "Brake Fluid Check": "Brake Fluid Check",
    "Power Steering Fluid": "Power Steering Fluid",
    "AC Service": "AC Service",
    "AC Gas Refill": "AC Gas Refill",
    "AC Filter Cleaning": "AC Filter Cleaning",
    "Radiator Service": "Radiator Service",
    "Thermostat Check": "Thermostat Check",
    "Battery Check": "Battery Check",
    "Alternator Check": "Alternator Check",
    "Headlight Bulb Change": "Headlight Bulb Change",
    "Tail Light Repair": "Tail Light Repair",
    "Horn Check": "Horn Check",
    "Wiper Motor Service": "Wiper Motor Service",
    "Tyre Puncture Repair": "Tyre Puncture Repair",
    "Wheel Balancing": "Wheel Balancing",
    "Wheel Alignment": "Wheel Alignment",
    "Tyre Rotation": "Tyre Rotation",
    "Tubeless Tyre Repair": "Tubeless Tyre Repair",
    "Brake Pad Change": "Brake Pad Change",
    "Brake Shoe Service": "Brake Shoe Service",
    "Brake Disc Machining": "Brake Disc Machining",
    "Shock Absorber Check": "Shock Absorber Check",
    "Suspension Service": "Suspension Service",
    "Clutch Repair": "Clutch Repair",
    "Gear Box Service": "Gear Box Service",
    "Automatic Transmission Service": "Automatic Transmission Service",
    "Car Wash": "Car Wash",
    "Interior Cleaning": "Interior Cleaning",
    "Wax Polish": "Wax Polish",
    "Underbody Wash": "Underbody Wash",
    "Engine Diagnostic": "Engine Diagnostic",
    "Full Car Checkup": "Full Car Checkup",
    "Pre-delivery Service": "Pre-delivery Service",
    
    // Service Names - Bike Services
    "Chain Cleaning": "Chain Cleaning",
    "Chain Sprocket Change": "Chain Sprocket Change",
    "Coolant Service": "Coolant Service",
    "Front Brake Pad Change": "Front Brake Pad Change",
    "Rear Brake Shoe Service": "Rear Brake Shoe Service",
    "Brake Cable Adjustment": "Brake Cable Adjustment",
    "Brake Fluid Change": "Brake Fluid Change",
    "Tube Change": "Tube Change",
    "Tyre Change": "Tyre Change",
    "Indicator Repair": "Indicator Repair",
    "Horn Service": "Horn Service",
    "Self Start Motor": "Self Start Motor",
    "Front Shock Service": "Front Shock Service",
    "Rear Shock Service": "Rear Shock Service",
    "Steering Bearing Service": "Steering Bearing Service",
    "Carburetor Cleaning": "Carburetor Cleaning",
    "Fuel Tank Cleaning": "Fuel Tank Cleaning",
    "Petcock Service": "Petcock Service",
    "Bike Wash": "Bike Wash",
    "Engine Degreasing": "Engine Degreasing",
    "Chrome Polish": "Chrome Polish",
    "Full Bike Service": "Full Bike Service",
    "Performance Tuning": "Performance Tuning",
    
    // Common Services
    "Denting": "Denting",
    "Painting": "Painting",
    "Insurance Claim Work": "Insurance Claim Work",
    "Accidental Repair": "Accidental Repair",
    "Number Plate Fitting": "Number Plate Fitting",
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
    
    // Service Categories
    "AC & Cooling": "एसी और कूलिंग",
    "Body Work": "बॉडी वर्क",
    "Brakes": "ब्रेक",
    "Custom": "कस्टम",
    "Diagnostic": "डायग्नोस्टिक",
    "Electrical": "इलेक्ट्रिकल",
    "Fuel System": "फ्यूल सिस्टम",
    "General": "सामान्य",
    "Suspension": "सस्पेंशन",
    "Transmission": "ट्रांसमिशन",
    "Tyre": "टायर",
    "Wash": "धुलाई",
    
    // Vehicle Types
    "car": "कार",
    "bike": "बाइक",
    "both": "दोनों",
    
    // Service Names - Car Services
    "Engine Oil Change": "इंजन ऑयल चेंज",
    "Oil Filter Change": "ऑयल फिल्टर चेंज",
    "Air Filter Cleaning": "एयर फिल्टर सफाई",
    "Fuel Filter Change": "फ्यूल फिल्टर चेंज",
    "Spark Plug Change": "स्पार्क प्लग चेंज",
    "Coolant Top-up": "कूलेंट टॉप-अप",
    "Brake Fluid Check": "ब्रेक फ्लूइड चेक",
    "Power Steering Fluid": "पावर स्टीयरिंग फ्लूइड",
    "AC Service": "एसी सर्विस",
    "AC Gas Refill": "एसी गैस रिफिल",
    "AC Filter Cleaning": "एसी फिल्टर सफाई",
    "Radiator Service": "रेडिएटर सर्विस",
    "Thermostat Check": "थर्मोस्टेट चेक",
    "Battery Check": "बैटरी चेक",
    "Alternator Check": "अल्टरनेटर चेक",
    "Headlight Bulb Change": "हेडलाइट बल्ब चेंज",
    "Tail Light Repair": "टेल लाइट रिपेयर",
    "Horn Check": "हॉर्न चेक",
    "Wiper Motor Service": "वाइपर मोटर सर्विस",
    "Tyre Puncture Repair": "टायर पंचर रिपेयर",
    "Wheel Balancing": "व्हील बैलेंसिंग",
    "Wheel Alignment": "व्हील अलाइनमेंट",
    "Tyre Rotation": "टायर रोटेशन",
    "Tubeless Tyre Repair": "ट्यूबलेस टायर रिपेयर",
    "Brake Pad Change": "ब्रेक पैड चेंज",
    "Brake Shoe Service": "ब्रेक शू सर्विस",
    "Brake Disc Machining": "ब्रेक डिस्क मशीनिंग",
    "Shock Absorber Check": "शॉक एब्जॉर्बर चेक",
    "Suspension Service": "सस्पेंशन सर्विस",
    "Clutch Repair": "क्लच रिपेयर",
    "Gear Box Service": "गियर बॉक्स सर्विस",
    "Automatic Transmission Service": "ऑटोमेटिक ट्रांसमिशन सर्विस",
    "Car Wash": "कार वाश",
    "Interior Cleaning": "इंटीरियर सफाई",
    "Wax Polish": "वैक्स पॉलिश",
    "Underbody Wash": "अंडरबॉडी वाश",
    "Engine Diagnostic": "इंजन डायग्नोस्टिक",
    "Full Car Checkup": "फुल कार चेकअप",
    "Pre-delivery Service": "प्री-डिलीवरी सर्विस",
    
    // Service Names - Bike Services
    "Chain Cleaning": "चेन सफाई",
    "Chain Sprocket Change": "चेन स्प्रॉकेट चेंज",
    "Coolant Service": "कूलेंट सर्विस",
    "Front Brake Pad Change": "फ्रंट ब्रेक पैड चेंज",
    "Rear Brake Shoe Service": "रियर ब्रेक शू सर्विस",
    "Brake Cable Adjustment": "ब्रेक केबल एडजस्टमेंट",
    "Brake Fluid Change": "ब्रेक फ्लूइड चेंज",
    "Tube Change": "ट्यूब चेंज",
    "Tyre Change": "टायर चेंज",
    "Indicator Repair": "इंडिकेटर रिपेयर",
    "Horn Service": "हॉर्न सर्विस",
    "Self Start Motor": "सेल्फ स्टार्ट मोटर",
    "Front Shock Service": "फ्रंट शॉक सर्विस",
    "Rear Shock Service": "रियर शॉक सर्विस",
    "Steering Bearing Service": "स्टीयरिंग बेयरिंग सर्विस",
    "Carburetor Cleaning": "कार्बुरेटर सफाई",
    "Fuel Tank Cleaning": "फ्यूल टैंक सफाई",
    "Petcock Service": "पेटकॉक सर्विस",
    "Bike Wash": "बाइक वाश",
    "Engine Degreasing": "इंजन डिग्रीसिंग",
    "Chrome Polish": "क्रोम पॉलिश",
    "Full Bike Service": "फुल बाइक सर्विस",
    "Performance Tuning": "परफॉर्मेंस ट्यूनिंग",
    
    // Common Services
    "Denting": "डेंटिंग",
    "Painting": "पेंटिंग",
    "Insurance Claim Work": "इंश्योरेंस क्लेम वर्क",
    "Accidental Repair": "एक्सीडेंटल रिपेयर",
    "Number Plate Fitting": "नंबर प्लेट फिटिंग",
    
    // Additional UI strings
    "All Categories": "सभी श्रेणियां",
    "Select a Service": "एक सेवा चुनें",
    "Choose from our comprehensive list of predefined services": "हमारी पूर्व-निर्धारित सेवाओं की व्यापक सूची से चुनें",
    "Search services...": "सेवाएं खोजें...",
    "All": "सभी",
    "Car": "कार",
    "Bike": "बाइक",
    "min": "मिनट",
    "Add Service from Catalog": "कैटलॉग से सेवा जोड़ें",
    "Close": "बंद करें",
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
