// components/features/lootbox/lootbox-tasks-wrapper.tsx
"use client";

import React, { useTransition } from "react";
import LootBoxTasksList from "./lootbox-tasks-list";
import { LootBoxTask } from "@/lib/types/lootbox";
import { useRouter } from "next/navigation";

interface LootBoxTasksWrapperProps {
  initialData?: LootBoxTask[];
  error?: string;
  onDelete?: (
    formData: FormData
  ) => Promise<{ success: boolean; error?: string; message?: string }>;
}

export default function LootBoxTasksWrapper({
  initialData,
  error,
  onDelete,
}: LootBoxTasksWrapperProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleEditLootBoxTask = (task: LootBoxTask) => {
    // console.log("Редактируем LootBox задачу:", task);
    router.push(`/admin/lootbox-task/edit/${task.id}`);
  };

  return (
    <LootBoxTasksList
      initialData={initialData}
      error={error}
      onEdit={handleEditLootBoxTask}
      onDelete={onDelete}
      isPending={isPending}
    />
  );
}
