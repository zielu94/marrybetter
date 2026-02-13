import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getFoodData } from "@/actions/food.actions";
import FoodPageClient from "@/components/food/FoodPageClient";

export const metadata = { title: "Essen & Trinken | MarryBetter.com" };

// Categories that are considered "drinks" — everything else is "food"
const DRINK_CATEGORY_NAMES = new Set([
  "getränke",
  "drinks",
  "sekt",
  "sekt / empfang",
  "wein",
  "wein (weiß)",
  "wein (rot)",
  "bier",
  "softdrinks",
  "softdrinks / wasser",
  "cocktails",
  "cocktails / spirituosen",
  "kaffee / tee",
  "spirituosen",
  "longdrinks",
  "heißgetränke",
]);

function isDrinkCategory(name: string) {
  return DRINK_CATEGORY_NAMES.has(name.toLowerCase().trim());
}

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

  const mapCategory = (cat: (typeof project.foodCategories)[number]) => ({
    id: cat.id,
    name: cat.name,
    items: cat.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      notes: item.notes,
    })),
  });

  const foodCategories = project.foodCategories
    .filter((cat) => !isDrinkCategory(cat.name))
    .map(mapCategory);

  const drinkCategories = project.foodCategories
    .filter((cat) => isDrinkCategory(cat.name))
    .map(mapCategory);

  return (
    <FoodPageClient
      projectId={project.id}
      guests={guests}
      foodCategories={foodCategories}
      drinkCategories={drinkCategories}
    />
  );
}
