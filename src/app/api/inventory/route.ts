import { NextResponse } from 'next/server';
import { saveInventoryData } from '@/lib/csv';
import { DEFAULT_COLUMNS } from '@/lib/constants';
import type { Device } from '@/types/inventory';

/** DELETE /api/inventory — Clears all devices and resets to default columns. */
export async function DELETE() {
  saveInventoryData([...DEFAULT_COLUMNS], [] as Device[]);
  return NextResponse.json({ message: 'Inventory cleared successfully.' });
}
