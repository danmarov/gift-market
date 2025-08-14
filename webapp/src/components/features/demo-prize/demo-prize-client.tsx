"use client";

import MainLayout from "@/components/layout/main-layout";
import TGSPlayer from "@/components/ui/tgs-wrapper";
import { DemoPrize } from "@/lib/actions/demo-prize/get-demo-prize";
import { hapticFeedback } from "@/lib/haptic-feedback";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface DemoPrizePageClientProps {
  item: DemoPrize;
}

export default function DemoPrizePageClient({
  item: randomGift,
}: DemoPrizePageClientProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [claimButtonClicked, setClaimButtonClicked] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    if (!hasClicked) {
      hapticFeedback("soft");
      setHasClicked(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
        hapticFeedback("success");
      }, 2000);
      return () => clearTimeout(timer);
    }
  };

  const onClaimButtonClick = () => {
    if (!claimButtonClicked) {
      hapticFeedback("soft");
      setClaimButtonClicked(true);
    } else {
      router.push("/");
    }
  };

  if (!randomGift) {
    return null;
  }

  return (
    <MainLayout classname="grid place-items-center">
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
            className="relative z-20"
            src={randomGift.mediaUrl}
            playOnlyOnce={true}
            playOnClick={!hasClicked}
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
          className="font-serif congrats-description mb-3 mx-4"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.3s ease-out",
          }}
        >
          Вам выпал подарок «{randomGift.name}»! Выполняйте задания, приглашайте
          друзей и получайте ещё больше подарков!
        </p>

        <div
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.3s ease-out",
            pointerEvents: isVisible ? "auto" : "none",
          }}
          className="w-full mt-2 flex"
        >
          <button
            onClick={onClaimButtonClick}
            className="primary-btn text-[#6E296D] text-nowrap mx-4 flex-grow"
            disabled={!isVisible}
          >
            Забрать подарок
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
