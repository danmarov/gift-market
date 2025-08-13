"use client";
import { cn } from "@sglara/cn";
import React from "react";
import { useAuth } from "../auth/hooks/use-auth";
import { shareRefferalLink } from "@/lib/utils/share-refferal-link";

interface ReferralTaskCardProps {
  className?: string;
  onClick?: () => void;
}

export default function ReferralTaskCard({
  className,
  onClick,
}: ReferralTaskCardProps) {
  const { user } = useAuth();

  const handleShare = () => {
    shareRefferalLink(user?.telegramId);
  };

  return (
    <div
      className={cn(
        "task-card-backdrop cursor-pointer block w-full",
        className
      )}
      onClick={onClick} // Используем внешний обработчик вместо handleShare
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onClick?.();
        }
      }}
      // onClick={handleShare}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-sm font-medium text-white">
              +5 ОЧКОВ ЗА КАЖДОГО ДРУГА
            </span>
            <span className="text-sans text-xs text-[#E7D3E9] leading-3">
              Нажмите чтобы поделиться ссылкой
            </span>
          </div>
        </div>
      </div>
      <button className="flex-shrink-0 task-card-icon">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-link-icon lucide-link"
        >
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
    </div>
  );
}
