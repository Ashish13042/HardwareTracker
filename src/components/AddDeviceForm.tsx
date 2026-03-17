'use client';

import React, { useState } from 'react';

interface AddDeviceFormProps {
  headers: string[];
  onAddDevice: (formData: Record<string, string>) => Promise<void>;
}

export function AddDeviceForm({ headers, onAddDevice }: AddDeviceFormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});

  const handleChange = (header: string, value: string) => {
    setFormData((prev) => ({ ...prev, [header]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDevice(formData).then(() => setFormData({}));
  };

  return (
    <div className="card form-card">
      <h2>Add New Device</h2>
      <form
        onSubmit={handleSubmit}
        className="device-form"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}
      >
        {headers.map((header) => (
          <div className="input-group" key={`form-${header}`}>
            <label className="input-label" style={{ textTransform: 'capitalize' }}>
              {header}
            </label>
            <input
              type="text"
              placeholder={`Enter ${header}`}
              className="form-input"
              value={formData[header] ?? ''}
              onChange={(e) => handleChange(header, e.target.value)}
            />
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gridColumn: '1 / -1', marginTop: '8px' }}>
          <button type="submit" className="btn btn-primary" style={{ height: '46px' }}>
            <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Device
          </button>
        </div>
      </form>
    </div>
  );
}
