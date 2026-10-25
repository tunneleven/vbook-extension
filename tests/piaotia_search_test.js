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
                select: (selector) => {
                    if (selector === "body") return { isEmpty: () => true };
                    if (selector === "#centerm table.grid tr:has(td a[href*=bookinfo])") {
                        return { forEach: () => {} };
                    }
                    if (selector === "#centerm h1") {
                        return {
                            isEmpty: () => false,
                            first: () => ({ text: () => "这号有毒" }),
                        };
                    }
                    if (selector === "#centerm img[src*=files/article/image]") {
                        return {
                            isEmpty: () => false,
                            first: () => ({ attr: () => "/files/article/image/10/10475/10475s.jpg" }),
                        };
                    }
                    return { isEmpty: () => true, forEach: () => {} };
                },
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

const result = context.execute("这号有毒", "1");
assert.equal(result.data[0].name, "这号有毒");
assert.equal(result.data[0].link, "https://www.piaotia.com/bookinfo/10/10475.html");
assert.equal(result.data[0].cover, "https://www.piaotia.com/files/article/image/10/10475/10475s.jpg");
assert.equal(calls.length, 1);
assert.equal(calls[0].url, "https://www.piaotia.com/modules/article/search.php");
assert.equal(calls[0].options.method, "POST");
assert.equal(
    calls[0].options.body,
    "searchtype=articlename&searchkey=%D5%E2%BA%C5%D3%D0%B6%BE",
);
console.log("Piaotia GBK search regression test passed");
