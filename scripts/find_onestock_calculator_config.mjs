const pageUrl = process.argv[2] || "https://www.onestockhome.com/th/construction_calculator";
const needle = process.argv[3] || "A30200129";

const res = await fetch(pageUrl, {
  headers: {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  },
});
const html = await res.text();

const srcRe = /<script[^>]+src="([^"]+)"[^>]*><\/script>/g;
const scripts = [];
for (const m of html.matchAll(srcRe)) {
  const src = m[1];
  const abs = src.startsWith("http") ? src : `https://www.onestockhome.com${src}`;
  scripts.push(abs);
}

console.log(JSON.stringify({ pageUrl, status: res.status, scriptCount: scripts.length }, null, 2));
console.log(JSON.stringify({ scripts }, null, 2));
if (scripts.length === 0) process.exit(0);

const hits = [];
for (const url of scripts) {
  try {
    const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
    const text = await r.text();
    if (text.includes(needle)) hits.push({ url, status: r.status, length: text.length });
  } catch (e) {}
}

console.log(JSON.stringify({ needle, hits }, null, 2));
