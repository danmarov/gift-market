import DemoPrizePageClient from "@/components/features/demo-prize/demo-prize-client";
import { getDemoPrize } from "@/lib/actions/demo-prize/get-demo-prize";
import { notFound } from "next/navigation";

interface DemoPrizePageProps {
  params: Promise<{ id: string }>;
}

export default async function DemoPrizePage({ params }: DemoPrizePageProps) {
  const { id } = await params;
  const result = await getDemoPrize(Number(id));

  if (!result.success) {
    return notFound();
  }

  return <DemoPrizePageClient item={result.data} />;
}
