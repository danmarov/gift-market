import { TaskActionType, UserTaskStatus } from "../types/task";

export function getActionType(
  status: UserTaskStatus,
  expiresAt: Date,
  duration: "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH"
): TaskActionType {
  const now = new Date();

  // Если задание истекло
  if (expiresAt <= now) {
    return "timer"; // показываем таймер истечения (00:00:00)
  }

  // Для ежедневных заданий (ONE_DAY) показываем таймер до истечения
  if (duration === "ONE_DAY" && status === "AVAILABLE") {
    return "timer";
  }

  // Для остальных - обычная логика
  switch (status) {
    case "AVAILABLE":
      return "available"; // кнопка "Перейти"
    case "IN_PROGRESS":
      return "check"; // кнопка "Проверить"
    case "COMPLETED":
      return "claim"; // кнопка "Получить награду"
    case "CLAIMED":
      return "completed"; // галочка
    default:
      return "available";
  }
}
export function getTimeUntilExpiry(
  expiresAt: Date,
  currentTime?: Date
): string {
  const now = currentTime || new Date();
  const diff = expiresAt.getTime() - now.getTime();

  if (diff <= 0) return "00:00:00";

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
