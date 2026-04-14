#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const firmwareRoot = path.resolve(scriptDir, '..');
const webAppRoot = path.resolve(firmwareRoot, 'web-app/dist');
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

function renderByteArray(buffer) {
  const lines = [];
  for (let index = 0; index < buffer.length; index += 12) {
    const chunk = Array.from(buffer.slice(index, index + 12), (byte) => `0x${byte.toString(16).padStart(2, '0').toUpperCase()}`);
    lines.push(`  ${chunk.join(', ')}${index + 12 < buffer.length ? ',' : ''}`);
  }
  return lines.join('\n');
}

const htmlPath = path.join(webAppRoot, 'index.html');
const cssPath = readSingleFile(path.join(webAppRoot, 'assets'), '.css');
const jsPath = readSingleFile(path.join(webAppRoot, 'assets'), '.js');
const assetsDir = path.join(webAppRoot, 'assets');
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
    <title>ESP32 Firmware</title>
    <style>${css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">${js}</script>
  </body>
</html>`;

const gzippedHtml = zlib.gzipSync(Buffer.from(html, 'utf8'), { level: 9 });
const header = `#pragma once
#include <Arduino.h>

namespace EspWebBundle {
static const unsigned char kWebUiHtmlGzip[] PROGMEM = {
${renderByteArray(gzippedHtml)}
};
constexpr size_t kWebUiHtmlGzipSize = ${gzippedHtml.length};
}  // namespace EspWebBundle
`;

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, header);
console.log(`Wrote ${outFile}`);
