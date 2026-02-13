"use client";

import { useMemo } from "react";
import Link from "next/link";
import { VENDOR_CATEGORY_LABELS, type VendorCategory } from "@/types";

// ─── Types ──────────────────────────────────────────────

interface Guest {
  id: string;
  status: string;
  inviteSent: boolean;
}

interface Vendor {
  id: string;
  name: string;
  category: string;
  status: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueDate: string | null;
  priority: string;
  category: string | null;
}

interface BudgetCategory {
  id: string;
  name: string;
  plannedAmount: number;
  items: { plannedAmount: number; actualAmount: number }[];
}

interface DashboardData {
  userName: string | null;
  partnerName: string | null;
  weddingDate: string | null;
  guests: Guest[];
  vendors: Vendor[];
  tasks: Task[];
  budgetCategories: BudgetCategory[];
  totalBudget: number;
}

// ─── Format helpers ─────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("de-DE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
};

// ─── Reusable mini-components ───────────────────────────

function ProgressRing({ percent, size = 44, stroke = 4, color = "text-blue-500" }: { percent: number; size?: number; stroke?: number; color?: string }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-surface-2" />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={stroke} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className={color} />
    </svg>
  );
}

function MetricBlock({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">{label}</p>
      <p className={`text-2xl font-bold tracking-tight mt-0.5 ${color || "text-text"}`}>{value}</p>
      {sub && <p className="text-[12px] text-text-faint mt-0.5">{sub}</p>}
    </div>
  );
}

function EmptyState({ icon, message, actionLabel, actionHref }: { icon: string; message: string; actionLabel?: string; actionHref?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-[13px] text-text-faint mb-3">{message}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors">
          {actionLabel} &rarr;
        </Link>
      )}
    </div>
  );
}

function DashCard({ title, statusBadge, children, href, actionLabel, className }: {
  title: string;
  statusBadge?: React.ReactNode;
  children: React.ReactNode;
  href?: string;
  actionLabel?: string;
  className?: string;
}) {
  return (
    <div className={`bg-surface-1 rounded-2xl shadow-sm hover:shadow-md transition-shadow ${className || ""}`}>
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-semibold text-text">{title}</h3>
        {statusBadge}
      </div>
      <div className="px-5 pb-5">{children}</div>
      {href && actionLabel && (
        <div className="px-5 pb-4 pt-0">
          <Link href={href} className="text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors">
            {actionLabel} &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Main component ─────────────────────────────────────

export default function DashboardPageClient({ data }: { data: DashboardData }) {
  const {
    userName,
    partnerName,
    weddingDate,
    guests,
    vendors,
    tasks,
    budgetCategories,
    totalBudget,
  } = data;

  // ── Wedding countdown ──
  const daysLeft = useMemo(() => {
    if (!weddingDate) return null;
    const diff = new Date(weddingDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [weddingDate]);

  const weddingTitle = userName && partnerName
    ? `${userName.split(" ")[0]} & ${partnerName.split(" ")[0]}`
    : userName || "Eure Hochzeit";

  // ── Guest metrics ──
  const totalGuests = guests.length;
  const confirmed = guests.filter((g) => g.status === "CONFIRMED").length;
  const declined = guests.filter((g) => g.status === "DECLINED").length;
  const pending = guests.filter((g) => g.status === "PENDING").length;
  const invitesSent = guests.filter((g) => g.inviteSent).length;
  const confirmRate = totalGuests > 0 ? Math.round((confirmed / totalGuests) * 100) : 0;

  // ── Vendor metrics ──
  const vendorsBooked = vendors.filter((v) => v.status === "OFFER_ACCEPTED").length;
  const vendorsTotal = vendors.length;
  const vendorsNeedAction = vendors.filter((v) => v.status === "OFFER_RECEIVED" || v.status === "CONTACTED").length;
  const vendorBookPercent = vendorsTotal > 0 ? Math.round((vendorsBooked / vendorsTotal) * 100) : 0;

  // ── Budget metrics ──
  const amountPaid = budgetCategories.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + i.actualAmount, 0), 0);
  const plannedCosts = budgetCategories.reduce((sum, cat) => sum + cat.items.reduce((s, i) => s + i.plannedAmount, 0), 0);
  const balanceRemaining = totalBudget - amountPaid;
  const budgetUsedPercent = totalBudget > 0 ? Math.round((amountPaid / totalBudget) * 100) : 0;
  const isOverBudget = balanceRemaining < 0;

  // Top 3 categories by spend
  const topCategories = budgetCategories
    .map((cat) => ({
      name: cat.name,
      spent: cat.items.reduce((s, i) => s + i.actualAmount, 0),
      planned: cat.items.reduce((s, i) => s + i.plannedAmount, 0),
    }))
    .filter((c) => c.spent > 0 || c.planned > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 3);

  // ── Task metrics ──
  const now = new Date();
  const tasksDone = tasks.filter((t) => t.status === "DONE");
  const tasksOverdue = tasks.filter((t) => t.status !== "DONE" && t.dueDate && new Date(t.dueDate) < now);
  const tasksUpcoming = tasks
    .filter((t) => t.status !== "DONE" && (!t.dueDate || new Date(t.dueDate) >= now))
    .slice(0, 3);
  const totalTasks = tasks.length;
  const tasksDonePercent = totalTasks > 0 ? Math.round((tasksDone.length / totalTasks) * 100) : 0;

  // ── "Next Actions" — the 5 most actionable items ──
  const nextActions = useMemo(() => {
    const actions: { id: string; label: string; sub: string; href: string; urgency: "overdue" | "soon" | "normal" }[] = [];

    // Overdue tasks
    tasksOverdue.slice(0, 2).forEach((t) => {
      actions.push({
        id: `task-${t.id}`,
        label: t.title,
        sub: `Fällig am ${t.dueDate ? fmtDate(t.dueDate) : "—"}`,
        href: "/tasks",
        urgency: "overdue",
      });
    });

    // Vendors needing response
    vendors
      .filter((v) => v.status === "OFFER_RECEIVED")
      .slice(0, 2)
      .forEach((v) => {
        actions.push({
          id: `vendor-${v.id}`,
          label: `Angebot prüfen: ${v.name}`,
          sub: VENDOR_CATEGORY_LABELS[v.category as VendorCategory] || v.category,
          href: "/vendors",
          urgency: "soon",
        });
      });

    // Upcoming tasks (next due)
    tasksUpcoming.slice(0, 2).forEach((t) => {
      actions.push({
        id: `upcoming-${t.id}`,
        label: t.title,
        sub: t.dueDate ? `Fällig am ${fmtDate(t.dueDate)}` : "Kein Datum",
        href: "/tasks",
        urgency: "normal",
      });
    });

    // Uninvited guests
    const uninvited = totalGuests - invitesSent;
    if (uninvited > 0) {
      actions.push({
        id: "guests-uninvited",
        label: `${uninvited} Gäste noch nicht eingeladen`,
        sub: `${invitesSent} von ${totalGuests} verschickt`,
        href: "/guests",
        urgency: "normal",
      });
    }

    return actions.slice(0, 5);
  }, [tasksOverdue, vendors, tasksUpcoming, totalGuests, invitesSent]);

  // ── Smart CTA ──
  const smartCta = useMemo(() => {
    if (tasksOverdue.length > 0) {
      return { label: `${tasksOverdue.length} überfällige Aufgaben`, href: "/tasks", color: "bg-red-50 text-red-600" };
    }
    if (vendorsNeedAction > 0) {
      return { label: `${vendorsNeedAction} Angebote prüfen`, href: "/vendors", color: "bg-amber-50 text-amber-700" };
    }
    if (isOverBudget) {
      return { label: `${fmt(Math.abs(balanceRemaining))} EUR über Budget`, href: "/budget", color: "bg-red-50 text-red-600" };
    }
    return { label: "Alles auf Kurs!", href: "/tasks", color: "bg-emerald-50 text-emerald-600" };
  }, [tasksOverdue, vendorsNeedAction, isOverBudget, balanceRemaining]);

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ──────────────────────────────────────────────────────
          1. COMMAND CENTER HEADER
          ──────────────────────────────────────────────────── */}
      <div className="bg-surface-1 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text tracking-tight">{weddingTitle}</h1>
            {daysLeft !== null ? (
              <p className="mt-1 text-[15px] text-text-muted">
                Noch <span className="font-semibold text-text">{daysLeft}</span> Tage &middot;{" "}
                {weddingDate && new Date(weddingDate).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            ) : (
              <p className="mt-1 text-[15px] text-text-muted">
                Euer grosser Tag wird geplant!{" "}
                <Link href="/settings" className="text-blue-500 hover:text-blue-600 transition-colors">
                  Datum festlegen &rarr;
                </Link>
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link
              href={smartCta.href}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors ${smartCta.color}`}
            >
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${smartCta.color.includes("emerald") ? "bg-emerald-400" : smartCta.color.includes("red") ? "bg-red-400" : "bg-amber-400"}`} />
                <span className={`relative inline-flex rounded-full h-2 w-2 ${smartCta.color.includes("emerald") ? "bg-emerald-500" : smartCta.color.includes("red") ? "bg-red-500" : "bg-amber-500"}`} />
              </span>
              {smartCta.label}
            </Link>
          </div>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────
          2. NEXT ACTIONS — What needs attention right now
          ──────────────────────────────────────────────────── */}
      {nextActions.length > 0 && (
        <div className="bg-surface-1 rounded-2xl shadow-sm p-5">
          <h2 className="text-[13px] font-semibold text-text-faint uppercase tracking-wider mb-4">Nächste Schritte</h2>
          <div className="space-y-1">
            {nextActions.map((a) => (
              <Link
                key={a.id}
                href={a.href}
                className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-xl hover:bg-surface-2 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                    a.urgency === "overdue" ? "bg-red-500" : a.urgency === "soon" ? "bg-amber-400" : "bg-border"
                  }`} />
                  <div>
                    <p className="text-[14px] font-medium text-text">{a.label}</p>
                    <p className="text-[12px] text-text-faint">{a.sub}</p>
                  </div>
                </div>
                <svg className="w-4 h-4 text-text-faint group-hover:text-text-muted transition-colors flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────
          3. CARDS GRID — 2 columns
          ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* ── GUESTS CARD ── */}
        <DashCard
          title="Gäste"
          statusBadge={
            totalGuests > 0 ? (
              <span className="text-[12px] font-medium text-text-faint">
                {confirmed}/{totalGuests} zugesagt
              </span>
            ) : null
          }
          href="/guests"
          actionLabel="Gästeliste öffnen"
        >
          {totalGuests > 0 ? (
            <div className="space-y-4">
              {/* Key metric with ring */}
              <div className="flex items-center gap-4">
                <ProgressRing percent={confirmRate} color="text-blue-500" />
                <MetricBlock label="Zusagequote" value={`${confirmRate}%`} sub={`${confirmed} von ${totalGuests} zugesagt`} />
              </div>
              {/* Sub-metrics */}
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div>
                  <p className="text-[20px] font-bold text-text">{pending}</p>
                  <p className="text-[11px] text-text-faint">Ausstehend</p>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-text">{declined}</p>
                  <p className="text-[11px] text-text-faint">Abgesagt</p>
                </div>
                <div>
                  <p className="text-[20px] font-bold text-text">{invitesSent}</p>
                  <p className="text-[11px] text-text-faint">Eingeladen</p>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState icon="👥" message="Noch keine Gäste hinzugefuegt" actionLabel="Gäste anlegen" actionHref="/guests" />
          )}
        </DashCard>

        {/* ── BUDGET CARD ── */}
        <DashCard
          title="Budget"
          statusBadge={
            isOverBudget ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-[12px] font-medium text-red-600">
                Über Budget
              </span>
            ) : totalBudget > 0 ? (
              <span className="text-[12px] font-medium text-text-faint">
                {budgetUsedPercent}% verbraucht
              </span>
            ) : null
          }
          href="/budget"
          actionLabel="Budget verwalten"
        >
          {totalBudget > 0 ? (
            <div className="space-y-4">
              {/* Status line */}
              <div className="flex items-center gap-4">
                <ProgressRing
                  percent={Math.min(budgetUsedPercent, 100)}
                  color={isOverBudget ? "text-red-500" : budgetUsedPercent > 80 ? "text-amber-500" : "text-emerald-500"}
                />
                <MetricBlock
                  label="Ausgaben"
                  value={`${fmt(amountPaid)} EUR`}
                  sub={`von ${fmt(totalBudget)} EUR Budget`}
                  color={isOverBudget ? "text-red-600" : undefined}
                />
              </div>
              {/* Top 3 categories */}
              {topCategories.length > 0 && (
                <div className="pt-3 border-t border-border space-y-2.5">
                  {topCategories.map((cat) => {
                    const pct = cat.planned > 0 ? Math.min(100, Math.round((cat.spent / cat.planned) * 100)) : 0;
                    const over = cat.spent > cat.planned;
                    return (
                      <div key={cat.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[13px] text-text-muted">{cat.name}</span>
                          <span className={`text-[12px] font-medium ${over ? "text-red-500" : "text-text-faint"}`}>
                            {fmt(cat.spent)} / {fmt(cat.planned)} EUR
                          </span>
                        </div>
                        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${over ? "bg-red-500" : pct > 80 ? "bg-amber-400" : "bg-emerald-500"}`}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <EmptyState icon="💰" message="Budget noch nicht festgelegt" actionLabel="Budget planen" actionHref="/budget" />
          )}
        </DashCard>

        {/* ── TASKS CARD ── */}
        <DashCard
          title="Aufgaben"
          statusBadge={
            tasksOverdue.length > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-[12px] font-medium text-red-600">
                {tasksOverdue.length} überfällig
              </span>
            ) : totalTasks > 0 ? (
              <span className="text-[12px] font-medium text-text-faint">
                {tasksDone.length}/{totalTasks} erledigt
              </span>
            ) : null
          }
          href="/tasks"
          actionLabel="Alle Aufgaben"
        >
          {totalTasks > 0 ? (
            <div className="space-y-4">
              {/* Progress ring + metric */}
              <div className="flex items-center gap-4">
                <ProgressRing
                  percent={tasksDonePercent}
                  color={tasksOverdue.length > 0 ? "text-red-500" : "text-blue-500"}
                />
                <MetricBlock
                  label="Fortschritt"
                  value={`${tasksDonePercent}%`}
                  sub={`${tasksDone.length} von ${totalTasks} erledigt`}
                />
              </div>
              {/* Next 3 upcoming */}
              <div className="pt-3 border-t border-border space-y-2">
                <p className="text-[11px] font-medium text-text-faint uppercase tracking-wider">Nächste</p>
                {tasksUpcoming.length > 0 ? (
                  tasksUpcoming.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${
                          t.priority === "HIGH" ? "bg-red-400" : t.priority === "MEDIUM" ? "bg-amber-400" : "bg-border"
                        }`} />
                        <p className="text-[13px] text-text-muted truncate">{t.title}</p>
                      </div>
                      {t.dueDate && (
                        <span className="text-[11px] text-text-faint flex-shrink-0 ml-2">{fmtDate(t.dueDate)}</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-[12px] text-text-faint">Keine anstehenden Aufgaben</p>
                )}
              </div>
            </div>
          ) : (
            <EmptyState icon="✅" message="Noch keine Aufgaben erstellt" actionLabel="Aufgabe anlegen" actionHref="/tasks" />
          )}
        </DashCard>

        {/* ── VENDORS CARD ── */}
        <DashCard
          title="Dienstleister"
          statusBadge={
            vendorsNeedAction > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-[12px] font-medium text-amber-700">
                {vendorsNeedAction} brauchen Aktion
              </span>
            ) : vendorsTotal > 0 ? (
              <span className="text-[12px] font-medium text-text-faint">
                {vendorsBooked}/{vendorsTotal} gebucht
              </span>
            ) : null
          }
          href="/vendors"
          actionLabel="Dienstleister verwalten"
        >
          {vendorsTotal > 0 ? (
            <div className="space-y-4">
              {/* Ring + metric */}
              <div className="flex items-center gap-4">
                <ProgressRing percent={vendorBookPercent} color="text-violet-500" />
                <MetricBlock
                  label="Gebucht"
                  value={`${vendorsBooked} von ${vendorsTotal}`}
                  sub={vendorsNeedAction > 0 ? `${vendorsNeedAction} warten auf Rückmeldung` : "Alle versorgt"}
                />
              </div>
              {/* Latest vendors */}
              <div className="pt-3 border-t border-border space-y-2">
                {vendors.slice(0, 3).map((v) => {
                  const statusMap: Record<string, { label: string; color: string }> = {
                    IDENTIFIED: { label: "Entdeckt", color: "text-text-faint" },
                    CONTACTED: { label: "Kontaktiert", color: "text-blue-500" },
                    OFFER_RECEIVED: { label: "Angebot", color: "text-orange-500" },
                    BOOKED: { label: "Gebucht", color: "text-emerald-500" },
                    NOT_CHOSEN: { label: "Nicht gewählt", color: "text-text-faint" },
                  };
                  const st = statusMap[v.status] || { label: v.status, color: "text-text-faint" };
                  return (
                    <div key={v.id} className="flex items-center justify-between py-1">
                      <div className="min-w-0">
                        <p className="text-[13px] font-medium text-text truncate">{v.name}</p>
                        <p className="text-[11px] text-text-faint">
                          {VENDOR_CATEGORY_LABELS[v.category as VendorCategory] || v.category}
                        </p>
                      </div>
                      <span className={`text-[11px] font-medium flex-shrink-0 ml-2 ${st.color}`}>{st.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState icon="🤝" message="Noch keine Dienstleister hinzugefuegt" actionLabel="Dienstleister suchen" actionHref="/vendors" />
          )}
        </DashCard>
      </div>

      {/* ──────────────────────────────────────────────────────
          4. TIMELINE CARD — full-width
          ──────────────────────────────────────────────────── */}
      <div className="bg-surface-1 rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-semibold text-text">Überblick</h3>
          <Link href="/tasks" className="text-[13px] font-medium text-blue-500 hover:text-blue-600 transition-colors">
            Alle anzeigen &rarr;
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-surface-2 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-text">{totalGuests}</p>
            <p className="text-[12px] text-text-muted mt-1">Gäste</p>
          </div>
          <div className="bg-surface-2 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-text">{vendorsBooked}</p>
            <p className="text-[12px] text-text-muted mt-1">Dienstleister gebucht</p>
          </div>
          <div className="bg-surface-2 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-text">{tasksDone.length}</p>
            <p className="text-[12px] text-text-muted mt-1">Aufgaben erledigt</p>
          </div>
          <div className="bg-surface-2 rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${isOverBudget ? "text-red-600" : "text-text"}`}>
              {fmt(balanceRemaining)} EUR
            </p>
            <p className="text-[12px] text-text-muted mt-1">Budget verbleibend</p>
          </div>
        </div>
      </div>
    </div>
  );
}
