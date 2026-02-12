"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ToggleButtonGroup from "@/components/ui/ToggleButtonGroup";
import { createGuest, updateGuest, deleteGuest } from "@/actions/guest.actions";
import {
  GUEST_SOURCE_LABELS,
  GUEST_CATEGORY_LABELS,
  GUEST_ROLE_LABELS,
  GUEST_AGE_LABELS,
  GUEST_DIET_LABELS,
} from "@/types";

interface GuestData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  source: string | null;
  category: string | null;
  role: string | null;
  age: string | null;
  diet: string | null;
  status: string;
  tableNumber: number | null;
  notes: string | null;
  inviteSent: boolean;
}

interface GuestFormProps {
  projectId: string;
  guest?: GuestData | null;
  onClose: () => void;
}

const sourceOptions = Object.entries(GUEST_SOURCE_LABELS).map(([value, label]) => ({ value, label }));
const categoryOptions = Object.entries(GUEST_CATEGORY_LABELS).map(([value, label]) => ({ value, label }));
const roleOptions = Object.entries(GUEST_ROLE_LABELS).map(([value, label]) => ({ value, label }));
const ageOptions = Object.entries(GUEST_AGE_LABELS).map(([value, label]) => ({ value, label }));
const dietOptions = Object.entries(GUEST_DIET_LABELS).map(([value, label]) => ({ value, label }));

export default function GuestForm({ projectId, guest, onClose }: GuestFormProps) {
  const [fullName, setFullName] = useState(
    guest ? `${guest.firstName}${guest.lastName ? " " + guest.lastName : ""}` : ""
  );
  const [source, setSource] = useState<string | string[]>(guest?.source || "");
  const [category, setCategory] = useState<string | string[]>(guest?.category || "");
  const [role, setRole] = useState<string | string[]>(guest?.role || "");
  const [age, setAge] = useState<string | string[]>(guest?.age || "");
  const [inviteSent, setInviteSent] = useState<string | string[]>(guest?.inviteSent ? "yes" : "no");
  const [status, setStatus] = useState<string | string[]>(guest?.status === "CONFIRMED" ? "yes" : guest?.status === "DECLINED" ? "no" : "");
  const [diet, setDiet] = useState<string | string[]>(guest?.diet ? guest.diet.split(",") : []);

  async function handleSubmit(formData: FormData) {
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    formData.set("source", typeof source === "string" ? source : "");
    formData.set("category", typeof category === "string" ? category : "");
    formData.set("role", typeof role === "string" ? role : "");
    formData.set("age", typeof age === "string" ? age : "");
    formData.set("inviteSent", inviteSent === "yes" ? "true" : "false");
    formData.set("status", status === "yes" ? "CONFIRMED" : status === "no" ? "DECLINED" : "PENDING");
    formData.set("diet", Array.isArray(diet) ? diet.join(",") : "");

    if (guest) {
      formData.set("id", guest.id);
      await updateGuest(formData);
    } else {
      formData.set("projectId", projectId);
      await createGuest(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!guest) return;
    const fd = new FormData();
    fd.set("id", guest.id);
    await deleteGuest(fd);
    onClose();
  }

  return (
    <form action={handleSubmit} className="space-y-5 max-h-[70vh] overflow-y-auto px-1">
      <Input
        name="_fullName"
        label="Full Name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        required
      />

      <ToggleButtonGroup label="Source" options={sourceOptions} value={source} onChange={setSource} />
      <ToggleButtonGroup label="Category" options={categoryOptions} value={category} onChange={setCategory} />
      <ToggleButtonGroup label="Role" options={roleOptions} value={role} onChange={setRole} />
      <ToggleButtonGroup label="Age" options={ageOptions} value={age} onChange={setAge} />

      <div className="grid grid-cols-2 gap-4">
        <Input name="email" label="E-Mail" type="email" defaultValue={guest?.email || ""} />
        <Input name="phone" label="Telephone" defaultValue={guest?.phone || ""} />
      </div>

      <Input name="address" label="Address" defaultValue={guest?.address || ""} />

      <div className="grid grid-cols-2 gap-4 items-end">
        <ToggleButtonGroup
          label="Invite sent"
          options={[{ value: "yes", label: "yes" }, { value: "no", label: "no" }]}
          value={inviteSent}
          onChange={setInviteSent}
        />
        <Input name="tableNumber" label="Table" type="number" defaultValue={guest?.tableNumber ?? ""} />
      </div>

      <ToggleButtonGroup
        label="Status"
        options={[{ value: "yes", label: "yes" }, { value: "no", label: "no" }]}
        value={status}
        onChange={setStatus}
      />

      <ToggleButtonGroup label="Diet" options={dietOptions} value={diet} onChange={setDiet} multi />

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">Notes</label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={guest?.notes || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-yellow-50 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
        />
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          Submit
        </Button>
        {guest && (
          <button type="button" onClick={handleDelete} className="text-red-500 text-sm font-medium hover:text-red-600">
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
