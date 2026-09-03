load('config.js');

function execute(url) {
    try {
        url = normalizeUrl(url);
        let bookId = bookIdFromUrl(url);
        if (bookId === "") return Response.error("Book id not found");

        let result = readJson(chaptersPath(bookId));
        if (result.error) return Response.error(result.error);
        if (!result.data || !result.data.items) return Response.error("Chapter list not found");

        let chapters = [];
        for (let i = 0; i < result.data.items.length; i++) {
            let item = result.data.items[i] || {};
            let chapterId = String(item.chapter_id || "");
            let name = cleanText(item.chapter_name || "");
            if (chapterId === "" || name === "") continue;
            chapters.push({
                name: name,
                url: chapterUrl(bookId, chapterId),
                description: "",
                lock: false,
                pay: false
            });
        }

        if (chapters.length === 0) return Response.error("Chapter list is empty");
        return Response.success(chapters);
    } catch (error) {
        return Response.error("TOC failed: " + error.message);
    }
}
