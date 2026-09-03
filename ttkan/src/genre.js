load('config.js');

function execute() {
    let categories = [
        ["玄幻", "xuanhuan"],
        ["都市", "dushi"],
        ["仙侠", "xianxia"],
        ["古代言情", "gudaiyanqing"],
        ["穿越重生", "chuanyuechongsheng"],
        ["游戏", "youxi"],
        ["科幻", "kehuan"],
        ["悬疑", "xuanyi"],
        ["灵异", "lingyi"],
        ["历史", "lishi"],
        ["青春", "qingchun"],
        ["军事", "junshi"],
        ["竞技", "jingji"],
        ["言情", "yanqing"],
        ["其他", "qita"]
    ];
    let result = [];
    for (let i = 0; i < categories.length; i++) {
        result.push({
            title: categories[i][0],
            input: novelListPath(categories[i][1], "*", "1", "18"),
            script: "search.js"
        });
    }
    return Response.success(result);
}
