// lib/actions/user/get-user-onboarding-status.ts
"use server";

import { findUserById, getUserWonGift } from "database";
import { withServerAuth } from "../auth/with-server-auth";
import { JWTSession } from "@/lib/types/session";
import { UserOnboardingStatus } from "@/lib/types/user";

async function _getUserOnboardingStatus(session: JWTSession): Promise<{
  success: boolean;
  data?: {
    onboardingStatus: string;
    wonGift?: any;
  };
  error?: string;
}> {
  try {
    console.log("📋 [SERVER] Getting onboarding status for user:", session.id);

    // Получаем пользователя из БД
    const user = await findUserById(session.id);

    if (!user) {
      throw new Error("User not found");
    }

    console.log("👤 [SERVER] User onboarding status:", user.onboardingStatus);

    // Если у пользователя есть выигранный подарок, получаем его
    let wonGift = null;
    if (
      user.onboardingStatus === "GIFT_REVEALED" ||
      user.onboardingStatus === "COMPLETED"
    ) {
      wonGift = await getUserWonGift(session.id);
    }

    return {
      success: true,
      data: {
        onboardingStatus: user.onboardingStatus as UserOnboardingStatus,
        wonGift,
      },
    };
  } catch (error) {
    console.error("💥 [SERVER] Error getting onboarding status:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Ошибка при получении статуса онбординга",
    };
  }
}

export const getUserOnboardingStatus = withServerAuth(_getUserOnboardingStatus);
