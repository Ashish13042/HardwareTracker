import { NextResponse } from 'next/server';
import { getInventoryData, saveInventoryData } from '@/lib/csv';
import type { Device } from '@/types/inventory';

/** GET /api/devices — Returns all devices. */
export async function GET() {
  const { devices } = getInventoryData();
  return NextResponse.json(devices);
}

/** POST /api/devices — Adds a new device to the inventory. */
export async function POST(request: Request) {
  const newDevice: Device = await request.json();
  const { headers, devices } = getInventoryData();

  // Dynamically add any new columns present in the device payload.
  Object.keys(newDevice).forEach((key) => {
    if (!headers.includes(key)) {
      headers.push(key);
    }
  });

  devices.push(newDevice);
  saveInventoryData(headers, devices);

  return NextResponse.json(newDevice, { status: 201 });
}