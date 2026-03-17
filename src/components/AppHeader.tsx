'use client';

import React from 'react';

interface AppHeaderProps {
  onUpload: (file: File) => void;
  onExport: () => void;
}

export function AppHeader({ onUpload, onExport }: AppHeaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    onUpload(file);
  };

  return (
    <div className="header-container">
      <div className="header-title-group">
        <h1>Hardware Tracker</h1>
        <p>Manage and monitor your enterprise IT hardware inventory</p>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <label className="btn btn-secondary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload CSV
          <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
        </label>
        <button onClick={onExport} className="btn btn-secondary">
          <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}
