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
            className="relative z-20"
            src={randomGift.mediaUrl}
            playOnlyOnce={true}
            playOnClick={!hasClicked}
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
          Вам выпал подарок «{randomGift.name}»! Выполняйте задания, приглашайте
          друзей и получайте ещё больше подарков!
        </p>

        <button
          onClick={onClaimButtonClick}
          className="w-full primary-btn text-[#6E296D] text-nowrap"
          style={{
            opacity: isVisible ? 1 : 0,
            transition: "opacity 0.3s ease-out",
            pointerEvents: isVisible ? "auto" : "none",
          }}
          disabled={!isVisible}
        >
          Забрать подарок
        </button>
      </div>
    </MainLayout>
  );
}
