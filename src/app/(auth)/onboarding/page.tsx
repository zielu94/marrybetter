import type { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/auth/OnboardingForm";

export const metadata: Metadata = {
  title: "Onboarding | MarryBetter.com",
  description: "Vervollständige dein Profil",
};

export default async function OnboardingPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text tracking-tight">
          Wir brauchen noch ein paar Infos
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Damit wir deine Hochzeit perfekt planen können.
        </p>
      </div>
      <OnboardingForm userId={session.user.id} />
    </div>
  );
}
