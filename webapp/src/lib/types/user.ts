// webapp/src/lib/types/user.ts
import { findUserByTelegramId } from "database";

type DatabaseUser = Awaited<ReturnType<typeof findUserByTelegramId>>;

export const USER_ROLE_VALUES = ["USER", "ADMIN"] as const;
export type UserRole = (typeof USER_ROLE_VALUES)[number];

export const USER_ONBOARDING_STATUS_VALUES = [
  "NEW",
  "GIFT_REVEALED",
  "COMPLETED",
] as const;
export type UserOnboardingStatus =
  (typeof USER_ONBOARDING_STATUS_VALUES)[number];
export type User = DatabaseUser & {
  role: UserRole;
  onboardingStatus: UserOnboardingStatus;
};
