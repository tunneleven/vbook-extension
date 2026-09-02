load('config.js');
function execute() {
    let response = fetch(BASE_URL);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");

    let featured = doc.select("#fengtui").map(function (el) {
        let links = el.select("#fengtuiword a[title]");
        let images = el.select("#fengtuipic img");
        return {
            name: links.isEmpty() ? "" : links.first().text(),
            cover: images.isEmpty() ? "" : absoluteUrl(BASE_URL + "/", images.first().attr("src")),
            link: links.isEmpty() ? "" : absoluteUrl(BASE_URL + "/", links.first().attr("href")),
            description: el.select("#fengtuiword").text(),
            tag: "推荐"
        };
    });

    let latest = doc.select("#centers ul.ulmul li.fl.lm").map(function (el) {
        let book = el.select("a.poptext");
        let chapter = el.select("a[href*=\/html\/]");
        return {
            name: book.isEmpty() ? "" : book.first().text(),
            cover: "",
            link: book.isEmpty() ? "" : absoluteUrl(BASE_URL + "/", book.first().attr("href")),
            description: chapter.isEmpty() ? "" : chapter.last().text(),
            tag: "最新更新"
        };
    });

    return Response.success([
        {
            id: "featured",
            title: "新书推荐",
            subtitle: "",
            type: "horizontal_list",
            items: featured
        },
        {
            id: "latest",
            title: "最近更新",
            subtitle: "",
            type: "list",
            items: latest,
            more: { type: "list", name: "全部小说", script: "search.js", input: "/booksort/0/{page}.html", data: "" }
        }
    ]);
}
