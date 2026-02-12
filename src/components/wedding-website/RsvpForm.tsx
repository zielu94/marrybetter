"use client";

import { useState } from "react";
import { submitRsvp } from "@/actions/rsvp.actions";
import { GUEST_DIET_LABELS, MEAL_TYPE_LABELS } from "@/types";
import type { GuestDiet, MealType } from "@/types";

interface RsvpFormProps {
  token: string;
  guestName: string;
  currentDiet: string | null;
  currentMealType: string;
  currentAllergies: string | null;
  currentNotes: string | null;
  slug: string;
}

export default function RsvpForm({
  token,
  guestName,
  currentDiet,
  currentMealType,
  currentAllergies,
  currentNotes,
  slug,
}: RsvpFormProps) {
  const [rsvpStatus, setRsvpStatus] = useState<string>("");
  const [mealType, setMealType] = useState(currentMealType || "STANDARD");
  const [diet, setDiet] = useState(currentDiet || "");
  const [allergies, setAllergies] = useState(currentAllergies || "");
  const [notes, setNotes] = useState(currentNotes || "");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!rsvpStatus) {
      setError("Bitte wähle eine Option.");
      return;
    }

    setPending(true);
    setError(null);

    const fd = new FormData();
    fd.set("rsvpStatus", rsvpStatus);
    fd.set("mealType", mealType);
    fd.set("diet", diet);
    fd.set("allergiesNote", allergies);
    fd.set("notes", notes);

    const result = await submitRsvp(token, fd);

    if (result.error) {
      setError(result.error);
      setPending(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">
          {rsvpStatus === "ATTENDING" ? "🎉" : rsvpStatus === "MAYBE" ? "🤔" : "💌"}
        </div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          {rsvpStatus === "ATTENDING"
            ? "Wunderbar, wir freuen uns auf dich!"
            : rsvpStatus === "MAYBE"
              ? "Danke! Bitte gib uns bald Bescheid."
              : "Schade! Wir werden dich vermissen."}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Deine Antwort wurde gespeichert.
        </p>
        <a
          href={`/w/${slug}`}
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Zurück zur Hochzeitswebseite
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* RSVP Selection */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-3">
          Kannst du dabei sein?
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "ATTENDING", label: "Ja, gerne!", icon: "🎉", color: "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" },
            { value: "MAYBE", label: "Vielleicht", icon: "🤔", color: "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-600 dark:bg-amber-500/10 dark:text-amber-400" },
            { value: "DECLINED", label: "Leider nein", icon: "😢", color: "border-zinc-300 bg-zinc-50 text-zinc-600 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-400" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setRsvpStatus(opt.value); setError(null); }}
              className={`flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all ${
                rsvpStatus === opt.value
                  ? opt.color
                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 text-zinc-500 dark:text-zinc-400"
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-xs font-medium">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Meal & Diet (only if attending or maybe) */}
      {(rsvpStatus === "ATTENDING" || rsvpStatus === "MAYBE") && (
        <>
          {/* Meal Type */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Menüwahl
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.entries(MEAL_TYPE_LABELS) as [MealType, string][]).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMealType(key)}
                  className={`py-2.5 px-3 rounded-lg border text-sm transition-colors ${
                    mealType === key
                      ? "border-zinc-900 dark:border-white bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium"
                      : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Diet */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Ernährungsform (optional)
            </label>
            <select
              value={diet}
              onChange={(e) => setDiet(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20"
            >
              <option value="">Keine besondere Ernährungsform</option>
              {(Object.entries(GUEST_DIET_LABELS) as [GuestDiet, string][]).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
              Allergien & Unverträglichkeiten (optional)
            </label>
            <input
              type="text"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="z.B. Laktose, Erdnüsse..."
              className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 placeholder:text-zinc-400"
            />
          </div>
        </>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-zinc-900 dark:text-white mb-2">
          Nachricht ans Brautpaar (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Wir freuen uns riesig..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-zinc-500/20 resize-none placeholder:text-zinc-400"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={pending || !rsvpStatus}
        className="w-full py-3 px-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {pending ? "Wird gesendet..." : "Antwort absenden"}
      </button>
    </form>
  );
}
