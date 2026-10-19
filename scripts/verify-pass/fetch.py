#!/usr/bin/env python3
"""Fetch an official page for the verification pass.

Usage: python3 -I scripts/verify-pass/fetch.py <url> [<url> ...]

Saves to $VERIFY_PAGES (default ./pages):
  <sha1(url)[:10]>.html  the raw response (or .pdf)
  <sha1(url)[:10]>.txt   "URL: …" and "STATUS: …" headers, a blank line,
                         then one block-level element's text per line
                         (PDFs go through pdftotext -layout).
verify.mjs reads the .txt files, so a quote is checked against the exact
page it cites.
"""
import hashlib, html, os, re, subprocess, sys
from html.parser import HTMLParser

PAGES = os.environ.get('VERIFY_PAGES', 'pages')
UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36'
BLOCK = {'p', 'div', 'li', 'tr', 'td', 'th', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'section', 'article',
         'header', 'footer', 'dt', 'dd', 'br', 'table', 'ul', 'ol', 'blockquote', 'summary', 'details', 'main'}
SKIP = {'script', 'style', 'noscript', 'svg', 'template'}


class Blocks(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.lines, self.cur, self.skip = [], [], 0

    def flush(self):
        t = re.sub(r'\s+', ' ', ''.join(self.cur)).strip()
        if t:
            self.lines.append(t)
        self.cur = []

    def handle_starttag(self, tag, attrs):
        if tag in SKIP:
            self.skip += 1
        elif tag in BLOCK:
            self.flush()

    def handle_endtag(self, tag):
        if tag in SKIP:
            self.skip = max(0, self.skip - 1)
        elif tag in BLOCK:
            self.flush()

    def handle_data(self, data):
        if not self.skip:
            self.cur.append(data)


def key(url):
    return hashlib.sha1(url.encode()).hexdigest()[:10]


def fetch(url):
    os.makedirs(PAGES, exist_ok=True)
    k = key(url)
    raw = os.path.join(PAGES, k + '.raw')
    status = subprocess.run(['curl', '-sS', '-L', '--max-time', '60', '-A', UA, '-o', raw, '-w', '%{http_code}', url],
                            capture_output=True, text=True).stdout.strip() or '000'
    with open(raw, 'rb') as f:
        body = f.read() if os.path.exists(raw) else b''
    if body[:5] == b'%PDF-':
        os.replace(raw, os.path.join(PAGES, k + '.pdf'))
        text = subprocess.run(['pdftotext', '-layout', os.path.join(PAGES, k + '.pdf'), '-'],
                              capture_output=True, text=True).stdout
        lines = [re.sub(r'\s+', ' ', l).strip() for l in text.splitlines()]
        lines = [l for l in lines if l]
    else:
        os.replace(raw, os.path.join(PAGES, k + '.html'))
        p = Blocks()
        p.feed(body.decode('utf-8', 'replace'))
        p.flush()
        lines = [html.unescape(l) for l in p.lines]
    with open(os.path.join(PAGES, k + '.txt'), 'w') as f:
        f.write(f'URL: {url}\nSTATUS: {status}\n\n' + '\n'.join(lines) + '\n')
    print(f'{status} {k} {len(lines):5d} lines  {url}')


if __name__ == '__main__':
    for u in sys.argv[1:]:
        fetch(u)
