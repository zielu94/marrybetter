"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { switchProject, createProject } from "@/actions/planner.actions";

interface ProjectSummary {
  id: string;
  coupleName: string;
  coupleEmail: string | null;
  weddingDate: string | null;
  hasNoDate: boolean;
  location: string | null;
  notes: string | null;
  createdAt: string;
  guestCount: number;
  guestsConfirmed: number;
  taskCount: number;
  tasksDone: number;
  vendorCount: number;
  vendorsBooked: number;
  totalSpent: number;
  totalBudget: number;
}

interface PlannerDashboardProps {
  projects: ProjectSummary[];
  userId: string;
}

export default function PlannerDashboard({ projects, userId }: PlannerDashboardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState("");

  const filteredProjects = projects.filter((p) =>
    p.coupleName.toLowerCase().includes(search.toLowerCase()) ||
    p.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectProject = async (projectId: string) => {
    startTransition(async () => {
      await switchProject(userId, projectId);
      router.push("/dashboard");
      router.refresh();
    });
  };

  const handleCreateProject = async (formData: FormData) => {
    formData.set("userId", userId);
    startTransition(async () => {
      const result = await createProject(formData);
      if (result?.success) {
        setShowCreate(false);
        router.push("/dashboard");
        router.refresh();
      }
    });
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Kein Datum";
    return new Date(dateStr).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getDaysUntil = (dateStr: string | null) => {
    if (!dateStr) return null;
    const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `vor ${Math.abs(diff)} Tagen`;
    if (diff === 0) return "Heute!";
    return `in ${diff} Tagen`;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text tracking-tight">Meine Paare</h1>
          <p className="text-sm text-text-muted mt-1">
            {projects.length} {projects.length === 1 ? "Hochzeit" : "Hochzeiten"} in Bearbeitung
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neues Paar anlegen
        </button>
      </div>

      {/* Search */}
      {projects.length > 3 && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Paar suchen..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-border bg-surface-1 text-sm text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-primary-400/50"
          />
        </div>
      )}

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">💍</div>
          <h2 className="text-lg font-semibold text-text mb-2">
            {projects.length === 0 ? "Noch keine Paare" : "Keine Treffer"}
          </h2>
          <p className="text-sm text-text-muted mb-6">
            {projects.length === 0
              ? "Lege dein erstes Paar an, um loszulegen."
              : "Versuche einen anderen Suchbegriff."}
          </p>
          {projects.length === 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
            >
              Erstes Paar anlegen
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const daysUntil = getDaysUntil(project.weddingDate);
            const taskProgress = project.taskCount > 0 ? Math.round((project.tasksDone / project.taskCount) * 100) : 0;

            return (
              <button
                key={project.id}
                onClick={() => handleSelectProject(project.id)}
                disabled={isPending}
                className="text-left bg-surface-1 rounded-2xl border border-border p-5 hover:shadow-md hover:border-primary-200 transition-all duration-200 disabled:opacity-60 group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-[15px] font-semibold text-text group-hover:text-primary-600 transition-colors">
                      {project.coupleName}
                    </h3>
                    <p className="text-xs text-text-faint mt-0.5">
                      {formatDate(project.weddingDate)}
                      {daysUntil && <span className="ml-1.5 text-primary-500 font-medium">({daysUntil})</span>}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-text-faint group-hover:text-primary-500 transition-colors mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Location */}
                {project.location && (
                  <p className="text-xs text-text-muted mb-3 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {project.location}
                  </p>
                )}

                {/* KPI Row */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                  <div>
                    <p className="text-[10px] font-medium text-text-faint uppercase tracking-wider">Gäste</p>
                    <p className="text-sm font-semibold text-text">
                      {project.guestsConfirmed}/{project.guestCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-text-faint uppercase tracking-wider">Tasks</p>
                    <p className="text-sm font-semibold text-text">{taskProgress}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-text-faint uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-semibold text-text">
                      {project.totalBudget > 0
                        ? `${Math.round((project.totalSpent / project.totalBudget) * 100)}%`
                        : "–"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreate && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setShowCreate(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-surface-1 rounded-2xl shadow-xl border border-border w-full max-w-md p-6">
              <h2 className="text-lg font-bold text-text mb-4">Neues Paar anlegen</h2>
              <form action={handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium text-text-muted mb-1.5">Paarname *</label>
                  <input
                    name="coupleName"
                    type="text"
                    placeholder="z.B. Max & Anna"
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-1 text-sm text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-muted mb-1.5">Kontakt-E-Mail</label>
                  <input
                    name="coupleEmail"
                    type="email"
                    placeholder="paar@email.de"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-1 text-sm text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-muted mb-1.5">Hochzeitsdatum</label>
                  <input
                    name="weddingDate"
                    type="date"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-1 text-sm text-text focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-text-muted mb-1.5">Ort</label>
                  <input
                    name="location"
                    type="text"
                    placeholder="z.B. Schloss Hohenstein"
                    className="w-full px-3 py-2.5 rounded-xl border border-border bg-surface-1 text-sm text-text placeholder-text-faint focus:outline-none focus:ring-2 focus:ring-primary-400/50"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-text-muted hover:bg-surface-2 transition-colors"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-60"
                  >
                    {isPending ? "Wird angelegt..." : "Anlegen"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
