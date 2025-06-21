
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

const RevvyTab = () => {
  useEffect(() => {
    // Create and append the script tag
    const script = document.createElement('script');
    script.setAttribute('chatbot_id', '6840949343945726cef6df9b');
    script.setAttribute('data-type', 'bar');
    script.src = 'https://app.thinkstack.ai/bot/thinkstackai-loader.min.js';
    script.async = true;

    document.body.appendChild(script);

    // Cleanup function to remove the script when component unmounts
    return () => {
      const existingScript = document.querySelector('script[src="https://app.thinkstack.ai/bot/thinkstackai-loader.min.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            Revvy - AI Assistant
          </CardTitle>
          <CardDescription>
            Chat with Revvy, your intelligent AI assistant for all your garage management needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Revvy is Ready to Help!</h3>
            <p className="text-gray-600 mb-4">
              Ask questions about bookings, services, earnings, or get help with managing your garage.
            </p>
            <p className="text-sm text-gray-500">
              The chatbot will appear at the bottom of your screen.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevvyTab;
