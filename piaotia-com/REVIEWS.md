# Piaotia reader reviews

Version 9 adds a `Reader reviews` source to the existing vBook detail `reviews`
field. This uses the native review/comment item shape demonstrated by the novel
extension templates in Darkrai9x/vbook-extensions; it does not modify the app or
add a genre chip. Exact screen placement is controlled by the installed app.

## Behavior

- Loads the full opening post of each review thread, with author, avatar and date.
- Preserves line breaks but strips executable HTML, images and links from content.
- Removes duplicate title/author pairs within each source list page.
- Filters obvious advertising and referral posts in both titles and bodies.
  This is heuristic, not comprehensive moderation; posts containing URLs are
  currently excluded, which can also exclude legitimate linked commentary.
- Fetches at most eight threads per call. Continuation tokens use
  `source-page:filtered-offset`; pagination remains available after a filtered-empty
  page. Duplicate posts across different source pages are not globally deduplicated.
- Returns an empty result for books without reviews. The review entry remains
  available; no extra review request is added to normal book-detail loading.
- Surfaces HTTP or missing-content errors instead of silently losing a thread.
- Displays opening reviews only, not their subsequent discussion replies.

## Verification

```sh
node tests/piaotia_detail_test.js
node tests/piaotia_search_test.js
node tests/piaotia_reviews_test.js
PIAOTIA_LIVE=1 node tests/piaotia_reviews_test.js
```

The deterministic fixture tests run without dependencies beyond Node. Optional
live checks use Python with `lxml` and `curl` to parse actual fetched HTML, then
execute the same production JavaScript. This bridge is test-only; the extension
uses vBook's built-in fetch/HTML parser. These are not Android UI tests.

Fixtures capture Fei Tian (book ID 5791) and Forty Millenniums of Cultivation
(book ID 7095), using `reviews.php?aid=<id>&type=all` and opening posts
`reviewshow.php?rid=846985` and `reviewshow.php?rid=374298`. To regenerate from
saved UTF-8 decoded HTML, run `python3 tests/piaotia_review_fixtures.py --source
<directory>` with `reviews-5791.html`, `reviews-7095.html`, `post-5791.html`, and
`post-7095.html` in that directory.
