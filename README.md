# Clipboard History Manager

> 📋 Never lose your clipboard history again! Track, search, and reuse everything you copy in VS Code.

A lightweight and powerful VS Code extension that automatically tracks your clipboard history, allowing you to quickly access and reuse previously copied items. Perfect for developers who frequently copy and paste code snippets, text, and commands.

## Features

### 📋 Automatic Clipboard Monitoring
- Continuously monitors clipboard changes in VS Code
- Automatically captures all copied/cut text
- Preserves formatting and syntax
- Stores up to 100 entries (configurable)

### 🔍 Quick Access
- **Quick Pick Menu**: Access clipboard history via Command Palette
- **Sidebar Panel**: Dedicated TreeView showing all clipboard entries
- **Keyboard Shortcuts**: Fast access with customizable keybindings

### 📌 Pin Important Items
- Pin frequently used clipboard entries
- Pinned items stay at the top and are never auto-deleted
- Easy pin/unpin from context menu

### 🕐 Smart History Management
- Automatic cleanup of old entries (configurable)
- Duplicate detection
- Persistent storage across VS Code sessions
- Metadata tracking (timestamp, line count, content type)

### 🎨 Rich UI
- Preview of clipboard content (first 50 characters)
- Relative timestamps ("2 minutes ago")
- Content type indicators (text/code)
- Line count for multi-line content
- Search and filter functionality

## Installation

### From Source

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript
4. Press F5 to open a new VS Code window with the extension loaded

### From VSIX

1. Download the `.vsix` file
2. In VS Code, go to Extensions view
3. Click "..." menu → "Install from VSIX..."
4. Select the downloaded file

## Usage

### Commands

Access these commands via Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- **Clipboard Manager: Show History** - Display clipboard history in quick pick
- **Clipboard Manager: Paste from History** - Select and paste from history
- **Clipboard Manager: Clear All History** - Clear all clipboard entries
- **Clipboard Manager: Delete Entry** - Remove specific entry
- **Clipboard Manager: Pin Entry** - Pin/unpin an entry

### Keyboard Shortcuts

| Command | Windows/Linux | Mac |
|---------|--------------|-----|
| Show History | `Ctrl+Shift+V` | `Cmd+Shift+V` |
| Paste from History | `Ctrl+Alt+V` | `Cmd+Alt+V` |

### Sidebar Panel

1. Click the Clipboard Manager icon in the Activity Bar
2. View all clipboard entries in chronological order
3. Click any entry to copy it to clipboard
4. Use context menu for additional actions:
   - Copy Again
   - Pin/Unpin
   - Delete

### Quick Pick Interface

1. Press `Cmd+Shift+V` (Mac) or `Ctrl+Shift+V` (Windows/Linux)
2. Search through clipboard history
3. Select an entry to copy it
4. Use `Cmd+Alt+V` to paste directly at cursor

## Configuration

Customize the extension via VS Code settings:

```json
{
  // Maximum number of clipboard entries to store
  "clipboardManager.maxHistorySize": 100,
  
  // Show timestamp for each entry
  "clipboardManager.showTimestamp": true,
  
  // Show notifications when clipboard is updated
  "clipboardManager.enableNotifications": false,
  
  // Auto-remove entries older than X days
  "clipboardManager.autoCleanupDays": 7,
  
  // Regex patterns to exclude from history
  "clipboardManager.excludePatterns": [],
  
  // Clipboard monitoring interval (ms)
  "clipboardManager.monitoringInterval": 500,
  
  // Preview length (characters)
  "clipboardManager.previewLength": 50
}
```

### Configuration Examples

**Exclude sensitive data:**
```json
{
  "clipboardManager.excludePatterns": [
    "^password.*",
    ".*secret.*",
    ".*token.*"
  ]
}
```

**Increase history size:**
```json
{
  "clipboardManager.maxHistorySize": 200
}
```

**Enable notifications:**
```json
{
  "clipboardManager.enableNotifications": true
}
```

## How It Works

1. **Monitoring**: The extension polls the clipboard every 500ms (configurable) to detect changes
2. **Storage**: Clipboard entries are stored in VS Code's global state and persist across sessions
3. **Deduplication**: Consecutive identical entries are automatically filtered out
4. **Cleanup**: Old entries are automatically removed based on the `autoCleanupDays` setting
5. **Pinning**: Pinned entries are exempt from size limits and auto-cleanup

## Features in Detail

### Content Type Detection
The extension automatically detects whether copied content is:
- **Code**: Contains programming patterns (functions, imports, brackets, etc.)
- **Text**: Plain text content

### Metadata Tracking
Each clipboard entry includes:
- Unique ID
- Content
- Timestamp
- Pin status
- Source file (when available)
- Line count
- Content type

### Performance
- Minimal memory footprint
- Efficient polling mechanism
- Optimized storage with JSON serialization
- No impact on editor performance

## Troubleshooting

### Clipboard not being monitored
- Check that the extension is activated (look for activation message)
- Verify `monitoringInterval` is not too high
- Restart VS Code

### History not persisting
- Check VS Code's global state storage
- Ensure you have write permissions
- Try clearing history and starting fresh

### Too many/few entries
- Adjust `maxHistorySize` in settings
- Check `autoCleanupDays` setting
- Pin important entries to prevent deletion

## Development

### Building from Source

```bash
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch mode for development
npm run watch

# Lint code
npm run lint
```

### Project Structure

```
clipboard-manager/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── clipboardManager.ts   # Core clipboard monitoring
│   ├── historyProvider.ts    # TreeView data provider
│   ├── storage.ts            # Persistence layer
│   └── types.ts              # TypeScript interfaces
├── package.json              # Extension manifest
├── tsconfig.json             # TypeScript config
└── README.md                 # This file
```

### Testing

The extension has been tested with:
- Large clipboard entries (10,000+ characters)
- Rapid clipboard changes
- Long-running sessions (24+ hours)
- Multiple VS Code windows
- Various content types (text, code, JSON, etc.)

## Publishing

To publish this extension:

1. Create a publisher account on [VS Code Marketplace](https://marketplace.visualstudio.com/)
2. Install vsce: `npm install -g @vscode/vsce`
3. Package: `vsce package`
4. Publish: `vsce publish`

## Privacy

- **No telemetry**: This extension does not collect or send any data
- **Local storage**: All clipboard history is stored locally in VS Code's global state
- **No external requests**: The extension operates entirely offline

## License

MIT License - feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Roadmap

Future features under consideration:
- [ ] Rich text/HTML support
- [ ] Image clipboard support
- [ ] Categories and tags
- [ ] Export/import history
- [ ] Statistics dashboard
- [ ] Sync across devices
- [ ] Preview pane with syntax highlighting
- [ ] Fuzzy search

## Acknowledgments

Inspired by CopyClip for Mac and other clipboard managers.

## Support

If you encounter any issues or have suggestions, please file an issue on the GitHub repository.


## Marketplace Badge

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/priyanshumallick.clipboard-history-manager)](https://marketplace.visualstudio.com/items?itemName=priyanshumallick.clipboard-history-manager)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/priyanshumallick.clipboard-history-manager)](https://marketplace.visualstudio.com/items?itemName=priyanshumallick.clipboard-history-manager)
[![Visual Studio Marketplace Rating](https://img.shields.io/visual-studio-marketplace/r/priyanshumallick.clipboard-history-manager)](https://marketplace.visualstudio.com/items?itemName=priyanshumallick.clipboard-history-manager)
---

**Enjoy managing your clipboard history!** 📋✨
