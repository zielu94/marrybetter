"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { completeOnboarding } from "@/actions/auth.actions";

interface OnboardingFormProps {
  userId: string;
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<"COUPLE" | "PLANNER">("COUPLE");
  const [hasNoDate, setHasNoDate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    formData.set("role", role);
    const result = await completeOnboarding(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  // Step 1: Choose role
  if (step === "role") {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => { setRole("COUPLE"); setStep("details"); }}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary-400 hover:bg-primary-50/50 transition-all duration-200 group"
          >
            <span className="text-4xl">💍</span>
            <span className="text-[15px] font-semibold text-text group-hover:text-primary-600">Wir planen unsere Hochzeit</span>
            <span className="text-xs text-text-muted text-center">Perfekt für Paare, die ihre eigene Hochzeit organisieren möchten.</span>
          </button>

          <button
            onClick={() => { setRole("PLANNER"); setStep("details"); }}
            className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-border hover:border-primary-400 hover:bg-primary-50/50 transition-all duration-200 group"
          >
            <span className="text-4xl">📋</span>
            <span className="text-[15px] font-semibold text-text group-hover:text-primary-600">Ich bin Hochzeitsplaner</span>
            <span className="text-xs text-text-muted text-center">Für professionelle Planer, die mehrere Paare betreuen.</span>
          </button>
        </div>
      </div>
    );
  }

  // Step 2: Details
  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="role" value={role} />

      {/* Back button */}
      <button
        type="button"
        onClick={() => setStep("role")}
        className="flex items-center gap-1 text-sm text-text-muted hover:text-text transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
        </svg>
        Zurück
      </button>

      {/* Role indicator */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 text-primary-600 text-sm font-medium">
        {role === "COUPLE" ? "💍 Paar" : "📋 Hochzeitsplaner"}
      </div>

      <Input
        id="name"
        name="name"
        type="text"
        label="Dein Name"
        placeholder="Max Mustermann"
        required
        autoComplete="name"
      />

      {role === "COUPLE" && (
        <>
          <Input
            id="partnerName"
            name="partnerName"
            type="text"
            label="Name deines Partners / deiner Partnerin"
            placeholder="Maria Musterfrau"
            required
            autoComplete="off"
          />

          <Input
            id="weddingDate"
            name="weddingDate"
            type="date"
            label="Hochzeitsdatum"
            disabled={hasNoDate}
          />

          <div className="flex items-center">
            <input
              id="hasNoDate"
              name="hasNoDate"
              type="checkbox"
              checked={hasNoDate}
              onChange={(e) => setHasNoDate(e.target.checked)}
              className="h-4 w-4 rounded border-border text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="hasNoDate" className="ml-2 text-sm text-text-muted">
              Wir haben noch kein Datum
            </label>
          </div>
        </>
      )}

      {role === "PLANNER" && (
        <div className="bg-surface-2 rounded-xl p-4 text-sm text-text-muted">
          <p className="font-medium text-text mb-1">Was passiert als nächstes?</p>
          <p>Nach der Anmeldung kannst du deine Paare anlegen und ihre Hochzeiten von einem zentralen Dashboard aus planen.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
        {pending ? "Wird gespeichert..." : role === "COUPLE" ? "Los geht's!" : "Als Planer starten"}
      </Button>
    </form>
  );
}
