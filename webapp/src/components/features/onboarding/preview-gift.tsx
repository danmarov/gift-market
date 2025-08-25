"use client";

import TGSPlayer from "@/components/ui/tgs-wrapper";
import { type TGSPlayerRef } from "@/components/ui/tgs-wrapper";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { useRef, useState } from "react";
import SubscriptionDrawer from "./drawer";
import Image from "next/image";
import { UserOnboardingStatus } from "database";
import Link from "next/link";

interface GiftAnimationProps {
  status: UserOnboardingStatus;
  gift: {
    name: string;
    mediaUrl: string;
    revealAnimation?: string | null;
  };
}

export default function PreviewGift({ gift, status }: GiftAnimationProps) {
  const playerRef = useRef<TGSPlayerRef>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleClick = () => {
    hapticFeedback("warning");
    console.log("🎁 Gift clicked - opening drawer");
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    console.log("📋 Drawer closed");
    setIsDrawerOpen(false);
  };

  return (
    <>
      <div className="text-center  flex flex-col items-center justify-center absolute">
        {/* Контейнер для анимированной смены заголовков */}
        <div className="relative mb-2 h-[1.2em] w-full">
          <h1
            className="congrats-title font-serif uppercase text-nowrap absolute w-full text-center"
            style={{
              // opacity: isVisible ? 0 : 1,
              transition: "all 0.4s ease-out",
            }}
          >
            Ваш подарок:
          </h1>
        </div>

        <div
          className="relative grid place-items-center mb-2"
          onClick={handleClick}
          style={{
            // cursor: hasClicked ? "default" : "pointer",
            width: "min(80vw, 320px)",
            height: "min(80vw, 320px)",
          }}
        >
          <TGSPlayer
            ref={playerRef}
            className="relative z-20"
            // src={revealAnimation}
            src="/pepe.tgs"
            playOnlyOnce={true}
            // playOnClick={!hasClicked && !skipAnimation}
            // autoplay={false}
            // onReady={handleReady}
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
            // opacity: isVisible ? 1 : 0,
            opacity: "0",
            transition: "opacity 0.3s ease-out",
          }}
        >
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum ipsum
          voluptatem officia fugiat aut aliquam vel minus quas a dignissimos.
          Facere nemo repudiandae totam aut!
        </p>
        {status === "CHANNELS_COMPLETED" && (
          <Link
            href={"/"}
            className="w-full absolute top-[80%] mt-4 primary-btn text-[#6E296D] text-nowrap"
          >
            Забрать позже
          </Link>
        )}
        <SubscriptionDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      </div>

      {/* <div className="relative w-full">
        <h1
          className="congrats-title font-serif uppercase mb-4 top-0 text-center mx-auto w-full"
          style={{
            // opacity: showCongrats ? 0 : 1,
            transition: "opacity 0.3s ease-out",
            position: "absolute",
          }}
        >
          Ваш подарок:
        </h1>
        <div className="w-[80%] aspect-square relative mx-auto">
          <TGSPlayer
            ref={playerRef}
            src="/gift.tgs"
            // playOnClick={!hasClicked}
            // playOnlyOnce={true}
            // onPlay={handleClick}
            onClick={handleClick}
            style={{
              //   opacity: showCongrats ? 0 : 1,
              transition: "opacity 0.3s ease-out",
            }}
            className="w-full h-fit"
          />
        </div>
        <SubscriptionDrawer
          isOpen={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
        />
      </div> */}
    </>
  );
}
