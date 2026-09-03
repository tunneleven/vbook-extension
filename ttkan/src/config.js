let BASE_URL = "https://cn.ttkan.co";
try {
    if (DOMAIN) BASE_URL = String(DOMAIN).replace(/\/+$/, "");
} catch (error) {
}

function siteLanguage() {
    return /(?:^|\/\/)(?:www|tw)\.ttkan\.co/i.test(BASE_URL) ? "tw" : "cn";
}

function normalizeUrl(url) {
    let value = String(url || "");
    if (value === "") return BASE_URL;
    if (/^\/\//.test(value)) value = "https:" + value;
    if (/^https?:\/\//i.test(value)) {
        return value.replace(/^https?:\/\/[^/]+/i, BASE_URL);
    }
    if (value.indexOf("/") === 0) return BASE_URL + value;
    return BASE_URL + "/" + value;
}

function siteUrl(value) {
    return normalizeUrl(value);
}

function assetUrl(value) {
    let url = String(value || "");
    if (url === "") return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/\//.test(url)) return "https:" + url;
    if (url.indexOf("/") === 0) return BASE_URL + url;
    return BASE_URL + "/" + url;
}

function coverUrl(value) {
    let url = String(value || "");
    if (url === "") return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (/^\/\//.test(url)) return "https:" + url;
    url = url.replace(/^\/+/, "");
    if (url.indexOf("cover/") === 0) url = url.substring(6);
    return "https://static.ttkan.co/cover/" + url;
}

function firstText(doc, selector) {
    let elements = doc.select(selector);
    return elements.isEmpty() ? "" : String(elements.first().text() || "");
}

function firstAttr(doc, selector, attribute) {
    let elements = doc.select(selector);
    return elements.isEmpty() ? "" : String(elements.first().attr(attribute) || "");
}

function cleanText(value) {
    return String(value || "").replace(/^\s+|\s+$/g, "");
}

function withoutPrefix(value, prefix) {
    return cleanText(value).replace(new RegExp("^" + prefix + "\\s*[：:]\\s*", "i"), "");
}

function decodeValue(value) {
    try {
        return decodeURIComponent(String(value || ""));
    } catch (error) {
        return String(value || "");
    }
}

function bookIdFromUrl(url) {
    let value = String(url || "");
    let match = value.match(/\/novel\/chapters\/([^/?#]+)/i);
    if (match) return decodeValue(match[1]);

    match = value.match(/[?&]novel_id=([^&#]+)/i);
    if (match) return decodeValue(match[1]);

    match = value.match(/\/novel\/pagea\/(.+?)_(\d+)(?:\.html)?(?:[?#]|$)/i);
    if (match) return decodeValue(match[1]);

    return /^[A-Za-z0-9_-]+$/.test(value) ? value : "";
}

function bookUrl(bookId) {
    return BASE_URL + "/novel/chapters/" + String(bookId || "");
}

function chapterUrl(bookId, chapterId) {
    return BASE_URL + "/novel/pagea/" + String(bookId || "") + "_" + String(chapterId || "") + ".html";
}

function latestPath(page, limit) {
    return "/api/nq/amp_last_serial_novel_updates?page=" + String(page || "1")
        + "&limit=" + String(limit || "30") + "&language=" + siteLanguage();
}

function novelListPath(type, filter, page, limit) {
    return "/api/nq/amp_novel_list?type=" + encodeURIComponent(String(type || ""))
        + "&filter=" + encodeURIComponent(String(filter || "*"))
        + "&page=" + String(page || "1")
        + "&limit=" + String(limit || "18")
        + "&language=" + siteLanguage();
}

function chaptersPath(bookId) {
    return "/api/nq/amp_novel_chapters?language=" + siteLanguage()
        + "&novel_id=" + encodeURIComponent(String(bookId || ""));
}

function isApiPath(value) {
    return /\/api\/nq\//i.test(String(value || ""));
}

function categoryPath(input, page) {
    let value = String(input || "");
    let match = value.match(/\/novel\/class\/([^/?#]+)/i);
    if (!match) return "";

    let slug = decodeValue(match[1]);
    let filter = "*";
    let filterMatch = slug.match(/_(abcd|efgh|ijkl|mnop|qrst|uvw|xyz)$/i);
    if (filterMatch) {
        filter = filterMatch[1];
        slug = slug.substring(0, slug.length - filterMatch[0].length);
    }

    let number = parseInt(String(page || "1"), 10);
    if (isNaN(number) || number < 1) number = 1;
    return novelListPath(slug, filter, number, 18);
}

function isRankPath(value) {
    return /\/novel\/rank(?:\/[^/?#]+)?\/?(?:[?#].*)?$/i.test(String(value || ""));
}

function isCompletedRankPath(value) {
    return /[?&]completed=1(?:[&#]|$)/i.test(String(value || ""));
}

function isCompletedStatus(value) {
    return /(?:已完成|已完本|已完结|已完結|完结|完結)/i.test(String(value || ""));
}

function rankItems(doc, completedOnly) {
    // TTKan exposes one rank page; completed results are a status-filtered view of it.
    let items = [];
    let cards = doc.select(".rank_list > div");
    for (let i = 0; i + 1 < cards.size(); i += 2) {
        let coverBlock = cards.get(i);
        let infoBlock = cards.get(i + 1);
        let name = firstText(infoBlock, "h2");
        let link = firstAttr(infoBlock, "h2 a", "href");
        if (link === "") link = firstAttr(coverBlock, "a", "href");
        let cover = firstAttr(coverBlock, "amp-img", "src");
        let author = "";
        let category = "";
        let status = "";

        infoBlock.select("ul > li").forEach(function (item) {
            let text = cleanText(item.text());
            if (/^作者\s*[：:]/i.test(text)) author = withoutPrefix(text, "作者");
            if (/^(?:类别|類別)\s*[：:]/i.test(text)) category = withoutPrefix(text, "(?:类别|類別)");
            if (/^(?:状态|狀態)\s*[：:]/i.test(text)) status = withoutPrefix(text, "(?:状态|狀態)");
        });

        if (completedOnly && !isCompletedStatus(status)) continue;

        if (name !== "" && link !== "") {
            let description = author;
            if (category !== "") description = description === "" ? category : description + "\n" + category;
            items.push({
                name: name,
                cover: assetUrl(cover),
                link: siteUrl(link),
                description: description,
                tag: status,
                host: BASE_URL
            });
        }
    }
    return items;
}

function readJson(value) {
    let response = fetch(siteUrl(value));
    if (!response.ok) return { error: "HTTP " + response.status };
    try {
        return { data: response.json() };
    } catch (error) {
        return { error: "Invalid JSON" };
    }
}

function apiItems(payload) {
    let items = [];
    if (!payload || !payload.items) return items;

    for (let i = 0; i < payload.items.length; i++) {
        let item = payload.items[i] || {};
        let id = String(item.novel_id || item.id || "");
        let name = String(item.name || item.novel_name || "");
        if (id === "" || name === "") continue;

        let description = String(item.description || "");
        let chapter = String(item.chapter_name || "");
        let updateTime = String(item.view_update_time || "");
        if (chapter !== "") description = description === "" ? chapter : description + "\n" + chapter;
        if (updateTime !== "") description = description === "" ? updateTime : description + "\n" + updateTime;

        let cover = item.topic_img ? coverUrl(item.topic_img) : coverUrl(id + ".jpg");
        items.push({
            name: name,
            cover: cover,
            link: bookUrl(id),
            description: description,
            tag: String(item.author || item.view_type || ""),
            host: BASE_URL
        });
    }
    return items;
}

function nextPath(payload) {
    return payload && payload.next ? String(payload.next) : "";
}

function apiListItems(value) {
    let result = readJson(value);
    return result.error ? [] : apiItems(result.data);
}
