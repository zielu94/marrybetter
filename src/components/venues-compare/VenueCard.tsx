"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import { formatCurrency } from "@/lib/utils";
import { deleteVenue, deleteVenueCostItem } from "@/actions/venue.actions";
import VenueCostItemForm from "./VenueCostItemForm";

interface CostItem {
  id: string;
  name: string;
  amount: number;
  notes: string | null;
}

interface Venue {
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
  costItems: CostItem[];
}

interface VenueCardProps {
  venue: Venue;
  onEdit: () => void;
}

export default function VenueCard({ venue, onEdit }: VenueCardProps) {
  const [showCostForm, setShowCostForm] = useState(false);
  const [editingCostItem, setEditingCostItem] = useState<CostItem | null>(null);

  const totalCost = venue.costItems.reduce((sum, item) => sum + item.amount, 0);
  const prosArray = venue.pros
    ? venue.pros.split("\n").filter((p) => p.trim())
    : [];

  return (
    <Card padding="md" className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-text text-lg">{venue.name}</h3>
          {venue.capacity && (
            <Badge variant="info" className="mt-1">
              {venue.capacity} Personen
            </Badge>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-text-faint hover:text-primary-500 transition-colors p-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          <form action={deleteVenue}>
            <input type="hidden" name="id" value={venue.id} />
            <button type="submit" className="text-text-faint hover:text-red-500 transition-colors p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-1 text-sm text-text-muted mb-3">
        {venue.contactName && (
          <p className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {venue.contactName}
          </p>
        )}
        {venue.email && (
          <p className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {venue.email}
          </p>
        )}
        {venue.phone && (
          <p className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {venue.phone}
          </p>
        )}
        {venue.address && (
          <p className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {venue.address}
          </p>
        )}
        {venue.website && (
          <p className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <a href={venue.website.startsWith("http") ? venue.website : `https://${venue.website}`} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline truncate">
              {venue.website}
            </a>
          </p>
        )}
      </div>

      {/* Pros */}
      {prosArray.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-medium text-text-muted mb-1">Vorteile</p>
          <ul className="space-y-0.5">
            {prosArray.map((pro, i) => (
              <li key={i} className="text-sm text-text flex items-start gap-1.5">
                <svg className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {pro}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Notes */}
      {venue.notes && (
        <div className="mb-3">
          <p className="text-xs font-medium text-text-muted mb-1">Notizen</p>
          <p className="text-sm text-text-muted">{venue.notes}</p>
        </div>
      )}

      {/* Cost Items */}
      <div className="mt-auto border-t border-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-text-muted">Kosten</p>
          <Button size="sm" variant="ghost" onClick={() => setShowCostForm(true)}>
            + Kostenposition
          </Button>
        </div>

        {venue.costItems.length > 0 ? (
          <div className="space-y-1">
            {venue.costItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-1.5 px-2 hover:bg-surface-2 rounded-lg text-sm">
                <div className="flex-1">
                  <span className="text-text">{item.name}</span>
                  {item.notes && <span className="text-text-faint ml-2 text-xs">({item.notes})</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{formatCurrency(item.amount)}</span>
                  <button
                    onClick={() => setEditingCostItem(item)}
                    className="text-text-faint hover:text-primary-500 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <form action={deleteVenueCostItem}>
                    <input type="hidden" name="id" value={item.id} />
                    <button type="submit" className="text-text-faint hover:text-red-500 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 border-t border-border px-2">
              <span className="text-sm font-semibold text-text">Gesamt</span>
              <span className="text-sm font-bold text-text">{formatCurrency(totalCost)}</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-faint py-2">Noch keine Kostenpositionen</p>
        )}
      </div>

      {/* Total Cost Banner */}
      <div className="mt-3 bg-primary-50 rounded-xl px-4 py-3 text-center">
        <p className="text-xs text-primary-600">Gesamtkosten</p>
        <p className="text-xl font-bold text-primary-700">{formatCurrency(totalCost)}</p>
      </div>

      {/* Cost Item Modal */}
      <Modal
        open={showCostForm || !!editingCostItem}
        onClose={() => { setShowCostForm(false); setEditingCostItem(null); }}
        title={editingCostItem ? "Kostenposition bearbeiten" : "Neue Kostenposition"}
      >
        <VenueCostItemForm
          venueOptionId={venue.id}
          item={editingCostItem}
          onClose={() => { setShowCostForm(false); setEditingCostItem(null); }}
        />
      </Modal>
    </Card>
  );
}
