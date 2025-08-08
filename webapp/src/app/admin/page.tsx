"use client";
import TelegramBackButton from "@/components/common/telegram-back-button";
import MainLayout from "@/components/layout/main-layout";
import Button from "@/components/ui/button";
import Checkbox from "@/components/ui/checkbox";
import Input from "@/components/ui/input";
import MultiSelect from "@/components/ui/multi-select";
import RadioGroup from "@/components/ui/radio-group";
import Select from "@/components/ui/select";
import Textarea from "@/components/ui/textarea";
import { SearchIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function Page() {
  const [loading, setLoading] = React.useState(false);
  const options = [
    { value: "admin", label: "Администратор" },
    { value: "user", label: "Пользователь" },
    { value: "moderator", label: "Модератор", disabled: true },
  ];

  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState("user");

  const skillOptions = [
    { value: "js", label: "JavaScript" },
    { value: "ts", label: "TypeScript" },
    { value: "react", label: "React" },
    { value: "vue", label: "Vue.js" },
    { value: "node", label: "Node.js" },
  ];
  const roleOptions = [
    {
      value: "admin",
      label: "Администратор",
      description: "Полный доступ ко всем функциям",
    },
    {
      value: "moderator",
      label: "Модератор",
      description: "Управление контентом и пользователями",
    },
    {
      value: "user",
      label: "Пользователь",
      description: "Базовые возможности системы",
    },
    {
      value: "guest",
      label: "Гость",
      disabled: true,
    },
  ];
  // 17532263729662421
  return (
    <MainLayout bottomBar={<></>}>
      <>
        <TelegramBackButton />
        <Link href={"/admin/gift/create"}>
          <Button variant="primary" size="sm">
            Создать
          </Button>
        </Link>
        <Link href={"/admin/gift/edit/17532263729662421"}>
          <Button variant="primary" size="sm">
            Отредачить
          </Button>
        </Link>
        <div className="bg-emeraldd-400">
          <h1 className="text-white text-2xl mb-4">Тест кнопок</h1>

          <div className="flex gap-4 flex-wrap">
            <Button variant="primary">Primary кнопка</Button>
            <Button variant="secondary" className="!bg-[#ffffff4d]">
              Secondary кнопка
            </Button>
            <Button variant="accent">Accent кнопка</Button>
            <Button variant="outline">Outline кнопка</Button>
            <Button variant="ghost">Ghost кнопка</Button>
          </div>

          <div className="flex gap-4 flex-wrap flex-col w-fit">
            <Button variant="primary" size="sm">
              Маленькая
            </Button>
            <Button variant="primary" size="md">
              Средняя
            </Button>
            <Button variant="primary" size="lg">
              Большая
            </Button>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Button variant="primary" disabled className="">
              Отключена
            </Button>
            <Button
              variant="primary"
              loading={loading}
              onClick={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 2000);
              }}
            >
              {loading ? "Загружается..." : "Тест загрузки"}
            </Button>
          </div>
        </div>
        <Input placeholder="Введите текст" />
        <Input
          label="Email"
          placeholder="email@example.com"
          error="Неверный формат email"
          suffix={<SendIcon />}
        />
        <Input icon={<SearchIcon />} placeholder="Поиск..." />
        <br /> <br />
        <Textarea placeholder="Введите описание..." />
        <Textarea
          label="Описание"
          placeholder="Расскажите подробнее..."
          error="Поле обязательно для заполнения"
        />
        <Textarea resize="none" rows={4} placeholder="Фиксированный размер" />
        <div className="mt-5">
          <Select
            options={options}
            label="Роль пользователя"
            placeholder="Выберите роль"
            onChange={(value) => console.log(value)}
            error="Поле обязательно для выбора"
          />

          <br />
          <br />
          <MultiSelect
            label="Навыки разработки"
            placeholder="Выберите навыки..."
            options={skillOptions}
            value={selectedSkills}
            onChange={(values) => {
              console.log("Selected skills:", values);
              setSelectedSkills(values);
            }}
            maxSelected={3}
          />

          <div className="mt-2 text-white text-sm">
            Выбрано: {selectedSkills.join(", ") || "Ничего"}
          </div>

          <div className="my-5">
            <Checkbox label="Получать уведомления" />
          </div>
          <RadioGroup
            label="Выберите роль"
            name="user-role"
            options={roleOptions}
            value={selectedRole}
            onChange={setSelectedRole}
            direction="vertical"
            error="Необходимо выбрать один из вариантов"
          />
        </div>
      </>
    </MainLayout>
  );
}
