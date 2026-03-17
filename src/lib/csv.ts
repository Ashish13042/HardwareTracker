import fs from 'fs';
import path from 'path';
import type { Device, InventoryData } from '@/types/inventory';
import { DEFAULT_COLUMNS } from '@/lib/constants';

const FILE_PATH = path.join(process.cwd(), 'hardware_inventory.csv');
const DEFAULT_HEADER_ROW = DEFAULT_COLUMNS.join(',');

/** Reads and parses the CSV file into a structured InventoryData object. */
export function getInventoryData(): InventoryData {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, `${DEFAULT_HEADER_ROW}\n`, 'utf-8');
  }

  const fileContent = fs.readFileSync(FILE_PATH, 'utf-8');
  const lines = fileContent.split('\n').filter((line) => line.trim() !== '');

  if (lines.length === 0) {
    return { headers: [...DEFAULT_COLUMNS], devices: [] };
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

  return { headers, devices };
}

/** Serializes and writes InventoryData back to the CSV file. */
export function saveInventoryData(headers: string[], devices: Device[]): void {
  const headerRow = headers.join(',');
  const deviceRows = devices.map((device) =>
    headers.map((h) => device[h] ?? '').join(',')
  );
  const csvContent = [headerRow, ...deviceRows].join('\n') + '\n';
  fs.writeFileSync(FILE_PATH, csvContent, 'utf-8');
}