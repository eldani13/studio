'use server';
/**
 * @fileOverview Predicts the Estimated Time of Arrival (ETA) of buses based on historical data.
 *
 * - predictETA - A function that predicts the ETA of a bus.
 * - PredictETAInput - The input type for the predictETA function.
 * - PredictETAOutput - The return type for the predictETA function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictETAInputSchema = z.object({
  routeId: z.string().describe('The ID of the bus route.'),
  origin: z.string().describe('The origin stop of the journey.'),
  destination: z.string().describe('The destination stop of the journey.'),
  currentTime: z.string().describe('The current time as an ISO string.'),
  historicalData: z.array(
    z.object({
      timestamp: z.string().describe('Timestamp of the historical data point as an ISO string.'),
      duration: z.number().describe('The duration of the trip in seconds.'),
    })
  ).describe('Historical trip data for the route.'),
});
export type PredictETAInput = z.infer<typeof PredictETAInputSchema>;

const PredictETAOutputSchema = z.object({
  predictedETA: z.string().describe('The predicted ETA as an ISO string.'),
  confidence: z.number().describe('The confidence level of the prediction (0-1).'),
});
export type PredictETAOutput = z.infer<typeof PredictETAOutputSchema>;

export async function predictETA(input: PredictETAInput): Promise<PredictETAOutput> {
  return predictETAFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictETAPrompt',
  input: {schema: PredictETAInputSchema},
  output: {schema: PredictETAOutputSchema},
  prompt: `You are an expert in predicting bus ETAs based on historical data.

  Given the following information, predict the ETA for the bus to arrive at the destination.

  Route ID: {{{routeId}}}
  Origin: {{{origin}}}
  Destination: {{{destination}}}
  Current Time: {{{currentTime}}}

  Historical Data:
  {{#each historicalData}}
  - Timestamp: {{{timestamp}}}, Duration: {{{duration}}} seconds
  {{/each}}

  Consider the historical data and the current time to make an accurate prediction. Provide a confidence level (0-1) for your prediction.

  Format the predicted ETA as an ISO string.
  `,
});

const predictETAFlow = ai.defineFlow(
  {
    name: 'predictETAFlow',
    inputSchema: PredictETAInputSchema,
    outputSchema: PredictETAOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
