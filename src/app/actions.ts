"use server"

import { rosterImport, type RosterImportInput } from "@/ai/flows/roster-import"

export async function importRosterAction(
  input: RosterImportInput
) {
  try {
    const result = await rosterImport(input)
    return { success: true, data: result }
  } catch (error) {
    console.error("Roster import failed:", error)
    return { success: false, error: "Failed to process the roster file." }
  }
}
