"""Capture parser results from saved live Piaotia HTML for Node regression tests."""
import json
from pathlib import Path
from lxml import html

SOURCE = Path(__file__).resolve().parents[2] / 'piaotia-review-audit'
DEST = Path(__file__).parent / 'fixtures/piaotia_reviews.json'

def node(element):
    return {'text': ' '.join(element.text_content().split()),
            'html': (element.text or '') + ''.join(html.tostring(c, encoding='unicode') for c in element),
            'attrs': dict(element.attrib), 'select': {}}

def capture(source):
    doc = html.fromstring(source)
    result = {'select': {}}
    rows = []
    for tr in doc.xpath('//table[contains(@class,"grid")]//tr[td//a[contains(@href,"reviewshow.php?rid=")]]'):
        record = node(tr)
        record['select']['td'] = []
        for td in tr.xpath('./td'):
            cell = node(td)
            cell['select']['a[href*=reviewshow.php?rid=]'] = [node(a) for a in td.xpath('.//a[contains(@href,"reviewshow.php?rid=")]')]
            record['select']['td'].append(cell)
        rows.append(record)
    result['select']['table.grid tr:has(a[href*=reviewshow.php?rid=])'] = rows
    result['select']['a[href*=page=]'] = [node(a) for a in doc.xpath('//a[contains(@href,"page=")]')]
    posts = []
    for tr in doc.xpath('//table[contains(@class,"grid")]//tr[td[@width="20%"]//img[contains(@class,"avatar")]]'):
        record = node(tr)
        for selector, xp in {
            'td[width=20%] strong': './td[@width="20%"]//strong',
            'img.avatar': './/img[contains(@class,"avatar")]',
            'td[width=80%] > div': './td[@width="80%"] /div',
        }.items():
            record['select'][selector] = [node(e) for e in tr.xpath(xp)]
        posts.append(record)
    result['select']['table.grid tr:has(img.avatar)'] = posts
    return result

if __name__ == '__main__':
    import argparse
    import subprocess
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, default=SOURCE)
    parser.add_argument('--url', help='Fetch and parse one live page for the Node harness')
    args = parser.parse_args()
    if args.url:
        response = subprocess.run(['curl', '-fsSL', '--max-time', '35', '-A', 'Mozilla/5.0', args.url], capture_output=True, check=True)
        print(json.dumps(capture(response.stdout.decode('gbk')), ensure_ascii=False))
    else:
        fixtures = {}
        for name in ['reviews-5791', 'reviews-7095', 'post-5791', 'post-7095']:
            fixtures[name] = capture((args.source / (name + '.html')).read_text())
        DEST.write_text(json.dumps(fixtures, ensure_ascii=False, indent=2) + '\n')
        print('Captured live review list and full-post fixtures:', DEST)
