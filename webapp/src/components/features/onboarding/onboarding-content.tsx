"use client";

import { useState } from "react";
import { AUTH_QUERY_KEY } from "../auth/hooks/use-auth";
import GiftAnimation from "./gift-animation";
import { UserOnboardingStatus } from "@/lib/types/user";
import { useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import CongratsMessage from "./congrats-message";
import LoadingScreen from "@/components/common/loading-screen";
import TelegramBackButton from "@/components/common/telegram-back-button";

interface OnboardingContentProps {
  onboardingStatus: UserOnboardingStatus;
}

export default function OnboardingContent({
  onboardingStatus,
}: OnboardingContentProps) {
  const queryClient = useQueryClient();
  // Локальное состояние для плавного перехода
  const [localGiftData, setLocalGiftData] = useState<{
    name: string;
    mediaUrl: string;
  } | null>(null);
  const [showCongrats, setShowCongrats] = useState(false);

  // useQuery только для пользователей которые уже пришли со статусом GIFT_REVEALED
  const { data: giftData, isLoading } = useQuery({
    queryKey: ["user-onboarding-gift"],
    queryFn: async () => {
      const { getUserOnboardingGift } = await import(
        "@/lib/actions/gift/get-user-onboarding-gift"
      );
      const result = await getUserOnboardingGift();

      if (!result.success) {
        throw new Error(result.error);
      }

      return result.data;
    },
    enabled: onboardingStatus !== "NEW" && !localGiftData, // отключаем если есть локальные данные
    staleTime: 5 * 60 * 1000,
  });

  const handleGiftDrawRequest = async () => {
    console.log("🎲 Gift draw requested - making server request");

    try {
      const { drawGift } = await import("@/lib/actions/gift/draw-gift");
      const result = await drawGift();

      if (result.success) {
        console.log("✅ Draw successful:", result.data);

        // Сохраняем данные подарка локально для мгновенного показа
        setLocalGiftData(result.data.gift);

        // Показываем поздравления с небольшой задержкой для красивого перехода
        setTimeout(() => {
          setShowCongrats(true);
        }, 10);

        // Ревалидируем только auth данные (без router.refresh!)
        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });

        console.log("🎉 Showing congrats with smooth transition");
      } else {
        console.error("❌ Draw failed:", result.error);
      }
    } catch (error) {
      console.error("💥 Draw error:", error);
    }
  };

  // Статус NEW - показываем анимацию розыгрыша
  if (onboardingStatus === "NEW") {
    return (
      <div className="size-full grid place-items-center relative select-none flex-1">
        {/* Анимация подарка */}
        <GiftAnimation
          onGiftDrawRequest={handleGiftDrawRequest}
          showCongrats={showCongrats}
        />

        {/* Плавное появление поздравлений поверх анимации */}
        {localGiftData && showCongrats && (
          <div className="absolute inset-0 grid place-items-center">
            <CongratsMessage gift={localGiftData} />
          </div>
        )}
      </div>
    );
  }

  // Статус GIFT_REVEALED - показываем поздравления из API
  if (onboardingStatus === "GIFT_REVEALED") {
    if (isLoading) {
      return <LoadingScreen disableLayout />;
    }

    if (giftData?.gift) {
      return (
        <div className="size-full grid place-items-center relative select-none flex-1">
          <TelegramBackButton />

          <CongratsMessage gift={giftData.gift} />
        </div>
      );
    }
  }

  // Fallback
  return null;
}
