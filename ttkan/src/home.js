load('config.js');

function execute() {
    return Response.success([
        {
            title: "最近更新",
            input: latestPath("1", "30"),
            script: "search.js"
        },
        {
            title: "连载作品",
            input: novelListPath("lianzai", "*", "1", "18"),
            script: "search.js"
        },
        {
            title: "随机推荐",
            input: novelListPath("suixuan", "*", "1", "18"),
            script: "search.js"
        },
        {
            title: "玄幻",
            input: novelListPath("xuanhuan", "*", "1", "18"),
            script: "search.js"
        },
        {
            title: "都市",
            input: novelListPath("dushi", "*", "1", "18"),
            script: "search.js"
        }
    ]);
}
