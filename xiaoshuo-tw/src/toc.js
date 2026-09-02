load('config.js');

function execute(url) {
    url = normalizeUrl(url);
    url = absoluteUrl(url);
    url = ensureBookUrl(url);
    if (url === "") return Response.error("Missing book URL");

    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");
    let links = doc.select("#list-chapterAll dd a");
    if (links.isEmpty()) return Response.error("Chapter list not found");

    let chapters = [];
    links.forEach(function (el) {
        let href = el.attr("href");
        let name = el.text();
        if (href !== "" && name !== "") {
            chapters.push({
                name: name,
                url: absoluteUrl(href),
                description: "",
                lock: false,
                pay: false
            });
        }
    });

    if (chapters.length === 0) return Response.error("Chapter list is empty");
    return Response.success(chapters, "");
}
