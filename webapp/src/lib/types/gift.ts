import { z } from "zod";
import { Gift } from "database";
// export interface Gift {
//   id: string;
//   telegram_gift_id: string;
//   name: string;
//   description?: string;
//   media_url: string;
//   price: number;
//   quantity: number;
//   sold_count: number;
//   special_offer: boolean;
//   backdrop_variant: "yellow" | "blue";
//   tags: string[];
//   created_at: Date;
//   updated_at: Date;
// }

export type CreateGiftData = Pick<
  Gift,
  | "name"
  | "description"
  | "telegramGiftId"
  | "mediaUrl"
  | "price"
  | "quantity"
  | "specialOffer"
  | "backdropVariant"
  | "tags"
>;

export const createGiftSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  description: z.string().optional(),
  telegram_gift_id: z.string().min(1, "Telegram ID обязателен"),
  media_url: z.string().url("Введите корректную ссылку"),
  price: z.number().min(1, "Цена должна быть больше 0"),
  quantity: z.number().min(1, "Количество должно быть больше 0"),
  backdrop_variant: z.enum(["yellow", "blue"], {
    message: "Выберите цвет фона",
  }),
  tags: z.array(z.string()),
  special_offer: z.boolean(),
});

export type CreateGiftFormData = z.infer<typeof createGiftSchema>;

export const editGiftSchema = z.object({
  name: z
    .string()
    .min(1, "Название обязательно")
    .max(100, "Максимум 100 символов"),
  description: z.string().optional(),
  telegramGiftId: z.string().min(1, "Telegram ID обязателен"), // camelCase
  mediaUrl: z.string().url("Введите корректную ссылку"), // camelCase
  price: z.number().min(1, "Цена должна быть больше 0"),
  quantity: z.number().min(1, "Количество должно быть больше 0"),
  backdropVariant: z.enum(["YELLOW", "BLUE"], {
    // camelCase + UPPERCASE
    message: "Выберите цвет фона",
  }),
  tags: z.array(z.string()),
  specialOffer: z.boolean(), // camelCase
});

export type EditGiftFormData = z.infer<typeof editGiftSchema>;
