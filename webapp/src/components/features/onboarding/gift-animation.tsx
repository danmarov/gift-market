"use client";

import TGSPlayer from "@/components/ui/tgs-wrapper";
import { type TGSPlayerRef } from "@/components/ui/tgs-wrapper";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { useRef, useState } from "react";

interface GiftAnimationProps {
  onGiftDrawRequest: () => void;
  showCongrats?: boolean; // для управления затуханием
}

export default function GiftAnimation({
  onGiftDrawRequest,
  showCongrats = false,
}: GiftAnimationProps) {
  const playerRef = useRef<TGSPlayerRef>(null);
  const [hasClicked, setHasClicked] = useState(false);

  const handleClick = () => {
    hapticFeedback("soft");
    if (hasClicked) return;

    setHasClicked(true);
    console.log("🎁 Animation started - waiting 2 seconds before draw request");

    setTimeout(() => {
      console.log("⏰ 2 seconds passed - triggering draw request");
      onGiftDrawRequest();
    }, 1800);
  };

  return (
    <div className="w-[80%] aspect-square relative">
      <TGSPlayer
        ref={playerRef}
        src="/gift.tgs"
        playOnClick={!hasClicked}
        playOnlyOnce={true}
        onPlay={handleClick}
        onClick={() => hapticFeedback("soft")}
        style={{
          cursor: hasClicked ? "default" : "pointer",
          opacity: showCongrats ? 0 : 1, // плавное затухание когда показываем поздравления
          transition: "opacity 0.6s ease-out",
        }}
        className="w-full h-fit"
      />
    </div>
  );
}
