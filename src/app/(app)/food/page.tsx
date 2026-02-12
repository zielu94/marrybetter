import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFoodData } from "@/actions/food.actions";
import FoodPageClient from "@/components/food/FoodPageClient";

export const metadata = { title: "Essen & Trinken | MarryBetter.com" };

export default async function FoodPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const project = await getFoodData(session.user.id);
  if (!project) redirect("/onboarding");

  const guests = project.guests.map((g) => ({
    id: g.id,
    firstName: g.firstName,
    lastName: g.lastName,
    status: g.status,
    diet: g.diet,
    mealType: g.mealType,
    allergiesNote: g.allergiesNote,
    age: g.age,
    seatingTableName: g.seatingTable?.name ?? null,
  }));

  const drinkCategories = project.foodCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    items: cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      notes: item.notes,
    })),
  }));

  return (
    <FoodPageClient
      projectId={project.id}
      guests={guests}
      drinkCategories={drinkCategories}
    />
  );
}
