load('config.js');
function execute(url) {
    let indexUrl = tocUrl(url);
    let response = fetch(indexUrl);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");

    let links = doc.select(".mainbody .centent li a[href]");
    if (links.isEmpty()) return Response.error("Chapter list not found");

    let chapters = links.map(function (el) {
        return {
            name: el.text(),
            url: absoluteUrl(indexUrl, el.attr("href")),
            description: "",
            lock: false,
            pay: false
        };
    });

    return Response.success(chapters);
}
