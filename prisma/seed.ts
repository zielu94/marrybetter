import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Find existing user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.log("No user found. Please register first, then run seed.");
    return;
  }
  console.log(`Seeding data for user: ${user.email}`);

  // Update user info
  await prisma.user.update({
    where: { id: user.id },
    data: { name: "Rafal", partnerName: "Sophie" },
  });

  // Get or create wedding project
  let project = await prisma.weddingProject.findFirst({ where: { userId: user.id } });
  if (!project) {
    project = await prisma.weddingProject.create({
      data: {
        userId: user.id,
        weddingDate: new Date("2026-09-12"),
        location: "Schloss Bensberg, Bergisch Gladbach",
        totalBudget: 45000,
      },
    });
  } else {
    await prisma.weddingProject.update({
      where: { id: project.id },
      data: {
        weddingDate: new Date("2026-09-12"),
        location: "Schloss Bensberg, Bergisch Gladbach",
        totalBudget: 45000,
      },
    });
  }

  const pId = project.id;

  // ═══════════════════════════════════════════
  // GUESTS (30 guests)
  // ═══════════════════════════════════════════
  await prisma.guest.deleteMany({ where: { weddingProjectId: pId } });
  const guestData = [
    { firstName: "Thomas", lastName: "Müller", email: "t.müller@gmail.com", source: "GROOM_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Maria", lastName: "Müller", email: "m.müller@gmail.com", source: "GROOM_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "VEGETARIAN", age: "ADULT" },
    { firstName: "Hans", lastName: "Zielinski", email: "hans.z@web.de", source: "GROOM_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Petra", lastName: "Zielinski", email: "petra.z@web.de", source: "GROOM_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Klaus", lastName: "Weber", email: "k.weber@gmx.de", source: "BRIDE_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Ingrid", lastName: "Weber", email: "i.weber@gmx.de", source: "BRIDE_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "GLUTEN_FREE", age: "ADULT" },
    { firstName: "Stefan", lastName: "Becker", email: "s.becker@yahoo.de", source: "GROOM_SIDE", category: "FRIEND", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Julia", lastName: "Fischer", email: "j.fischer@outlook.de", source: "BRIDE_SIDE", category: "FRIEND", status: "CONFIRMED", inviteSent: true, diet: "VEGAN", age: "ADULT" },
    { firstName: "Markus", lastName: "Hoffmann", email: "m.hoffmann@gmail.com", source: "GROOM_SIDE", category: "FRIEND", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Anna", lastName: "Schneider", email: "a.schneider@web.de", source: "BRIDE_SIDE", category: "FRIEND", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Michael", lastName: "Braun", email: "m.braun@gmail.com", source: "GROOM_SIDE", category: "FRIEND", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Lisa", lastName: "Schmitz", email: "l.schmitz@gmx.de", source: "BRIDE_SIDE", category: "FRIEND", status: "CONFIRMED", inviteSent: true, diet: "VEGETARIAN", age: "ADULT" },
    { firstName: "Jens", lastName: "Wagner", email: "j.wagner@t-online.de", source: "GROOM_SIDE", category: "COLLEAGUE", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Sabine", lastName: "Koch", email: "s.koch@outlook.de", source: "BRIDE_SIDE", category: "COLLEAGUE", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Felix", lastName: "Schulz", email: "f.schulz@gmail.com", source: "GROOM_SIDE", category: "FRIEND", status: "DECLINED", inviteSent: true, diet: "", age: "ADULT", notes: "Leider im Urlaub" },
    { firstName: "Katharina", lastName: "Richter", email: "k.richter@web.de", source: "BRIDE_SIDE", category: "FRIEND", status: "DECLINED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Maximilian", lastName: "Klein", email: "m.klein@gmx.de", source: "GROOM_SIDE", category: "FRIEND", status: "PENDING", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Nina", lastName: "Wolf", email: "n.wolf@yahoo.de", source: "BRIDE_SIDE", category: "FRIEND", status: "PENDING", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Lukas", lastName: "Schroeder", source: "GROOM_SIDE", category: "FRIEND", status: "PENDING", inviteSent: false, diet: "", age: "ADULT" },
    { firstName: "Sarah", lastName: "Neumann", source: "BRIDE_SIDE", category: "FRIEND", status: "PENDING", inviteSent: false, diet: "", age: "ADULT" },
    { firstName: "Tobias", lastName: "Schwarz", source: "GROOM_SIDE", category: "COLLEAGUE", status: "PENDING", inviteSent: false, diet: "", age: "ADULT" },
    { firstName: "Emma", lastName: "Müller", source: "GROOM_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "KID", notes: "Nichte (7 Jahre)" },
    { firstName: "Paul", lastName: "Müller", source: "GROOM_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "TEENAGER", notes: "Neffe (14 Jahre)" },
    { firstName: "Oma", lastName: "Zielinski", source: "GROOM_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT", notes: "Rollstuhl beachten" },
    { firstName: "Karl", lastName: "Weber", source: "BRIDE_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT", notes: "Sophies Opa" },
    { firstName: "Laura", lastName: "Berger", email: "l.berger@gmail.com", source: "BRIDE_SIDE", category: "FRIEND", status: "CONFIRMED", inviteSent: true, diet: "VEGETARIAN", age: "ADULT" },
    { firstName: "David", lastName: "Hartmann", email: "d.hartmann@web.de", source: "GROOM_SIDE", category: "FRIEND", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Sandra", lastName: "Zimmermann", email: "s.zimmer@gmx.de", source: "BRIDE_SIDE", category: "COLLEAGUE", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT" },
    { firstName: "Patrick", lastName: "Krause", source: "GROOM_SIDE", category: "FRIEND", status: "PENDING", inviteSent: false, diet: "", age: "ADULT" },
    { firstName: "Christine", lastName: "Lehmann", email: "c.lehmann@t-online.de", source: "BRIDE_SIDE", category: "FAMILY", status: "CONFIRMED", inviteSent: true, diet: "", age: "ADULT", notes: "Sophies Tante" },
  ];

  const guests = [];
  for (const g of guestData) {
    const guest = await prisma.guest.create({
      data: { weddingProjectId: pId, ...g },
    });
    guests.push(guest);
  }
  console.log(`✓ ${guests.length} Gäste erstellt`);

  // ═══════════════════════════════════════════
  // VENDORS (8 vendors)
  // ═══════════════════════════════════════════
  await prisma.vendor.deleteMany({ where: { weddingProjectId: pId } });
  const vendorData = [
    { name: "Schloss Bensberg", category: "VENUE", contactName: "Frau Hartmann", email: "events@schlossbensberg.de", phone: "+49 2204 4200", website: "https://schlossbensberg.de", status: "OFFER_ACCEPTED", estimatedCost: 12000, actualCost: 11500, notes: "Garten-Zeremonie + Ballsaal für Empfang" },
    { name: "Fotostudio Lichtwerk", category: "PHOTOGRAPHER", contactName: "Markus Stein", email: "info@lichtwerk-foto.de", phone: "+49 221 9876543", website: "https://lichtwerk-foto.de", status: "OFFER_ACCEPTED", estimatedCost: 3500, actualCost: 3200, notes: "Ganztags-Paket inkl. Drohne" },
    { name: "DJ Soundwave", category: "DJ", contactName: "Alex Kramer", email: "booking@djsoundwave.de", phone: "+49 176 12345678", website: "https://djsoundwave.de", status: "OFFER_ACCEPTED", estimatedCost: 1800, actualCost: 1800, notes: "18-02 Uhr, inkl. Lichtanlage" },
    { name: "Blumen Paradies", category: "FLORIST", contactName: "Frau Blumenfeld", email: "kontakt@blumen-paradies.de", phone: "+49 221 5551234", status: "OFFER_RECEIVED", estimatedCost: 2800, notes: "Brautstrauß, Tischdeko, Kirchenschmuck" },
    { name: "Catering Köln Genuss", category: "CATERING", contactName: "Chef Koch", email: "events@koeln-genuss.de", phone: "+49 221 7776543", website: "https://koeln-genuss.de", status: "OFFER_ACCEPTED", estimatedCost: 8500, actualCost: 8200, notes: "5-Gänge-Menü, 30 Personen, inkl. Getränke" },
    { name: "Videografie Emotion", category: "VIDEOGRAPHER", contactName: "Tim Richter", email: "tim@videografie-emotion.de", phone: "+49 178 9876543", status: "MEETING_SCHEDULED", estimatedCost: 2500, notes: "Highlight-Film + Full-Day Edit" },
    { name: "Traumkleid Brautmoden", category: "DRESS", contactName: "Frau Engel", email: "info@traumkleid.de", phone: "+49 221 3334567", website: "https://traumkleid.de", status: "OFFER_ACCEPTED", estimatedCost: 3000, actualCost: 2850, notes: "Brautkleid + Schleier + Änderungen" },
    { name: "Papeterie Feinherb", category: "STATIONERY", contactName: "Lena Fuchs", email: "hallo@feinherb.de", website: "https://feinherb.de", status: "CONTACTED", estimatedCost: 800, notes: "Save-the-Date, Einladungen, Menü-Karten" },
  ];

  for (const v of vendorData) {
    await prisma.vendor.create({ data: { weddingProjectId: pId, ...v } });
  }
  console.log(`✓ ${vendorData.length} Dienstleister erstellt`);

  // ═══════════════════════════════════════════
  // BUDGET CATEGORIES + ITEMS
  // ═══════════════════════════════════════════
  await prisma.budgetCategory.deleteMany({ where: { weddingProjectId: pId } });
  const budgetCategories = [
    {
      name: "Location", plannedAmount: 12000, sortOrder: 0,
      items: [
        { name: "Raummiete Ballsaal", plannedAmount: 8000, actualAmount: 7500, paymentStatus: "FULLY_PAID", notes: "Schloss Bensberg" },
        { name: "Garten-Zeremonie Aufpreis", plannedAmount: 2000, actualAmount: 2000, paymentStatus: "FULLY_PAID" },
        { name: "Reinigung & Service", plannedAmount: 2000, actualAmount: 2000, paymentStatus: "DEPOSIT_PAID" },
      ],
    },
    {
      name: "Catering", plannedAmount: 9000, sortOrder: 1,
      items: [
        { name: "5-Gänge-Menü (30 Pers.)", plannedAmount: 6000, actualAmount: 5700, paymentStatus: "DEPOSIT_PAID", notes: "Köln Genuss Catering" },
        { name: "Getränke-Flatrate", plannedAmount: 2000, actualAmount: 1800, paymentStatus: "UNPAID" },
        { name: "Mitternachtssnack", plannedAmount: 500, actualAmount: 450, paymentStatus: "UNPAID" },
        { name: "Kaffee & Kuchen Nachmittag", plannedAmount: 500, actualAmount: 250, paymentStatus: "UNPAID" },
      ],
    },
    {
      name: "Fotografie & Video", plannedAmount: 6000, sortOrder: 2,
      items: [
        { name: "Fotograf Ganztags-Paket", plannedAmount: 3500, actualAmount: 3200, paymentStatus: "PARTIALLY_PAID", notes: "Lichtwerk Fotostudio" },
        { name: "Videograf Highlight-Film", plannedAmount: 2500, actualAmount: 0, paymentStatus: "UNPAID", notes: "Videografie Emotion – noch offen" },
      ],
    },
    {
      name: "Blumen & Dekoration", plannedAmount: 3000, sortOrder: 3,
      items: [
        { name: "Brautstrauß", plannedAmount: 250, actualAmount: 220, paymentStatus: "FULLY_PAID" },
        { name: "Tischdekoration (6 Tische)", plannedAmount: 1200, actualAmount: 0, paymentStatus: "UNPAID" },
        { name: "Kirchenschmuck", plannedAmount: 600, actualAmount: 0, paymentStatus: "UNPAID" },
        { name: "Stuhl-Schleifen & Extras", plannedAmount: 450, actualAmount: 0, paymentStatus: "UNPAID" },
      ],
    },
    {
      name: "Kleidung & Styling", plannedAmount: 5000, sortOrder: 4,
      items: [
        { name: "Brautkleid", plannedAmount: 2500, actualAmount: 2400, paymentStatus: "FULLY_PAID", notes: "Traumkleid Brautmoden" },
        { name: "Schleier & Accessoires", plannedAmount: 500, actualAmount: 450, paymentStatus: "FULLY_PAID" },
        { name: "Anzug Bräutigam", plannedAmount: 1200, actualAmount: 980, paymentStatus: "FULLY_PAID" },
        { name: "Make-up & Friseur", plannedAmount: 400, actualAmount: 350, paymentStatus: "DEPOSIT_PAID" },
        { name: "Schuhe (beide)", plannedAmount: 400, actualAmount: 320, paymentStatus: "FULLY_PAID" },
      ],
    },
    {
      name: "Musik & DJ", plannedAmount: 2000, sortOrder: 5,
      items: [
        { name: "DJ (18-02 Uhr)", plannedAmount: 1800, actualAmount: 1800, paymentStatus: "FULLY_PAID", notes: "DJ Soundwave" },
        { name: "Lichtanlage Aufpreis", plannedAmount: 200, actualAmount: 0, paymentStatus: "UNPAID", notes: "Im DJ-Paket enthalten" },
      ],
    },
    {
      name: "Papeterie", plannedAmount: 1000, sortOrder: 6,
      items: [
        { name: "Save-the-Date Karten", plannedAmount: 150, actualAmount: 120, paymentStatus: "FULLY_PAID" },
        { name: "Einladungskarten", plannedAmount: 350, actualAmount: 0, paymentStatus: "UNPAID" },
        { name: "Menü-Karten & Tischkarten", plannedAmount: 250, actualAmount: 0, paymentStatus: "UNPAID" },
        { name: "Dankeskarten", plannedAmount: 250, actualAmount: 0, paymentStatus: "UNPAID" },
      ],
    },
    {
      name: "Ringe", plannedAmount: 3000, sortOrder: 7,
      items: [
        { name: "Eheringe (Paar)", plannedAmount: 2800, actualAmount: 2650, paymentStatus: "FULLY_PAID", notes: "Juwelier Goldschmied Köln" },
        { name: "Gravur", plannedAmount: 200, actualAmount: 150, paymentStatus: "FULLY_PAID" },
      ],
    },
    {
      name: "Hochzeitstorte", plannedAmount: 800, sortOrder: 8,
      items: [
        { name: "3-stoeckige Torte", plannedAmount: 650, actualAmount: 0, paymentStatus: "UNPAID", notes: "Konditorei Suess" },
        { name: "Cake Topper", plannedAmount: 80, actualAmount: 65, paymentStatus: "FULLY_PAID" },
      ],
    },
    {
      name: "Transport", plannedAmount: 1500, sortOrder: 9,
      items: [
        { name: "Oldtimer-Hochzeitsauto", plannedAmount: 800, actualAmount: 750, paymentStatus: "DEPOSIT_PAID" },
        { name: "Shuttle-Service Gäste", plannedAmount: 700, actualAmount: 0, paymentStatus: "UNPAID" },
      ],
    },
    {
      name: "Sonstiges", plannedAmount: 1700, sortOrder: 10,
      items: [
        { name: "Trauung-Gebühren", plannedAmount: 200, actualAmount: 180, paymentStatus: "FULLY_PAID" },
        { name: "Hochzeitsversicherung", plannedAmount: 300, actualAmount: 280, paymentStatus: "FULLY_PAID" },
        { name: "Gastgeschenke", plannedAmount: 400, actualAmount: 0, paymentStatus: "UNPAID" },
        { name: "Kinderbetreuung", plannedAmount: 300, actualAmount: 0, paymentStatus: "UNPAID" },
        { name: "Notfall-Reserve", plannedAmount: 500, actualAmount: 0, paymentStatus: "UNPAID" },
      ],
    },
  ];

  for (const cat of budgetCategories) {
    const { items, ...catData } = cat;
    const created = await prisma.budgetCategory.create({
      data: { weddingProjectId: pId, ...catData },
    });
    for (const item of items) {
      await prisma.budgetItem.create({
        data: { budgetCategoryId: created.id, ...item },
      });
    }
  }
  console.log(`✓ ${budgetCategories.length} Budget-Kategorien mit Positionen erstellt`);

  // ═══════════════════════════════════════════
  // TASKS (20 tasks)
  // ═══════════════════════════════════════════
  await prisma.task.deleteMany({ where: { weddingProjectId: pId } });
  const taskData = [
    { title: "Standesamtlichen Termin reservieren", category: "Planung", status: "DONE", priority: "HIGH", dueDate: new Date("2026-01-15") },
    { title: "Location besichtigen und buchen", category: "Location", status: "DONE", priority: "HIGH", dueDate: new Date("2026-02-01") },
    { title: "Gästeliste finalisieren", category: "Gäste", status: "DONE", priority: "HIGH", dueDate: new Date("2026-03-01") },
    { title: "Caterer auswählen und buchen", category: "Catering", status: "DONE", priority: "HIGH", dueDate: new Date("2026-03-15") },
    { title: "Fotograf buchen", category: "Dienstleister", status: "DONE", priority: "HIGH", dueDate: new Date("2026-02-20") },
    { title: "DJ buchen", category: "Musik", status: "DONE", priority: "MEDIUM", dueDate: new Date("2026-03-01") },
    { title: "Save-the-Date Karten versenden", category: "Papeterie", status: "DONE", priority: "MEDIUM", dueDate: new Date("2026-04-01") },
    { title: "Brautkleid aussuchen", category: "Kleidung", status: "DONE", priority: "HIGH", dueDate: new Date("2026-04-15") },
    { title: "Eheringe auswählen und bestellen", category: "Ringe", status: "DONE", priority: "MEDIUM", dueDate: new Date("2026-05-01") },
    { title: "Einladungskarten designen und drucken", category: "Papeterie", status: "IN_PROGRESS", priority: "HIGH", dueDate: new Date("2026-06-01") },
    { title: "Einladungen versenden", category: "Papeterie", status: "OPEN", priority: "HIGH", dueDate: new Date("2026-06-15") },
    { title: "Blumenarrangements besprechen", category: "Dekoration", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: new Date("2026-07-01") },
    { title: "Menü-Verkostung beim Caterer", category: "Catering", status: "OPEN", priority: "MEDIUM", dueDate: new Date("2026-07-15") },
    { title: "Hochzeitstorte bestellen", category: "Catering", status: "OPEN", priority: "MEDIUM", dueDate: new Date("2026-08-01") },
    { title: "Sitzplan erstellen", category: "Planung", status: "OPEN", priority: "MEDIUM", dueDate: new Date("2026-08-15") },
    { title: "Anzug-Anprobe", category: "Kleidung", status: "OPEN", priority: "MEDIUM", dueDate: new Date("2026-08-01") },
    { title: "Videografen buchen", category: "Dienstleister", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: new Date("2026-06-01") },
    { title: "Shuttle-Service organisieren", category: "Transport", status: "OPEN", priority: "LOW", dueDate: new Date("2026-08-20") },
    { title: "Gastgeschenke bestellen", category: "Sonstiges", status: "OPEN", priority: "LOW", dueDate: new Date("2026-08-25") },
    { title: "Probe-Make-up Termin", category: "Kleidung", status: "OPEN", priority: "LOW", dueDate: new Date("2026-08-01") },
  ];

  for (let i = 0; i < taskData.length; i++) {
    await prisma.task.create({ data: { weddingProjectId: pId, sortOrder: i, ...taskData[i] } });
  }
  console.log(`✓ ${taskData.length} Aufgaben erstellt`);

  // ═══════════════════════════════════════════
  // SCHEDULE (2 days)
  // ═══════════════════════════════════════════
  await prisma.scheduleDay.deleteMany({ where: { weddingProjectId: pId } });
  const day1 = await prisma.scheduleDay.create({
    data: { weddingProjectId: pId, name: "Hochzeitstag", date: new Date("2026-09-12"), sortOrder: 0 },
  });
  const day1Events = [
    { title: "Friseur & Make-up Braut", startTime: "08:00", endTime: "10:30", location: "Hotel Suite", description: "Stylistin kommt ins Hotel" },
    { title: "Getting Ready Bräutigam", startTime: "09:00", endTime: "10:30", location: "Hotel Zimmer", description: "Anzug, Frisur, Fotos" },
    { title: "First Look & Paarfotos", startTime: "11:00", endTime: "12:00", location: "Schlossgarten", description: "Nur Brautpaar + Fotograf" },
    { title: "Standesamtliche Trauung", startTime: "13:00", endTime: "13:45", location: "Standesamt Bergisch Gladbach" },
    { title: "Sektempfang", startTime: "14:00", endTime: "15:00", location: "Schloss-Terrasse", description: "Canapés und Champagner" },
    { title: "Freie Trauung", startTime: "15:30", endTime: "16:30", location: "Schlossgarten", description: "Unter der alten Eiche" },
    { title: "Gruppenfotos", startTime: "16:30", endTime: "17:15", location: "Schlossgarten" },
    { title: "Kaffee & Kuchen", startTime: "17:15", endTime: "18:00", location: "Orangerie" },
    { title: "Abendessen (5-Gänge)", startTime: "18:30", endTime: "20:30", location: "Ballsaal", description: "Reden zwischen den Gängen" },
    { title: "Eröffnungstanz", startTime: "20:30", endTime: "21:00", location: "Ballsaal", description: "Wiener Walzer" },
    { title: "Party & Tanz", startTime: "21:00", endTime: "01:00", location: "Ballsaal", description: "DJ Soundwave" },
    { title: "Mitternachtssnack", startTime: "00:00", endTime: "00:30", location: "Ballsaal" },
  ];

  for (let i = 0; i < day1Events.length; i++) {
    await prisma.scheduleEvent.create({
      data: { scheduleDayId: day1.id, sortOrder: i, ...day1Events[i] },
    });
  }

  const day2 = await prisma.scheduleDay.create({
    data: { weddingProjectId: pId, name: "Brunch am Sonntag", date: new Date("2026-09-13"), sortOrder: 1 },
  });
  const day2Events = [
    { title: "Gemeinsames Frühstück", startTime: "10:00", endTime: "12:00", location: "Hotel Restaurant", description: "Entspannter Brunch mit den engsten Gästen" },
    { title: "Geschenke öffnen", startTime: "12:00", endTime: "13:00", location: "Hotel Suite" },
    { title: "Verabschiedung", startTime: "13:00", endTime: "14:00", location: "Hotel Lobby" },
  ];

  for (let i = 0; i < day2Events.length; i++) {
    await prisma.scheduleEvent.create({
      data: { scheduleDayId: day2.id, sortOrder: i, ...day2Events[i] },
    });
  }
  console.log("✓ Zeitplan mit 2 Tagen und 15 Events erstellt");

  // ═══════════════════════════════════════════
  // WEDDING PARTY (8 members)
  // ═══════════════════════════════════════════
  await prisma.weddingPartyMember.deleteMany({ where: { weddingProjectId: pId } });
  const partyData = [
    { name: "Stefan Becker", role: "BEST_MAN", side: "GROOM", email: "s.becker@yahoo.de", phone: "+49 171 1234567", notes: "Bester Freund seit Schulzeit" },
    { name: "Julia Fischer", role: "MAID_OF_HONOR", side: "BRIDE", email: "j.fischer@outlook.de", phone: "+49 172 2345678", notes: "Sophies beste Freundin" },
    { name: "Markus Hoffmann", role: "GROOMSMAN", side: "GROOM", email: "m.hoffmann@gmail.com" },
    { name: "Anna Schneider", role: "BRIDESMAID", side: "BRIDE", email: "a.schneider@web.de" },
    { name: "Michael Braun", role: "GROOMSMAN", side: "GROOM", email: "m.braun@gmail.com" },
    { name: "Lisa Schmitz", role: "BRIDESMAID", side: "BRIDE", email: "l.schmitz@gmx.de" },
    { name: "Emma Müller", role: "FLOWER_GIRL", side: "GROOM", notes: "Nichte, 7 Jahre" },
    { name: "Paul Müller", role: "RING_BEARER", side: "GROOM", notes: "Neffe, 14 Jahre" },
  ];

  for (let i = 0; i < partyData.length; i++) {
    await prisma.weddingPartyMember.create({ data: { weddingProjectId: pId, sortOrder: i, ...partyData[i] } });
  }
  console.log(`✓ ${partyData.length} Hochzeitsgesellschaft-Mitglieder erstellt`);

  // ═══════════════════════════════════════════
  // SEATING TABLES (6 tables)
  // ═══════════════════════════════════════════
  await prisma.roomItem.deleteMany({ where: { weddingProjectId: pId } });
  await prisma.seatingTable.deleteMany({ where: { weddingProjectId: pId } });
  const tables = [
    { name: "Brauttisch", capacity: 6, shape: "RECTANGLE", posX: 400, posY: 80, width: 200, height: 80 },
    { name: "Tisch 1 – Familie", capacity: 8, shape: "ROUND", posX: 150, posY: 250, width: 120, height: 120 },
    { name: "Tisch 2 – Familie", capacity: 8, shape: "ROUND", posX: 400, posY: 250, width: 120, height: 120 },
    { name: "Tisch 3 – Freunde", capacity: 8, shape: "ROUND", posX: 650, posY: 250, width: 120, height: 120 },
    { name: "Tisch 4 – Freunde", capacity: 8, shape: "ROUND", posX: 275, posY: 430, width: 120, height: 120 },
    { name: "Tisch 5 – Kollegen", capacity: 6, shape: "ROUND", posX: 525, posY: 430, width: 120, height: 120 },
  ];

  for (let i = 0; i < tables.length; i++) {
    await prisma.seatingTable.create({ data: { weddingProjectId: pId, sortOrder: i, ...tables[i] } });
  }
  // Add room items
  await prisma.roomItem.create({ data: { weddingProjectId: pId, itemType: "DANCE_FLOOR", label: "Tanzflaeche", posX: 400, posY: 620, width: 200, height: 150 } });
  await prisma.roomItem.create({ data: { weddingProjectId: pId, itemType: "DJ_BOOTH", label: "DJ-Pult", posX: 400, posY: 800, width: 100, height: 60 } });
  console.log("✓ 6 Tische und 2 Raumelemente erstellt");

  // ═══════════════════════════════════════════
  // PACKING LIST (20 items)
  // ═══════════════════════════════════════════
  await prisma.packingItem.deleteMany({ where: { weddingProjectId: pId } });
  const packingData = [
    { name: "Brautkleid + Kleidersack", category: "WEDDING_WEEKEND", personInCharge: "Sophie", status: "PACKED" },
    { name: "Schleier & Haarschmuck", category: "WEDDING_WEEKEND", personInCharge: "Sophie", status: "PACKED" },
    { name: "Brautschuhe", category: "WEDDING_WEEKEND", personInCharge: "Sophie", status: "PACKED" },
    { name: "Anzug + Krawatte", category: "WEDDING_WEEKEND", personInCharge: "Rafal", status: "PACKED" },
    { name: "Eheringe", category: "WEDDING_WEEKEND", personInCharge: "Rafal", status: "PACKED" },
    { name: "Notfall-Kit (Nadel, Faden, Pflaster)", category: "WEDDING_WEEKEND", personInCharge: "Sophie", status: "DONE" },
    { name: "Personalausweis (für Standesamt)", category: "WEDDING_WEEKEND", personInCharge: "Beide", status: "PENDING" },
    { name: "Gästebuch + Stifte", category: "WEDDING_WEEKEND", personInCharge: "Sophie", status: "PENDING" },
    { name: "Tischnummern & Menü-Karten", category: "WEDDING_WEEKEND", personInCharge: "Rafal", status: "PENDING" },
    { name: "Kleine Geschenke für Trauzeugen", category: "WEDDING_WEEKEND", personInCharge: "Beide", status: "PENDING" },
    { name: "USB-Stick für Fotograf", category: "WEDDING_WEEKEND", personInCharge: "Rafal", status: "PENDING" },
    { name: "Ladekabel & Powerbank", category: "WEDDING_WEEKEND", personInCharge: "Rafal", status: "PACKED" },
    { name: "Reisepässe", category: "HONEYMOON", personInCharge: "Beide", status: "PENDING" },
    { name: "Reise-Dokumente & Buchungsbestätigungen", category: "HONEYMOON", personInCharge: "Rafal", status: "PENDING" },
    { name: "Sonnencreme & Reiseapotheke", category: "HONEYMOON", personInCharge: "Sophie", status: "PENDING" },
    { name: "Badekleidung", category: "HONEYMOON", personInCharge: "Beide", status: "PENDING" },
    { name: "Kamera + Speicherkarten", category: "HONEYMOON", personInCharge: "Rafal", status: "PENDING" },
    { name: "Bequeme Wanderschuhe", category: "HONEYMOON", personInCharge: "Beide", status: "PENDING" },
    { name: "Adapter (Steckdosen)", category: "HONEYMOON", personInCharge: "Rafal", status: "PENDING" },
    { name: "Reiseführer Santorin", category: "HONEYMOON", personInCharge: "Sophie", status: "PACKED" },
  ];

  for (let i = 0; i < packingData.length; i++) {
    await prisma.packingItem.create({ data: { weddingProjectId: pId, sortOrder: i, ...packingData[i] } });
  }
  console.log(`✓ ${packingData.length} Packlisten-Einträge erstellt`);

  // ═══════════════════════════════════════════
  // VENUE OPTIONS (3 venues)
  // ═══════════════════════════════════════════
  await prisma.venueOption.deleteMany({ where: { weddingProjectId: pId } });
  const venueData = [
    {
      name: "Schloss Bensberg", contactName: "Frau Hartmann", email: "events@schlossbensberg.de", phone: "+49 2204 4200",
      address: "Kadettenstrasse, 51429 Bergisch Gladbach", capacity: 120, pros: "Traumhafte Kulisse, eigener Garten, exzellenter Service",
      notes: "GEWAEHLT – Vertrag unterschrieben",
      costItems: [
        { name: "Raummiete Ballsaal", amount: 8000 },
        { name: "Garten-Zeremonie", amount: 2000 },
        { name: "Reinigung", amount: 1500 },
      ],
    },
    {
      name: "Gut Leidenhausen", contactName: "Herr Koenig", email: "info@gut-leidenhausen.de",
      address: "Leidenhausener Weg, 51147 Köln", capacity: 80, pros: "Rustikaler Charme, guenstig, Scheune",
      notes: "Schoene Alternative, aber zu klein",
      costItems: [
        { name: "Scheunen-Miete", amount: 3500 },
        { name: "Gartennutzung", amount: 500 },
      ],
    },
    {
      name: "Wolkenburg Köln", contactName: "Event-Team", email: "events@wolkenburg.de",
      address: "Mauritiussteinweg 59, 50676 Köln", capacity: 200, pros: "Zentrale Lage, gross, historisch",
      notes: "Zu unpersönlich, eher für grosse Feiern",
      costItems: [
        { name: "Saalmiete", amount: 5000 },
        { name: "Service-Pauschale", amount: 2000 },
        { name: "Technik", amount: 800 },
      ],
    },
  ];

  for (const v of venueData) {
    const { costItems, ...vData } = v;
    const venue = await prisma.venueOption.create({ data: { weddingProjectId: pId, ...vData } });
    for (const ci of costItems) {
      await prisma.venueCostItem.create({ data: { venueOptionId: venue.id, ...ci } });
    }
  }
  console.log("✓ 3 Location-Optionen erstellt");

  // ═══════════════════════════════════════════
  // FOOD & DRINKS
  // ═══════════════════════════════════════════
  await prisma.foodCategory.deleteMany({ where: { weddingProjectId: pId } });
  const foodData = [
    {
      name: "Sektempfang", sortOrder: 0,
      items: [
        { name: "Champagner (Moet)", quantity: 10, unitPrice: 45, totalPrice: 450 },
        { name: "Prosecco", quantity: 5, unitPrice: 15, totalPrice: 75 },
        { name: "Orangensaft", quantity: 8, unitPrice: 4, totalPrice: 32 },
        { name: "Canapes (gemischt)", quantity: 60, unitPrice: 3.5, totalPrice: 210 },
      ],
    },
    {
      name: "5-Gänge-Menü", sortOrder: 1,
      items: [
        { name: "Amuse-Bouche: Lachstartar", quantity: 30, unitPrice: 8, totalPrice: 240 },
        { name: "Vorspeise: Kürbissuppe", quantity: 30, unitPrice: 12, totalPrice: 360, notes: "Vegane Option verfügbar" },
        { name: "Zwischengang: Sorbet", quantity: 30, unitPrice: 6, totalPrice: 180 },
        { name: "Hauptgang: Rinderfilet", quantity: 24, unitPrice: 35, totalPrice: 840, notes: "6x vegetarisch: Risotto" },
        { name: "Dessert: Schokoladen-Fondant", quantity: 30, unitPrice: 14, totalPrice: 420 },
      ],
    },
    {
      name: "Getränke", sortOrder: 2,
      items: [
        { name: "Wein (rot/weiss)", quantity: 20, unitPrice: 18, totalPrice: 360 },
        { name: "Bier (Koelsch)", quantity: 30, unitPrice: 4, totalPrice: 120 },
        { name: "Softdrinks", quantity: 40, unitPrice: 3, totalPrice: 120 },
        { name: "Wasser", quantity: 30, unitPrice: 2, totalPrice: 60 },
        { name: "Cocktails (Abendbar)", quantity: 50, unitPrice: 10, totalPrice: 500 },
      ],
    },
    {
      name: "Kaffee & Kuchen", sortOrder: 3,
      items: [
        { name: "Hochzeitstorte (3-stoeckig)", quantity: 1, unitPrice: 650, totalPrice: 650 },
        { name: "Kaffee & Tee", quantity: 30, unitPrice: 4, totalPrice: 120 },
        { name: "Petit Fours", quantity: 60, unitPrice: 2.5, totalPrice: 150 },
      ],
    },
  ];

  for (const fc of foodData) {
    const { items, ...fcData } = fc;
    const cat = await prisma.foodCategory.create({ data: { weddingProjectId: pId, ...fcData } });
    for (let i = 0; i < items.length; i++) {
      await prisma.foodItem.create({ data: { foodCategoryId: cat.id, sortOrder: i, ...items[i] } });
    }
  }
  console.log("✓ 4 Essen & Trinken Kategorien erstellt");

  // ═══════════════════════════════════════════
  // HONEYMOON
  // ═══════════════════════════════════════════
  await prisma.honeymoonItem.deleteMany({ where: { weddingProjectId: pId } });
  const honeymoonData = [
    { title: "Flug Köln → Athen", category: "FLIGHT", date: new Date("2026-09-15"), location: "Köln/Bonn Flughafen", bookingRef: "LH2345", cost: 680, status: "BOOKED", notes: "Eurowings, 2 Personen" },
    { title: "Flug Athen → Santorin", category: "FLIGHT", date: new Date("2026-09-15"), location: "Athen", bookingRef: "AE789", cost: 180, status: "BOOKED" },
    { title: "Hotel Mystique Santorin", category: "HOTEL", date: new Date("2026-09-15"), location: "Oia, Santorin", bookingRef: "MYS-20260915", cost: 3200, status: "BOOKED", notes: "Suite mit Caldera-Blick, 7 Naechte" },
    { title: "Katamaran-Tour bei Sonnenuntergang", category: "ACTIVITY", date: new Date("2026-09-17"), location: "Santorin", cost: 180, status: "BOOKED", notes: "Inkl. BBQ & Getränke" },
    { title: "Weinverkostung", category: "ACTIVITY", date: new Date("2026-09-18"), location: "Santo Wines, Santorin", cost: 80, status: "PLANNED" },
    { title: "Quad-Tour über die Insel", category: "ACTIVITY", date: new Date("2026-09-19"), location: "Santorin", cost: 60, status: "PLANNED" },
    { title: "Romantisches Abendessen", category: "ACTIVITY", date: new Date("2026-09-20"), location: "Ammoudi Bay", cost: 150, status: "PLANNED", notes: "Restaurant reservieren!" },
    { title: "Mietwagen (3 Tage)", category: "TRANSPORT", date: new Date("2026-09-17"), location: "Santorin", cost: 120, status: "BOOKED", bookingRef: "AVIS-ST123" },
    { title: "Rückflug Santorin → Köln", category: "FLIGHT", date: new Date("2026-09-22"), location: "Santorin", bookingRef: "AE790 + LH2346", cost: 860, status: "BOOKED" },
  ];

  for (let i = 0; i < honeymoonData.length; i++) {
    await prisma.honeymoonItem.create({ data: { weddingProjectId: pId, sortOrder: i, ...honeymoonData[i] } });
  }
  console.log(`✓ ${honeymoonData.length} Flitterwochen-Einträge erstellt`);

  console.log("\n🎉 Seed abgeschlossen! Alle Module sind mit Dummy-Daten befuellt.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
