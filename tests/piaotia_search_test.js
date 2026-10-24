const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const extension = path.resolve(__dirname, "../piaotia-com");
const calls = [];
const context = {
    DOMAIN: undefined,
    fetch: (url, options) => {
        calls.push({ url, options });
        return {
            ok: true,
            html: () => ({
                select: (selector) => selector === "body"
                    ? { isEmpty: () => true }
                    : { forEach: () => {} },
            }),
        };
    },
    Response: {
        success: (data, next) => ({ code: 0, data, next }),
        error: (message) => ({ code: 1, message }),
    },
};
context.load = (file) => {
    const source = fs.readFileSync(path.join(extension, "src", file), "utf8");
    vm.runInContext(source, context, { filename: file });
};
vm.createContext(context);
vm.runInContext(
    fs.readFileSync(path.join(extension, "src/search.js"), "utf8"),
    context,
    { filename: "piaotia-com/src/search.js" },
);

const result = context.execute("阵问长生", "1");
assert.equal(result.code, 0);
assert.equal(calls.length, 1);
assert.equal(calls[0].url, "https://www.piaotia.com/modules/article/search.php");
assert.equal(calls[0].options.method, "POST");
assert.equal(
    calls[0].options.body,
    "searchtype=articlename&searchkey=%D5%F3%CE%CA%B3%A4%C9%FA",
);
console.log("Piaotia GBK search regression test passed");
