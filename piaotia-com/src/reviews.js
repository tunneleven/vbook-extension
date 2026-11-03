load('config.js');

function reviewAdvertising(text) {
    return /(?:外送茶|外約|外约|約炮|约炮|舒壓|舒压|賴\s*[a-z0-9]{4}|瀨\s*\d{4}|line\s*[:：@]|fromuid\s*=|fromu\s*=|https?:\/\/)/i.test(String(text));
}

function reviewHtml(value) {
    // Keep paragraph breaks and text, never executable HTML or external links.
    return String(value).replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
        .replace(/<\/(?:p|div)>/gi, '<br>')
        .replace(/<(?!br\s*\/?\s*>)[^>]*>/gi, '')
        .replace(/<br\s*\/?>/gi, '<br>').trim();
}

function execute(input, page) {
    let value = String(page || '1:0');
    if (/^\d+$/.test(value)) value += ':0';
    let token = value.match(/^(\d+):(\d+)$/);
    if (!token || +token[1] < 1) return Response.error('Invalid review page');
    let sourcePage = +token[1];
    let offset = +token[2];
    let url = normalizeUrl(input);
    if (!/\/modules\/article\/reviews\.php\?aid=\d+&type=all$/.test(url)) {
        return Response.error('Invalid review source');
    }
    let response = fetch(url + '&page=' + sourcePage);
    if (!response.ok) return Response.error('HTTP ' + response.status);
    let doc = response.html('gbk');
    let entries = [];
    let seen = {};
    doc.select('table.grid tr:has(a[href*=reviewshow.php?rid=])').forEach(function (row) {
        let cells = row.select('td');
        if (cells.size() < 4) return;
        let link = cells.get(0).select('a[href*=reviewshow.php?rid=]').first();
        let title = link.text().trim();
        let author = cells.get(2).text().split('/')[0].trim();
        let key = title + '\n' + author;
        if (!title || reviewAdvertising(title) || seen[key]) return;
        seen[key] = true;
        entries.push({title: title, url: absoluteUrl(url, link.attr('href'))});
    });
    let nextSourcePage = '';
    doc.select('a[href*=page=]').forEach(function (link) {
        let match = link.attr('href').match(/[?&]page=(\d+)/);
        if (match && +match[1] === sourcePage + 1) nextSourcePage = (sourcePage + 1) + ':0';
    });
    let items = [];
    let end = Math.min(offset + 8, entries.length);
    for (let i = offset; i < end; i++) {
        let entry = entries[i];
        let thread = fetch(entry.url);
        if (!thread.ok) return Response.error('Review HTTP ' + thread.status);
        let posts = thread.html('gbk').select('table.grid tr:has(img.avatar)');
        if (posts.isEmpty()) return Response.error('Review content not found');
        // A review is the opening post; discussion replies are not separate reviews.
        let post = posts.first();
        let blocks = post.select('td[width=80%] > div');
        if (blocks.size() < 3) return Response.error('Review content is incomplete');
        let content = blocks.get(2).html();
        if (reviewAdvertising(blocks.get(2).text())) continue;
        let date = blocks.get(1).text().match(/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/);
        items.push({
            name: post.select('td[width=20%] strong').text(),
            avatar: absoluteUrl(entry.url, post.select('img.avatar').attr('src')),
            content: reviewHtml(entry.title) + '<br><br>' + reviewHtml(content),
            description: date ? date[0] : '',
            replies: []
        });
    }
    return Response.success(items, end < entries.length ? sourcePage + ':' + end : nextSourcePage);
}
