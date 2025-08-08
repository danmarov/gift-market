"use client";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTaskFormData, createTaskSchema } from "@/lib/types/task";

export interface CreateTaskFormRef {
  submitForm: () => void;
  resetForm: () => void;
}

interface CreateTaskFormProps {
  onSubmit: (data: CreateTaskFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const CreateTaskForm = forwardRef<CreateTaskFormRef, CreateTaskFormProps>(
  ({ onSubmit, onValidationChange }, ref) => {
    const typeOptions = [
      { value: "TELEGRAM_SUBSCRIPTION", label: "Подписка на Telegram канал" },
      //   { value: "DAILY_BONUS", label: "Ежедневный бонус", disabled: true },
      {
        value: "TIKTOK_COMMENT",
        label: "Комментарий в Tiktok",
        disabled: true,
      },
    ];

    const durationOptions = [
      { value: "ONE_DAY", label: "1 день (Ежедневные)" },
      { value: "ONE_WEEK", label: "7 дней (Одноразовые)" },
      { value: "ONE_MONTH", label: "30 дней (Одноразовые)" },
    ];

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
      watch,
    } = useForm<CreateTaskFormData>({
      resolver: zodResolver(createTaskSchema),
      mode: "onChange",
      defaultValues: {
        type: "TELEGRAM_SUBSCRIPTION",
        duration: "ONE_DAY",
        title: "",
        description: "",
        reward: 10,
        icon: "telegram",
        channel_url: "",
        chat_id: "",
        starts_at: undefined,
      },
    });

    const taskType = watch("type");

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
        <form id="create-task-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-6">
            {/* Тип и продолжительность */}
            <div className="bg-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">⚙️</span>
                <h3 className="text-white font-semibold text-lg">
                  Тип задания
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <Controller
                  name="type"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={typeOptions}
                      label="Тип задания *"
                      placeholder="Выберите тип"
                      error={errors.type?.message}
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />

                <Controller
                  name="duration"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={durationOptions}
                      label="Продолжительность *"
                      placeholder="Выберите срок"
                      error={errors.duration?.message}
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />
              </div>
            </div>

            {/* Основная информация */}
            <div className="bg-white/5 rounded-2xl">
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
                      placeholder="Например: Подпишитесь на канал"
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
                      label="Описание *"
                      placeholder="+10 звёзд"
                      error={errors.description?.message}
                      {...field}
                    />
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Controller
                    name="reward"
                    control={control}
                    render={({ field: { onChange, value, ...field } }) => (
                      <Input
                        label="Награда (звёзд) *"
                        placeholder="10"
                        type="number"
                        error={errors.reward?.message}
                        {...field}
                        value={value?.toString() || ""}
                        onChange={(e) => onChange(Number(e.target.value))}
                      />
                    )}
                  />

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
                </div>
              </div>
            </div>

            {/* Настройки для Telegram подписки */}
            {taskType === "TELEGRAM_SUBSCRIPTION" && (
              <div className="bg-white/5 rounded-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-lg">📱</span>
                  <h3 className="text-white font-semibold text-lg">
                    Настройки Telegram
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
                        label="Chat ID канала *"
                        placeholder="-1001234567890"
                        error={errors.chat_id?.message}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            )}

            {/* Дополнительные настройки */}
            <div className="bg-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎯</span>
                <h3 className="text-white font-semibold text-lg">
                  Дополнительно
                </h3>
              </div>

              <Controller
                name="max_completions"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Input
                    label="Лимит выполнений"
                    placeholder="Оставьте пустым для безлимита"
                    type="number"
                    error={errors.max_completions?.message}
                    {...field}
                    value={value?.toString() || ""}
                    onChange={(e) =>
                      onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                  />
                )}
              />
            </div>
            <div className="bg-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">⏰</span>
                <h3 className="text-white font-semibold text-lg">
                  Время запуска
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                <Controller
                  name="starts_at"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      label="Дата и время старта"
                      type="datetime-local"
                      placeholder="Оставьте пустым для немедленного старта"
                      error={errors.starts_at?.message}
                      value={value ? value.toISOString().slice(0, 16) : ""}
                      onChange={(e) =>
                        onChange(
                          e.target.value ? new Date(e.target.value) : undefined
                        )
                      }
                    />
                  )}
                />

                <p className="text-white/60 text-sm">
                  💡 Если не указано - задание станет доступно сразу после
                  создания
                </p>
              </div>
            </div>
            <button type="submit" style={{ display: "none" }} />
          </div>
        </form>
      </div>
    );
  }
);

CreateTaskForm.displayName = "CreateTaskForm";

export default CreateTaskForm;
