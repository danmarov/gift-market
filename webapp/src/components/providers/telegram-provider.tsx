"use client";

import { useEffect, useState } from "react";
import { init, viewport } from "@telegram-apps/sdk-react";

let isInitialized = false;

export default function TelegramProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (isInitialized) return;

    console.log("🚀 Initializing Telegram SDK...");

    const initTelegram = async () => {
      try {
        const isTelegramEnv = !!(
          window.Telegram?.WebApp ||
          window.location.search.includes("tgWebAppData") ||
          window.location.hash.includes("tgWebAppData") ||
          navigator.userAgent.includes("Telegram")
        );

        if (!isTelegramEnv) {
          return setError(
            "Telegram Mini App Error: App must be opened within Telegram"
          );
          // throw new Error(
          //   "Telegram Mini App Error: App must be opened within Telegram"
          // );
        }

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
        console.error("❌ Telegram initialization failed:", error);
        setError("Something went wrong..");
      }
    };

    initTelegram();
  }, []);

  // Бросаем ошибку если она есть
  if (error) {
    throw new Error(error);
  }

  return <>{children}</>;
}
