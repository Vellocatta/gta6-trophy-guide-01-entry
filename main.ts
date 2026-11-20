// Vice Ledger — the hand-in program for gta6-trophy-guide-01 (Node 22, standard library only).
//
// The guide itself lives in app/: plain static files (index.html, style.css, js/*.js and
// data/trophies.json) that any static server can serve and a desktop browser opens with the
// network off. This program copies app/ and screenshots/ from beside this file into /output
// and writes /output/dossier.json with the vendored make.fun library (vendor/makefun-frontend.ts,
// unchanged from the kit): the dossier is the screenshots plus the summary the judge reads.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Deterministic: same input files, same output bytes, every run — no clock, no randomness.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoRoot, 'screenshots'))) {
  cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

// The scorer's own caps: the dossier text is capped at 160 KiB; the rest refuse an entry
// the scorer would refuse (more than 4 screenshots or one over 256 KiB; more than 993
// files and directories in app/ or 48 MiB of app files — app/ counts beside /output's
// own 1000-entry cap, its screenshots/ and dossier.json).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
