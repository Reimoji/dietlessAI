'use client';

import { useEffect, useState } from 'react';
import { Lang, t } from "@/lib/i18n";

const SUPPORTED_LANGS = ["en", "et"] as const;

export function Terminal({ lang }: { lang: string }) {
  const typedLang = (SUPPORTED_LANGS.includes(lang as Lang) ? lang : "en") as Lang;

  const [chatStep, setChatStep] = useState(0);

  const chatSteps = [
    { sender: "user", text: t(typedLang, "terminal.step1") },
    { sender: "dietlessAI", text: t(typedLang, "terminal.step2") },
    { sender: "user", text: t(typedLang, "terminal.step3") },
    { sender: "dietlessAI", text: t(typedLang, "terminal.step4") },
    { sender: "dietlessAI", text: t(typedLang, "terminal.step5") },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setChatStep((prev) => (prev < chatSteps.length - 1 ? prev + 1 : prev));
    }, 1000);
    return () => clearTimeout(timer);
  }, [chatStep]);

  return (
    <div className="w-full rounded-lg shadow-lg overflow-hidden bg-card text-card-foreground font-sans text-sm relative border border-border">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {t(typedLang, "terminal.title")}
          </h2>
        </div>
        <div className="space-y-3">
          {chatSteps.map((step, index) => (
            <div
              key={index}
              className={`${index > chatStep ? "opacity-0" : "opacity-100"} transition-opacity duration-500`}
            >
              <div
                className={`p-2 rounded-md max-w-xs ${
                  step.sender === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"
                }`}
              >
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
