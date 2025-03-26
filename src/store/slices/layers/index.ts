import { LayerCategory, LayersState } from './types';
import { layersReducer } from './reducer';

// Re-export everything
export * from './types';
export * from './actions';
export * from './selectors';
export * from './utils/basemaps';
export * from './utils/layerManagement';
export * from '../common/utils/utils';
export * from '../common/utils/ordering';
export * from '../common/utils/valueRange';
export * from '../common/utils/opacity';

// Export the reducer as default
export default layersReducer;