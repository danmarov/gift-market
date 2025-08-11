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

        // Добавляем обработчик для блокировки pinch-to-zoom
        const preventPinchZoom = (event: TouchEvent) => {
          // @ts-ignore
          if (event.scale !== undefined && event.scale !== 1) {
            event.preventDefault();
          }
        };

        document.addEventListener("touchmove", preventPinchZoom, {
          passive: false,
        });

        return () => {
          document.removeEventListener("touchmove", preventPinchZoom);
        };
      } catch (error) {
        console.warn("⚠️ Error setting up Telegram SDK:", error);
      }
    };

    initTelegram();
  }, []);

  return <>{children}</>;
}
