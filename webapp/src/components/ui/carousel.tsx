"use client";

import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: ReactNode;
  className?: string;
  options?: any;
  showDots?: boolean;
  autoplay?: boolean;
  autoplayDelay?: number;
  onSlideChange?: (index: number) => void;
  bottomContent?: ReactNode; // Контент между слайдером и точками
  infinite?: boolean; // Новый проп для управления бесконечной прокруткой
}

export function Carousel({
  children,
  className = "",
  options = {},
  showDots = false,
  autoplay = false,
  autoplayDelay = 3000,
  onSlideChange,
  bottomContent, // Добавляем в деструктуризацию
  infinite = false, // По умолчанию отключаем бесконечную прокрутку
}: CarouselProps) {
  const autoplayPlugin = useRef(
    Autoplay({
      delay: autoplayDelay,
      stopOnInteraction: false,
      playOnInit: true,
    })
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      containScroll: "trimSnaps",
      loop: infinite, // Используем проп infinite вместо hardcoded true
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
    const newIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(newIndex);

    // Вызываем коллбэк при изменении слайда
    if (onSlideChange) {
      onSlideChange(newIndex);
    }
  }, [emblaApi, onSlideChange]);

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
        <div className="flex gap-2.5">{children}</div>
      </div>

      {/* Контент между слайдером и точками */}
      {bottomContent && <div className="">{bottomContent}</div>}

      {showDots && (
        <div className="flex justify-center gap-2 h-6 items-center">
          {scrollSnaps.length > 1 &&
            scrollSnaps.map((_, index) => (
              <button
                key={index}
                type="button"
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  index === selectedIndex
                    ? "border border-white"
                    : "border border-white/50"
                )}
                style={{
                  backgroundColor:
                    index === selectedIndex ? "#ffffff" : "transparent",
                  borderColor:
                    index === selectedIndex
                      ? "#ffffff"
                      : "rgba(255, 255, 255, 0.5)",
                }}
                onClick={() => onDotButtonClick(index)}
              />
            ))}
        </div>
      )}
    </div>
  );
}

interface CarouselItemProps {
  children: ReactNode;
  className?: string;
}

export function CarouselItem({ children, className = "" }: CarouselItemProps) {
  return <div className={cn("flex-[0_0_100%]", className)}>{children}</div>;
}
