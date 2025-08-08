// lib/types/session.ts
import { z } from "zod";
import { USER_ROLE_VALUES } from "./user";

export const JWTSessionSchema = z.object({
  id: z.string(),
  telegramId: z.string(),
  role: z.enum(USER_ROLE_VALUES),
  firstName: z.union([z.string(), z.null()]).optional(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

export type JWTSession = z.infer<typeof JWTSessionSchema>;
