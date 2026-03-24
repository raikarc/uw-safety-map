import { useMemo } from 'react';
import { Rectangle, Tooltip } from 'react-leaflet';
import { computeGrid, getCellColor } from '../utils/heatmap';
import './NighttimeHeatmap.css';

export default function NighttimeHeatmap({ incidents, active }) {
  const { cells, nighttimeCount } = useMemo(() => computeGrid(incidents), [incidents]);

  if (!active) return null;

  if (nighttimeCount < 3) {
    return (
      <div className="heatmap-message">
        🌙 Not enough nighttime data yet ({nighttimeCount} incident{nighttimeCount !== 1 ? 's' : ''}).
        Heatmap requires at least 3 nighttime incidents (8 PM – 4 AM).
      </div>
    );
  }

  return (
    <>
      {cells.map((cell, i) => {
        const color = getCellColor(cell.count);
        if (!color) return null;
        return (
          <Rectangle
            key={i}
            bounds={cell.bounds}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.45, weight: 0 }}
          >
            <Tooltip sticky>{cell.count} incident{cell.count !== 1 ? 's' : ''} at night</Tooltip>
          </Rectangle>
        );
      })}
    </>
  );
}

// Legend rendered outside the map
export function HeatmapLegend({ incidents, active }) {
  const { nighttimeCount } = useMemo(() => computeGrid(incidents), [incidents]);
  if (!active) return null;
  return (
    <div className="heatmap-legend">
      <div className="heatmap-legend-title">🌙 Nighttime Heatmap</div>
      <div className="heatmap-legend-count">{nighttimeCount} nighttime incident{nighttimeCount !== 1 ? 's' : ''}</div>
      <div className="heatmap-legend-items">
        <span className="heatmap-dot" style={{ background: '#4caf50' }} /> Low (1–2)
        <span className="heatmap-dot" style={{ background: '#ff9800' }} /> Medium (3–5)
        <span className="heatmap-dot" style={{ background: '#e53935' }} /> High (6+)
      </div>
    </div>
  );
}
