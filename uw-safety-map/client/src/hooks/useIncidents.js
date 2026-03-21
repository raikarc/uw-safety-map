import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../constants';

export function useIncidents(socket) {
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/incidents`);
      const data = await res.json();
      setIncidents(data);
    } catch (e) {
      console.error('Failed to fetch incidents', e);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data) => setIncidents(data);
    socket.on('incidents_updated', handler);
    return () => socket.off('incidents_updated', handler);
  }, [socket]);

  const reportIncident = useCallback(async ({ lat, lng, type, description }) => {
    const res = await fetch(`${API_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, type, description, source: 'user' }),
    });
    return res.json();
  }, []);

  const confirmIncident = useCallback(async (id) => {
    const res = await fetch(`${API_URL}/api/incidents/${id}/confirm`, { method: 'POST' });
    return res.json();
  }, []);

  const resolveIncident = useCallback(async (id) => {
    await fetch(`${API_URL}/api/incidents/${id}/resolve`, { method: 'POST' });
  }, []);

  const simulateUWAlert = useCallback(async ({ lat, lng, type, description }) => {
    const res = await fetch(`${API_URL}/api/uw-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng, type, description }),
    });
    return res.json();
  }, []);

  return { incidents, reportIncident, confirmIncident, resolveIncident, simulateUWAlert };
}
