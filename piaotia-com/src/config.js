let BASE_URL = "https://www.piaotia.com";
try {
    if (DOMAIN) {
        BASE_URL = String(DOMAIN).replace(/\/$/, "");
    }
} catch (error) {
}

function normalizeUrl(url) {
    url = String(url || "");
    if (url.indexOf("/") === 0) return BASE_URL + url;
    return url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/img, BASE_URL);
}

function absoluteUrl(base, href) {
    href = String(href || "");
    if (href.indexOf("http://") === 0 || href.indexOf("https://") === 0) {
        return normalizeUrl(href);
    }
    if (href.indexOf("//") === 0) return "https:" + href;
    if (href.indexOf("/") === 0) return BASE_URL + href;
    return String(base).replace(/[^\/]*$/, "") + href;
}

function tocUrl(url) {
    let normalized = normalizeUrl(url);
    let match = normalized.match(/\/bookinfo\/(\d+)\/(\d+)\.html/i);
    if (match) return BASE_URL + "/html/" + match[1] + "/" + match[2] + "/index.html";
    if (/\/html\/\d+\/\d+\/?$/i.test(normalized)) return normalized.replace(/\/?$/, "/index.html");
    return normalized;
}

function categoryPath(name) {
    let names = ["玄幻魔法", "武侠修真", "都市言情", "历史军事", "侦探推理", "网游竞技", "科幻小说", "恐怖灵异", "同人漫画"];
    for (let i = 0; i < names.length; i++) {
        if (String(name).indexOf(names[i]) !== -1) return "/booksort" + (i + 1) + "/0/{page}.html";
    }
    return "";
}
