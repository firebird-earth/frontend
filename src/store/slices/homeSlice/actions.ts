import { createAction } from '@reduxjs/toolkit';
import { AOI } from './types';

// AOI actions
export const setCurrentAOI = createAction<AOI | null>('home/setCurrentAOI');
export const setCoordinates = createAction<[number, number]>('home/setCoordinates');
export const clearAOI = createAction('home/clearAOI');
export const startCreatingAOI = createAction('home/startCreatingAOI');
export const stopCreatingAOI = createAction('home/stopCreatingAOI');
export const showAOIPanel = createAction('home/showAOIPanel');
export const hideAOIPanel = createAction('home/hideAOIPanel');

// Section actions
export const toggleSection = createAction<'aois' | 'scenarios' | 'treatments'>('home/toggleSection');

// Location actions
export const setActiveLocation = createAction<number>('home/setActiveLocation');
export const clearActiveLocation = createAction('home/clearActiveLocation');

// Grid actions
export const toggleGrid = createAction('home/toggleGrid');
export const setGridSize = createAction<number>('home/setGridSize');
export const setGridUnit = createAction<'acres' | 'meters'>('home/setGridUnit');