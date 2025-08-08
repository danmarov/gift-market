// app/admin/lootbox-task/create/page.tsx
import { createLootBoxTask } from "@/lib/actions/admin/create-lootbox-task";
import { CreateLootBoxTaskFormData } from "@/components/features/lootbox/create-lootbox-task-form";
import React from "react";
import CreateLootBoxTaskWrapper from "@/components/features/lootbox/reate-lootbox-task-wrapper";

export default async function CreateLootBoxTaskPage() {
  // Server action wrapper
  const handleCreateTask = async (data: CreateLootBoxTaskFormData) => {
    "use server";

    console.log("🔍 [SERVER] Received create data:", data);

    // Преобразуем данные формы в формат для server action
    const taskData = {
      title: data.title,
      description: data.description,
      icon: data.icon,
      channelId: data.channel_url.split("/").pop() || "", // Извлекаем ID из URL
      chatId: data.chat_id,
      channelUrl: data.channel_url,
      sortOrder: data.sort_order,
      isActive: data.is_active,
    };

    console.log("🔍 [SERVER] Prepared taskData:", taskData);

    return await createLootBoxTask(taskData);
  };

  return <CreateLootBoxTaskWrapper onCreateTask={handleCreateTask} />;
}
