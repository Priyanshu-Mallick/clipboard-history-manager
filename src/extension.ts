import * as vscode from 'vscode';
import { ClipboardManager } from './clipboardManager';
import { ClipboardHistoryProvider } from './historyProvider';
import { StorageManager } from './storage';
import { ClipboardManagerConfig } from './types';

let clipboardManager: ClipboardManager;
let historyProvider: ClipboardHistoryProvider;

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext) {
  // Initialize storage
  const storage = new StorageManager(context);

  // Get configuration
  const config = getConfiguration();

  // Initialize clipboard manager
  clipboardManager = new ClipboardManager(storage, config);
  await clipboardManager.initialize();

  // Initialize tree view provider
  historyProvider = new ClipboardHistoryProvider(clipboardManager);
  const treeView = vscode.window.createTreeView('clipboardHistory', {
    treeDataProvider: historyProvider,
    showCollapseAll: false
  });

  // Register commands
  registerCommands(context);

  // Listen for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('clipboardManager')) {
        const newConfig = getConfiguration();
        clipboardManager.updateConfig(newConfig);
      }
    })
  );

  // Add disposables
  context.subscriptions.push(
    clipboardManager,
    treeView
  );
}

/**
 * Register all commands
 */
function registerCommands(context: vscode.ExtensionContext) {
  // Show history in quick pick
  context.subscriptions.push(
    vscode.commands.registerCommand('clipboard-manager.showHistory', async () => {
      await showHistoryQuickPick(false);
    })
  );

  // Paste from history
  context.subscriptions.push(
    vscode.commands.registerCommand('clipboard-manager.pasteFromHistory', async () => {
      await showHistoryQuickPick(true);
    })
  );

  // Clear all history
  context.subscriptions.push(
    vscode.commands.registerCommand('clipboard-manager.clearHistory', async () => {
      const answer = await vscode.window.showWarningMessage(
        'Are you sure you want to clear all clipboard history?',
        'Yes',
        'No'
      );

      if (answer === 'Yes') {
        await clipboardManager.clearHistory();
        vscode.window.showInformationMessage('Clipboard history cleared');
      }
    })
  );

  // Delete entry
  context.subscriptions.push(
    vscode.commands.registerCommand('clipboard-manager.deleteEntry', async (entryId?: string) => {
      if (!entryId) {
        return;
      }
      await clipboardManager.deleteEntry(entryId);
    })
  );

  // Pin entry
  context.subscriptions.push(
    vscode.commands.registerCommand('clipboard-manager.pinEntry', async (entryId?: string) => {
      if (!entryId) {
        return;
      }
      await clipboardManager.togglePin(entryId);
    })
  );

  // Unpin entry
  context.subscriptions.push(
    vscode.commands.registerCommand('clipboard-manager.unpinEntry', async (entryId?: string) => {
      if (!entryId) {
        return;
      }
      await clipboardManager.togglePin(entryId);
    })
  );

  // Copy again
  context.subscriptions.push(
    vscode.commands.registerCommand('clipboard-manager.copyAgain', async (entryId?: string) => {
      if (!entryId) {
        return;
      }
      await clipboardManager.copyToClipboard(entryId);
    })
  );

  // Refresh view
  context.subscriptions.push(
    vscode.commands.registerCommand('clipboard-manager.refreshView', () => {
      historyProvider.refresh();
    })
  );
}

/**
 * Show clipboard history in quick pick
 */
async function showHistoryQuickPick(pasteAfterSelect: boolean) {
  const entries = clipboardManager.getEntries();

  if (entries.length === 0) {
    vscode.window.showInformationMessage('Clipboard history is empty');
    return;
  }

  interface ClipboardQuickPickItem extends vscode.QuickPickItem {
    entryId: string;
  }

  const items: ClipboardQuickPickItem[] = entries.map(entry => {
    const preview = clipboardManager.getPreview(entry.content);
    const icon = entry.isPinned ? '📌' : (entry.contentType === 'code' ? '💻' : '📄');
    const timeAgo = getRelativeTime(entry.timestamp);
    const lineInfo = entry.lineCount > 1 ? ` (${entry.lineCount} lines)` : '';

    return {
      label: `${icon} ${preview}`,
      description: `${timeAgo}${lineInfo}`,
      detail: entry.content.length > 100 ? entry.content.substring(0, 100) + '...' : entry.content,
      entryId: entry.id
    };
  });

  const selected = await vscode.window.showQuickPick(items, {
    placeHolder: pasteAfterSelect 
      ? 'Select clipboard entry to paste' 
      : 'Select clipboard entry to copy',
    matchOnDescription: true,
    matchOnDetail: true
  });

  if (selected) {
    await clipboardManager.copyToClipboard(selected.entryId);

    if (pasteAfterSelect) {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const entry = clipboardManager.getEntry(selected.entryId);
        if (entry) {
          await editor.edit(editBuilder => {
            editBuilder.insert(editor.selection.active, entry.content);
          });
        }
      }
    }
  }
}

/**
 * Get relative time string
 */
function getRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  return 'just now';
}

/**
 * Get current configuration
 */
function getConfiguration(): ClipboardManagerConfig {
  const config = vscode.workspace.getConfiguration('clipboardManager');

  return {
    maxHistorySize: config.get<number>('maxHistorySize', 100),
    showTimestamp: config.get<boolean>('showTimestamp', true),
    enableNotifications: config.get<boolean>('enableNotifications', false),
    autoCleanupDays: config.get<number>('autoCleanupDays', 7),
    excludePatterns: config.get<string[]>('excludePatterns', []),
    monitoringInterval: config.get<number>('monitoringInterval', 500),
    previewLength: config.get<number>('previewLength', 50)
  };
}

/**
 * Extension deactivation
 */
export function deactivate() {
  if (clipboardManager) {
    clipboardManager.dispose();
  }
}
