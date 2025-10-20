# Change Log

All notable changes to the "Clipboard History Manager" extension will be documented in this file.

## [0.1.0] - 2024-10-20

### Initial Release

### Features
- ✅ Automatic clipboard monitoring
- ✅ Clipboard history storage (up to 100 entries)
- ✅ Persistent storage across VS Code sessions
- ✅ Quick Pick interface for browsing history
- ✅ Sidebar TreeView panel
- ✅ Pin/unpin important entries
- ✅ Delete individual entries
- ✅ Clear all history
- ✅ Keyboard shortcuts (Cmd/Ctrl+Shift+V, Cmd/Ctrl+Alt+V)
- ✅ Relative timestamps
- ✅ Content type detection (text/code)
- ✅ Line count display
- ✅ Duplicate detection
- ✅ Auto-cleanup of old entries
- ✅ Configurable settings
- ✅ Exclude patterns support
- ✅ Search and filter in Quick Pick

### Configuration Options
- `maxHistorySize`: Maximum number of entries (default: 100)
- `showTimestamp`: Show timestamps (default: true)
- `enableNotifications`: Show clipboard update notifications (default: false)
- `autoCleanupDays`: Auto-remove entries older than X days (default: 7)
- `excludePatterns`: Regex patterns to exclude (default: [])
- `monitoringInterval`: Polling interval in ms (default: 500)
- `previewLength`: Preview character count (default: 50)

### Commands
- `clipboard-manager.showHistory`: Show clipboard history
- `clipboard-manager.pasteFromHistory`: Paste from history
- `clipboard-manager.clearHistory`: Clear all history
- `clipboard-manager.deleteEntry`: Delete specific entry
- `clipboard-manager.pinEntry`: Pin entry
- `clipboard-manager.unpinEntry`: Unpin entry
- `clipboard-manager.copyAgain`: Copy entry to clipboard
- `clipboard-manager.refreshView`: Refresh sidebar view

### Known Issues
- None at this time

### Notes
- First stable release
- Tested on macOS, Windows, and Linux
- No telemetry or external data collection
