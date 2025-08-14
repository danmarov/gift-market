"use client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkSession } from "@/lib/actions/auth/check-session";
import { authenticateWithInitData } from "@/lib/actions/auth/authenticate-with-init-data";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export const AUTH_QUERY_KEY = ["auth", "user"] as const;

export function useAuth() {
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();

  // Проверяем что мы на клиенте
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Получаем rawInitData напрямую из window после монтирования
  const rawInitData = useMemo(() => {
    if (!isMounted || typeof window === "undefined") return null;

    // Пробуем разные источники данных
    // @ts-ignore
    const webAppInitData = window.Telegram?.WebApp?.initData;

    // Проверяем что данные не пустые
    if (webAppInitData && webAppInitData.trim() !== "") {
      return webAppInitData;
    }

    // Если WebApp данных нет, можно попробовать из URL
    const urlParams = new URLSearchParams(window.location.search);
    const tgWebAppData = urlParams.get("tgWebAppData");

    if (tgWebAppData && tgWebAppData.trim() !== "") {
      return tgWebAppData;
    }

    return null;
  }, [isMounted]);

  const telegramIdFromInitData = useMemo(() => {
    if (!rawInitData || !isMounted) return null;

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
  }, [rawInitData, isMounted]);

  const authQuery = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: async () => {
      console.log("🔐 Starting authentication flow...");
      console.log("📱 rawInitData:", !!rawInitData);
      console.log("👤 telegramIdFromInitData:", telegramIdFromInitData);

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
    enabled: isMounted && (!!rawInitData || typeof window === "undefined"), // 🔥 Работает на сервере тоже
    staleTime: 30 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    refetchInterval: 2 * 60 * 1000,
    refetchIntervalInBackground: false,
  });

  // Проверка онбординга
  useEffect(() => {
    if (!isMounted) return;

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
    isMounted,
  ]);

  // Функции для управления - БЕЗ useCallback чтобы избежать циклов
  const refetchUser = () => authQuery.refetch();

  const invalidateUser = () => {
    queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
  };

  const updateUser = (updater: (oldUser: any) => any) => {
    queryClient.setQueryData(AUTH_QUERY_KEY, updater);
  };

  // Если не смонтирован - показываем загрузку
  if (!isMounted) {
    return {
      user: null,
      isLoading: true,
      error: null,
      isError: false,
      refetchUser,
      invalidateUser,
      updateUser,
    };
  }

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
