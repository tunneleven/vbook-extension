function execute() {
    return Response.success([
        { title: "最近更新", input: "/top/lastupdate/", script: "search.js" },
        { title: "最新入庫", input: "/top/postdate/", script: "search.js" },
        { title: "熱門排行", input: "/top/allvisit/", script: "search.js" },
        { title: "完本小說", input: "/wanben/", script: "search.js" }
    ]);
}
