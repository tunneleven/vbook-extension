let BASE_URL = "https://www.xiaoshuo.com.tw";
try {
    if (DOMAIN) {
        BASE_URL = String(DOMAIN).replace(/\/+$/, "");
    }
} catch (error) {
}

function normalizeUrl(url) {
    url = String(url || "");
    return url.replace(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/i, BASE_URL);
}

function absoluteUrl(value) {
    value = String(value || "");
    if (value === "") return "";
    if (/^https?:\/\//i.test(value)) return normalizeUrl(value);
    if (/^\/\//.test(value)) return normalizeUrl("https:" + value);
    if (value.indexOf("/") === 0) return BASE_URL + value;
    return BASE_URL + "/" + value;
}

function firstText(doc, selector) {
    let elements = doc.select(selector);
    return elements.isEmpty() ? "" : elements.first().text();
}

function firstAttr(doc, selector, attribute) {
    let elements = doc.select(selector);
    return elements.isEmpty() ? "" : elements.first().attr(attribute);
}

function bookCoverUrl(url) {
    let normalized = normalizeUrl(url);
    let match = normalized.match(/\/(\d+)\/?(?:[?#].*)?$/);
    if (!match) return "";
    let id = parseInt(match[1], 10);
    if (isNaN(id)) return "";
    return BASE_URL + "/files/article/image/" + Math.floor(id / 1000) + "/" + id + "/" + id + "s.jpg";
}

function ensureBookUrl(url) {
    return /\/\d+$/.test(url) ? url + "/" : url;
}

function isTopCompletedPath(value) {
    return /[?&]vbook=top(?:[&#]|$)/i.test(String(value || ""));
}

function listingUrl(input, page) {
    let base = /^https?:\/\//i.test(input) ? normalizeUrl(input) : absoluteUrl(input);
    let number = parseInt(String(page || "1"), 10);
    if (isNaN(number) || number < 1) number = 1;
    if (number === 1) return base;

    if (/\/list\/\d+\/\d+\.html\/?$/i.test(base)) {
        return base.replace(/\/\d+\.html\/?$/i, "/" + number + ".html");
    }
    if (/\/list\/\d+\.html\/?$/i.test(base)) {
        return base.replace(/\.html\/?$/i, "/" + number + ".html");
    }
    if (/\/wanben\/\d+\/?$/i.test(base)) {
        return base.replace(/\/\d+\/?$/i, "/" + number);
    }
    if (/\/wanben\/?$/i.test(base)) {
        return base.replace(/\/?$/i, "/" + number);
    }
    if (/\/top\/[^/]+\/\d+\.html\/?$/i.test(base)) {
        return base.replace(/\/\d+\.html\/?$/i, "/" + number + ".html");
    }
    if (/\/top\/[^/]+\/?$/i.test(base)) {
        return base.replace(/\/?$/i, "/" + number + ".html");
    }
    return base + (base.indexOf("?") === -1 ? "?" : "&") + "page=" + number;
}
