const url = "https://www.onestockhome.com/osh-online/assets/desktop-CPlSeE5p.js";
const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
const js = await res.text();

const start = js.indexOf("m.f||(m.f=");
if (start === -1) {
  console.error("NO_MARKER");
  process.exit(1);
}
const open = js.indexOf("[", start);
if (open === -1) {
  console.error("NO_OPEN_BRACKET");
  process.exit(1);
}

let i = open;
let depth = 0;
let close = -1;
for (; i < js.length; i++) {
  const ch = js[i];
  if (ch === "[") depth++;
  else if (ch === "]") {
    depth--;
    if (depth === 0) {
      close = i;
      break;
    }
  }
}

if (close === -1) {
  console.error("NO_CLOSE_BRACKET");
  process.exit(1);
}

const arrText = js.slice(open, close + 1);
let deps;
try {
  deps = JSON.parse(arrText);
} catch (e) {
  console.error("JSON_PARSE_FAIL");
  process.exit(1);
}

console.log(JSON.stringify({ depsLen: deps.length, first: deps[0], last: deps[deps.length - 1] }, null, 2));

const idxs = [131, 2, 86, 5, 92, 16, 4, 1, 6, 7, 8, 9, 10, 12, 13, 14, 15, 17, 18, 132, 133, 30, 102, 33, 34, 103, 40, 134, 135, 55];
const mapped = idxs.map((idx) => ({ idx, dep: deps[idx] }));
console.log(JSON.stringify(mapped, null, 2));

