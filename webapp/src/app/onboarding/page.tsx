// app/onboarding/page.tsx (Серверный компонент)
import TelegramBackButton from "@/components/common/telegram-back-button";
import MainLayout from "@/components/layout/main-layout";
import OnboardingContent from "../../components/features/onboarding/onboarding-content";
import { getUserOnboardingStatus } from "@/lib/actions/user/get-user-onboarding-status";
import { UserOnboardingStatus } from "@/lib/types/user";
import { notFound, redirect } from "next/navigation";
import { getUserOnboardingData } from "@/lib/actions/user/get-user-onboarding-data";

export default async function OnboardingPage() {
  const result = await getUserOnboardingData();

  if (!result.success || !result.data) {
    throw new Error(result.error);
  }

  if ((result.data.onboardingStatus as UserOnboardingStatus) === "COMPLETED") {
    notFound();
    // redirect("/");
  }

  return (
    <MainLayout disableBottomPadding>
      <OnboardingContent
        gift={result.data.gift}
        onboardingStatus={result.data.onboardingStatus as UserOnboardingStatus}
      />
    </MainLayout>
  );
}
