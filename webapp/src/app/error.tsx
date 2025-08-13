"use client";

import TelegramBackButton from "@/components/common/telegram-back-button";
// import MainLayout from "@/components/layout/main-layout";
import TGSPlayer from "@/components/ui/tgs-wrapper";
import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isTelegramError =
    error.message.includes("Telegram Mini App Error") ||
    error.message.includes("LaunchParamsRetrieveError") ||
    error.message.includes("tgWebAppPlatform");

  if (isTelegramError) {
    return (
      <>
        <div className="h-screen flex flex-col overflow-hidden">
          <main
            className={cn(
              `flex-1 max-w-lg mx-auto overflow-auto gradient px-4 w-full relative`
            )}
          ></main>

          <TelegramBackButton />
          <div className="absolute w-full top-1/2 -translate-y-1/2 left-0 px-4">
            <h1 className="uppercase font-sans text-5xl font-bold text-center">
              503
            </h1>
            <p className="font-semibold text-lg text-center mt-2">
              Приложение должно быть открыто в Telegram
            </p>
            <TGSPlayer
              src="/not-found.tgs"
              autoplay
              loop
              className="mx-auto my-5"
              style={{
                width: 200,
                height: 200,
              }}
            />
            <button
              onClick={() => reset()}
              className="w-full primary-btn text-[#6E296D] text-nowrap"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </>
    );
  }

  // Для других ошибок - твоя же разметка
  return (
    <>
      <div className="h-screen flex flex-col overflow-hidden">
        <main
          className={cn(
            `flex-1 max-w-lg mx-auto overflow-auto gradient px-4 w-full relative`
          )}
        ></main>

        <TelegramBackButton />
        <div className="absolute w-full top-1/2 -translate-y-1/2 left-0 px-4">
          <h1 className="uppercase font-sans text-5xl font-bold text-center">
            500
          </h1>
          <p className="font-semibold text-lg text-center mt-2">
            Что то пошло не так. Повторите попытку позже
          </p>
          <TGSPlayer
            src="/not-found.tgs"
            autoplay
            loop
            className="mx-auto my-5"
            style={{
              width: 200,
              height: 200,
            }}
          />
          <button
            onClick={() => reset()}
            className="w-full primary-btn text-[#6E296D] text-nowrap"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    </>
  );
}
