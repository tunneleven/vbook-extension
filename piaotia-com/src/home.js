function execute() {
    return Response.success([
        { title: "玄幻魔法", input: "/booksort1/0/{page}.html", script: "search.js" },
        { title: "武侠修真", input: "/booksort2/0/{page}.html", script: "search.js" },
        { title: "都市言情", input: "/booksort3/0/{page}.html", script: "search.js" },
        { title: "历史军事", input: "/booksort4/0/{page}.html", script: "search.js" },
        { title: "全部小说", input: "/booksort/0/{page}.html", script: "search.js" },
        { title: "Top tháng", input: "/booktopmonthvisit/0/{page}.html", script: "search.js" },
        { title: "Top toàn bộ", input: "/booktopallvisit/0/{page}.html", script: "search.js" },
        { title: "Đề xuất tháng", input: "/booktopmonthvote/0/{page}.html", script: "search.js" },
        { title: "Đề xuất toàn bộ", input: "/booktopallvote/0/{page}.html", script: "search.js" }
    ]);
}
