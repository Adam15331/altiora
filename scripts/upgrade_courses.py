#!/usr/bin/env python3
"""
Transform courseRequirements.js:
  Upgrade 1 – Add apContext to all US courses (after admissionTests line)
  Upgrade 2 – Add ibHL / ibHLNote inside grades object for ALL courses
"""

import re
import sys

# ─── AP CONTEXT DATA ─────────────────────────────────────────────

# minCompetitiveAPs / recommendedAPs by spec tier label
AP_TIERS = {
    'top10':     {'min': 7, 'rec': 10},
    'top50':     {'min': 5, 'rec': 8},
    'national':  {'min': 4, 'rec': 6},
}

US_UNI_TIER = {
    # World Top 10
    'MIT':                             'top10',
    'Stanford University':             'top10',
    'Harvard University':              'top10',
    'Princeton University':            'top10',
    'Yale University':                 'top10',
    'Columbia University':             'top10',
    'Caltech':                         'top10',
    # World Top 50
    'Northwestern University':         'top50',
    'Duke University':                 'top50',
    'Johns Hopkins University':        'top50',
    'Cornell University':              'top50',
    'Dartmouth College':               'top50',
    'Brown University':                'top50',
    'Rice University':                 'top50',
    'Vanderbilt University':           'top50',
    'University of Notre Dame':        'top50',
    'Washington University in St. Louis': 'top50',
    'Emory University':                'top50',
    'Carnegie Mellon University':      'top50',
    'Georgetown University':           'top50',
    # Strong National
    'UCLA':                            'national',
    'UC Berkeley':                     'national',
    'University of Michigan':          'national',
    'New York University':             'national',
    'University of Southern California': 'national',
    'Georgia Tech':                    'national',
    'University of Virginia':          'national',
    'University of Illinois Urbana-Champaign': 'national',
    'Purdue University':               'national',
    'UNC Chapel Hill':                 'national',
    'University of Pennsylvania':      'national',
}

AP_SUBJECTS = {
    'cs':         ['AP Calculus BC', 'AP Physics C: Mechanics', 'AP Computer Science A'],
    'engineering':['AP Calculus BC', 'AP Physics C: Mechanics', 'AP Computer Science A'],
    'medicine':   ['AP Biology', 'AP Chemistry', 'AP Calculus BC'],
    'sciences':   ['AP Biology', 'AP Chemistry', 'AP Calculus BC'],
    'economics':  ['AP Calculus AB', 'AP Statistics', 'AP Microeconomics', 'AP Macroeconomics'],
    'business':   ['AP Calculus AB', 'AP Statistics', 'AP Microeconomics', 'AP Macroeconomics'],
    'law':        ['AP English Language', 'AP US History', 'AP Government'],
    'mathematics':['AP Calculus BC', 'AP Statistics'],
}

def build_ap_context(university, category):
    tier_key = US_UNI_TIER.get(university, 'national')
    tier = AP_TIERS[tier_key]
    subs = AP_SUBJECTS.get(category, AP_SUBJECTS['cs'])
    subs_js = ', '.join(f'"{s}"' for s in subs)
    return (
        f'    apContext: {{\n'
        f'      minCompetitiveAPs: {tier["min"]}, recommendedAPs: {tier["rec"]},\n'
        f'      recommendedSubjects: [{subs_js}],\n'
        f'      note: "US admissions is holistic — no hard subject requirements.",\n'
        f'    }},\n'
    )

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
    us_ap_count    = 0
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

        # ── Upgrade 1: insert apContext after admissionTests line ─
        if cur_country == 'US':
            m_at = re.match(r'(\s+admissionTests:\s*\[.*\],)', stripped)
            if m_at:
                ctx = build_ap_context(cur_university, cur_category)
                out.append(ctx)
                us_ap_count += 1

    with open(dst_path, 'w', encoding='utf-8') as f:
        f.writelines(out)

    print(f'US courses updated with apContext : {us_ap_count}')
    print(f'Courses updated with ibHL data    : {ib_total}')
    print(f'Courses where ibHL is non-empty   : {ib_nonempty}')
    print(f'Courses where ibHL is empty       : {ib_total - ib_nonempty}')

if __name__ == '__main__':
    src = '/home/user/altiora/data/courseRequirements.js'
    dst = '/home/user/altiora/data/courseRequirements.js.new'
    transform(src, dst)
    print('Written to', dst)
