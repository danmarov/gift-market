// app/admin/tasks/edit/[id]/page.tsx
import EditTaskPageWrapper from "@/components/features/admin/task/edit/edit-page-wrapper";
import { editTask } from "@/lib/actions/admin/edit-task";
import { findTaskById } from "@/lib/actions/task/find-task-by-id";
// import { editTaskAction } from "@/lib/actions/admin/edit-task";
import { EditTaskFormData } from "@/lib/types/task";
import { notFound } from "next/navigation";
import React from "react";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;

  const result = await findTaskById(id);

  if (!result.success) {
    return notFound();
  }
  if (result.success && !result.data) return notFound();

  // Server action wrapper
  const handleEditTask = async (data: EditTaskFormData) => {
    "use server";

    console.log("🔍 [SERVER] Received edit data:", data);

    const editData = {
      id: result!.data!.id,
      type: data.type,
      duration: data.duration,
      title: data.title,
      description: data.description,
      reward: data.reward,
      icon: data.icon,
      channelUrl: data.channel_url,
      chatId: data.chat_id,
      startsAt: data.starts_at,
      maxCompletions: data.max_completions,
      isActive: data.is_active,
      isVisible: data.is_visible,
    };

    console.log("🔍 [SERVER] Prepared editData:", editData);

    return await editTask(editData);
  };

  return (
    <EditTaskPageWrapper task={result.data!} onEditTask={handleEditTask} />
  );
}
