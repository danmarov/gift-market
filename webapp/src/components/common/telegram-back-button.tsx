"use client";

import { useEffect } from "react";
import { backButton } from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";

interface TelegramBackButtonProps {
  /** Путь для редиректа если нет истории (по умолчанию "/") */
  fallbackPath?: string;
  /** Кастомный обработчик клика (переопределяет стандартную логику) */
  onBackClick?: () => void;
  /** Показывать ли кнопку (по умолчанию true) */
  enabled?: boolean;
}

export default function TelegramBackButton({
  fallbackPath = "/",
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
  }, [router, fallbackPath, onBackClick, enabled]);

  // Компонент ничего не рендерит, только управляет кнопкой
  return null;
}

// Хук для удобного использования
export function useTelegramBackButton({
  fallbackPath = "/",
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
  }, [router, fallbackPath, onBackClick, enabled]);
}

// // Примеры использования:

// // 1. Компонент с настройками по умолчанию
// export function ExamplePage1() {
//   return (
//     <div>
//       <TelegramBackButton />
//       <h1>Страница с back button</h1>
//     </div>
//   );
// }

// // 4. Использование хука
// export function ExamplePage4() {
//   useTelegramBackButton({
//     fallbackPath: "/admin",
//     enabled: true,
//   });

//   return <h1>Страница использующая хук</h1>;
// }

// // 5. Условное отображение кнопки
// export function ExamplePage5() {
//   const [showBackButton, setShowBackButton] = useState(true);

//   return (
//     <div>
//       <TelegramBackButton enabled={showBackButton} />
//       <button onClick={() => setShowBackButton(!showBackButton)}>
//         Toggle Back Button
//       </button>
//     </div>
//   );
// }
