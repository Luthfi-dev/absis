'use server';

/**
 * @fileOverview Roster import flow using GenAI to map CSV columns to student data fields.
 *
 * - rosterImport - A function that handles the roster import process.
 * - RosterImportInput - The input type for the rosterImport function, a CSV file as a string.
 * - RosterImportOutput - The return type for the rosterImport function, indicating the mapping result.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RosterImportInputSchema = z.object({
  csvData: z
    .string()
    .describe('The CSV data as a string.'),
});
export type RosterImportInput = z.infer<typeof RosterImportInputSchema>;

const RosterImportOutputSchema = z.object({
  columnMapping: z
    .record(z.string(), z.string())
    .describe('A map of column names from the CSV to standard student fields (name, student ID, email).'),
});
export type RosterImportOutput = z.infer<typeof RosterImportOutputSchema>;

export async function rosterImport(input: RosterImportInput): Promise<RosterImportOutput> {
  return rosterImportFlow(input);
}

const rosterImportPrompt = ai.definePrompt({
  name: 'rosterImportPrompt',
  input: {schema: RosterImportInputSchema},
  output: {schema: RosterImportOutputSchema},
  prompt: `You are an expert data mapper.  Given the following CSV data, identify the columns that correspond to the following fields: name, student ID, email. Return a JSON object mapping the CSV column names to these fields.

CSV Data:
{{{csvData}}}

Ensure the output is a valid JSON object.
`,
});

const rosterImportFlow = ai.defineFlow(
  {
    name: 'rosterImportFlow',
    inputSchema: RosterImportInputSchema,
    outputSchema: RosterImportOutputSchema,
  },
  async input => {
    const {output} = await rosterImportPrompt(input);
    return output!;
  }
);
