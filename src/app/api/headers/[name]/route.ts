import { NextResponse } from 'next/server';
import { getInventoryData, saveInventoryData } from '@/lib/csv';

/** DELETE /api/headers/:name — Removes a column and its data from all devices. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);

  const { headers, devices } = getInventoryData();

  if (!headers.includes(decodedName)) {
    return NextResponse.json({ error: 'Column not found.' }, { status: 404 });
  }

  const updatedHeaders = headers.filter((h) => h !== decodedName);
  const updatedDevices = devices.map((device) => {
    const updated = { ...device };
    delete updated[decodedName];
    return updated;
  });

  saveInventoryData(updatedHeaders, updatedDevices);
  return NextResponse.json(updatedHeaders);
}
