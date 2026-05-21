const url = "https://www.onestockhome.com/osh-online/assets/desktop-CPlSeE5p.js";
const res = await fetch(url, { headers: { "user-agent": "Mozilla/5.0" } });
const js = await res.text();
console.log(JSON.stringify({ status: res.status, length: js.length }, null, 2));

const needles = ["construction_calculator", "paint_calculator", "brick_calculator", "ready_mix_concrete", "metal_sheet_calculator"];
for (const n of needles) {
  console.log(n, js.includes(n));
}

const showContext = (n) => {
  const idx = js.indexOf(n);
  if (idx === -1) return;
  const start = Math.max(0, idx - 250);
  const end = Math.min(js.length, idx + 250);
  console.log("CTX", n, js.slice(start, end));
};
showContext("construction_calculator");

const jsFileRe = /[A-Za-z0-9/_-]+\.js/g;
const candidates = new Set(js.match(jsFileRe) || []);
console.log("jsFileCandidates", candidates.size);
console.log([...candidates].slice(0, 50));
