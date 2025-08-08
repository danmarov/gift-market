import {
  updateGift as updateGiftDb,
  UpdateGiftData,
  Gift,
  Prisma,
} from "database";
import { JWTSession } from "@/lib/types/session";
import { editGiftSchema } from "@/lib/types/gift";
import { withServerAuth } from "../auth/with-server-auth";
import { ZodError } from "zod";

export type EditGiftResult =
  | { success: true; data: Gift }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

async function _editGift(
  session: JWTSession,
  formData: UpdateGiftData & { id: string }
): Promise<EditGiftResult> {
  try {
    const validatedData = editGiftSchema.parse(formData);
    const updatedGift = await updateGiftDb(formData.id, validatedData);
    return { success: true, data: updatedGift };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        error: "Validation failed",
        fieldErrors: error.flatten().fieldErrors,
      };
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return { success: false, error: "Gift not found" };
      }
    }

    console.error("Unexpected error in _editGift:", error);
    return { success: false, error: "Failed to update gift" };
  }
}

export const editGift = withServerAuth(_editGift, { requireRole: "ADMIN" });
