#!/usr/bin/env bash
# Usage: scripts/verify-pass/land.sh <batch.json> "<commit title>"
# verify → engine-check → apply → report → npm run check (exit-coded, no
# pipe) → changelog → commit. Any failure restores the working tree.
set -u
cd "$(git rev-parse --show-toplevel)"
batch=$1; title=$2
d=scripts/verify-pass
changes=$(mktemp)
fail() { echo "✗ $1 — restoring working tree"; git checkout -- data docs; exit 1; }
node $d/verify.mjs "$batch" || fail verify
node $d/engine-check.mjs "$batch" || fail engine-check
node $d/apply.mjs "$batch" "$changes" || fail apply
npm run report >/dev/null || fail report
npm run check >/dev/null 2>&1; rc=$?
[ $rc -eq 0 ] || { npm run check 2>&1 | tail -30; fail "npm run check (exit $rc)"; }
node $d/changelog.mjs "$changes" "$title" || fail changelog
npm run check >/dev/null 2>&1 || fail "npm run check after changelog"
n=$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1])).length)' "$changes")
body=$(node -e 'const b=JSON.parse(require("fs").readFileSync(process.argv[1]));for(const[k,v]of Object.entries(b.perCourse||{}))console.log(`- ${k}: ${v}`)' "$batch")
git add data docs
git commit -q -m "UK verification pass: $title ($n rows)" -m "$body" \
  -m "Co-Authored-By: ${COAUTHOR:-Claude <noreply@anthropic.com>}" ${SESSION_TRAILER:+-m "$SESSION_TRAILER"} || fail commit
git log --oneline -1
