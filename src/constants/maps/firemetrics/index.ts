import { VALUE_AT_RISK } from './valueAtRisk';
import { LANDSCAPE_RISK } from './landscapeRisk';
import { FUELS } from './fuels';

export const FIRE_METRICS = {
  VALUE_AT_RISK,
  LANDSCAPE_RISK,
  FUELS
} as const;

export {
  VALUE_AT_RISK,
  LANDSCAPE_RISK,
  FUELS
};