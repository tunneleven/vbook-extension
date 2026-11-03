const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const fixtures = require('./fixtures/piaotia_reviews.json');
const root = process.env.PIAOTIA_SOURCE_DIR || path.resolve(__dirname, '../piaotia-com/src');
function wrap(items) {
    return {
        size: () => items.length, isEmpty: () => !items.length,
        get: i => element(items[i]), first: () => element(items[0]),
        last: () => element(items[items.length - 1]),
        forEach: fn => items.forEach(item => fn(element(item))),
        text: () => items.map(x => x.text).join(' '),
        html: () => items.map(x => x.html).join(''),
        attr: key => items.length ? items[0].attrs[key] || '' : '',
    };
}
function element(item) {
    return {
        text: () => item.text, html: () => item.html,
        attr: key => item.attrs[key] || '',
        select: selector => {
            assert.ok(Object.hasOwn(item.select, selector), 'Uncaptured selector: ' + selector);
            return wrap(item.select[selector]);
        },
    };
}
function run(input, page, options = {}) {
    const calls = [];
    const listing = structuredClone(fixtures[options.list || 'reviews-5791']);
    if (options.empty) listing.select['table.grid tr:has(a[href*=reviewshow.php?rid=])'] = [];
    if (options.spam) {
        const row = listing.select['table.grid tr:has(a[href*=reviewshow.php?rid=])'][0];
        row.select.td[0].select['a[href*=reviewshow.php?rid=]'][0].text = 'External service LINE xm594 外送茶';
    }
    const ctx = vm.createContext({
        DOMAIN: options.domain,
        fetch: url => {
            calls.push(url);
            const isPost = url.includes('reviewshow.php');
            if (options.live) {
                const output = require('node:child_process').execFileSync('python3', [path.join(__dirname, 'piaotia_review_fixtures.py'), '--url', url], {encoding: 'utf8', timeout: 45000, maxBuffer: 4 * 1024 * 1024});
                const document = JSON.parse(output);
                return {ok: true, html: charset => {
                    assert.equal(charset, 'gbk');
                    return element(document);
                }};
            }
            return {
                ok: !(options.failure && isPost), status: 503,
                html: charset => {
                    assert.equal(charset, 'gbk');
                    return element(isPost ? fixtures['post-5791'] : listing);
                },
            };
        },
        Response: {success: (data, next) => ({code: 0, data, next}), error: message => ({code: 1, message})},
    });
    ctx.load = file => vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), ctx);
    vm.runInContext(fs.readFileSync(path.join(root, 'reviews.js'), 'utf8'), ctx);
    return {result: ctx.execute(input, page), calls};
}
const input = 'https://www.piaotia.com/modules/article/reviews.php?aid=5791&type=all';
let {result, calls} = run(input);
assert.equal(result.code, 0);
assert.ok(result.data.length > 0 && result.data.length <= 8);
assert.equal(result.data[0].name, '不說不說');
assert.match(result.data[0].content, /常常/);
assert.match(result.data[0].content, /觀棋/); // Full review, including final paragraph.
assert.match(result.data[0].description, /2019-12-11/);
assert.doesNotMatch(result.data[0].content, /<script|<a\b|<img|加入日期/);
assert.ok(result.next);
assert.ok(calls.length <= 9, 'Bounded thread fetches');
assert.equal(calls.filter(u => u.includes('rid=')).length, result.data.length);
const names = result.data.map(x => x.content.split('<br>')[0]);
assert.ok(new Set(names).size > 1, 'Distinct list titles retained');
({result, calls} = run(input, '1:8'));
assert.equal(result.code, 0);
assert.match(calls[0], /page=1/);
({result} = run(input, '', {empty: true}));
assert.equal(result.data.length, 0);
assert.equal(result.next, '2:0', 'Empty filtered pages still permit pagination');
({result} = run(input, '', {failure: true}));
assert.equal(result.code, 1, 'Thread failures must not silently discard reviews');
({result} = run(input, '1'));
assert.equal(result.code, 0, 'Accept host-provided initial page number');
({result} = run(input, 'bad-token'));
assert.equal(result.code, 1);
({result, calls} = run(input, '', {domain: 'https://mirror.example', spam: true}));
assert.equal(result.code, 0);
assert.ok(calls.every(u => u.startsWith('https://mirror.example/')));
assert.doesNotMatch(result.data.map(x => x.content).join(''), /External service/);
({result} = run(input, '', {list: 'reviews-7095'}));
assert.equal(result.code, 0);
assert.equal(result.next, '', 'Last list page terminates');
assert.ok(result.data.length < 9, 'Referral spam and duplicate titles removed');
console.log('PASS: full native review fields, bounded pagination, deduplication, advertising filter, errors, domain override and final page');
if (process.env.PIAOTIA_LIVE === '1') {
    const live = run(input, '', {live: true});
    assert.equal(live.result.code, 0, live.result.message);
    assert.ok(live.result.data.some(item => item.content.includes('觀棋')));
    console.log('LIVE Fei Tian:', JSON.stringify({reviews: live.result.data.length, next: live.result.next, requests: live.calls.length}));
    const empty = run(input.replace('5791', '10475'), '', {live: true});
    assert.equal(empty.result.code, 0, empty.result.message);
    assert.equal(empty.result.data.length, 0);
    assert.equal(empty.result.next, '');
    console.log('LIVE empty book: empty list, no next page, no thread requests');
}
