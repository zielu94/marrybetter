import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Anmelden | MarryBetter.com",
  description: "Melde dich bei MarryBetter.com an",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-text tracking-tight">
          Willkommen zurück
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Lass uns weiter deine Traumhochzeit planen!
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
