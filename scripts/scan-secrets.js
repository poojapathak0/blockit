#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const patterns = [
  /ghp_[A-Za-z0-9]{36}/g,
  /github_pat_[A-Za-z0-9_]{80,}/g,
  /AIza[0-9A-Za-z\-_]{35}/g,
  /AKIA[0-9A-Z]{16}/g,
  /ASIA[0-9A-Z]{16}/g,
  /xox[baprs]-[A-Za-z0-9-]{10,}/g,
  /(BEGIN (RSA|OPENSSH|EC) PRIVATE KEY)/g,
  /(client_secret|client-secret|api[_-]?key|x-api-key)\s*[:=]\s*['\"][A-Za-z0-9\-_\.]+['\"]/gi
];

const ignoreDirs = new Set(['node_modules', '.git', 'dist', 'build', '.cache']);

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const fp = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (!ignoreDirs.has(e.name)) scanDir(fp);
      continue;
    }
    if (e.isFile()) scanFile(fp);
  }
}

function scanFile(fp) {
  try {
    const text = fs.readFileSync(fp, 'utf8');
    for (const re of patterns) {
      if (re.test(text)) {
        console.error(`POSSIBLE SECRET in ${fp} matching ${re}`);
        process.exitCode = 1;
        return;
      }
    }
  } catch {}
}

scanDir(process.cwd());
if (process.exitCode) {
  console.error('Secret scan failed. Remove/rotate secrets before committing.');
  process.exit(1);
} else {
  console.log('Secret scan passed.');
}