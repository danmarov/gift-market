// app/admin/tasks/edit/[id]/page.tsx
import EditTaskPageWrapper from "@/components/features/admin/task/edit/edit-page-wrapper";
import { editTask } from "@/lib/actions/admin/edit-task";
import { findTaskById } from "@/lib/actions/task/find-task-by-id";
// import { editTaskAction } from "@/lib/actions/admin/edit-task";
import { EditTaskFormData } from "@/lib/types/task";
import React from "react";

interface EditTaskPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params;

  // Теперь findTaskById обернута в withServerAuth, поэтому автоматически получит session
  const result = await findTaskById(id);

  if (!result.success) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <h2 className="text-xl font-semibold mb-2">Ошибка</h2>
          <p className="text-white/70">{result.error}</p>
        </div>
      </div>
    );
  }
  if (result.success && !result.data) return <></>;

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
