
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

const RevvyTab = () => {
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
          <div className="w-full h-[600px]">
            <iframe
              src="https://app.thinkstack.ai/bot/index.html?chatbot_id=6840949343945726cef6df9b&type=inline"
              frameBorder="0"
              width="100%"
              height="100%"
              style={{ minHeight: '500px' }}
              title="Revvy AI Assistant"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RevvyTab;
