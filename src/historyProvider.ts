import * as vscode from 'vscode';
import { ClipboardEntry } from './types';
import { ClipboardManager } from './clipboardManager';

/**
 * Tree item for clipboard history view
 */
class ClipboardTreeItem extends vscode.TreeItem {
  constructor(
    public readonly entry: ClipboardEntry,
    private manager: ClipboardManager
  ) {
    const preview = manager.getPreview(entry.content);
    super(preview, vscode.TreeItemCollapsibleState.None);

    this.tooltip = this.createTooltip();
    this.description = this.createDescription();
    this.iconPath = this.getIcon();
    this.contextValue = entry.isPinned ? 'clipboardEntry-pinned' : 'clipboardEntry';
    
    // Make items clickable to copy
    this.command = {
      command: 'clipboard-manager.copyAgain',
      title: 'Copy to Clipboard',
      arguments: [entry.id]
    };
  }

  private createTooltip(): string {
    const lines = [
      `Content: ${this.entry.content.substring(0, 200)}${this.entry.content.length > 200 ? '...' : ''}`,
      ``,
      `Lines: ${this.entry.lineCount}`,
      `Type: ${this.entry.contentType}`,
      `Created: ${new Date(this.entry.timestamp).toLocaleString()}`,
    ];

    if (this.entry.sourceFile) {
      lines.push(`Source: ${this.entry.sourceFile}`);
    }

    if (this.entry.isPinned) {
      lines.push(`📌 Pinned`);
    }

    return lines.join('\n');
  }

  private createDescription(): string {
    const parts: string[] = [];

    // Add relative time
    const relativeTime = this.getRelativeTime(this.entry.timestamp);
    parts.push(relativeTime);

    // Add line count if multi-line
    if (this.entry.lineCount > 1) {
      parts.push(`${this.entry.lineCount} lines`);
    }

    return parts.join(' • ');
  }

  private getRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ago`;
    }
    if (hours > 0) {
      return `${hours}h ago`;
    }
    if (minutes > 0) {
      return `${minutes}m ago`;
    }
    return 'just now';
  }

  private getIcon(): vscode.ThemeIcon {
    if (this.entry.isPinned) {
      return new vscode.ThemeIcon('pinned');
    }
    
    if (this.entry.contentType === 'code') {
      return new vscode.ThemeIcon('code');
    }
    
    return new vscode.ThemeIcon('file-text');
  }
}

/**
 * Tree data provider for clipboard history view
 */
export class ClipboardHistoryProvider implements vscode.TreeDataProvider<ClipboardTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<ClipboardTreeItem | undefined | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private manager: ClipboardManager) {
    // Listen to clipboard manager changes
    manager.onDidChange(() => {
      this.refresh();
    });
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ClipboardTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ClipboardTreeItem): Thenable<ClipboardTreeItem[]> {
    if (element) {
      return Promise.resolve([]);
    }

    const entries = this.manager.getEntries();
    const items = entries.map(entry => new ClipboardTreeItem(entry, this.manager));
    
    return Promise.resolve(items);
  }

  getParent(): Thenable<ClipboardTreeItem | undefined> {
    return Promise.resolve(undefined);
  }
}
