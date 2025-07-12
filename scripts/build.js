#!/usr/bin/env node

/**
 * Build Script for BlockIt Extension
 * Prepares the extension for distribution
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ExtensionBuilder {
  constructor() {
    this.buildDir = path.join(__dirname, '..', 'dist');
    this.sourceDir = path.join(__dirname, '..');
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${message}`);
  }

  clean() {
    this.log('Cleaning build directory...');
    
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(this.buildDir, { recursive: true });
    this.log('Build directory cleaned');
  }

  copyFiles() {
    this.log('Copying extension files...');
    
    const filesToCopy = [
      'manifest.json',
      'background/',
      'content/',
      'popup/',
      'options/',
      'icons/',
      'rules/',
      'scripts/',
      'assets/'
    ];

    filesToCopy.forEach(item => {
      const sourcePath = path.join(this.sourceDir, item);
      const destPath = path.join(this.buildDir, item);
      
      if (fs.existsSync(sourcePath)) {
        if (fs.statSync(sourcePath).isDirectory()) {
          this.copyDirectory(sourcePath, destPath);
        } else {
          this.copyFile(sourcePath, destPath);
        }
      }
    });

    this.log('Files copied successfully');
  }

  copyDirectory(source, dest) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }

    const items = fs.readdirSync(source);
    
    items.forEach(item => {
      const sourcePath = path.join(source, item);
      const destPath = path.join(dest, item);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        this.copyDirectory(sourcePath, destPath);
      } else {
        this.copyFile(sourcePath, destPath);
      }
    });
  }

  copyFile(source, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(source, dest);
  }

  minifyFiles() {
    this.log('Minifying files...');
    
    // Simple minification (remove comments and extra whitespace)
    const jsFiles = this.findFiles(this.buildDir, '.js');
    
    jsFiles.forEach(filePath => {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Remove single-line comments (but preserve URLs)
        content = content.replace(/(?<!:)\/\/(?![\/\s]*http).*$/gm, '');
        
        // Remove multi-line comments
        content = content.replace(/\/\*[\s\S]*?\*\//g, '');
        
        // Remove extra whitespace
        content = content.replace(/\s+/g, ' ');
        content = content.replace(/;\s*}/g, ';}');
        content = content.replace(/{\s*/g, '{');
        content = content.replace(/}\s*/g, '}');
        
        fs.writeFileSync(filePath, content);
        this.log(`Minified: ${path.relative(this.buildDir, filePath)}`);
      } catch (error) {
        this.log(`Failed to minify ${filePath}: ${error.message}`, 'warning');
      }
    });
  }

  findFiles(dir, extension) {
    let files = [];
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      
      if (fs.statSync(fullPath).isDirectory()) {
        files = files.concat(this.findFiles(fullPath, extension));
      } else if (item.endsWith(extension)) {
        files.push(fullPath);
      }
    });
    
    return files;
  }

  validateBuild() {
    this.log('Validating build...');
    
    try {
      // Run the validation script on the build directory
      const validatorPath = path.join(__dirname, 'validate-manifest.js');
      const originalCwd = process.cwd();
      
      process.chdir(this.buildDir);
      
      const ExtensionValidator = require(validatorPath);
      const validator = new ExtensionValidator();
      validator.run();
      
      process.chdir(originalCwd);
      
      this.log('Build validation passed');
    } catch (error) {
      this.log(`Build validation failed: ${error.message}`, 'error');
      throw error;
    }
  }

  createZip() {
    this.log('Creating distribution package...');
    
    const zipPath = path.join(this.sourceDir, 'blockit-extension.zip');
    
    try {
      // Remove existing zip
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
      
      // Create new zip
      const command = process.platform === 'win32' 
        ? `powershell Compress-Archive -Path "${this.buildDir}\\*" -DestinationPath "${zipPath}"`
        : `cd "${this.buildDir}" && zip -r "${zipPath}" .`;
      
      execSync(command, { stdio: 'inherit' });
      
      this.log(`Extension package created: ${zipPath}`);
    } catch (error) {
      this.log(`Failed to create zip package: ${error.message}`, 'error');
      throw error;
    }
  }

  updateVersion() {
    this.log('Updating version...');
    
    const manifestPath = path.join(this.buildDir, 'manifest.json');
    const packagePath = path.join(this.sourceDir, 'package.json');
    
    if (fs.existsSync(packagePath)) {
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      const manifestData = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      
      manifestData.version = packageData.version;
      
      fs.writeFileSync(manifestPath, JSON.stringify(manifestData, null, 2));
      this.log(`Version updated to ${packageData.version}`);
    }
  }

  generateManifest() {
    this.log('Generating optimized manifest...');
    
    const manifestPath = path.join(this.buildDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Add build timestamp
    manifest.build = {
      timestamp: new Date().toISOString(),
      version: manifest.version
    };
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    this.log('Manifest optimized');
  }

  build() {
    try {
      this.log('Starting extension build...');
      
      this.clean();
      this.copyFiles();
      this.updateVersion();
      this.generateManifest();
      this.minifyFiles();
      this.validateBuild();
      this.createZip();
      
      this.log('Build completed successfully!', 'success');
      this.log(`Output: ${this.buildDir}`);
      this.log(`Package: blockit-extension.zip`);
      
    } catch (error) {
      this.log(`Build failed: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run build if called directly
if (require.main === module) {
  const builder = new ExtensionBuilder();
  builder.build();
}

module.exports = ExtensionBuilder;
