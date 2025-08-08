"use client";
import React from "react";
import { useAuth } from "../features/auth/hooks/use-auth";
import { shareRefferalLink } from "@/lib/utils/share-refferal-link";

export default function ShareRefferalButton() {
  const { user } = useAuth();
  const handleShare = () => {
    shareRefferalLink(user?.telegramId);
  };
  return (
    <button
      className="w-full mt-5 primary-btn text-[#6E296D] text-nowrap"
      onClick={handleShare}
    >
      Поделиться с другом
    </button>
  );
}
