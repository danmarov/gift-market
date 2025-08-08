import React from "react";
import CatalogCardPrice from "./catalog-card-price";
import CatalogCardBackdrop from "./catalog-card-backdrop";
import CatalogCardBedge from "./catalog-card-bedge";
import { cn } from "@sglara/cn";
import Link from "next/link";
import ProductPreview from "../product/product-preview";
import { Gift } from "database";

interface CatalogCardProps {
  specialOffer?: boolean;
  className?: string;
  item: Gift;
}
const renderBadge = (badge: string) => {
  switch (badge) {
    case "special":
      return <CatalogCardBedge.Special key="special" />;
    case "nft":
      return <CatalogCardBedge.Nft key="nft" />;
    default:
      console.warn(`Unknown badge type: ${badge}`);
      return null;
  }
};

export default function CatalogCard({
  specialOffer = false,
  className = "",
  item,
}: CatalogCardProps) {
  return (
    <Link
      href={`/gift/${item.id}`}
      className={cn(
        "block h-[191px] rounded-[30px] relative p-5 overflow-hidden",
        className
      )}
      style={{
        gridColumn: specialOffer ? "1 / -1" : "span 1",
      }}
    >
      <CatalogCardBackdrop
        specialOffer={specialOffer}
        variant={item.backdropVariant.toLocaleLowerCase()}
      />

      <div className="size-full flex flex-col items-center">
        <div className="flex-grow flex-1 relative aspect-square">
          <div className="absolute inset-0">
            <ProductPreview src={item.mediaUrl} />
          </div>
        </div>
        <CatalogCardPrice value={item.price} className="" />
      </div>
      <CatalogCardBedge.Wrapper>
        {item.tags.map(renderBadge)}
      </CatalogCardBedge.Wrapper>
    </Link>
  );
}
