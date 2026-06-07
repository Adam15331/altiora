#!/usr/bin/env python3
"""
Remove all Netherlands/VWO content from courseRequirements.js:
  1. Delete entire course objects where country is "NL"
  2. Remove the vwo field from every remaining grades line
"""
import re, sys

def transform(src, dst):
    with open(src, encoding='utf-8') as f:
        content = f.read()

    # ── Step 1: remove NL course objects ─────────────────────────
    # Each course is { ... }, (the outer braces of the array element).
    # We split on top-level course boundaries then filter.
    # The file structure: const courses = [\n  { ... },\n  { ... },\n  ...
    # Strategy: split content into course-object blobs using the
    # two-space-indented opening brace that starts each course entry.

    # Approach: accumulate lines; when we complete a top-level object
    # (depth back to 0 after opening), decide to keep or drop it.

    lines       = content.splitlines(keepends=True)
    out         = []
    in_course   = False
    depth       = 0
    cur_block   = []
    is_nl       = False
    nl_removed  = 0
    kept        = 0

    for line in lines:
        stripped = line.strip()

        if not in_course:
            # Detect start of a course object: line is exactly '  {'
            if stripped == '{':
                in_course = True
                depth     = 1
                cur_block = [line]
                is_nl     = False
            else:
                out.append(line)
            continue

        # Inside a course object
        cur_block.append(line)
        depth += stripped.count('{') - stripped.count('}')

        # Check for NL country tag
        if 'country: "NL"' in line:
            is_nl = True

        # When depth returns to 0, the object is complete
        if depth == 0:
            in_course = False
            if is_nl:
                nl_removed += 1
            else:
                out.extend(cur_block)
                kept += 1
            cur_block = []
            is_nl     = False

    result = ''.join(out)

    # ── Step 2: remove ", vwo: null" from every grades line ───────
    # Pattern: ", vwo: null" anywhere in a grades: { ... } line
    result, vwo_subs = re.subn(r',\s*vwo: null', '', result)

    with open(dst, 'w', encoding='utf-8') as f:
        f.write(result)

    print(f'NL courses removed  : {nl_removed}')
    print(f'Courses kept        : {kept}')
    print(f'vwo fields removed  : {vwo_subs}')
    print(f'Written to {dst}')

if __name__ == '__main__':
    src = '/home/user/altiora/data/courseRequirements.js'
    dst = '/home/user/altiora/data/courseRequirements.js.new'
    transform(src, dst)
