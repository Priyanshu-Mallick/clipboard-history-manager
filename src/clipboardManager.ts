import * as vscode from 'vscode';
import { ClipboardEntry, ClipboardManagerConfig } from './types';
import { StorageManager } from './storage';

/**
 * Core clipboard monitoring and management logic
 */
export class ClipboardManager {
  private entries: ClipboardEntry[] = [];
  private lastClipboardContent: string = '';
  private monitoringInterval: NodeJS.Timeout | undefined;
  private readonly onDidChangeEmitter = new vscode.EventEmitter<void>();

  public readonly onDidChange = this.onDidChangeEmitter.event;

  constructor(
    private storage: StorageManager,
    private config: ClipboardManagerConfig
  ) { }

  /**
   * Initialize the clipboard manager
   */
  async initialize(): Promise<void> {
    // Load history from storage
    this.entries = await this.storage.loadHistory();

    // Clean up old entries based on autoCleanupDays
    this.cleanupOldEntries();

    // Get initial clipboard content
    this.lastClipboardContent = await vscode.env.clipboard.readText();

    // Start monitoring
    this.startMonitoring();
  }

  /**
   * Start monitoring clipboard changes
   */
  private startMonitoring(): void {
    this.monitoringInterval = setInterval(async () => {
      await this.checkClipboard();
    }, this.config.monitoringInterval);
  }

  /**
   * Stop monitoring clipboard changes
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  /**
   * Check clipboard for changes
   */
  private async checkClipboard(): Promise<void> {
    try {
      const currentContent = await vscode.env.clipboard.readText();

      // Check if clipboard has changed
      if (currentContent && currentContent !== this.lastClipboardContent) {
        this.lastClipboardContent = currentContent;

        // Check if content should be excluded
        if (this.shouldExclude(currentContent)) {
          return;
        }

        // Check for duplicates (don't add if same as most recent)
        if (this.entries.length > 0 && this.entries[0].content === currentContent) {
          return;
        }

        await this.addEntry(currentContent);
      }
    } catch (error) {
      // Silently handle clipboard errors
    }
  }

  /**
   * Check if content should be excluded based on patterns
   */
  private shouldExclude(content: string): boolean {
    for (const pattern of this.config.excludePatterns) {
      try {
        const regex = new RegExp(pattern);
        if (regex.test(content)) {
          return true;
        }
      } catch (error) {
        // Skip invalid regex patterns
      }
    }
    return false;
  }

  /**
   * Add a new clipboard entry
   */
  async addEntry(content: string, sourceFile?: string): Promise<void> {
    const entry: ClipboardEntry = {
      id: this.generateId(),
      content,
      timestamp: Date.now(),
      isPinned: false,
      sourceFile,
      lineCount: content.split('\n').length,
      contentType: this.detectContentType(content)
    };

    // Add to beginning of array (most recent first)
    this.entries.unshift(entry);

    // Enforce max history size (keep pinned entries)
    const pinnedEntries = this.entries.filter(e => e.isPinned);
    const unpinnedEntries = this.entries.filter(e => !e.isPinned);

    if (unpinnedEntries.length > this.config.maxHistorySize) {
      unpinnedEntries.splice(this.config.maxHistorySize);
    }

    this.entries = [...pinnedEntries, ...unpinnedEntries];

    // Save to storage
    await this.storage.saveHistory(this.entries);

    // Notify listeners
    this.onDidChangeEmitter.fire();

    // Show notification if enabled
    if (this.config.enableNotifications) {
      const preview = this.getPreview(content);
      vscode.window.showInformationMessage(`Clipboard updated: ${preview}`);
    }
  }

  /**
   * Get all clipboard entries
   */
  getEntries(): ClipboardEntry[] {
    return [...this.entries];
  }

  /**
   * Get a specific entry by ID
   */
  getEntry(id: string): ClipboardEntry | undefined {
    return this.entries.find(e => e.id === id);
  }

  /**
   * Delete an entry
   */
  async deleteEntry(id: string): Promise<void> {
    const index = this.entries.findIndex(e => e.id === id);
    if (index !== -1) {
      this.entries.splice(index, 1);
      await this.storage.saveHistory(this.entries);
      this.onDidChangeEmitter.fire();
    }
  }

  /**
   * Pin/unpin an entry
   */
  async togglePin(id: string): Promise<void> {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      entry.isPinned = !entry.isPinned;

      // Re-sort: pinned entries first, then by timestamp
      this.entries.sort((a, b) => {
        if (a.isPinned && !b.isPinned) {
          return -1;
        }
        if (!a.isPinned && b.isPinned) {
          return 1;
        }
        return b.timestamp - a.timestamp;
      });

      await this.storage.saveHistory(this.entries);
      this.onDidChangeEmitter.fire();
    }
  }

  /**
   * Clear all history
   */
  async clearHistory(): Promise<void> {
    this.entries = [];
    await this.storage.clearHistory();
    this.onDidChangeEmitter.fire();
  }

  /**
   * Copy an entry back to clipboard
   */
  async copyToClipboard(id: string): Promise<void> {
    const entry = this.entries.find(e => e.id === id);
    if (entry) {
      this.lastClipboardContent = entry.content;
      await vscode.env.clipboard.writeText(entry.content);
      vscode.window.showInformationMessage('Copied to clipboard');
    }
  }

  /**
   * Clean up entries older than configured days
   */
  private cleanupOldEntries(): void {
    const cutoffTime = Date.now() - (this.config.autoCleanupDays * 24 * 60 * 60 * 1000);
    const originalLength = this.entries.length;

    // Keep pinned entries regardless of age
    this.entries = this.entries.filter(e => e.isPinned || e.timestamp > cutoffTime);

    if (this.entries.length < originalLength) {
      this.storage.saveHistory(this.entries);
    }
  }

  /**
   * Get preview of content
   */
  getPreview(content: string): string {
    const singleLine = content.replace(/\n/g, ' ').trim();
    if (singleLine.length > this.config.previewLength) {
      return singleLine.substring(0, this.config.previewLength) + '...';
    }
    return singleLine;
  }

  /**
   * Detect content type
   */
  private detectContentType(content: string): 'text' | 'code' {
    // Simple heuristic: if it contains common code patterns, mark as code
    const codePatterns = [
      /^(import|export|function|class|const|let|var|if|for|while)\s/m,
      /[{}[\];()]/,
      /=>/,
      /\/\//,
      /\/\*/
    ];

    for (const pattern of codePatterns) {
      if (pattern.test(content)) {
        return 'code';
      }
    }

    return 'text';
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update configuration
   */
  updateConfig(config: ClipboardManagerConfig): void {
    this.config = config;

    // Restart monitoring with new interval
    this.stopMonitoring();
    this.startMonitoring();
  }

  /**
   * Dispose resources
   */
  dispose(): void {
    this.stopMonitoring();
    this.onDidChangeEmitter.dispose();
  }
}
