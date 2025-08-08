import NavigationMenu from "@/components/features/navigation/navigation-menu";
import { CatalogCard } from "@/components/features/catalog";
import MainLayout from "@/components/layout/main-layout";
import React from "react";
import UserStarsIndicator from "@/components/widgets/user-stars-indicator";
import Link from "next/link";
import { getGifts } from "@/lib/actions/gift/get-gifts";
import { Carousel, CarouselItem } from "@/components/ui/carousel";

export default async function ShopPage() {
  const result = await getGifts({ skip: 0, take: 20 });
  if (!result.success) {
    return <>{result.error}</>;
  }
  return (
    <MainLayout bottomBar={<NavigationMenu />}>
      <div className="w-fit ml-auto">
        <UserStarsIndicator />
      </div>

      <h1 className="uppercase font-sans italic text-4xl font-bold text-center mt-4">
        Магазин
      </h1>
      <p className="text-[#E7D3E9] font-sans leading-[22px] text-center text-[15px] mt-1">
        Покупайте подарки за звёзды в боте сразу на ваш аккаунт Telegram!
      </p>

      <Carousel
        className="my-5"
        showDots={true}
        autoplay={false}
        autoplayDelay={4000}
      >
        {result.data.specialOffers.map((item) => (
          <CarouselItem key={item.id}>
            <CatalogCard specialOffer item={item} />
          </CarouselItem>
        ))}
      </Carousel>
      <p className="font-mono text-lg font-medium flex items-center justify-between">
        Все подарки
        {result.data.isAdmin && (
          <Link
            href={"/admin/gift/create"}
            className="task-action-check font-mono"
          >
            + Создать
          </Link>
        )}
      </p>
      <div
        className="grid grid-cols-2 gap-2.5 mt-1 w-full"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "10px",
        }}
      >
        {result.data.catalog.map((item) => (
          // <p key={item.id}>{JSON.stringify(item)}</p>
          <CatalogCard key={item.id} item={item} />
        ))}
        {/* <CatalogCard variant="blue" badges={["nft"]} />
        <CatalogCard />
        <CatalogCard />
        <CatalogCard />
        <CatalogCard specialOffer={false} /> */}
      </div>
    </MainLayout>
  );
}
