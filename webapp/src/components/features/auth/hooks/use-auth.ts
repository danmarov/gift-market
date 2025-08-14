"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkSession } from "@/lib/actions/auth/check-session";
import { authenticateWithInitData } from "@/lib/actions/auth/authenticate-with-init-data";
import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

export const AUTH_QUERY_KEY = ["auth", "user"] as const;

export function useAuth() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Получаем rawInitData один раз
  const rawInitData = useMemo(() => {
    if (typeof window === "undefined") return null;
    // @ts-ignore
    const webAppInitData = window.Telegram?.WebApp?.initData;
    return webAppInitData && webAppInitData.trim() !== ""
      ? webAppInitData
      : null;
  }, []);

  const telegramIdFromInitData = useMemo(() => {
    if (!rawInitData) return null;
    try {
      const parsed = new URLSearchParams(rawInitData);
      const userParam = parsed.get("user");
      if (userParam) {
        const user = JSON.parse(userParam);
        return user.id?.toString() || null;
      }
    } catch (error) {
      console.warn("Error parsing initData:", error);
    }
    return null;
  }, [rawInitData]);

  // 🔥 ПРОСТОЙ authQuery без лишних состояний
  const authQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      // Сначала проверяем JWT из кук
      const sessionResult = await checkSession(
        telegramIdFromInitData || undefined
      );

      if (sessionResult.success) {
        return sessionResult.user;
      }

      // Если JWT нет - авторизуемся через initData
      if (!rawInitData) {
        throw new Error("This application only works within Telegram");
      }

      const authResult = await authenticateWithInitData(rawInitData);
      if (!authResult.success) {
        throw new Error(authResult.error || "Authentication failed");
      }

      return authResult.user;
    },
    staleTime: 5 * 60 * 1000, // 🔥 5 минут кеша
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false, // 🔥 Не перезапрашиваем при фокусе
  });

  // 🔥 Онбординг проверяем только когда есть user
  useEffect(() => {
    if (!authQuery.data || authQuery.isLoading) return;

    const user = authQuery.data;
    const isOnboardingPage =
      pathname === "/onboarding" || pathname === "/admin/roulette";

    // ADMIN или уже на странице онбординга - ничего не делаем
    if (user.role === "ADMIN" || isOnboardingPage) return;

    // Перенаправляем если онбординг не завершен
    if (user.onboardingStatus !== "COMPLETED") {
      router.push("/onboarding");
    }
  }, [authQuery.data, authQuery.isLoading, pathname, router]);

  // Простые функции управления
  const refetchUser = () => authQuery.refetch();
  const invalidateUser = () =>
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  const updateUser = (updater: (oldUser: any) => any) => {
    queryClient.setQueryData(AUTH_QUERY_KEY, updater);
  };

  return {
    user: authQuery.data ?? null,
    isLoading: authQuery.isLoading,
    error: authQuery.error?.message ?? null,
    isError: authQuery.isError,
    refetchUser,
    invalidateUser,
    updateUser,
  };
}
