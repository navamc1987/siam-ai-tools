const url = process.argv[2];
if (!url) {
  console.error("Usage: node scripts/onestockhome_inspect_nextdata.mjs <url>");
  process.exit(1);
}

const res = await fetch(url, {
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "th-TH,th;q=0.9,en;q=0.8",
  },
});

const html = await res.text();
console.log(JSON.stringify({ status: res.status, length: html.length }));

const marker = '<script id="__NEXT_DATA__" type="application/json">';
const start = html.indexOf(marker);
if (start === -1) {
  console.log("NO_NEXT_DATA");
  process.exit(0);
}
const end = html.indexOf("</script>", start);
const jsonStr = html.slice(start + marker.length, end);

let nextData;
try {
  nextData = JSON.parse(jsonStr);
} catch (e) {
  console.log("NEXT_DATA_PARSE_ERROR");
  process.exit(0);
}

const keys = Object.keys(nextData || {});
console.log("NEXT_DATA_KEYS", keys);

const pageProps = nextData?.props?.pageProps;
console.log("PAGE_PROPS_KEYS", pageProps ? Object.keys(pageProps) : null);

const preview = JSON.stringify(pageProps, null, 2);
console.log("PAGE_PROPS_PREVIEW", preview.slice(0, 2000));

