"use client";
import LottiePlayer from "@/components/ui/tgs-player";
import Image from "next/image";
import React, { useMemo } from "react";

interface ProductPreviewProps {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  onLottieHover?: () => void;
  playOnLoad?: boolean;
}

export default function ProductPreview({
  src,
  alt = "",
  className,
  style,
  priority = false,
  onLottieHover,
  playOnLoad = false,
}: ProductPreviewProps) {
  const fileType = useMemo(() => {
    if (src.includes(".tgs") || src.endsWith(".tgs")) {
      return "tgs";
    }
    if (src.includes(".json") || src.includes("lottie")) {
      return "lottie";
    }
    return "image";
  }, [src]);

  const isAnimated = fileType === "tgs" || fileType === "lottie";

  return (
    <div className={className} style={style}>
      {isAnimated ? (
        <LottiePlayer
          src={src}
          playOnLoad={playOnLoad}
          playOnHover
          loop={false}
          onHover={onLottieHover}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      ) : (
        <Image src={src} alt={alt} fill priority={priority} />
      )}
    </div>
  );
}
