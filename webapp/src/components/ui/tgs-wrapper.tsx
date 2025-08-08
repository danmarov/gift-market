"use client";
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useState,
} from "react";

// Типы для TGS Player
interface TGSPlayerElement extends HTMLElement {
  play(): void;
  pause(): void;
  stop(): void;
  seek(frame: number): void;
  setSpeed(speed: number): void;
  setDirection(direction: 1 | -1): void;
  currentFrame: number;
  totalFrames: number;
  playbackRate: number;
  direction: number;
  isPaused: boolean;
  isStopped: boolean;
}

interface TGSPlayerProps {
  src: string;
  autoplay?: boolean;
  loop?: boolean | number;
  controls?: boolean;
  speed?: number;
  direction?: 1 | -1;
  mode?: "normal" | "bounce";
  background?: string;
  style?: React.CSSProperties;
  className?: string;

  // События
  onLoad?: () => void;
  onReady?: () => void;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onComplete?: () => void;
  onLoop?: () => void;
  onFrame?: (frame: number) => void;
  onError?: (error: any) => void;

  // Интерактивность
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;

  // Дополнительные настройки
  playOnClick?: boolean;
  playOnlyOnce?: boolean;
  onAnimationComplete?: () => void;
}

export interface TGSPlayerRef {
  play(): void;
  pause(): void;
  stop(): void;
  seek(frame: number): void;
  setSpeed(speed: number): void;
  setDirection(direction: 1 | -1): void;
  getCurrentFrame(): number;
  getTotalFrames(): number;
  getElement(): TGSPlayerElement | null;
}

declare namespace JSX {
  interface IntrinsicElements {
    "tgs-player": any;
  }
}

const TGSPlayer = forwardRef<TGSPlayerRef, TGSPlayerProps>(
  (
    {
      src,
      autoplay = false,
      loop = false,
      controls = false,
      speed = 1,
      direction = 1,
      mode = "normal",
      background = "transparent",
      style,
      className,

      // События
      onLoad,
      onReady,
      onPlay,
      onPause,
      onStop,
      onComplete,
      onLoop,
      onFrame,
      onError,

      // Интерактивность
      onClick,
      onMouseEnter,
      onMouseLeave,

      // Дополнительные настройки
      playOnClick = false,
      playOnlyOnce = false,
      onAnimationComplete,
    },
    ref
  ) => {
    const playerRef = useRef<TGSPlayerElement>(null);
    const [hasPlayed, setHasPlayed] = useState(false);

    // Экспортируем методы через ref
    useImperativeHandle(
      ref,
      () => ({
        play: () => playerRef.current?.play(),
        pause: () => playerRef.current?.pause(),
        stop: () => playerRef.current?.stop(),
        seek: (frame: number) => playerRef.current?.seek(frame),
        setSpeed: (speed: number) => playerRef.current?.setSpeed(speed),
        setDirection: (direction: 1 | -1) =>
          playerRef.current?.setDirection(direction),
        getCurrentFrame: () => playerRef.current?.currentFrame || 0,
        getTotalFrames: () => playerRef.current?.totalFrames || 0,
        getElement: () => playerRef.current,
      }),
      []
    );

    // Настройка событий
    useEffect(() => {
      const player = playerRef.current;
      if (!player) return;

      const handleLoad = () => {
        console.log("TGS Player loaded");
        onLoad?.();
      };

      const handleReady = () => {
        console.log("TGS Player ready");
        onReady?.();
      };

      const handlePlay = () => {
        console.log("TGS Player play");
        onPlay?.();
      };

      const handlePause = () => {
        console.log("TGS Player pause");
        onPause?.();
      };

      const handleStop = () => {
        console.log("TGS Player stop");
        onStop?.();
      };

      const handleComplete = () => {
        console.log("TGS Player complete");
        onComplete?.();
        onAnimationComplete?.();

        if (playOnlyOnce) {
          setHasPlayed(true);
        }
      };

      const handleLoop = () => {
        console.log("TGS Player loop");
        onLoop?.();
      };

      const handleFrame = (e: CustomEvent) => {
        onFrame?.(e.detail?.frame || 0);
      };

      const handleError = (e: CustomEvent) => {
        console.error("TGS Player error:", e.detail);
        onError?.(e.detail);
      };

      // Добавляем слушатели
      player.addEventListener("load", handleLoad);
      player.addEventListener("ready", handleReady);
      player.addEventListener("play", handlePlay);
      player.addEventListener("pause", handlePause);
      player.addEventListener("stop", handleStop);
      player.addEventListener("complete", handleComplete);
      player.addEventListener("loop", handleLoop);
      // @ts-expect-error custom event type
      player.addEventListener("frame", handleFrame);
      // @ts-expect-error custom event type
      player.addEventListener("error", handleError);

      return () => {
        player.removeEventListener("load", handleLoad);
        player.removeEventListener("ready", handleReady);
        player.removeEventListener("play", handlePlay);
        player.removeEventListener("pause", handlePause);
        player.removeEventListener("stop", handleStop);
        player.removeEventListener("complete", handleComplete);
        player.removeEventListener("loop", handleLoop);
        // @ts-expect-error custom event type
        player.removeEventListener("frame", handleFrame);
        // @ts-expect-error custom event type
        player.removeEventListener("error", handleError);
      };
    }, [
      onLoad,
      onReady,
      onPlay,
      onPause,
      onStop,
      onComplete,
      onLoop,
      onFrame,
      onError,
      onAnimationComplete,
      playOnlyOnce,
    ]);

    // Обработчик клика
    const handleClick = () => {
      if (playOnClick && !hasPlayed && playerRef.current) {
        playerRef.current.play();
      }
      onClick?.();
    };

    return (
      // @ts-ignore
      <tgs-player
        ref={playerRef}
        src={src}
        autoplay={autoplay && !playOnlyOnce}
        loop={loop}
        controls={controls}
        speed={speed}
        direction={direction}
        mode={mode}
        background={background}
        style={style}
        className={className}
        onClick={handleClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      />
    );
  }
);

TGSPlayer.displayName = "TGSPlayer";

export default TGSPlayer;
