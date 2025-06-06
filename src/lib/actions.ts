
// src/lib/actions.ts
"use server";

import { summarizeArticle, type SummarizeArticleInput } from "@/ai/flows/summarize-article";
import { rtdb } from "@/lib/firebase"; // Import rtdb for Realtime Database
import { ref, push, set } from "firebase/database"; // Firebase Realtime Database functions
import type { LedgerEntryFormData } from "./schemas";
import type { LedgerEntry } from "./types";


export async function getArticleSummary(articleUrl: string): Promise<string> {
  if (!articleUrl) {
    throw new Error("Article URL is required.");
  }

  try {
    const input: SummarizeArticleInput = { articleUrl };
    const result = await summarizeArticle(input);
    return result.summary;
  } catch (error) {
    console.error("Error summarizing article:", error);
    if (error instanceof Error) {
      return `Failed to summarize article: ${error.message}`;
    }
    return "Failed to summarize article due to an unknown error.";
  }
}

export async function addLedgerEntry(data: LedgerEntryFormData): Promise<{ success: boolean; error?: string; entryId?: string }> {
  console.log("addLedgerEntry action started for Realtime Database. Checking rtdb object...");
  if (!rtdb) {
    console.error("Firebase Realtime Database (rtdb) object is not available in addLedgerEntry.");
    return { success: false, error: "Firebase Realtime Database is not initialized on the server. Check Firebase configuration and environment variables." };
  }
  console.log("rtdb object appears to be available.");

  try {
    const tagsArray = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(tag => tag) : [];
    
    const entriesRef = ref(rtdb, 'ledger_entries');
    const newEntryRef = push(entriesRef); // Generates a unique key (ID)

    // Prepare data for Realtime Database
    // Omit 'id' as it's the key from newEntryRef
    // Date is stored as ISO string
    const newEntry: Omit<LedgerEntry, "id"> = {
      title: data.title,
      sourceUrl: data.sourceUrl,
      amount: data.amount,
      date: data.date.toISOString(), // Store as ISO string
      giver: data.giver,
      recipients: data.recipients,
      location: {
        county: data.county,
        town: data.town || "",
      },
      description: data.description,
      tags: tagsArray,
    };

    console.log("Attempting to set data in Realtime Database with path:", newEntryRef.toString(), "and data:", JSON.stringify(newEntry, null, 2));
    await set(newEntryRef, newEntry);
    
    const entryId = newEntryRef.key;
    console.log("Data added successfully to Realtime Database. Entry ID:", entryId);
    return { success: true, entryId: entryId! }; // entryId will be the key from push
  } catch (error: any) { 
    console.error("[SERVER ACTION ERROR] Error adding ledger entry to Realtime Database:", error);
    let errorMessage = "An unknown error occurred while adding the entry to Realtime Database.";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null && 'message' in error) {
      errorMessage = String(error.message);
    }

    if (error.code) {
      console.error("Error code (e.g., Firebase error code):", error.code);
      errorMessage = `${errorMessage} (Code: ${error.code})`;
    }
    if (error.stack) {
        console.error("Error stack:", error.stack);
    }
    
    return { success: false, error: errorMessage };
  }
}
