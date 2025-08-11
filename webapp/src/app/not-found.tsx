import TelegramBackButton from "@/components/common/telegram-back-button";
import MainLayout from "@/components/layout/main-layout";
import TGSPlayer from "@/components/ui/tgs-wrapper";
import Link from "next/link";
import React from "react";

export default function NotFoundPage() {
  return (
    <MainLayout>
      <TelegramBackButton />
      <div className="absolute w-full top-1/2 -translate-y-1/2 left-0 px-4">
        <h1 className="uppercase font-sans text-5xl font-bold text-center">
          404
        </h1>
        <p className="font-semibold text-lg text-center mt-2">
          Запрашиваемый ресурс не найден.{" "}
        </p>
        <TGSPlayer
          src="/not-found.tgs"
          autoplay
          loop
          className="mx-auto my-5"
          style={{
            width: 200,
            height: 200,
          }}
        />
        <Link
          href={"/"}
          className="w-full primary-btn text-[#6E296D] text-nowrap"
        >
          На главную
        </Link>
      </div>
    </MainLayout>
  );
}
