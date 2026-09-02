function execute() {
    let names = ["玄幻魔法", "武侠修真", "都市言情", "历史军事", "侦探推理", "网游竞技", "科幻小说", "恐怖灵异", "同人漫画"];
    let genres = [];
    for (let i = 0; i < names.length; i++) {
        genres.push({
            title: names[i],
            input: "/booksort" + (i + 1) + "/0/{page}.html",
            script: "search.js"
        });
    }
    return Response.success(genres);
}
