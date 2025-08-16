import { config } from 'dotenv';
config();

import '@/ai/flows/predict-eta.ts';
import '@/ai/flows/detect-route-deviation.ts';
import '@/ai/flows/summarize-incidents.ts';