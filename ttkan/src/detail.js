load('config.js');

function execute(url) {
    try {
        url = normalizeUrl(url);
        let response = fetch(url);
        if (!response.ok) return Response.error("HTTP " + response.status);
        let doc = response.html();
        let title = firstText(doc, "div.novel_info h1");
        if (title === "") title = firstText(doc, "h1");
        if (title === "") return Response.error("Book title not found");

        let author = "";
        let category = "";
        let status = "";
        let metadata = doc.select("div.novel_info > div:nth-child(2) > ul > li");
        metadata.forEach(function (item) {
            let text = cleanText(item.text());
            if (/^作者\s*[：:]/i.test(text)) author = withoutPrefix(text, "作者");
            if (/^(?:类别|類別)\s*[：:]/i.test(text)) category = withoutPrefix(text, "(?:类别|類別)");
            if (/^(?:状态|狀態)\s*[：:]/i.test(text)) status = withoutPrefix(text, "(?:状态|狀態)");
        });

        let cover = firstAttr(doc, "div.novel_info amp-img", "src");
        cover = assetUrl(cover);
        let description = "";
        let descriptionElements = doc.select(".description");
        if (!descriptionElements.isEmpty()) description = descriptionElements.first().html();

        let categoryInput = "";
        let breadcrumbLinks = doc.select(".bread_crumbs a");
        breadcrumbLinks.forEach(function (link) {
            if (categoryInput !== "") return;
            let href = String(link.attr("href") || "");
            if (/\/novel\/class\//i.test(href)) categoryInput = href;
        });

        let tags = [];
        let genres = [];
        if (category !== "" && categoryInput !== "") {
            tags.push({ title: category, input: categoryInput, script: "search.js" });
            genres.push({ title: "同类作品", input: categoryInput, script: "search.js" });
        }

        let bookId = bookIdFromUrl(url);
        let canonical = bookId === "" ? url : bookUrl(bookId);
        let completed = /(?:完结|完結|已完成|已完本)/i.test(status);
        return Response.success({
            name: title,
            author: author,
            cover: cover,
            description: description,
            detail: "类型：" + category + "<br>状态：" + status,
            url: canonical,
            type: "novel",
            format: "novel",
            ongoing: !completed,
            nsfw: false,
            locale: siteLanguage() === "cn" ? "zh-CN" : "zh-TW",
            tags: tags,
            genres: genres,
            suggests: [],
            reviews: [],
            comments: []
        });
    } catch (error) {
        return Response.error("Detail failed: " + error.message);
    }
}
