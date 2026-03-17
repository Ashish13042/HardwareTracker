import { NextResponse } from 'next/server';
import { getInventoryData, saveInventoryData } from '@/lib/csv';
import type { RenameHeaderPayload } from '@/types/inventory';

/** PUT /api/headers/rename — Renames an existing column across all devices. */
export async function PUT(request: Request) {
  const { oldName, newName }: RenameHeaderPayload = await request.json();

  if (!oldName || !newName || oldName === newName) {
    return NextResponse.json({ error: 'Invalid payload.' }, { status: 400 });
  }

  const { headers, devices } = getInventoryData();
  const headerIndex = headers.indexOf(oldName);

  if (headerIndex === -1) {
    return NextResponse.json({ error: 'Column not found.' }, { status: 404 });
  }

  const updatedHeaders = headers.map((h) => (h === oldName ? newName : h));
  const updatedDevices = devices.map((device) => {
    const updatedDevice = { ...device };
    if (oldName in updatedDevice) {
      updatedDevice[newName] = updatedDevice[oldName];
      delete updatedDevice[oldName];
    }
    return updatedDevice;
  });

  saveInventoryData(updatedHeaders, updatedDevices);
  return NextResponse.json(updatedHeaders);
}
