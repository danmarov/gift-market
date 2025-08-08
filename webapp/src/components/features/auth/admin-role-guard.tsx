"use client";

import { PropsWithChildren } from "react";
import { useAuth } from "./hooks/use-auth";
import { notFound } from "next/navigation";

export function AdminRoleGuard({ children }: PropsWithChildren) {
  const { user } = useAuth(); // user уже точно есть, т.к. прошли AuthGuard

  if (user?.role !== "ADMIN") {
    notFound(); // Мгновенно показывает /not-found страницу
  }

  return <>{children}</>;
}
