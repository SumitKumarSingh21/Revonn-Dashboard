
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsAndConditionsProps {
  children: React.ReactNode;
}

const TermsAndConditions = ({ children }: TermsAndConditionsProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-red-900">
            Terms & Conditions — Revonn Garage Dashboard
          </DialogTitle>
          <DialogDescription>
            Effective Date: January 1, 2025
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-sm">
            <p className="text-gray-700">
              These Terms & Conditions ("Terms") govern your use of the Revonn Garage Dashboard provided by Revonn ("we", "our", "us"). By accessing or using the Dashboard, you agree to be bound by these Terms.
            </p>
            
            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">1. Purpose of the Dashboard</h3>
              <p className="text-gray-700 mb-2">The Revonn Garage Dashboard is a platform to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Manage service bookings from customers</li>
                <li>Assign mechanics/workers for services</li>
                <li>Track and confirm jobs and update booking statuses</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">2. Commission & Charges</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Revonn does not charge any commission or platform fee currently.</li>
                <li>You are not required to share revenue or pay service charges at this stage.</li>
                <li>We reserve the right to introduce pricing or monetization features in the future with prior notice and agreement.</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">3. Payments & Refunds</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>All customer payments are handled in cash directly between the garage and customer.</li>
                <li>Revonn is not responsible for handling, managing, or settling cash payments.</li>
                <li>Any refunds, compensations, or financial disputes must be resolved directly between the garage and the customer.</li>
                <li>Revonn will not be liable for any financial loss or service-related dispute.</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">4. Garage Responsibilities</h3>
              <p className="text-gray-700 mb-2">You agree to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Provide accurate garage and service details</li>
                <li>Maintain professionalism in dealing with customers</li>
                <li>Ensure safety and identity verification for workers if assigned</li>
                <li>Accept bookings responsibly and manage customer satisfaction</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">5. Service & Worker Assignments</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Garages can assign specific workers/mechanics to bookings using the dashboard</li>
                <li>The assigned worker's ID and name may be shared with customers for verification</li>
                <li>Garages are responsible for ensuring the credibility and behavior of their staff</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">6. Platform Usage & Conduct</h3>
              <p className="text-gray-700 mb-2">You agree not to:</p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Misuse or abuse the dashboard</li>
                <li>Input false or misleading information</li>
                <li>Violate laws or third-party rights</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">7. Limitation of Liability</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Revonn provides the Dashboard "as-is", without any warranties.</li>
                <li>We are not liable for any issues related to service delays, payment disputes, worker misconduct, or customer dissatisfaction.</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">8. Updates and Modifications</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Revonn reserves the right to modify these Terms anytime.</li>
                <li>Continued use of the dashboard means you accept those updates.</li>
              </ul>
            </div>

            <div className="border-b border-gray-200 pb-4">
              <h3 className="font-bold text-lg text-red-800 mb-3">9. Termination</h3>
              <p className="text-gray-700">
                Revonn may suspend or terminate access to the dashboard in case of misuse, illegal activity, or breach of terms.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-lg text-red-800 mb-3">10. Contact</h3>
              <p className="text-gray-700 mb-2">For support or questions, please contact:</p>
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

export default TermsAndConditions;
