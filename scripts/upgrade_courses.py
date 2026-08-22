#!/usr/bin/env python3
"""
Transform courseRequirements.js:
  Upgrade 2 – Add ibHL / ibHLNote inside grades object for ALL courses
"""

import re
import sys

# ─── IB HL DATA ──────────────────────────────────────────────────

OXBRIDGE_IMPERIAL = {
    'University of Oxford', 'University of Cambridge', 'Imperial College London'
}
LSE_OXBRIDGE = {
    'University of Oxford', 'University of Cambridge', 'London School of Economics'
}
CAMBRIDGE = {'University of Cambridge'}

# By category and region, return (ibHL_list, ibHLNote_or_null)
def ib_hl_for(country, university, category):
    is_us    = (country == 'US')
    is_uk    = (country == 'UK')
    is_ca    = (country == 'CA')
    is_nl    = (country == 'NL')
    is_sg_hk = (country in ('SG', 'HK'))
    is_oxi   = (university in OXBRIDGE_IMPERIAL)
    is_cam   = (university in CAMBRIDGE)
    is_lse   = (university == 'London School of Economics')

    # US: holistic, no HL requirements published
    if is_us:
        return [], None

    if category == 'engineering':
        hl = ['Mathematics_Advanced', 'Physics']
        if is_oxi:
            note = '776 at HL'
        elif is_uk or is_nl:
            note = '665 at HL'
        elif is_ca or is_sg_hk:
            note = '655 at HL'
        else:
            note = None
        return hl, note

    if category == 'medicine':
        hl = ['Chemistry', 'Biology']
        if is_cam:
            hl = ['Chemistry', 'Biology', 'Mathematics_Standard']
        if is_oxi:
            note = '776 at HL'
        elif is_uk or is_nl:
            note = '666 at HL'
        elif is_ca or is_sg_hk:
            note = '655 at HL'
        else:
            note = None
        return hl, note

    if category == 'cs':
        hl = ['Mathematics_Advanced']
        if is_oxi:
            note = '776 at HL'
        else:
            note = None
        return hl, note

    if category in ('economics', 'business'):
        hl = ['Mathematics_Standard']
        if university in LSE_OXBRIDGE:
            note = '766 at HL'
        else:
            note = None
        return hl, note

    if category == 'law':
        return [], None

    if category == 'sciences':
        hl = ['Mathematics_Advanced', 'Chemistry']
        if is_cam:
            note = '776 at HL'
        elif is_uk or is_nl:
            note = '665 at HL'
        elif is_ca or is_sg_hk:
            note = '655 at HL'
        else:
            note = None
        return hl, note

    if category == 'mathematics':
        hl = ['Mathematics_Advanced']
        if university in {'University of Oxford', 'University of Cambridge'}:
            note = '776 at HL'
        else:
            note = None
        return hl, note

    if category == 'architecture':
        return ['Mathematics_Standard'], None

    if category == 'psychology':
        return [], None

    # fallback
    return [], None

def format_ib_hl(hl_list, hl_note):
    if hl_list:
        items = ', '.join(f'"{t}"' for t in hl_list)
        hl_str = f'[{items}]'
    else:
        hl_str = '[]'
    note_str = f'"{hl_note}"' if hl_note else 'null'
    return hl_str, note_str

# ─── MAIN TRANSFORMATION ─────────────────────────────────────────

def transform(src_path, dst_path):
    with open(src_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    out = []
    # Current course context
    cur_country    = None
    cur_university = None
    cur_category   = None
    # Stats
    ib_total       = 0
    ib_nonempty    = 0

    for i, line in enumerate(lines):
        stripped = line.rstrip()

        # Detect new course: line with id: "..."
        # Pattern: starts with spaces, then id: "..."
        m_id = re.match(r'\s+id:\s*"([^"]+)"', stripped)
        if m_id:
            cur_country    = None
            cur_university = None
            cur_category   = None

        # Detect university/country/category line
        m_uni = re.search(r'university:\s*"([^"]+)"', stripped)
        if m_uni:
            cur_university = m_uni.group(1)
        m_country = re.search(r'country:\s*"([^"]+)"', stripped)
        if m_country:
            cur_country = m_country.group(1)
        m_cat = re.search(r'category:\s*"([^"]+)"', stripped)
        if m_cat:
            cur_category = m_cat.group(1)

        # ── Upgrade 2: modify grades line ────────────────────────
        m_grades = re.match(r'(\s+grades:\s*\{.*hkDse:\s*null)(\s*\},)', stripped)
        if m_grades:
            hl, note = ib_hl_for(cur_country, cur_university, cur_category)
            hl_str, note_str = format_ib_hl(hl, note)
            indent = re.match(r'(\s+)', line).group(1)
            new_line = (
                m_grades.group(1).rstrip()
                + f', ibHL: {hl_str}, ibHLNote: {note_str}'
                + m_grades.group(2)
                + '\n'
            )
            out.append(new_line)
            ib_total += 1
            if hl:
                ib_nonempty += 1
            continue

        out.append(line)


    with open(dst_path, 'w', encoding='utf-8') as f:
        f.writelines(out)

    print(f'Courses updated with ibHL data    : {ib_total}')
    print(f'Courses where ibHL is non-empty   : {ib_nonempty}')
    print(f'Courses where ibHL is empty       : {ib_total - ib_nonempty}')

if __name__ == '__main__':
    src = '/home/user/altiora/data/courseRequirements.js'
    dst = '/home/user/altiora/data/courseRequirements.js.new'
    transform(src, dst)
    print('Written to', dst)
