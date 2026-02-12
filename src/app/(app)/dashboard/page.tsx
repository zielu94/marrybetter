import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getDashboardData } from "@/actions/dashboard.actions";
import DashboardPageClient from "@/components/dashboard/DashboardPageClient";

export const metadata = { title: "Dashboard | MarryBetter.com" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const data = await getDashboardData(session.user.id);
  if (!data) redirect("/onboarding");

  return <DashboardPageClient data={data} />;
}
