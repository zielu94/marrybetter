"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import BudgetCategoryForm from "./BudgetCategoryForm";

interface BudgetPageClientProps {
  projectId: string;
}

export default function BudgetPageClient({ projectId }: BudgetPageClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium text-text-muted hover:text-text hover:bg-surface-2 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Kategorie
      </button>
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Neue Kategorie">
        <BudgetCategoryForm projectId={projectId} onClose={() => setShowForm(false)} />
      </Modal>
    </>
  );
}
