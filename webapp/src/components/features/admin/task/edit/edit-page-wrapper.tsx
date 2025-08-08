"use client";
import TelegramBackButton from "@/components/common/telegram-back-button";
import EditTaskForm, {
  EditTaskFormRef,
} from "@/components/features/admin/task/edit/edit-task-form";
import { useAuth } from "@/components/features/auth/hooks/use-auth";
import MainLayout from "@/components/layout/main-layout";
import ActionButton from "@/components/ui/action-button";
import showToast from "@/components/ui/custom-toast";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { EditTaskFormData } from "@/lib/types/task";
import { TaskWithUserStatus } from "@/lib/types/task";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

interface EditTaskPageWrapperProps {
  task: TaskWithUserStatus;
  onEditTask: (data: EditTaskFormData) => Promise<any>;
}

export default function EditTaskPageWrapper({
  task,
  onEditTask,
}: EditTaskPageWrapperProps) {
  const { user } = useAuth();

  const formRef = useRef<EditTaskFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSubmit = async (data: EditTaskFormData) => {
    console.log("📝 [CLIENT] Edit task form submitted:", data);
    console.log("📋 [CLIENT] Original task:", task);

    startTransition(async () => {
      try {
        const result = await onEditTask(data);

        if (!result.success) {
          hapticFeedback("error");
          showToast.error(result.error || "Произошла ошибка при сохранении");
          console.error("❌ [CLIENT] Edit error:", result.error);
          if (result.fieldErrors) {
            console.log("🔥 [CLIENT] Field errors:", result.fieldErrors);
          }
          return;
        }

        hapticFeedback("success");
        showToast.success("Задание успешно обновлено");
        await queryClient.invalidateQueries({ queryKey: ["tasks", user!.id] });
        router.push("/tasks");

        console.log("✅ [CLIENT] Task updated successfully");
      } catch (error) {
        console.error("❌ [CLIENT] Edit task error:", error);
        hapticFeedback("error");
        showToast.error("Произошла ошибка при сохранении");
      }
    });
  };

  const handleEditTask = () => {
    console.log("🖱️ [CLIENT] Edit button clicked");
    if (formRef.current) {
      console.log("Submitting edit form...");
      formRef.current.submitForm();
    }
  };

  return (
    <MainLayout
      bottomBar={
        <ActionButton
          onClick={handleEditTask}
          disabled={!isFormValid}
          isLoading={isPending}
        >
          {isPending ? "Сохраняем..." : "Сохранить изменения"}
        </ActionButton>
      }
    >
      <TelegramBackButton />
      <h1 className="text-white text-2xl font-sans mb-4">
        Редактировать задание
      </h1>
      <p className="text-white/70 text-sm mb-6">
        Внесите необходимые изменения в задание
      </p>

      <EditTaskForm
        ref={formRef}
        task={task}
        onSubmit={handleSubmit}
        onValidationChange={setIsFormValid}
      />
    </MainLayout>
  );
}
