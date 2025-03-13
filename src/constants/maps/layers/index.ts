import { BASEMAPS } from './basemaps';
import { WILDFIRE } from './wildfire';
import { JURISDICTIONS } from './jurisdictions';
import { TRANSPORTATION } from './transportation';
import { WATER } from './water';
import { INFRASTRUCTURE } from './infrastructure';
import { RESTORATION_CLASS } from './restorationClass';
import { HABITAT } from './habitat';
import { LANDSCAPE } from './landscape';

export const MAP_LAYERS = {
  BASEMAPS,
  WILDFIRE,
  JURISDICTIONS,
  TRANSPORTATION,
  WATER,
  INFRASTRUCTURE,
  RESTORATION_CLASS,
  HABITAT,
  LANDSCAPE
} as const;

export {
  BASEMAPS,
  WILDFIRE,
  JURISDICTIONS,
  TRANSPORTATION,
  WATER,
  INFRASTRUCTURE,
  RESTORATION_CLASS,
  HABITAT,
  LANDSCAPE
};