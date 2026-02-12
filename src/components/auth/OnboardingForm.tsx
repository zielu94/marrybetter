"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { completeOnboarding } from "@/actions/auth.actions";

interface OnboardingFormProps {
  userId: string;
}

export default function OnboardingForm({ userId }: OnboardingFormProps) {
  const [hasNoDate, setHasNoDate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await completeOnboarding(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />

      <Input
        id="name"
        name="name"
        type="text"
        label="Dein Name"
        placeholder="Max Mustermann"
        required
        autoComplete="name"
      />

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

      {error && (
        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <Button type="submit" variant="primary" size="lg" fullWidth disabled={pending}>
        {pending ? "Wird gespeichert..." : "Los geht's!"}
      </Button>
    </form>
  );
}
