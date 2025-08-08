"use server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { JWTSessionSchema, type JWTSession } from "@/lib/types/session";

export async function getSessionFromJWT(): Promise<JWTSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) return null;

    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(sessionToken, secret);

    // Валидируем payload через Zod
    const validationResult = JWTSessionSchema.safeParse(payload);

    if (!validationResult.success) {
      console.error("Invalid JWT payload:", validationResult.error);
      return null;
    }

    return validationResult.data;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}
