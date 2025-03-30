import { 
  MapIcon, 
  LandPlot, 
  Mountain, 
  AtSign as RoadSign, 
  Waves, 
  Droplets, 
  Factory, 
  Leaf, 
  Bird, 
  Shield, 
  Workflow, 
  Flame, 
  Building 
} from 'lucide-react';
import { ElementType } from 'react';

export function getIconForLayer(categoryId: string, layerName: string): ElementType {
  switch (categoryId) {
    case 'basemaps':
      return MapIcon;
    case 'wildfire':
      return Flame;
    case 'elevation':
      return Mountain;
    case 'landscape':
      return Mountain;
    case 'jurisdictions':
      return LandPlot;
    case 'transportation':
      return RoadSign;
    case 'water':
      return layerName.includes('Watersheds') ? Waves : Droplets;
    case 'infrastructure':
      return layerName.includes('Building') ? Building : Factory;
    case 'restorationClass':
      return Leaf;
    case 'habitat':
      return layerName.includes('Deer') ? Shield :
             layerName.includes('Grouse') ? Bird :
             layerName.includes('Migration') ? Workflow : Shield;
    default:
      return MapIcon;
  }
}