// User roles
export type UserRole = "COUPLE" | "PLANNER";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  COUPLE: "Paar",
  PLANNER: "Hochzeitsplaner",
};

export type PaymentStatus = "UNPAID" | "DEPOSIT_PAID" | "PARTIALLY_PAID" | "FULLY_PAID";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";
export type TaskStatus = "OPEN" | "IN_PROGRESS" | "DONE";
export type GuestSource = "GROOM_SIDE" | "BRIDE_SIDE";
export type GuestCategory = "FRIEND" | "FAMILY" | "COLLEAGUE" | "STRANGER";
export type GuestRole = "GENERAL_INVITE" | "PLUS_ONE";
export type GuestAge = "ADULT" | "TEENAGER" | "KID" | "BABY";
export type GuestDiet = "VEGAN" | "PESCATARIAN" | "GLUTEN_FREE" | "NUT_FREE" | "VEGETARIAN" | "FLEXITARIAN" | "DAIRY_FREE" | "OTHER";
export type GuestStatus = "PENDING" | "CONFIRMED" | "DECLINED";
export type GuestType = "SINGLE" | "COUPLE" | "FAMILY";
export type RsvpStatus = "NOT_SENT" | "INVITED" | "ATTENDING" | "DECLINED" | "MAYBE";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  UNPAID: "Unbezahlt",
  DEPOSIT_PAID: "Anzahlung",
  PARTIALLY_PAID: "Teilweise bezahlt",
  FULLY_PAID: "Vollständig bezahlt",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Niedrig",
  MEDIUM: "Mittel",
  HIGH: "Hoch",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  OPEN: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Erledigt",
};

export const GUEST_SOURCE_LABELS: Record<GuestSource, string> = {
  GROOM_SIDE: "Bräutigamseite",
  BRIDE_SIDE: "Brautseite",
};

export const GUEST_CATEGORY_LABELS: Record<GuestCategory, string> = {
  FRIEND: "Freunde",
  FAMILY: "Familie",
  COLLEAGUE: "Kollegen",
  STRANGER: "Bekannte",
};

export const GUEST_ROLE_LABELS: Record<GuestRole, string> = {
  GENERAL_INVITE: "Einladung",
  PLUS_ONE: "Begleitung",
};

export const GUEST_AGE_LABELS: Record<GuestAge, string> = {
  ADULT: "Erwachsen",
  TEENAGER: "Teenager",
  KID: "Kind",
  BABY: "Baby",
};

export const GUEST_DIET_LABELS: Record<GuestDiet, string> = {
  VEGAN: "Vegan",
  PESCATARIAN: "Pescetarisch",
  GLUTEN_FREE: "Glutenfrei",
  NUT_FREE: "Nussfrei",
  VEGETARIAN: "Vegetarisch",
  FLEXITARIAN: "Flexitarisch",
  DAIRY_FREE: "Laktosefrei",
  OTHER: "Sonstiges",
};

export const GUEST_STATUS_LABELS: Record<GuestStatus, string> = {
  PENDING: "Ausstehend",
  CONFIRMED: "Zugesagt",
  DECLINED: "Abgesagt",
};

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  SINGLE: "Einzelgast",
  COUPLE: "Paar / Begleitung",
  FAMILY: "Familie",
};

export const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  NOT_SENT: "Nicht gesendet",
  INVITED: "Eingeladen",
  ATTENDING: "Zusage",
  DECLINED: "Absage",
  MAYBE: "Vielleicht",
};

// Vendor types
export type VendorCategory =
  | "LOCATION"
  | "FOTO_VIDEO"
  | "MUSIK_DJ"
  | "FLORISTIK"
  | "CATERING"
  | "STYLING"
  | "PAPETERIE"
  | "DEKO_VERLEIH"
  | "TRANSPORT"
  | "UNTERKUNFT"
  | "TRAUREDNER"
  | "SONSTIGES";

export type VendorStatus =
  | "IDENTIFIED"
  | "CONTACTED"
  | "OFFER_RECEIVED"
  | "BOOKED"
  | "NOT_CHOSEN";

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  LOCATION: "Location",
  FOTO_VIDEO: "Foto / Video",
  MUSIK_DJ: "Musik / DJ",
  FLORISTIK: "Floristik",
  CATERING: "Catering",
  STYLING: "Styling (Hair/Make-up)",
  PAPETERIE: "Papeterie",
  DEKO_VERLEIH: "Deko / Verleih",
  TRANSPORT: "Transport",
  UNTERKUNFT: "Unterkunft",
  TRAUREDNER: "Trauredner:in",
  SONSTIGES: "Sonstiges",
};

export const VENDOR_STATUS_LABELS: Record<VendorStatus, string> = {
  IDENTIFIED: "Entdeckt",
  CONTACTED: "Kontaktiert",
  OFFER_RECEIVED: "Angebot erhalten",
  BOOKED: "Gebucht",
  NOT_CHOSEN: "Nicht gewählt",
};

export const VENDOR_STATUS_ORDER: VendorStatus[] = [
  "IDENTIFIED",
  "CONTACTED",
  "OFFER_RECEIVED",
  "BOOKED",
  "NOT_CHOSEN",
];

// Schedule / Timeline
export const MAX_SCHEDULE_DAYS = 3;

export const DEFAULT_SCHEDULE_DAY_NAMES = [
  "Polterabend",
  "Hochzeitstag",
  "Brunch am Tag danach",
];

// Wedding Party
export type WeddingPartyRole = "MAID_OF_HONOR" | "BEST_MAN" | "BRIDESMAID" | "GROOMSMAN" | "FLOWER_GIRL" | "RING_BEARER" | "USHER" | "MC" | "OFFICIANT" | "OTHER";
export type WeddingPartySide = "BRIDE" | "GROOM";

export const WEDDING_PARTY_ROLE_LABELS: Record<WeddingPartyRole, string> = {
  MAID_OF_HONOR: "Trauzeugin",
  BEST_MAN: "Trauzeuge",
  BRIDESMAID: "Brautjungfer",
  GROOMSMAN: "Trauzeuge (m)",
  FLOWER_GIRL: "Blumenmädchen",
  RING_BEARER: "Ringträger:in",
  USHER: "Platzanweiser:in",
  MC: "Moderator:in",
  OFFICIANT: "Trauredner:in",
  OTHER: "Sonstige",
};

export const WEDDING_PARTY_SIDE_LABELS: Record<WeddingPartySide, string> = {
  BRIDE: "Brautseite",
  GROOM: "Bräutigamseite",
};

// Packing List
export type PackingCategory = "WEDDING_WEEKEND" | "HONEYMOON";
export type PackingStatus = "PENDING" | "PACKED" | "DONE";

export const PACKING_CATEGORY_LABELS: Record<PackingCategory, string> = {
  WEDDING_WEEKEND: "Hochzeitswochenende",
  HONEYMOON: "Flitterwochen",
};

export const PACKING_STATUS_LABELS: Record<PackingStatus, string> = {
  PENDING: "Ausstehend",
  PACKED: "Eingepackt",
  DONE: "Erledigt",
};

// Food & Drinks — Meal Types
export type MealType = "STANDARD" | "VEGETARIAN" | "VEGAN" | "KIDS" | "CUSTOM";

export const MEAL_TYPE_LABELS: Record<MealType, string> = {
  STANDARD: "Standard",
  VEGETARIAN: "Vegetarisch",
  VEGAN: "Vegan",
  KIDS: "Kindermenue",
  CUSTOM: "Individuell",
};

export const DEFAULT_FOOD_CATEGORIES = [
  "Vorspeisen",
  "Hauptgang",
  "Desserts",
  "Getränke",
  "Diät-Optionen",
];

export const DEFAULT_DRINK_CATEGORIES = [
  "Sekt / Empfang",
  "Wein (Weiß)",
  "Wein (Rot)",
  "Bier",
  "Softdrinks / Wasser",
  "Cocktails / Spirituosen",
  "Kaffee / Tee",
];

// Photo
export type PhotoCategory = "ENGAGEMENT" | "CEREMONY" | "RECEPTION" | "OTHER";

export const PHOTO_CATEGORY_LABELS: Record<PhotoCategory, string> = {
  ENGAGEMENT: "Verlobung",
  CEREMONY: "Zeremonie",
  RECEPTION: "Empfang",
  OTHER: "Sonstige",
};

// Honeymoon
export type HoneymoonCategory = "FLIGHT" | "HOTEL" | "ACTIVITY" | "TRANSPORT" | "OTHER";
export type HoneymoonStatus = "PLANNED" | "BOOKED" | "DONE";

export const HONEYMOON_CATEGORY_LABELS: Record<HoneymoonCategory, string> = {
  FLIGHT: "Flug",
  HOTEL: "Hotel",
  ACTIVITY: "Aktivität",
  TRANSPORT: "Transport",
  OTHER: "Sonstiges",
};

export const HONEYMOON_STATUS_LABELS: Record<HoneymoonStatus, string> = {
  PLANNED: "Geplant",
  BOOKED: "Gebucht",
  DONE: "Erledigt",
};

// Seating Chart Builder
export type TableShape = "ROUND" | "RECT" | "LONG";
export type RoomItemType = "BAR" | "DANCE_FLOOR" | "CAKE_TABLE" | "STAGE" | "DJ_BOOTH" | "ENTRANCE" | "BUFFET" | "TOILET" | "GARDEN" | "SEATING_AREA" | "PARKING" | "WALL" | "DOOR" | "WARDROBE" | "OTHER";

export const TABLE_SHAPE_LABELS: Record<TableShape, string> = {
  ROUND: "Rund",
  RECT: "Rechteckig",
  LONG: "Langtisch",
};

export const TABLE_SHAPE_DEFAULTS: Record<TableShape, { width: number; height: number; defaultCapacity: number }> = {
  ROUND: { width: 120, height: 120, defaultCapacity: 10 },
  RECT: { width: 140, height: 100, defaultCapacity: 8 },
  LONG: { width: 240, height: 80, defaultCapacity: 12 },
};

export const ROOM_ITEM_TYPE_LABELS: Record<RoomItemType, string> = {
  BAR: "Bar",
  DANCE_FLOOR: "Tanzfläche",
  CAKE_TABLE: "Tortentisch",
  STAGE: "Bühne",
  DJ_BOOTH: "DJ-Pult",
  ENTRANCE: "Eingang",
  BUFFET: "Büffet",
  TOILET: "Toilette",
  GARDEN: "Garten",
  SEATING_AREA: "Sitzmöglichkeit",
  PARKING: "Parkplatz",
  WALL: "Wand",
  DOOR: "Tür",
  WARDROBE: "Garderobe",
  OTHER: "Sonstiges",
};

export const ROOM_ITEM_TYPE_ICONS: Record<RoomItemType, string> = {
  BAR: "\uD83C\uDF78",
  DANCE_FLOOR: "\uD83D\uDC83",
  CAKE_TABLE: "\uD83C\uDF82",
  STAGE: "\uD83C\uDFA4",
  DJ_BOOTH: "\uD83C\uDFA7",
  ENTRANCE: "\uD83D\uDEAA",
  BUFFET: "\uD83C\uDF7D\uFE0F",
  TOILET: "\uD83D\uDEBB",
  GARDEN: "\uD83C\uDF3F",
  SEATING_AREA: "\uD83E\uDE91",
  PARKING: "\uD83C\uDD7F\uFE0F",
  WALL: "\uD83E\uDDF1",
  DOOR: "\uD83D\uDEAA",
  WARDROBE: "\uD83E\uDDE5",
  OTHER: "\uD83D\uDCE6",
};

export const ROOM_ITEM_TYPE_DEFAULTS: Record<RoomItemType, { width: number; height: number }> = {
  BAR: { width: 140, height: 60 },
  DANCE_FLOOR: { width: 200, height: 200 },
  CAKE_TABLE: { width: 80, height: 80 },
  STAGE: { width: 200, height: 100 },
  DJ_BOOTH: { width: 100, height: 60 },
  ENTRANCE: { width: 80, height: 40 },
  BUFFET: { width: 180, height: 80 },
  TOILET: { width: 80, height: 60 },
  GARDEN: { width: 160, height: 160 },
  SEATING_AREA: { width: 120, height: 80 },
  PARKING: { width: 160, height: 120 },
  WALL: { width: 200, height: 20 },
  DOOR: { width: 60, height: 20 },
  WARDROBE: { width: 120, height: 60 },
  OTHER: { width: 100, height: 100 },
};

// Moodboard
export type MoodItemCategory = "FLOWERS" | "TABLESCAPE" | "STATIONERY" | "DRESS" | "DECOR" | "LIGHTING" | "CAKE" | "OTHER";

export const MOOD_ITEM_CATEGORY_LABELS: Record<MoodItemCategory, string> = {
  FLOWERS: "Blumen",
  TABLESCAPE: "Tischdeko",
  STATIONERY: "Papeterie",
  DRESS: "Kleidung",
  DECOR: "Dekoration",
  LIGHTING: "Beleuchtung",
  CAKE: "Torte",
  OTHER: "Sonstiges",
};

export const MOOD_ITEM_CATEGORY_ICONS: Record<MoodItemCategory, string> = {
  FLOWERS: "\uD83C\uDF38",
  TABLESCAPE: "\uD83C\uDF7D\uFE0F",
  STATIONERY: "\uD83D\uDC8C",
  DRESS: "\uD83D\uDC57",
  DECOR: "\u2728",
  LIGHTING: "\uD83D\uDD6F\uFE0F",
  CAKE: "\uD83C\uDF82",
  OTHER: "\uD83D\uDCCC",
};

// Songs & Playlists
export type SongCategory = "CEREMONY" | "COCKTAIL" | "DINNER" | "FIRST_DANCE" | "PARTY" | "OTHER";

export const SONG_CATEGORY_LABELS: Record<SongCategory, string> = {
  CEREMONY: "Trauung",
  COCKTAIL: "Sektempfang",
  DINNER: "Dinner",
  FIRST_DANCE: "Eröffnungstanz",
  PARTY: "Party",
  OTHER: "Sonstiges",
};

export const SONG_CATEGORY_ICONS: Record<SongCategory, string> = {
  CEREMONY: "\uD83D\uDC92",
  COCKTAIL: "\uD83C\uDF7E",
  DINNER: "\uD83C\uDF7D\uFE0F",
  FIRST_DANCE: "\uD83D\uDC83",
  PARTY: "\uD83C\uDF89",
  OTHER: "\uD83C\uDFB5",
};

export const DEFAULT_BUDGET_CATEGORIES = [
  "Location",
  "Catering",
  "Fotografie & Video",
  "Musik & DJ",
  "Blumen & Dekoration",
  "Kleidung & Styling",
  "Papeterie",
  "Ringe",
  "Hochzeitstorte",
  "Transport",
  "Sonstiges",
];

// Default packing items for new accounts
export const DEFAULT_PACKING_ITEMS_WEDDING: string[] = [
  "Eheringe",
  "Brautkleid / Anzug",
  "Schuhe (Braut)",
  "Schuhe (Bräutigam)",
  "Schleier / Accessoires",
  "Notfall-Kit (Nadel, Faden, Pflaster)",
  "Taschentücher",
  "Lippenstift / Puder",
  "Parfum",
  "Manschettenknöpfe / Ansteckblume",
  "Trauversprechen / Rede",
  "Geschenke für Trauzeugen",
  "Gästebuch & Stifte",
  "Tischnummern / Platzkarten",
];

export const DEFAULT_PACKING_ITEMS_HONEYMOON: string[] = [
  "Reisepässe / Ausweise",
  "Flugtickets / Buchungsbestätigungen",
  "Reiseversicherung",
  "Sonnencreme",
  "Medikamente / Reiseapotheke",
  "Ladegeräte / Adapter",
];

// Default schedule for wedding day
export const DEFAULT_SCHEDULE_EVENTS = [
  { title: "Getting Ready Braut", startTime: "09:00", endTime: "12:00", owner: "Braut" },
  { title: "Getting Ready Bräutigam", startTime: "10:00", endTime: "12:00", owner: "Braeutigam" },
  { title: "First Look / Paarshooting", startTime: "12:30", endTime: "13:30", owner: "Braut" },
  { title: "Standesamtliche Trauung", startTime: "14:00", endTime: "14:45" },
  { title: "Sektempfang", startTime: "15:00", endTime: "16:00" },
  { title: "Freie Trauung / Zeremonie", startTime: "16:00", endTime: "17:00" },
  { title: "Gruppenfoto", startTime: "17:00", endTime: "17:30" },
  { title: "Abendessen", startTime: "18:00", endTime: "20:00" },
  { title: "Eröffnungstanz", startTime: "20:00", endTime: "20:15" },
  { title: "Hochzeitstorte anschneiden", startTime: "21:00", endTime: "21:15" },
  { title: "Party & Tanz", startTime: "21:15", endTime: "02:00" },
  { title: "Mitternachtssnack", startTime: "00:00", endTime: "00:30" },
];

export const DEFAULT_TASK_TEMPLATES = [
  { title: "Budget festlegen", monthsBefore: 12, priority: "HIGH", category: "Planung" },
  { title: "Gästeliste erstellen", monthsBefore: 12, priority: "HIGH", category: "Gäste" },
  { title: "Location besichtigen & buchen", monthsBefore: 12, priority: "HIGH", category: "Location" },
  { title: "Fotograf buchen", monthsBefore: 9, priority: "HIGH", category: "Dienstleister" },
  { title: "Musik / DJ buchen", monthsBefore: 9, priority: "MEDIUM", category: "Dienstleister" },
  { title: "Save-the-Dates versenden", monthsBefore: 9, priority: "MEDIUM", category: "Papeterie" },
  { title: "Catering auswählen", monthsBefore: 6, priority: "HIGH", category: "Catering" },
  { title: "Brautkleid / Anzug kaufen", monthsBefore: 6, priority: "HIGH", category: "Kleidung" },
  { title: "Einladungen gestalten", monthsBefore: 6, priority: "MEDIUM", category: "Papeterie" },
  { title: "Einladungen versenden", monthsBefore: 3, priority: "HIGH", category: "Papeterie" },
  { title: "Blumen & Deko bestellen", monthsBefore: 3, priority: "MEDIUM", category: "Dekoration" },
  { title: "Hochzeitstorte bestellen", monthsBefore: 3, priority: "MEDIUM", category: "Catering" },
  { title: "Eheringe auswählen", monthsBefore: 3, priority: "HIGH", category: "Ringe" },
  { title: "Sitzordnung erstellen", monthsBefore: 1, priority: "HIGH", category: "Gäste" },
  { title: "Letzte Details klären", monthsBefore: 1, priority: "MEDIUM", category: "Planung" },
];
