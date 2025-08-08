import React, { PropsWithChildren } from "react";

function Special() {
  return (
    <span className="catalog-card-bedge-special font-mono uppercase">
      Special
    </span>
  );
}

function Nft() {
  return (
    <span className="catalog-card-bedge-nft font-mono uppercase">Nft</span>
  );
}

function Wrapper({ children }: PropsWithChildren) {
  return (
    <div className="catalog-card-bedge-wrapper flex items-center gap-1">
      <>{children}</>
    </div>
  );
}

const CatalogCardBedge = {
  Special,
  Wrapper,
  Nft,
};
export default CatalogCardBedge;
