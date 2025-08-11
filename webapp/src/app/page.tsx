import ShareRefferalButton from "@/components/common/share-refferal-button";
import NavigationMenu from "@/components/features/navigation/navigation-menu";
import MainLayout from "@/components/layout/main-layout";
import ProductCarouselWithInfo from "@/components/widgets/product-carousel";
import UserStarsIndicator from "@/components/widgets/user-stars-indicator";
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
            <div className="flex justify-between items-center">
              <Link
                className="menu-btn px-[10px] py-[4.5px] font-medium font-mono"
                href={"/admin/demo"}
              >
                Как играть?
              </Link>
              <UserStarsIndicator />
            </div>
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
