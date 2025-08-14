"use client";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import FileUpload from "@/components/ui/file-upload";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateGiftFormData, createGiftSchema } from "@/lib/types/gift";

export interface CreateGiftFormRef {
  submitForm: () => void;
  resetForm: () => void;
}

interface CreateGiftFormProps {
  onSubmit: (data: CreateGiftFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const CreateGiftForm = forwardRef<CreateGiftFormRef, CreateGiftFormProps>(
  ({ onSubmit, onValidationChange }, ref) => {
    const skillOptions = [
      { value: "nft", label: "NFT" },
      { value: "special", label: "Special" },
      { value: "limited", label: "Limited", disabled: true },
    ];

    const backdropOptions = [
      { value: "yellow", label: "Желтый" },
      { value: "blue", label: "Синий" },
    ];

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      reset,
    } = useForm<CreateGiftFormData>({
      resolver: zodResolver(createGiftSchema),
      mode: "onChange",
      defaultValues: {
        name: "",
        description: "",
        telegram_gift_id: undefined,
        media_url: "",
        reveal_animation_file: null,
        price: 0,
        quantity: 1000000,
        backdrop_variant: "yellow",
        tags: [],
        special_offer: false,
      },
    });

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

    const handleFormSubmit = (data: CreateGiftFormData) => {
      console.log("📝 [FORM] Данные формы подарка:", {
        ...data,
        reveal_animation_file: data.reveal_animation_file
          ? {
              name: data.reveal_animation_file.name,
              size: data.reveal_animation_file.size,
              type: data.reveal_animation_file.type,
            }
          : null,
      });
      onSubmit(data);
    };

    return (
      <div>
        <form id="create-gift-form" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="flex flex-col gap-6">
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
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Название *"
                      placeholder="Например: Heart Locker"
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
                      label="Описание *"
                      placeholder="Опишите ваш подарок..."
                      error={errors.description?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="telegram_gift_id"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Telegram ID"
                      placeholder="Введите ID подарка в Telegram"
                      error={errors.telegram_gift_id?.message}
                      {...field}
                    />
                  )}
                />
              </div>
            </div>

            {/* Цена и количество */}
            <div className="bg-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">💰</span>
                <h3 className="text-white font-semibold text-lg">
                  Цена и количество
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="price"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Input
                      label="Цена *"
                      placeholder="100"
                      type="number"
                      error={errors.price?.message}
                      {...field}
                      value={value.toString()}
                      onChange={(e) => onChange(Number(e.target.value))}
                    />
                  )}
                />

                <Controller
                  name="quantity"
                  control={control}
                  render={({ field: { onChange, value, ...field } }) => (
                    <Input
                      label="Количество *"
                      placeholder="50"
                      type="number"
                      error={errors.quantity?.message}
                      {...field}
                      value={value.toString()}
                      onChange={(e) => onChange(Number(e.target.value))}
                    />
                  )}
                />
              </div>
            </div>

            {/* Медиа и стиль */}
            <div className="bg-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🎨</span>
                <h3 className="text-white font-semibold text-lg">
                  Медиа и стиль
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                <Controller
                  name="media_url"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Медиафайл *"
                      placeholder="Ссылка на изображение или tgs"
                      error={errors.media_url?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="reveal_animation_file"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <FileUpload
                      label="Анимация открытия"
                      accept=".tgs"
                      placeholder="Выберите TGS файл"
                      error={errors.reveal_animation_file?.message}
                      onChange={onChange}
                      value={value || null}
                      description="Поддерживается только формат .tgs"
                    />
                  )}
                />

                <Controller
                  name="backdrop_variant"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={backdropOptions}
                      label="Цвет фона"
                      placeholder="Выберите фон"
                      error={errors.backdrop_variant?.message}
                      onChange={onChange}
                      value={value}
                    />
                  )}
                />
              </div>
            </div>

            {/* Дополнительные настройки */}
            <div className="bg-white/5 rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg">🏷️</span>
                <h3 className="text-white font-semibold text-lg">
                  Дополнительные настройки
                </h3>
              </div>

              <div className="flex flex-col gap-4">
                <Controller
                  name="tags"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <MultiSelect
                      label="Теги подарка"
                      placeholder="Выберите подходящие теги..."
                      options={skillOptions}
                      value={value}
                      onChange={onChange}
                      error={errors.tags?.message}
                    />
                  )}
                />

                <div className="pt-1">
                  <Controller
                    name="special_offer"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Checkbox
                        label="Специальное предложение"
                        checked={value}
                        onChange={onChange}
                        error={errors.special_offer?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Кнопка предпросмотра */}
            {/* <div className="pt-2 w-fit mx-auto">
              <Button type="button" variant={"ghost"} className="w-fit">
                👁️ Предпросмотр подарка
              </Button>
            </div> */}

            {/* Скрытая кнопка отправки */}
            <button type="submit" style={{ display: "none" }} />
          </div>
        </form>
      </div>
    );
  }
);

CreateGiftForm.displayName = "CreateGiftForm";

export default CreateGiftForm;
