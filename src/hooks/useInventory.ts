'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Device } from '@/types/inventory';

/** Manages all inventory state and API interactions. */
export function useInventory() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(() => {
    setIsLoading(true);
    Promise.all([
      fetch('/api/headers').then<string[]>((res) => res.json()),
      fetch('/api/devices').then<Device[]>((res) => res.json()),
    ])
      .then(([fetchedHeaders, fetchedDevices]) => {
        setHeaders(fetchedHeaders);
        setDevices(fetchedDevices);
      })
      .catch((err) => console.error('Failed to fetch inventory data:', err))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addDevice = useCallback(
    (formData: Record<string, string>) => {
      const payload: Device = {};
      headers.forEach((h) => {
        payload[h] = formData[h] ?? '';
      });
      return fetch('/api/devices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).then(() => fetchData());
    },
    [headers, fetchData]
  );

  const addColumn = useCallback(
    (name: string) => {
      if (!name.trim() || headers.includes(name.trim())) return Promise.resolve();
      return fetch('/api/headers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      }).then(() => fetchData());
    },
    [headers, fetchData]
  );

  const renameColumn = useCallback(
    (oldName: string, newName: string) => {
      return fetch('/api/headers/rename', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName: newName.trim() }),
      }).then(() => fetchData());
    },
    [fetchData]
  );

  const deleteColumn = useCallback(
    (name: string) => {
      return fetch(`/api/headers/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      }).then(() => fetchData());
    },
    [fetchData]
  );

  const uploadCSV = useCallback(
    (file: File) => {
      const uploadData = new FormData();
      uploadData.append('file', file);
      return fetch('/api/upload', { method: 'POST', body: uploadData }).then(() => {
        fetchData();
        alert('✅ Database successfully overwritten with new file!');
      });
    },
    [fetchData]
  );

  const clearInventory = useCallback(() => {
    return fetch('/api/inventory', { method: 'DELETE' }).then(() => fetchData());
  }, [fetchData]);

  const exportCSV = useCallback(() => {
    let csvContent = headers.join(',') + '\n';
    devices.forEach((device) => {
      const row = headers.map((h) => device[h] ?? '');
      csvContent += row.join(',') + '\n';
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'hardware_inventory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [headers, devices]);

  return {
    devices,
    headers,
    isLoading,
    addDevice,
    addColumn,
    renameColumn,
    deleteColumn,
    uploadCSV,
    clearInventory,
    exportCSV,
  };
}
