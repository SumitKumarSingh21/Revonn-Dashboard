
import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    settings: "Settings",
    manageAccount: "Manage your account and preferences",
    backToDashboard: "Back to Dashboard",
    profileInformation: "Profile Information",
    updatePersonal: "Update your personal information and profile details",
    fullName: "Full Name",
    enterFullName: "Enter your full name",
    username: "Username",
    enterUsername: "Enter your username",
    bio: "Bio",
    tellAboutYourself: "Tell us about yourself",
    phoneNumber: "Phone Number",
    enterPhoneNumber: "Enter your phone number",
    location: "Location",
    enterLocation: "Enter your location",
    saveProfile: "Save Profile",
    saving: "Saving...",
    languagePreferences: "Language Preferences",
    selectLanguage: "Select your preferred language",
    english: "English",
    hindi: "हिंदी",
    notificationPreferences: "Notification Preferences",
    manageNotifications: "Manage how you receive notifications",
    emailNotifications: "Email Notifications",
    receiveViaEmail: "Receive notifications via email",
    bookingNotifications: "Booking Notifications",
    newBookings: "Get notified about new bookings",
    paymentNotifications: "Payment Notifications",
    getPaymentNotified: "Get notified about payments",
    reviewNotifications: "Review Notifications",
    newReviews: "Get notified about new reviews",
    accountActions: "Account Actions",
    manageSecurity: "Manage your account security and sessions",
    signOut: "Sign Out",
    dangerZone: "Danger Zone",
    deleteWarning: "Once you delete your profile, there is no going back. Please be certain.",
    deleteProfile: "Delete Profile",
    confirmDelete: "Are you absolutely sure?",
    deleteDescription: "This action cannot be undone. This will permanently delete your account and remove all your data from our servers including your profile, bookings, and any other associated information.",
    cancel: "Cancel",
    yesDelete: "Yes, delete my profile",
    deleting: "Deleting...",
    success: "Success",
    profileUpdated: "Profile updated successfully",
    error: "Error",
    failedUpdate: "Failed to update profile",
    accountDeleted: "Account Deleted",
    profileDeleted: "Your profile has been permanently deleted",
    failedDelete: "Failed to delete profile. Please try again.",
    failedSignOut: "Failed to sign out",
    dashboard: "Dashboard",
    bookings: "Bookings",
    services: "Services",
    timeSlots: "Time Slots",
    mechanics: "Mechanics",
    earnings: "Earnings",
    reviews: "Reviews",
    garageProfile: "Garage Profile",
    notifications: "Notifications",
    revvy: "Revvy"
  },
  hi: {
    settings: "सेटिंग्स",
    manageAccount: "अपने खाते और प्राथमिकताओं को प्रबंधित करें",
    backToDashboard: "डैशबोर्ड पर वापस जाएं",
    profileInformation: "प्रोफ़ाइल जानकारी",
    updatePersonal: "अपनी व्यक्तिगत जानकारी और प्रोफ़ाइल विवरण अपडेट करें",
    fullName: "पूरा नाम",
    enterFullName: "अपना पूरा नाम दर्ज करें",
    username: "उपयोगकर्ता नाम",
    enterUsername: "अपना उपयोगकर्ता नाम दर्ज करें",
    bio: "बायो",
    tellAboutYourself: "हमें अपने बारे में बताएं",
    phoneNumber: "फ़ोन नंबर",
    enterPhoneNumber: "अपना फ़ोन नंबर दर्ज करें",
    location: "स्थान",
    enterLocation: "अपना स्थान दर्ज करें",
    saveProfile: "प्रोफ़ाइल सेव करें",
    saving: "सेव हो रहा है...",
    languagePreferences: "भाषा प्राथमिकताएं",
    selectLanguage: "अपनी पसंदीदा भाषा चुनें",
    english: "English",
    hindi: "हिंदी",
    notificationPreferences: "अधिसूचना प्राथमिकताएं",
    manageNotifications: "अधिसूचनाएं कैसे प्राप्त करें इसे प्रबंधित करें",
    emailNotifications: "ईमेल अधिसूचनाएं",
    receiveViaEmail: "ईमेल के माध्यम से अधिसूचनाएं प्राप्त करें",
    bookingNotifications: "बुकिंग अधिसूचनाएं",
    newBookings: "नई बुकिंग के बारे में सूचित रहें",
    paymentNotifications: "भुगतान अधिसूचनाएं",
    getPaymentNotified: "भुगतान के बारे में सूचित रहें",
    reviewNotifications: "समीक्षा अधिसूचनाएं",
    newReviews: "नई समीक्षाओं के बारे में सूचित रहें",
    accountActions: "खाता कार्रवाई",
    manageSecurity: "अपने खाते की सुरक्षा और सत्रों को प्रबंधित करें",
    signOut: "साइन आउट",
    dangerZone: "खतरे का क्षेत्र",
    deleteWarning: "एक बार जब आप अपनी प्रोफ़ाइल हटा देते हैं, तो वापसी नहीं है। कृपया निश्चित रहें।",
    deleteProfile: "प्रोफ़ाइल हटाएं",
    confirmDelete: "क्या आप बिल्कुल निश्चित हैं?",
    deleteDescription: "यह कार्रवाई पूर्ववत नहीं की जा सकती। यह स्थायी रूप से आपके खाते को हटा देगा और हमारे सर्वर से आपका सभी डेटा हटा देगा जिसमें आपकी प्रोफ़ाइल, बुकिंग और कोई अन्य संबंधित जानकारी शामिल है।",
    cancel: "रद्द करें",
    yesDelete: "हां, मेरी प्रोफ़ाइल हटाएं",
    deleting: "हटाया जा रहा है...",
    success: "सफलता",
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई",
    error: "त्रुटि",
    failedUpdate: "प्रोफ़ाइल अपडेट करने में विफल",
    accountDeleted: "खाता हटा दिया गया",
    profileDeleted: "आपकी प्रोफ़ाइल स्थायी रूप से हटा दी गई है",
    failedDelete: "प्रोफ़ाइल हटाने में विफल। कृपया पुनः प्रयास करें।",
    failedSignOut: "साइन आउट करने में विफल",
    dashboard: "डैशबोर्ड",
    bookings: "बुकिंग",
    services: "सेवाएं",
    timeSlots: "समय स्लॉट",
    mechanics: "मैकेनिक",
    earnings: "कमाई",
    reviews: "समीक्षाएं",
    garageProfile: "गैराज प्रोफ़ाइल",
    notifications: "अधिसूचनाएं",
    revvy: "रेवी"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[Language]] || key;
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
