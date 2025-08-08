export type MediaType = "tgs" | "lottie" | "gif" | "video";

export interface ProductMedia {
  type: MediaType;
  url: string;
  width?: number;
  height?: number;
}

export type ProductBackdropVariant = "yellow" | "blue";
export type ProductTags = "special" | "nft";
export interface Product {
  id: string;
  slug: string;
  backdropVariant: ProductBackdropVariant;
  specialOffer?: boolean;
  price: number;
  availableQuantity: number;
  name: string;
  description?: string;
  media: ProductMedia;
  tags?: ProductTags[];
  isActive?: boolean;

  // Дополнительные поля которые могут пригодиться:
  // category?: string;
  //   isActive?: boolean;
  // createdAt?: Date;
}
