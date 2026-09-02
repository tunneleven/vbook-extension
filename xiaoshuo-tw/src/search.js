load('config.js');
load('gbk.js');

function execute(query, page) {
    query = String(query || "");
    page = String(page || "1");

    let url;
    if (/^(?:https?:\/\/|\/)/i.test(query)) {
        url = listingUrl(query, page);
    } else {
        url = BASE_URL + "/modules/article/search.php?searchkey=" + gbkEncode(query) + "&page=" + page;
    }

    let response = fetch(url);
    if (!response.ok) return Response.error("HTTP " + response.status);
    let doc = response.html("gbk");
    let items = [];
    let searchItems = doc.select(".mySearch .search-list > li.search-item");

    if (!searchItems.isEmpty()) {
        searchItems.forEach(function (el) {
            let cover = "";
            let link = "";
            let coverLinks = el.select("a.search-cover-wrap");
            if (!coverLinks.isEmpty()) link = coverLinks.first().attr("href");
            let images = el.select("a.search-cover-wrap img");
            if (!images.isEmpty()) cover = images.first().attr("src");

            let name = "";
            let names = el.select("a.b");
            if (!names.isEmpty()) name = names.first().text();
            if (name === "" && !coverLinks.isEmpty()) name = coverLinks.first().attr("title");

            let latest = "";
            let status = "";
            let infoItems = el.select(".search-info > li");
            infoItems.forEach(function (info) {
                let text = info.text().replace(/^\s+|\s+$/g, "");
                if (/^最新[：:]/.test(text)) latest = text.replace(/^最新[：:]\s*/, "");
                if (/^状态[：:]/.test(text)) status = text.replace(/^状态[：:]\s*/, "");
            });

            if (name !== "" && link !== "") {
                items.push({
                    name: name,
                    cover: absoluteUrl(cover),
                    link: absoluteUrl(link),
                    description: latest,
                    tag: status
                });
            }
        });
    } else {
        let rows = doc.select(".body-content table.table tr");
        rows.forEach(function (row) {
            let cells = row.select("td");
            if (cells.isEmpty()) return;

            let nameIndex = -1;
            let name = "";
            let link = "";
            for (let i = 0; i < cells.size() && i < 3; i++) {
                let links = cells.get(i).select("a");
                for (let j = 0; j < links.size(); j++) {
                    let href = links.get(j).attr("href");
                    if (/(?:^|\/)\d+\/?$/.test(href)) {
                        nameIndex = i;
                        name = links.get(j).text();
                        link = href;
                        break;
                    }
                }
                if (nameIndex !== -1) break;
            }
            if (nameIndex === -1 || name === "" || link === "") return;

            let latest = "";
            for (let i = nameIndex + 1; i < cells.size(); i++) {
                let links = cells.get(i).select("a");
                for (let j = 0; j < links.size(); j++) {
                    if (/\/\d+\/\d+\.html(?:\?.*)?$/i.test(links.get(j).attr("href"))) {
                        latest = links.get(j).text();
                        break;
                    }
                }
                if (latest !== "") break;
            }
            if (latest === "" && nameIndex + 1 < cells.size()) latest = cells.get(nameIndex + 1).text();

            let status = "";
            for (let i = 0; i < cells.size(); i++) {
                let text = cells.get(i).text().replace(/^\s+|\s+$/g, "");
                if (/(連載|已完結|已完成|完結)/.test(text)) status = text;
            }
            if (status === "" && nameIndex > 0) status = cells.get(0).text();

            items.push({
                name: name,
                link: absoluteUrl(link),
                description: latest.replace(/^\s+|\s+$/g, ""),
                tag: status.replace(/^\s+|\s+$/g, "")
            });
        });
    }

    let currentPage = parseInt(page, 10);
    if (isNaN(currentPage) || currentPage < 1) currentPage = 1;
    let hasNext = !doc.select("#pagelink a.next").isEmpty();
    return Response.success(items, hasNext ? String(currentPage + 1) : "");
}
