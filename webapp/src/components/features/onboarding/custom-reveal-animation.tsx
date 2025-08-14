"use client";

import TGSPlayer from "@/components/ui/tgs-wrapper";
import { hapticFeedback } from "@/lib/haptic-feedback";
import Image from "next/image";
import { useState, useRef } from "react";
import { TGSPlayerRef } from "@/components/ui/tgs-wrapper";
import SubscriptionDrawer from "./drawer";

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
  const playerRef = useRef<TGSPlayerRef>(null);

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

    // Если skipAnimation - автоматически запускаем анимацию
    if (skipAnimation && playerRef.current) {
      console.log("🚀 Auto-starting animation for GIFT_REVEALED");
      console.log("Player ref:", playerRef.current);

      // Небольшая задержка для уверенности что плеер готов
      setTimeout(() => {
        if (playerRef.current) {
          hapticFeedback("soft");
          playerRef.current.play();
          console.log("✅ Animation started!");

          // Показываем поздравления через время анимации
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

  return (
    <div className="text-center flex flex-col items-center justify-center absolute">
      <h1
        className="congrats-title font-serif uppercase mb-4 top-0"
        style={{
          opacity: isVisible ? 0 : 1,
          transition: "opacity 0.3s ease-out",
          position: "absolute",
        }}
      >
        Ваш подарок:
      </h1>
      <h1
        className="congrats-title font-serif uppercase mb-4"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        Поздравляем!
      </h1>

      <div
        className="size-[255px] relative grid place-items-center my-5"
        onClick={handleClick}
        style={{ cursor: hasClicked ? "default" : "pointer" }}
      >
        <TGSPlayer
          ref={playerRef}
          className="relative z-20"
          src={revealAnimation}
          playOnlyOnce={true}
          playOnClick={!hasClicked && !skipAnimation}
          autoplay={false}
          onReady={handleReady} // Изменил на onReady
          style={{
            width: 195,
            height: 195,
          }}
        />

        <Image
          src="/Star 3.svg"
          alt=""
          width={255}
          height={255}
          className="absolute"
        />
        <Image
          src="/Star 2.svg"
          alt=""
          width={255}
          height={255}
          className="absolute"
        />
        <Image
          src="/Star 1.svg"
          alt=""
          width={255}
          height={255}
          className="absolute"
        />
      </div>

      <p
        className="font-serif congrats-description max-w-[350px] mb-4"
        style={{
          opacity: isVisible ? 1 : 0,
          transition: "opacity 0.3s ease-out",
        }}
      >
        Вам выпал подарок «{giftName}»! Выполняйте задания, приглашайте друзей и
        получайте ещё больше подарков!
      </p>

      {isVisible && (
        // <button
        //   onClick={() => {
        //     hapticFeedback("soft");
        //   }}
        //   className="w-full primary-btn text-[#6E296D] text-nowrap"
        //   style={{
        //     opacity: isVisible ? 1 : 0,
        //     transition: "opacity 0.3s ease-out",
        //     pointerEvents: isVisible ? "auto" : "none",
        //   }}
        // >
        //   Забрать подарок
        // </button>
        <SubscriptionDrawer
          trigger={
            <button
              onClick={() => {
                hapticFeedback("soft");
              }}
              className="w-full primary-btn text-[#6E296D] text-nowrap"
              style={{
                opacity: isVisible ? 1 : 0,
                transition: "opacity 0.3s ease-out",
                pointerEvents: isVisible ? "auto" : "none",
              }}
            >
              Забрать подарок
            </button>
          }
        />
      )}
    </div>
  );
}
