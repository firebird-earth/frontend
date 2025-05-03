// src/query/exec.ts
import { parseExpression } from './parser';
import { bindLayers } from './binder';
import { layerDataCache } from '../cache/cache';
import { evaluateAST, EvaluateResult } from './evaluator';
import { store } from '../store';
import { LayerType, MapPane } from '../types/map';
import { toggleLayer } from '../store/slices/layersSlice';
import { RasterData } from '../types/geotiff';
import { defaultColorScheme, defaultColorSchemeBinary } from '../constants/colors';

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
    const { data, metadata }: EvaluateResult = await evaluateAST(boundAst);
 
    log('Evaluation result:', {
      expression: expression,
      rasterArray: data.rasterArray,
      width: data.width,
      height: data.height,
      metadata
    });

    return { data, metadata };

  } catch (error) {
    console.error('Failed to execute expression:', error);
    throw error;
  }
};
