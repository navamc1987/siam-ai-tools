const folderId = process.argv[2];
if (!folderId) {
  console.error("Usage: node scripts/test_drive_parse.mjs <folderId>");
  process.exit(1);
}

const res = await fetch(`https://drive.google.com/drive/folders/${folderId}?hl=en`, {
  headers: { "user-agent": "Mozilla/5.0" },
});
const html = await res.text();
const m = html.match(/window\['_DRIVE_ivd'\]\s*=\s*'([\s\S]*?)';/);
console.log("status", res.status, "has ivd", Boolean(m));
if (!m) process.exit(0);

let s = m[1]
  .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)));

s = s.replace(/\\(?![\\/"bfnrtu])/g, "");

const parsed = JSON.parse(s);

const out = new Map();
const walk = (node) => {
  if (Array.isArray(node)) {
    const id = typeof node[0] === "string" ? node[0] : null;
    const name = typeof node[2] === "string" ? node[2] : null;
    const mime = typeof node[3] === "string" ? node[3] : null;
    if (id && mime && mime !== "application/vnd.google-apps.folder") {
      out.set(id, { id, name, mime });
    }
    for (const x of node) walk(x);
    return;
  }
  if (node && typeof node === "object") {
    for (const v of Object.values(node)) walk(v);
  }
};

walk(parsed);
const files = [...out.values()];
console.log("files", files.length);
console.log("sample", files.slice(0, 10));

