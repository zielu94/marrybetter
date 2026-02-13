import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getBudgetData } from "@/actions/budget.actions";
import BudgetOverview from "@/components/budget/BudgetOverview";
import BudgetCategorySection from "@/components/budget/BudgetCategorySection";
import BudgetPageClient from "@/components/budget/BudgetPageClient";
import EmptyState from "@/components/ui/EmptyState";

export const metadata = { title: "Budget | MarryBetter.com" };

export default async function BudgetPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getBudgetData(session.user.id);
  if (!project) redirect("/onboarding");

  const totalPlanned = project.budgetCategories.reduce(
    (sum, cat) => sum + cat.budgetItems.reduce((s, item) => s + item.plannedAmount, 0),
    0
  );
  const totalActual = project.budgetCategories.reduce(
    (sum, cat) => sum + cat.budgetItems.reduce((s, item) => s + item.actualAmount, 0),
    0
  );

  // Category spending for overview
  const categorySpending = project.budgetCategories.map((cat) => ({
    name: cat.name,
    planned: cat.budgetItems.reduce((s, i) => s + i.plannedAmount, 0) || cat.plannedAmount,
    actual: cat.budgetItems.reduce((s, i) => s + i.actualAmount, 0),
    itemCount: cat.budgetItems.length,
  }));

  // Alert data
  const overBudgetCount = categorySpending.filter((c) => c.actual > c.planned && c.planned > 0).length;
  const unpaidCount = project.budgetCategories.reduce(
    (count, cat) => count + cat.budgetItems.filter((i) => i.paymentStatus === "UNPAID" && i.actualAmount > 0).length,
    0
  );
  const noBudgetCount = categorySpending.filter((c) => c.planned === 0).length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* 1. BUDGET STORY HEADER + ALERTS + OVERVIEW GRID */}
      <BudgetOverview
        projectId={project.id}
        totalBudget={project.totalBudget}
        totalPlanned={totalPlanned}
        totalActual={totalActual}
        categorySpending={categorySpending}
        overBudgetCount={overBudgetCount}
        unpaidCount={unpaidCount}
        noBudgetCount={noBudgetCount}
      />

      {/* 2. CATEGORY LIST — main working area */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[15px] font-semibold text-text">Kategorien</h2>
          <BudgetPageClient projectId={project.id} existingCategoryNames={project.budgetCategories.map(c => c.name)} />
        </div>

        {project.budgetCategories.length > 0 ? (
          <div className="space-y-2">
            {project.budgetCategories.map((category) => (
              <BudgetCategorySection
                key={category.id}
                category={category}
                projectId={project.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Noch keine Kategorien"
            description="Erstelle deine erste Budget-Kategorie, um deine Hochzeitsausgaben zu verwalten."
          />
        )}
      </section>
    </div>
  );
}
