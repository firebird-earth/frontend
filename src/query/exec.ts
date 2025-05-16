// src/query/exec.ts
import { parseExpression } from './parser';
import { bindLayers } from './binder/binder';
import { layerDataCache } from '../cache/cache';
import { evaluateAST, EvaluateResult } from './evaluator';
import { store } from '../store';
import { LayerType, MapPane } from '../types/map';
import { toggleLayer } from '../store/slices/layersSlice';
import { RasterData } from '../types/geotiff';
import { defaultColorScheme, defaultColorSchemeBinary } from '../constants/colors';
import { maskRasterToCircle } from '../raster/maskRaster';

const DEBUG = true;
function log(...args: any[]) {
  if (DEBUG) {
    console.log('[ExecExpression]', ...args);
  }
}

export interface ExecResult {
  data: RasterData;
  metadata: any; // GeoTiffMetadata, imported above if needed
  isMask: boolean;
}

export const execExpression = async (expression: string): Promise<ExecResult | void> => {
  try {

    log('parseExpression:', expression);
    
    // Parse the expression into an AST
    const ast = parseExpression(expression);
    log('Parsed AST:', ast);

    log('bindLayers:');
    
    // Bind layer references using the layer cache
    const boundAst = await bindLayers(ast, layerDataCache, (layerName) => {
      log(`Binding layer: ${layerName}`);
    });
    
    log('Bound AST:', boundAst);

    log('Calling evaluateAST with boundAst:', JSON.stringify(boundAst, (key, value) => {
      if (key === 'rasterArray' && ArrayBuffer.isView(value)) {
        return `Int16Array(${value.length})`; // just show array type + size
      }
      return value;
    }, 2));
        
    // Evaluate the *bound* AST
    const result: EvaluateResult = await evaluateAST(boundAst);
 
    //log('Evaluation result:', { expression: expression, result: result });

    const aoi = store.getState().home.aoi.current;
    log('aoi', aoi);

    const clipped = maskRasterToCircle(result.data, result.metadata, aoi.center, aoi.bufferedRadius);
    
    //log('Clipped result:', clipped);

    log('Original metadata:', result.metadata);
    log('Clipped metadata snapshot:', JSON.parse(JSON.stringify(clipped.metadata)));

    return { data:result.data, metadata:result.metadata };
    //return { data:clipped.data, metadata:clipped.metadata };

  } catch (error) {
    console.error('Failed to execute expression:', error);
    throw error;
  }
};
