load('config.js');
load('gbk.js');

function execute(query, page) {
    query = String(query || "");
    page = String(page || "1");

    if (query.indexOf("/") === 0 || query.indexOf("http") === 0) {
        // Piaotia has no completed ranking endpoint; keep all-time rank order and filter status.
        let completedOnly = isCompletedPath(query);
        let base = query.indexOf("http") === 0 ? normalizeUrl(query) : BASE_URL + query;
        let url = base.indexOf("{page}") !== -1 ? base.replace("{page}", page) : base;
        let response = fetch(url);
        if (!response.ok) return Response.error("HTTP " + response.status);
        let doc = response.html("gbk");
        let rows = doc.select("#centerm table.grid tr:has(td a[href*=bookinfo])");
        let items = [];
        rows.forEach(function (row) {
            let cells = row.select("td");
            if (cells.size() < 6) return;
            let link = cells.get(0).select("a");
            if (link.isEmpty()) return;
            let status = cells.get(5).text();
            if (completedOnly && !isCompletedStatus(status)) return;
            let bookUrl = absoluteUrl(url, link.first().attr("href"));
            items.push({
                name: link.first().text(),
                cover: bookCoverUrl(bookUrl),
                link: bookUrl,
                description: cells.get(1).text() + " · " + cells.get(2).text(),
                tag: status
            });
        });
        let nextPage = doc.select("#pagelink a.next").isEmpty() ? "" : (parseInt(page, 10) + 1).toString();
        return Response.success(items, nextPage);
    }

    if (!query) return Response.success([], "");
    let searchUrl = BASE_URL + "/modules/article/search.php";
    let searchResponse = fetch(searchUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "searchtype=articlename&searchkey=" + gbkEncode(query)
    });
    if (!searchResponse.ok) return Response.error("HTTP " + searchResponse.status);
    let searchDoc = searchResponse.html("gbk");
    let searchBody = searchDoc.select("body");
    let searchText = searchBody.isEmpty() ? "" : searchBody.first().text();
    if (/(?:Fatal error|Uncaught (?:exception|error)|RedisException|Stack trace:)/i.test(searchText)) {
        return Response.error("Source error: " + searchText.substring(0, 180));
    }
    let results = [];
    searchDoc.select("#centerm table.grid tr:has(td a[href*=bookinfo])").forEach(function (row) {
        let links = row.select("h2 a[href*=piaotia.com/bookinfo]");
        if (links.isEmpty()) links = row.select("td a[href*=bookinfo]");
        if (!links.isEmpty()) {
            let link = links.first();
            let href = link.attr("href");
            let cells = row.select("td");
            let bookUrl = normalizeUrl(href);
            results.push({
                name: link.text(),
                cover: bookCoverUrl(bookUrl),
                link: bookUrl,
                description: cells.size() > 1 ? cells.get(1).text() : "",
                tag: ""
            });
        }
    });
    return Response.success(results, "");
}
