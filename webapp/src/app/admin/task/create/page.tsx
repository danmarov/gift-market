// app/admin/tasks/create/page.tsx
"use client";
import TelegramBackButton from "@/components/common/telegram-back-button";
import CreateTaskForm, {
  CreateTaskFormRef,
} from "@/components/features/admin/task/create/create-task-form";
import MainLayout from "@/components/layout/main-layout";
import ActionButton from "@/components/ui/action-button";
import showToast from "@/components/ui/custom-toast";
import { createTaskAction } from "@/lib/actions/admin/create-task";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { CreateTaskFormData } from "@/lib/types/task";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export default function CreateTaskPage() {
  const formRef = useRef<CreateTaskFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleSubmit = async (data: CreateTaskFormData) => {
    startTransition(async () => {
      try {
        const result = await createTaskAction(data);
        if (result.success) {
          console.log("🎉 [CLIENT] Task created:", result.data);
          showToast.success(result.data?.message || "Задание упешно создано");
          if (formRef.current) {
            formRef.current.resetForm();
          }
          hapticFeedback("success");
          router.push("/tasks");
        } else {
          console.error("❌ [CLIENT] Error:", result.error);
          showToast.error(result.error || "Произошла ошибка");
          hapticFeedback("error");
          if (result.fieldErrors) {
            console.log("🔥 [CLIENT] Field errors:", result.fieldErrors);
          }
        }
      } catch (error) {
        console.error("💥 [CLIENT] Ошибка создания задания:", error);
        showToast.error("Произошла ошибка");
        hapticFeedback("error");
      }
    });
  };

  const handleCreateTask = () => {
    console.log("🖱️ [CLIENT] Кнопка создания нажата");
    if (formRef.current) {
      formRef.current.submitForm();
    }
  };

  return (
    <MainLayout
      bottomBar={
        <ActionButton
          onClick={handleCreateTask}
          disabled={!isFormValid}
          isLoading={isPending}
        >
          {isPending ? "Создаем..." : "Создать задание"}
        </ActionButton>
      }
    >
      <TelegramBackButton />
      <h1 className="text-white text-2xl font-sans mb-4">Создание задания</h1>
      <p className="text-white/70 text-sm mb-6">
        Заполните форму для создания нового задания для пользователей
      </p>

      <CreateTaskForm
        ref={formRef}
        onSubmit={handleSubmit}
        onValidationChange={setIsFormValid}
      />
    </MainLayout>
  );
}
