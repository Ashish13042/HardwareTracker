'use client';

import React, { useState } from 'react';

interface ColumnHeaderProps {
  name: string;
  onRename: (oldName: string, newName: string) => Promise<void>;
  onDelete: (name: string) => Promise<void>;
}

export function ColumnHeader({ name, onRename, onDelete }: ColumnHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(name);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editValue.trim() || editValue === name) {
      cancelEditing();
      return;
    }
    onRename(name, editValue.trim()).then(cancelEditing);
  };

  const handleDelete = () => {
    if (window.confirm(`Delete column "${name}"? This removes all data in this column.`)) {
      onDelete(name);
    }
  };

  if (isEditing) {
    return (
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        <input
          className="form-input"
          style={{ padding: '4px 8px', width: '120px' }}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          autoFocus
        />
        <button onClick={saveEdit} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#10b981' }}>✅</button>
        <button onClick={cancelEditing} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#ef4444' }}>❌</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
      <span style={{ textTransform: 'uppercase', fontSize: '12px', fontWeight: '600', color: '#6b7280', letterSpacing: '0.05em' }}>
        {name}
      </span>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={startEditing} title="Rename Column" style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6, padding: '2px' }}>✏️</button>
        <button onClick={handleDelete} title="Delete Column" style={{ border: 'none', background: 'none', cursor: 'pointer', opacity: 0.6, padding: '2px' }}>🗑️</button>
      </div>
    </div>
  );
}
