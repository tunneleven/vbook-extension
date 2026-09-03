load('config.js');

function execute() {
    try {
        let latestPathValue = latestPath("1", "18");
        let randomPathValue = novelListPath("suixuan", "*", "1", "18");
        let fantasyPathValue = novelListPath("xuanhuan", "*", "1", "18");
        let latest = apiListItems(latestPathValue);
        let random = apiListItems(randomPathValue);
        let fantasy = apiListItems(fantasyPathValue);

        if (latest.length === 0 && random.length === 0 && fantasy.length === 0) {
            return Response.error("No books found");
        }

        return Response.success([
            {
                id: "latest",
                title: "最近更新",
                subtitle: "刚刚更新的作品",
                type: "horizontal_list",
                shape: "book",
                items: latest,
                more: {
                    type: "list",
                    name: "最近更新",
                    script: "search.js",
                    input: latestPathValue
                }
            },
            {
                id: "random",
                title: "随机推荐",
                subtitle: "从站内书库挑选作品",
                type: "grid",
                shape: "book",
                items: random,
                more: {
                    type: "list",
                    name: "随机推荐",
                    script: "search.js",
                    input: randomPathValue
                }
            },
            {
                id: "fantasy",
                title: "玄幻",
                subtitle: "玄幻分类热门作品",
                type: "grid",
                shape: "book",
                items: fantasy,
                more: {
                    type: "list",
                    name: "玄幻",
                    script: "search.js",
                    input: fantasyPathValue
                }
            }
        ]);
    } catch (error) {
        return Response.error("Explore failed: " + error.message);
    }
}
