import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { compile } from 'tailwindcss';

const require = createRequire(import.meta.url);
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = fs.readFileSync(path.join(project, 'src/input.css'), 'utf8');
const html = fs.readFileSync(path.join(project, 'index.html'), 'utf8');
const js = fs.readFileSync(path.join(project, 'assets/site.js'), 'utf8');
const candidates = new Set();
for (const file of [html, js]) {
  for (const match of file.matchAll(/\bclass(?:Name)?\s*=\s*["']([^"']+)["']/g)) {
    for (const candidate of match[1].split(/\s+/)) if (candidate && /^[\w:!./\[\]%,()#'\-]+$/.test(candidate)) candidates.add(candidate);
  }
}
const result = await compile(source, {
  loadStylesheet: async (id) => {
    const target = id === 'tailwindcss' ? 'tailwindcss/index.css' : id;
    const resolved = require.resolve(target);
    return { content: fs.readFileSync(resolved, 'utf8'), base: path.dirname(resolved) };
  }
});
const css = result.build([...candidates]);
fs.writeFileSync(path.join(project, 'assets/site.css'), css);
console.log(`Compiled ${candidates.size} Tailwind candidates to ${Buffer.byteLength(css)} bytes.`);
