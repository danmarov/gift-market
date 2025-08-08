// lib/types/task.ts
import { z } from "zod";
const TaskType = {
  TELEGRAM_SUBSCRIPTION: "TELEGRAM_SUBSCRIPTION",
  DAILY_BONUS: "DAILY_BONUS",
} as const;
export type TaskType = "TELEGRAM_SUBSCRIPTION" | "DAILY_BONUS";

const TaskDuration = {
  ONE_DAY: "ONE_DAY",
  ONE_WEEK: "ONE_WEEK",
  ONE_MONTH: "ONE_MONTH",
} as const;

export type TaskDuration = "ONE_DAY" | "ONE_WEEK" | "ONE_MONTH";
export type UserTaskStatus =
  | "AVAILABLE"
  | "IN_PROGRESS"
  | "PENDING_CHECK"
  | "COMPLETED"
  | "CLAIMED";

export const createTaskSchema = z.object({
  type: z.enum(TaskType),
  duration: z.enum(TaskDuration),
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  description: z.string().min(1, "Описание обязательно"),
  reward: z
    .number()
    .min(1, "Награда должна быть больше 0")
    .max(1000, "Максимум 1000 звезд"),
  icon: z.string().min(1, "Выберите иконку"),
  channel_url: z.string().url("Введите корректную ссылку на канал"),
  chat_id: z.string().min(1, "Это обязательное поле"),
  max_completions: z.number().optional(),
  starts_at: z.date().optional(),
});

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const editTaskSchema = z.object({
  type: z.enum(["TELEGRAM_SUBSCRIPTION", "TIKTOK_COMMENT", "DAILY_BONUS"], {
    message: "Выберите тип задания",
  }),
  duration: z.enum(["ONE_DAY", "ONE_WEEK", "ONE_MONTH"], {
    message: "Выберите продолжительность",
  }),
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  description: z.string().min(1, "Описание обязательно"),
  reward: z
    .number()
    .min(1, "Награда должна быть больше 0")
    .max(1000, "Максимум 1000 звезд"),
  icon: z.string().min(1, "Выберите иконку"),
  channel_url: z.string().url("Введите корректную ссылку на канал"),
  chat_id: z.string().min(1, "Это обязательное поле"),
  max_completions: z.number().optional(),
  starts_at: z.date().optional(),
  is_active: z.boolean(),
  is_visible: z.boolean(),
});

// Тип данных формы редактирования
export type EditTaskFormData = z.infer<typeof editTaskSchema>;

export type TaskActionType =
  | "timer"
  | "check"
  | "completed"
  | "available"
  | "claim";
export type TaskIconType =
  | "telegram"
  | "tiktok"
  | "youtube"
  | "instagram"
  | "twitter";
// export type User
export interface TaskWithUserStatus {
  id: string;
  type: TaskType;
  title: string;
  description?: string;
  reward: number;
  icon: TaskIconType;
  duration: TaskDuration;
  expiresAt: Date;
  maxCompletions?: number;
  userStatus: UserTaskStatus;
  startedAt?: Date;
  completedAt?: Date;
  claimedAt?: Date;

  metadata?: {
    channelUrl?: string;
    chatId?: string;
  };

  // 🔥 Дополнительные поля для админов
  isActive?: boolean;
  isVisible?: boolean;
  createdAt?: Date;
  startsAt?: Date;
  completedCount?: number;
}

export interface CategorizedTasks {
  daily: TaskWithUserStatus[];
  oneTime: TaskWithUserStatus[];
}

export interface EditTaskActionData {
  id: string;
  type: string;
  duration: string;
  title: string;
  description: string;
  reward: number;
  icon: string;
  channelUrl: string;
  chatId: string;
  startsAt?: Date;
  maxCompletions?: number;
  isActive: boolean;
  isVisible: boolean;
}
