// src/query/exec.ts
import { parseExpression } from './parser';
import { bindLayers } from './binder';
import { layerDataCache } from '../cache/cache';
import { evaluateAST } from './evaluator';
import { store } from '../store';
import { LayerType, MapPane } from '../types/map';
import { toggleLayer } from '../store/slices/layers';
import { addLayer } from '../store/slices/layers/actions';

export const execExpression = async (expression: string) => {
  try {
    // First check if we already have a layer for this expression
    const state = store.getState();

    console.log('getState():', state)
    
    const existingLayer = state.layers.categories.scenarios?.layers.find(
      l => l.metadata?.expression === expression
    );

    if (existingLayer) {
      // Just toggle the existing layer
      store.dispatch(toggleLayer({ 
        categoryId: 'scenarios',
        layerId: existingLayer.id 
      }));
      return;
    }

    console.log('parseExpression:', expression);
    
    // Parse the expression into an AST
    const ast = parseExpression(expression);
    console.log('Parsed AST:', ast);

    console.log('bindLayers:');
    
    // Bind layer references using the layer cache
    const boundAst = await bindLayers(ast, layerDataCache, (layerName) => {
      console.log(`Binding layer: ${layerName}`);
    });
    console.log('Bound AST:', boundAst);

    // Evaluate the bound AST
    const rasterData = await evaluateAST(boundAst) satisfies RasterData;
    console.log('Evaluation result:', rasterData);

    // Create a new GeoTIFF layer from the result
    const layer = {
      id: Date.now(), 
      name: 'Scenario A Result',
      type: LayerType.GeoTiff,
      source: result,
      active: true,
      pane: MapPane.FiremetricsPane,
      colorScheme: 'redYellowGreen',
      metadata: {
        expression,
        width: Array.isArray(result) && result.length > 0 ? result[0].length : 0,
        height: Array.isArray(result) ? result.length : 0
      }
    };

    // Add the layer to the scenarios category
    store.dispatch(addLayer({
      categoryId: 'scenarios', 
      layer
    }));

    return result;

  } catch (error) {
    console.error('Failed to execute expression:', error);
    throw error;
  }
};
