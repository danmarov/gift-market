// components/providers/telegram-provider.tsx
"use client";

import { useEffect } from "react";
import { init, viewport } from "@telegram-apps/sdk-react";

let isInitialized = false;

export default function TelegramProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (isInitialized) return;

    console.log("🚀 Initializing Telegram SDK...");

    const initTelegram = async () => {
      try {
        init();
        isInitialized = true;

        try {
          await viewport.mount();

          if (viewport.requestFullscreen) {
            viewport.requestFullscreen();
          }
        } catch (viewportError) {
          console.warn("⚠️ Viewport already mounted:", viewportError);
        }

        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.disableVerticalSwipes();
          window.Telegram.WebApp.ready();
        }

        console.log("✅ Telegram SDK initialized successfully");
      } catch (error) {
        console.warn("⚠️ Error setting up Telegram SDK:", error);
      }
    };

    initTelegram();
  }, []);

  // Просто возвращаем children без всяких лоадеров
  return <>{children}</>;
}
