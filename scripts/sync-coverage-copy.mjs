#!/usr/bin/env node
// @ts-check
// npm run sync-copy — rewrite the coverage copy (course count, countries,
// partial count) in app.html, index.html and llms.txt from the data.
import { syncCoverageCopy } from './lib/coverage-copy.mjs';
for (const s of syncCoverageCopy(true)) console.log(`${s.file}:\n  was: ${s.was}\n  now: ${s.now}`);
