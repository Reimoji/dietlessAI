'use client';

import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';

export function Terminal() {
  const [chatStep, setChatStep] = useState(0);
  const [copied, setCopied] = useState(false);
  const chatSteps = [
    { sender: 'user', text: 'Can you help me get started with DietlessAI?' },
    { sender: 'dietlessAI', text: 'Absolutely! Let’s build a plan that fits your lifestyle and goals. First, tell me your weight, height, and your goal.' },
    { sender: 'user', text: 'I weigh 84 kg, I’m 172 cm tall, and I want to lose fat.' },
    { sender: 'dietlessAI', text: 'Got it. We’ll focus on fat loss while keeping your muscle sharp 💪' },
    { sender: 'dietlessAI', text: 'Next, I’ll generate your macros, meal plan, and weekly tweaks to keep you on track 🔁' },
  ];
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setChatStep((prev) =>
        prev < chatSteps.length - 1 ? prev + 1 : prev
      );
    }, 1000);
    return () => clearTimeout(timer);
  }, [chatStep]);

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden bg-card text-card-foreground font-sans text-sm relative border border-border">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Chat Example</h2>
        </div>
        <div className="space-y-3">
          {chatSteps.map((step, index) => (
            <div
              key={index}
              className={`${index > chatStep ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`}
            >
              <div className={`p-2 rounded-md max-w-xs ${step.sender === 'user' ? 'bg-blue-100 ml-auto' : 'bg-gray-100'}`}>
                <strong className="block text-xs text-gray-500">{step.sender}</strong>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
