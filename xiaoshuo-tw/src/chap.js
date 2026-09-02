load('config.js');

function execute(url) {
    url = normalizeUrl(url);
    url = absoluteUrl(url);
    if (url === "") return Response.error("Missing chapter URL");

    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");
    let content = doc.select("#htmlContent");
    if (content.isEmpty()) return Response.error("Chapter content not found");

    content.first().select("script, style, iframe, noscript").forEach(function (el) { el.remove(); });
    content.first().select("div").forEach(function (el) {
        if (el.text().replace(/^\s+|\s+$/g, "") === "" && el.html().replace(/^\s+|\s+$/g, "") === "") el.remove();
    });

    let html = content.first().html();
    if (html.replace(/^\s+|\s+$/g, "") === "") return Response.error("Chapter content is empty");
    let title = firstText(doc, "h1.readTitle").replace(/^\s+|\s+$/g, "");
    return Response.success(html, title);
}
