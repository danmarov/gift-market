"use client";
import React, { useRef, useEffect } from "react";

declare namespace JSX {
  interface IntrinsicElements {
    "lottie-player": any;
    "tgs-player": any;
  }
}

interface LottiePlayerProps {
  src: string;
  style?: React.CSSProperties;
  autoplay?: boolean;
  loop?: boolean;
  playOnLoad?: boolean;
  playOnHover?: boolean;
  onHover?: () => void;
}

const LottiePlayer: React.FC<LottiePlayerProps> = ({
  src,
  style = {},
  autoplay = false,
  loop = true,
  playOnLoad = false,
  playOnHover = false,
  onHover,
}) => {
  const playerRef = useRef<any>(null);

  // Определяем тип файла
  const isTGS = src.includes(".tgs") || src.endsWith(".tgs");

  // Обработчик загрузки анимации
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const handleLoad = () => {
      if (playOnLoad) {
        player.play();
      }
    };

    player.addEventListener("load", handleLoad);

    return () => {
      player.removeEventListener("load", handleLoad);
    };
  }, [playOnLoad]);

  // Обработчики hover
  const handleMouseEnter = () => {
    if (playOnHover && playerRef.current) {
      playerRef.current.play();
      onHover?.();
    }
  };

  const handleMouseLeave = () => {
    if (playOnHover && playerRef.current) {
      playerRef.current.stop();
    }
  };

  // Рендерим соответствующий плеер
  if (isTGS) {
    return (
      // @ts-ignore
      <tgs-player
        ref={playerRef}
        src={src}
        background="transparent"
        autoplay={autoplay}
        loop={loop}
        style={style}
        onMouseEnter={playOnHover ? handleMouseEnter : undefined}
        onMouseLeave={playOnHover ? handleMouseLeave : undefined}
      />
    );
  }

  return (
    // @ts-ignore
    <lottie-player
      ref={playerRef}
      src={src}
      background="transparent"
      autoplay={autoplay}
      loop={loop}
      style={style}
      onMouseEnter={playOnHover ? handleMouseEnter : undefined}
      onMouseLeave={playOnHover ? handleMouseLeave : undefined}
    />
  );
};

export default LottiePlayer;
