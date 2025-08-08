// app/admin/orders/page.tsx
import NavigationMenu from "@/components/features/navigation/navigation-menu";
import OrdersList from "@/components/features/orders/orders-list";
import MainLayout from "@/components/layout/main-layout";
import { getPurchases } from "@/lib/actions/admin/get-purchases";
import React from "react";

export default async function OrdersPage() {
  const purchasesResult = await getPurchases();

  return (
    <MainLayout bottomBar={<NavigationMenu />}>
      <p className="font-mono text-lg font-medium min-h-[35.5px]">
        Управление заказами
      </p>

      <h1 className="uppercase font-sans italic text-4xl font-bold text-center mt-4 mb-6">
        заказы
      </h1>

      {/* <p className="text-[#E7D3E9] font-sans text-center text-[15px] mt-1 mb-6 leading-[22px]">
        Просматривайте и управляйте заказами пользователей. Отправляйте или
        отменяйте заказы с автоматическим возвратом средств.
      </p> */}
      <div className="flex-1">
        <OrdersList
          initialData={
            purchasesResult.success ? purchasesResult.data : undefined
          }
          error={purchasesResult.error}
        />
      </div>
    </MainLayout>
  );
}
