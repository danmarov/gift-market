import { z } from "zod";
import { Gift } from "database";

export type CreateGiftData = Pick<
  Gift,
  | "name"
  | "description"
  | "telegramGiftId"
  | "mediaUrl"
  | "revealAnimation"
  | "revealMediaId"
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
  telegram_gift_id: z.string().optional(),
  media_url: z.string().url("Введите корректную ссылку"),
  reveal_animation_file: z.instanceof(File).optional().or(z.null()), // Новое поле для файла
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
  telegramGiftId: z.string().optional(),
  mediaUrl: z.string().url("Введите корректную ссылку"),
  revealAnimationFile: z.instanceof(File).optional().or(z.null()),
  deleteRevealAnimation: z.boolean().optional(),
  price: z.number().min(1, "Цена должна быть больше 0"),
  quantity: z.number().min(1, "Количество должно быть больше 0"),
  backdropVariant: z.enum(["YELLOW", "BLUE"], {
    message: "Выберите цвет фона",
  }),
  tags: z.array(z.string()),
  specialOffer: z.boolean(),
});

export type EditGiftFormData = z.infer<typeof editGiftSchema>;
