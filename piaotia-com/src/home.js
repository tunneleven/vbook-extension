function execute() {
    return Response.success([
        { title: "Top tháng", input: "/booktopmonthvisit/0/{page}.html", script: "search.js" },
        { title: "Đang lên", input: "/booktopweekvisit/0/{page}.html", script: "search.js" },
        { title: "Top toàn bộ", input: "/booktopallvisit/0/{page}.html", script: "search.js" },
        { title: "Top đã hoàn thành", input: "/booktopallvisit/0/{page}.html?completed=1", script: "search.js" },
        { title: "Đề xuất tháng", input: "/booktopmonthvote/0/{page}.html", script: "search.js" },
        { title: "Đề xuất tuần", input: "/booktopweekvote/0/{page}.html", script: "search.js" },
        { title: "Đề xuất toàn bộ", input: "/booktopallvote/0/{page}.html", script: "search.js" },
        { title: "Tất cả tiểu thuyết", input: "/booksort/0/{page}.html", script: "search.js" }
    ]);
}
