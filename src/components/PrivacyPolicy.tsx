
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyProps {
  children: React.ReactNode;
}

const PrivacyPolicy = ({ children }: PrivacyPolicyProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-900">
            Privacy Policy — Revonn Garage Dashboard
          </DialogTitle>
          <DialogDescription>
            We respect your privacy and are committed to protecting your personal information
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <p className="text-gray-700">
              At Revonn, we respect your privacy and are committed to protecting the personal information of all garages and their team members who use the Garage Dashboard. This Privacy Policy explains how we collect, use, and protect your data.
            </p>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">1. Information We Collect</h3>
              <p className="text-gray-700 mb-2">We may collect the following information when you use the Garage Dashboard:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Garage name, address, contact details</li>
                <li>Mechanic/staff details</li>
                <li>Booking details and customer preferences</li>
                <li>Performance and usage logs</li>
                <li>Device and browser information for technical support</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">2. How We Use Your Data</h3>
              <p className="text-gray-700 mb-2">We use your data to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Display and manage bookings</li>
                <li>Assign staff or mechanics to services</li>
                <li>Send booking updates or confirmations</li>
                <li>Improve dashboard performance</li>
                <li>Provide customer support</li>
              </ul>
              <p className="text-gray-700 mt-3">
                We do not sell or share your data with third parties, except as required by law.
              </p>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">3. Data Security</h3>
              <p className="text-gray-700 mb-2">We implement appropriate technical and organizational measures to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Protect data from unauthorized access</li>
                <li>Prevent misuse or loss</li>
                <li>Secure server and storage access (e.g., through Supabase)</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">4. Your Choices</h3>
              <p className="text-gray-700 mb-2">You may:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Update your dashboard account info at any time</li>
                <li>Request data deletion by contacting us</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">5. Updates</h3>
              <p className="text-gray-700">
                This policy may be updated to reflect changes in technology or regulation. We will notify you via dashboard or email.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-red-800 mb-3">6. Contact Us</h3>
              <p className="text-gray-700 mb-2">For questions about this policy, please contact us at:</p>
              <div className="space-y-1 text-gray-700 ml-4">
                <p>📧 support@revonn.in</p>
                <p>📍 Ranchi, Jharkhand, India</p>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicy;
