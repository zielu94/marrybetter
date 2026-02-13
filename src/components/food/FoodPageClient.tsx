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
import { formatCurrency } from "@/lib/utils";

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

interface FoodItem {
  id: string;
  name: string;
  quantity: number | null;
  unitPrice: number | null;
  totalPrice: number | null;
  notes: string | null;
}

interface FoodCategory {
  id: string;
  name: string;
  items: FoodItem[];
}

interface FoodPageClientProps {
  projectId: string;
  guests: GuestMeal[];
  foodCategories: FoodCategory[];
  drinkCategories: FoodCategory[];
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
  VEGETARIAN: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  VEGAN: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  KIDS: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  CUSTOM: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

function parseDietTags(diet: string | null): string[] {
  if (!diet) return [];
  return diet.split(",").map((s) => s.trim()).filter(Boolean);
}

type TabType = "meals" | "menu" | "drinks";

const TAB_LABELS: Record<TabType, { label: string; icon: string }> = {
  meals: { label: "Gäste & Ernährung", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  menu: { label: "Speisekarte", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  drinks: { label: "Getränke", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
};

/* ─── Component ─── */

export default function FoodPageClient({
  projectId,
  guests,
  foodCategories,
  drinkCategories,
}: FoodPageClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("meals");
  const [search, setSearch] = useState("");
  const [filterMeal, setFilterMeal] = useState<string>("");
  const [filterDiet, setFilterDiet] = useState<string>("");
  const [selectedGuest, setSelectedGuest] = useState<GuestMeal | null>(null);

  // Category management state
  const [showCategoryForm, setShowCategoryForm] = useState<"food" | "drink" | null>(null);
  const [showItemForm, setShowItemForm] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

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

  // ── Category toggle ──
  function toggleCategory(id: string) {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Food menu total ──
  const foodMenuTotal = useMemo(() =>
    foodCategories.reduce((sum, cat) =>
      sum + cat.items.reduce((s, item) => s + (item.totalPrice || 0), 0), 0),
    [foodCategories]
  );

  const drinkMenuTotal = useMemo(() =>
    drinkCategories.reduce((sum, cat) =>
      sum + cat.items.reduce((s, item) => s + (item.totalPrice || 0), 0), 0),
    [drinkCategories]
  );

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

  // ── Render category list (shared between food & drinks) ──
  function renderCategoryList(categories: FoodCategory[], type: "food" | "drink") {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text">
              {type === "food" ? "Speisekarte" : "Getränkekarte"}
            </h2>
            <p className="text-[13px] text-text-muted mt-0.5">
              {type === "food"
                ? `${categories.length} Kategorien · ${formatCurrency(foodMenuTotal)} gesamt`
                : `${categories.length} Kategorien · ${formatCurrency(drinkMenuTotal)} gesamt`
              }
            </p>
          </div>
          <Button size="sm" onClick={() => setShowCategoryForm(type)}>
            + Kategorie
          </Button>
        </div>

        {categories.length === 0 && (
          <div className="bg-surface-1 rounded-2xl border border-border shadow-sm p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-text-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {type === "food" ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                )}
              </svg>
            </div>
            <p className="text-text-faint text-sm">
              {type === "food"
                ? "Noch keine Speise-Kategorien vorhanden."
                : "Noch keine Getränke-Kategorien vorhanden."}
            </p>
            <p className="text-text-faint text-xs mt-1">
              {type === "food"
                ? 'Erstelle Kategorien wie "Vorspeisen", "Hauptgang", "Desserts" usw.'
                : 'Erstelle Kategorien wie "Sekt / Empfang", "Wein", "Bier" usw.'}
            </p>
          </div>
        )}

        {categories.map((cat) => {
          const isExpanded = expandedCategories.has(cat.id);
          const catTotal = cat.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
          return (
            <div
              key={cat.id}
              className="bg-surface-1 rounded-2xl border border-border shadow-sm overflow-hidden"
            >
              <button
                onClick={() => toggleCategory(cat.id)}
                className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-surface-2/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-3.5 h-3.5 text-text-faint transition-transform duration-200 flex-shrink-0 ${isExpanded ? "rotate-90" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="text-left">
                    <p className="text-[14px] font-semibold text-text">{cat.name}</p>
                    <p className="text-[12px] text-text-faint">
                      {cat.items.length} Position{cat.items.length !== 1 ? "en" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[14px] font-semibold text-text tabular-nums">
                    {formatCurrency(catTotal)}
                  </p>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-border">
                  {cat.items.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-[11px] font-medium text-text-faint uppercase tracking-wider border-b border-border">
                            <th className="py-2.5 px-5">Name</th>
                            <th className="py-2.5 px-3 text-right">Menge</th>
                            <th className="py-2.5 px-3 text-right">Einzelpreis</th>
                            <th className="py-2.5 px-3 text-right">Gesamt</th>
                            <th className="py-2.5 px-3">Notizen</th>
                            <th className="py-2.5 px-3 w-16"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {cat.items.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-border hover:bg-surface-2/50 transition-colors group"
                            >
                              <td className="py-2.5 px-5 text-text font-medium text-[13px]">{item.name}</td>
                              <td className="py-2.5 px-3 text-right text-text-muted text-[13px] tabular-nums">
                                {item.quantity ?? "\u2014"}
                              </td>
                              <td className="py-2.5 px-3 text-right text-text-muted text-[13px] tabular-nums">
                                {item.unitPrice != null ? formatCurrency(item.unitPrice) : "\u2014"}
                              </td>
                              <td className="py-2.5 px-3 text-right font-medium text-text text-[13px] tabular-nums">
                                {item.totalPrice != null ? formatCurrency(item.totalPrice) : "\u2014"}
                              </td>
                              <td className="py-2.5 px-3 text-text-muted text-xs max-w-[200px] truncate">
                                {item.notes || "\u2014"}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => {
                                      setEditingItem(item);
                                      setEditingCategoryId(cat.id);
                                    }}
                                    className="p-1.5 rounded-lg text-text-faint hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                  >
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                  </button>
                                  <form action={deleteFoodItem}>
                                    <input type="hidden" name="id" value={item.id} />
                                    <button
                                      type="submit"
                                      className="p-1.5 rounded-lg text-text-faint hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                                    >
                                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-[13px] text-text-faint text-center py-6">Noch keine Positionen</p>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between px-5 py-3 border-t border-border bg-surface-2/30">
                    <button
                      onClick={() => {
                        setShowItemForm(cat.id);
                        setEditingItem(null);
                      }}
                      className="inline-flex items-center gap-1.5 text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Position hinzufügen
                    </button>
                    <form action={deleteFoodCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button type="submit" className="text-[12px] text-text-faint hover:text-red-500 transition-colors">
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
    );
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
          { label: "Sondermenüs", value: specialMeals, color: "text-amber-600" },
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

      {/* ═══ Tabs ═══ */}
      <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl w-fit">
        {(["meals", "menu", "drinks"] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`inline-flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === tab
                ? "bg-surface-1 text-text shadow-sm"
                : "text-text-muted hover:text-text"
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={TAB_LABELS[tab].icon} />
            </svg>
            {TAB_LABELS[tab].label}
          </button>
        ))}
      </div>

      {/* ═══ Meals Tab — Guest dietary info ═══ */}
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
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-2/50 transition-colors cursor-pointer"
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
                      <span className="text-sm font-semibold text-text w-8 text-right tabular-nums">
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
                          ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
                          : "bg-surface-2 text-text-muted hover:bg-surface-2"
                      }`}
                    >
                      <span>{DIET_ICONS[tag] || ""}</span>
                      <span>{GUEST_DIET_LABELS[tag as GuestDiet] || tag}</span>
                      <span className="text-xs text-text-faint">
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
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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
                {filterMeal && ` \u2014 ${MEAL_TYPE_LABELS[filterMeal as MealType]}`}
                {filterDiet && ` \u2014 ${GUEST_DIET_LABELS[filterDiet as GuestDiet]}`}
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
                        className={`border-b border-border hover:bg-surface-2/50 cursor-pointer transition-colors ${
                          selectedGuest?.id === g.id ? "bg-primary-50 dark:bg-primary-900/20" : ""
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
                                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                : "bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
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
                              : <span className="text-text-faint">\u2014</span>}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {g.allergiesNote ? (
                            <span className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-md">
                              {g.allergiesNote.length > 30
                                ? g.allergiesNote.slice(0, 30) + "..."
                                : g.allergiesNote}
                            </span>
                          ) : (
                            <span className="text-text-faint">\u2014</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-text-muted text-xs">
                          {g.seatingTableName || <span className="text-text-faint">\u2014</span>}
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
                      className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 hover:bg-surface-2/50 cursor-pointer transition-colors gap-2"
                    >
                      <div>
                        <p className="font-medium text-text text-sm">
                          {g.firstName} {g.lastName}
                          {(g.age === "KID" || g.age === "BABY") && (
                            <span className="ml-2 text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400 px-1.5 py-0.5 rounded">
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
                        <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-lg max-w-xs">
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

      {/* ═══ Menu Tab — Food categories ═══ */}
      {activeTab === "menu" && renderCategoryList(foodCategories, "food")}

      {/* ═══ Drinks Tab — Drink categories ═══ */}
      {activeTab === "drinks" && renderCategoryList(drinkCategories, "drink")}

      {/* ═══ Guest Inspector ═══ */}
      {selectedGuest && (
        <GuestMealInspector
          key={selectedGuest.id}
          guest={selectedGuest}
          onClose={() => setSelectedGuest(null)}
        />
      )}

      {/* ═══ Category Modal ═══ */}
      <Modal
        open={!!showCategoryForm}
        onClose={() => setShowCategoryForm(null)}
        title={showCategoryForm === "food" ? "Neue Speise-Kategorie" : "Neue Getränke-Kategorie"}
      >
        <form
          action={async (formData) => {
            await createFoodCategory(formData);
            setShowCategoryForm(null);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="projectId" value={projectId} />
          <Input
            name="name"
            label="Kategoriename"
            required
            placeholder={showCategoryForm === "food" ? "z.B. Vorspeisen, Hauptgang, Desserts..." : "z.B. Sekt, Wein, Bier..."}
          />
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="ghost" onClick={() => setShowCategoryForm(null)}>
              Abbrechen
            </Button>
            <Button type="submit">Hinzufügen</Button>
          </div>
        </form>
      </Modal>

      {/* ═══ Item Modal ═══ */}
      <Modal
        open={!!showItemForm || !!editingItem}
        onClose={() => {
          setShowItemForm(null);
          setEditingItem(null);
          setEditingCategoryId(null);
        }}
        title={editingItem ? "Position bearbeiten" : "Neue Position"}
      >
        <form
          action={async (formData) => {
            if (editingItem) {
              await updateFoodItem(formData);
            } else {
              await createFoodItem(formData);
            }
            setShowItemForm(null);
            setEditingItem(null);
            setEditingCategoryId(null);
          }}
          className="space-y-4"
        >
          {editingItem ? (
            <input type="hidden" name="id" value={editingItem.id} />
          ) : (
            <input
              type="hidden"
              name="foodCategoryId"
              value={showItemForm || editingCategoryId || ""}
            />
          )}
          <Input
            name="name"
            label="Name"
            defaultValue={editingItem?.name || ""}
            required
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              name="quantity"
              label="Menge"
              type="number"
              defaultValue={editingItem?.quantity ?? ""}
              placeholder="z.B. 24"
            />
            <Input
              name="unitPrice"
              label="Einzelpreis (EUR)"
              type="number"
              step="0.01"
              defaultValue={editingItem?.unitPrice ?? ""}
            />
            <Input
              name="totalPrice"
              label="Gesamt (EUR)"
              type="number"
              step="0.01"
              defaultValue={editingItem?.totalPrice ?? ""}
            />
          </div>
          <div className="w-full">
            <label className="block text-sm font-medium text-text-muted mb-1.5">
              Notizen
            </label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={editingItem?.notes || ""}
              className="w-full px-4 py-3 rounded-xl border border-border bg-surface-1 text-text focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all text-sm placeholder:text-text-faint"
              placeholder="Optionale Notizen..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setShowItemForm(null);
                setEditingItem(null);
                setEditingCategoryId(null);
              }}
            >
              Abbrechen
            </Button>
            <Button type="submit">
              {editingItem ? "Speichern" : "Hinzufügen"}
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
                    ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900"
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
            Allergien / Unverträglichkeiten
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
