load('config.js');
function execute(url) {
    url = normalizeUrl(url);
    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");

    let headings = doc.select("h1");
    if (headings.isEmpty()) return Response.error("Chapter title not found");
    let heading = headings.first();
    heading.select("a").forEach(function (el) { el.remove(); });
    let title = heading.text();

    doc.select("script, style, #guild, #shop, h1, .toplink, table, center, .bottomlink, #Commenddiv, #feit2").forEach(function (el) { el.remove(); });
    let bodies = doc.select("body");
    if (bodies.isEmpty()) return Response.error("Chapter content not found");
    let content = bodies.first().html();
    if (!content || bodies.first().text().length < 20) return Response.error("Chapter content is empty");

    return Response.success(content, title);
}
