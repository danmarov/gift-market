"use client";
import TelegramBackButton from "@/components/common/telegram-back-button";
import TGSPlayer from "@/components/ui/tgs-wrapper";
import { cn } from "@/lib/utils";
import "./globals.css";

// Error boundaries must be Client Components

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    // global-error must include html and body tags
    <html>
      <body>
        <TelegramBackButton />
        <div className="h-screen flex flex-col overflow-hidden">
          <main
            className={cn(
              `flex-1 mx-auto overflow-auto gradient px-4 w-full relative`
            )}
          ></main>

          <TelegramBackButton />
          <div className="absolute max-w-sm w-full top-1/2 -translate-y-1/2  px-4 left-1/2 -translate-x-1/2">
            <p className="font-semibold text-lg text-center mt-2 mb-3">
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
              className="w-full primary-btn mt-3 text-[#6E296D] text-nowrap"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
