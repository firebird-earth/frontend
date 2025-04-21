import { VALUE_AT_RISK } from './valueAtRisk';
import { LANDSCAPE_RISK } from './landscapeRisk';
import { FUELS } from './fuels';

export const FIRE_METRICS = {
  LANDSCAPE_RISK,
  VALUE_AT_RISK,
  FUELS
} as const;

export {
  LANDSCAPE_RISK,
  VALUE_AT_RISK,
  FUELS
};