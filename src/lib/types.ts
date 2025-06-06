
// No direct import for Timestamp needed from Firestore for Realtime Database usage

export interface LedgerEntry {
  id: string;
  title: string;
  sourceUrl: string;
  amount: number; // KES
  date: string; // Stored as ISO string in RTDB, processed to "YYYY-MM-DD" for client
  giver: string;
  recipients: string;
  location: {
    county: KenyanCounty | string;
    town?: string;
  };
  description: string;
  tags: string[];
}

export interface Filters {
  keyword: string;
  giver: string;
  location: string; // County name
  category: string; // Tag
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
}

export type KenyanCounty = 
  | "Baringo" | "Bomet" | "Bungoma" | "Busia" | "Elgeyo-Marakwet" | "Embu"
  | "Garissa" | "Homa Bay" | "Isiolo" | "Kajiado" | "Kakamega" | "Kericho"
  | "Kiambu" | "Kilifi" | "Kirinyaga" | "Kisii" | "Kisumu" | "Kitui"
  | "Kwale" | "Laikipia" | "Lamu" | "Machakos" | "Makueni" | "Mandera"
  | "Marsabit" | "Meru" | "Migori" | "Mombasa" | "Murang'a" | "Nairobi"
  | "Nakuru" | "Nandi" | "Narok" | "Nyamira" | "Nyandarua" | "Nyeri"
  | "Samburu" | "Siaya" | "Taita-Taveta" | "Tana River" | "Tharaka-Nithi"
  | "Trans Nzoia" | "Turkana" | "Uasin Gishu" | "Vihiga" | "Wajir" | "West Pokot";

export const kenyanCounties: KenyanCounty[] = [
  "Baringo", "Bomet", "Bungoma", "Busia", "Elgeyo-Marakwet", "Embu",
  "Garissa", "Homa Bay", "Isiolo", "Kajiado", "Kakamega", "Kericho",
  "Kiambu", "Kilifi", "Kirinyaga", "Kisii", "Kisumu", "Kitui",
  "Kwale", "Laikipia", "Lamu", "Machakos", "Makueni", "Mandera",
  "Marsabit", "Meru", "Migori", "Mombasa", "Murang'a", "Nairobi",
  "Nakuru", "Nandi", "Narok", "Nyamira", "Nyandarua", "Nyeri",
  "Samburu", "Siaya", "Taita-Taveta", "Tana River", "Tharaka-Nithi",
  "Trans Nzoia", "Turkana", "Uasin Gishu", "Vihiga", "Wajir", "West Pokot"
];
