# BlockIt - Brave Browser Clone Extension

A comprehensive privacy-focused browser extension that replicates Brave browser functionality with advanced ad blocking, privacy protection, and security features.

## 🚀 Features

### Core Protection
- **🛡️ Advanced Ad & Tracker Blocking** - Blocks ads, trackers, and malicious scripts
- **🔒 Automatic HTTPS Upgrades** - Upgrades insecure HTTP connections to HTTPS
- **👁️ Fingerprinting Protection** - Prevents browser fingerprinting and tracking
- **🍪 Smart Cookie Blocking** - Blocks tracking cookies while preserving functionality
- **📜 Script Blocking** - Optional JavaScript blocking for enhanced security
- **⛏️ Crypto Mining Protection** - Blocks cryptocurrency mining scripts

### User Interface
- **📊 Real-time Statistics** - Live blocking statistics and protection metrics
- **⚙️ Customizable Settings** - Granular control over protection features
- **🌐 Site-specific Settings** - Per-domain protection configurations
- **🎨 Modern UI** - Clean, Brave-inspired user interface

### Advanced Features
- **📱 Responsive Design** - Works across all screen sizes
- **🔧 Developer Tools** - Debug mode and advanced options
- **📈 Statistics Export** - Export protection data
- **🔄 Settings Sync** - Cloud synchronization of preferences

## 📦 Installation

### From Source
1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will be installed and ready to use

### Chrome Web Store
*Coming Soon*

## 🛠️ Development

### Project Structure
```
blockit/
├── manifest.json           # Extension manifest
├── background/
│   └── background.js       # Service worker
├── content/
│   ├── content.js         # Content scripts
│   └── content.css        # Content styles
├── popup/
│   ├── popup.html         # Extension popup
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup functionality
├── options/
│   ├── options.html       # Settings page
│   ├── options.css        # Settings styles
│   └── options.js         # Settings functionality
├── icons/                 # Extension icons
├── rules/                 # Declarative Net Request rules
│   ├── ad_block_rules.json
│   ├── privacy_rules.json
│   └── https_upgrade_rules.json
└── scripts/              # Injected scripts
    └── fingerprint-protection.js
```

### Key Components

#### Background Service Worker (`background/background.js`)
- Handles web request blocking
- Manages extension settings and statistics
- Implements declarative net request rules
- Provides context menu integration

#### Content Scripts (`content/content.js`)
- Frontend protection against fingerprinting
- Cookie and storage protection
- DOM manipulation for blocking elements
- Real-time threat detection

#### Popup Interface (`popup/`)
- Quick access to protection settings
- Real-time statistics display
- Site-specific controls
- One-click feature toggles

#### Options Page (`options/`)
- Comprehensive settings management
- Advanced configuration options
- Statistics dashboard
- Import/export functionality

## 🔧 Configuration

### Default Settings
```javascript
{
  shieldsUp: true,
  adBlocking: true,
  trackerBlocking: true,
  httpsUpgrade: true,
  fingerprintingProtection: true,
  cookieBlocking: true,
  scriptBlocking: false
}
```

### Customization
- **Protection Levels**: Standard, Aggressive, or Custom
- **Site Exceptions**: Whitelist specific domains
- **Filter Lists**: Custom blocking rules
- **Advanced Options**: Developer and power user features

## 📊 Statistics

The extension tracks and displays:
- Ads blocked
- Trackers blocked
- HTTPS upgrades
- Scripts blocked
- Fingerprinting attempts blocked

All statistics are stored locally and can be exported for analysis.

## 🛡️ Privacy

BlockIt is designed with privacy in mind:
- **No Data Collection**: Extension doesn't collect or transmit user data
- **Local Storage**: All settings and statistics stored locally
- **Open Source**: Full transparency of functionality
- **Minimal Permissions**: Only requests necessary permissions

## 🔄 Updates

The extension includes:
- Automatic filter list updates
- Background security patches
- New feature rollouts
- Performance improvements

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Development Setup
```bash
git clone https://github.com/yourusername/blockit-extension
cd blockit-extension
# Load unpacked extension in Chrome
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Bug Reports

Found a bug? Please report it:
1. Check existing issues
2. Create a new issue with:
   - Extension version
   - Browser version
   - Steps to reproduce
   - Expected vs actual behavior

## 💡 Feature Requests

Have an idea? We'd love to hear it:
1. Search existing feature requests
2. Create a new issue with the "enhancement" label
3. Describe the feature and use case

## 📞 Support

Need help?
- Check the [FAQ](FAQ.md)
- Review the documentation
- Create an issue for bugs
- Join our community discussions

## 🙏 Acknowledgments

- Brave Software for inspiration
- EasyList for filter lists
- Chrome Extensions team for the platform
- Open source community for contributions

## 📈 Roadmap

### Upcoming Features
- [ ] Tor integration
- [ ] VPN integration  
- [ ] Enhanced filter lists
- [ ] Mobile app support
- [ ] Enterprise features

### Performance Goals
- [ ] Reduce memory usage by 20%
- [ ] Improve blocking speed
- [ ] Optimize rule processing
- [ ] Better caching strategies

---

**Note**: This extension is not affiliated with Brave Software. It's an independent implementation inspired by Brave browser's privacy features.
