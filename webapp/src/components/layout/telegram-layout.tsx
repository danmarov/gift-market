"use client";
import { PropsWithChildren, useEffect } from "react";
import { init, viewport } from "@telegram-apps/sdk-react";
import AuthGuard from "../features/auth/auth-guard";
import { useDevice } from "../providers/device-provider";

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        disableVerticalSwipes(): void;
        enableVerticalSwipes(): void;
        expand(): void;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export default function TelegramLayout({ children }: PropsWithChildren) {
  const isMobile = useDevice();

  useEffect(() => {
    const setupTelegram = async () => {
      try {
        init({});
        await viewport.mount();
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.disableVerticalSwipes();
        }

        if (viewport.exitFullscreen.isAvailable()) {
          if (isMobile) {
            viewport.requestFullscreen();
          } else {
            viewport.exitFullscreen();
          }
        }
      } catch (error) {
        console.warn("Telegram setup error:", error);
      }
    };

    setupTelegram();
  }, []);

  return <AuthGuard>{children}</AuthGuard>;
}
