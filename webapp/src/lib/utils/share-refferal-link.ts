import { openTelegramLink } from "@telegram-apps/sdk-react";
import { hapticFeedback } from "../haptic-feedback";
import { getRefferalLink } from "./get-refferal-link";

export const shareRefferalLink = (telegramId?: string) => {
  if (!telegramId) {
    hapticFeedback("error");
    return;
  }
  try {
    const referralLink = getRefferalLink(telegramId);
    const shareText = encodeURIComponent(
      `Бот отправил мне бесплатного мишку!  🧸\nЗабери и ты свой подарок ⬆️`
    );

    openTelegramLink(
      `https://t.me/share/url?url=${encodeURIComponent(
        referralLink
      )}&text=${shareText}`
    );
  } catch (error) {
    console.error("Error sharing:", error);
  }
};
