const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Selector results captured from the live GBK page using an HTML parser.
const fixture = require('./fixtures/piaotia_detail_10475.json');
const extension = path.resolve(__dirname, '../piaotia-com');
const detailSource = process.env.PIAOTIA_DETAIL_SOURCE || path.join(extension, 'src/detail.js');

function runDetail(formatHtml) {
    const selectors = structuredClone(fixture.selectors);
    const cell = selectors['#centerm td[width=80%][valign=top]'][0];
    cell.html = formatHtml(cell.html);
    function collection(items) {
        return {
            isEmpty: () => items.length === 0,
            first: () => element(items[0]),
            forEach: fn => items.forEach(item => fn(element(item))),
        };
    }
    function element(item) {
        return {
            text: () => item.text,
            html: () => item.html,
            attr: name => item.attrs[name] || '',
            select: selector => {
                assert.equal(selector, 'td');
                return collection(item.cells);
            },
        };
    }
    const calls = [];
    const context = vm.createContext({
        DOMAIN: undefined,
        fetch: url => {
            calls.push(url);
            return {
                ok: true,
                html: charset => {
                    assert.equal(charset, 'gbk');
                    return { select: selector => {
                        assert.ok(Object.hasOwn(selectors, selector), 'Unexpected selector: ' + selector);
                        return collection(selectors[selector]);
                    } };
                },
            };
        },
        Response: {
            success: data => ({ code: 0, data }),
            error: message => ({ code: 1, message }),
        },
    });
    context.load = file => vm.runInContext(
        fs.readFileSync(path.join(extension, 'src', file), 'utf8'), context,
    );
    vm.runInContext(fs.readFileSync(detailSource, 'utf8'), context);
    const result = context.execute(fixture.source);
    assert.deepEqual(calls, [fixture.source]);
    assert.equal(result.code, 0, result.message);
    assert.equal(result.data.reviews.length, 1);
    assert.equal(result.data.reviews[0].title, 'Reader reviews');
    assert.equal(result.data.reviews[0].script, 'reviews.js');
    assert.equal(result.data.reviews[0].input, 'https://www.piaotia.com/modules/article/reviews.php?aid=10475&type=all');
    assert.equal(result.data.name, '这号有毒');
    assert.equal(result.data.author, '幼儿园一把手');
    assert.match(result.data.cover, /10475s\.jpg$/);
    assert.match(result.data.description, /在《天尘》创建小号没多久的路浔/);
    assert.match(result.data.description, /找管理员验证后进v群/); // Last paragraph, not just first line.
    assert.match(result.data.description, /<br\s*\/?\s*>/i);
    assert.doesNotMatch(result.data.description, /最新章节|内容简介|<\/div>|<\/td>/);
}

runDetail(html => html);
console.log('PASS: live detail markup retains the complete introduction');
// Jsoup pretty-printing may insert whitespace between inline and block tags.
runDetail(html => html.replace(/<\/span><br>/g, '</span>\n <br>'));
console.log('PASS: parser whitespace after the introduction label');
runDetail(html => html.replace(/<br>/g, '<br />\n'));
console.log('PASS: self-closing line breaks');
