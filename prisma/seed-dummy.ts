import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: "rafi_zielinski@yahoo.de" },
    include: { weddingProject: true },
  });

  if (!user || !user.weddingProject) {
    console.error("User oder WeddingProject nicht gefunden!");
    return;
  }

  const projectId = user.weddingProject.id;
  console.log(`Befülle Projekt ${projectId} für ${user.name}...`);

  // ═══════════════════════════════════════════════
  // 1. Update Wedding Project with full data
  // ═══════════════════════════════════════════════
  await prisma.weddingProject.update({
    where: { id: projectId },
    data: {
      location: "Schloss Benrath, Düsseldorf",
      totalBudget: 35000,
      guestCountTarget: 120,
      isPublicWebsite: true,
      slug: "rafal-karolina",
      websiteHeroImage: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80",
      websiteStory: `Wir haben uns 2019 auf einer Geburtstagsfeier von gemeinsamen Freunden kennengelernt. Rafal hat Karolina sofort mit seinem trockenen Humor zum Lachen gebracht, und Karolina hat Rafal mit ihrer Leidenschaft für gutes Essen begeistert.

Nach einem unvergesslichen ersten Date in einem kleinen italienischen Restaurant in der Altstadt war klar: Das ist der Anfang von etwas Besonderem.

Drei wundervolle Jahre später, bei einem Sonnenuntergang am Gardasee, hat Rafal die Frage aller Fragen gestellt — und Karolina hat natürlich JA gesagt! 💍

Jetzt freuen wir uns riesig darauf, unseren besonderen Tag mit euch allen zu feiern!`,
      websiteAccommodation: `Hotel Mutterhaus Düsseldorf — 5 Min. vom Schloss entfernt. Wir haben ein Kontingent reserviert (Stichwort "Hochzeit Zielinski"). Buchbar bis 01.06.2026.

Alternativ: NH Hotel Düsseldorf City — 10 Min. entfernt, gutes Preis-Leistungs-Verhältnis.

Parkplätze sind am Schloss kostenlos verfügbar.`,
    },
  });
  console.log("✓ Wedding Project aktualisiert");

  // ═══════════════════════════════════════════════
  // 2. Budget Categories + Items
  // ═══════════════════════════════════════════════
  const budgetData = [
    { name: "Location", planned: 8000, items: [
      { name: "Schloss Benrath Miete", planned: 5500, actual: 5500, status: "FULLY_PAID" },
      { name: "Bestuhlung & Tische", planned: 1200, actual: 1100, status: "DEPOSIT_PAID" },
      { name: "Reinigungspauschale", planned: 500, actual: 0, status: "UNPAID" },
    ]},
    { name: "Catering", planned: 9500, items: [
      { name: "Menü pro Person (80€ × 120)", planned: 9600, actual: 4800, status: "DEPOSIT_PAID" },
      { name: "Sektempfang", planned: 800, actual: 0, status: "UNPAID" },
      { name: "Mitternachtssnack", planned: 600, actual: 0, status: "UNPAID" },
    ]},
    { name: "Fotografie & Video", planned: 3500, items: [
      { name: "Fotograf (ganzer Tag)", planned: 2800, actual: 1400, status: "DEPOSIT_PAID" },
      { name: "Videograf (Highlight-Film)", planned: 1500, actual: 750, status: "DEPOSIT_PAID" },
    ]},
    { name: "Musik & DJ", planned: 2000, items: [
      { name: "DJ für Abendfeier", planned: 1200, actual: 600, status: "DEPOSIT_PAID" },
      { name: "Streichquartett Trauung", planned: 800, actual: 800, status: "FULLY_PAID" },
    ]},
    { name: "Blumen & Dekoration", planned: 3000, items: [
      { name: "Brautstrauß", planned: 250, actual: 0, status: "UNPAID" },
      { name: "Tischgestecke (15 Tische)", planned: 1500, actual: 0, status: "UNPAID" },
      { name: "Traubogen & Zeremonie-Deko", planned: 800, actual: 400, status: "DEPOSIT_PAID" },
      { name: "Anstecksträuße", planned: 150, actual: 0, status: "UNPAID" },
    ]},
    { name: "Kleidung & Styling", planned: 4000, items: [
      { name: "Brautkleid", planned: 2500, actual: 2500, status: "FULLY_PAID" },
      { name: "Anzug Bräutigam", planned: 800, actual: 800, status: "FULLY_PAID" },
      { name: "Hair & Make-up", planned: 400, actual: 200, status: "DEPOSIT_PAID" },
      { name: "Accessoires", planned: 300, actual: 150, status: "PARTIALLY_PAID" },
    ]},
    { name: "Papeterie", planned: 600, items: [
      { name: "Save-the-Dates", planned: 150, actual: 150, status: "FULLY_PAID" },
      { name: "Einladungskarten", planned: 300, actual: 300, status: "FULLY_PAID" },
      { name: "Menükarten & Tischkärtchen", planned: 150, actual: 0, status: "UNPAID" },
    ]},
    { name: "Hochzeitstorte", planned: 800, items: [
      { name: "Dreistöckige Torte", planned: 650, actual: 0, status: "UNPAID" },
      { name: "Cake Topper", planned: 50, actual: 50, status: "FULLY_PAID" },
    ]},
    { name: "Transport", planned: 1000, items: [
      { name: "Oldtimer-Brautwagen", planned: 800, actual: 400, status: "DEPOSIT_PAID" },
      { name: "Shuttle-Bus Gäste", planned: 500, actual: 0, status: "UNPAID" },
    ]},
    { name: "Sonstiges", planned: 2600, items: [
      { name: "Eheringe", planned: 1800, actual: 1800, status: "FULLY_PAID" },
      { name: "Gastgeschenke", planned: 400, actual: 0, status: "UNPAID" },
      { name: "Trinkgeld", planned: 400, actual: 0, status: "UNPAID" },
    ]},
  ];

  for (let i = 0; i < budgetData.length; i++) {
    const cat = budgetData[i];
    const category = await prisma.budgetCategory.create({
      data: {
        weddingProjectId: projectId,
        name: cat.name,
        plannedAmount: cat.planned,
        sortOrder: i,
      },
    });
    for (let j = 0; j < cat.items.length; j++) {
      const item = cat.items[j];
      await prisma.budgetItem.create({
        data: {
          budgetCategoryId: category.id,
          name: item.name,
          plannedAmount: item.planned,
          actualAmount: item.actual,
          paymentStatus: item.status,
        },
      });
    }
  }
  console.log("✓ Budget befüllt");

  // ═══════════════════════════════════════════════
  // 3. Tasks
  // ═══════════════════════════════════════════════
  const tasks = [
    { title: "Budget festlegen", priority: "HIGH", status: "DONE", category: "Planung", dueDate: new Date("2025-09-01") },
    { title: "Gästeliste erstellen", priority: "HIGH", status: "DONE", category: "Gäste", dueDate: new Date("2025-09-15") },
    { title: "Location besichtigen & buchen", priority: "HIGH", status: "DONE", category: "Location", dueDate: new Date("2025-10-01") },
    { title: "Fotograf buchen", priority: "HIGH", status: "DONE", category: "Dienstleister", dueDate: new Date("2025-11-01") },
    { title: "Musik / DJ buchen", priority: "MEDIUM", status: "DONE", category: "Dienstleister", dueDate: new Date("2025-11-15") },
    { title: "Save-the-Dates versenden", priority: "MEDIUM", status: "DONE", category: "Papeterie", dueDate: new Date("2025-12-01") },
    { title: "Catering auswählen", priority: "HIGH", status: "DONE", category: "Catering", dueDate: new Date("2026-01-15") },
    { title: "Brautkleid kaufen", priority: "HIGH", status: "DONE", category: "Kleidung", dueDate: new Date("2026-02-01") },
    { title: "Einladungen gestalten & versenden", priority: "MEDIUM", status: "DONE", category: "Papeterie", dueDate: new Date("2026-03-01") },
    { title: "Blumen & Deko bestellen", priority: "MEDIUM", status: "IN_PROGRESS", category: "Dekoration", dueDate: new Date("2026-05-01") },
    { title: "Hochzeitstorte bestellen", priority: "MEDIUM", status: "IN_PROGRESS", category: "Catering", dueDate: new Date("2026-05-15") },
    { title: "Eheringe auswählen", priority: "HIGH", status: "DONE", category: "Ringe", dueDate: new Date("2026-04-01") },
    { title: "Trauredner buchen", priority: "HIGH", status: "IN_PROGRESS", category: "Dienstleister", dueDate: new Date("2026-04-15") },
    { title: "Probefrisur & Make-up", priority: "LOW", status: "OPEN", category: "Kleidung", dueDate: new Date("2026-06-15") },
    { title: "Sitzordnung erstellen", priority: "HIGH", status: "OPEN", category: "Gäste", dueDate: new Date("2026-07-01") },
    { title: "RSVP-Links verschicken", priority: "HIGH", status: "IN_PROGRESS", category: "Gäste", dueDate: new Date("2026-05-01") },
    { title: "Menü-Auswahl finalisieren", priority: "MEDIUM", status: "OPEN", category: "Catering", dueDate: new Date("2026-06-01") },
    { title: "Shuttle-Bus organisieren", priority: "LOW", status: "OPEN", category: "Transport", dueDate: new Date("2026-07-15") },
    { title: "Letzte Details klären", priority: "MEDIUM", status: "OPEN", category: "Planung", dueDate: new Date("2026-07-25") },
    { title: "Hochzeitsrede schreiben", priority: "LOW", status: "OPEN", category: "Planung", dueDate: new Date("2026-07-20") },
  ];

  for (let i = 0; i < tasks.length; i++) {
    await prisma.task.create({
      data: {
        weddingProjectId: projectId,
        ...tasks[i],
        sortOrder: i,
      },
    });
  }
  console.log("✓ Aufgaben befüllt");

  // ═══════════════════════════════════════════════
  // 4. Guests (with households)
  // ═══════════════════════════════════════════════
  // Create households first
  const hMueller = await prisma.household.create({
    data: { weddingProjectId: projectId, name: "Familie Müller", address: "Hauptstr. 12", city: "Düsseldorf", zip: "40213", country: "DE" },
  });
  const hSchmidt = await prisma.household.create({
    data: { weddingProjectId: projectId, name: "Familie Schmidt", address: "Rheinweg 5", city: "Köln", zip: "50667", country: "DE" },
  });
  const hNowak = await prisma.household.create({
    data: { weddingProjectId: projectId, name: "Familie Nowak", address: "ul. Krakowska 15", city: "Warszawa", zip: "00-001", country: "PL" },
  });
  const hWeber = await prisma.household.create({
    data: { weddingProjectId: projectId, name: "Paar Weber/Fischer", address: "Berliner Str. 88", city: "Essen", zip: "45128", country: "DE" },
  });

  const guestsData = [
    // Familie Müller (Brautseite)
    { firstName: "Thomas", lastName: "Müller", email: "thomas.mueller@example.de", phone: "+49 171 1234567", householdId: hMueller.id, guestType: "FAMILY", source: "BRIDE_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, diet: "FLEXITARIAN", mealType: "STANDARD" },
    { firstName: "Maria", lastName: "Müller", email: "maria.mueller@example.de", householdId: hMueller.id, guestType: "FAMILY", source: "BRIDE_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, diet: "VEGETARIAN", mealType: "VEGETARIAN" },
    { firstName: "Sophie", lastName: "Müller", householdId: hMueller.id, guestType: "FAMILY", source: "BRIDE_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "TEENAGER", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "STANDARD" },

    // Familie Schmidt (Bräutigamseite)
    { firstName: "Klaus", lastName: "Schmidt", email: "klaus.schmidt@example.de", phone: "+49 172 9876543", householdId: hSchmidt.id, guestType: "FAMILY", source: "GROOM_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "STANDARD" },
    { firstName: "Ingrid", lastName: "Schmidt", householdId: hSchmidt.id, guestType: "FAMILY", source: "GROOM_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, diet: "GLUTEN_FREE", mealType: "CUSTOM" },

    // Familie Nowak (Bräutigamseite, aus Polen)
    { firstName: "Marek", lastName: "Nowak", email: "marek.nowak@example.pl", householdId: hNowak.id, guestType: "FAMILY", source: "GROOM_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "STANDARD" },
    { firstName: "Ewa", lastName: "Nowak", householdId: hNowak.id, guestType: "FAMILY", source: "GROOM_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "STANDARD" },
    { firstName: "Kasia", lastName: "Nowak", householdId: hNowak.id, guestType: "FAMILY", source: "GROOM_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "KID", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "KIDS" },

    // Paar Weber/Fischer
    { firstName: "Jens", lastName: "Weber", email: "jens.weber@example.de", householdId: hWeber.id, guestType: "COUPLE", source: "BRIDE_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "STANDARD" },
    { firstName: "Lisa", lastName: "Fischer", email: "lisa.fischer@example.de", householdId: hWeber.id, guestType: "COUPLE", source: "BRIDE_SIDE", category: "FRIEND", role: "PLUS_ONE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, diet: "VEGAN", mealType: "VEGAN" },

    // Einzelgäste
    { firstName: "Anna", lastName: "Becker", email: "anna.becker@example.de", phone: "+49 176 5551234", guestType: "SINGLE", source: "BRIDE_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, isWeddingParty: true, mealType: "STANDARD", notes: "Trauzeugin!" },
    { firstName: "Tobias", lastName: "Hoffmann", email: "tobias.hoffmann@example.de", guestType: "SINGLE", source: "GROOM_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, isWeddingParty: true, mealType: "STANDARD", notes: "Trauzeuge!" },
    { firstName: "Lena", lastName: "Wagner", email: "lena.wagner@example.de", guestType: "SINGLE", source: "BRIDE_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "VEGETARIAN", diet: "VEGETARIAN" },
    { firstName: "Markus", lastName: "Koch", email: "markus.koch@example.de", guestType: "SINGLE", source: "GROOM_SIDE", category: "COLLEAGUE", role: "GENERAL_INVITE", age: "ADULT", status: "PENDING", rsvpStatus: "INVITED", inviteSent: true, mealType: "STANDARD" },
    { firstName: "Julia", lastName: "Braun", email: "julia.braun@example.de", guestType: "SINGLE", source: "BRIDE_SIDE", category: "COLLEAGUE", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, diet: "PESCATARIAN", mealType: "CUSTOM" },
    { firstName: "Stefan", lastName: "Richter", email: "stefan.richter@example.de", guestType: "SINGLE", source: "GROOM_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "DECLINED", rsvpStatus: "DECLINED", inviteSent: true, mealType: "STANDARD", notes: "Ist leider im Urlaub" },
    { firstName: "Katja", lastName: "Lehmann", email: "katja.lehmann@example.de", guestType: "SINGLE", source: "BRIDE_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "PENDING", rsvpStatus: "MAYBE", inviteSent: true, mealType: "STANDARD" },
    { firstName: "Michael", lastName: "Zimmermann", email: "michael.z@example.de", guestType: "SINGLE", source: "GROOM_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "PENDING", rsvpStatus: "INVITED", inviteSent: true, mealType: "STANDARD" },
    { firstName: "Sandra", lastName: "Krüger", email: "sandra.krueger@example.de", guestType: "SINGLE", source: "BRIDE_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, diet: "NUT_FREE", mealType: "STANDARD", allergiesNote: "Erdnussallergie" },
    { firstName: "Frank", lastName: "Schulz", guestType: "SINGLE", source: "GROOM_SIDE", category: "COLLEAGUE", role: "GENERAL_INVITE", age: "ADULT", status: "PENDING", rsvpStatus: "NOT_SENT", inviteSent: false, mealType: "STANDARD" },
    { firstName: "Oma", lastName: "Zielinski", phone: "+48 601 555 123", guestType: "SINGLE", source: "GROOM_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "STANDARD", notes: "Benötigt Rollstuhlplatz" },
    { firstName: "Opa", lastName: "Zielinski", guestType: "SINGLE", source: "GROOM_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, diet: "DAIRY_FREE", mealType: "CUSTOM" },
    { firstName: "Monika", lastName: "Berger", email: "monika.berger@example.de", guestType: "SINGLE", source: "BRIDE_SIDE", category: "FAMILY", role: "GENERAL_INVITE", age: "ADULT", status: "DECLINED", rsvpStatus: "DECLINED", inviteSent: true, mealType: "STANDARD", notes: "Kann wegen OP leider nicht kommen" },
    { firstName: "Piotr", lastName: "Kowalski", email: "piotr.k@example.pl", guestType: "SINGLE", source: "GROOM_SIDE", category: "FRIEND", role: "GENERAL_INVITE", age: "ADULT", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "STANDARD" },
    { firstName: "Eva", lastName: "Schwarz", email: "eva.schwarz@example.de", guestType: "SINGLE", source: "BRIDE_SIDE", category: "STRANGER", role: "GENERAL_INVITE", age: "ADULT", status: "PENDING", rsvpStatus: "NOT_SENT", inviteSent: false, mealType: "STANDARD" },
    { firstName: "Baby", lastName: "Müller", householdId: hMueller.id, guestType: "FAMILY", source: "BRIDE_SIDE", category: "FAMILY", age: "BABY", status: "CONFIRMED", rsvpStatus: "ATTENDING", inviteSent: true, mealType: "KIDS" },
  ];

  for (const g of guestsData) {
    await prisma.guest.create({
      data: {
        weddingProjectId: projectId,
        householdId: g.householdId || undefined,
        guestType: g.guestType || "SINGLE",
        firstName: g.firstName,
        lastName: g.lastName,
        email: g.email || undefined,
        phone: g.phone || undefined,
        source: g.source || undefined,
        category: g.category || undefined,
        role: g.role || undefined,
        age: g.age || undefined,
        diet: g.diet || undefined,
        mealType: g.mealType || "STANDARD",
        allergiesNote: g.allergiesNote || undefined,
        status: g.status || "PENDING",
        rsvpStatus: g.rsvpStatus || "NOT_SENT",
        inviteSent: g.inviteSent || false,
        isWeddingParty: g.isWeddingParty || false,
        notes: g.notes || undefined,
      },
    });
  }
  console.log(`✓ ${guestsData.length} Gäste befüllt`);

  // ═══════════════════════════════════════════════
  // 5. Vendors
  // ═══════════════════════════════════════════════
  const vendors = [
    { name: "Schloss Benrath", category: "LOCATION", status: "BOOKED", contactName: "Frau Meier", email: "events@schloss-benrath.de", phone: "+49 211 892 1903", website: "https://schloss-benrath.de", estimatedCost: 5500, actualCost: 5500, notes: "Schlüsselübergabe 10:00 Uhr am Hochzeitstag" },
    { name: "Foto-Studio Lichtblick", category: "FOTO_VIDEO", status: "BOOKED", contactName: "Sebastian Klein", email: "info@lichtblick-foto.de", phone: "+49 211 555 7890", website: "https://lichtblick-foto.de", estimatedCost: 2800, actualCost: 2800 },
    { name: "Videografie Meyer", category: "FOTO_VIDEO", status: "BOOKED", contactName: "Tim Meyer", email: "tim@videomeyer.de", estimatedCost: 1500, actualCost: 1500 },
    { name: "DJ Marco", category: "MUSIK_DJ", status: "BOOKED", contactName: "Marco Bianchi", email: "dj.marco@example.de", phone: "+49 173 888 4567", estimatedCost: 1200, actualCost: 1200 },
    { name: "Ensemble Rheinharmonie", category: "MUSIK_DJ", status: "BOOKED", contactName: "Prof. Wagner", email: "info@rheinharmonie.de", estimatedCost: 800, actualCost: 800, notes: "Trauung: 14:00–15:00, Sektempfang: 15:00–16:00" },
    { name: "Blumen Paradies", category: "FLORISTIK", status: "SHORTLISTED", contactName: "Gabi Grün", email: "info@blumenparadies.de", phone: "+49 211 444 5678", estimatedCost: 2500, nextAction: "Probearrangement am 15.05.2026" },
    { name: "Catering Rheingenuss", category: "CATERING", status: "BOOKED", contactName: "Chef Müller", email: "events@rheingenuss.de", phone: "+49 211 777 1234", website: "https://rheingenuss.de", estimatedCost: 9600, actualCost: 4800, notes: "Probeessen am 01.06.2026" },
    { name: "Styling Studio Glam", category: "STYLING", status: "BOOKED", contactName: "Natalie Rose", email: "natalie@glamstudio.de", estimatedCost: 400, actualCost: 200 },
    { name: "Oldtimer-Verleih Rhein", category: "TRANSPORT", status: "BOOKED", contactName: "Herr Benz", phone: "+49 211 333 4567", estimatedCost: 800, actualCost: 400 },
    { name: "Trauredner Frank Herzen", category: "TRAUREDNER", status: "CONTACTED", contactName: "Frank Herzen", email: "frank@herzen-reden.de", website: "https://herzen-reden.de", estimatedCost: 600, nextAction: "Telefon-Termin am 20.02.2026" },
    { name: "Druckerei Feinpapier", category: "PAPETERIE", status: "BOOKED", contactName: "Frau Schön", email: "info@feinpapier.de", estimatedCost: 600, actualCost: 450, notes: "Menükarten noch offen" },
  ];

  for (let i = 0; i < vendors.length; i++) {
    await prisma.vendor.create({
      data: { weddingProjectId: projectId, ...vendors[i], sortOrder: i },
    });
  }
  console.log("✓ Dienstleister befüllt");

  // ═══════════════════════════════════════════════
  // 6. Schedule Days + Events
  // ═══════════════════════════════════════════════
  const day1 = await prisma.scheduleDay.create({
    data: { weddingProjectId: projectId, name: "Polterabend", date: new Date("2026-08-01"), sortOrder: 0 },
  });
  const day2 = await prisma.scheduleDay.create({
    data: { weddingProjectId: projectId, name: "Hochzeitstag", date: new Date("2026-08-02"), sortOrder: 1 },
  });
  const day3 = await prisma.scheduleDay.create({
    data: { weddingProjectId: projectId, name: "Brunch am Tag danach", date: new Date("2026-08-03"), sortOrder: 2 },
  });

  const events1 = [
    { title: "Aufbau & Dekoration", startTime: "14:00", endTime: "17:00", location: "Biergarten Altstadt", sortOrder: 0 },
    { title: "Polterabend-Feier", startTime: "18:00", endTime: "23:00", description: "Ungezwungenes Zusammenkommen mit Freunden und Familie", location: "Biergarten Altstadt", sortOrder: 1 },
  ];

  const events2 = [
    { title: "Getting Ready Braut", startTime: "09:00", endTime: "12:00", description: "Frisur, Make-up & letzte Vorbereitungen", location: "Hotel Mutterhaus, Suite 301", sortOrder: 0 },
    { title: "Getting Ready Bräutigam", startTime: "10:00", endTime: "12:30", location: "Hotel Mutterhaus, Zimmer 205", sortOrder: 1 },
    { title: "First Look", startTime: "13:00", endTime: "13:30", description: "Erstes Sehen im Schlossgarten", location: "Schloss Benrath, Rosengarten", sortOrder: 2 },
    { title: "Paarshooting", startTime: "13:30", endTime: "14:00", location: "Schloss Benrath, Park", sortOrder: 3 },
    { title: "Freie Trauung", startTime: "14:00", endTime: "15:00", description: "Zeremonienmeister: Frank Herzen. Streichquartett begleitet.", location: "Schloss Benrath, Orangerie", sortOrder: 4 },
    { title: "Sektempfang", startTime: "15:00", endTime: "16:30", description: "Canapés, Sekt & Gruppenfoto", location: "Schloss Benrath, Terrasse", sortOrder: 5 },
    { title: "Hochzeitsdinner", startTime: "17:00", endTime: "19:30", description: "4-Gänge-Menü", location: "Schloss Benrath, Festsaal", sortOrder: 6 },
    { title: "Anschnitt der Hochzeitstorte", startTime: "19:30", endTime: "20:00", location: "Schloss Benrath, Festsaal", sortOrder: 7 },
    { title: "Eröffnungstanz", startTime: "20:00", endTime: "20:15", description: "Erster Tanz als Ehepaar", location: "Schloss Benrath, Festsaal", sortOrder: 8 },
    { title: "Party & Tanz", startTime: "20:15", endTime: "02:00", description: "DJ Marco legt auf!", location: "Schloss Benrath, Festsaal", sortOrder: 9 },
    { title: "Mitternachtssnack", startTime: "00:00", endTime: "00:30", description: "Currywurst & Pommes", location: "Schloss Benrath, Terrasse", sortOrder: 10 },
  ];

  const events3 = [
    { title: "Gemeinsames Frühstück", startTime: "10:00", endTime: "13:00", description: "Gemütlicher Brunch mit den engsten Gästen. Geschenke auspacken!", location: "Hotel Mutterhaus, Frühstücksraum", sortOrder: 0 },
  ];

  for (const ev of events1) {
    await prisma.scheduleEvent.create({ data: { scheduleDayId: day1.id, ...ev } });
  }
  for (const ev of events2) {
    await prisma.scheduleEvent.create({ data: { scheduleDayId: day2.id, ...ev } });
  }
  for (const ev of events3) {
    await prisma.scheduleEvent.create({ data: { scheduleDayId: day3.id, ...ev } });
  }
  console.log("✓ Tagesablauf befüllt");

  // ═══════════════════════════════════════════════
  // 7. Seating Tables
  // ═══════════════════════════════════════════════
  const tables = [
    { name: "Brauttisch", capacity: 8, shape: "LONG", posX: 400, posY: 100, width: 240, height: 80 },
    { name: "Tisch 1 – Familie Braut", capacity: 10, shape: "ROUND", posX: 150, posY: 300, width: 120, height: 120 },
    { name: "Tisch 2 – Familie Bräutigam", capacity: 10, shape: "ROUND", posX: 400, posY: 300, width: 120, height: 120 },
    { name: "Tisch 3 – Freunde", capacity: 10, shape: "ROUND", posX: 650, posY: 300, width: 120, height: 120 },
    { name: "Tisch 4 – Kollegen", capacity: 8, shape: "ROUND", posX: 150, posY: 500, width: 120, height: 120 },
    { name: "Tisch 5 – Polnische Familie", capacity: 8, shape: "ROUND", posX: 400, posY: 500, width: 120, height: 120 },
    { name: "Kindertisch", capacity: 6, shape: "RECT", posX: 650, posY: 500, width: 140, height: 100 },
  ];

  for (let i = 0; i < tables.length; i++) {
    await prisma.seatingTable.create({
      data: { weddingProjectId: projectId, ...tables[i], sortOrder: i },
    });
  }

  // Room items
  await prisma.roomItem.create({ data: { weddingProjectId: projectId, itemType: "DANCE_FLOOR", label: "Tanzfläche", posX: 400, posY: 700, width: 200, height: 200 } });
  await prisma.roomItem.create({ data: { weddingProjectId: projectId, itemType: "DJ_BOOTH", label: "DJ-Pult", posX: 400, posY: 920, width: 100, height: 60 } });
  await prisma.roomItem.create({ data: { weddingProjectId: projectId, itemType: "BAR", label: "Bar", posX: 750, posY: 700, width: 140, height: 60 } });
  await prisma.roomItem.create({ data: { weddingProjectId: projectId, itemType: "CAKE_TABLE", label: "Torte", posX: 50, posY: 700, width: 80, height: 80 } });
  await prisma.roomItem.create({ data: { weddingProjectId: projectId, itemType: "ENTRANCE", label: "Eingang", posX: 400, posY: 50, width: 80, height: 40 } });
  console.log("✓ Sitzplan befüllt");

  // ═══════════════════════════════════════════════
  // 8. Packing Items
  // ═══════════════════════════════════════════════
  const packingItems = [
    { name: "Brautkleid", category: "WEDDING_WEEKEND", status: "PACKED", personInCharge: "Karolina" },
    { name: "Anzug + Hemd + Krawatte", category: "WEDDING_WEEKEND", status: "PACKED", personInCharge: "Rafal" },
    { name: "Eheringe", category: "WEDDING_WEEKEND", status: "PACKED", personInCharge: "Tobias (Trauzeuge)" },
    { name: "Notfall-Kit (Nähzeug, Pflaster, Aspirin)", category: "WEDDING_WEEKEND", status: "PACKED", personInCharge: "Anna (Trauzeugin)" },
    { name: "Brautschuhe + Wechselschuhe", category: "WEDDING_WEEKEND", status: "PENDING", personInCharge: "Karolina" },
    { name: "Manschettenknöpfe", category: "WEDDING_WEEKEND", status: "PENDING", personInCharge: "Rafal" },
    { name: "Gastgeschenke (Tüten)", category: "WEDDING_WEEKEND", status: "PENDING", personInCharge: "Karolina" },
    { name: "Tischkärtchen & Menükarten", category: "WEDDING_WEEKEND", status: "PENDING", personInCharge: "Rafal" },
    { name: "Musik-Playlist USB-Stick", category: "WEDDING_WEEKEND", status: "DONE", personInCharge: "Rafal" },
    { name: "Dekoration (Kerzen, Vasen)", category: "WEDDING_WEEKEND", status: "PENDING", personInCharge: "Anna" },
    { name: "Reisepässe", category: "HONEYMOON", status: "PACKED", personInCharge: "Rafal" },
    { name: "Sonnencreme & Strandtücher", category: "HONEYMOON", status: "PENDING", personInCharge: "Karolina" },
    { name: "Kamera & Ladegeräte", category: "HONEYMOON", status: "PENDING", personInCharge: "Rafal" },
    { name: "Reiseapotheke", category: "HONEYMOON", status: "PENDING", personInCharge: "Karolina" },
  ];

  for (let i = 0; i < packingItems.length; i++) {
    await prisma.packingItem.create({
      data: { weddingProjectId: projectId, ...packingItems[i], sortOrder: i },
    });
  }
  console.log("✓ Packliste befüllt");

  // ═══════════════════════════════════════════════
  // 9. Photos
  // ═══════════════════════════════════════════════
  const photos = [
    { title: "Verlobung am Gardasee", url: "https://images.unsplash.com/photo-1529636798458-92182e662485?w=800&q=80", category: "ENGAGEMENT", description: "Der Moment als Karolina JA gesagt hat" },
    { title: "Verlobungsring", url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=800&q=80", category: "ENGAGEMENT" },
    { title: "Unser erstes Date", url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", category: "OTHER", description: "Im Ristorante da Mario" },
    { title: "Schloss Benrath Außenansicht", url: "https://images.unsplash.com/photo-1464808322410-1a934aab61e5?w=800&q=80", category: "CEREMONY", description: "Unsere traumhafte Location" },
    { title: "Zusammen am Rhein", url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80", category: "OTHER" },
  ];

  for (let i = 0; i < photos.length; i++) {
    await prisma.photo.create({
      data: { weddingProjectId: projectId, ...photos[i], sortOrder: i },
    });
  }
  console.log("✓ Fotos befüllt");

  // ═══════════════════════════════════════════════
  // 10. Songs
  // ═══════════════════════════════════════════════
  const songs = [
    { title: "A Thousand Years", artist: "Christina Perri", category: "CEREMONY" },
    { title: "Can't Help Falling in Love", artist: "Elvis Presley", category: "CEREMONY" },
    { title: "Perfect", artist: "Ed Sheeran", category: "FIRST_DANCE" },
    { title: "Fly Me to the Moon", artist: "Frank Sinatra", category: "COCKTAIL" },
    { title: "La Vie en Rose", artist: "Louis Armstrong", category: "DINNER" },
    { title: "Don't Stop Believin'", artist: "Journey", category: "PARTY" },
    { title: "Shut Up and Dance", artist: "Walk the Moon", category: "PARTY" },
    { title: "Dancing Queen", artist: "ABBA", category: "PARTY" },
    { title: "Uptown Funk", artist: "Bruno Mars", category: "PARTY" },
    { title: "Sweet Caroline", artist: "Neil Diamond", category: "PARTY", notes: "Mitsing-Hit!" },
    { title: "Thinking Out Loud", artist: "Ed Sheeran", category: "DINNER" },
    { title: "Come Away with Me", artist: "Norah Jones", category: "COCKTAIL" },
  ];

  for (let i = 0; i < songs.length; i++) {
    await prisma.song.create({
      data: { weddingProjectId: projectId, ...songs[i], sortOrder: i },
    });
  }
  console.log("✓ Playlist befüllt");

  // ═══════════════════════════════════════════════
  // 11. Honeymoon Items
  // ═══════════════════════════════════════════════
  const honeymoon = [
    { title: "Flug DUS → Santorini", category: "FLIGHT", date: new Date("2026-08-05"), location: "Düsseldorf → Santorini", bookingRef: "LH4521", cost: 890, status: "BOOKED" },
    { title: "Canaves Oia Suites", category: "HOTEL", date: new Date("2026-08-05"), location: "Oia, Santorini", bookingRef: "CANV-28819", cost: 3200, status: "BOOKED", notes: "Honeymoon Suite mit Caldera-Blick" },
    { title: "Sunset Catamaran Tour", category: "ACTIVITY", date: new Date("2026-08-07"), location: "Santorini", cost: 280, status: "BOOKED" },
    { title: "Weinverkostung Santo Wines", category: "ACTIVITY", date: new Date("2026-08-08"), location: "Pyrgos, Santorini", cost: 120, status: "PLANNED" },
    { title: "Mietwagen", category: "TRANSPORT", date: new Date("2026-08-05"), location: "Santorini Flughafen", cost: 350, status: "BOOKED", bookingRef: "HERTZ-DE992" },
    { title: "Flug Santorini → DUS", category: "FLIGHT", date: new Date("2026-08-12"), location: "Santorini → Düsseldorf", bookingRef: "LH4522", cost: 890, status: "BOOKED" },
  ];

  for (let i = 0; i < honeymoon.length; i++) {
    await prisma.honeymoonItem.create({
      data: { weddingProjectId: projectId, ...honeymoon[i], sortOrder: i },
    });
  }
  console.log("✓ Flitterwochen befüllt");

  // ═══════════════════════════════════════════════
  // 12. Moodboard Items
  // ═══════════════════════════════════════════════
  const moodItems = [
    { imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80", category: "FLOWERS", notes: "Weiße Rosen + Eukalyptus" },
    { imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", category: "TABLESCAPE", notes: "Goldene Akzente, Kerzen" },
    { imageUrl: "https://images.unsplash.com/photo-1535254973040-607b474cb50d?w=800&q=80", category: "CAKE", notes: "Dreistöckig, weiß mit goldenen Details" },
    { imageUrl: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&q=80", category: "DECOR", notes: "Lichterketten im Außenbereich" },
    { imageUrl: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80", category: "DRESS", notes: "Inspiration Brautkleid" },
    { imageUrl: "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=800&q=80", category: "STATIONERY", notes: "Kalligraphie-Stil, Eukalyptus" },
  ];

  for (let i = 0; i < moodItems.length; i++) {
    await prisma.moodItem.create({
      data: { weddingProjectId: projectId, ...moodItems[i], sortOrder: i },
    });
  }
  console.log("✓ Moodboard befüllt");

  // ═══════════════════════════════════════════════
  // 13. Wedding Party Members
  // ═══════════════════════════════════════════════
  const partyMembers = [
    { name: "Anna Becker", role: "MAID_OF_HONOR", side: "BRIDE", email: "anna.becker@example.de", phone: "+49 176 5551234", notes: "Organisiert den Polterabend" },
    { name: "Tobias Hoffmann", role: "BEST_MAN", side: "GROOM", email: "tobias.hoffmann@example.de", notes: "Kümmert sich um die Ringe" },
    { name: "Lena Wagner", role: "BRIDESMAID", side: "BRIDE", email: "lena.wagner@example.de" },
    { name: "Piotr Kowalski", role: "GROOMSMAN", side: "GROOM", email: "piotr.k@example.pl" },
    { name: "Kasia Nowak", role: "FLOWER_GIRL", side: "BRIDE", notes: "8 Jahre alt, liebt Blumen" },
  ];

  for (let i = 0; i < partyMembers.length; i++) {
    await prisma.weddingPartyMember.create({
      data: { weddingProjectId: projectId, ...partyMembers[i], sortOrder: i },
    });
  }
  console.log("✓ Hochzeitsgesellschaft befüllt");

  // ═══════════════════════════════════════════════
  // 14. Food Categories + Items
  // ═══════════════════════════════════════════════
  const foodData = [
    { name: "Vorspeisen", items: [
      { name: "Carpaccio vom Rind", quantity: 80, unitPrice: 12 },
      { name: "Kürbissuppe (V)", quantity: 40, unitPrice: 8 },
      { name: "Burrata mit Tomaten (V)", quantity: 120, unitPrice: 10 },
    ]},
    { name: "Hauptgang", items: [
      { name: "Rinderfilet mit Rotwein-Jus", quantity: 70, unitPrice: 32 },
      { name: "Lachsfilet auf Spinat", quantity: 25, unitPrice: 28 },
      { name: "Pilzrisotto (V/Vegan)", quantity: 20, unitPrice: 22 },
      { name: "Kinderteller (Schnitzel & Pommes)", quantity: 5, unitPrice: 12 },
    ]},
    { name: "Desserts", items: [
      { name: "Panna Cotta", quantity: 60, unitPrice: 8 },
      { name: "Schokoladenmousse", quantity: 60, unitPrice: 9 },
      { name: "Obstsalat (Vegan)", quantity: 20, unitPrice: 6 },
    ]},
    { name: "Getränke", items: [
      { name: "Sektempfang (120 Gläser)", quantity: 120, unitPrice: 5 },
      { name: "Weißwein (Riesling)", quantity: 40, unitPrice: 25, notes: "Pro Flasche" },
      { name: "Rotwein (Spätburgunder)", quantity: 30, unitPrice: 28, notes: "Pro Flasche" },
      { name: "Bier (Pils & Weizen)", quantity: 100, unitPrice: 4 },
      { name: "Softdrinks & Wasser", quantity: 200, unitPrice: 3 },
    ]},
    { name: "Mitternachtssnack", items: [
      { name: "Currywurst", quantity: 80, unitPrice: 5 },
      { name: "Pommes", quantity: 80, unitPrice: 3 },
      { name: "Vegane Bratwurst", quantity: 15, unitPrice: 6 },
    ]},
  ];

  for (let i = 0; i < foodData.length; i++) {
    const cat = foodData[i];
    const foodCat = await prisma.foodCategory.create({
      data: { weddingProjectId: projectId, name: cat.name, sortOrder: i },
    });
    for (let j = 0; j < cat.items.length; j++) {
      const item = cat.items[j];
      await prisma.foodItem.create({
        data: {
          foodCategoryId: foodCat.id,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: (item.quantity || 0) * (item.unitPrice || 0),
          notes: (item as any).notes || undefined,
          sortOrder: j,
        },
      });
    }
  }
  console.log("✓ Essen & Getränke befüllt");

  console.log("\n🎉 Alle Dummy-Daten wurden erfolgreich eingefügt!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
