import { NextResponse } from 'next/server';
import { getInventoryData, saveInventoryData } from '@/lib/csv';
import type { AddHeaderPayload } from '@/types/inventory';

/** GET /api/headers — Returns all column headers. */
export async function GET() {
  const { headers } = getInventoryData();
  return NextResponse.json(headers);
}

/** POST /api/headers — Adds a new column header. */
export async function POST(request: Request) {
  const { name }: AddHeaderPayload = await request.json();
  const { headers, devices } = getInventoryData();

  const trimmedName = name?.trim();
  if (!trimmedName || headers.includes(trimmedName)) {
    return NextResponse.json(headers);
  }

  headers.push(trimmedName);
  saveInventoryData(headers, devices);
  return NextResponse.json(headers, { status: 201 });
}