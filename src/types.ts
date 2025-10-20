/**
 * Represents a single clipboard entry
 */
export interface ClipboardEntry {
  /** Unique identifier for the entry */
  id: string;
  
  /** The clipboard content */
  content: string;
  
  /** Timestamp when the entry was created */
  timestamp: number;
  
  /** Whether the entry is pinned */
  isPinned: boolean;
  
  /** Source file path if available */
  sourceFile?: string;
  
  /** Number of lines in the content */
  lineCount: number;
  
  /** Content type (text, code, etc.) */
  contentType: 'text' | 'code';
}

/**
 * Configuration settings for the clipboard manager
 */
export interface ClipboardManagerConfig {
  maxHistorySize: number;
  showTimestamp: boolean;
  enableNotifications: boolean;
  autoCleanupDays: number;
  excludePatterns: string[];
  monitoringInterval: number;
  previewLength: number;
}

/**
 * Serialized clipboard history for storage
 */
export interface SerializedHistory {
  entries: ClipboardEntry[];
  version: string;
}
