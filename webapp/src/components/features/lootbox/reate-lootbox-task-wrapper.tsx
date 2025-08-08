// components/features/lootbox/create-lootbox-task-wrapper.tsx
"use client";

import TelegramBackButton from "@/components/common/telegram-back-button";
import CreateLootBoxTaskForm, {
  CreateLootBoxTaskFormRef,
  CreateLootBoxTaskFormData,
} from "./create-lootbox-task-form";
import MainLayout from "@/components/layout/main-layout";
import ActionButton from "@/components/ui/action-button";
import showToast from "@/components/ui/custom-toast";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

interface CreateLootBoxTaskWrapperProps {
  onCreateTask: (data: CreateLootBoxTaskFormData) => Promise<any>;
}

export default function CreateLootBoxTaskWrapper({
  onCreateTask,
}: CreateLootBoxTaskWrapperProps) {
  const formRef = useRef<CreateLootBoxTaskFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (data: CreateLootBoxTaskFormData) => {
    console.log("📝 [CLIENT] LootBox task form submitted:", data);

    startTransition(async () => {
      try {
        const result = await onCreateTask(data);

        if (result.success) {
          console.log("🎉 [CLIENT] LootBox task created:", result.data);
          showToast.success(
            result.message || "Задача для подарков успешно создана"
          );
          if (formRef.current) {
            formRef.current.resetForm();
          }
          hapticFeedback("success");
          router.push("/tasks");
        } else {
          console.error("❌ [CLIENT] Error:", result.error);
          showToast.error(result.error || "Произошла ошибка");
          hapticFeedback("error");
        }
      } catch (error) {
        console.error("💥 [CLIENT] Ошибка создания LootBox задачи:", error);
        showToast.error("Произошла ошибка");
        hapticFeedback("error");
      }
    });
  };

  const handleCreateTask = () => {
    console.log("🖱️ [CLIENT] Кнопка создания LootBox задачи нажата");
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
          {isPending ? "Создаем..." : "Создать задачу"}
        </ActionButton>
      }
    >
      <TelegramBackButton />
      <h1 className="text-white text-2xl font-sans mb-4">
        Задание для получения подарков
      </h1>
      <p className="text-white/70 text-sm mb-6">
        Создайте задание, которое пользователи должны выполнить для получения
        выигранных подарков
      </p>

      <CreateLootBoxTaskForm
        ref={formRef}
        onSubmit={handleSubmit}
        onValidationChange={setIsFormValid}
      />
    </MainLayout>
  );
}
