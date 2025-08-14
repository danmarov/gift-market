"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkSession } from "@/lib/actions/auth/check-session";
import { authenticateWithInitData } from "@/lib/actions/auth/authenticate-with-init-data";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export const AUTH_QUERY_KEY = ["auth", "user"] as const;

export function useAuth() {
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // 🔥 Новое состояние

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

  const authQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      const sessionResult = await checkSession(
        telegramIdFromInitData || undefined
      );

      if (sessionResult.success) {
        return sessionResult.user;
      }

      if (!rawInitData) {
        throw new Error("This application only works within Telegram");
      }

      const authResult = await authenticateWithInitData(rawInitData);
      if (!authResult.success) {
        throw new Error(authResult.error || "Authentication failed");
      }

      return authResult.user;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!authQuery.data || authQuery.isLoading) return;

    const user = authQuery.data;
    const isOnboardingPage =
      pathname === "/onboarding" || pathname === "/admin/roulette";

    // Если мы уже на нужной странице - инициализация завершена
    if (user.role === "ADMIN" || isOnboardingPage) {
      setIsNavigating(false);
      setIsInitialized(true); // 🔥 Инициализация завершена
      return;
    }

    // Если онбординг не завершен
    if (user.onboardingStatus !== "COMPLETED") {
      if (!isNavigating) {
        setIsNavigating(true);
        router.push("/onboarding");
      }
    } else {
      // Онбординг завершен и мы не на специальных страницах
      setIsInitialized(true); // 🔥 Инициализация завершена
    }
  }, [authQuery.data, authQuery.isLoading, pathname, router, isNavigating]);

  const refetchUser = () => authQuery.refetch();
  const invalidateUser = () =>
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  const updateUser = (updater: (oldUser: any) => any) => {
    queryClient.setQueryData(AUTH_QUERY_KEY, updater);
  };

  return {
    user: authQuery.data ?? null,
    isLoading: authQuery.isLoading || isNavigating || !isInitialized, // 🔥 Три условия
    error: authQuery.error?.message ?? null,
    isError: authQuery.isError,
    refetchUser,
    invalidateUser,
    updateUser,
  };
}
