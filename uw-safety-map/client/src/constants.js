// UW / U-District bounding box
export const UW_BOUNDS = {
  north: 47.670,
  south: 47.648,
  east: -122.290,
  west: -122.325,
};

export const UW_CENTER = [47.6553, -122.3035];

export const HEATMAP_CELL_SIZE = 0.002; // degrees
export const NIGHTTIME_START_HOUR = 20; // 8 PM
export const NIGHTTIME_END_HOUR = 4;   // 4 AM
export const DISTRESS_SIGNAL_TYPE = 'Distress Signal';

export const INCIDENT_TYPES = [
  'Police Presence',
  'Criminal Activity',
  'Violence',
  'Overdose',
  'Distress Signal',
];

export const INCIDENT_COLORS = {
  'Police Presence': '#4b9cd3',   // blue
  'Criminal Activity': '#e8a000', // amber
  'Violence': '#e53935',          // red
  'Overdose': '#ab47bc',          // purple
  'Distress Signal': '#d32f2f',   // dark red
};

export const INCIDENT_ICONS = {
  'Police Presence': '🚔',
  'Criminal Activity': '⚠️',
  'Violence': '🚨',
  'Overdose': '🚑',
  'Distress Signal': '🆘',
};

export const API_URL = 'http://localhost:3001';
