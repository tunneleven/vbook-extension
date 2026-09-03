function execute() {
    return Response.success([
        { title: "最近更新", input: "/top/lastupdate/", script: "search.js" },
        { title: "最新入庫", input: "/top/postdate/", script: "search.js" },
        { title: "Top tháng", input: "/top/monthvisit/", script: "search.js" },
        { title: "Đang lên", input: "/top/weekvisit/", script: "search.js" },
        { title: "Top toàn bộ", input: "/top/allvisit/", script: "search.js" },
        { title: "Top đã hoàn thành", input: "/wanben/?vbook=top", script: "search.js" },
        { title: "Đề xuất tháng", input: "/top/monthvote/", script: "search.js" },
        { title: "Đề xuất tuần", input: "/top/weekvote/", script: "search.js" },
        { title: "Đề xuất toàn bộ", input: "/top/allvote/", script: "search.js" }
    ]);
}
