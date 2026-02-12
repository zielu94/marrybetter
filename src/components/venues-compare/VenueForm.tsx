"use client";

import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createVenue, updateVenue } from "@/actions/venue.actions";

interface VenueFormProps {
  projectId: string;
  venue?: {
    id: string;
    name: string;
    contactName: string | null;
    email: string | null;
    phone: string | null;
    website: string | null;
    address: string | null;
    capacity: number | null;
    imageUrl: string | null;
    pros: string | null;
    notes: string | null;
  } | null;
  onClose: () => void;
}

export default function VenueForm({ projectId, venue, onClose }: VenueFormProps) {
  return (
    <form
      action={async (formData) => {
        if (venue) {
          await updateVenue(formData);
        } else {
          await createVenue(formData);
        }
        onClose();
      }}
      className="space-y-4"
    >
      {venue ? (
        <input type="hidden" name="id" value={venue.id} />
      ) : (
        <input type="hidden" name="projectId" value={projectId} />
      )}

      <Input name="name" label="Name" defaultValue={venue?.name} required />

      <div className="grid grid-cols-2 gap-4">
        <Input name="contactName" label="Ansprechpartner" defaultValue={venue?.contactName || ""} />
        <Input name="email" label="E-Mail" type="email" defaultValue={venue?.email || ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input name="phone" label="Telefon" defaultValue={venue?.phone || ""} />
        <Input name="website" label="Website" defaultValue={venue?.website || ""} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input name="address" label="Adresse" defaultValue={venue?.address || ""} />
        <Input name="capacity" label="Kapazitaet (Personen)" type="number" defaultValue={venue?.capacity ?? ""} />
      </div>

      <Input name="imageUrl" label="Bild-URL" defaultValue={venue?.imageUrl || ""} />

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Vorteile</label>
        <textarea
          name="pros"
          rows={3}
          placeholder="z.B. Schoener Garten, Parkplaetze vorhanden..."
          defaultValue={venue?.pros || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200 placeholder:text-text-faint"
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Notizen</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={venue?.notes || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200 placeholder:text-text-faint"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={onClose}>Abbrechen</Button>
        <Button type="submit">{venue ? "Speichern" : "Hinzufügen"}</Button>
      </div>
    </form>
  );
}
