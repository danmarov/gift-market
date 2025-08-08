"use client";
import { useDevice } from "@/components/providers/device-provider";
import React from "react";

interface ActionButtonProps {
  onClick: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function ActionButton({
  onClick,
  disabled,
  isLoading = false,
  children,
  className = "",
}: ActionButtonProps) {
  const { isMobile } = useDevice();

  return (
    <div
      className="pt-2 px-4 pb-7"
      style={{
        paddingBottom: isMobile ? "28px" : "8px",
      }}
    >
      <button
        className={`buy-gift-btn font-mono w-full ${className}`}
        onClick={onClick}
        disabled={disabled || isLoading}
        style={{
          opacity: disabled || isLoading ? "0.5" : "1",
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
          </div>
        ) : (
          children
        )}
      </button>
    </div>
  );
}
