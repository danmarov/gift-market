import { cn } from "@sglara/cn";
import Image from "next/image";
import React from "react";
import { ProductBackdropVariant } from "./lib/types";

interface BackdropVariant {
  className: string;
  pattern1: string;
  pattern2: string;
  blendMode?: React.CSSProperties["mixBlendMode"];
  opacity?: number;
  filter?: string;
}

const BACKDROP_VARIANTS: Record<ProductBackdropVariant, BackdropVariant> = {
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

interface ProductCardBackdropProps {
  variant?: any;
}

export default function ProductCardBackdrop({
  variant = "yellow",
}: ProductCardBackdropProps) {
  // @ts-ignore
  const config = BACKDROP_VARIANTS[variant];

  if (!config) {
    console.warn(`Unknown variant: ${variant}. Falling back to yellow.`);
    return null;
  }

  const patternStyle = {
    mixBlendMode: config.blendMode,
    opacity: config.opacity,
    filter: config.filter,
  };

  return (
    <div
      className={cn(
        "absolute inset-0 flex flex-wrap justify-between",
        config.className
      )}
    >
      {/* Верхний левый */}
      <div className="w-1/2 h-1/2 relative" style={patternStyle}>
        <Image src={config.pattern1} alt="pattern" fill />
      </div>

      {/* Верхний правый */}
      <div className="w-1/2 h-1/2 relative" style={patternStyle}>
        <Image src={config.pattern2} alt="pattern" fill />
      </div>

      {/* Нижний левый */}
      <div className="w-1/2 h-1/2 relative" style={patternStyle}>
        <Image src={config.pattern1} alt="pattern" fill />
      </div>

      {/* Нижний правый */}
      <div className="w-1/2 h-1/2 relative" style={patternStyle}>
        <Image src={config.pattern2} alt="pattern" fill />
      </div>
    </div>
  );
}
