import ShareRefferalButton from "@/components/common/share-refferal-button";
import NavigationMenu from "@/components/features/navigation/navigation-menu";
import MainLayout from "@/components/layout/main-layout";
import ProductCarouselWithInfo from "@/components/widgets/product-carousel";
import UserStarsIndicator from "@/components/widgets/user-stars-indicator";
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
            <div className="flex justify-between items-center">
              <button className="menu-btn px-[10px] py-[4.5px] font-medium font-mono">
                Как играть?
              </button>
              <UserStarsIndicator />
            </div>
            <ProductCarouselWithInfo products={result.data.specialOffers} />
            {/* <DrawerDemo trigger={<button>CLICK ME</button>} /> */}

            <p className="font-sans text-center text-[#E7D3E9] px-5 mt-5">
              Делитесь с друзьями, выполняйте задания и обменивайте заработанные
              звезды на подарки
            </p>

            <ShareRefferalButton />
          </div>
        </>
      </MainLayout>
    </>
  );
}
