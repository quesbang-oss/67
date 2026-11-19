#!/usr/bin/env node
// Copy app assets and bundle all JavaScript into one classic script for older Android WebViews.
import { cp, rm, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const www = path.join(root, 'www');
await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });
for (const f of ['index.html', 'src', 'icons']) {
  await cp(path.join(root, f), path.join(www, f), { recursive: true });
}

// esbuild is fetched through npx so the checked-in lockfile stays unchanged.
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
await execFileAsync(npx, [
  '--yes', 'esbuild@0.25.12',
  path.join(root, 'src', 'main.js'),
  '--bundle',
  '--format=iife',
  '--target=chrome58',
  '--outfile=' + path.join(www, 'app.bundle.js'),
  '--log-level=warning'
], { cwd: root, maxBuffer: 10 * 1024 * 1024 });
console.log('ビルド完了: www/ (Android 6向けJavaScriptバンドル)');
