import {
  hapticFeedback as haptic,
  type ImpactHapticFeedbackStyle,
  type NotificationHapticFeedbackType,
} from "@telegram-apps/sdk-react";

type HapticType = ImpactHapticFeedbackStyle | "success" | "error" | "warning";

export const hapticFeedback = (type: HapticType) => {
  try {
    if (type === "success" || type === "error" || type === "warning") {
      haptic.notificationOccurred(type as NotificationHapticFeedbackType);
    } else {
      haptic.impactOccurred(type as ImpactHapticFeedbackStyle);
    }
  } catch (error) {
    console.warn(error);
  }
};
