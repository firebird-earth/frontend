import { useState, useEffect } from 'react';
import { AOI, AOIState } from '../types/aoi';
import { aoiService } from '../services/aoiService/aoiService';

export function useAOI() {
  const [state, setState] = useState<AOIState>({
    aois: [],
    loading: false,
    error: null
  });

  useEffect(() => {
    const unsubscribe = aoiService.subscribe(setState);
    return () => unsubscribe();
  }, []);

  return {
    aois: state.aois,
    loading: state.loading,
    error: state.error,
    createAOI: aoiService.createAOI.bind(aoiService),
    getAOIs: aoiService.getAOIs.bind(aoiService),
    getAOIById: aoiService.getAOIById.bind(aoiService),
    updateAOI: aoiService.updateAOI.bind(aoiService),
    deleteAOI: aoiService.deleteAOI.bind(aoiService),
    searchAOIs: aoiService.searchAOIs.bind(aoiService),
    getAOIsByTag: aoiService.getAOIsByTag.bind(aoiService)
  };
}