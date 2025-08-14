// src/components/features/auth/hooks/use-telegram-init-data.ts
import { getTelegramInitData } from "@/lib/telegram/get-init-data";
import { useEffect, useState } from "react";

export function useTelegramInitData() {
  const [ready, setReady] = useState(false);
  const [initData, setInitData] = useState<string | null>(null);

  useEffect(() => {
    // Только на клиенте
    setInitData(getTelegramInitData());
    setReady(true);
  }, []);

  return { initData, ready };
}
