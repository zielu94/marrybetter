"use client";

import { useState, useMemo } from "react";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  updateGuestMeal,
  createFoodCategory,
  createFoodItem,
  updateFoodItem,
  deleteFoodItem,
  deleteFoodCategory,
} from "@/actions/food.actions";
import {
  MEAL_TYPE_LABELS,
  GUEST_DIET_LABELS,
  GUEST_STATUS_LABELS,
  type MealType,
  type GuestDiet,
} from "@/types";

/* ─── Types ─── */

interface GuestMeal {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  diet: string | null;
  mealType: string;
  allergiesNote: string | null;
  age: string | null;
  seatingTableName: string | null;
}

interface DrinkItem {
  id: string;
  name: string;
  quantity: number | null;
  notes: string | null;
}

interface DrinkCategory {
  id: string;
  name: string;
  items: DrinkItem[];
}

interface FoodPageClientProps {
  projectId: string;
  guests: GuestMeal[];
  drinkCategories: DrinkCategory[];
}

/* ─── Helpers ─── */

const DIET_ICONS: Record<string, string> = {
  VEGAN: "\uD83C\uDF31",
  VEGETARIAN: "\uD83E\uDD66",
  PESCATARIAN: "\uD83D\uDC1F",
  GLUTEN_FREE: "\uD83C\uDF3E",
  NUT_FREE: "\uD83E\uDD5C",
  DAIRY_FREE: "\uD83E\uDD5B",
  FLEXITARIAN: "\uD83C\uDF3F",
  OTHER: "\u2753",
};

const MEAL_COLORS: Record<string, string> = {
  STANDARD: "bg-surface-2 text-text-muted",
  VEGETARIAN: "bg-green-50 text-green-700",
  VEGAN: "bg-emerald-50 text-emerald-700",
  KIDS: "bg-amber-50 text-amber-700",
  CUSTOM: "bg-purple-50 text-purple-700",
};

function parseDietTags(diet: string | null): string[] {
  if (!diet) return [];
  return diet.split(",").map((s) => s.trim()).filter(Boolean);
}

/* ─── Component ─── */

export default function FoodPageClient({
  projectId,
  guests,
  drinkCategories,
}: FoodPageClientProps) {
  const [activeTab, setActiveTab] = useState<"meals" | "drinks">("meals");
  const [search, setSearch] = useState("");
  const [filterMeal, setFilterMeal] = useState<string>("");
  const [filterDiet, setFilterDiet] = useState<string>("");
  const [selectedGuest, setSelectedGuest] = useState<GuestMeal | null>(null);
  const [showDrinkCategoryForm, setShowDrinkCategoryForm] = useState(false);
  const [showDrinkItemForm, setShowDrinkItemForm] = useState<string | null>(null);
  const [editingDrinkItem, setEditingDrinkItem] = useState<DrinkItem | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [expandedDrinkCategories, setExpandedDrinkCategories] = useState<Set<string>>(new Set());

  // ── Computed stats ──
  const attending = useMemo(() => guests.filter((g) => g.status === "CONFIRMED"), [guests]);
  const totalGuests = guests.length;
  const attendingCount = attending.length;

  const mealCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    Object.keys(MEAL_TYPE_LABELS).forEach((k) => (counts[k] = 0));
    attending.forEach((g) => {
      counts[g.mealType] = (counts[g.mealType] || 0) + 1;
    });
    return counts;
  }, [attending]);

  const dietCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    attending.forEach((g) => {
      parseDietTags(g.diet).forEach((tag) => {
        counts[tag] = (counts[tag] || 0) + 1;
      });
    });
    return counts;
  }, [attending]);

  const allergiesCount = useMemo(
    () => attending.filter((g) => g.allergiesNote).length,
    [attending]
  );

  const specialMeals = useMemo(
    () => attendingCount - (mealCounts["STANDARD"] || 0),
    [attendingCount, mealCounts]
  );

  // ── Exceptions: guests who need attention ──
  const exceptions = useMemo(() => {
    return guests.filter((g) => {
      if (g.status === "DECLINED") return false;
      const hasDiet = parseDietTags(g.diet).length > 0;
      const hasAllergy = !!g.allergiesNote;
      const isSpecialMeal = g.mealType !== "STANDARD";
      const isKid = g.age === "KID" || g.age === "BABY";
      return hasDiet || hasAllergy || isSpecialMeal || isKid;
    });
  }, [guests]);

  // ── Filtered guest list (for table) ──
  const filteredGuests = useMemo(() => {
    let list = guests.filter((g) => g.status !== "DECLINED");

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (g) =>
          g.firstName.toLowerCase().includes(q) ||
          g.lastName.toLowerCase().includes(q)
      );
    }
    if (filterMeal) {
      list = list.filter((g) => g.mealType === filterMeal);
    }
    if (filterDiet) {
      list = list.filter((g) => parseDietTags(g.diet).includes(filterDiet));
    }
    return list;
  }, [guests, search, filterMeal, filterDiet]);

  // ── Drink category toggle ──
  function toggleDrinkCategory(id: string) {
    setExpandedDrinkCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── CSV Export ──
  function exportCSV() {
    const rows = [
      ["Name", "Status", "Menüart", "Ernährung", "Allergien / Hinweise", "Tisch"],
    ];
    filteredGuests.forEach((g) => {
      rows.push([
        `${g.firstName} ${g.lastName}`,
        GUEST_STATUS_LABELS[g.status as keyof typeof GUEST_STATUS_LABELS] || g.status,
        MEAL_TYPE_LABELS[g.mealType as MealType] || g.mealType,
        parseDietTags(g.diet)
          .map((t) => GUEST_DIET_LABELS[t as GuestDiet] || t)
          .join(", "),
        g.allergiesNote || "",
        g.seatingTableName || "",
      ]);
    });
    const csv = "\uFEFF" + rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "catering-briefing.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text tracking-tight">
            Essen & Trinken
          </h1>
          <p className="text-[13px] text-text-muted mt-1">
            {attendingCount} Gäste zugesagt &middot; {specialMeals} Sonderwünsche &middot; {allergiesCount} Allergien
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium text-text-muted bg-surface-1 border border-border rounded-xl hover:bg-surface-2 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* ═══ KPI Strip ═══ */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Gäste gesamt", value: totalGuests, color: "text-text" },
          { label: "Zugesagt", value: attendingCount, color: "text-green-600" },
          { label: "Standard-Menü", value: mealCounts["STANDARD"] || 0, color: "text-text-muted" },
          { label: "Sondermenues", value: specialMeals, color: "text-amber-600" },
          { label: "Allergien", value: allergiesCount, color: "text-red-500" },
          {
            label: "Noch offen",
            value: guests.filter((g) => g.status === "PENDING").length,
            color: "text-orange-500",
          },
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="bg-surface-1 rounded-2xl border border-border px-4 py-3 shadow-sm"
          >
            <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">
              {kpi.label}
            </p>
            <p className={`text-2xl font-semibold mt-1 ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ═══ Tabs: Essen / Getränke ═══ */}
      <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl w-fit">
        {(["meals", "drinks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? "bg-surface-1 text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            {tab === "meals" ? "Mahlzeiten" : "Getränke"}
          </button>
        ))}
      </div>

      {/* ═══ Meals Tab ═══ */}
      {activeTab === "meals" && (
        <div className="space-y-6">
          {/* ── Meal Type Breakdown ── */}
          <div className="bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-text">Menüübersicht</h2>
              <p className="text-[13px] text-text-muted mt-0.5">
                Anzahl pro Menüart (nur zugesagte Gäste)
              </p>
            </div>
            <div className="divide-y divide-border">
              {Object.entries(MEAL_TYPE_LABELS).map(([key, label]) => {
                const count = mealCounts[key] || 0;
                const pct = attendingCount > 0 ? Math.round((count / attendingCount) * 100) : 0;
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-2 transition-colors cursor-pointer"
                    onClick={() => {
                      setFilterMeal(filterMeal === key ? "" : key);
                      setFilterDiet("");
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium ${
                          MEAL_COLORS[key] || "bg-surface-2 text-text-muted"
                        }`}
                      >
                        {label}
                      </span>
                      {filterMeal === key && (
                        <span className="text-[11px] text-primary-500 font-medium">Filter aktiv</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-1.5 bg-surface-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-text-faint rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-text w-8 text-right">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Dietary Tags Breakdown ── */}
          {Object.keys(dietCounts).length > 0 && (
            <div className="bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-base font-semibold text-text">Ernährungshinweise</h2>
                <p className="text-[13px] text-text-muted mt-0.5">
                  Diätwünsche der zugesagten Gäste
                </p>
              </div>
              <div className="flex flex-wrap gap-2 px-5 py-4">
                {Object.entries(dietCounts)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tag, count]) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setFilterDiet(filterDiet === tag ? "" : tag);
                        setFilterMeal("");
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                        filterDiet === tag
                          ? "bg-gray-900 text-white"
                          : "bg-surface-2 text-text-muted hover:bg-surface-2"
                      }`}
                    >
                      <span>{DIET_ICONS[tag] || ""}</span>
                      <span>{GUEST_DIET_LABELS[tag as GuestDiet] || tag}</span>
                      <span
                        className={`text-xs ${
                          filterDiet === tag ? "text-text-faint" : "text-text-faint"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* ── Search & Filters ── */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 max-w-sm">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-faint"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Gast suchen..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded-xl bg-surface-1 focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
              />
            </div>
            {(filterMeal || filterDiet || search) && (
              <button
                onClick={() => {
                  setSearch("");
                  setFilterMeal("");
                  setFilterDiet("");
                }}
                className="text-[13px] text-text-muted hover:text-text underline"
              >
                Filter zurücksetzen
              </button>
            )}
          </div>

          {/* ── Guest Meal Table ── */}
          <div className="bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <p className="text-sm font-medium text-text">
                {filteredGuests.length} Gäste
                {filterMeal && ` — ${MEAL_TYPE_LABELS[filterMeal as MealType]}`}
                {filterDiet && ` — ${GUEST_DIET_LABELS[filterDiet as GuestDiet]}`}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider border-b border-border">
                    <th className="py-3 px-5">Name</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Menüart</th>
                    <th className="py-3 px-3">Ernährung</th>
                    <th className="py-3 px-3">Allergien</th>
                    <th className="py-3 px-3">Tisch</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGuests.map((g) => {
                    const dietTags = parseDietTags(g.diet);
                    return (
                      <tr
                        key={g.id}
                        onClick={() => setSelectedGuest(g)}
                        className={`border-b border-border hover:bg-surface-2 cursor-pointer transition-colors ${
                          selectedGuest?.id === g.id ? "bg-primary-50" : ""
                        }`}
                      >
                        <td className="py-3 px-5">
                          <p className="font-medium text-text">
                            {g.firstName} {g.lastName}
                          </p>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                              g.status === "CONFIRMED"
                                ? "bg-green-50 text-green-700"
                                : "bg-orange-50 text-orange-600"
                            }`}
                          >
                            {GUEST_STATUS_LABELS[g.status as keyof typeof GUEST_STATUS_LABELS] || g.status}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                              MEAL_COLORS[g.mealType] || "bg-surface-2 text-text-muted"
                            }`}
                          >
                            {MEAL_TYPE_LABELS[g.mealType as MealType] || g.mealType}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {dietTags.length > 0
                              ? dietTags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] bg-surface-2 text-text-muted"
                                    title={GUEST_DIET_LABELS[tag as GuestDiet] || tag}
                                  >
                                    {DIET_ICONS[tag] || ""}{" "}
                                    {GUEST_DIET_LABELS[tag as GuestDiet] || tag}
                                  </span>
                                ))
                              : <span className="text-text-faint">—</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {g.allergiesNote ? (
                            <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                              {g.allergiesNote.length > 30
                                ? g.allergiesNote.slice(0, 30) + "..."
                                : g.allergiesNote}
                            </span>
                          ) : (
                            <span className="text-text-faint">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-text-muted text-xs">
                          {g.seatingTableName || <span className="text-text-faint">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredGuests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-text-faint text-sm">
                        Keine Gäste gefunden.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Exceptions Section ── */}
          {exceptions.length > 0 && (
            <div className="bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h2 className="text-base font-semibold text-text">
                  Sonderwünsche & Allergien
                </h2>
                <p className="text-[13px] text-text-muted mt-0.5">
                  Gäste mit besonderen Anforderungen — ideal als Catering-Briefing
                </p>
              </div>
              <div className="divide-y divide-border">
                {exceptions.map((g) => {
                  const dietTags = parseDietTags(g.diet);
                  return (
                    <div
                      key={g.id}
                      onClick={() => setSelectedGuest(g)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 hover:bg-surface-2 cursor-pointer transition-colors gap-2"
                    >
                      <div>
                        <p className="font-medium text-text text-sm">
                          {g.firstName} {g.lastName}
                          {(g.age === "KID" || g.age === "BABY") && (
                            <span className="ml-2 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                              {g.age === "KID" ? "Kind" : "Baby"}
                            </span>
                          )}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {g.mealType !== "STANDARD" && (
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                                MEAL_COLORS[g.mealType] || "bg-surface-2 text-text-muted"
                              }`}
                            >
                              {MEAL_TYPE_LABELS[g.mealType as MealType] || g.mealType}
                            </span>
                          )}
                          {dietTags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded text-[11px] bg-surface-2 text-text-muted"
                            >
                              {DIET_ICONS[tag] || ""}{" "}
                              {GUEST_DIET_LABELS[tag as GuestDiet] || tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      {g.allergiesNote && (
                        <p className="text-xs text-red-600 bg-red-50 px-3 py-1 rounded-lg max-w-xs">
                          {g.allergiesNote}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ Drinks Tab ═══ */}
      {activeTab === "drinks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-text">Getränke-Planung</h2>
              <p className="text-[13px] text-text-muted mt-0.5">
                Mengen und Notizen — keine Preise
              </p>
            </div>
            <Button size="sm" onClick={() => setShowDrinkCategoryForm(true)}>
              + Kategorie
            </Button>
          </div>

          {drinkCategories.length === 0 && (
            <div className="bg-surface-1 rounded-2xl border border-border shadow-sm p-8 text-center">
              <p className="text-text-faint text-sm">
                Noch keine Getränke-Kategorien vorhanden.
              </p>
              <p className="text-text-faint text-xs mt-1">
                Erstelle Kategorien wie &quot;Sekt / Empfang&quot;, &quot;Wein&quot;, &quot;Bier&quot; usw.
              </p>
            </div>
          )}

          {drinkCategories.map((cat) => {
            const isExpanded = expandedDrinkCategories.has(cat.id);
            return (
              <div
                key={cat.id}
                className="bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleDrinkCategory(cat.id)}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-2 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className={`w-4 h-4 text-text-faint transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <div className="text-left">
                      <p className="font-medium text-text text-sm">{cat.name}</p>
                      <p className="text-[11px] text-text-faint">{cat.items.length} Positionen</p>
                    </div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border px-5 py-3">
                    {cat.items.length > 0 ? (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider border-b border-border">
                            <th className="py-2 pr-4">Getraenk</th>
                            <th className="py-2 pr-4 text-right">Menge</th>
                            <th className="py-2 pr-4">Notizen</th>
                            <th className="py-2 w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-border hover:bg-surface-2"
                            >
                              <td className="py-2 pr-4 text-text">{item.name}</td>
                              <td className="py-2 pr-4 text-right text-text-muted">
                                {item.quantity ?? "—"}
                              </td>
                              <td className="py-2 pr-4 text-text-muted text-xs">
                                {item.notes || "—"}
                              </td>
                              <td className="py-2 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => {
                                      setEditingDrinkItem(item);
                                      setEditingCategoryId(cat.id);
                                    }}
                                    className="text-text-faint hover:text-primary-500 transition-colors"
                                  >
                                    <svg
                                      className="w-3.5 h-3.5"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                      />
                                    </svg>
                                  </button>
                                  <form action={deleteFoodItem}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <button
                                      type="submit"
                                      className="text-text-faint hover:text-red-500 transition-colors"
                                    >
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                      </svg>
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <p className="text-sm text-text-faint py-2">Noch keine Positionen</p>
                    )}

                    <div className="flex gap-2 mt-3 pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          setShowDrinkItemForm(cat.id);
                          setEditingDrinkItem(null);
                        }}
                        className="text-[13px] text-primary-600 hover:text-primary-700 font-medium"
                      >
                        + Position hinzufügen
                      </button>
                      <form action={deleteFoodCategory} className="ml-auto">
                        <input type="hidden" name="id" value={cat.id} />
                        <button
                          type="submit"
                          className="text-[13px] text-red-400 hover:text-red-600 font-medium"
                        >
                          Kategorie löschen
                        </button>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ═══ Guest Inspector (right side / modal) ═══ */}
      {selectedGuest && (
        <GuestMealInspector
          key={selectedGuest.id}
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
        />
      )}

      {/* ═══ Drink Category Modal ═══ */}
      <Modal
        open={showDrinkCategoryForm}
        onClose={() => setShowDrinkCategoryForm(false)}
        title="Neue Getränke-Kategorie"
      >
        <form
          action={async (formData) => {
            await createFoodCategory(formData);
            setShowDrinkCategoryForm(false);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <Input
            name="name"
            label="Kategoriename"
            required
            placeholder="z.B. Sekt, Wein, Bier..."
          />
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDrinkCategoryForm(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit">Hinzufügen</Button>
          </div>
        </form>
      </Modal>

      {/* ═══ Drink Item Modal ═══ */}
      <Modal
        open={!!showDrinkItemForm || !!editingDrinkItem}
        onClose={() => {
          setShowDrinkItemForm(null);
          setEditingDrinkItem(null);
          setEditingCategoryId(null);
        }}
        title={editingDrinkItem ? "Position bearbeiten" : "Neue Position"}
      >
        <form
          action={async (formData) => {
            if (editingDrinkItem) {
              await updateFoodItem(formData);
            } else {
              await createFoodItem(formData);
            }
            setShowDrinkItemForm(null);
            setEditingDrinkItem(null);
            setEditingCategoryId(null);
          }}
          className="space-y-4"
        >
          {editingDrinkItem ? (
            <input type="hidden" name="id" value={editingDrinkItem.id} />
          ) : (
            <input
              type="hidden"
              name="foodCategoryId"
              value={showDrinkItemForm || editingCategoryId || ""}
            />
          )}
          <Input
            name="name"
            label="Name"
            defaultValue={editingDrinkItem?.name || ""}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              name="quantity"
              label="Menge"
              type="number"
              defaultValue={editingDrinkItem?.quantity ?? ""}
              placeholder="z.B. 24"
            />
            <div className="w-full">
              <label className="block text-sm font-medium text-text-muted mb-1.5">
                Notizen
              </label>
              <input
                name="notes"
                defaultValue={editingDrinkItem?.notes || ""}
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm"
                placeholder="z.B. Flaschen, Kasten..."
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowDrinkItemForm(null);
                setEditingDrinkItem(null);
                setEditingCategoryId(null);
              }}
            >
              Abbrechen
            </Button>
            <Button type="submit">
              {editingDrinkItem ? "Speichern" : "Hinzufügen"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/* ─── Guest Meal Inspector ─── */

function GuestMealInspector({
  guest,
  onClose,
}: {
  guest: GuestMeal;
  onClose: () => void;
}) {
  const [mealType, setMealType] = useState(guest.mealType);
  const [dietStr, setDietStr] = useState(guest.diet || "");
  const [allergiesNote, setAllergiesNote] = useState(guest.allergiesNote || "");

  const dietTags = parseDietTags(dietStr);

  function toggleDietTag(tag: string) {
    const current = parseDietTags(dietStr);
    const next = current.includes(tag)
      ? current.filter((t) => t !== tag)
      : [...current, tag];
    setDietStr(next.join(","));
  }

  return (
    <Modal open={true} onClose={onClose} title="Essensdetails bearbeiten">
      <form
        action={async (fd) => {
          fd.set("id", guest.id);
          fd.set("mealType", mealType);
          fd.set("diet", dietStr);
          fd.set("allergiesNote", allergiesNote);
          await updateGuestMeal(fd);
          onClose();
        }}
        className="space-y-5"
      >
        <div>
          <p className="text-lg font-semibold text-text">
            {guest.firstName} {guest.lastName}
          </p>
          <p className="text-[13px] text-text-muted mt-0.5">
            {GUEST_STATUS_LABELS[guest.status as keyof typeof GUEST_STATUS_LABELS] || guest.status}
            {guest.seatingTableName && ` \u00b7 Tisch: ${guest.seatingTableName}`}
          </p>
        </div>

        {/* Meal Type */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Menüart
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(MEAL_TYPE_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setMealType(key)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  mealType === key
                    ? "bg-gray-900 text-white"
                    : "bg-surface-2 text-text-muted hover:bg-surface-2"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Diet Tags */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-2">
            Ernährungshinweise
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(GUEST_DIET_LABELS).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => toggleDietTag(key)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  dietTags.includes(key)
                    ? "bg-green-600 text-white"
                    : "bg-surface-2 text-text-muted hover:bg-surface-2"
                }`}
              >
                <span>{DIET_ICONS[key] || ""}</span> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies Note */}
        <div>
          <label className="block text-sm font-medium text-text-muted mb-1.5">
            Allergien / Unvertraeglichkeiten
          </label>
          <textarea
            value={allergiesNote}
            onChange={(e) => setAllergiesNote(e.target.value)}
            rows={2}
            placeholder="z.B. Erdnussallergie, Laktoseintoleranz..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm placeholder:text-text-faint"
          />
        </div>

        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Abbrechen
          </Button>
          <Button type="submit">Speichern</Button>
        </div>
      </form>
    </Modal>
  );
}
