"use client";

import { PropsWithChildren } from "react";
import { useAuth } from "./hooks/use-auth";
import { notFound } from "next/navigation";
import LoadingScreen from "@/components/common/loading-screen";

export function AdminRoleGuard({ children }: PropsWithChildren) {
  const { user, isLoading } = useAuth();

  // ✅ Ждем пока загрузится
  if (isLoading || !user) {
    return <LoadingScreen />;
  }

  // ✅ Проверяем роль только после загрузки
  if (user.role !== "ADMIN") {
    notFound();
  }

  return <>{children}</>;
}
