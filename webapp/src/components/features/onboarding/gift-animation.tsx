"use client";

import TGSPlayer from "@/components/ui/tgs-wrapper";
import { type TGSPlayerRef } from "@/components/ui/tgs-wrapper";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { useRef, useState } from "react";

interface GiftAnimationProps {
  onAnimationComplete: () => void;
  showCongrats?: boolean;
}

export default function GiftAnimation({
  onAnimationComplete,
  showCongrats = false,
}: GiftAnimationProps) {
  const playerRef = useRef<TGSPlayerRef>(null);
  const [hasClicked, setHasClicked] = useState(false);

  const handleClick = () => {
    hapticFeedback("soft");
    if (hasClicked) return;

    setHasClicked(true);
    console.log("🎁 Animation started - waiting 2 seconds before completion");

    setTimeout(() => {
      console.log("⏰ 2 seconds passed - triggering completion");
      onAnimationComplete();
    }, 1800);
  };

  return (
    <>
      <div className="relative w-full">
        <h1
          className="congrats-title font-serif uppercase mb-4 top-0 text-center mx-auto w-full"
          style={{
            opacity: showCongrats ? 0 : 1,
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
            playOnClick={!hasClicked}
            playOnlyOnce={true}
            onPlay={handleClick}
            onClick={() => hapticFeedback("soft")}
            style={{
              cursor: hasClicked ? "default" : "pointer",
              opacity: showCongrats ? 0 : 1,
              transition: "opacity 0.3s ease-out",
            }}
            className="w-full h-fit"
          />
        </div>
      </div>
    </>
  );
}
