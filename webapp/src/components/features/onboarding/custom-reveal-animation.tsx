"use client";

import TGSPlayer from "@/components/ui/tgs-wrapper";
import { hapticFeedback } from "@/lib/haptic-feedback";
import Image from "next/image";
import { useState, useRef, useTransition } from "react";
import { TGSPlayerRef } from "@/components/ui/tgs-wrapper";
import SubscriptionDrawer from "./drawer";
import { completeOnboarding } from "@/lib/actions/onboarding/complete-onboarding";
import showToast from "@/components/ui/custom-toast";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEY } from "../auth/hooks/use-auth";
import { useRouter } from "next/navigation";

interface CustomRevealAnimationProps {
  revealAnimation: string;
  giftName: string;
  onAnimationComplete?: () => void;
  skipAnimation?: boolean;
}

export default function CustomRevealAnimation({
  revealAnimation,
  giftName,
  onAnimationComplete,
  skipAnimation = false,
}: CustomRevealAnimationProps) {
  const [isVisible, setIsVisible] = useState(skipAnimation);
  const [hasClicked, setHasClicked] = useState(skipAnimation);
  const [isClaimingGift, setIsClaimingGift] = useState(false);
  const queryClient = useQueryClient();
  const playerRef = useRef<TGSPlayerRef>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleClick = () => {
    if (!hasClicked && !skipAnimation) {
      hapticFeedback("soft");
      setHasClicked(true);
      console.log("🎁 Custom reveal animation started - waiting 2 seconds");

      const timer = setTimeout(() => {
        setIsVisible(true);
        hapticFeedback("success");
        console.log("⏰ Custom animation completed");
        onAnimationComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  };

  const handleReady = () => {
    console.log("🎬 TGS Player ready");

    if (skipAnimation && playerRef.current) {
      console.log("🚀 Auto-starting animation for GIFT_REVEALED");
      console.log("Player ref:", playerRef.current);

      setTimeout(() => {
        if (playerRef.current) {
          hapticFeedback("soft");
          playerRef.current.play();
          console.log("✅ Animation started!");

          setTimeout(() => {
            setIsVisible(true);
            hapticFeedback("success");
            console.log("⏰ Auto animation completed");
            onAnimationComplete?.();
          }, 2000);
        }
      }, 50);
    }
  };

  const handleClaimGift = async () => {
    if (isClaimingGift || isPending) return;

    setIsClaimingGift(true);

    hapticFeedback("soft");

    startTransition(async () => {
      try {
        console.log("🎁 Claiming gift...");

        const result = await completeOnboarding();

        if (result.success) {
          // setClaimMessage(result.message);
          hapticFeedback("success");
          console.log("✅ Gift claimed successfully:", result.message);
          showToast.success(result.message);
          await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
          router.push("/");
        } else {
          // setClaimError(result.error);
          showToast.error(result.error);

          hapticFeedback("error");
          console.error("❌ Failed to claim gift:", result.error);
        }
      } catch (error) {
        console.error("💥 Error claiming gift:", error);
        // setClaimError(
        //   "Произошла ошибка при получении подарка. Попробуйте ещё раз."
        // );
        showToast.error("Произошла ошибка");

        hapticFeedback("error");
      } finally {
        setIsClaimingGift(false);
      }
    });
  };

  return (
    <div className="text-center flex flex-col items-center justify-center absolute">
      {/* Контейнер для анимированной смены заголовков */}
      <div className="relative mb-2 h-[1.2em] w-full">
        <h1
          className="congrats-title font-serif uppercase text-nowrap absolute w-full text-center"
          style={{
            opacity: isVisible ? 0 : 1,
            transition: "all 0.4s ease-out",
          }}
        >
          Ваш подарок:
        </h1>
        <h1
          className="congrats-title font-serif uppercase text-nowrap absolute w-full text-center"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "all 0.4s ease-out",
          }}
        >
          Поздравляем!
        </h1>
      </div>

      <div
        className="relative grid place-items-center mb-2"
        onClick={handleClick}
        style={{
          cursor: hasClicked ? "default" : "pointer",
          width: "min(80vw, 320px)",
          height: "min(80vw, 320px)",
        }}
      >
        <TGSPlayer
          ref={playerRef}
          className="relative z-20"
          src={revealAnimation}
          playOnlyOnce={true}
          playOnClick={!hasClicked && !skipAnimation}
          autoplay={false}
          onReady={handleReady}
          style={{
            width: "70%",
            height: "70%",
          }}
        />

        <Image
          src="/Star 3.svg"
          alt=""
          width={320}
          height={320}
          className="absolute w-full h-full object-contain"
        />
        <Image
          src="/Star 2.svg"
          alt=""
          width={320}
          height={320}
          className="absolute w-full h-full object-contain"
        />
        <Image
          src="/Star 1.svg"
          alt=""
          width={320}
          height={320}
          className="absolute w-full h-full object-contain"
        />
      </div>

      <p
        className="font-serif congrats-description mb-3"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        Вам выпал подарок «{giftName}»! Выполняйте задания, приглашайте друзей и
        получайте ещё больше подарков!
      </p>

      <div
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease-out",
          pointerEvents: isVisible ? "auto" : "none",
        }}
        className="w-full mt-2"
      >
        <button
          onClick={handleClaimGift}
          disabled={isClaimingGift || isPending}
          className="w-full primary-btn text-[#6E296D] text-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isClaimingGift || isPending ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span>
              Получение подарка...
            </span>
          ) : (
            "Забрать подарок"
          )}
        </button>
      </div>
    </div>
  );
}
