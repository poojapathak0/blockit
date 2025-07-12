#!/usr/bin/env node

/**
 * Extension Validation Script
 * Validates the manifest and other extension files
 */

const fs = require('fs');
const path = require('path');

class ExtensionValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  error(message) {
    this.errors.push(message);
    this.log(message, 'error');
  }

  warning(message) {
    this.warnings.push(message);
    this.log(message, 'warning');
  }

  validateManifest() {
    this.log('Validating manifest.json...');
    
    try {
      const manifestPath = path.join(__dirname, '..', 'manifest.json');
      const manifestContent = fs.readFileSync(manifestPath, 'utf8');
      const manifest = JSON.parse(manifestContent);

      // Check required fields
      const requiredFields = ['manifest_version', 'name', 'version'];
      requiredFields.forEach(field => {
        if (!manifest[field]) {
          this.error(`Missing required field: ${field}`);
        }
      });

      // Check manifest version
      if (manifest.manifest_version !== 3) {
        this.error('Manifest version must be 3');
      }

      // Check permissions
      if (!manifest.permissions || !Array.isArray(manifest.permissions)) {
        this.error('Permissions must be an array');
      }

      // Check background script
      if (!manifest.background || !manifest.background.service_worker) {
        this.error('Background service worker is required');
      }

      // Check action
      if (!manifest.action) {
        this.warning('Action is recommended for popup access');
      }

      this.log('Manifest validation completed');
      return manifest;
    } catch (error) {
      this.error(`Failed to parse manifest.json: ${error.message}`);
      return null;
    }
  }

  validateFiles(manifest) {
    if (!manifest) return;

    this.log('Validating file references...');

    // Check background script
    if (manifest.background && manifest.background.service_worker) {
      this.checkFileExists(manifest.background.service_worker);
    }

    // Check content scripts
    if (manifest.content_scripts) {
      manifest.content_scripts.forEach((script, index) => {
        if (script.js) {
          script.js.forEach(file => {
            this.checkFileExists(file, `content_scripts[${index}].js`);
          });
        }
        if (script.css) {
          script.css.forEach(file => {
            this.checkFileExists(file, `content_scripts[${index}].css`);
          });
        }
      });
    }

    // Check popup
    if (manifest.action && manifest.action.default_popup) {
      this.checkFileExists(manifest.action.default_popup);
    }

    // Check options page
    if (manifest.options_page) {
      this.checkFileExists(manifest.options_page);
    }

    // Check icons
    if (manifest.icons) {
      Object.values(manifest.icons).forEach(iconPath => {
        this.checkFileExists(iconPath);
      });
    }

    // Check declarative net request rules
    if (manifest.declarative_net_request && manifest.declarative_net_request.rule_resources) {
      manifest.declarative_net_request.rule_resources.forEach(resource => {
        this.checkFileExists(resource.path);
        this.validateRuleFile(resource.path);
      });
    }
  }

  checkFileExists(filePath, context = '') {
    const fullPath = path.join(__dirname, '..', filePath);
    if (!fs.existsSync(fullPath)) {
      this.error(`File not found: ${filePath}${context ? ` (${context})` : ''}`);
    }
  }

  validateRuleFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', filePath);
      const content = fs.readFileSync(fullPath, 'utf8');
      const rules = JSON.parse(content);

      if (!Array.isArray(rules)) {
        this.error(`Rule file ${filePath} must contain an array of rules`);
        return;
      }

      rules.forEach((rule, index) => {
        if (!rule.id) {
          this.error(`Rule ${index} in ${filePath} is missing 'id' field`);
        }
        if (!rule.action) {
          this.error(`Rule ${index} in ${filePath} is missing 'action' field`);
        }
        if (!rule.condition) {
          this.error(`Rule ${index} in ${filePath} is missing 'condition' field`);
        }
      });

      this.log(`Rule file ${filePath} validated successfully`);
    } catch (error) {
      this.error(`Failed to validate rule file ${filePath}: ${error.message}`);
    }
  }

  validateJavaScript() {
    this.log('Validating JavaScript files...');

    const jsFiles = [
      'background/background.js',
      'popup/popup.js',
      'content/content.js',
      'options/options.js'
    ];

    jsFiles.forEach(filePath => {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Basic syntax check (this is very basic)
          if (content.includes('eval(')) {
            this.warning(`File ${filePath} contains eval() which may violate CSP`);
          }
          
          if (content.includes('innerHTML =') && !content.includes('textContent')) {
            this.warning(`File ${filePath} uses innerHTML which may be unsafe`);
          }

          this.log(`JavaScript file ${filePath} validated`);
        } catch (error) {
          this.error(`Failed to read JavaScript file ${filePath}: ${error.message}`);
        }
      }
    });
  }

  validateCSS() {
    this.log('Validating CSS files...');

    const cssFiles = [
      'popup/popup.css',
      'content/content.css',
      'options/options.css'
    ];

    cssFiles.forEach(filePath => {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Basic CSS validation
          const openBraces = (content.match(/{/g) || []).length;
          const closeBraces = (content.match(/}/g) || []).length;
          
          if (openBraces !== closeBraces) {
            this.error(`CSS file ${filePath} has mismatched braces`);
          }

          this.log(`CSS file ${filePath} validated`);
        } catch (error) {
          this.error(`Failed to read CSS file ${filePath}: ${error.message}`);
        }
      }
    });
  }

  validateHTML() {
    this.log('Validating HTML files...');

    const htmlFiles = [
      'popup/popup.html',
      'options/options.html'
    ];

    htmlFiles.forEach(filePath => {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          
          // Basic HTML validation
          if (!content.includes('<!DOCTYPE html>')) {
            this.warning(`HTML file ${filePath} missing DOCTYPE declaration`);
          }
          
          if (!content.includes('<html')) {
            this.error(`HTML file ${filePath} missing html tag`);
          }

          this.log(`HTML file ${filePath} validated`);
        } catch (error) {
          this.error(`Failed to read HTML file ${filePath}: ${error.message}`);
        }
      }
    });
  }

  run() {
    this.log('Starting extension validation...');
    
    const manifest = this.validateManifest();
    this.validateFiles(manifest);
    this.validateJavaScript();
    this.validateCSS();
    this.validateHTML();
    
    this.log('Validation completed');
    this.log(`Errors: ${this.errors.length}`);
    this.log(`Warnings: ${this.warnings.length}`);
    
    if (this.errors.length > 0) {
      this.log('Extension has errors that must be fixed!', 'error');
      process.exit(1);
    } else if (this.warnings.length > 0) {
      this.log('Extension has warnings that should be addressed', 'warning');
    } else {
      this.log('Extension validation passed!', 'success');
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ExtensionValidator();
  validator.run();
}

module.exports = ExtensionValidator;
