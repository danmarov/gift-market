// lib/types/task.ts
import { z } from "zod";
const TaskType = {
  TELEGRAM_SUBSCRIPTION: "TELEGRAM_SUBSCRIPTION",
  FREE_BONUS: "FREE_BONUS",
} as const;
export type TaskType = "TELEGRAM_SUBSCRIPTION" | "FREE_BONUS";

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
  type: z.enum(["TELEGRAM_SUBSCRIPTION", "FREE_BONUS"]),
  duration: z.enum(["ONE_DAY", "ONE_WEEK", "ONE_MONTH"]),
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  description: z.string().optional(),
  reward: z
    .number()
    .min(1, "Награда должна быть больше 0")
    .max(1000, "Максимум 1000 звезд"),
  icon: z.string().min(1, "Выберите иконку"),

  // 🔥 Делаем эти поля опциональными
  channel_url: z.string().optional(),
  chat_id: z.string().optional(),

  max_completions: z.number().optional(),
  starts_at: z.date().optional(),
});

export const createTaskSchemaWithValidation = createTaskSchema
  .refine(
    (data) => {
      if (data.type === "TELEGRAM_SUBSCRIPTION") {
        return (
          data.channel_url &&
          data.channel_url.trim() !== "" &&
          data.chat_id &&
          data.chat_id.trim() !== ""
        );
      }
      // Для FREE_BONUS эти поля не нужны
      return true;
    },
    {
      message: "Ссылака на канал обязательна",
      path: ["channel_url"],
    }
  )
  .refine(
    (data) => {
      // Проверяем URL только если он заполнен
      if (data.channel_url && data.channel_url.trim() !== "") {
        try {
          new URL(data.channel_url);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Введите корректную ссылку на канал",
      path: ["channel_url"],
    }
  );

export type CreateTaskFormData = z.infer<typeof createTaskSchema>;

export const editTaskSchema = z.object({
  type: z.enum(["TELEGRAM_SUBSCRIPTION", "FREE_BONUS", "TIKTOK_COMMENT"], {
    message: "Выберите тип задания",
  }),
  duration: z.enum(["ONE_DAY", "ONE_WEEK", "ONE_MONTH"], {
    message: "Выберите продолжительность",
  }),
  title: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  description: z.string().optional(), // 🔥 Делаем опциональным как в createTaskSchema
  reward: z
    .number()
    .min(1, "Награда должна быть больше 0")
    .max(1000, "Максимум 1000 звезд"),
  icon: z.string().min(1, "Выберите иконку"),

  // 🔥 Делаем эти поля опциональными
  channel_url: z.string().optional(),
  chat_id: z.string().optional(),

  max_completions: z.number().optional(),
  starts_at: z.date().optional(),
  is_active: z.boolean(),
  is_visible: z.boolean(),
});

// Схема с условной валидацией для редактирования
export const editTaskSchemaWithValidation = editTaskSchema
  .refine(
    (data) => {
      // Если тип TELEGRAM_SUBSCRIPTION, то channel_url и chat_id обязательны
      if (data.type === "TELEGRAM_SUBSCRIPTION") {
        return (
          data.channel_url &&
          data.channel_url.trim() !== "" &&
          data.chat_id &&
          data.chat_id.trim() !== ""
        );
      }
      // Для FREE_BONUS и других типов эти поля не нужны
      return true;
    },
    {
      message: "Ссылка на канал обязательна для Telegram подписки",
      path: ["channel_url"],
    }
  )
  .refine(
    (data) => {
      // Если тип TELEGRAM_SUBSCRIPTION, то chat_id тоже должен быть заполнен
      if (data.type === "TELEGRAM_SUBSCRIPTION") {
        return data.chat_id && data.chat_id.trim() !== "";
      }
      return true;
    },
    {
      message: "Chat ID обязателен для Telegram подписки",
      path: ["chat_id"],
    }
  )
  .refine(
    (data) => {
      // Проверяем URL только если он заполнен
      if (data.channel_url && data.channel_url.trim() !== "") {
        try {
          new URL(data.channel_url);
          return true;
        } catch {
          return false;
        }
      }
      return true;
    },
    {
      message: "Введите корректную ссылку на канал",
      path: ["channel_url"],
    }
  );

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
  description?: string;
  reward: number;
  icon: string;
  channelUrl?: string;
  chatId?: string;
  startsAt?: Date;
  maxCompletions?: number;
  isActive: boolean;
  isVisible: boolean;
}
