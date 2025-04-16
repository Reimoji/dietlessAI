'use client';

import { Card } from '@/components/ui/card';

export default function ChatPage() {
  return (
    <div className="h-full p-4">
      <Card className="h-full flex flex-col">
        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Messages will go here */}
        </div>
        
        {/* Input area */}
        <div className="border-t p-4 bg-card">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              className="flex-1 rounded-lg border px-4 py-2 focus:outline-none focus:ring-2"
            />
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
              Send
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
