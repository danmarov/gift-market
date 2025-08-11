"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import FileUpload from "@/components/ui/file-upload";

// Схема валидации для призов демо-рулетки (при редактировании файл не обязателен)
const createDemoPrizeSchema = z.object({
  name: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  mediaFile: z.instanceof(File).optional().or(z.null()),
});

export type CreateDemoPrizeFormData = z.infer<typeof createDemoPrizeSchema>;

export interface CreateDemoPrizeFormRef {
  submitForm: () => void;
  resetForm: () => void;
  isValid: boolean;
}

interface InitialData {
  name?: string;
  description?: string;
  mediaUrl?: string;
}

interface CreateDemoPrizeFormProps {
  onSubmit: (data: CreateDemoPrizeFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
  initialData?: InitialData;
}

const CreateDemoPrizeForm = forwardRef<
  CreateDemoPrizeFormRef,
  CreateDemoPrizeFormProps
>(({ onSubmit, onValidationChange, initialData }, ref) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
  } = useForm<CreateDemoPrizeFormData>({
    resolver: zodResolver(createDemoPrizeSchema),
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      mediaFile: null,
    },
  });

  // Обновляем форму при изменении initialData
  useEffect(() => {
    if (initialData) {
      reset({
        name: initialData.name || "",
        description: initialData.description || "",
        mediaFile: null,
      });
    }
  }, [initialData, reset]);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(onSubmit)();
    },
    resetForm: () => {
      reset();
    },
    isValid,
  }));

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const handleFormSubmit = (data: CreateDemoPrizeFormData) => {
    console.log("📝 [FORM] Данные формы:", {
      name: data.name,
      description: data.description,
      mediaFile: data.mediaFile
        ? {
            name: data.mediaFile.name,
            size: data.mediaFile.size,
            type: data.mediaFile.type,
          }
        : null,
    });
    onSubmit(data);
  };

  return (
    <div>
      <form
        id="create-demo-prize-form"
        onSubmit={handleSubmit(handleFormSubmit)}
      >
        <div className="flex flex-col gap-6">
          {/* Основная информация */}
          <div className="bg-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📝</span>
              <h3 className="text-white font-semibold text-lg">
                Информация о призе
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Название приза *"
                    placeholder="Например: Медведь"
                    error={errors.name?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Textarea
                    label="Описание"
                    placeholder="Милый медведь в подарок! Выполняйте задания..."
                    error={errors.description?.message}
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          {/* Медиафайл */}
          <div className="bg-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">🎬</span>
              <h3 className="text-white font-semibold text-lg">
                Анимация приза
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <Controller
                name="mediaFile"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <FileUpload
                    label="Файл анимации"
                    accept=".tgs"
                    placeholder={
                      initialData?.mediaUrl
                        ? `Текущий: ${initialData.mediaUrl}`
                        : "Выберите TGS файл"
                    }
                    error={errors.mediaFile?.message}
                    onChange={onChange}
                    value={value || null} // Исправление TypeScript ошибки
                    description="Поддерживается только формат .tgs (Telegram стикер). Оставьте пустым, чтобы не менять файл."
                  />
                )}
              />
            </div>
          </div>

          {/* Скрытая кнопка отправки */}
          <button type="submit" style={{ display: "none" }} />
        </div>
      </form>
    </div>
  );
});

CreateDemoPrizeForm.displayName = "CreateDemoPrizeForm";

export default CreateDemoPrizeForm;
