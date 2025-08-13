import ShareRefferalButton from "@/components/common/share-refferal-button";
import NavigationMenu from "@/components/features/navigation/navigation-menu";
import MainLayout from "@/components/layout/main-layout";
import HomeHeader from "@/components/widgets/home-header";
import ProductCarouselWithInfo from "@/components/widgets/product-carousel";
import { getGifts } from "@/lib/actions/gift/get-gifts";
import Link from "next/link";

export default async function Home() {
  const result = await getGifts({ skip: 0, take: 20 });
  if (!result.success) {
    return <>{result.error}</>;
  }
  return (
    <>
      <MainLayout bottomBar={<NavigationMenu />}>
        <>
          <div className="">
            <HomeHeader />
            {result.data.specialOffers &&
            result.data.specialOffers.length > 0 ? (
              <ProductCarouselWithInfo products={result.data.specialOffers} />
            ) : (
              <></>
            )}

            <Link href={"/admin"}>Тосты</Link>

            <p className="font-sans text-center text-[#E7D3E9] px-2 mt-5">
              Отправь бесплатный подарок другу <br /> и получи 5 ⭐️
            </p>

            <ShareRefferalButton />
          </div>
        </>
      </MainLayout>
    </>
  );
}
