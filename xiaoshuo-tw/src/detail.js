load('config.js');

function execute(url) {
    url = normalizeUrl(url);
    url = absoluteUrl(url);
    url = ensureBookUrl(url);
    if (url === "") return Response.error("Missing detail URL");

    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");

    let name = firstText(doc, "h1.bookTitle");
    if (name === "") return Response.error("Book title not found");

    let category = "";
    let categoryLinks = doc.select("p.booktag a.red");
    if (!categoryLinks.isEmpty()) category = categoryLinks.first().text();

    let info = firstText(doc, "p.booktag");
    let author = info;
    if (category !== "") author = author.replace(category, "");
    author = author.replace(/字數：\S+/g, "");
    author = author.replace(/閱讀數：\S+/g, "");
    author = author.replace(/連載中|已完結|已完成|完結/g, "");
    author = author.replace(/^\s+|\s+$/g, "");

    let status = "";
    let statusItems = doc.select("p.booktag span.blue");
    if (!statusItems.isEmpty()) status = statusItems.last().text();

    let intro = doc.select("#bookIntro");
    let description = "";
    if (!intro.isEmpty()) {
        intro.first().select("img").forEach(function (el) { el.remove(); });
        description = intro.first().html();
    }

    let detailInfo = info;
    let detailItems = doc.select("p.booktag");
    if (!detailItems.isEmpty()) detailInfo = detailItems.first().html();

    let tags = [];
    if (!categoryLinks.isEmpty()) {
        tags.push({
            title: category,
            input: absoluteUrl(categoryLinks.first().attr("href")),
            script: "search.js"
        });
    }

    return Response.success({
        name: name,
        author: author,
        cover: absoluteUrl(firstAttr(doc, ".col-md-2 img, #bookIntro img", "src")),
        description: description,
        detail: detailInfo,
        url: url,
        type: "novel",
        format: "novel",
        ongoing: status.indexOf("完") === -1,
        nsfw: false,
        locale: "zh-TW",
        tags: tags,
        genres: [],
        suggests: [],
        reviews: [],
        comments: []
    });
}
