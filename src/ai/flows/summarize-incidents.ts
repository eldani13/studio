'use server';

/**
 * @fileOverview This file defines a Genkit flow for summarizing incidents reported on bus routes.
 *
 * - summarizeIncidents - A function that takes incident reports and generates a concise summary.
 * - SummarizeIncidentsInput - The input type for the summarizeIncidents function, including incident reports.
 * - SummarizeIncidentsOutput - The return type for the summarizeIncidents function, providing a summary of the incidents.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeIncidentsInputSchema = z.object({
  incidents: z.array(
    z.object({
      routeId: z.string().describe('The ID of the bus route.'),
      description: z.string().describe('A description of the incident.'),
      severity: z.enum(['low', 'medium', 'high']).describe('The severity of the incident.'),
      timestamp: z.string().describe('The timestamp of the incident.'),
    })
  ).describe('An array of incident reports to summarize.'),
});
export type SummarizeIncidentsInput = z.infer<typeof SummarizeIncidentsInputSchema>;

const SummarizeIncidentsOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the reported incidents.'),
});
export type SummarizeIncidentsOutput = z.infer<typeof SummarizeIncidentsOutputSchema>;

export async function summarizeIncidents(input: SummarizeIncidentsInput): Promise<SummarizeIncidentsOutput> {
  return summarizeIncidentsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeIncidentsPrompt',
  input: {schema: SummarizeIncidentsInputSchema},
  output: {schema: SummarizeIncidentsOutputSchema},
  prompt: `You are an AI assistant helping an admin summarize incidents reported on bus routes.

  Given the following incident reports, generate a concise summary highlighting the key issues and their severity.

  Incidents:
  {{#each incidents}}
  - Route ID: {{this.routeId}}
    Description: {{this.description}}
    Severity: {{this.severity}}
    Timestamp: {{this.timestamp}}
  {{/each}}

  Summary:`,
});

const summarizeIncidentsFlow = ai.defineFlow(
  {
    name: 'summarizeIncidentsFlow',
    inputSchema: SummarizeIncidentsInputSchema,
    outputSchema: SummarizeIncidentsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
