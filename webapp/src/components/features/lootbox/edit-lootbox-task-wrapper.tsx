// components/features/lootbox/edit-lootbox-task-wrapper.tsx
"use client";

import TelegramBackButton from "@/components/common/telegram-back-button";
import EditLootBoxTaskForm, {
  EditLootBoxTaskFormRef,
  EditLootBoxTaskFormData,
} from "./edit-lootbox-task-form";
import MainLayout from "@/components/layout/main-layout";
import ActionButton from "@/components/ui/action-button";
import showToast from "@/components/ui/custom-toast";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { LootBoxTask } from "@/lib/types/lootbox";

interface EditLootBoxTaskWrapperProps {
  task: LootBoxTask;
  onEditTask: (data: EditLootBoxTaskFormData) => Promise<any>;
}

export default function EditLootBoxTaskWrapper({
  task,
  onEditTask,
}: EditLootBoxTaskWrapperProps) {
  const formRef = useRef<EditLootBoxTaskFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (data: EditLootBoxTaskFormData) => {
    console.log("📝 [CLIENT] Edit LootBox task form submitted:", data);
    console.log("📋 [CLIENT] Original task:", task);

    startTransition(async () => {
      try {
        const result = await onEditTask(data);

        if (!result.success) {
          hapticFeedback("error");
          showToast.error(result.error || "Произошла ошибка при сохранении");
          console.error("❌ [CLIENT] Edit error:", result.error);
          return;
        }

        hapticFeedback("success");
        showToast.success("Задача успешно обновлена");
        router.push("/tasks");

        console.log("✅ [CLIENT] LootBox task updated successfully");
      } catch (error) {
        console.error("❌ [CLIENT] Edit LootBox task error:", error);
        hapticFeedback("error");
        showToast.error("Произошла ошибка при сохранении");
      }
    });
  };

  const handleEditTask = () => {
    console.log("🖱️ [CLIENT] Edit LootBox task button clicked");
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
        Редактировать задачу для подарков
      </h1>
      <p className="text-white/70 text-sm mb-6">
        Внесите необходимые изменения в задание
      </p>

      <EditLootBoxTaskForm
        ref={formRef}
        task={task}
        onSubmit={handleSubmit}
        onValidationChange={setIsFormValid}
      />
    </MainLayout>
  );
}
