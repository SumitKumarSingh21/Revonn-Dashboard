
import { useLanguage } from "@/contexts/LanguageContext";

const BookingsTabContent = () => {
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{t('bookings')}</h2>
        <p className="text-gray-600">{t('manageCustomerBookings')}</p>
      </div>
      
      {/* Sample booking cards with translated content */}
      <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                {t('completed')}
              </span>
              <span className="text-sm text-gray-500">#e0449800</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">{t('status')}</span>
              <button className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {t('message')}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">7/18/2025</p>
              <p className="text-sm text-gray-500">11:00:00</p>
              <p className="text-sm text-gray-500">Honda Amaze</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">mailrevonn</p>
              <p className="text-sm text-gray-500">mailrevonn@gmail.com</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('assignedMechanic')}: test</p>
              <p className="text-xs text-gray-500">{t('assignedOn')} 7/3/2025, 11:24:14 AM</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {t('confirmed')}
              </span>
              <span className="text-sm text-gray-500">#f13cbfc</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium">{t('status')}</span>
              <button className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded">
                {t('message')}
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">7/7/2025</p>
              <p className="text-sm text-gray-500">11:00:00</p>
              <p className="text-sm text-gray-500">Supra MK4</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Sumit</p>
              <p className="text-sm text-gray-500">1234567890</p>
              <p className="text-sm text-gray-500">sumit@gmail.com</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t('mechanicAssignment')}</p>
              <p className="text-sm text-blue-600">test 2 (MECHKY5LWR9X)</p>
              <p className="text-xs text-gray-500">{t('assignedOn')} 7/6/2025, 1:58:59 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingsTabContent;
