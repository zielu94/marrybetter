"use client";

import { useState, useMemo } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createBudgetCategory } from "@/actions/budget.actions";
import { DEFAULT_BUDGET_CATEGORIES } from "@/types";

interface BudgetCategoryFormProps {
  projectId: string;
  existingCategoryNames: string[];
  onClose: () => void;
}

export default function BudgetCategoryForm({ projectId, existingCategoryNames, onClose }: BudgetCategoryFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [useCustom, setUseCustom] = useState(false);
  const [customName, setCustomName] = useState("");

  // Filter out already-used categories (case-insensitive)
  const existingLower = useMemo(
    () => new Set(existingCategoryNames.map((n) => n.toLowerCase())),
    [existingCategoryNames]
  );

  const availablePresets = useMemo(
    () => DEFAULT_BUDGET_CATEGORIES.filter((cat) => !existingLower.has(cat.toLowerCase())),
    [existingLower]
  );

  const finalName = useCustom ? customName : selectedPreset || "";

  return (
    <form
      action={async (formData) => {
        formData.set("name", finalName);
        await createBudgetCategory(formData);
        onClose();
      }}
      className="space-y-5"
    >
      <input type="hidden" name="projectId" value={projectId} />

      {/* Preset grid */}
      {availablePresets.length > 0 && !useCustom && (
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Kategorie wählen
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availablePresets.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedPreset(selectedPreset === cat ? null : cat);
                  setUseCustom(false);
                }}
                className={`px-3 py-2.5 rounded-xl text-[13px] font-medium text-left transition-all border ${
                  selectedPreset === cat
                    ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 dark:border-primary-600"
                    : "border-border bg-surface-1 text-text-muted hover:bg-surface-2 hover:border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Toggle to custom */}
      {!useCustom && (
        <button
          type="button"
          onClick={() => {
            setUseCustom(true);
            setSelectedPreset(null);
          }}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-500 hover:text-primary-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Eigene Kategorie erstellen
        </button>
      )}

      {/* Custom input */}
      {useCustom && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-text-muted">
              Eigener Kategoriename
            </label>
            {availablePresets.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setUseCustom(false);
                  setCustomName("");
                }}
                className="text-[12px] text-text-faint hover:text-text-muted transition-colors"
              >
                Zurück zur Auswahl
              </button>
            )}
          </div>
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="z.B. Gastgeschenke, Hochzeitsauto..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm placeholder:text-text-faint"
            autoFocus
          />
        </div>
      )}

      {/* Budget amount — always visible */}
      <Input name="plannedAmount" label="Geplantes Budget (EUR)" type="number" step="100" defaultValue={0} />

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
        <Button type="submit" disabled={!finalName.trim()}>Hinzufügen</Button>
      </div>
    </form>
  );
}
