load('config.js');

function execute(url) {
    try {
        url = normalizeUrl(url);
        let response = fetch(url);
        if (!response.ok) return Response.error("HTTP " + response.status);
        let doc = response.html();
        let contentElements = doc.select(".content");
        if (contentElements.isEmpty()) return Response.error("Chapter content not found");

        let content = contentElements.first();
        content.select(".anchor_bookmark, .mobadsq, .div_feedback, .social_share_frame, center, script, style, noscript, iframe, #div_content_end").forEach(function (element) {
            element.remove();
        });

        let title = firstText(doc, ".title h1");
        if (title === "") title = firstText(doc, ".title");
        let firstParagraph = content.select("p");
        if (title !== "" && !firstParagraph.isEmpty() && cleanText(firstParagraph.first().text()) === cleanText(title)) {
            firstParagraph.first().remove();
        }

        let html = content.html();
        if (cleanText(content.text()) === "") return Response.error("Chapter content is empty");
        return Response.success(html, title);
    } catch (error) {
        return Response.error("Chapter failed: " + error.message);
    }
}
