import * as vscode from 'vscode';
import { ClipboardEntry, SerializedHistory } from './types';

const STORAGE_KEY = 'clipboardHistory';
const STORAGE_VERSION = '1.0.0';

/**
 * Handles persistence of clipboard history
 */
export class StorageManager {
  constructor(private context: vscode.ExtensionContext) {}

  /**
   * Save clipboard history to storage
   */
  async saveHistory(entries: ClipboardEntry[]): Promise<void> {
    const data: SerializedHistory = {
      entries,
      version: STORAGE_VERSION
    };
    
    await this.context.globalState.update(STORAGE_KEY, data);
  }

  /**
   * Load clipboard history from storage
   */
  async loadHistory(): Promise<ClipboardEntry[]> {
    const data = this.context.globalState.get<SerializedHistory>(STORAGE_KEY);
    
    if (!data || !data.entries) {
      return [];
    }

    // Validate version compatibility (migration logic can be added here if needed)

    return data.entries;
  }

  /**
   * Clear all stored history
   */
  async clearHistory(): Promise<void> {
    await this.context.globalState.update(STORAGE_KEY, undefined);
  }

  /**
   * Get storage statistics
   */
  getStorageStats(): { entryCount: number; storageSize: number } {
    const data = this.context.globalState.get<SerializedHistory>(STORAGE_KEY);
    const storageSize = data ? JSON.stringify(data).length : 0;
    const entryCount = data?.entries.length || 0;

    return { entryCount, storageSize };
  }
}
