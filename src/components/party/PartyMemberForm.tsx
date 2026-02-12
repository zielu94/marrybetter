"use client";

import { useState } from "react";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ToggleButtonGroup from "@/components/ui/ToggleButtonGroup";
import {
  createPartyMember,
  updatePartyMember,
  deletePartyMember,
} from "@/actions/party.actions";
import {
  WEDDING_PARTY_ROLE_LABELS,
  WEDDING_PARTY_SIDE_LABELS,
} from "@/types";

interface PartyMemberData {
  id: string;
  name: string;
  role: string;
  side: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

interface PartyMemberFormProps {
  projectId: string;
  member?: PartyMemberData | null;
  onClose: () => void;
}

const roleOptions = Object.entries(WEDDING_PARTY_ROLE_LABELS).map(
  ([value, label]) => ({ value, label })
);
const sideOptions = Object.entries(WEDDING_PARTY_SIDE_LABELS).map(
  ([value, label]) => ({ value, label })
);

export default function PartyMemberForm({
  projectId,
  member,
  onClose,
}: PartyMemberFormProps) {
  const [role, setRole] = useState<string | string[]>(member?.role || "");
  const [side, setSide] = useState<string | string[]>(member?.side || "");

  async function handleSubmit(formData: FormData) {
    formData.set("role", typeof role === "string" ? role : "");
    formData.set("side", typeof side === "string" ? side : "");

    if (member) {
      formData.set("id", member.id);
      await updatePartyMember(formData);
    } else {
      formData.set("projectId", projectId);
      await createPartyMember(formData);
    }
    onClose();
  }

  async function handleDelete() {
    if (!member) return;
    const fd = new FormData();
    fd.set("id", member.id);
    await deletePartyMember(fd);
    onClose();
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-5 max-h-[70vh] overflow-y-auto px-1"
    >
      <Input
        name="name"
        label="Name"
        defaultValue={member?.name || ""}
        required
      />

      <ToggleButtonGroup
        label="Rolle"
        options={roleOptions}
        value={role}
        onChange={setRole}
      />

      <ToggleButtonGroup
        label="Seite"
        options={sideOptions}
        value={side}
        onChange={setSide}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          name="email"
          label="E-Mail"
          type="email"
          defaultValue={member?.email || ""}
        />
        <Input
          name="phone"
          label="Telefon"
          defaultValue={member?.phone || ""}
        />
      </div>

      <div className="w-full">
        <label className="block text-sm font-medium text-text-muted mb-1.5">
          Notizen
        </label>
        <textarea
          name="notes"
          rows={3}
          defaultValue={member?.notes || ""}
          className="w-full px-4 py-3 rounded-xl border border-border bg-yellow-50 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all duration-200"
        />
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <Button type="submit" variant="primary" size="lg" fullWidth>
          Speichern
        </Button>
        {member && (
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 text-sm font-medium hover:text-red-600"
          >
            Löschen
          </button>
        )}
      </div>
    </form>
  );
}
