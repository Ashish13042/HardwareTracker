'use client';

import React, { useState, useMemo } from 'react';
import type { Device } from '@/types/inventory';
import { ColumnHeader } from '@/components/ColumnHeader';

interface InventoryTableProps {
  headers: string[];
  devices: Device[];
  isLoading: boolean;
  onAddColumn: (name: string) => Promise<void>;
  onRenameColumn: (oldName: string, newName: string) => Promise<void>;
  onDeleteColumn: (name: string) => Promise<void>;
  onClearInventory: () => Promise<void>;
}

export function InventoryTable({
  headers,
  devices,
  isLoading,
  onAddColumn,
  onRenameColumn,
  onDeleteColumn,
  onClearInventory,
}: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [filterBrand, setFilterBrand] = useState('All');
  const [newColumnName, setNewColumnName] = useState('');

  const typeKey = headers.find((h) => h.toLowerCase() === 'type');
  const brandKey = headers.find((h) => h.toLowerCase() === 'brand');

  const uniqueTypes = useMemo(
    () => (typeKey ? ['All', ...Array.from(new Set(devices.filter((d) => d[typeKey]).map((d) => d[typeKey])))] : ['All']),
    [devices, typeKey]
  );

  const uniqueBrands = useMemo(() => {
    const validDevices =
      filterType === 'All' || !typeKey ? devices : devices.filter((d) => d[typeKey] === filterType);
    return brandKey
      ? ['All', ...Array.from(new Set(validDevices.filter((d) => d[brandKey]).map((d) => d[brandKey])))]
      : ['All'];
  }, [devices, typeKey, brandKey, filterType]);

  const filteredDevices = useMemo(() => {
    return devices.filter((device) => {
      const matchesSearch =
        !searchTerm ||
        headers.some((h) => {
          const val = device[h];
          return val != null && val.toString().toLowerCase().includes(searchTerm.toLowerCase());
        });
      const matchesType = filterType === 'All' || (typeKey && device[typeKey] === filterType);
      const matchesBrand = filterBrand === 'All' || (brandKey && device[brandKey] === filterBrand);
      return matchesSearch && matchesType && matchesBrand;
    });
  }, [devices, headers, searchTerm, filterType, filterBrand, typeKey, brandKey]);

  const handleAddColumn = () => {
    onAddColumn(newColumnName).then(() => setNewColumnName(''));
  };

  const handleClear = () => {
    if (window.confirm('⚠️ WARNING: Delete ALL hardware data and columns? This cannot be undone!')) {
      onClearInventory();
    }
  };

  return (
    <div className="card table-card">
      {/* Table Header Controls */}
      <div className="table-header">
        <div className="table-header-top" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '16px' }}>
          <h2>Inventory List</h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              className="form-input"
              placeholder="New Column Name"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              style={{ width: '180px' }}
            />
            <button className="btn btn-secondary" onClick={handleAddColumn}>
              + Add Column
            </button>
            {devices.length > 0 && (
              <button
                onClick={handleClear}
                style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                ⛌ Clear All Data
              </button>
            )}
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="controls-container" style={{ marginTop: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: '1 1 200px', minWidth: '200px' }}>
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search across all fields..."
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {typeKey && (
            <div className="filter-group" style={{ flex: '0 1 180px' }}>
              <select
                value={filterType}
                className="form-input"
                onChange={(e) => { setFilterType(e.target.value); setFilterBrand('All'); }}
              >
                {uniqueTypes.map((t) => (
                  <option key={`type-${t}`} value={t}>{t === 'All' ? 'All Types' : t}</option>
                ))}
              </select>
            </div>
          )}
          {brandKey && (
            <div className="filter-group" style={{ flex: '0 1 180px' }}>
              <select value={filterBrand} className="form-input" onChange={(e) => setFilterBrand(e.target.value)}>
                {uniqueBrands.map((b) => (
                  <option key={`brand-${b}`} value={b}>{b === 'All' ? 'All Brands' : b}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Table Body */}
      {isLoading ? (
        <div className="state-message"><span className="emoji">⏳</span>Loading devices from server...</div>
      ) : headers.length === 0 ? (
        <div className="state-message"><span className="emoji">📦</span>No columns defined. Add a column to start tracking inventory!</div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: '8px' }}>
          <table className="device-table" style={{ borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={`th-${header}`} style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', background: '#f9fafb', whiteSpace: 'nowrap' }}>
                    <ColumnHeader name={header} onRename={onRenameColumn} onDelete={onDeleteColumn} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDevices.map((device, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {headers.map((header) => (
                    <td key={`td-${index}-${header}`} style={{ padding: '12px' }}>
                      {device[header] || <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>N/A</span>}
                    </td>
                  ))}
                </tr>
              ))}
              {filteredDevices.length === 0 && devices.length > 0 && (
                <tr>
                  <td colSpan={headers.length}>
                    <div className="state-message" style={{ padding: '20px', textAlign: 'center' }}>No results match your search.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
