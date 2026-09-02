load('config.js');

function searchDocument(query, base, language) {
    let url = base + "/novel/search?language=" + language + "&q=" + encodeURIComponent(query);
    let response = fetch(url);
    if (!response.ok) return { error: "HTTP " + response.status };
    return { doc: response.html() };
}

function htmlSearchItems(doc) {
    let items = [];
    let cells = doc.select(".novel_cell");
    cells.forEach(function (cell) {
        let titleElements = cell.select("h3");
        let links = cell.select("a");
        let name = titleElements.isEmpty() ? "" : cleanText(titleElements.first().text());
        let link = links.isEmpty() ? "" : links.first().attr("href");
        let image = cell.select("amp-img");
        let cover = image.isEmpty() ? "" : image.first().attr("src");
        let author = "";
        let description = "";

        cell.select("li").forEach(function (info) {
            let text = cleanText(info.text());
            if (/^作者[：:]/i.test(text) || /^作者：/i.test(text)) {
                author = text.replace(/^作者\s*[：:]\s*/i, "");
            } else if (/^(?:简介|簡介)[：:]/i.test(text)) {
                description = text.replace(/^(?:简介|簡介)\s*[：:]\s*/i, "");
            }
        });

        if (name !== "" && link !== "") {
            items.push({
                name: name,
                cover: assetUrl(cover),
                link: siteUrl(link),
                description: description,
                tag: author,
                host: BASE_URL
            });
        }
    });
    return items;
}

function execute(query, page) {
    query = cleanText(query);
    page = cleanText(page);

    try {
        if (page !== "" && (isApiPath(page) || categoryPath(page, "1") !== "")) {
            let pageUrl = isApiPath(page) ? page : categoryPath(page, page);
            let result = readJson(pageUrl);
            if (result.error) return Response.error(result.error);
            return Response.success(apiItems(result.data), nextPath(result.data));
        }

        if (isApiPath(query)) {
            let result = readJson(query);
            if (result.error) return Response.error(result.error);
            return Response.success(apiItems(result.data), nextPath(result.data));
        }

        let categoryUrl = categoryPath(query, page || "1");
        if (categoryUrl !== "") {
            let result = readJson(categoryUrl);
            if (result.error) return Response.error(result.error);
            return Response.success(apiItems(result.data), nextPath(result.data));
        }

        if (query === "") {
            let result = readJson(latestPath(page || "1", "30"));
            if (result.error) return Response.error(result.error);
            return Response.success(apiItems(result.data), nextPath(result.data));
        }

        let search = searchDocument(query, BASE_URL, siteLanguage());
        if (search.error) return Response.error(search.error);
        let items = htmlSearchItems(search.doc);

        // The simplified mirror sometimes serves the home page for its search route.
        if (items.length === 0 && /(?:^|\/\/)cn\.ttkan\.co/i.test(BASE_URL)) {
            let fallback = searchDocument(query, "https://www.ttkan.co", "tw");
            if (!fallback.error) items = htmlSearchItems(fallback.doc);
        }

        return Response.success(items, "");
    } catch (error) {
        return Response.error("Search failed: " + error.message);
    }
}
