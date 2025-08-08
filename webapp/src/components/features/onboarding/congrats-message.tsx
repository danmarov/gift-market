"use client";

import TGSPlayer from "@/components/ui/tgs-wrapper";
import { type TGSPlayerRef } from "@/components/ui/tgs-wrapper";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import SubscriptionDrawer from "./drawer";

interface CongratsMessageProps {
  gift: {
    name: string;
    mediaUrl: string;
  };
}

export default function CongratsMessage({ gift }: CongratsMessageProps) {
  const playerRef = useRef<TGSPlayerRef>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Запускаем анимацию появления при монтировании
  useEffect(() => {
    // Небольшая задержка для плавного появления
    const fadeTimer = setTimeout(() => {
      setIsVisible(true);
    }, 0);

    return () => clearTimeout(fadeTimer);
  }, []);

  // Запускаем анимацию подарка после появления компонента
  useEffect(() => {
    if (isVisible && playerRef.current) {
      const timer = setTimeout(() => {
        console.log("🎬 Playing gift animation:", gift.name);
        playerRef.current?.play();
      }, 500); // увеличил задержку чтобы сначала появился компонент

      return () => clearTimeout(timer);
    }
  }, [isVisible, gift.mediaUrl]);

  return (
    <div
      className="text-center flex flex-col items-center justify-center"
      style={{
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.8s ease-out",
        transitionProperty: "opacity, transform",
        transitionDuration: "0.8s",
        transitionTimingFunction: "ease-out",
      }}
    >
      <h1 className="congrats-title font-serif uppercase">Поздравляем!</h1>

      <div className="size-[255px] relative grid place-items-center my-5">
        <TGSPlayer
          ref={playerRef}
          className="relative z-20"
          src={gift.mediaUrl}
          playOnClick={false}
          playOnlyOnce={false}
          style={{
            width: 195,
            height: 195,
          }}
        />

        {/* Декоративные звезды */}
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

      <p className="font-serif congrats-description max-w-[350px]">
        Вам выпал подарок «{gift.name}»! Выполняйте задания, приглашайте друзей
        и получайте ещё больше подарков!
      </p>
      <SubscriptionDrawer
        trigger={
          <button className="w-full mt-4 primary-btn text-[#6E296D] text-nowrap">
            Забрать подарок
          </button>
        }
      />
    </div>
  );
}
