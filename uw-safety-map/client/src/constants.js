// UW / U-District bounding box
export const UW_BOUNDS = {
  north: 47.670,
  south: 47.648,
  east: -122.290,
  west: -122.325,
};

export const UW_CENTER = [47.6553, -122.3035];

export const INCIDENT_TYPES = [
  'Police Presence',
  'Criminal Activity',
  'Violence',
  'Overdose',
];

export const INCIDENT_COLORS = {
  'Police Presence': '#4b9cd3',   // blue
  'Criminal Activity': '#e8a000', // amber
  'Violence': '#e53935',          // red
  'Overdose': '#ab47bc',          // purple
};

export const INCIDENT_ICONS = {
  'Police Presence': '🚔',
  'Criminal Activity': '⚠️',
  'Violence': '🚨',
  'Overdose': '🚑',
};

export const API_URL = 'http://localhost:3001';
