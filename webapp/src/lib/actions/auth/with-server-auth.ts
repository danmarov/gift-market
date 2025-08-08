// lib/auth/with-server-auth.ts
import { JWTSession } from "@/lib/types/session";
import { getSessionFromJWT } from "./get-session";
import type { UserRole } from "@/lib/types/user";

export function withServerAuth<T extends any[], R>(
  action: (session: JWTSession, ...args: T) => Promise<R>,
  options: {
    requireRole?: UserRole | UserRole[];
  } = {}
) {
  return async (...args: T): Promise<R> => {
    const session = await getSessionFromJWT();

    if (!session) {
      throw new Error("Authentication required");
    }

    // Проверка ролей если они указаны
    if (options.requireRole) {
      const allowedRoles = Array.isArray(options.requireRole)
        ? options.requireRole
        : [options.requireRole];

      if (!allowedRoles.includes(session.role)) {
        throw new Error(`Access denied. Contact Support`);
      }
    }

    return action(session, ...args);
  };
}
