"use client";
import TelegramBackButton from "@/components/common/telegram-back-button";
import CreateGiftForm, {
  CreateGiftFormRef,
} from "@/components/features/admin/product/create/create-gift-form";
import MainLayout from "@/components/layout/main-layout";
import ActionButton from "@/components/ui/action-button";
import showToast from "@/components/ui/custom-toast";
import { createGift } from "@/lib/actions/admin/create-gift";
import { CreateGiftFormData } from "@/lib/types/gift";
import { useRef, useState, useTransition } from "react";

export default function CreateGiftPage() {
  const formRef = useRef<CreateGiftFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPending, startTransition] = useTransition();
  const handleSubmit = async (data: CreateGiftFormData) => {
    console.log("📝 [CLIENT] Form submitted:", data);

    startTransition(async () => {
      try {
        const result = await createGift(data);

        if (result.success) {
          console.log("🎉 [CLIENT] Успешно создано:", result.data);
          showToast.success("Подарок успешно создан!");
          if (formRef.current) {
            formRef.current.resetForm();
          }
          // router.push('/admin/gifts') например
        } else {
          console.error("❌ [CLIENT] Ошибка создания:", result.error);

          // Если есть ошибки полей, можно показать их в форме
          if (result.fieldErrors) {
            console.log("🔥 [CLIENT] Ошибки полей:", result.fieldErrors);
          }
          showToast.error("Произошла ошибка");
        }
      } catch (error) {
        console.error("💥 [CLIENT] Неожиданная ошибка:", error);
        showToast.error("Произошла ошибка");
      }
    });
  };

  const handleCreateGift = () => {
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
          onClick={handleCreateGift}
          disabled={!isFormValid}
          isLoading={isPending}
        >
          Создать подарок
        </ActionButton>
      }
    >
      <TelegramBackButton />
      <h1 className="text-white text-2xl font-sans mb-4">Заполните форму</h1>
      <CreateGiftForm
        ref={formRef}
        onSubmit={handleSubmit}
        onValidationChange={setIsFormValid}
      />
    </MainLayout>
  );
}
