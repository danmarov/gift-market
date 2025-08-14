"use client";
import Input from "@/components/ui/input";
import Select from "@/components/ui/select";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditTaskFormData, editTaskSchema } from "@/lib/types/task";
import { TaskWithUserStatus } from "@/lib/types/task";

export interface EditTaskFormRef {
  submitForm: () => void;
  resetForm: () => void;
}

interface EditTaskFormProps {
  task: TaskWithUserStatus;
  onSubmit: (data: EditTaskFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const EditTaskForm = forwardRef<EditTaskFormRef, EditTaskFormProps>(
  ({ task, onSubmit, onValidationChange }, ref) => {
    const typeOptions = [
      { value: "TELEGRAM_SUBSCRIPTION", label: "Подписка на Telegram канал" },
      { value: "FREE_BONUS", label: "Бесплатный бонус", disabled: false },
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
      { value: "gift", label: "🎁 Подарок" },
      { value: "twitter", label: "🐦 Twitter" },
      { value: "tiktok", label: "🎵 TikTok" },
    ];

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      reset,
      watch,
    } = useForm<EditTaskFormData>({
      resolver: zodResolver(editTaskSchema),
      mode: "onChange",
      defaultValues: {
        type: task.type || "TELEGRAM_SUBSCRIPTION",
        duration: task.duration || "ONE_DAY",
        title: task.title || "",
        description: task.description || "",
        reward: task.reward || 10,
        icon: task.icon || "telegram",
        channel_url: task.metadata?.channelUrl || "",
        chat_id: task.metadata?.chatId || "",
        starts_at: task.startsAt ? new Date(task.startsAt) : undefined,
        max_completions: task.maxCompletions || undefined,
        is_active: task.isActive ?? true,
        is_visible: task.isVisible ?? true,
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
        <form id="edit-task-form" onSubmit={handleSubmit(onSubmit)}>
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
            {/* Статус и видимость */}
            <div className="bg-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">👁️</span>
                <h3 className="text-white font-semibold text-lg">
                  Статус задания
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="is_active"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={[
                        { value: "true", label: "Активно" },
                        { value: "false", label: "Неактивно" },
                      ]}
                      label="Активность *"
                      placeholder="Выберите статус"
                      error={errors.is_active?.message}
                      onChange={(val) => onChange(val === "true")}
                      value={value?.toString()}
                    />
                  )}
                />

                <Controller
                  name="is_visible"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={[
                        { value: "true", label: "Видимо" },
                        { value: "false", label: "Скрыто" },
                      ]}
                      label="Видимость *"
                      placeholder="Выберите видимость"
                      error={errors.is_visible?.message}
                      onChange={(val) => onChange(val === "true")}
                      value={value?.toString()}
                    />
                  )}
                />
              </div>
            </div>
            {/* Время запуска */}
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
                  💡 Если не указано - задание будет доступно сразу
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

EditTaskForm.displayName = "EditTaskForm";

export default EditTaskForm;
