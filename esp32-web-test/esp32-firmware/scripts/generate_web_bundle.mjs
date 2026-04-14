#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const firmwareRoot = path.resolve(scriptDir, '..');
const reactDistRoot = path.resolve(firmwareRoot, '../react-app/dist');
const outFile = path.resolve(firmwareRoot, 'src/generated/web_bundle.h');

function readSingleFile(dir, extension) {
  const files = fs.readdirSync(dir).filter((name) => name.endsWith(extension));
  if (files.length !== 1) {
    throw new Error(`Expected exactly one ${extension} file in ${dir}, found ${files.length}`);
  }
  return path.join(dir, files[0]);
}

function escapeForHtml(text) {
  return text
    .replace(/<\/style>/gi, '<\\/style>')
    .replace(/<\/script>/gi, '<\\/script>');
}

function rawString(delim, content) {
  const marker = `)${delim}"`;
  if (content.includes(marker)) {
    throw new Error(`Raw string delimiter collision for ${delim}`);
  }
  return `R"${delim}(${content})${delim}"`;
}

const htmlPath = path.join(reactDistRoot, 'index.html');
const cssPath = readSingleFile(path.join(reactDistRoot, 'assets'), '.css');
const jsPath = readSingleFile(path.join(reactDistRoot, 'assets'), '.js');
const assetsDir = path.join(reactDistRoot, 'assets');
const mapPath = fs.readdirSync(assetsDir)
  .map((name) => path.join(assetsDir, name))
  .find((filePath) => filePath.endsWith('.svg') || filePath.endsWith('.jpg'));

if (!mapPath) {
  throw new Error(`Expected a map asset in ${assetsDir}`);
}

const css = escapeForHtml(fs.readFileSync(cssPath, 'utf8'));
const mapMimeType = mapPath.endsWith('.svg') ? 'image/svg+xml' : 'image/jpeg';
const mapDataUri = `data:${mapMimeType};base64,${fs.readFileSync(mapPath).toString('base64')}`;
const js = escapeForHtml(
  fs.readFileSync(jsPath, 'utf8').replace(/\/assets\/map-background-[^"'`\s]+\.(?:svg|jpg)/g, mapDataUri),
);

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ESP32 Web Test</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${js}</script>
  </body>
</html>`;

const fingerprint = crypto
  .createHash('sha256')
  .update(htmlPath + cssPath + jsPath + mapPath + html)
  .digest('hex')
  .slice(0, 8)
  .toUpperCase();
const delim = `WEBUI${fingerprint}`;

const header = `#pragma once
#include <Arduino.h>

namespace EspWebBundle {
static const char kWebUiHtml[] PROGMEM = ${rawString(delim, html)};
}  // namespace EspWebBundle
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, header);
console.log(`Wrote ${outFile}`);
