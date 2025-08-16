'use server';

/**
 * @fileOverview An AI agent for detecting bus route deviations.
 *
 * - detectRouteDeviation - A function that detects deviations from the planned bus route.
 * - DetectRouteDeviationInput - The input type for the detectRouteDeviation function.
 * - DetectRouteDeviationOutput - The return type for the detectRouteDeviation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectRouteDeviationInputSchema = z.object({
  currentLocation: z
    .object({
      latitude: z.number().describe('The current latitude of the bus.'),
      longitude: z.number().describe('The current longitude of the bus.'),
    })
    .describe('The current location of the bus.'),
  plannedRoute: z
    .array(
      z.object({
        latitude: z.number().describe('The latitude of the route point.'),
        longitude: z.number().describe('The longitude of the route point.'),
      })
    )
    .describe('The planned route of the bus as an array of latitude/longitude points.'),
  deviationThreshold: z
    .number()
    .default(0.001)
    .describe(
      'The threshold (in degrees) above which a deviation is considered significant. Defaults to 0.001 degrees.'
    ),
});
export type DetectRouteDeviationInput = z.infer<typeof DetectRouteDeviationInputSchema>;

const DetectRouteDeviationOutputSchema = z.object({
  isDeviating: z.boolean().describe('Whether the bus is deviating from the planned route.'),
  deviationDistance: z
    .number()
    .optional()
    .describe('The distance (in degrees) between the current location and the closest point on the planned route.'),
});
export type DetectRouteDeviationOutput = z.infer<typeof DetectRouteDeviationOutputSchema>;

export async function detectRouteDeviation(
  input: DetectRouteDeviationInput
): Promise<DetectRouteDeviationOutput> {
  return detectRouteDeviationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectRouteDeviationPrompt',
  input: {schema: DetectRouteDeviationInputSchema},
  output: {schema: DetectRouteDeviationOutputSchema},
  prompt: `You are an expert in detecting route deviations for buses.

You are given the current location of the bus, the planned route, and a deviation threshold.

Determine whether the bus is deviating from the planned route based on the following information:

Current Location: Latitude: {{{currentLocation.latitude}}}, Longitude: {{{currentLocation.longitude}}}
Planned Route: {{#each plannedRoute}}Latitude: {{{latitude}}}, Longitude: {{{longitude}}}\n{{/each}}
Deviation Threshold: {{{deviationThreshold}}} degrees

Consider a deviation to have occurred if the bus is further than the deviation threshold from the planned route.

Output whether the bus is deviating and, optionally, the distance between the bus and its planned route.
`,
});

const detectRouteDeviationFlow = ai.defineFlow(
  {
    name: 'detectRouteDeviationFlow',
    inputSchema: DetectRouteDeviationInputSchema,
    outputSchema: DetectRouteDeviationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
