"use client";
import { PropsWithChildren, useEffect } from "react";
import { init, viewport } from "@telegram-apps/sdk-react";
import AuthGuard from "../features/auth/auth-guard";

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
  useEffect(() => {
    try {
      init({});
      viewport.mount().then(() => {
        if (window.Telegram?.WebApp) {
          window.Telegram.WebApp.disableVerticalSwipes();
        }
        viewport.requestFullscreen();
      });
    } catch (error) {
      console.warn(error);
    }
  }, []);

  return <AuthGuard>{children}</AuthGuard>;
}
