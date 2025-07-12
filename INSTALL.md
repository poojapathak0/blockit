# BlockIt Extension - Installation Guide

## 🚀 Quick Start

### Step 1: Prepare Icons
1. Open `icon-generator.html` in your browser
2. Download all four icon sizes (16x16, 32x32, 48x48, 128x128)
3. Save them in the `icons/` folder with the correct names:
   - `icon16.png`
   - `icon32.png`
   - `icon48.png`
   - `icon128.png`

### Step 2: Install in Chrome/Edge
1. Open Chrome or Edge browser
2. Navigate to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked"
5. Select the `blockit` folder
6. The extension will be installed and active!

### Step 3: Verify Installation
1. Look for the BlockIt icon in your browser toolbar
2. Click the icon to open the popup
3. Navigate to any website and see blocking statistics
4. Right-click for context menu options

## 🛠️ Development Setup

### Prerequisites
- Node.js (optional, for build scripts)
- Chrome or Edge browser
- Basic understanding of Chrome extensions

### Build for Distribution
```bash
npm install
npm run build
npm run zip
```

## ⚙️ Configuration

### Default Settings
The extension comes preconfigured with:
- ✅ Shields Up
- ✅ Ad Blocking
- ✅ Tracker Blocking  
- ✅ HTTPS Upgrades
- ✅ Fingerprinting Protection
- ✅ Cookie Blocking
- ❌ Script Blocking (disabled by default)

### Customization
1. Click the extension icon → Settings
2. Adjust protection levels
3. Add site-specific rules
4. Configure advanced options

## 🔧 Troubleshooting

### Extension Not Loading
- Ensure all icon files are present
- Check manifest.json for syntax errors
- Run validation: `node scripts/validate-manifest.js`

### Features Not Working
- Check if shields are enabled
- Verify permissions are granted
- Check browser console for errors

### Performance Issues
- Disable aggressive blocking modes
- Add frequently used sites to allowlist
- Clear extension data in settings

## 📊 Features Overview

### Core Protection
- **Ad Blocking**: Blocks advertisements and sponsored content
- **Tracker Blocking**: Prevents analytics and tracking scripts
- **HTTPS Upgrades**: Automatically upgrades HTTP to HTTPS
- **Fingerprinting Protection**: Blocks browser fingerprinting attempts
- **Cookie Blocking**: Blocks tracking cookies while preserving functionality
- **Script Blocking**: Optional JavaScript blocking for enhanced security

### User Interface
- **Real-time Stats**: Live blocking statistics
- **Quick Controls**: One-click toggles for all features
- **Site Settings**: Per-domain protection rules
- **Context Menus**: Right-click options for quick access

### Advanced Features
- **Custom Filter Lists**: Add your own blocking rules
- **Statistics Export**: Export protection data
- **Settings Sync**: Cloud synchronization (coming soon)
- **Developer Tools**: Debug mode and advanced options

## 🎯 Usage Tips

### Best Practices
1. **Start with Standard Protection**: Use default settings initially
2. **Add Site Exceptions**: Whitelist broken sites individually
3. **Monitor Statistics**: Check blocking stats regularly
4. **Update Regularly**: Keep filter lists updated
5. **Report Issues**: Help improve the extension by reporting problems

### Site Compatibility
If a website breaks:
1. Try disabling script blocking first
2. Add site to exceptions in settings
3. Temporarily disable shields for that site
4. Report the issue for future fixes

### Privacy Tips
- Enable all protection features for maximum privacy
- Use HTTPS-only mode when possible
- Regularly clear browser data
- Consider using additional privacy tools

## 🔐 Privacy & Security

### Data Collection
- **No personal data collected**
- **All data stored locally**
- **No analytics or telemetry**
- **Open source for transparency**

### Permissions Explained
- `activeTab`: Access current tab for protection
- `storage`: Save settings and statistics
- `webRequest`: Block network requests
- `declarativeNetRequest`: Modern request blocking
- `<all_urls>`: Protect all websites

## 📱 Browser Compatibility

### Supported Browsers
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave Browser
- ✅ Opera 74+
- ❓ Firefox (Manifest V3 support pending)

### Feature Compatibility
All features work on supported browsers with Manifest V3 support.

## 🤝 Contributing

### Development
1. Fork the repository
2. Make changes
3. Test thoroughly
4. Submit pull request

### Bug Reports
- Use GitHub issues
- Include browser version
- Provide reproduction steps
- Include console errors

### Feature Requests
- Check existing requests first
- Describe use case clearly
- Consider implementation complexity

## 📚 Additional Resources

- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [Filter List Syntax](https://help.eyeo.com/en/adblockplus/how-to-write-filters)
- [Privacy Testing Tools](https://privacytests.org/)

## 🆘 Support

Need help? Try these resources:
1. Check the README.md
2. Review the troubleshooting section
3. Search existing GitHub issues
4. Create a new issue with details

---

**Happy browsing with enhanced privacy! 🛡️**
