"use client";
import { useState, useTransition } from "react";
import MainLayout from "@/components/layout/main-layout";
import { GiftPageContent } from "./gift-page-content";
import BuyGiftButton from "./buy-gift-button";
import { Gift } from "database";
import TelegramBackButton from "@/components/common/telegram-back-button";
import { getErrorMessage } from "@/lib/utils/error";
import showToast from "@/components/ui/custom-toast";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_QUERY_KEY } from "../auth/hooks/use-auth";
import { useRawInitData } from "@telegram-apps/sdk-react";

interface GiftPageWrapperProps {
  id: string;
  item: Gift;
  onPurchase: (
    giftId: string,
    quantity: number
  ) => Promise<{ success: boolean; error?: string; data?: any }>;
}

export default function GiftPageWrapper({
  id,
  item,
  onPurchase,
}: GiftPageWrapperProps) {
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const onBuyButtonClick = async () => {
    startTransition(async () => {
      try {
        const result = await onPurchase(id, quantity);
        if (!result.success) {
          throw new Error(result.error);
        }
        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
        hapticFeedback("success");
        showToast.success(
          quantity > 1 ? "Ваши подарки уже в пути" : "Ваш подарок уже в пути"
        );
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error("❌ Purchase failed:", errorMessage);
        hapticFeedback("error");
        showToast.error(errorMessage);
      }
    });
  };

  return (
    <MainLayout
      bottomBar={
        <BuyGiftButton
          quantity={quantity}
          price={item.price}
          outOfStock={item.quantity === 0}
          onClick={onBuyButtonClick}
          loading={isPending}
        />
      }
    >
      <TelegramBackButton />
      <GiftPageContent id={id} onQuantityChange={setQuantity} item={item} />
    </MainLayout>
  );
}
