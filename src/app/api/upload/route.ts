import { NextResponse } from 'next/server';
import { saveInventoryData } from '@/lib/csv';
import type { Device, InventoryData } from '@/types/inventory';

/** POST /api/upload — Replaces the entire inventory with an uploaded CSV file. */
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  const text = await file.text();
  const lines = text.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
  }

  const headers = lines[0].split(',').map((h) => h.trim());
  const devices: Device[] = lines.slice(1).map((line) => {
    const values = line.split(',');
    const device: Device = {};
    headers.forEach((header, index) => {
      device[header] = values[index]?.trim() ?? '';
    });
    return device;
  });

  saveInventoryData(headers, devices);
  return NextResponse.json({ message: 'Inventory replaced successfully.' } satisfies Pick<InventoryData, never> & { message: string });
}
