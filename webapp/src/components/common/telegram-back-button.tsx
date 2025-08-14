"use client";

import { useEffect } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";

interface TelegramBackButtonProps {
  /** Путь для редиректа если нет истории (по умолчанию "/") */
  fallbackPath?: string;
  /** Принудительный путь - если указан, всегда редиректит туда, игнорируя историю */
  forcePath?: string;
  /** Кастомный обработчик клика (переопределяет стандартную логику) */
  onBackClick?: () => void;
  /** Показывать ли кнопку (по умолчанию true) */
  enabled?: boolean;
}

export default function TelegramBackButton({
  fallbackPath = "/",
  forcePath,
  onBackClick,
  enabled = true,
}: TelegramBackButtonProps) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const handleBackClick = () => {
      if (onBackClick) {
        // Если передан кастомный обработчик
        onBackClick();
        return;
      }

      if (forcePath) {
        // Если указан forcePath - всегда идем туда, игнорируя историю
        router.push(forcePath);
        return;
      }

      // Стандартная логика: проверяем историю
      if (window.history.length > 1) {
        // Если есть история - идем назад
        router.back();
      } else {
        // Если нет истории - идем на fallback путь
        router.push(fallbackPath);
      }
    };

    try {
      // Монтируем и показываем кнопку
      backButton.mount();
      backButton.show();
      backButton.onClick(handleBackClick);
    } catch (error) {
      console.warn("Failed to mount Telegram back button:", error);
    }

    // Cleanup при размонтировании
    return () => {
      try {
        if (backButton.offClick.isAvailable()) {
          backButton.offClick(handleBackClick);
        }
        if (backButton.isMounted()) {
          backButton.hide();
          backButton.unmount();
        }
      } catch (error) {
        console.warn("Failed to cleanup Telegram back button:", error);
      }
    };
  }, [router, fallbackPath, forcePath, onBackClick, enabled]);

  // Компонент ничего не рендерит, только управляет кнопкой
  return null;
}

// Хук для удобного использования
export function useTelegramBackButton({
  fallbackPath = "/",
  forcePath,
  onBackClick,
  enabled = true,
}: TelegramBackButtonProps = {}) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;

    const handleBackClick = () => {
      if (onBackClick) {
        onBackClick();
        return;
      }

      if (forcePath) {
        router.push(forcePath);
        return;
      }

      if (window.history.length > 1) {
        router.back();
      } else {
        router.push(fallbackPath);
      }
    };

    try {
      backButton.mount();
      backButton.show();
      backButton.onClick(handleBackClick);
    } catch (error) {
      console.warn("Failed to mount Telegram back button:", error);
    }

    return () => {
      try {
        if (backButton.offClick.isAvailable()) {
          backButton.offClick(handleBackClick);
        }
        if (backButton.isMounted()) {
          backButton.hide();
          backButton.unmount();
        }
      } catch (error) {
        console.warn("Failed to cleanup Telegram back button:", error);
      }
    };
  }, [router, fallbackPath, forcePath, onBackClick, enabled]);
}
