load('config.js');
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
            items.push({
                name: link.first().text(),
                cover: "",
                link: absoluteUrl(url, link.first().attr("href")),
                description: cells.get(1).text() + " · " + cells.get(2).text(),
                tag: status
            });
        });
        let nextPage = doc.select("#pagelink a.next").isEmpty() ? "" : (parseInt(page, 10) + 1).toString();
        return Response.success(items, nextPage);
    }

    if (!query) return Response.success([], "");
    let searchUrl = "https://cn.bing.com/search?q=" + encodeURIComponent("site:www.piaotia.com/bookinfo/ " + query);
    let searchResponse = fetch(searchUrl, { headers: { "User-Agent": UserAgent.chrome() } });
    if (!searchResponse.ok) return Response.error("HTTP " + searchResponse.status);
    let searchDoc = searchResponse.html();
    let results = [];
    searchDoc.select("li.b_algo").forEach(function (row) {
        let links = row.select("h2 a[href*=piaotia.com/bookinfo]");
        if (!links.isEmpty()) {
            let link = links.first();
            let href = link.attr("href");
            let captions = row.select(".b_caption p");
            results.push({
                name: link.text(),
                cover: "",
                link: normalizeUrl(href),
                description: captions.isEmpty() ? "" : captions.first().text(),
                tag: ""
            });
        }
    });
    return Response.success(results, "");
}
