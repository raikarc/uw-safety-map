import { UW_BOUNDS, HEATMAP_CELL_SIZE, NIGHTTIME_START_HOUR, NIGHTTIME_END_HOUR } from '../constants';

function isNighttime(timestamp) {
  const hour = new Date(timestamp).getHours();
  // Nighttime: 8 PM (20) to 4 AM (4)
  return hour >= NIGHTTIME_START_HOUR || hour < NIGHTTIME_END_HOUR;
}

export function computeGrid(incidents) {
  const nighttime = incidents.filter(i => isNighttime(i.timestamp));

  const cols = Math.ceil((UW_BOUNDS.east - UW_BOUNDS.west) / HEATMAP_CELL_SIZE);
  const rows = Math.ceil((UW_BOUNDS.north - UW_BOUNDS.south) / HEATMAP_CELL_SIZE);

  // Build count grid
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));

  nighttime.forEach(inc => {
    const col = Math.floor((inc.lng - UW_BOUNDS.west) / HEATMAP_CELL_SIZE);
    const row = Math.floor((inc.lat - UW_BOUNDS.south) / HEATMAP_CELL_SIZE);
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      grid[row][col] += 1;
    }
  });

  // Convert to cell objects
  const cells = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === 0) continue;
      const south = UW_BOUNDS.south + r * HEATMAP_CELL_SIZE;
      const north = south + HEATMAP_CELL_SIZE;
      const west = UW_BOUNDS.west + c * HEATMAP_CELL_SIZE;
      const east = west + HEATMAP_CELL_SIZE;
      cells.push({
        bounds: [[south, west], [north, east]],
        count: grid[r][c],
      });
    }
  }

  return { cells, nighttimeCount: nighttime.length };
}

export function getCellColor(count) {
  if (count <= 0) return null;
  if (count <= 2) return '#4caf50';  // green — low
  if (count <= 5) return '#ff9800';  // amber — medium
  return '#e53935';                  // red — high
}
