// src/lib/telegram/get-init-data.ts
export function getTelegramInitData(): string | null {
  if (typeof window === "undefined") return null;

  // 1) Нативный источник от Telegram
  const tg = (window as any)?.Telegram?.WebApp;
  if (tg?.initData && typeof tg.initData === "string" && tg.initData.length) {
    return tg.initData as string;
  }

  // 2) Фолбэки через URL (встречается у некоторых контейнеров)
  const tryDecode = (v: string | null) => {
    if (!v) return null;
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  };

  const fromSearch = new URLSearchParams(window.location.search);
  const fromHash = new URLSearchParams(
    window.location.hash.startsWith("#")
      ? window.location.hash.slice(1)
      : window.location.hash
  );

  const candidate =
    fromSearch.get("tgWebAppData") ||
    fromHash.get("tgWebAppData") ||
    fromSearch.get("initData") ||
    fromHash.get("initData");

  return tryDecode(candidate);
}
