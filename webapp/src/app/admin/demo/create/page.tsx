"use client";
import TelegramBackButton from "@/components/common/telegram-back-button";
import CreateDemoPrizeForm, {
  CreateDemoPrizeFormData,
  CreateDemoPrizeFormRef,
} from "@/components/features/admin/demo/create/create-demo-prize-form";
import MainLayout from "@/components/layout/main-layout";
import ActionButton from "@/components/ui/action-button";
import showToast from "@/components/ui/custom-toast";
import { createDemoPrize } from "@/lib/actions/admin/create-demo-prize";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

export default function CreateDemoPrizePage() {
  const formRef = useRef<CreateDemoPrizeFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();
  const router = useRouter();
  const handleSubmit = async (data: CreateDemoPrizeFormData) => {
    console.log("📝 [CLIENT] Form submitted:", data);

    startTransition(async () => {
      try {
        const result = await createDemoPrize(data);

        if (result.success) {
          console.log("🎉 [CLIENT] Успешно создан демо-приз:", result.data);
          await queryClient.invalidateQueries({ queryKey: ["demo-prizes"] });
          showToast.success("Демо-приз успешно создан!");
          hapticFeedback("success");
          if (formRef.current) {
            formRef.current.resetForm();
          }
          router.push("/admin/demo");
        } else {
          console.error(
            "❌ [CLIENT] Ошибка создания демо-приза:",
            result.error
          );
          showToast.error(result.error);

          // Если есть ошибки полей, можно показать их в форме
          if (result.fieldErrors) {
            console.log("🔥 [CLIENT] Ошибки полей:", result.fieldErrors);
          }
        }
      } catch (error) {
        console.error("💥 [CLIENT] Неожиданная ошибка:", error);
        showToast.error("Произошла ошибка");
      }
    });
  };

  const handleCreateDemoPrize = () => {
    console.log("CLICK");
    if (formRef.current) {
      console.log("+");
      formRef.current.submitForm();
    }
  };

  return (
    <MainLayout
      bottomBar={
        <ActionButton
          onClick={handleCreateDemoPrize}
          disabled={!isFormValid}
          isLoading={isPending}
        >
          Создать демо-приз
        </ActionButton>
      }
    >
      <TelegramBackButton />
      <h1 className="text-white text-2xl font-sans mb-4">
        Создание демо-приза
      </h1>
      <CreateDemoPrizeForm
        ref={formRef}
        onSubmit={handleSubmit}
        onValidationChange={setIsFormValid}
      />
    </MainLayout>
  );
}
