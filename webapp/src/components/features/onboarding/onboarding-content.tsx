"use client";

import { useState } from "react";
import GiftAnimation from "./gift-animation";
import { UserOnboardingStatus } from "@/lib/types/user";
import { useQuery } from "@tanstack/react-query";
import CongratsMessage from "./congrats-message";
import LoadingScreen from "@/components/common/loading-screen";
import CustomRevealAnimation from "./custom-reveal-animation";

interface OnboardingContentProps {
  onboardingStatus: UserOnboardingStatus;
}

export default function OnboardingContent({
  onboardingStatus,
}: OnboardingContentProps) {
  const [showCongrats, setShowCongrats] = useState(false);

  // Простой useQuery для получения данных подарка
  const { data: giftData, isLoading } = useQuery({
    queryKey: ["onboarding-gift", onboardingStatus],
    queryFn: async () => {
      console.log("🎲 Loading gift data for status:", onboardingStatus);

      if (onboardingStatus === "NEW") {
        const { drawGift } = await import("@/lib/actions/gift/draw-gift");
        const result = await drawGift();

        if (!result.success) {
          throw new Error(result.error);
        }

        console.log("✅ Gift drawn:", result.data);
        return {
          gift: {
            name: result.data.gift.name,
            mediaUrl: result.data.gift.mediaUrl,
            revealAnimation: result.data.gift.revealAnimation || null,
          },
        };
      }

      if (onboardingStatus === "GIFT_REVEALED") {
        const { getUserOnboardingGift } = await import(
          "@/lib/actions/gift/get-user-onboarding-gift"
        );
        const result = await getUserOnboardingGift();

        if (!result.success) {
          throw new Error(result.error);
        }

        return result.data;
      }

      return null;
    },
    enabled: onboardingStatus === "NEW" || onboardingStatus === "GIFT_REVEALED",
    staleTime: Infinity,
    retry: 1,
  });

  const handleAnimationComplete = () => {
    console.log("🎬 Animation completed - showing congrats");
    setShowCongrats(true);
  };

  // Показываем лоадер при загрузке
  if (isLoading) {
    return null;
  }

  // Если нет данных подарка
  if (!giftData?.gift) {
    return (
      <div className="size-full grid place-items-center relative select-none flex-1">
        <div className="text-white">Ошибка загрузки подарка</div>
      </div>
    );
  }

  const hasCustomAnimation = !!giftData.gift.revealAnimation;

  // Кастомная анимация
  if (hasCustomAnimation && giftData.gift.revealAnimation) {
    return (
      <div className="size-full grid place-items-center relative select-none flex-1">
        <CustomRevealAnimation
          revealAnimation={giftData.gift.revealAnimation}
          giftName={giftData.gift.name}
          onAnimationComplete={handleAnimationComplete}
          skipAnimation={onboardingStatus === "GIFT_REVEALED"}
        />
      </div>
    );
  }

  // NEW статус - обычная анимация
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

  // GIFT_REVEALED статус - просто поздравления
  return (
    <div className="size-full grid place-items-center relative select-none flex-1">
      <CongratsMessage gift={giftData.gift} />
    </div>
  );
}
