// Central type definitions for the HardwareTracker application.
// All API routes and UI components should import from this file.

/** Represents a single hardware device as a key-value map of column -> value. */
export type Device = Record<string, string>;

/** The full inventory data structure returned by the CSV utility. */
export interface InventoryData {
  headers: string[];
  devices: Device[];
}

/** Payload for adding a new column header. */
export interface AddHeaderPayload {
  name: string;
}

/** Payload for renaming an existing column header. */
export interface RenameHeaderPayload {
  oldName: string;
  newName: string;
}
