import { cn } from "@sglara/cn";
import Image from "next/image";
import React from "react";

interface BackdropVariant {
  className: string;
  pattern1: string;
  pattern2: string;
  blendMode?: React.CSSProperties["mixBlendMode"];
  opacity?: number;
  filter?: string;
}

const BACKDROP_VARIANTS: Record<string, BackdropVariant> = {
  yellow: {
    className: "catalog-card-backdrop-yellow",
    pattern1: "/stars-pattern-1.svg",
    pattern2: "/stars-pattern-2.svg",
    blendMode: "hard-light",
    opacity: 0.9,
  },
  blue: {
    className: "catalog-card-backdrop-blue",
    pattern1: "/stars-pattern-1.svg",
    pattern2: "/stars-pattern-2.svg",
    blendMode: "screen",
    opacity: 0.5,
    filter: "hue-rotate(200deg) saturate(0.3) brightness(1.4)",
  },
};

interface CatalogCardBackdropProps {
  specialOffer?: boolean;
  variant?: keyof typeof BACKDROP_VARIANTS;
}

export default function CatalogCardBackdrop({
  specialOffer = false,
  variant = "yellow",
}: CatalogCardBackdropProps) {
  const config = BACKDROP_VARIANTS[variant];

  if (!config) {
    console.warn(`Unknown variant: ${variant}. Falling back to yellow.`);
    return null;
  }

  return (
    <div
      className={cn(
        "absolute inset-0 flex items-center justify-between",
        config.className
      )}
    >
      <div
        className={cn("h-full relative ", specialOffer ? "w-1/2" : "w-full")}
        style={{
          mixBlendMode: config.blendMode,
          opacity: config.opacity,
          filter: config.filter,
        }}
      >
        <Image src={config.pattern1} alt="pattern" fill />
      </div>
      {specialOffer && (
        <div
          className="w-1/2 h-full relative"
          style={{
            mixBlendMode: config.blendMode,
            opacity: config.opacity,
            filter: config.filter,
          }}
        >
          <Image src={config.pattern2} alt="pattern" fill />
        </div>
      )}
    </div>
  );
}
