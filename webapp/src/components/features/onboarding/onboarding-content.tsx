"use client";
import { UserOnboardingStatus } from "@/lib/types/user";
import PreviewGift from "./preview-gift";
import CustomRevealAnimation from "./custom-reveal-animation";
import GiftAnimation from "./gift-animation";
import { redirect, useRouter } from "next/navigation";

interface OnboardingContentProps {
  onboardingStatus: UserOnboardingStatus;
  gift: {
    name: string;
    mediaUrl: string;
    revealAnimation?: string | null;
  };
}

export default function OnboardingContent({
  onboardingStatus,
  gift,
}: OnboardingContentProps) {
  const router = useRouter();
  if (onboardingStatus === "COMPLETED") {
    router.push("/");
  }

  if (onboardingStatus === "ALL_COMPLETED") {
    return (
      <div className="size-full grid place-items-center relative select-none flex-1">
        {gift.revealAnimation ? (
          <>
            <CustomRevealAnimation
              giftName={gift.name}
              revealAnimation={gift.revealAnimation}
            />
          </>
        ) : (
          <>
            <GiftAnimation onAnimationComplete={() => console.log("Fini")} />
          </>
        )}
      </div>
    );
  }

  return (
    <div className="size-full grid place-items-center relative select-none flex-1">
      <PreviewGift gift={gift} status={onboardingStatus} />
    </div>
  );
}
