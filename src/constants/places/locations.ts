import { Location } from '../../types/map';
import { mountainVillageBoundary } from './mountainVillage';

export const locations: Location[] = [
  { 
    id: 1, 
    name: 'Town of Mountain Village', 
    coordinates: [-107.8461, 37.9375], // lon,lat
    boundary: mountainVillageBoundary
  }
];

export default locations;