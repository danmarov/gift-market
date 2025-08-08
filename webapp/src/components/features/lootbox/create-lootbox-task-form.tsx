// components/features/lootbox/create-lootbox-task-form.tsx
"use client";

import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import { z } from "zod";

// Схема валидации для LootBox задач
const createLootBoxTaskSchema = z.object({
  title: z.string().min(1, "Название обязательно"),
  description: z.string().optional(),
  icon: z.string().min(1, "Иконка обязательна"),
  channel_url: z.string().url("Введите корректную ссылку"),
  chat_id: z.string().optional(),
  sort_order: z.number().min(0, "Порядок не может быть отрицательным"),
  is_active: z.boolean(),
});

export type CreateLootBoxTaskFormData = z.infer<typeof createLootBoxTaskSchema>;

export interface CreateLootBoxTaskFormRef {
  submitForm: () => void;
  resetForm: () => void;
}

interface CreateLootBoxTaskFormProps {
  onSubmit: (data: CreateLootBoxTaskFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const CreateLootBoxTaskForm = forwardRef<
  CreateLootBoxTaskFormRef,
  CreateLootBoxTaskFormProps
>(({ onSubmit, onValidationChange }, ref) => {
  const iconOptions = [
    { value: "telegram", label: "📱 Telegram" },
    { value: "youtube", label: "📺 YouTube" },
    { value: "instagram", label: "📷 Instagram" },
    { value: "twitter", label: "🐦 Twitter" },
    { value: "tiktok", label: "🎵 TikTok" },
  ];

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<CreateLootBoxTaskFormData>({
    resolver: zodResolver(createLootBoxTaskSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      icon: "telegram",
      channel_url: "",
      chat_id: "",
      sort_order: 1,
      is_active: true,
    },
  });

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(onSubmit)();
    },
    resetForm: () => {
      reset();
    },
  }));

  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  return (
    <div>
      <form id="create-lootbox-task-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          {/* Основная информация */}
          <div className="bg-white/5 rounded-2xl ">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📝</span>
              <h3 className="text-white font-semibold text-lg">
                Основная информация
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <Controller
                name="title"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Название *"
                    placeholder="Например: Подпишитесь на канал Tech News"
                    error={errors.title?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Описание"
                    placeholder="Подписка на канал с новостями технологий"
                    error={errors.description?.message}
                    {...field}
                  />
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="icon"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={iconOptions}
                      label="Иконка *"
                      placeholder="Выберите иконку"
                      error={errors.icon?.message}
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />

                <Controller
                  name="sort_order"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Input
                      label="Порядок отображения *"
                      placeholder="1"
                      type="number"
                      error={errors.sort_order?.message}
                      {...field}
                      value={value?.toString() || ""}
                      onChange={(e) => onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Настройки канала */}
          <div className="bg-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">📱</span>
              <h3 className="text-white font-semibold text-lg">
                Настройки канала
              </h3>
            </div>

            <div className="flex flex-col gap-4">
              <Controller
                name="channel_url"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Ссылка на канал *"
                    placeholder="https://t.me/yourchannel"
                    error={errors.channel_url?.message}
                    {...field}
                  />
                )}
              />

              <Controller
                name="chat_id"
                control={control}
                render={({ field }) => (
                  <Input
                    label="Chat ID канала"
                    placeholder="-1001234567890"
                    error={errors.chat_id?.message}
                    {...field}
                  />
                )}
              />
            </div>
          </div>

          {/* Статус */}
          <div className="bg-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚙️</span>
              <h3 className="text-white font-semibold text-lg">
                Статус задачи
              </h3>
            </div>

            <Controller
              name="is_active"
              control={control}
              render={({ field: { onChange, value } }) => (
                <Select
                  options={[
                    { value: "true", label: "Активно" },
                    { value: "false", label: "Неактивно" },
                  ]}
                  label="Статус *"
                  placeholder="Выберите статус"
                  error={errors.is_active?.message}
                  onChange={(val) => onChange(val === "true")}
                  value={value?.toString()}
                />
              )}
            />

            <p className="text-white/60 text-sm mt-2">
              💡 Неактивные задачи не будут показываться пользователям
            </p>
          </div>

          <button type="submit" style={{ display: "none" }} />
        </div>
      </form>
    </div>
  );
});

CreateLootBoxTaskForm.displayName = "CreateLootBoxTaskForm";

export default CreateLootBoxTaskForm;
