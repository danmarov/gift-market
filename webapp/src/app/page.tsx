import ShareRefferalButton from "@/components/common/share-refferal-button";
import NavigationMenu from "@/components/features/navigation/navigation-menu";
import MainLayout from "@/components/layout/main-layout";
import HomeHeader from "@/components/widgets/home-header";
import ProductCarouselWithInfo from "@/components/widgets/product-carousel";
import { getGifts } from "@/lib/actions/gift/get-gifts";

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

            {/* <DrawerDemo trigger={<button>CLICK ME</button>} /> */}

            <p className="font-sans text-center text-[#E7D3E9] px-2 mt-5">
              {/* Делитесь с друзьями, выполняйте задания и обменивайте заработанные
              звезды на подарки */}
              Получите по 5 ⭐️ за каждого <br />
              приглашенного друга
            </p>

            <ShareRefferalButton />
          </div>
        </>
      </MainLayout>
    </>
  );
}
