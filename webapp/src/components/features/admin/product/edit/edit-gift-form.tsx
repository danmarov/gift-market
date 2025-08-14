"use client";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import FileUpload from "@/components/ui/file-upload";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditGiftFormData, editGiftSchema } from "@/lib/types/gift";
import { Gift } from "database";
import { Trash } from "lucide-react";

export interface EditGiftFormRef {
  submitForm: () => void;
  resetForm: () => void;
}

interface EditGiftFormProps {
  gift: Gift;
  onSubmit: (
    data: EditGiftFormData & { deleteRevealAnimation?: boolean }
  ) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const EditGiftForm = forwardRef<EditGiftFormRef, EditGiftFormProps>(
  ({ gift, onSubmit, onValidationChange }, ref) => {
    const [showDeleteAnimation, setShowDeleteAnimation] = useState(false);
    const [animationToDelete, setAnimationToDelete] = useState(false);

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
      watch,
      setValue, // ДОБАВЬ ЭТО
    } = useForm<EditGiftFormData>({
      resolver: zodResolver(editGiftSchema),
      mode: "onChange",
      defaultValues: {
        name: gift.name || "",
        description: gift.description || "",
        telegramGiftId: gift.telegramGiftId || undefined,
        mediaUrl: gift.mediaUrl || "",
        revealAnimationFile: null,
        deleteRevealAnimation: false, // ДОБАВЬ ЭТО
        price: gift.price || 0,
        quantity: gift.quantity || 0,
        backdropVariant: gift.backdropVariant || "YELLOW",
        tags: gift.tags || [],
        specialOffer: gift.specialOffer || false,
      },
    });

    const handleDeleteAnimation = () => {
      setAnimationToDelete(true);
      setValue("deleteRevealAnimation", true); // ОБНОВЛЯЙ ФОРМУ
      console.log("🗑️ Помечена анимация для удаления");
    };

    const handleCancelDelete = () => {
      setAnimationToDelete(false);
      setValue("deleteRevealAnimation", false); // ОБНОВЛЯЙ ФОРМУ
      console.log("↩️ Отменено удаление анимации");
    };

    const handleFormSubmit = (data: EditGiftFormData) => {
      console.log("📝 [FORM] Данные формы редактирования подарка:", data);
      onSubmit(data); // Теперь deleteRevealAnimation будет в data
    };

    // Следим за изменением файла анимации
    const revealAnimationFile = watch("revealAnimationFile");

    useEffect(() => {
      // Показываем кнопку удаления если есть текущая анимация и не выбран новый файл
      setShowDeleteAnimation(
        !!gift.revealAnimation && !revealAnimationFile && !animationToDelete
      );
    }, [gift.revealAnimation, revealAnimationFile, animationToDelete]);

    useImperativeHandle(ref, () => ({
      submitForm: () => {
        handleSubmit(onSubmit)();
      },
      resetForm: () => {
        reset();
        setAnimationToDelete(false);
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
        <form id="edit-gift-form" onSubmit={handleSubmit(handleFormSubmit)}>
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

                {/* Секция анимации разворота */}
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Анимация открытия
                  </label>

                  {/* Если анимация помечена для удаления */}
                  {animationToDelete && (
                    <div className="mb-3 p-3 bg-red-500/20 border border-red-500/40 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-red-300 text-sm">
                          🗑️ Анимация будет удалена при сохранении
                        </span>
                        <button
                          type="button"
                          onClick={handleCancelDelete}
                          className="text-white/70 hover:text-white text-sm underline"
                        >
                          Отменить
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Если есть текущая анимация и она не помечена для удаления */}
                  {gift.revealAnimation && !animationToDelete && (
                    <div className="mb-3 p-3 bg-white/10 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-white/80 text-sm">
                            Текущая анимация:
                          </span>
                          <span className="text-white/60 text-xs break-all">
                            {gift.revealAnimation}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleDeleteAnimation}
                          className="ml-3 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-sm rounded border border-red-500/40 transition-colors"
                        >
                          <Trash />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Загрузка нового файла */}
                  {!animationToDelete && (
                    <Controller
                      name="revealAnimationFile"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <FileUpload
                          label=""
                          accept=".tgs"
                          placeholder="Выберите новый TGS файл"
                          error={errors.revealAnimationFile?.message}
                          onChange={onChange}
                          value={value || null}
                          description={
                            gift.revealAnimation
                              ? "Новый файл заменит текущую анимацию"
                              : "Поддерживается только формат .tgs"
                          }
                        />
                      )}
                    />
                  )}
                </div>

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
