// hooks/use-auth.ts
"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRawInitData } from "@telegram-apps/sdk-react";
import { checkSession } from "@/lib/actions/auth/check-session";
import { authenticateWithInitData } from "@/lib/actions/auth/authenticate-with-init-data";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export const AUTH_QUERY_KEY = ["auth", "user"] as const;

export function useAuth() {
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const pathname = usePathname();
  const rawInitData = useRawInitData();
  const queryClient = useQueryClient();
  const router = useRouter();

  const telegramIdFromInitData = useMemo(() => {
    if (!rawInitData) return null;

    try {
      const parsed = new URLSearchParams(rawInitData);
      const userParam = parsed.get("user");
      if (userParam) {
        const user = JSON.parse(userParam);
        return user.id?.toString();
      }
    } catch (error) {
      console.warn("Error parsing initData:", error);
    }
    return null;
  }, [rawInitData]);

  const authQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      console.log("🔐 Starting authentication flow...");

      const sessionResult = await checkSession(
        telegramIdFromInitData || undefined
      );

      if (sessionResult.success) {
        console.log("✅ JWT session valid");
        return sessionResult.user;
      }

      console.log("❌ JWT session invalid:", sessionResult.reason);

      if (!rawInitData) {
        throw new Error("This application only works within Telegram");
      }

      console.log("🔄 Authenticating with initData...");
      const authResult = await authenticateWithInitData(rawInitData);

      if (!authResult.success) {
        throw new Error(authResult.error || "Authentication failed");
      }

      console.log("✅ InitData authentication successful");
      return authResult.user;
    },
    enabled: true,
    staleTime: 30 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchInterval: 2 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  // Проверка онбординга
  useEffect(() => {
    // Не проверяем онбординг на самой странице онбординга
    if (pathname === "/onboarding" || pathname === "/admin/roulette") {
      setIsCheckingOnboarding(false);
      return;
    }

    // Только если есть данные пользователя
    if (authQuery.data && !authQuery.isLoading) {
      const user = authQuery.data;

      // 🚫 ADMIN минует онбординг полностью
      if (user.role === "ADMIN") {
        console.log("👑 Admin user detected - skipping onboarding");
        setIsCheckingOnboarding(false);
        return;
      }

      // Обычная проверка онбординга для не-админов
      if (user.onboardingStatus !== "COMPLETED") {
        console.log("🔄 Redirecting to onboarding...");
        setIsCheckingOnboarding(true);
        router.push("/onboarding");
      } else {
        setIsCheckingOnboarding(false);
      }
    }
  }, [
    authQuery.data?.onboardingStatus,
    authQuery.data?.role,
    authQuery.isLoading,
    pathname,
  ]);

  // Функции для управления - БЕЗ useCallback чтобы избежать циклов
  const refetchUser = () => authQuery.refetch();

  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  };

  const updateUser = (updater: (oldUser: any) => any) => {
    queryClient.setQueryData(AUTH_QUERY_KEY, updater);
  };

  return {
    user: authQuery.data ?? null,
    isLoading: authQuery.isLoading || isCheckingOnboarding,
    error: authQuery.error?.message ?? null,
    isError: authQuery.isError,
    refetchUser,
    invalidateUser,
    updateUser,
  };
}
