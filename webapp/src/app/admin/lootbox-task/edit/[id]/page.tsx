// app/admin/lootbox-task/edit/[id]/page.tsx
import EditLootBoxTaskWrapper from "@/components/features/lootbox/edit-lootbox-task-wrapper";
import { updateLootBoxTask } from "@/lib/actions/admin/update-lootbox-task";
import { getLootBoxTaskById } from "@/lib/actions/admin/get-lootbox-task-by-id";
import { EditLootBoxTaskFormData } from "@/components/features/lootbox/edit-lootbox-task-form";
import React from "react";
import { notFound } from "next/navigation";

interface EditLootBoxTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditLootBoxTaskPage({
  params,
}: EditLootBoxTaskPageProps) {
  const { id } = await params;

  // Получаем задачу по ID
  const result = await getLootBoxTaskById(id);

  if (!result.success) {
    return notFound();
  }

  if (!result.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">Задача не найдена</h2>
          <p className="text-white/70">Задача с таким ID не существует</p>
        </div>
      </div>
    );
  }

  // Server action wrapper
  const handleEditTask = async (data: EditLootBoxTaskFormData) => {
    "use server";

    console.log("🔍 [SERVER] Received edit data:", data);

    const editData = {
      id: result.data!.id,
      title: data.title,
      description: data.description,
      icon: data.icon,
      channelId: data.channel_url.split("/").pop() || "",
      chatId: data.chat_id,
      channelUrl: data.channel_url,
      sortOrder: data.sort_order,
      isActive: data.is_active,
    };

    console.log("🔍 [SERVER] Prepared editData:", editData);

    return await updateLootBoxTask(editData);
  };

  return (
    <EditLootBoxTaskWrapper task={result.data} onEditTask={handleEditTask} />
  );
}
