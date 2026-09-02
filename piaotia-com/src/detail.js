load('config.js');
function execute(url) {
    url = normalizeUrl(url);
    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");

    let titleElements = doc.select("#centerm h1");
    if (titleElements.isEmpty()) return Response.error("Book title not found");

    let coverElements = doc.select("#centerm img[src*=files/article/image]");
    let metadataTables = doc.select("#centerm table[width=100%][cellpadding=3]");
    if (metadataTables.isEmpty()) return Response.error("Book metadata not found");
    let category = "";
    let author = "";
    let updated = "";
    let status = "";
    metadataTables.first().select("td").forEach(function (cell) {
        let text = cell.text();
        if (/^类\s*别：/.test(text)) category = text.replace(/^类\s*别：\s*/, "");
        if (/^作\s*者：/.test(text)) author = text.replace(/^作\s*者：\s*/, "");
        if (text.indexOf("最后更新：") === 0) updated = text.replace(/^最后更新：\s*/, "");
        if (text.indexOf("文章状态：") === 0) status = text.replace(/^文章状态：\s*/, "");
    });
    if (!author || !category) return Response.error("Book metadata is incomplete");
    let cover = coverElements.isEmpty() ? "" : absoluteUrl(url, coverElements.first().attr("src"));

    let description = "";
    let descriptionCell = doc.select("#centerm td[width=80%][valign=top]");
    if (!descriptionCell.isEmpty()) {
        let match = descriptionCell.first().html().match(/内容简介：<\/span><br\s*\/?>\s*([\s\S]*?)<br\s*\/?>\s*<br\s*\/?>/i);
        if (match) description = match[1];
    }

    let tagInput = categoryPath(category);
    let tags = [];
    let genres = [];
    if (tagInput) {
        tags.push({ title: category, input: tagInput, script: "search.js" });
        genres.push({ title: "同类作品", input: tagInput, script: "search.js" });
    }

    return Response.success({
        name: titleElements.first().text(),
        author: author,
        cover: cover,
        description: description,
        detail: "类型：" + category + "<br>状态：" + status + "<br>最后更新：" + updated,
        url: url,
        type: "novel",
        format: "novel",
        ongoing: status.indexOf("连载") !== -1,
        nsfw: false,
        locale: "zh-CN",
        tags: tags,
        genres: genres,
        suggests: [],
        reviews: [],
        comments: []
    });
}
