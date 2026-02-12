"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ToggleButtonGroup from "@/components/ui/ToggleButtonGroup";
import { createVendor, updateVendor, deleteVendor } from "@/actions/vendor.actions";
import { VENDOR_CATEGORY_LABELS, VENDOR_STATUS_LABELS } from "@/types";

interface VendorData {
  id: string;
  name: string;
  category: string;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  status: string;
  estimatedCost: number | null;
  actualCost: number | null;
  notes: string | null;
}

interface VendorFormProps {
  projectId: string;
  vendor?: VendorData | null;
  initialCategory?: string;
  initialStatus?: string;
  onClose: () => void;
}

const categoryOptions = Object.entries(VENDOR_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const statusOptions = Object.entries(VENDOR_STATUS_LABELS).map(([value, label]) => ({ value, label }));

export default function VendorForm({ projectId, vendor, initialCategory, initialStatus, onClose }: VendorFormProps) {
  const [category, setCategory] = useState<string | string[]>(vendor?.category || initialCategory || "");
  const [status, setStatus] = useState<string | string[]>(vendor?.status || initialStatus || "IDENTIFIED");

  async function handleSubmit(formData: FormData) {
    formData.set("category", typeof category === "string" ? category : "");
    formData.set("status", typeof status === "string" ? status : "IDENTIFIED");

    if (vendor) {
      formData.set("id", vendor.id);
      await updateVendor(formData);
    } else {
      formData.set("projectId", projectId);
      await createVendor(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!vendor) return;
    const fd = new FormData();
    fd.set("id", vendor.id);
    await deleteVendor(fd);
    onClose();
  }

  return (
    <form action={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
      <Input
        name="name"
        label="Name"
        defaultValue={vendor?.name || ""}
        required
      />

      <ToggleButtonGroup label="Kategorie" options={categoryOptions} value={category} onChange={setCategory} />
      <ToggleButtonGroup label="Status" options={statusOptions} value={status} onChange={setStatus} />

      <Input name="contactName" label="Kontaktperson" defaultValue={vendor?.contactName || ""} />

      <div className="grid grid-cols-2 gap-4">
        <Input name="email" label="E-Mail" type="email" defaultValue={vendor?.email || ""} />
        <Input name="phone" label="Telefon" defaultValue={vendor?.phone || ""} />
      </div>

      <Input name="website" label="Website" defaultValue={vendor?.website || ""} />

      <div className="grid grid-cols-2 gap-4">
        <Input name="estimatedCost" label="Geschätzte Kosten" type="number" step="0.01" defaultValue={vendor?.estimatedCost ?? ""} />
        <Input name="actualCost" label="Tatsaechliche Kosten" type="number" step="0.01" defaultValue={vendor?.actualCost ?? ""} />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Notizen</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={vendor?.notes || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-yellow-50 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
        />
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          Speichern
        </Button>
        {vendor && (
          <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-medium hover:text-red-600">
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
