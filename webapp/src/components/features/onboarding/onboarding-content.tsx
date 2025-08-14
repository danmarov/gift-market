"use client";

import { useState, useRef, useEffect } from "react";
import { AUTH_QUERY_KEY } from "../auth/hooks/use-auth";
import GiftAnimation from "./gift-animation";
import { UserOnboardingStatus } from "@/lib/types/user";
import { useQueryClient } from "@tanstack/react-query";
import CongratsMessage from "./congrats-message";
import LoadingScreen from "@/components/common/loading-screen";
import CustomRevealAnimation from "./custom-reveal-animation";

interface OnboardingContentProps {
  onboardingStatus: UserOnboardingStatus;
}

interface GiftData {
  gift: {
    name: string;
    mediaUrl: string;
    revealAnimation?: string | null;
  };
}

// Глобальный кеш чтобы избежать повторных загрузок
const giftCache = new Map<string, GiftData>();
let isLoading = false;

export default function OnboardingContent({
  onboardingStatus,
}: OnboardingContentProps) {
  const queryClient = useQueryClient();
  const [showCongrats, setShowCongrats] = useState(false);
  const [giftData, setGiftData] = useState<GiftData | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Проверяем кеш сначала
    const cacheKey = `gift-${onboardingStatus}`;
    const cachedData = giftCache.get(cacheKey);

    if (cachedData) {
      console.log("🎯 Using cached gift data");
      setGiftData(cachedData);
      setLocalLoading(false);
      hasInitialized.current = true;
      return;
    }

    // Если уже идет загрузка или компонент уже инициализирован - не загружаем повторно
    if (isLoading || hasInitialized.current) {
      return;
    }

    // Загружаем данные только для нужных статусов
    if (onboardingStatus !== "NEW" && onboardingStatus !== "GIFT_REVEALED") {
      setLocalLoading(false);
      return;
    }

    isLoading = true;
    hasInitialized.current = true;

    const loadData = async () => {
      try {
        console.log("🎲 Loading gift data for status:", onboardingStatus);

        let result: GiftData | null = null;

        if (onboardingStatus === "NEW") {
          const { drawGift } = await import("@/lib/actions/gift/draw-gift");
          const drawResult = await drawGift();

          if (drawResult.success) {
            console.log("✅ Gift drawn:", drawResult.data);

            result = {
              gift: {
                name: drawResult.data.gift.name,
                mediaUrl: drawResult.data.gift.mediaUrl,
                revealAnimation:
                  (drawResult.data.gift as any).revealAnimation || null,
              },
            };

            // Ревалидируем auth данные
            await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
          }
        } else if (onboardingStatus === "GIFT_REVEALED") {
          const { getUserOnboardingGift } = await import(
            "@/lib/actions/gift/get-user-onboarding-gift"
          );
          const giftResult = await getUserOnboardingGift();

          if (giftResult.success) {
            result = giftResult.data;
          }
        }

        if (result) {
          // Кешируем результат
          giftCache.set(cacheKey, result);
          setGiftData(result);
          console.log("💾 Cached gift data for", cacheKey);
        }
      } catch (error) {
        console.error("❌ Error loading gift data:", error);
      } finally {
        isLoading = false;
        setLocalLoading(false);
      }
    };

    loadData();
  }, [onboardingStatus, queryClient]);

  const handleAnimationComplete = () => {
    console.log("🎬 Animation completed - showing congrats");
    setShowCongrats(true);
  };

  // Показываем лоадер только при реальной загрузке
  if (localLoading) {
    return null;
    // return <LoadingScreen disableLayout />;
  }

  // Если нет данных после загрузки
  if (!giftData?.gift) {
    return (
      <div className="size-full grid place-items-center relative select-none flex-1">
        <div className="text-white">Ошибка загрузки подарка</div>
      </div>
    );
  }

  console.log("🎨 Showing content for gift:", {
    name: giftData.gift.name,
    hasCustomAnimation: !!(giftData.gift as any).revealAnimation,
    status: onboardingStatus,
  });

  const hasCustomAnimation = !!(giftData.gift as any).revealAnimation;

  // Если есть кастомная анимация - показываем CustomRevealAnimation
  if (hasCustomAnimation) {
    return (
      <div className="size-full grid place-items-center relative select-none flex-1">
        <CustomRevealAnimation
          revealAnimation={(giftData.gift as any).revealAnimation}
          giftName={giftData.gift.name}
          onAnimationComplete={handleAnimationComplete}
          skipAnimation={onboardingStatus === "GIFT_REVEALED"}
        />
      </div>
    );
  }

  // Статус NEW без кастомной анимации - обычная анимация
  if (onboardingStatus === "NEW") {
    return (
      <div className="size-full grid place-items-center relative select-none flex-1">
        <GiftAnimation
          onAnimationComplete={handleAnimationComplete}
          showCongrats={showCongrats}
        />

        {showCongrats && (
          <div className="absolute inset-0 grid place-items-center">
            <CongratsMessage gift={giftData.gift} />
          </div>
        )}
      </div>
    );
  }

  // Статус GIFT_REVEALED без кастомной анимации - обычные поздравления
  return (
    <div className="size-full grid place-items-center relative select-none flex-1">
      <CongratsMessage gift={giftData.gift} />
    </div>
  );
}
