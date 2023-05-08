import { z } from 'zod';
import features from '../features.json' assert { type: 'json' };

type Features = keyof typeof features;
const matrix: Record<Features, boolean> = z
  .record(z.string(), z.boolean())
  .parse(features);

export const enabled = (name: Features) => matrix[name];
