'use client';

import { useInventory } from '@/hooks/useInventory';
import { AppHeader } from '@/components/AppHeader';
import { AddDeviceForm } from '@/components/AddDeviceForm';
import { InventoryTable } from '@/components/InventoryTable';

export default function Page() {
  const {
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
  } = useInventory();

  return (
    <div className="app-container">
      <AppHeader onUpload={uploadCSV} onExport={exportCSV} />
      <AddDeviceForm headers={headers} onAddDevice={addDevice} />
      <InventoryTable
        headers={headers}
        devices={devices}
        isLoading={isLoading}
        onAddColumn={addColumn}
        onRenameColumn={renameColumn}
        onDeleteColumn={deleteColumn}
        onClearInventory={clearInventory}
      />
    </div>
  );
}