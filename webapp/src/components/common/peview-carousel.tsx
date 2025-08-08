"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface PreviewCarouselProps {
  children: ReactNode;
  className?: string;
  options?: any;
  showDots?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
}

export function PreviewCarousel({
  children,
  className = "",
  options = {},
  showDots = false,
  autoplay = false,
  autoplayDelay = 3000,
}: PreviewCarouselProps) {
  const autoplayPlugin = useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: false,
      playOnInit: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "center",
      containScroll: "trimSnaps",
      loop: true,
      slidesToScroll: 1,
      ...options,
    },
    autoplay ? [autoplayPlugin.current] : []
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  const onDotButtonClick = useCallback(
    (index: number) => {
      if (!emblaApi) return;
      emblaApi.scrollTo(index);
    },
    [emblaApi]
  );

  const onInit = useCallback(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onInit();
    onSelect();
    emblaApi.on("reInit", onInit);
    emblaApi.on("select", onSelect);
  }, [emblaApi, onInit, onSelect]);

  return (
    <div className={cn("relative", className)}>
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex gap-4">{children}</div>
      </div>

      {showDots && (
        <div className="flex justify-center gap-2 h-6 items-center mt-4">
          {scrollSnaps.length > 1 &&
            scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300 border border-white/50",
                  index === selectedIndex
                    ? "bg-white border-white"
                    : "bg-transparent"
                )}
                onClick={() => onDotButtonClick(index)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

interface PreviewCarouselItemProps {
  children: ReactNode;
  className?: string;
  isCenter?: boolean;
}

export function PreviewCarouselItem({
  children,
  className = "",
  isCenter = false,
}: PreviewCarouselItemProps) {
  return (
    <div
      className={cn(
        "flex-[0_0_33.333%] transition-all duration-300",
        isCenter ? "scale-110 z-10" : "scale-90 opacity-70",
        className
      )}
    >
      {children}
    </div>
  );
}
