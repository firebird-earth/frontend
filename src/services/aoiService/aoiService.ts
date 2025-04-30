import { v4 as uuidv4 } from 'uuid';
import { AOI, CreateAOIInput, UpdateAOIInput, AOIState } from './types';
import { store } from '../../store';
import { setActiveLocation } from '../../store/slices/mapSlice';
import { setCurrentAOI } from '../../store/slices/homeSlice/actions';
import { showAOIPanel, toggleLegend } from '../../store/slices/uiSlice';
import { navigateToLocation } from '../../utils/map';
import { clearActiveLayers } from '../../store/slices/layersSlice';
import { calculateBufferCircle } from '../../utils/geometry';
import locations from '../../constants/places/locations';

class AOIService {
  private static instance: AOIService;
  private state: AOIState = {
    aois: [],
    loading: false,
    error: null
  };
  private subscribers: Set<(state: AOIState) => void> = new Set();

  private constructor() {
    // Initialize static locations as AOIs
    const initialAois = locations.map(location => {
      const bufferCircle = calculateBufferCircle(
        [location.coordinates[1], location.coordinates[0]], // Convert to [lat, lng]
        location.boundary,
        8
      );

      const newAOI: AOI = {
        //id: uuidv4(),
        id: location.id,
        name: location.name,
        description: 'Default Location',
        location: {
          center: location.coordinates,
          zoom: 10
        },
        boundary: location.boundary,
        boundryRadius: bufferCircle.bufferedRadius,
        bufferedRadius: bufferCircle.bufferedRadius,
        bufferedBounds: bufferCircle.bufferedBounds,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      return newAOI;
    });

    console.log('[aoiService] AOIs', initialAois);
    
    this.state.aois = initialAois;
  }

  public static getInstance(): AOIService {
    if (!AOIService.instance) {
      AOIService.instance = new AOIService();
    }
    return AOIService.instance;
  }

  private notify(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }

  private setState(newState: Partial<AOIState>): void {
    this.state = { ...this.state, ...newState };
    this.notify();
  }

  public subscribe(callback: (state: AOIState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  public async createAOI(input: CreateAOIInput): Promise<AOI> {
    try {
      this.setState({ loading: true, error: null });

      const bufferCircle = calculateBufferCircle(
        [input.location.center[1], input.location.center[0]], // Convert to [lat, lng]
        input.boundary,
        8
      );

      const newAOI: AOI = {
        id: uuidv4(),
        name: input.name,
        description: input.description,
        location: {
         center: input.location.center,
         zoom: input.location.zoom
        },
        boundary: input.boundary,
        boundryRadius: bufferCircle.bufferedRadius,
        bufferedRadius: bufferCircle.bufferedRadius,
        bufferedBounds: bufferCircle.bufferedBounds,
        tags: input.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const updatedAOIs = [...this.state.aois, newAOI];
      this.setState({
        aois: updatedAOIs,
        loading: false,
        error: null
      });

      console.log('[aoiService] AOIs', updatedAOIs)
      
      const dispatch = store.dispatch;
      
      // Clear all active layers when creating a new AOI
      dispatch(clearActiveLayers());
      
      // Close the legend panel
      dispatch(toggleLegend(false));
      
      dispatch(setActiveLocation(parseInt(newAOI.id)));
      dispatch(setCurrentAOI(newAOI));
      dispatch(showAOIPanel());

      navigateToLocation({
        id: parseInt(newAOI.id),
        name: newAOI.name,
        coordinates: newAOI.location.center
      });

      return newAOI;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create AOI';
      this.setState({ error: errorMessage, loading: false });
      throw error;
    }
  }

  public async getAOIs(): Promise<AOI[]> {
    return this.state.aois;
  }

  public async getAOIById(id: string): Promise<AOI | null> {
    return this.state.aois.find(a => a.id === id) || null;
  }

  public async updateAOI(id: string, input: UpdateAOIInput): Promise<AOI> {
    try {
      if (!id) {
        throw new Error('AOI ID is required');
      }

      this.setState({ loading: true, error: null });

      const aoiIndex = this.state.aois.findIndex(a => a.id === id);
      if (aoiIndex === -1) {
        throw new Error(`AOI with ID ${id} not found`);
      }

      const currentAOI = this.state.aois[aoiIndex];
      
      // Preserve critical fields and only update allowed fields
      const updatedAOI: AOI = {
        ...currentAOI,                // Keep all existing fields
        name: input.name ?? currentAOI.name,
        description: input.description ?? currentAOI.description,
        tags: input.tags ?? currentAOI.tags,
        // Only update location and boundary if explicitly provided
        location: input.location ?? currentAOI.location,
        boundary: input.boundary ?? currentAOI.boundary,
        // Always update the timestamp
        updatedAt: new Date().toISOString()
      };

      const updatedAOIs = [...this.state.aois];
      updatedAOIs[aoiIndex] = updatedAOI;

      this.setState({
        aois: updatedAOIs,
        loading: false,
        error: null
      });

      // Update Redux state only if this is the currently selected AOI
      const currentReduxAOI = store.getState().aoi.currentAOI;
      if (currentReduxAOI && currentReduxAOI.id === id) {
        store.dispatch(setCurrentAOI(updatedAOI));
      }

      return updatedAOI;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update AOI';
      this.setState({ error: errorMessage, loading: false });
      throw error;
    }
  }

  public async deleteAOI(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('AOI ID is required');
      }

      this.setState({ loading: true, error: null });

      const aoiExists = this.state.aois.some(aoi => aoi.id === id);
      if (!aoiExists) {
        throw new Error(`AOI with ID ${id} not found`);
      }

      const updatedAOIs = this.state.aois.filter(aoi => aoi.id !== id);
      
      this.setState({
        aois: updatedAOIs,
        loading: false,
        error: null
      });

      // Clear Redux state only if this is the currently selected AOI
      const currentReduxAOI = store.getState().aoi.currentAOI;
      if (currentReduxAOI && currentReduxAOI.id === id) {
        store.dispatch(setCurrentAOI(null));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete AOI';
      this.setState({ error: errorMessage, loading: false });
      throw error;
    }
  }

  public async searchAOIs(query: string): Promise<AOI[]> {
    const normalizedQuery = query.toLowerCase();
    return this.state.aois.filter(aoi => 
      aoi.name.toLowerCase().includes(normalizedQuery) ||
      aoi.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))
    );
  }

  public async getAOIsByTag(tag: string): Promise<AOI[]> {
    return this.state.aois.filter(aoi => 
      aoi.tags.includes(tag)
    );
  }
}

export const aoiService = AOIService.getInstance();
