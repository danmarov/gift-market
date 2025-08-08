import React from "react";
import ProductCardBackdrop from "./product-card-backdrop";
import StarsIndicator from "@/components/ui/stars-indicator";
import ProductPreview from "./product-preview";
import { Gift } from "database";

interface ProductCardProps {
  item: Gift;
}

export default function ProductCard({ item }: ProductCardProps) {
  return (
    <div>
      <div className="aspect-square rounded-[30px] relative overflow-hidden">
        <ProductCardBackdrop
          variant={item.backdropVariant.toLocaleLowerCase()}
        />
        <div className="relative z-10 size-full flex items-center justify-center text-white max-w-[250px] mx-auto">
          <ProductPreview src={item.mediaUrl} alt={item.name} />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <span className="font-sans text-2xl font-bold">{item.name}</span>
        <StarsIndicator className="ml-auto gap-1" value={item.price} />
      </div>
      <p className="font-mono text-sm">
        {item.description !== "" ? (
          item.description
        ) : (
          <> Все купленные подарки автоматически приходят на ваш аккаунт.</>
        )}
      </p>
    </div>
  );
}
