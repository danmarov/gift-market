"use client";
import TelegramBackButton from "@/components/common/telegram-back-button";
import EditGiftForm, {
  EditGiftFormRef,
} from "@/components/features/admin/product/edit/edit-gift-form";
import MainLayout from "@/components/layout/main-layout";
import ActionButton from "@/components/ui/action-button";
import showToast from "@/components/ui/custom-toast";
import { hapticFeedback } from "@/lib/haptic-feedback";
import { EditGiftFormData } from "@/lib/types/gift";
import { Gift } from "database";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

interface EditPageWrapperProps {
  gift: Gift;
  onEditGift: (data: EditGiftFormData) => Promise<any>;
}

export default function EditPageWrapper({
  gift,
  onEditGift,
}: EditPageWrapperProps) {
  const formRef = useRef<EditGiftFormRef>(null);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSubmit = async (data: EditGiftFormData) => {
    console.log("📝 [CLIENT] Edit form submitted:", data);
    console.log("🎁 [CLIENT] Original gift:", gift);

    startTransition(async () => {
      try {
        // TODO: Здесь будет реальная отправка на сервер
        const result = await onEditGift(data);
        // Имитация задержки
        if (!result.success) {
          hapticFeedback("error");
          showToast.error(result.error);
          return;
        }
        hapticFeedback("success");
        router.push(`/gift/${gift.id}`);

        console.log("✅ [CLIENT] Edit completed successfully");
      } catch (error) {
        console.error("❌ [CLIENT] Edit error:", error);
      }
    });
  };

  const handleEditGift = () => {
    console.log("EDIT CLICK");
    if (formRef.current) {
      console.log("Submitting edit form...");
      formRef.current.submitForm();
    }
  };

  return (
    <MainLayout
      bottomBar={
        <ActionButton
          onClick={handleEditGift}
          disabled={!isFormValid}
          isLoading={isPending}
        >
          Сохранить изменения
        </ActionButton>
      }
    >
      <TelegramBackButton />
      <h1 className="text-white text-2xl font-sans mb-4">
        Редактировать подарок
      </h1>
      <EditGiftForm
        ref={formRef}
        gift={gift}
        onSubmit={handleSubmit}
        onValidationChange={setIsFormValid}
      />
    </MainLayout>
  );
}
