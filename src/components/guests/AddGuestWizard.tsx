"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import {
  GuestType,
  GuestAge,
  GuestDiet,
  GUEST_TYPE_LABELS,
  GUEST_AGE_LABELS,
  GUEST_DIET_LABELS,
} from "@/types/index";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GuestWizardData {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  age?: GuestAge;
  diet?: GuestDiet[];
  allergiesNote?: string;
  isWeddingParty: boolean;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  guestType: GuestType;
  notes?: string;
}

interface PersonFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: GuestAge;
  isWeddingParty: boolean;
}

interface AddGuestWizardProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  onSave: (guests: GuestWizardData[]) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FAMILY_SIZE_OPTIONS = Array.from({ length: 13 }, (_, i) => ({
  value: String(i + 3),
  label: `${i + 3} Personen`,
}));

const DEFAULT_PERSON: PersonFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  age: "ADULT",
  isWeddingParty: false,
};

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------

function PersonIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function CoupleIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function FamilyIcon({ className }: { className?: string }) {
  return (
    <svg className={cn("w-6 h-6", className)} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205l3 1m1.5.5l-1.5-.5M6.75 7.364V3h-3v18m3-13.636l10.5-3.819" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getPersonCount(guestType: GuestType, familySize: number): number {
  switch (guestType) {
    case "SINGLE":
      return 1;
    case "COUPLE":
      return 2;
    case "FAMILY":
      return familySize;
  }
}

function getStepLabels(guestType: GuestType, familySize: number): string[] {
  switch (guestType) {
    case "SINGLE":
      return ["Gast-Informationen", "Adressinformationen", "Ernährung & Notizen"];
    case "COUPLE":
      return ["Erste Person", "Zweite Person", "Adressinformationen", "Ernährung & Notizen"];
    case "FAMILY": {
      const members = Array.from({ length: familySize }, (_, i) => `Familienmitglied ${i + 1}`);
      return [...members, "Adressinformationen", "Ernährung & Notizen"];
    }
  }
}

function getSidebarDescription(guestType: GuestType | null): string {
  switch (guestType) {
    case "SINGLE":
      return "Ein einzelner Gast wird hinzugefügt.";
    case "COUPLE":
      return "Zwei Personen im gleichen Haushalt.";
    case "FAMILY":
      return "Familie mit mehreren Mitgliedern.";
    default:
      return "Wählen Sie den Typ des Gastes, den Sie hinzufügen möchten.";
  }
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepTypeSelection({
  guestType,
  setGuestType,
  familySize,
  setFamilySize,
}: {
  guestType: GuestType | null;
  setGuestType: (t: GuestType) => void;
  familySize: number;
  setFamilySize: (n: number) => void;
}) {
  const types: { value: GuestType; title: string; desc: string; Icon: typeof PersonIcon }[] = [
    { value: "SINGLE", title: "Einzelgast", desc: "Ein einzelner Gast", Icon: PersonIcon },
    { value: "COUPLE", title: "Paar / Begleitung", desc: "(2) Personen im gleichen Haushalt", Icon: CoupleIcon },
    {
      value: "FAMILY",
      title: "Familie",
      desc: "Familie mit mehreren Mitgliedern 3+. Ideal für Familien mit Kindern.",
      Icon: FamilyIcon,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text">Gast-Typ auswählen</h3>
      <p className="text-sm text-text-muted">Welche Art von Gast möchten Sie hinzufügen?</p>

      <div className="grid gap-3 mt-4">
        {types.map(({ value, title, desc, Icon }) => {
          const selected = guestType === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => setGuestType(value)}
              className={cn(
                "flex items-start gap-4 p-4 border rounded-xl text-left transition-all duration-150",
                selected
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-border hover:border-primary-500/40 hover:bg-surface-2"
              )}
            >
              <div
                className={cn(
                  "flex-shrink-0 p-2 rounded-lg",
                  selected ? "bg-primary-500/20 text-primary-500" : "bg-surface-2 text-text-muted"
                )}
              >
                <Icon />
              </div>
              <div>
                <p className={cn("font-semibold text-sm", selected ? "text-primary-500" : "text-text")}>{title}</p>
                <p className="text-xs text-text-muted mt-0.5">{desc}</p>
              </div>
              <div className="ml-auto flex-shrink-0 mt-1">
                <div
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    selected ? "border-primary-500" : "border-border"
                  )}
                >
                  {selected && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {guestType === "FAMILY" && (
        <div className="mt-4">
          <Select
            label="Familiengröße *"
            id="familySize"
            value={String(familySize)}
            onChange={(e) => setFamilySize(Number(e.target.value))}
            options={FAMILY_SIZE_OPTIONS}
          />
        </div>
      )}
    </div>
  );
}

function PersonForm({
  person,
  onChange,
  index,
  guestType,
  showAge,
}: {
  person: PersonFormData;
  onChange: (p: PersonFormData) => void;
  index: number;
  guestType: GuestType;
  showAge: boolean;
}) {
  const titleMap: Record<GuestType, string> = {
    SINGLE: "Gast-Informationen",
    COUPLE: index === 0 ? "Erste Person" : "Zweite Person",
    FAMILY: `Familienmitglied ${index + 1}`,
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text">{titleMap[guestType]}</h3>

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Vorname *"
          id={`firstName-${index}`}
          placeholder="Vorname"
          value={person.firstName}
          onChange={(e) => onChange({ ...person, firstName: e.target.value })}
        />
        <Input
          label="Nachname *"
          id={`lastName-${index}`}
          placeholder="Nachname"
          value={person.lastName}
          onChange={(e) => onChange({ ...person, lastName: e.target.value })}
        />
      </div>

      <Input
        label="E-Mail"
        id={`email-${index}`}
        type="email"
        placeholder="email@beispiel.de"
        value={person.email}
        onChange={(e) => onChange({ ...person, email: e.target.value })}
      />

      <Input
        label="Telefon"
        id={`phone-${index}`}
        type="tel"
        placeholder="+49 123 456789"
        value={person.phone}
        onChange={(e) => onChange({ ...person, phone: e.target.value })}
      />

      {showAge && (
        <Select
          label="Alter"
          id={`age-${index}`}
          value={person.age}
          onChange={(e) => onChange({ ...person, age: e.target.value as GuestAge })}
          options={Object.entries(GUEST_AGE_LABELS).map(([value, label]) => ({ value, label }))}
        />
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => onChange({ ...person, isWeddingParty: !person.isWeddingParty })}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
            person.isWeddingParty ? "bg-primary-500" : "bg-surface-muted"
          )}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
              person.isWeddingParty ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
        <label className="text-sm text-text cursor-pointer" onClick={() => onChange({ ...person, isWeddingParty: !person.isWeddingParty })}>
          Hochzeitsgesellschaft?
        </label>
      </div>
    </div>
  );
}

function AddressForm({
  address,
  setAddress,
}: {
  address: { street: string; city: string; zip: string; country: string };
  setAddress: (a: { street: string; city: string; zip: string; country: string }) => void;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text">Adressinformationen</h3>
      <p className="text-sm text-text-muted">Optionale Adressinformationen für den Haushalt.</p>

      <Input
        label="Straße & Hausnummer"
        id="street"
        placeholder="Musterstraße 1"
        value={address.street}
        onChange={(e) => setAddress({ ...address, street: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="PLZ"
          id="zip"
          placeholder="12345"
          value={address.zip}
          onChange={(e) => setAddress({ ...address, zip: e.target.value })}
        />
        <Input
          label="Stadt"
          id="city"
          placeholder="Berlin"
          value={address.city}
          onChange={(e) => setAddress({ ...address, city: e.target.value })}
        />
      </div>

      <Input
        label="Land"
        id="country"
        placeholder="Deutschland"
        value={address.country}
        onChange={(e) => setAddress({ ...address, country: e.target.value })}
      />
    </div>
  );
}

function DietaryForm({
  selectedDiets,
  setSelectedDiets,
  allergiesNote,
  setAllergiesNote,
  persons,
  guestType,
}: {
  selectedDiets: GuestDiet[];
  setSelectedDiets: (d: GuestDiet[]) => void;
  allergiesNote: string;
  setAllergiesNote: (n: string) => void;
  persons: PersonFormData[];
  guestType: GuestType;
}) {
  const toggleDiet = (diet: GuestDiet) => {
    if (selectedDiets.includes(diet)) {
      setSelectedDiets(selectedDiets.filter((d) => d !== diet));
    } else {
      setSelectedDiets([...selectedDiets, diet]);
    }
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold text-text">Ernährung & Notizen</h3>

      <div>
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2">Ernährungsweise</p>
        <div className="flex flex-wrap gap-2">
          {(Object.entries(GUEST_DIET_LABELS) as [GuestDiet, string][]).map(([key, label]) => {
            const active = selectedDiets.includes(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleDiet(key)}
                className={cn(
                  "px-3 py-1.5 text-xs font-medium rounded-full border transition-all duration-150",
                  active
                    ? "border-primary-500 bg-primary-500/15 text-primary-500"
                    : "border-border text-text-muted hover:border-primary-500/40 hover:bg-surface-2"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <TextArea
        label="Allergien / Notizen"
        id="allergiesNote"
        placeholder="z.B. Erdnussallergie, Rollstuhlfahrer, ..."
        value={allergiesNote}
        onChange={(e) => setAllergiesNote(e.target.value)}
      />

      {/* Summary */}
      <div className="border border-border rounded-xl p-4 bg-surface-2/50">
        <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-3">Zusammenfassung</p>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-text">
            <span className="text-text-muted">Typ:</span>
            <span className="font-medium">{GUEST_TYPE_LABELS[guestType]}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text">
            <span className="text-text-muted">Anzahl:</span>
            <span className="font-medium">{persons.length} {persons.length === 1 ? "Person" : "Personen"}</span>
          </div>
          {persons.map((p, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-text pl-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0" />
              <span>
                {p.firstName || "—"} {p.lastName || "—"}
                {p.age !== "ADULT" && <span className="text-text-muted ml-1">({GUEST_AGE_LABELS[p.age]})</span>}
                {p.isWeddingParty && <span className="text-primary-500 ml-1 text-xs">(Hochzeitsgesellschaft)</span>}
              </span>
            </div>
          ))}
          {selectedDiets.length > 0 && (
            <div className="flex items-start gap-2 text-sm text-text">
              <span className="text-text-muted">Ernährung:</span>
              <span className="font-medium">{selectedDiets.map((d) => GUEST_DIET_LABELS[d]).join(", ")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Wizard Component
// ---------------------------------------------------------------------------

export default function AddGuestWizard({ open, onClose, projectId, onSave }: AddGuestWizardProps) {
  // Step 0 = type selection, steps 1..N = person forms, N+1 = address, N+2 = dietary
  const [step, setStep] = useState(0);
  const [guestType, setGuestType] = useState<GuestType | null>(null);
  const [familySize, setFamilySize] = useState(3);
  const [persons, setPersons] = useState<PersonFormData[]>([{ ...DEFAULT_PERSON }]);
  const [address, setAddress] = useState({ street: "", city: "", zip: "", country: "" });
  const [selectedDiets, setSelectedDiets] = useState<GuestDiet[]>([]);
  const [allergiesNote, setAllergiesNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Derived values
  const personCount = guestType ? getPersonCount(guestType, familySize) : 0;
  const totalSteps = guestType ? 1 + personCount + 2 : 1; // type + persons + address + dietary
  const stepLabels = guestType ? ["Gast-Typ", ...getStepLabels(guestType, familySize)] : ["Gast-Typ"];

  // Reset wizard state
  const resetWizard = () => {
    setStep(0);
    setGuestType(null);
    setFamilySize(3);
    setPersons([{ ...DEFAULT_PERSON }]);
    setAddress({ street: "", city: "", zip: "", country: "" });
    setSelectedDiets([]);
    setAllergiesNote("");
    setSaving(false);
    setErrors({});
  };

  const handleClose = () => {
    resetWizard();
    onClose();
  };

  // When guest type changes, reset persons array
  const handleSetGuestType = (type: GuestType) => {
    setGuestType(type);
    const count = getPersonCount(type, familySize);
    setPersons(Array.from({ length: count }, () => ({ ...DEFAULT_PERSON })));
    setErrors({});
  };

  // When family size changes, resize persons array
  const handleSetFamilySize = (size: number) => {
    setFamilySize(size);
    setPersons((prev) => {
      if (size > prev.length) {
        return [...prev, ...Array.from({ length: size - prev.length }, () => ({ ...DEFAULT_PERSON }))];
      }
      return prev.slice(0, size);
    });
  };

  const updatePerson = (index: number, data: PersonFormData) => {
    setPersons((prev) => prev.map((p, i) => (i === index ? data : p)));
  };

  // Validation
  const validateCurrentStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!guestType) {
        newErrors.guestType = "Bitte wählen Sie einen Gast-Typ aus.";
      }
    } else if (step >= 1 && step <= personCount) {
      const personIdx = step - 1;
      const person = persons[personIdx];
      if (!person.firstName.trim()) {
        newErrors[`firstName-${personIdx}`] = "Vorname ist erforderlich.";
      }
      if (!person.lastName.trim()) {
        newErrors[`lastName-${personIdx}`] = "Nachname ist erforderlich.";
      }
    }
    // Address & Dietary steps have no required fields

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (step < totalSteps - 1) {
      setStep(step + 1);
      setErrors({});
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSave = async () => {
    if (!validateCurrentStep()) return;
    if (!guestType) return;

    setSaving(true);
    try {
      const guests: GuestWizardData[] = persons.map((p) => ({
        firstName: p.firstName.trim(),
        lastName: p.lastName.trim(),
        email: p.email.trim() || undefined,
        phone: p.phone.trim() || undefined,
        age: p.age,
        diet: selectedDiets.length > 0 ? selectedDiets : undefined,
        allergiesNote: allergiesNote.trim() || undefined,
        isWeddingParty: p.isWeddingParty,
        address: address.street.trim() || undefined,
        city: address.city.trim() || undefined,
        zip: address.zip.trim() || undefined,
        country: address.country.trim() || undefined,
        guestType,
        notes: undefined,
      }));

      await onSave(guests);
      handleClose();
    } catch {
      setSaving(false);
    }
  };

  // Determine which content to render
  const isLastStep = step === totalSteps - 1;
  const isAddressStep = guestType && step === personCount + 1;
  const isDietaryStep = guestType && step === personCount + 2;
  const personStepIndex = step >= 1 && step <= personCount ? step - 1 : -1;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative bg-surface-1 border border-border rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex overflow-hidden">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-text-faint hover:text-text-muted transition-colors duration-150 rounded-lg hover:bg-surface-2 p-1.5"
        >
          <CloseIcon />
        </button>

        {/* Left sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-border p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-text">
              {guestType ? GUEST_TYPE_LABELS[guestType] : "Gast hinzufügen"}
            </h2>
            <p className="text-xs text-text-muted mt-1">{getSidebarDescription(guestType)}</p>
          </div>

          {/* Step list */}
          <nav className="flex-1 space-y-1">
            {stepLabels.map((label, i) => {
              const isCurrent = step === i;
              const isCompleted = step > i;

              return (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <div
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-150",
                      isCurrent
                        ? "bg-primary-500 ring-2 ring-primary-500/30"
                        : isCompleted
                        ? "bg-primary-500"
                        : "bg-text-faint"
                    )}
                  />
                  <span
                    className={cn(
                      "text-xs transition-colors duration-150",
                      isCurrent ? "text-text font-medium" : isCompleted ? "text-text-muted" : "text-text-faint"
                    )}
                  >
                    {label}
                  </span>
                </div>
              );
            })}
          </nav>

          {/* Step counter */}
          <div className="pt-4 border-t border-border mt-4">
            <p className="text-xs text-text-faint">
              Schritt {step + 1} von {totalSteps}
            </p>
          </div>
        </div>

        {/* Right content area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-6">
            {/* Step 0: Type selection */}
            {step === 0 && (
              <StepTypeSelection
                guestType={guestType}
                setGuestType={handleSetGuestType}
                familySize={familySize}
                setFamilySize={handleSetFamilySize}
              />
            )}

            {/* Person form steps */}
            {personStepIndex >= 0 && (
              <PersonForm
                key={personStepIndex}
                person={persons[personStepIndex]}
                onChange={(p) => updatePerson(personStepIndex, p)}
                index={personStepIndex}
                guestType={guestType!}
                showAge={guestType === "FAMILY"}
              />
            )}

            {/* Address step */}
            {isAddressStep && <AddressForm address={address} setAddress={setAddress} />}

            {/* Dietary step */}
            {isDietaryStep && (
              <DietaryForm
                selectedDiets={selectedDiets}
                setSelectedDiets={setSelectedDiets}
                allergiesNote={allergiesNote}
                setAllergiesNote={setAllergiesNote}
                persons={persons}
                guestType={guestType!}
              />
            )}

            {/* Validation errors */}
            {Object.keys(errors).length > 0 && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                {Object.values(errors).map((err, i) => (
                  <p key={i} className="text-xs text-red-500">
                    {err}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* Footer navigation */}
          <div className="flex items-center justify-between p-6 border-t border-border">
            <div>
              {step > 0 && (
                <Button variant="ghost" onClick={handlePrev} disabled={saving}>
                  Zurück
                </Button>
              )}
            </div>
            <div>
              {isLastStep ? (
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? "Speichern..." : "Gäste speichern"}
                </Button>
              ) : (
                <Button variant="primary" onClick={handleNext}>
                  Weiter
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
