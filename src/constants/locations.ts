import { Location } from '../types/map';
import { mountainVillageBoundary } from '../places/mountainVillage';

export const locations: Location[] = [
  { 
    id: 1, 
    name: 'Town of Mountain Village', 
    coordinates: [-107.8461, 37.9375],
    boundary: mountainVillageBoundary
  }
];

export default locations;