load('config.js');

function execute() {
    let response = fetch(BASE_URL);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");

    let recommended = [];
    doc.select(".body-content a.thumbnail").forEach(function (el) {
        let name = firstText(el, "strong");
        let link = el.attr("href");
        let cover = firstAttr(el, "img", "src");
        let caption = el.select(".caption");
        let description = caption.isEmpty() ? "" : caption.first().text();
        if (name !== "" && link !== "") {
            recommended.push({
                name: name,
                cover: absoluteUrl(cover),
                link: absoluteUrl(link),
                description: description
            });
        }
    });

    let panels = doc.select(".body-content .panel-success");
    let latest = [];
    if (panels.size() > 0) {
        let rows = panels.get(0).select("table tr");
        rows.forEach(function (row) {
            let cells = row.select("td");
            if (cells.size() < 3) return;
            let bookLinks = cells.get(1).select("a");
            if (bookLinks.isEmpty()) return;
            let chapterLinks = cells.get(2).select("a");
            let chapter = chapterLinks.isEmpty() ? "" : chapterLinks.first().text();
            latest.push({
                name: bookLinks.first().text(),
                link: absoluteUrl(bookLinks.first().attr("href")),
                description: chapter,
                tag: cells.get(0).text()
            });
        });
    }

    let newItems = [];
    if (panels.size() > 1) {
        let rows = panels.get(1).select("table tr");
        rows.forEach(function (row) {
            let cells = row.select("td");
            if (cells.size() < 2) return;
            let bookLinks = cells.get(1).select("a");
            if (bookLinks.isEmpty()) return;
            let author = cells.size() > 2 ? cells.get(2).text() : "";
            newItems.push({
                name: bookLinks.first().text(),
                link: absoluteUrl(bookLinks.first().attr("href")),
                description: author,
                tag: cells.get(0).text()
            });
        });
    }

    return Response.success([
        {
            id: "recommended",
            title: "本站推薦",
            subtitle: "熱門小說",
            type: "horizontal_list",
            items: recommended
        },
        {
            id: "latest",
            title: "最近更新",
            subtitle: "最近更新的小說",
            type: "list",
            items: latest,
            more: { type: "list", name: "最近更新", script: "search.js", input: "/top/lastupdate/", data: "" }
        },
        {
            id: "new",
            title: "最新入庫",
            subtitle: "新加入的小說",
            type: "list",
            items: newItems,
            more: { type: "list", name: "最新入庫", script: "search.js", input: "/top/postdate/", data: "" }
        }
    ]);
}
