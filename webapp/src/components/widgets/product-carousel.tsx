"use client";

import { useState } from "react";
import { Carousel, CarouselItem } from "@/components/ui/carousel";
import StarsIndicator from "@/components/ui/stars-indicator";
import ProductPreview from "@/components/features/product/product-preview";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useAuth } from "../features/auth/hooks/use-auth";
import { Gift as IGift } from "@prisma/client";
import { Gift } from "lucide-react";

interface ProductData {
  id: string;
  name: string;
  price: number;
  src: string;
  alt: string;
}

interface ProductCarouselWithInfoProps {
  products: IGift[];
  className?: string;
}

export default function ProductCarouselWithInfo({
  products,
  className = "",
}: ProductCarouselWithInfoProps) {
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSlideChange = (index: number) => {
    if (index !== activeIndex) {
      setIsTransitioning(true);
      // Задержка для плавной анимации исчезновения
      setTimeout(() => {
        setActiveIndex(index);
        setIsTransitioning(false);
      }, 150);
    }
  };

  const activeProduct = products[activeIndex];

  return (
    <div className={className}>
      {/* Цена */}
      <div className="mt-5 flex items-start relative">
        {user?.role === "USER" && user.onboardingStatus !== "COMPLETED" && (
          <Link
            href={"/onboarding"}
            className="menu-btn-accent size-[50px] grid place-items-center cursor-pointer"
          >
            <Gift className="text-amber-300 font-medium" />
          </Link>
        )}
        {user?.role === "ADMIN" && (
          <Link
            href={"/admin/roulette"}
            className="menu-btn-accent size-[50px] grid place-items-center cursor-pointer"
          >
            <Gift className="text-amber-300 font-medium" />
          </Link>
        )}

        <div
          className={cn(
            "absolute left-1/2 -translate-x-1/2 transition-opacity duration-300",
            isTransitioning ? "opacity-0" : "opacity-100"
          )}
        >
          <StarsIndicator value={activeProduct.price} className="" />
        </div>
        <Link
          href={"/shop"}
          className="ml-auto menu-btn size-[50px] grid place-items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={23}
            height={22}
            viewBox="0 0 23 22"
            fill="none"
          >
            <g clipPath="url(#clip0_65_6528)">
              <path
                d="M22.5 9.25014L21.3551 3.94815C21.1115 2.82564 20.4897 1.82089 19.5938 1.10215C18.6978 0.383413 17.5821 -0.00566899 16.4335 6.24262e-05H6.5665C5.41789 -0.00566899 4.30219 0.383413 3.40623 1.10215C2.51027 1.82089 1.88845 2.82564 1.64492 3.94815L0.533 8.95223L0.5 10.1256C0.504144 11.0453 0.828235 11.9349 1.41667 12.6418V16.9584C1.41812 18.2951 1.94976 19.5766 2.89494 20.5218C3.84013 21.467 5.12165 21.9986 6.45833 22.0001H16.5417C17.8784 21.9986 19.1599 21.467 20.1051 20.5218C21.0502 19.5766 21.5819 18.2951 21.5833 16.9584V12.6418C22.1718 11.9349 22.4959 11.0453 22.5 10.1256V9.25014ZM3.25 9.40139L4.32892 4.54306C4.44235 4.03427 4.72585 3.57935 5.13265 3.25338C5.53944 2.92741 6.04522 2.74987 6.5665 2.75006H6.91667V4.12506C6.91667 4.48974 7.06153 4.83947 7.31939 5.09733C7.57726 5.3552 7.92699 5.50006 8.29167 5.50006C8.65634 5.50006 9.00608 5.3552 9.26394 5.09733C9.5218 4.83947 9.66667 4.48974 9.66667 4.12506V2.75006H13.3333V4.12506C13.3333 4.48974 13.4782 4.83947 13.7361 5.09733C13.9939 5.3552 14.3437 5.50006 14.7083 5.50006C15.073 5.50006 15.4227 5.3552 15.6806 5.09733C15.9385 4.83947 16.0833 4.48974 16.0833 4.12506V2.75006H16.4335C16.955 2.74997 17.461 2.92777 17.8678 3.2541C18.2747 3.58043 18.558 4.03576 18.6711 4.5449L19.75 9.40139V10.1256C19.7412 10.4512 19.6056 10.7605 19.3722 10.9877C19.1388 11.2149 18.8259 11.342 18.5001 11.342C18.1744 11.342 17.8615 11.2149 17.6281 10.9877C17.3946 10.7605 17.2591 10.4512 17.2503 10.1256C17.2563 9.82627 17.2026 9.52878 17.0922 9.25052C16.9818 8.97225 16.8171 8.7188 16.6076 8.505C16.398 8.2912 16.148 8.12135 15.872 8.0054C15.596 7.88945 15.2996 7.82973 15.0003 7.82973C14.7009 7.82973 14.4046 7.88945 14.1286 8.0054C13.8526 8.12135 13.6026 8.2912 13.393 8.505C13.1835 8.7188 13.0187 8.97225 12.9084 9.25052C12.798 9.52878 12.7443 9.82627 12.7503 10.1256C12.7503 10.4572 12.6186 10.7752 12.3841 11.0097C12.1496 11.2442 11.8316 11.3759 11.5 11.3759C11.1684 11.3759 10.8504 11.2442 10.6159 11.0097C10.3814 10.7752 10.2497 10.4572 10.2497 10.1256C10.2557 9.82627 10.202 9.52878 10.0916 9.25052C9.98126 8.97225 9.8165 8.7188 9.60697 8.505C9.39744 8.2912 9.14737 8.12135 8.87139 8.0054C8.5954 7.88945 8.29906 7.82973 7.99971 7.82973C7.70036 7.82973 7.40401 7.88945 7.12803 8.0054C6.85205 8.12135 6.60197 8.2912 6.39245 8.505C6.18292 8.7188 6.01815 8.97225 5.9078 9.25052C5.79744 9.52878 5.74371 9.82627 5.74975 10.1256C5.74093 10.4512 5.60538 10.7605 5.37194 10.9877C5.13851 11.2149 4.82562 11.342 4.49988 11.342C4.17413 11.342 3.86124 11.2149 3.62781 10.9877C3.39437 10.7605 3.25882 10.4512 3.25 10.1256V9.40139ZM16.5417 19.2501H6.45833C5.85055 19.2501 5.26765 19.0086 4.83788 18.5788C4.40811 18.1491 4.16667 17.5662 4.16667 16.9584V14.0911C4.2785 14.1011 4.38575 14.125 4.50033 14.125C5.21493 14.1245 5.91637 13.9326 6.5318 13.5695C7.14724 13.2063 7.65424 12.685 8.00017 12.0597C8.34578 12.6853 8.85272 13.2067 9.46824 13.5699C10.0838 13.933 10.7853 14.1245 11.5 14.1245C12.2147 14.1245 12.9162 13.933 13.5318 13.5699C14.1473 13.2067 14.6542 12.6853 14.9998 12.0597C15.3458 12.685 15.8528 13.2063 16.4682 13.5695C17.0836 13.9326 17.7851 14.1245 18.4997 14.125C18.6143 14.125 18.7215 14.1011 18.8333 14.0911V16.9584C18.8333 17.2593 18.7741 17.5573 18.6589 17.8354C18.5437 18.1134 18.3749 18.366 18.1621 18.5788C17.9493 18.7917 17.6967 18.9605 17.4186 19.0756C17.1406 19.1908 16.8426 19.2501 16.5417 19.2501Z"
                fill="white"
              />
            </g>
            <defs>
              <clipPath id="clip0_65_6528">
                <rect
                  width={22}
                  height={22}
                  fill="white"
                  transform="translate(0.5)"
                />
              </clipPath>
            </defs>
          </svg>
        </Link>
      </div>

      {/* Слайдер */}
      <Carousel
        className="relative -mt-[25px]"
        showDots
        onSlideChange={handleSlideChange}
        bottomContent={
          /* Название с анимацией */
          <div
            className={cn(
              "transition-opacity duration-300",
              isTransitioning ? "opacity-0" : "opacity-100"
            )}
          >
            <p className="font-sans text-center text-[#e7d3e9]">
              {activeProduct.name}
            </p>
          </div>
        }
      >
        {products.map((product) => (
          <CarouselItem key={product.id}>
            <Link
              className="block relative aspect-square mx-16"
              href={`/gift/${product.id}`}
            >
              <ProductPreview src={product.mediaUrl} alt={product.name} />
            </Link>
          </CarouselItem>
        ))}
      </Carousel>
    </div>
  );
}
