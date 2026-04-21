import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dist = join(dirname(fileURLToPath(import.meta.url)), 'dist');

function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.js') && !f.includes('.test.')) fixFile(p);
  }
}

function fixFile(fp) {
  let src = readFileSync(fp, 'utf8');
  const orig = src;

  // fix relative imports missing .js extension (both quote styles)
  src = src.replace(/from (['"])(\.{1,2}\/[^'"]+)\1/g, (m, q, p) => {
    if (p.endsWith('.js') || p.endsWith('.json')) return m;
    // check if it's a directory
    try {
      const abs = join(dirname(fp), p);
      if (statSync(abs).isDirectory()) return `from ${q}${p}/index.js${q}`;
    } catch {}
    return `from ${q}${p}.js${q}`;
  });

  if (src !== orig) writeFileSync(fp, src);
}

walk(dist);
console.log('ESM imports fixed.');
