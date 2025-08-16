
import { genkitNextApiHandler } from '@genkit-ai/next';
import '@/ai/flows/predict-eta';
import '@/ai/flows/detect-route-deviation';
import '@/ai/flows/summarize-incidents';

export const GET = genkitNextApiHandler;
export const POST = genkitNextApiHandler;
