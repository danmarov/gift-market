"use client";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import React, { forwardRef, useEffect, useImperativeHandle } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditGiftFormData, editGiftSchema } from "@/lib/types/gift";
import { Gift } from "database";

export interface EditGiftFormRef {
  submitForm: () => void;
  resetForm: () => void;
}

interface EditGiftFormProps {
  gift: Gift;
  onSubmit: (data: EditGiftFormData) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const EditGiftForm = forwardRef<EditGiftFormRef, EditGiftFormProps>(
  ({ gift, onSubmit, onValidationChange }, ref) => {
    const skillOptions = [
      { value: "nft", label: "NFT" },
      { value: "special", label: "Special" },
      { value: "limited", label: "Limited", disabled: true },
    ];

    const backdropOptions = [
      { value: "YELLOW", label: "Желтый" },
      { value: "BLUE", label: "Синий" },
    ];

    const {
      control,
      handleSubmit,
      formState: { errors, isValid },
      reset,
    } = useForm<EditGiftFormData>({
      resolver: zodResolver(editGiftSchema),
      mode: "onChange",
      defaultValues: {
        name: gift.name || "",
        description: gift.description || "",
        telegramGiftId: gift.telegramGiftId || undefined,
        mediaUrl: gift.mediaUrl || "",
        price: gift.price || 0,
        quantity: gift.quantity || 0,
        backdropVariant: gift.backdropVariant || "YELLOW",
        tags: gift.tags || [],
        specialOffer: gift.specialOffer || false,
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

    return (
      <div>
        <form id="edit-gift-form" onSubmit={handleSubmit(onSubmit)}>
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
                      placeholder="Например: Золотая звезда"
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
                      placeholder="Опишите ваш подарок подробно..."
                      error={errors.description?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="telegramGiftId"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Telegram ID"
                      placeholder="Введите ID подарка в Telegram"
                      error={errors.telegramGiftId?.message}
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
                  name="mediaUrl"
                  control={control}
                  render={({ field }) => (
                    <Input
                      label="Медиафайл *"
                      placeholder="Ссылка на изображение или tgs"
                      error={errors.mediaUrl?.message}
                      {...field}
                    />
                  )}
                />

                <Controller
                  name="backdropVariant"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      options={backdropOptions}
                      label="Цвет фона"
                      placeholder="Выберите фон"
                      error={errors.backdropVariant?.message}
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
                    name="specialOffer"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Checkbox
                        label="Специальное предложение"
                        checked={value}
                        onChange={onChange}
                        error={errors.specialOffer?.message}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Скрытая кнопка отправки */}
            <button type="submit" style={{ display: "none" }} />
          </div>
        </form>
      </div>
    );
  }
);

EditGiftForm.displayName = "EditGiftForm";

export default EditGiftForm;
